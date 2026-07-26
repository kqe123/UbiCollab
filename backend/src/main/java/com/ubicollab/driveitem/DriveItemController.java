package com.ubicollab.driveitem;
import java.util.Optional;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.DriveItemService;
import com.ubicollab.driveitem.dto.DriveItemCreateRequest;
import com.ubicollab.driveitem.dto.DriveItemUpdateRequest;

import jakarta.validation.Valid;

// React 요청을 허용함.
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/driveitem")
public class DriveItemController {
	private final DriveItemService driveService;
	
	public DriveItemController(DriveItemService driveService) {
		this.driveService = driveService;
	}
	
	// 폴더/파일 생성 API(POST '/api/driveitem/create')
	@PostMapping("/create")
	public ResponseEntity<DriveItem> createDriveItem(
			@Valid @RequestBody DriveItemCreateRequest request,
			Authentication authentication) {
		
		String username = authentication.getName();
		
		DriveItem savedDriveItem =
				driveService.createDriveItem(request, username);
		return ResponseEntity
	            .status(HttpStatus.CREATED)
	            .body(savedDriveItem);
	}
	
	// 파일 목록 조회 API(GET '/api/driveitem/documents')
	@GetMapping("/documents")
	public Iterable<DriveItem> getDocuments() {
		return driveService.getDocuments();
	}
	
	// 파일 상세 조회 API(GET '/api/driveitem/{id}')
	@GetMapping("/{id}")
	public DriveItem getDocument(@PathVariable("id") Long id) {
		return driveService.getDocument(id);
	}
	
	// 문서 수정 API (PUT '/api/driveitem/')
	@PutMapping("/{id}")
	public ResponseEntity<String> updateDocument(@PathVariable("id") Long id,
			@Valid @RequestBody DriveItemUpdateRequest document ) {
		driveService.updateDocument(id, document);
		return ResponseEntity.ok("업데이트 완료");
	}
	
	
	// 문서 삭제 API (DELETE '/api/documents/{id}')
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteDocument(@PathVariable("id") Long id) {
		driveService.deleteDocument(id);
	    return ResponseEntity.ok("삭제 완료");
	}
	
	// 휴지통 비우기 API 
	// 
	
}
