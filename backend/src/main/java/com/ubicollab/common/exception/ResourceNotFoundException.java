package com.ubicollab.common.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// User, DriveItem 등 요청받은 리소스를 찾지 못했을 때 던지는 예외.
// 각 Service에서 "OO를 찾을 수 없습니다" 류의 메시지로 제각각 던지던 RuntimeException을 통일한다.
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
	public ResourceNotFoundException(String message) {
		super(message);
	}
}
