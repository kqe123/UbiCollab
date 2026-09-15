package com.ubicollab.common.exception;

// 접근 권한이 없을 때 발생하는 예외
public class PermissionDeniedException extends RuntimeException {
	public PermissionDeniedException(String message) {
		super(message); 
	}
}
