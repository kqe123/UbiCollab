package com.ubicollab.driveitem;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.driveitem.dto.DriveItemCreateDto;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.driveitem.dto.DriveItemUpdateDto;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.favorite.FavoriteRepository;
import com.ubicollab.permission.PermissionService;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;

@Service
public class DriveItemService {
	private static final int MAX_ITEM_NAME_LENGTH = 100;

	private final DriveItemRepository driveRepository;
	private final UserRepository userRepository;
	private final FavoriteRepository favoriteRepository;
	private final PermissionService permissionService;

	public DriveItemService(DriveItemRepository driveRepository,
							UserRepository userRepository,
							FavoriteRepository favoriteRepository,
							PermissionService permissionService) {
		this.driveRepository = driveRepository;
		this.userRepository = userRepository;
		this.favoriteRepository = favoriteRepository;
		this.permissionService = permissionService;
	}

	// DriveItem(folder/file) 생성 메서드 (MANAGER | OWNER 권한 필요)
	public UUID createDriveItem(DriveItemCreateDto request, String username) {
		// 기본적인 유효성 검사 (itemName, type)
		String itemName = requireValidItemName(request.itemName());
		DriveItemType type = request.type(); // 무조건 필수
		if (type == null) {
			throw new IllegalArgumentException("오류 : type은 필수입니다.");
		}

		// 현재 유저(필수)
		User user = getUserOrThrow(username);

		// parent O -> 현재 유저의 권한을 따져서 예외처리
		DriveItem parent = resolveParentForCreate(request.parentPublicId(), user);

		// type에 따른 유효성 검사 + 파일 크기 계산
		String content = request.content(); // 파일은 O, 폴더는 null
		DriveItemExtension extension = request.extension(); // 파일은 O, 폴더는 null
		Long size = computeSizeAndValidateTypeFields(type, content, extension);

	    // 새로운 DriveItem 객체 생성 (publicId는 @UuidGenerator가 저장 시 자동 생성)
	    DriveItem newDriveItem = new DriveItem(
	        itemName,
	        type,
	        parent,
	        user,
	        content,
	        extension,
	        size,
	        LocalDateTime.now(),
	        false,
	        false
	    );

	    // 저장 + 자동 생성된 publicId 반환
	    driveRepository.save(newDriveItem);
		return newDriveItem.getPublicId();
	}

	// itemName 필수/길이 검사 후 앞뒤 공백을 제거해 반환
	private String requireValidItemName(String itemName) {
		if (itemName == null || itemName.isBlank())
			throw new IllegalArgumentException("오류 : itemName은 필수입니다.");

		if (itemName.length() > MAX_ITEM_NAME_LENGTH) {
			throw new IllegalArgumentException("오류 : itemName은 " + MAX_ITEM_NAME_LENGTH + "자 이하여야 합니다.");
		}

		return itemName.trim();
	}

	// 생성 시 부모 폴더를 검증하는 헬퍼 (parentPublicId가 없으면 최상위 생성이므로 null 반환)
	private DriveItem resolveParentForCreate(UUID parentPublicId, User user) {
		if (parentPublicId == null) {
			return null;
		}

		DriveItem parent = driveRepository.findByPublicId(parentPublicId)
				.orElseThrow(() -> new IllegalArgumentException("부모 폴더가 존재하지 않습니다."));

		if (parent.getType() != DriveItemType.FOLDER) {
			throw new IllegalArgumentException("부모는 폴더여야 합니다.");
		}

		// [권한 제어] OWNER | MANAGER만
		if (!permissionService.isOwnerOrManager(parent, user)) {
			throw new PermissionDeniedException("해당 위치에 DriveItem를 생성할 권한이 없습니다.");
		}

		return parent;
	}

	// FOLDER/FILE 타입별 필드 유효성 검사 + FILE의 byte 크기 계산 (FOLDER는 null 반환)
	private Long computeSizeAndValidateTypeFields(DriveItemType type, String content, DriveItemExtension extension) {
		if (type == DriveItemType.FOLDER) {
			if (content != null)
				throw new IllegalArgumentException("오류 : 폴더는 content를 가질수 없습니다.");

			if (extension != null)
				throw new IllegalArgumentException("오류 : 폴더는 extension을 가질 수 없습니다.");

			return null;
		}

		if (type == DriveItemType.FILE) {
			if (content == null)
				throw new IllegalArgumentException("오류 : 파일의 content는 필수입니다.");

			if (extension == null)
				throw new IllegalArgumentException("오류 : 파일의 extension은 필수입니다.");

			return (long) content.getBytes(StandardCharsets.UTF_8).length;
		}

		throw new IllegalArgumentException("지원하지 않는 타입입니다.");
	}


