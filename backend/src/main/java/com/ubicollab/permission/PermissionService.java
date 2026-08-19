package com.ubicollab.permission;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.favorite.Favorite;
import com.ubicollab.favorite.FavoriteRepository;
import com.ubicollab.permission.dto.PermissionRequestDto;
import com.ubicollab.permission.dto.PermissionRequestDto.UserDto;
import com.ubicollab.permission.dto.SharedItemResponseDto;
import com.ubicollab.permission.dto.SharedUserResponse;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;

@Service
public class PermissionService {
	private final DriveItemRepository driveRepository;
	private final PermissionRepository permissionRepository;
	private final UserRepository userRepository;
	private final FavoriteRepository favoriteRepository;

	
	public PermissionService (DriveItemRepository driveRepository,
			PermissionRepository permissionRepository,
			UserRepository userRepository,
			FavoriteRepository favoriteRepository) {
		this.driveRepository = driveRepository;
		this.permissionRepository = permissionRepository;
		this.userRepository = userRepository;
		this.favoriteRepository = favoriteRepository;
	}
	
	// [공유 추가 메뉴] 권한 생성 메서드 (OWNER | MANAGER 권한 필요)
	@Transactional
	public int createPermission(String username, PermissionRequestDto request) { 
		// 현재 로그인 사용자
		User currentUser = userRepository.findByUsername(username).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + username));
		
		// 공유할 대상(DriveItem)
		DriveItem driveItem = driveRepository.findByPublicId(request.driveItemId()).orElseThrow(
				() -> new RuntimeException("DriveItem을 찾을 수 없습니다. publicId=" + request.driveItemId()));
		
		// 공유할 사용자(userid, permissionType)
		List<UserDto> userList = request.userList();
		
		// OWNER | MANAGER가 아니면 예외처리
		PermissionType permissionType = getPermission(driveItem, currentUser);
		if (permissionType != PermissionType.OWNER &&
			permissionType != PermissionType.MANAGER) {
			throw new PermissionDeniedException("공유할 권한이 없습니다.");
		}
		
		// 새로운 Permission을 생성한 뒤 저장
		for (UserDto userInfo : userList) {
			User user = userRepository.findByPublicId(userInfo.userId()).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + userInfo.userId()));
			Permission permission = new Permission(user, driveItem,userInfo.type(), LocalDateTime.now()); 
			permissionRepository.save(permission);
		}
		return userList.size();
	}
	
	// [권한 관리 메뉴] 권한 변경 메서드 (OWNER | MANAGER 권한 필요)
	@Transactional
	public int updatePermission(String username, PermissionRequestDto request) {
		// 현재 로그인 사용자
		User currentUser = userRepository.findByUsername(username).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + username));
		
		// 공유할 대상(DriveItem)
		DriveItem driveItem = driveRepository.findByPublicId(request.driveItemId()).orElseThrow(
				() -> new RuntimeException("DriveItem을 찾을 수 없습니다. publicId=" + request.driveItemId()));
		
		// 공유할 사용자(userid, permissionType)		
		List<UserDto> userList = request.userList();

		// OWNER | MANAGER가 아니면 예외처리
		PermissionType permissionType = getPermission(driveItem, currentUser);
		if (permissionType != PermissionType.OWNER &&
			permissionType != PermissionType.MANAGER) {
			throw new PermissionDeniedException("권한을 변경할 권한이 없습니다.");
		}
		
		// 기존 Permission을 변경 후 저장
		for (UserDto userInfo : userList) {
			User user = userRepository.findByPublicId(userInfo.userId()).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + userInfo.userId()));
			Permission permission = permissionRepository.findByItemAndUser(driveItem, user).orElseThrow(
					() -> new RuntimeException("Permission를 찾을 수 없습니다. : " + userInfo.userId() + driveItem.getPublicId()));
			permission.setType(userInfo.type());
			permissionRepository.save(permission);
		}
		
		return userList.size();
	}
	
	// [권한 관리 메뉴] 공유 사용자 목록 조회 메서드 (접근 권한만 있으면 가능)
	public List<SharedUserResponse> getSharedUsers(String username, String publicId) {
		List<SharedUserResponse> result = new ArrayList<>();

		// 현재 로그인 사용자
		User currentUser = userRepository.findByUsername(username).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + username));

		// result에 소유자 추가
		DriveItem driveItem = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. publicId="+ publicId));

		// 권한 자체가 없다면 예외처리
		if (getPermission(driveItem, currentUser) == null) {
			throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		User owner = driveItem.getUser(); // 파일/폴더 소유자
		result.add(new SharedUserResponse(owner,PermissionType.OWNER));
			
		// result에 권한 소유자 추가
		List<Permission> permissionList = permissionRepository.findByItem(driveItem);
		for(Permission permission : permissionList) {
			result.add(new SharedUserResponse(
					permission.getUser(),permission.getType()));
		}
		return result;
	}
	
	// [공유 문서] 공유 문서 디렉토리를 조회하는 메서드 (특정 상황에서 접근 권한 필요)
	public List<SharedItemResponseDto> getSharedDriveItems(String username, String parentId) {
		List<SharedItemResponseDto> result = new ArrayList<>();
		
		
		// 현재 로그인된 유저
		User user = userRepository.findByUsername(username).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + username));
		
		// Parent X -> 현재 로그인 유저가 가진 Permission의 DriveItem들을 result에 추가
		if (parentId == null) { 

			// 현재 유저가 가진 모든 Permission을 순회하며, DriveItem들을 가져옴
			// DriveItem 정보 + isFavorite + Permission의 타입(VIEWER, EDITOR 등) 정보를 담아서 result에 추가
			for (Permission permission : permissionRepository.findByUser(user) ) {
				boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username,  permission.getItem());
				result.add(new SharedItemResponseDto(permission.getItem(), isFavorite, permission.getType()));
			}
			
			// 소유자가 자신인데,1명이상 공유한적이 있는 경우도 result에 추가
			for(DriveItem driveItem : driveRepository.findByUserUsername(username)) {
				if (permissionRepository.existsByItem(driveItem)) {
					boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
					result.add(new SharedItemResponseDto(driveItem, isFavorite, PermissionType.OWNER));
				}
			}
		}
			
		// Parent O -> 권한 체크 후 결정
		else { 
			// 현재 부모 DriveItem(폴더)
			DriveItem parent = driveRepository.findByPublicId(parentId).orElseThrow(
					() -> new RuntimeException("DriveItem을 찾을 수가 없습니다. : " + parentId));
			
			// 현재 사용자가 권한이 있는 사용자인지 Permission 체크를 함.
			PermissionType permissionType = getPermission(parent,user);
			
			// 권한 X -> 예외 처리
			if (permissionType == null) {
				throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
			}
			
			// 권한 O -> 해당 부모 아래에 있는 DriveItem 리스트를 result에 추가
			for (DriveItem driveItem : driveRepository.findByParent(parent)) {
				boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
				result.add(new SharedItemResponseDto(driveItem, isFavorite, permissionType));
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
			
			// 현재 사용자가 해당 아이템의 소유자라면 "OWNER" 반환
			if (driveItem.getUser().getPublicId().equals(user.getPublicId())) {
				return PermissionType.OWNER;
			}
			
			// 부모로 이동
			driveItem = driveItem.getParent();
		}
		return null;
	}

	// [공유 문서] 현재 공유 문서의 경로(path)를 반환하는 메서드 (접근 권한 필요)
	public List<DriveItemResponseDto> getDrivePath(String foldId, String username) {
		List<DriveItemResponseDto> path = new ArrayList<>();
			
		// parent X -> 빈 path 반환
		if (foldId == null) {
			return path;
		}
						
		// 부모 폴더(parent)
		DriveItem parent = driveRepository.findByPublicId(foldId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이템입니다."));
			
		// 현재 유저
		User user = userRepository.findByUsername(username).orElseThrow(() ->
        	new IllegalArgumentException("존재하지 않는 사용자입니다."));

		// 접근 권한이 없을 시 예외 처리 
		if (getPermission(parent, user) == null) {
    		throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		// Parent O -> 부모로 거슬러 올라가면서 경로를 추적한다.(단, "공유 경계"까지만!)
		while (parent != null) {
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, parent);
			path.add(new DriveItemResponseDto(parent, isFavorite, null));

			// 공유 경계 판단
			// 1) 나에게 직접 Permission이 부여된 지점이거나,
			boolean isSharedToMe = permissionRepository.existsByItemAndUser(parent, user);
			// 2) 내가 소유자이면서, 해당 아이템을 누군가에게 공유한 적 있는 지점이면 추적 중지
			boolean isSharedByMe = parent.getUser().getPublicId().equals(user.getPublicId())
					&& permissionRepository.existsByItem(parent);

			if (isSharedToMe || isSharedByMe) {
				break;
			}

			parent = parent.getParent();
		}
			
		// 역순으로 정렬해서 리스트를 반환
		Collections.reverse(path);
		return path;
	}
}
