package com.ubicollab.common.exception;

// 프로필 이미지가 S3에 업로드되지 못했을때 발생하는 예외
public class S3UploadDeniedException extends RuntimeException {
	public S3UploadDeniedException(String message) {
		super(message); 
	}
}