	// [최근 문서] 현재 사용자의 전체 file를 조회하는 메서드
	public List<DriveItemResponseDto> getFiles(String username) {
		List<DriveItemResponseDto> result = new ArrayList<>();

		for (DriveItem driveItem : driveRepository.findByTypeAndUserUsername(DriveItemType.FILE, username)) {
			// 해당 DriveItem이 즐겨찾기에 등록되어 있는지 확인
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
		    result.add(new DriveItemResponseDto(driveItem, isFavorite, PermissionType.OWNER));
		}

		return result;
	}

	// [편집기] file 하나를 반환하는 메서드 (접근 권한 필요)
	public DriveItemResponseDto getFile(UUID publicId, String username) {
		// 1. DriveItem 찾기
		DriveItem file = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new ResourceNotFoundException("파일를 찾을 수 없습니다. publicId=" + publicId));

		// 1-1.DriveItem이 FOLDER라면 예외처리
		if (file.getType() != DriveItemType.FILE) {
			throw new IllegalArgumentException("오류 : 해당 아이템은 파일이 아닙니다!");
		}

		// 2. 현재 로그인중인 User 찾고, 해당 파일에 대한 권한(Permission)을 찾음.
		User user = getUserOrThrow(username);
		PermissionType permissionType = permissionService.getPermission(file,user);

