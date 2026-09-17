package com.ubicollab.driveitem;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.ubicollab.driveitem.dto.DriveItemCreateDto;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.driveitem.dto.FileSaveDto;
import com.ubicollab.driveitem.dto.ItemNameChangeDto;

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
	public ResponseEntity<UUID> createDriveItem(
			@Valid @RequestBody DriveItemCreateDto request,
			Authentication authentication) {

		String username = authentication.getName(); // 현재 사용자 ID


		UUID publicId = driveService.createDriveItem(request, username);
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
	public ResponseEntity<DriveItemResponseDto> getFile(@PathVariable("id") UUID publicId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return ResponseEntity.status(HttpStatus.OK)
				.body(driveService.getFile(publicId, username));
	}
	
	// [내 드라이브] 현재 디렉토리 가져오기 API(GET '/api/driveitem/driveitems')
	@GetMapping("/driveitems")
	public ResponseEntity<List<DriveItemResponseDto>> getDriveItems(
			@RequestParam(value = "parentPublicId", required = false) UUID parentPublicId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return ResponseEntity.status(HttpStatus.OK)
				.body(driveService.getDriveItems(parentPublicId, username));
	}
	
	// [내 드라이브] 현재 경로 가져오기 API (GET '/api/driveitem/path/{id}')
	@GetMapping("/path/{foldId}")
	public ResponseEntity<List<DriveItemResponseDto>> getDrivePath(@PathVariable("foldId") UUID foldId,
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
	
	// [메뉴] 폴더/파일 이름 변경 API (PATCH '/api/driveitem/name-change/{id}')
	@PatchMapping("/name-change/{id}")
	public ResponseEntity<String> updateItemName(@PathVariable("id") UUID publicId,
		@Valid @RequestBody ItemNameChangeDto request,
		Authentication authentication) {
			
		String username = authentication.getName(); // 현재 로그인 사용자
		driveService.updateItemName(publicId, request, username);
		return ResponseEntity.status(HttpStatus.OK).build();
	}
	
	// [편집기] 파일 저장 API (PATCH '/api/driveitem/save/{id}')
	@PatchMapping("/save/{id}")
	public ResponseEntity<String> saveFile(@PathVariable("id") UUID publicId,
			@Valid @RequestBody FileSaveDto request,
			Authentication authentication) {
		
		String username = authentication.getName(); // 현재 로그인 사용자
		driveService.saveFile(publicId, request, username);
		return ResponseEntity.status(HttpStatus.OK).build();
	}
	
	// [휴지통으로 보내기 메뉴] 폴더/파일 휴지통으로 보내기 API (PATCH '/api/driveitem/trash/{id}')
	@PatchMapping("/trash/{id}")
	public ResponseEntity<String> moveToTrash(@PathVariable("id") UUID publicId,
			Authentication authentication) {
			
		String username = authentication.getName(); // 현재 로그인 사용자
		driveService.moveToTrash(publicId,username);
		return ResponseEntity.status(HttpStatus.OK).body("휴지통으로 보내기 성공");
	}
	
	// [휴지통] 폴더/파일 복원 API (PATCH '/api/driveitem/restore/{id}')
	@PatchMapping("/restore/{id}")
	public ResponseEntity<String> restoreTrash(@PathVariable("id") UUID publicId,
			Authentication authentication) {
		String username = authentication.getName();
		driveService.restoreTrash(publicId,username);
		return ResponseEntity.status(HttpStatus.OK).body("복원 완료");
	}
	
	// [휴지통] 폴더/파일 영구 삭제 API (DELETE '/api/driveitem/{id}')
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteDriveItem(@PathVariable("id") UUID publicId,
			Authentication authentication) {
		String username = authentication.getName();
		driveService.deleteDriveItem(publicId,username);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
	
	// 휴지통 비우기 API 	
	
}
