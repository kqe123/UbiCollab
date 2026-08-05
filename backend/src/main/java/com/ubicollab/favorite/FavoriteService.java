package com.ubicollab.favorite;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.dto.DriveItemResponse;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.favorite.FavoriteRepository;
import com.ubicollab.user.UserRepository;
import com.ubicollab.favorite.Favorite;
import com.ubicollab.user.User;

@Service
public class FavoriteService {
	private final FavoriteRepository favoriteRepository;
	private final UserRepository userRepository;
	private final DriveItemRepository driveItemRepository;
	
	public FavoriteService(FavoriteRepository favoriteRepository,
			UserRepository userRepository,
			DriveItemRepository driveItemRepository) {
		this.favoriteRepository = favoriteRepository;
		this.userRepository = userRepository;
		this.driveItemRepository = driveItemRepository;
	}
	
	// 즐겨찾기 추가 메서드
	public void createFavorite(String username, String publicId ) { 
		// 현재 유저 가져옴
		User user = userRepository.findByUsername(username).orElseThrow(() ->
        	new IllegalArgumentException("존재하지 않는 사용자입니다."));
		
		// 현재 아이템(폴더/파일) 가져옴
		DriveItem driveItem = driveItemRepository.findByPublicId(publicId).orElseThrow(() ->
			new IllegalArgumentException("존재하지 않는 아이템입니다."));
		
		// Favorite 엔티티 추가
		Favorite favorite = new Favorite(driveItem, user, LocalDateTime.now());
		favoriteRepository.save(favorite);
	}
	
	// 즐겨찾기들을 조회하는 메서드
	public Iterable<DriveItemResponse> getFavorites(String parentPublicId, String username) {
		List<DriveItemResponse> result = new ArrayList<>();
			
		// parentPublicId가 없다면 Favorite 엔티티 데이터들을 반환
		if (parentPublicId == null) { 
			for (Favorite favorite : favoriteRepository.findByUserUsername(username)) {
				result.add(new DriveItemResponse(favorite.getItem(), true));
			}
		}
			
		// parentPublicId가 있다면 즐겨찾기 폴더 안 내용물을 반환
		else {
			for (DriveItem driveItem : driveItemRepository.findByUserUsernameAndParentPublicId(username, parentPublicId)) {
				boolean isFavorite = (favoriteRepository.findByUserUsernameAndItem(username, driveItem)
														.isPresent()) ? true : false; 
				result.add(new DriveItemResponse(driveItem, isFavorite));
			}
		}
			
		return result;
	}
	
	// 즐겨찾기를 제거하는 메서드
	public void deleteFavorite(String publicId, String username) {
			
		// 현재 아이템(폴더/파일) 가져옴
		DriveItem driveItem = driveItemRepository.findByPublicId(publicId).orElseThrow(() ->
			new IllegalArgumentException("존재하지 않는 아이템입니다."));
			
		Favorite favorite = favoriteRepository.findByUserUsernameAndItem(username, driveItem).orElseThrow(() ->
								new IllegalArgumentException("존재하지 않는 즐겨찾기 항목입니다."));
		favoriteRepository.delete(favorite);
	}
	
}
