package com.ubicollab.driveitem;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.dto.DriveItemCreateDto;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.driveitem.dto.DriveItemUpdateDto;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.favorite.Favorite;
import com.ubicollab.favorite.FavoriteRepository;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;
import static com.aventrix.jnanoid.jnanoid.NanoIdUtils.randomNanoId;

@Service
public class DriveItemService {
	private final DriveItemRepository driveRepository;
	private final UserRepository userRepository;
	private final FavoriteRepository favoriteRepository;
	
	public DriveItemService(DriveItemRepository driveRepository,
							UserRepository userRepository,
							FavoriteRepository favoriteRepository) {
		this.driveRepository = driveRepository;
		this.userRepository = userRepository;
		this.favoriteRepository = favoriteRepository;
	}
	
	// DriveItem(folder/file) 생성 메서드
	public String createDriveItem(DriveItemCreateDto request, String username) {
		// 프론트에서 보내지 않은 값은 Jackson이 모두 null로 처리해준다.
		String itemName = request.itemName(); // 무조건 필수
		DriveItemType type = request.type(); // 무조건 필수
		DriveItem parent = null; // null 허용
		User user = null; // 무조건 필수
		String content = request.content(); // 파일은 O, 폴더는 null
		DriveItemExtension extension = request.extension(); // 파일은 O, 폴더는 null
		Long size = null; // 파일은 O, 폴더는 null
		
		// 기본적인 유효성 검사 (itemName, type, User, Parent)
		if (itemName == null || itemName.isBlank()) 
			throw new IllegalArgumentException("오류 : itemName은 필수입니다.");
		
		if (itemName.length() > 100) {
	        throw new IllegalArgumentException("오류 : itemName은 100자 이하여야 합니다.");
	    }

		if (type == null) 
			throw new IllegalArgumentException("오류 : type은 필수입니다.");
		
		user = userRepository.findByUsername(username)
		        .orElseThrow(() ->
		            new IllegalArgumentException(
		                "존재하지 않는 사용자입니다."));		
		
		// "ParentID가 존재한다면" Parent를 찾으면서 유효성 체크
		if (request.parentPublicId() != null) {
	        parent = driveRepository.findByPublicId(request.parentPublicId())
	            .orElseThrow(() ->
	                new IllegalArgumentException("부모 폴더가 존재하지 않습니다."));

	        if (parent.getType() != DriveItemType.FOLDER) {
	            throw new IllegalArgumentException("부모는 폴더여야 합니다.");
	        }

	        if (!parent.getUser().getId().equals(user.getId())) {
	            throw new SecurityException(
	                "다른 사용자의 폴더에는 아이템을 생성할 수 없습니다.");
	        }
	    }
		
		// type에 따른 유효성 검사
	    if (type == DriveItemType.FOLDER) {
	    	if (content != null) 
	    		throw new IllegalArgumentException("오류 : 폴더는 content를 가질수 없습니다.");
	    	
	    	if (extension != null) 
	    		throw new IllegalArgumentException("오류 : 폴더는 extension을 가질 수 없습니다.");
	    }		
	    
	    else if (type == DriveItemType.FILE) {
	    	if (content == null) 
	    		throw new IllegalArgumentException("오류 : 파일의 content는 필수입니다.");
	    	
	    	if (extension == null) 
	    		throw new IllegalArgumentException("오류 : 파일의 extension은 필수입니다.");
	    	
	    	 size = (long) content.getBytes(StandardCharsets.UTF_8).length;
	    }
	    
	    else {
	    	throw new IllegalArgumentException("지원하지 않는 타입입니다.");
	    }
	    
		// 랜덤 publicId 생성
		String publicId = randomNanoId();

	    // 새로운 DriveItem 객체 생성
	    DriveItem newDriveItem = new DriveItem(
	    	publicId,
	        itemName.trim(),
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
	    
	    // 저장 + publicId 반환
	    driveRepository.save(newDriveItem);
		return publicId;
	}
	
	
	// 현재 사용자의 전체 file를 조회하는 메서드
	public Iterable<DriveItemResponseDto> getFiles(String username) { 
		List<DriveItemResponseDto> result = new ArrayList<>();

		for (DriveItem driveItem : driveRepository.findByTypeAndUserUsername(DriveItemType.FILE, username)) {
			// 해당 DriveItem이 즐겨찾기에 등록되어 있는지 확인
			boolean isFavorite = (favoriteRepository.findByUserUsernameAndItem(username, driveItem)
													.isPresent()) ? true : false; 
		    result.add(new DriveItemResponseDto(driveItem, isFavorite));
		}
		
		return result;
	}
	
	// file 하나를 반환하는 메서드
	public DriveItemResponseDto getFile(String publicId, String username) {
		DriveItem file = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("파일를 찾을 수 없습니다. publicId=" + publicId));
		
		if (file.getType() != DriveItemType.FILE) {
			throw new IllegalArgumentException("오류 : 해당 아이템은 파일이 아닙니다!");
		}
		
		boolean isFavorite = (favoriteRepository.findByUserUsernameAndItem(username, file)
												.isPresent()) ? true : false; 
		return new DriveItemResponseDto(file, isFavorite);
	}
	
	
	// 현재 디렉토리의 DriveItem(folder/file)들을 반환하는 메서드
	public Iterable<DriveItemResponseDto> getDriveItems(String parentPublicId, String username) {
		List<DriveItemResponseDto> result = new ArrayList<>();
		
		for (DriveItem driveItem : driveRepository.findByUserUsernameAndParentPublicId(username, parentPublicId)) {
			// 해당 DriveItem이 즐겨찾기에 등록되어 있는지 확인
			boolean isFavorite = (favoriteRepository.findByUserUsernameAndItem(username, driveItem)
													.isPresent()) ? true : false; 
			result.add(new DriveItemResponseDto(driveItem, isFavorite));
		}
		
		return result;
	}
	
