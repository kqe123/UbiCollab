package com.ubicollab.favorite;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.permission.PermissionService;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;

@Service
public class FavoriteService {
	private final FavoriteRepository favoriteRepository;
	private final UserRepository userRepository;
	private final DriveItemRepository driveRepository;
	private final PermissionService permissionService;

	public FavoriteService(FavoriteRepository favoriteRepository,
			UserRepository userRepository,
			DriveItemRepository driveRepository,
			PermissionService permissionService) {
		this.favoriteRepository = favoriteRepository;
		this.userRepository = userRepository;
		this.driveRepository = driveRepository;
		this.permissionService = permissionService;
	}

	// [즐겨찾기] 즐겨찾기 추가 메서드 (접근 권한 필요)
	public void createFavorite(String username, UUID publicId ) {
		// 현재 유저 가져옴
		User user = getUserOrThrow(username);

		// 현재 아이템(폴더/파일) 가져옴
		DriveItem driveItem = getDriveItemOrThrow(publicId);

		// [권한 제어] 모든 권한 중 하나 필요
		if (!permissionService.hasAccess(driveItem, user)) {
			throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		// Favorite 엔티티 추가
		Favorite favorite = new Favorite(driveItem, user, LocalDateTime.now());
		favoriteRepository.save(favorite);
	}

	// [즐겨찾기] 즐겨찾기 조회 메서드 (접근 권한 필요)
	public List<DriveItemResponseDto> getFavorites(UUID foldId, String username) {
		// foldId X -> 현재 로그인 유저의 Favorite 엔티티 데이터들을 반환
		if (foldId == null) {
			return getFavoriteRoots(username);
		}

		// foldId O -> 권한 확인 후 결정
		return getFavoritesInFolder(foldId, username);
	}

	// 현재 로그인 유저가 즐겨찾기에 등록한 DriveItem들을 반환
	private List<DriveItemResponseDto> getFavoriteRoots(String username) {
		List<DriveItemResponseDto> result = new ArrayList<>();
		User user = getUserOrThrow(username);

		for (Favorite favorite : favoriteRepository.findByUserUsername(username)) {
			PermissionType permissionType = permissionService.getPermission(favorite.getItem(), user);
			result.add(new DriveItemResponseDto(favorite.getItem(), true, permissionType));
		}

		return result;
	}

	// 즐겨찾기로 등록된 특정 폴더 안의 DriveItem들을 반환 (접근 권한 필요)
	private List<DriveItemResponseDto> getFavoritesInFolder(UUID foldId, String username) {
		List<DriveItemResponseDto> result = new ArrayList<>();
		User user = getUserOrThrow(username);

		// 부모 폴더 가져옴
		DriveItem parent = getDriveItemOrThrow(foldId);

		// [권한 제어] 모든 권한 중 하나 필요
		PermissionType permissionType = permissionService.getPermission(parent, user);
		if (permissionType == null) {
			throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		for (DriveItem driveItem : driveRepository.findByParentPublicId(foldId)) {
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, driveItem);
			result.add(new DriveItemResponseDto(driveItem, isFavorite, permissionType));
		}

		return result;
	}

	// [즐겨찾기] 현재 즐겨찾기의 경로(path)를 반환하는 메서드 (접근 권한 필요)
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

		// [권한 제어] 모든 권한 중 하나 필요
		if (!permissionService.hasAccess(parent, user)) {
    		throw new PermissionDeniedException("해당 사용자는 접근할 권한이 없습니다.");
		}

		// Parent O -> 부모로 거슬러 올라가면서 경로를 추적한다.(단, 즐겨찾기로 등록된 경로까지만!)
		while (parent != null) {
			boolean isFavorite = favoriteRepository.existsByUserUsernameAndItem(username, parent);
			path.add(new DriveItemResponseDto(parent, isFavorite, null));
			// 부모가 즐겨찾기에 등록되어 있다면, 경로 추적 중지
			if (isFavorite) {
				break;
			}
			parent = parent.getParent();
		}

		// 역순으로 정렬해서 리스트를 반환
		Collections.reverse(path);
		return path;
	}

	// [즐겨찾기] 즐겨찾기 제거 메서드 (권한 불필요)
	public void deleteFavorite(UUID publicId, String username) {
		// 현재 아이템(폴더/파일) 가져옴
		DriveItem driveItem = getDriveItemOrThrow(publicId);

		Favorite favorite = favoriteRepository.findByUserUsernameAndItem(username, driveItem).orElseThrow(() ->
								new ResourceNotFoundException("존재하지 않는 즐겨찾기 항목입니다."));
		favoriteRepository.delete(favorite);
	}

	// 현재 로그인 사용자(username)를 조회하는 공통 헬퍼
	private User getUserOrThrow(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 사용자입니다."));
	}

	// publicId로 DriveItem을 조회하는 공통 헬퍼
	private DriveItem getDriveItemOrThrow(UUID publicId) {
		return driveRepository.findByPublicId(publicId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 아이템입니다."));
	}

}
