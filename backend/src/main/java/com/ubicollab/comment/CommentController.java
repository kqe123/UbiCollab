package com.ubicollab.comment;

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
import com.ubicollab.comment.dto.CommentCreateDto;
import com.ubicollab.comment.dto.CommentResponseDto;

import jakarta.validation.Valid;

//React 요청을 허용함.
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/comment")
public class CommentController {
	private final CommentService commentService;
	
	public CommentController(CommentService commentService) {
		this.commentService = commentService;
	}
	
	// [댓글] 댓글 생성 API (GET 'api/comment/create')
	@PostMapping("/create")
	public ResponseEntity<String> createComment(
			@Valid @RequestBody CommentCreateDto request,
			Authentication authentication) {
			
			String username = authentication.getName();
			commentService.createComment(username, request); // 댓글 생성
			return ResponseEntity
			        .status(HttpStatus.CREATED)
			        .body("댓글 생성 완료");
	}
	
	// [댓글] 댓글 조회  API (GET 'api/comment/{id}')
	@GetMapping("{id}")
	public ResponseEntity<List<CommentResponseDto>> getComments(Authentication authentication,
			@PathVariable("id") UUID fileId) {
		String username = authentication.getName();
		return ResponseEntity
		        .status(HttpStatus.CREATED)
		        .body(commentService.getComments(username, fileId));
	}
	
	
}
