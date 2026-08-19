package com.ubicollab.driveitem;
import java.io.ObjectInputFilter.Status;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.DriveItemService;
import com.ubicollab.driveitem.dto.DriveItemCreateDto;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.driveitem.dto.DriveItemUpdateDto;

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
	public ResponseEntity<String> createDriveItem(
			@Valid @RequestBody DriveItemCreateDto request,
			Authentication authentication) {
		
		String username = authentication.getName(); // 현재 사용자 ID
		
		
		String publicId = driveService.createDriveItem(request, username);
		return ResponseEntity
		        .status(HttpStatus.CREATED)
		        .body(publicId);
	}
	
	// [최근 문서] 파일 목록 조회 API (GET '/api/driveitem/files')
	@GetMapping("/files")
	public ResponseEntity<List<DriveItemResponseDto>> getFiles(Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return ResponseEntity.status(HttpStatus.OK)
			.body(driveService.getFiles(username));	
	}

	// [편집기] 파일 상세 조회 API(GET '/api/driveitem/files/{id}')
	@GetMapping("/files/{id}")
	public ResponseEntity<DriveItemResponseDto> getFile(@PathVariable("id") String publicId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return ResponseEntity.status(HttpStatus.OK)
				.body(driveService.getFile(publicId, username));
	}
	
	// [내 드라이브] 현재 디렉토리 가져오기 API(GET '/api/driveitem/driveitems')
	@GetMapping("/driveitems")
	public ResponseEntity<List<DriveItemResponseDto>> getDriveItems(
			@RequestParam(value = "parentPublicId", required = false) String parentPublicId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return ResponseEntity.status(HttpStatus.OK)
				.body(driveService.getDriveItems(parentPublicId, username));
	}
	
	// [내 드라이브] 현재 경로 가져오기 API (GET '/api/driveitem/path/{id}')
	@GetMapping("/path/{foldId}")
	public ResponseEntity<List<DriveItemResponseDto>> getDrivePath(@PathVariable("foldId") String foldId,
			Authentication authentication) {
		String username = authentication.getName();
		return ResponseEntity.status(HttpStatus.OK)
				.body(driveService.getDrivePath(foldId, username));
	}
	
	// [휴지통] 최상위 폴더/파일들만 가져오기 API (GET '/api/driveitem/trash')
	@GetMapping("/trash")
	public ResponseEntity<List<DriveItemResponseDto>> getTrash(Authentication authentication) {
		String username = authentication.getName();
		return ResponseEntity.status(HttpStatus.OK)
				.body(driveService.getTrash(username));
	}
	
	// [메뉴, 편집기 등] 폴더/파일 수정 API (PATCH '/api/driveitem/{id}')
	@PatchMapping("/{id}")
	public ResponseEntity<String> updateDriveItem(@PathVariable("id") String publicId,
			@Valid @RequestBody DriveItemUpdateDto request,
			Authentication authentication) {
		
		String username = authentication.getName(); // 현재 로그인 사용자
		driveService.updateDriveItem(publicId, request, username);
		return ResponseEntity.status(HttpStatus.OK).build();
	}
	
	// [휴지통으로 보내기 메뉴] 폴더/파일 휴지통으로 보내기 API (PATCH '/api/driveitem/trash/{id}')
	@PatchMapping("/trash/{id}")
	public ResponseEntity<String> moveToTrash(@PathVariable("id") String publicId,
			Authentication authentication) {
			
		String username = authentication.getName(); // 현재 로그인 사용자
		driveService.moveToTrash(publicId,username);
		return ResponseEntity.status(HttpStatus.OK).body("휴지통으로 보내기 성공");
	}
	
	// [휴지통] 폴더/파일 복원 API (PATCH '/api/driveitem/restore/{id}')
	@PatchMapping("/restore/{id}")
	public ResponseEntity<String> restoreTrash(@PathVariable("id") String publicId,
			Authentication authentication) {
		String username = authentication.getName();
		driveService.restoreTrash(publicId,username);
		return ResponseEntity.status(HttpStatus.OK).body("복원 완료");
	}
	
	// [휴지통] 폴더/파일 영구 삭제 API (DELETE '/api/driveitem/{id}')
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteDriveItem(@PathVariable("id") String publicId,
			Authentication authentication) {
		String username = authentication.getName();
		driveService.deleteDriveItem(publicId,username);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	// 휴지통 비우기 API 	
}
