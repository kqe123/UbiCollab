package com.ubicollab.common;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.ubicollab.common.exception.PermissionDeniedException;
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
}
