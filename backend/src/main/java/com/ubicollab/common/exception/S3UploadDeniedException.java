package com.ubicollab.common.exception;

public class S3UploadDeniedException extends RuntimeException {
	public S3UploadDeniedException(String message) {
		super(message); 
	}
}