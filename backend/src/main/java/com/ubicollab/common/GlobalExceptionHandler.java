package com.ubicollab.common;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ubicollab.common.exception.InvalidPasswordException;
import com.ubicollab.common.exception.PermissionDeniedException;
import com.ubicollab.common.exception.ResourceNotFoundException;
import com.ubicollab.common.exception.S3UploadDeniedException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(PermissionDeniedException.class)
	public ResponseEntity<Map<String, String>> handlePermissionDenied(PermissionDeniedException e) {
		Map<String, String> body = new HashMap<>();
		body.put("message", e.getMessage()); 
		
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);		
	}
	
	@ExceptionHandler(S3UploadDeniedException.class)
	public ResponseEntity<Map<String, String>> handlePermissionDenied(S3UploadDeniedException e) {
		Map<String, String> body = new HashMap<>();
		body.put("message", e.getMessage()); 
		
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);		
	}
	
	@ExceptionHandler(InvalidPasswordException.class) 
	public ResponseEntity<Map<String, String>> handlePermissionDenied(InvalidPasswordException e) {
		Map<String, String> body = new HashMap<>();
		body.put("message", e.getMessage());
		
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
	}
	
	@ExceptionHandler(ResourceNotFoundException.class) 
	public ResponseEntity<Map<String, String>> handlePermissionDenied(ResourceNotFoundException e) {
		Map<String, String> body = new HashMap<>();
		body.put("message", e.getMessage());
		
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
	}

	// @Valid 검증 실패 시 (@NotBlank, @Size 등) DTO에 작성한 message를 반환
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
		Map<String, String> body = new HashMap<>();
		FieldError fieldError = e.getBindingResult().getFieldError();
		body.put("message", fieldError != null ? fieldError.getDefaultMessage() : "잘못된 요청입니다.");

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
}
