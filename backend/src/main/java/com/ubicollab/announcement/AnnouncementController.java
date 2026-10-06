package com.ubicollab.announcement;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ubicollab.announcement.dto.AnnouncementCreateDto;
import com.ubicollab.announcement.dto.AnnouncementResponseDto;

import jakarta.validation.Valid;

//React 요청을 허용함.
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/announcement")
public class AnnouncementController {
	private final AnnouncementService announcementService ;
	
	public AnnouncementController(AnnouncementService announcementService) {
		this.announcementService = announcementService;
	}	
	
	// [공지] 공지 생성 API (POST 'api/announcement/create')
	@PostMapping("/create")
	public ResponseEntity<?> createAnnouncement(@Valid @RequestBody AnnouncementCreateDto request,
			Authentication authentication) {
		String username = authentication.getName();
		announcementService.createAnnouncement(username, request);
		return ResponseEntity.status(HttpStatus.CREATED)
		        .body("공지 생성 완료");
	}
	
	// [공지] 공지 조회  API (GET 'api/announcement/{id}')
	@GetMapping("{id}")
	public ResponseEntity<List<AnnouncementResponseDto>> getAnnouncements(Authentication authentication,
			@PathVariable("id") UUID fileId) {
		String username = authentication.getName();
		return ResponseEntity
			   .status(HttpStatus.OK)
			   .body(announcementService.getAnnouncements(username, fileId));
	}
	
	
}
