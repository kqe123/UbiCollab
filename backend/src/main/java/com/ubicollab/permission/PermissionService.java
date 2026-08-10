package com.ubicollab.permission;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.permission.dto.SharedUserResponse;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;
import com.ubicollab.user.dto.UserResponse;

@Service
public class PermissionService {
	private final DriveItemRepository driveRepository;

	
	public PermissionService (DriveItemRepository driveRepository) {
		this.driveRepository = driveRepository;
	}
	
	
	// 공유 사용자 목록 조회 메서드
	public Iterable<SharedUserResponse> getSharedUsers(String username, String publicId) {
		List<SharedUserResponse> result = new ArrayList<>();
			
		// result에 소유자 추가
		DriveItem driveItem = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. publicId="+ publicId));
		User owner = driveItem.getUser(); // 파일/폴더 소유자
		result.add(new SharedUserResponse(owner,PermissionType.OWNER));
			
		// result에 권한 소유자 추가
			
		return result;
	}
	
}