	// 현재 디렉토리의 경로(path)를 반환하는 메서드
	public Iterable<DriveItemResponseDto> getDrivePath(String publicId, String username) {
		List<DriveItemResponseDto> path = new ArrayList<>();
		
		// 부모로 거슬러 올라가면서 path에 현재 DriveItem 객체를 DriveItemResponse로 바꿔서 저장한다.
		// 이렇게 되면, 가장 하위 디렉토리부터 저장이 되게 된다. [자식(0), 부모(1), 조부모(2)...] 
		while (true) {
			Optional<DriveItem> driveItem = driveRepository.findByPublicId(publicId); 
			if(!(driveItem.isPresent())) 
				break;
			
			boolean isFavorite = (favoriteRepository.findByUserUsernameAndItem(username, driveItem.get())
													.isPresent()) ? true : false; 
			path.add(new DriveItemResponseDto(driveItem.get(), isFavorite));
			DriveItem parent = driveItem.get().getParent();
			
			publicId = (parent == null) ? null : parent.getPublicId();
		}
		
		// 역순으로 정렬해서 리스트를 반환
		Collections.reverse(path);
		return path;
	}
	
	// 휴지통 최상위 DriveItem(folder/file)를 가져오는 메서드
	public Iterable<DriveItemResponseDto> getTrash(String username) {
		List<DriveItemResponseDto> result = new ArrayList<>();
		
		// 휴지통 최상위 요소인지는 IsTrashRoot가 true인지로 판단한다.
		for ( DriveItem driveItem : driveRepository.findByUserUsernameAndIsTrashRoot(username, true)) {
			boolean isFavorite = (favoriteRepository.findByUserUsernameAndItem(username, driveItem)
													.isPresent()) ? true : false; 
			result.add(new DriveItemResponseDto(driveItem, isFavorite));
		}
		
		return result;
	}
	
	// DriveItem(folder/file)를 수정하는 메서드 (파일/폴더명 변경, 파일 내용 변경, 파일/폴더 이동)
	public void updateDriveItem(String publicId, DriveItemUpdateDto request, String username) {
		
		// 변경가능한 필드들 (3개)
		String itemName = request.itemName();
	    DriveItem parent = null;
	    String content = request.content();
	    
	    // 현재 로그인 사용자
	    User user = userRepository.findByUsername(username)
	            .orElseThrow(() ->
	                new IllegalArgumentException(
	                    "존재하지 않는 사용자입니다."
	                )
	            );
	    
	    // 수정 대상 driveItem
		DriveItem driveItem = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("해당 아이템을 찾을 수 없습니다. publicId="+ publicId));
		
		// 수정 대상 driveItem의 type
		DriveItemType type = driveItem.getType(); 
		