		// 2-1. [권한 제어] 모든 권한 중 하나 필요
		if (permissionType == null) {
			throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		// 3. DriveItem 정보 + isFavorite + 해당 DriveItem에 대한 권한 정보를 반환
		boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, file);
		return new DriveItemResponseDto(file, isFavorite, permissionType);
	}


	// [내 드라이브] 현재 디렉토리의 DriveItem(folder/file)들을 반환하는 메서드 (OWNER 권한 필요)
	public List<DriveItemResponseDto> getDriveItems(UUID parentPublicId, String username) {
		List<DriveItemResponseDto> result = new ArrayList<>();
		List<DriveItem> driveItems; // 현재 디렉토리의 DriveItem List를 담을 변수

		// 현재 유저
		User user = getUserOrThrow(username);

		// 루트 O : 내가 소유한 최상위 아이템만
		if (parentPublicId == null) {
			driveItems = driveRepository.findByUserUsernameAndParentPublicId(username, null);
		}

		// 루트 X: 내가 소유하거나, MANAGER가 따로 만든 아이템들
		else {
			DriveItem parentItem = driveRepository.findByPublicId(parentPublicId).orElseThrow(
					() -> new ResourceNotFoundException("파일을 찾을 수 없습니다. publicId=" + parentPublicId));

			// [권한 제어] OWNER 권한 필요
	        if (!permissionService.isOwner(parentItem, user)) {
	            throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
	        }

			// 소유자 조건 없이, 물리적 위치(parent)만으로 조회
	        driveItems = driveRepository.findByParentPublicId(parentPublicId);
		}

		for (DriveItem driveItem :driveItems) {
			// 해당 DriveItem이 즐겨찾기에 등록되어 있는지 확인
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
			result.add(new DriveItemResponseDto(driveItem, isFavorite, PermissionType.OWNER));
		}

		return result;
	}

	// [내 드라이브] 현재 디렉토리의 경로(path)를 반환하는 메서드 (Owner 권한 필요)
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

		// [권한 제어] OWNER 권한 필요
		if (!permissionService.isOwner(parent, user)) {
		    throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		// parent O -> 부모로 거슬러 올라가면서 path를 쌓는다.
		// 이렇게 되면, 가장 하위 디렉토리부터 저장이 되게 된다. [자식(0), 부모(1), 조부모(2)...]
		while (parent != null) {
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, parent);
			path.add(new DriveItemResponseDto(parent, isFavorite, null));
			parent = parent.getParent();
		}

		// 역순으로 정렬해서 리스트를 반환
		Collections.reverse(path);
		return path;
	}

	// 휴지통 최상위 DriveItem(folder/file)를 가져오는 메서드 (권한 불필요)
	public List<DriveItemResponseDto> getTrash(String username) {
		List<DriveItemResponseDto> result = new ArrayList<>();

		// 휴지통 최상위 요소인지는 IsTrashRoot가 true인지로 판단한다.
		for ( DriveItem driveItem : driveRepository.findByUserUsernameAndIsTrashRoot(username, true)) {
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
			result.add(new DriveItemResponseDto(driveItem, isFavorite, PermissionType.OWNER));
		}

		return result;
	}

	// DriveItem(folder/file)를 수정하는 메서드 (파일/폴더명 변경, 파일 내용 변경, 파일/폴더 이동) (Permission Required)
	public void updateDriveItem(UUID publicId, DriveItemUpdateDto request, String username) {
	    // 현재 로그인 사용자
	    User user = getUserOrThrow(username);

	    // 수정 대상 driveItem
		DriveItem driveItem = getDriveItemOrThrow(publicId);

		// 현재 갖고있는 권한(OWNER, MANAGER 등...)
		PermissionType permissionType = permissionService.getPermission(driveItem, user);
		boolean canEdit = permissionService.canEdit(permissionType);
		boolean canMove = permissionService.isOwnerOrManager(permissionType);

		applyItemNameUpdate(driveItem, request.itemName(), canEdit);
		applyParentUpdate(driveItem, request.parentId(), user, canMove);
		applyContentUpdate(driveItem, request.content(), canEdit);

		driveRepository.save(driveItem);
	}

	// itemName이 요청에 포함된 경우 유효성 검사 + 권한 검사 후 변경
	private void applyItemNameUpdate(DriveItem driveItem, String itemName, boolean canEdit) {
		if (itemName == null) {
			return;
		}

		String trimmedItemName = itemName.trim();

		if (trimmedItemName.isEmpty()) {
			throw new IllegalArgumentException("itemName은 비어 있을 수 없습니다.");
		}

		if (trimmedItemName.length() > MAX_ITEM_NAME_LENGTH) {
			throw new IllegalArgumentException("fileName은 " + MAX_ITEM_NAME_LENGTH + "자 이하여야 합니다.");
		}

		// [권한 제어] OWNER | MANAGER | EDITOR 권한 필요
		if (!canEdit) {
			throw new PermissionDeniedException("아이템명을 변경할 권한이 없습니다.");
		}

		driveItem.setItemName(trimmedItemName);
	}

	// parentId가 요청에 포함된 경우(이동) 유효성 검사 + 권한 검사 후 변경
	private void applyParentUpdate(DriveItem driveItem, UUID parentId, User user, boolean canMove) {
		if (parentId == null) {
			return;
		}

		DriveItem parent = driveRepository.findByPublicId(parentId)
				.orElseThrow(() -> new IllegalArgumentException("이동할 부모 폴더가 존재하지 않습니다."));

		if (parent.getType() != DriveItemType.FOLDER) {
			throw new IllegalArgumentException("부모는 폴더여야 합니다.");
		}

		// [권한 제어] 이동 대상 아이템 자체에 대해 OWNER | MANAGER 권한 필요
		if (!canMove) {
			throw new PermissionDeniedException("부모를 변경할 권한이 없습니다.");
		}

		// [권한 제어] 이동할 목적지 폴더에도 OWNER | MANAGER 권한 필요 (createDriveItem과 동일한 기준)
		// 이 검사가 없으면, 권한이 전혀 없는 임의의 폴더 안으로 아이템을 옮겨 넣을 수 있게 됨.
		if (!permissionService.isOwnerOrManager(parent, user)) {
			throw new PermissionDeniedException("이동할 위치에 대한 권한이 없습니다.");
		}

		driveItem.setParent(parent);
	}

	// content가 요청에 포함된 경우 유효성 검사 + 권한 검사 후 변경 (파일만 가능)
	private void applyContentUpdate(DriveItem driveItem, String content, boolean canEdit) {
		if (content == null) {
			return;
		}

		if (driveItem.getType() != DriveItemType.FILE) {
			throw new IllegalArgumentException("폴더는 content를 수정할 수 없습니다.");
		}

		// [권한 제어] OWNER | MANAGER | EDITOR 권한 필요
		if (!canEdit) {
			throw new PermissionDeniedException("파일 내용을 변경할 권한이 없습니다.");
		}

		driveItem.setContent(content);
		driveItem.setSize((long) content.getBytes(StandardCharsets.UTF_8).length);
	}

	// 해당 DriveItem(folder/file)과 모든 자식 요소들을 휴지통으로 보내는 메서드 (OWNER | MANAGER 권한 필요)
	@Transactional
	public void moveToTrash(UUID publicId, String username) {
		// 휴지통 대상 driveItem
		DriveItem root = getDriveItemOrThrow(publicId);

		// 현재 유저
		User user = getUserOrThrow(username);

		// [권한 제어] OWNER | MANAGER 권한 필요
		if (!permissionService.isOwnerOrManager(root, user)) {
			throw new PermissionDeniedException("휴지통으로 보낼 권한이 없습니다.");
		}


		root.setIsTrashRoot(true);
		updateIsInTrash(root, true, true);
	}

	// 해당 DriveItem(folder/file)과 모든 자식 요소들을 복원하는 메서드 (OWNER 권한 필요)
	@Transactional
	public void restoreTrash(UUID publicId, String username) {
		// 복원 대상 driveItem
		DriveItem root = getDriveItemOrThrow(publicId);

		// 현재 유저
		User user = getUserOrThrow(username);

		// [권한 제어] OWNER 권한 필요
		if (!permissionService.isOwner(root, user)) {
			throw new PermissionDeniedException("해당 아이템을 복원할 권한이 없습니다.");
		}

		root.setIsTrashRoot(false);

		// 만약 root의 부모가 현재 휴지통에 있다면 루트에 복구를 한다.
		if (root.getParent() != null && root.getParent().getIsInTrash() ) {
			root.setParent(null);
		}
		updateIsInTrash(root, false, true);
	}

	// 해당 폴더/파일과 모든 자식 요소들을 복원하거나 휴지통으로 보내는 재귀 함수
	private void updateIsInTrash(DriveItem driveItem, boolean isInTrash, boolean isRoot) {
		// 루트가 아니고, 자식 요소중에 이미 쓰레기통에 있는 요소들은 탐색을 종료한다.
		if (!isRoot && driveItem.getIsTrashRoot())
			return;

		driveItem.setIsInTrash(isInTrash); // 현재 요소 복원 또는 휴지통으로 보냄.
		List<DriveItem> childDriveItems = driveRepository.
				findByParentPublicId(driveItem.getPublicId());

		// 자식 요소를 탐색하면서 폴더면 함수를 재귀하고, 파일이면 바로 복원 또는 휴지통으로 보냄.
		for (DriveItem child : childDriveItems) {
			if (child.getType() == DriveItemType.FOLDER)
				updateIsInTrash(child, isInTrash, false);
			else
				child.setIsInTrash(isInTrash);
		}
	}

	// DriveItem를 제거하는 메서드 (OWNER 권한 필요)
	@Transactional
	public void deleteDriveItem(UUID publicId, String username) {
		// 제거 대상 driveItem
		DriveItem root = getDriveItemOrThrow(publicId);
		// 현재 유저
		User user = getUserOrThrow(username);

		// [권한 제어] OWNER 권한 필요
		if (!permissionService.isOwner(root, user)) {
			throw new PermissionDeniedException("해당 아이템을 복원할 권한이 없습니다.");
		}

		recursiveDelete(root, true);
	}

	// DriveItem를 자식 -> 부모 순으로 제거하는 재귀 함수
	private void recursiveDelete(DriveItem driveItem, boolean isRoot) {
		if (!isRoot && driveItem.getIsTrashRoot()) {
			driveItem.setParent(null); // 남아있는 자식은 부모를 null로 설정
			return;
		}

		List<DriveItem> childDriveItems = driveRepository.findByParentPublicId(driveItem.getPublicId());

		for (DriveItem child : childDriveItems) {
			recursiveDelete(child, false);
		}

		driveRepository.delete(driveItem);
	}

	// 현재 로그인 사용자(username)를 조회하는 공통 헬퍼
	private User getUserOrThrow(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 사용자입니다."));
	}

	// publicId로 DriveItem을 조회하는 공통 헬퍼
	private DriveItem getDriveItemOrThrow(UUID publicId) {
		return driveRepository.findByPublicId(publicId)
				.orElseThrow(() -> new ResourceNotFoundException("해당 아이템을 찾을 수 없습니다. publicId=" + publicId));
	}

}
