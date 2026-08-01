package com.ubicollab.driveitem;
import java.util.Optional;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
import com.ubicollab.driveitem.dto.DriveItemResponse;
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
	
	// [테이블 메뉴] 폴더/파일 생성 API (POST '/api/driveitem/create')
	@PostMapping("/create")
	public ResponseEntity createDriveItem(
			@Valid @RequestBody DriveItemCreateRequest request,
			Authentication authentication) {
		
		String username = authentication.getName(); // 현재 사용자 ID
		
		
		driveService.createDriveItem(request, username);
		return ResponseEntity
		        .status(HttpStatus.CREATED)
		        .build();
	}
	
	// [최근 문서] 파일 목록 조회 API (GET '/api/driveitem/files')
	@GetMapping("/files")
	public Iterable<DriveItemResponse> getFiles(Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return driveService.getFiles(username); // 현재 사용자가 가진 파일 목록 반환
	}
	
	// [편집기] 파일 상세 조회 API(GET '/api/driveitem/files/{id}')
	@GetMapping("/files/{id}")
	public DriveItemResponse getFile(@PathVariable("id") String publicId) {
		return driveService.getFile(publicId);
	}
	
	// [내 드라이브] 현재 디렉토리 가져오기 API(GET '/api/driveitem/driveitems')
	@GetMapping("/driveitems")
	public Iterable<DriveItemResponse> getDriveItems(
			@RequestParam(value = "parentPublicId", required = false) String parentPublicId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return driveService.getDriveItems(parentPublicId, username);
	}
	
	// [내 드라이브] 현재 경로 가져오기 API (GET '/api/driveitem/path/{id}')
	@GetMapping("/path/{id}")
	public Iterable<DriveItemResponse> getDrivePath(@PathVariable("id") String publicId,
			Authentication authentication) {
		String username = authentication.getName();
		return driveService.getDrivePath(publicId, username);
	}
	
	
	// 폴더/파일 수정 API (PUT '/api/driveitem/{id}')
	@PutMapping("/{id}")
	public ResponseEntity<String> updateDriveItem(@PathVariable("id") String publicId,
			@Valid @RequestBody DriveItemUpdateRequest request,
			Authentication authentication) {
		
		String username = authentication.getName(); // 현재 로그인 사용자
		driveService.updateDriveItem(publicId, request, username);
		return ResponseEntity.ok("업데이트 완료");
	}
	
	
	// 문서 삭제 API (DELETE '/api/driveitem/{id}')
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteDocument(@PathVariable("id") Long id) {
		driveService.deleteDocument(id);
	    return ResponseEntity.ok("삭제 완료");
	}
	
	// 휴지통 비우기 API 
	
}
