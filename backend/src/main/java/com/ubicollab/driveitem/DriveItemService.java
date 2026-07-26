package com.ubicollab.driveitem;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.dto.DriveItemCreateRequest;
import com.ubicollab.driveitem.dto.DriveItemUpdateRequest;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;

@Service
public class DriveItemService {
	private final DriveItemRepository driveRepository;
	private final UserRepository userRepository;
	
	public DriveItemService(DriveItemRepository driveRepository,
							UserRepository userRepository) {
		this.driveRepository = driveRepository;
		this.userRepository = userRepository;
	}
	
	// 한 DriveItem를 생성하는 메서드
	public DriveItem createDriveItem(DriveItemCreateRequest request, String username) {
		// 프론트에서 보내지 않은 값은 Jackson이 모두 null로 처리해준다.
		String itemName = request.getItemName(); // 무조건 필수
		DriveItemType type = request.getType(); // 무조건 필수
		DriveItem parent = null; // null 허용
		User user = null; // 무조건 필수
		String content = request.getContent(); // 파일은 O, 폴더는 null
		DriveItemExtension extension = request.getExtension(); // 파일은 O, 폴더는 null
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
		if (request.getParentId() != null) {
	        parent = driveRepository.findById(request.getParentId())
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
	    
	    // 새로운 DriveItem 객체 생성
	    DriveItem newDriveItem = new DriveItem(
	            itemName.trim(),
	            type,
	            parent,
	            user,
	            content,
	            extension,
	            size,
	            LocalDateTime.now(),
	            false
	        );
	    
	    // 저장 + DriveItem 반환
	    return driveRepository.save(newDriveItem);
	}
	
	
	// 전체 File를 반환하는 메서드
	public Iterable<DriveItem> getFiles() { 
		return driveRepository.findByType(DriveItemType.FILE);
	}
	
	// 한 File를 반환하는 메서드
	public DriveItem getFile(Long id) {
		DriveItem file = driveRepository.findById(id).orElseThrow(
				() -> new RuntimeException("파일를 찾을 수 없습니다. id=" + id));
		
		if (file.getType() != DriveItemType.FILE) {
			throw new IllegalArgumentException("오류 : 해당 아이템은 파일이 아닙니다!");
		}
		
		return file;
	}
	
	
	// 한 Document를 수정하는 메서드 (filename 또는 content가 수정되야함.)
	public void updateDriveItem(Long id, DriveItemUpdateRequest request, String username) {
		
		// 변경가능한 필드들 (4개)
		String itemName = request.getItemName();
	    DriveItem parent = null;
	    String content = request.getContent();
	    Boolean isInTrash = request.getIsInTrash();
	    
	    // 현재 로그인 사용자
	    User user = userRepository.findByUsername(username)
	            .orElseThrow(() ->
	                new IllegalArgumentException(
	                    "존재하지 않는 사용자입니다."
	                )
	            );
	    
	    // 수정 대상 driveItem
		DriveItem driveItem = driveRepository.findById(id).orElseThrow(
				() -> new RuntimeException("해당 아이템을 찾을 수 없습니다. id="+ id));
		
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
	    if (request.getParentId() != null) {
	        parent = driveRepository
	            .findById(request.getParentId())
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
		
		// isinTrash가 있다면 변경 및 예외처리
		if (isInTrash != null) 
			driveItem.setIsInTrash(request.getIsInTrash());
		
		driveRepository.save(driveItem);
	}
	
	// 한 Document를 제거하는 메서드
	public void deleteDocument(Long id) {
		DriveItem document = driveRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id="+ id));
		driveRepository.delete(document);
	}
}
