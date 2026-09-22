package com.ubicollab.permission;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.favorite.FavoriteRepository;
import com.ubicollab.permission.dto.PermissionCreateDto;
import com.ubicollab.permission.dto.PermissionCreateDto.UserDto;
import com.ubicollab.permission.dto.PermissionUpdateDto;
import com.ubicollab.permission.dto.PermissionUpdateDto.PermissionDto;
import com.ubicollab.permission.dto.PermissionResponseDto;
import com.ubicollab.permission.dto.SharedItemResponseDto;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class PermissionService {
	private final DriveItemRepository driveRepository;
	private final PermissionRepository permissionRepository;
	private final UserRepository userRepository;
	private final FavoriteRepository favoriteRepository;
	private final S3Presigner s3Presigner;
	private final String bucket;

	public PermissionService (DriveItemRepository driveRepository,
			PermissionRepository permissionRepository,
			UserRepository userRepository,
			FavoriteRepository favoriteRepository,
			S3Presigner s3Presigner,
			@Value("${AWS_S3_BUCKET}") String bucket) {
		this.driveRepository = driveRepository;
		this.permissionRepository = permissionRepository;
		this.userRepository = userRepository;
		this.favoriteRepository = favoriteRepository;
		this.s3Presigner = s3Presigner;
		this.bucket = bucket;
	}

	// [공유 추가 메뉴] 권한 생성 메서드 (MANAGER 권한 필요)
	@Transactional
	public int createPermission(String username, PermissionCreateDto request) {
		// 현재 로그인 사용자
		User currentUser = getUserOrThrow(username);

		// 공유할 대상(DriveItem)
		DriveItem driveItem = getDriveItemOrThrow(request.driveItemId());

		// 공유할 사용자(userid, permissionType)
		List<UserDto> userList = request.userList();

		// [접근 제어] MANAGER 필요
		if (!isManager(driveItem, currentUser)) {
			throw new PermissionDeniedException("공유할 권한이 없습니다.");
		}

		// 새로운 Permission을 생성한 뒤 저장
		for (UserDto userInfo : userList) {
			User user = getUserByPublicIdOrThrow(userInfo.userId());
			Permission permission = new Permission(user, driveItem,userInfo.type(), LocalDateTime.now());
			permissionRepository.save(permission);
		}
		return userList.size();
	}

	// [권한 관리 메뉴] 권한 변경 메서드 (MANAGER 권한 필요)
	@Transactional
	public int updatePermission(String username, PermissionUpdateDto request) {
		// 현재 로그인 사용자
		User currentUser = getUserOrThrow(username);

		// 현재  DriveItem
		DriveItem current = getDriveItemOrThrow(request.currentItemId());

		// 공유할 사용자(userid, permissionType)
		List<PermissionDto> permissionList = request.permissionList();

		// [접근 제어] MANAGER 필요
		if (!isManager(current, currentUser)) {
			throw new PermissionDeniedException("권한을 변경할 권한이 없습니다.");
		}

		// 기존 Permission을 변경 후 저장
		for (PermissionDto permissionInfo : permissionList) {
			User user = getUserByPublicIdOrThrow(permissionInfo.userId());
			DriveItem driveItem = getDriveItemOrThrow(permissionInfo.driveItemId());

			// [권한 제어] driveItemId는 클라이언트가 보내는 값이라, currentItemId와 다를 수 있음(상위 폴더에서 상속된 권한 수정 등).
			// 그래서 항목마다 실제로 이 driveItem에 대한 MANAGER 권한이 있는지 반드시 재검증해야 함.
			if (!isManager(driveItem, currentUser)) {
				throw new PermissionDeniedException("해당 항목의 권한을 변경할 권한이 없습니다. driveItemId=" + driveItem.getPublicId());
			}

			Permission permission = permissionRepository.findByItemAndUser(driveItem, user).orElseThrow(
					() -> new ResourceNotFoundException("권한 변경할 Permission를 찾을 수 없습니다. : " + permissionInfo.userId() + driveItem.getPublicId()));
			permission.setType(permissionInfo.type());
			permissionRepository.save(permission);
		}

		return permissionList.size();
	}

	// [권한 관리 메뉴] 공유 사용자 목록 조회 메서드 (접근 권한만 있으면 가능)
	public List<PermissionResponseDto> getSharedUsers(String username, UUID publicId) {
		List<PermissionResponseDto> result = new ArrayList<>(); // 결과
		Set<Long> userIds = new HashSet<>(); // 공유된 사용자 리스트 (ID만, 중복 검사)

		// 현재 로그인 유저
		User currentUser = getUserOrThrow(username);

		// 공유할 대상(DriveItem)
		DriveItem driveItem = getDriveItemOrThrow(publicId);

		// [접근 제어] Viewer이상의  권한 하나 필요
		if (!hasAccess(driveItem, currentUser)) {
			throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		// result에 권한 소유자 추가 (부모로 거슬러 올라가면서 가장 가까운 권한 리스트 반환)
		while (driveItem != null) {
			// 해당 DriveItem의 권한들 추출
			List<Permission> permissionList = permissionRepository.findByItem(driveItem);

			for(Permission permission : permissionList) {
				Long userId = permission.getUser().getId();

				// 이미 더 가까운 depth에서 권한이 등록된 사용자는 스킵
				if (userIds.contains(userId))
					continue;

				result.add(new PermissionResponseDto(permission.getUser(),
						getProfileUri(permission.getUser().getProfileImageKey()),
						permission.getItem(),permission.getType()));
				userIds.add(userId);
			}

			// 부모로 이동
			driveItem = driveItem.getParent();
		}
		return result;
	}

	// [공유 문서] 공유 문서 디렉토리를 조회하는 메서드 (특정 상황에서 접근 권한 필요)
	public List<SharedItemResponseDto> getSharedDriveItems(String username, UUID parentId) {
		List<SharedItemResponseDto> result = new ArrayList<>();
		User user = getUserOrThrow(username);
		
		if (parentId == null) {
			// 1) 내가 공유받은 것들 — 단, 2단계 때문에 내가 만든 최상위 아이템도 이 Permission 목록에
			//    같이 잡히므로, 내 소유 아이템은 여기서 제외하고 아래(2번)에서 별도로 처리한다.
			for (Permission permission : permissionRepository.findByUser(user)) {
				if (isOwner(permission.getItem(), user)) {
					continue;
				}
				boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, permission.getItem());
				result.add(new SharedItemResponseDto(permission.getItem(), isFavorite, permission.getType(), false));
			}

			// 2) 내가 소유자이면서, 1명 이상 공유한 적 있는 경우
			for (DriveItem driveItem : driveRepository.findByUserUsername(username)) {
				if (permissionRepository.existsByItemAndUserNot(driveItem, user)) {
					boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
					result.add(new SharedItemResponseDto(driveItem, isFavorite, PermissionType.MANAGER, true));
				}
			}
		}
		else {
			DriveItem parent = getDriveItemOrThrow(parentId);
			PermissionType permissionType = getPermission(parent, user);
			if (permissionType == null) {
				throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
			}
			for (DriveItem driveItem : driveRepository.findByParent(parent)) {
				boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
				boolean isOwner = isOwner(driveItem, user);   // 아이템마다 실제 소유자 비교
				result.add(new SharedItemResponseDto(driveItem, isFavorite, permissionType, isOwner));
			}
		}
		return result;
	}

	// 부모로 계속 거슬러 올라가며 권한을 체크하는 함수
	public PermissionType getPermission(DriveItem driveItem, User user) {
		while (driveItem != null) {
			// 현재 사용자가 해당 아이템에 권한(Permission)이 있다면 해당 권한타입 반환
			Optional<Permission> permission = permissionRepository.findByItemAndUser(driveItem, user);
			if (permission.isPresent()) {
				return permission.get().getType();
			}
			
			// 부모로 이동
			driveItem = driveItem.getParent();
		}
		return null;
	}

	// [공유 문서] 현재 공유 문서의 경로(path)를 반환하는 메서드 (접근 권한 필요)
	public List<DriveItemResponseDto> getDrivePath(UUID foldId, String username) {
		List<DriveItemResponseDto> path = new ArrayList<>();

		// parent X -> 빈 path 반환
		if (foldId == null) {
			return path;
		}

		// 부모 폴더(parent)
		DriveItem parent = getDriveItemOrThrow(foldId);

		// 현재 유저
		User user = getUserOrThrow(username);

		// (접근 제어) Viewer이상의  권한 하나 필요
		if (!hasAccess(parent, user)) {
    		throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		// Parent O -> 부모로 거슬러 올라가면서 경로를 추적한다.(단, "공유 경계"까지만!)
		while (parent != null) {
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, parent);
			// 프론트에서 "현재 폴더에 새 폴더/파일을 만들 권한이 있는지" 등을 판단할 수 있도록
			// 각 경로 노드마다 실제 권한 타입을 계산해서 내려준다. (기존에는 null 고정)
			PermissionType nodePermissionType = getPermission(parent, user);
			boolean isOwner = isOwner(parent, user);
			path.add(new DriveItemResponseDto(parent, isFavorite, nodePermissionType, isOwner));

			// 공유 경계 판단
			// 1) 나에게 직접 Permission이 부여된 지점이거나,
			boolean isSharedToMe = permissionRepository.existsByItemAndUser(parent, user);
			// 2) 내가 소유자이면서, 해당 아이템을 누군가에게 공유한 적 있는 지점이면 추적 중지
			boolean isSharedByMe = parent.getUser().getPublicId().equals(user.getPublicId())
					&& permissionRepository.existsByItemAndUserNot(parent, user);

			if (isSharedToMe || isSharedByMe) {
				break;
			}

			parent = parent.getParent();
		}

		// 역순으로 정렬해서 리스트를 반환
		Collections.reverse(path);
		return path;
	}

	// 해당 Permission를 제거하는 메서드 (MANAGER 권한 필요)
	@Transactional
	public void deletePermission(UUID userId, UUID driveItemId, String username) {
	    // 현재 로그인 사용자
	    User currentUser = getUserOrThrow(username);

	    // 권한 대상 driveItem
	    DriveItem driveItem = getDriveItemOrThrow(driveItemId);

	    // [권한 제어] MANAGER 필요
	    if (!isManager(driveItem, currentUser)) {
	        throw new PermissionDeniedException("권한을 삭제할 권한이 없습니다.");
	    }

	    // 권한 대상 User
	    User user = getUserByPublicIdOrThrow(userId);

	    // 해당 Permission 찾기
	    Permission permission = permissionRepository.findByItemAndUser(driveItem, user).orElseThrow(
	        () -> new ResourceNotFoundException("삭제할 Permission를 찾을 수 없습니다. : " + userId + driveItemId));

	    permissionRepository.delete(permission);
	}

	// [권한 판별] 어떤 권한이든(VIEWER 이상) 접근 가능한지
	public boolean hasAccess(DriveItem driveItem, User user) {
		return getPermission(driveItem, user) != null;
	}

	// [권한 판별] MANAGER 권한인지 (생성/이동/공유/권한 변경 등에 필요)
	public boolean isManager(DriveItem driveItem, User user) {
		return isManager(getPermission(driveItem, user));
	}

	// [소유자 판별] 진짜 생성자(소유자)인지 - Permission 여부와 무관하게 DriveItem.user로 직접 판별
	public boolean isOwner(DriveItem driveItem, User user) {
		return driveItem.getUser().getPublicId().equals(user.getPublicId());
	}

	// [권한 판별] 내용을 수정할 수 있는 권한인지 (MANAGER | EDITOR)
	public boolean canEdit(DriveItem driveItem, User user) {
		return canEdit(getPermission(driveItem, user));
	}

	// 이미 계산된 PermissionType을 대상으로 판별할 때 쓰는 버전 (getPermission을 중복 호출하지 않도록)
	public boolean isManager(PermissionType type) {
		return type == PermissionType.MANAGER;
	}

	public boolean canEdit(PermissionType type) {
		return isManager(type) || type == PermissionType.EDITOR;
	}
	
	// 프로필 사진을 로드할 Presigned URI를 반환하는 헬퍼 메서드
	private String getProfileUri(String key) {
		String profileUri = null;
		// 프로필 키가 존재할 경우에만 수행
		if (key != null) {
			// 1. "S3의 어느 버킷, 어느 key를 GET할 것인가"를 정의하는 요청 명세 (아직 서명 X)
			GetObjectRequest getObjectRequest = GetObjectRequest.builder()
					.bucket(bucket)
					.key(key)
					.build();
				
			// 2. 위 요청에 "10분간만 유효한 GET"이라는 서명 조건을 씌운 presign 요청 생성
		    GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
		            .signatureDuration(Duration.ofMinutes(10)) // URL 유효기간 10분
		            .getObjectRequest(getObjectRequest)
		            .build();
				
		    // 3. 실제 서명 수행 — AWS 자격증명으로 로컬에서 HMAC 서명 계산 (네트워크 호출 없음, 빠름)
		    profileUri = s3Presigner.presignGetObject(presignRequest).url().toString();
		}
		return profileUri;
	}
	
	// 현재 로그인 사용자(username)를 조회하는 공통 헬퍼 메서드
	private User getUserOrThrow(String username) {
		return userRepository.findByUsername(username).orElseThrow(
				() -> new ResourceNotFoundException("User를 찾을 수 없습니다. : " + username));
	}

	// publicId로 User를 조회하는 공통 헬퍼 메서드 (공유 대상 User 등)
	private User getUserByPublicIdOrThrow(UUID userId) {
		return userRepository.findByPublicId(userId).orElseThrow(
				() -> new ResourceNotFoundException("User를 찾을 수 없습니다. : " + userId));
	}

	// publicId로 DriveItem을 조회하는 공통 헬퍼 메서드
	private DriveItem getDriveItemOrThrow(UUID publicId) {
		return driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new ResourceNotFoundException("DriveItem을 찾을 수 없습니다. publicId=" + publicId));
	}

}