		// itemName이 있다면 변경 및 예외처리
		if (itemName != null) {
		    String trimmedItemName = itemName.trim();

		    if (trimmedItemName.isEmpty()) {
		        throw new IllegalArgumentException("itemName은 비어 있을 수 없습니다.");
		    }

		    if (trimmedItemName.length() > 100) {
		        throw new IllegalArgumentException("fileName은 100자 이하여야 합니다.");
		    }

		    driveItem.setItemName(trimmedItemName);
		}
		
		// 부모 폴더 변경
	    if (request.parentId() != null) {
	        parent = driveRepository
	            .findById(request.parentId())
	            .orElseThrow(() ->
	                new IllegalArgumentException(
	                    "이동할 부모 폴더가 존재하지 않습니다."
	                )
	            );

	        if (parent.getType() != DriveItemType.FOLDER) {
	            throw new IllegalArgumentException(
	                "부모는 폴더여야 합니다."
	            );
	        }

	        if (!parent.getUser().getId().equals(user.getId())) {
	            throw new AccessDeniedException(
	                "다른 사용자의 폴더로 이동할 수 없습니다."
	            );
	        }
	        driveItem.setParent(parent);
	    }

	    // 파일만 content 수정 가능, 폴더라면 예외처리
	    if (content != null) {
	        if (type != DriveItemType.FILE) {
	            throw new IllegalArgumentException(
	                "폴더는 content를 수정할 수 없습니다."
	            );
	        }
	        
	        driveItem.setContent(content);
	        long size = content.getBytes(StandardCharsets.UTF_8).length;
	        driveItem.setSize(size);
	    }
		driveRepository.save(driveItem);
	}
	
	// 해당 DriveItem(folder/file)과 모든 자식 요소들을 휴지통으로 보내는 메서드
	@Transactional
	public void moveToTrash(String publicId, String username) {
		DriveItem root = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("해당 아이템을 찾을 수 없습니다. publicId="+ publicId));
		root.setIsTrashRoot(true);
		updateIsInTrash(root, true, username, true);
	}
	
	// 해당 DriveItem(folder/file)과 모든 자식 요소들을 복원하는 메서드
	@Transactional 
	public void restoreTrash(String publicId, String username) {
		DriveItem root = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("해당 아이템을 찾을 수 없습니다. publicId=" + publicId));
		root.setIsTrashRoot(false);
		
		// 만약 root의 부모가 현재 휴지통에 있다면 루트에 복구를 한다.
		if (root.getParent() != null && root.getParent().getIsInTrash() ) { 
			root.setParent(null);
		}
		updateIsInTrash(root, false, username, true);
	}
	
	// 해당 폴더/파일과 모든 자식 요소들을 복원하거나 휴지통으로 보내는 재귀 함수
	public void updateIsInTrash(DriveItem driveItem, Boolean isInTrash,String username, Boolean isRoot) {
		// 루트가 아니고, 자식 요소중에 이미 쓰레기통에 있는 요소들은 탐색을 종료한다.
		if (!isRoot && driveItem.getIsTrashRoot()) 
			return;
		
		driveItem.setIsInTrash(isInTrash); // 현재 요소 복원 또는 휴지통으로 보냄.
		List<DriveItem> childDriveItems = driveRepository.
				findByUserUsernameAndParentPublicId(username,driveItem.getPublicId());
		
		// 자식 요소를 탐색하면서 폴더면 함수를 재귀하고, 파일이면 바로 복원 또는 휴지통으로 보냄.
		for (DriveItem child : childDriveItems) {
			if (child.getType() == DriveItemType.FOLDER) 
				updateIsInTrash(child, isInTrash, username, false);
			else 
				child.setIsInTrash(isInTrash);
		}	
	}
	
	// DriveItem를 제거하는 메서드
	@Transactional
	public void deleteDriveItem(String publicId, String username) {
		DriveItem root = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. publicId="+ publicId));
		RecursiveDelete(root, username, true);
	}
	
	// DriveItem를 자식 -> 부모 순으로 제거하는 재귀 함수
	public void RecursiveDelete(DriveItem driveItem, String username, Boolean isRoot) {
		if (!isRoot && driveItem.getIsTrashRoot()) {
			driveItem.setParent(null); // 남아있는 자식은 부모를 null로 설정
			return;
		}
		
		List<DriveItem> childDriveItems = driveRepository.findByUserUsernameAndParentPublicId(username, driveItem.getPublicId());
		
		for (DriveItem child : childDriveItems) {
			RecursiveDelete(child, username, false);
		}
		
		driveRepository.delete(driveItem);
	}
	
}
