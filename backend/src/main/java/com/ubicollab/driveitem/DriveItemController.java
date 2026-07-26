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
@RequestMapping("/api/documents")
public class DriveItemController {
	private final DriveItemService docService;
	
	public DriveItemController(DriveItemService docService) {
		this.docService = docService;
	}
	
	// 문서 생성 API(POST '/api/documents')
	@PostMapping
	public ResponseEntity<DriveItem> createDriveItem(@Valid @RequestBody DriveItemCreateRequest document) {
		DriveItem savedDocument =
	            docService.createDocument(document);
		return ResponseEntity
	            .status(HttpStatus.CREATED)
	            .body(savedDocument);
	}
	
	// 문서 목록 조회 API(GET '/api/documents')
	@GetMapping
	public Iterable<DriveItem> getDriveItems() {
		return docService.getDocuments();
	}
	
	// 문서 상세 조회 API(GET '/api/documents/{id}')
	@GetMapping("/{id}")
	public DriveItem getDocument(@PathVariable("id") Long id) {
		return docService.getDocument(id);
	}
	
	// 문서 수정 API (PUT '/api/documents/')
	@PutMapping("/{id}")
	public ResponseEntity<String> updateDocument(@PathVariable("id") Long id,
			@Valid @RequestBody DriveItemUpdateRequest document ) {
		docService.updateDocument(id, document);
		return ResponseEntity.ok("업데이트 완료");
	}
	
	
	// 문서 삭제 API (DELETE '/api/documents/{id}')
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteDocument(@PathVariable("id") Long id) {
	    docService.deleteDocument(id);
	    return ResponseEntity.ok("삭제 완료");
	}
	
	
}
