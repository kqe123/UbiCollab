package com.ubicollab.permission;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.permission.dto.PermissionRequestDto;
import com.ubicollab.permission.dto.PermissionRequestDto.UserDto;
import com.ubicollab.permission.dto.SharedUserResponse;
import com.ubicollab.permission.enums.PermissionType;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;

@Service
public class PermissionService {
	private final DriveItemRepository driveRepository;
	private final PermissionRepository permissionRepository;
	private final UserRepository userRepository;

	
	public PermissionService (DriveItemRepository driveRepository,
			PermissionRepository permissionRepository,
			UserRepository userRepository) {
		this.driveRepository = driveRepository;
		this.permissionRepository = permissionRepository;
		this.userRepository = userRepository;
	}
	
	@Transactional
	public int createPermission(String username, PermissionRequestDto request) {
		String driveItemId = request.driveItemId();
		DriveItem driveItem = driveRepository.findByPublicId(driveItemId).orElseThrow(
				() -> new RuntimeException("DriveItem을 찾을 수 없습니다. publicId=" + driveItemId));
		List<UserDto> userList = request.userList();
		
		
		for (UserDto userInfo : userList) {
			User user = userRepository.findByPublicId(userInfo.userId()).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + userInfo.userId()));
			Permission permission = new Permission(user, driveItem,userInfo.type(), LocalDateTime.now()); 
			permissionRepository.save(permission);
		}
		return userList.size();
	}
	
	@Transactional
	public int updatePermission(String username, PermissionRequestDto request) {
		String driveItemId = request.driveItemId();
		DriveItem driveItem = driveRepository.findByPublicId(driveItemId).orElseThrow(
				() -> new RuntimeException("DriveItem을 찾을 수 없습니다. publicId=" + driveItemId));
		List<UserDto> userList = request.userList();
		
		for (UserDto userInfo : userList) {
			User user = userRepository.findByPublicId(userInfo.userId()).orElseThrow(
					() -> new RuntimeException("User를 찾을 수 없습니다. : " + userInfo.userId()));
			Permission permission = permissionRepository.findByItemAndUser(driveItem, user).orElseThrow(
					() -> new RuntimeException("Permission를 찾을 수 없습니다. : " + userInfo.userId() + driveItem.getPublicId()));
			permission.setType(userInfo.type());
			permissionRepository.save(permission);
		}
		
		return userList.size();
	}
	
	// 공유 사용자 목록 조회 메서드
	public List<SharedUserResponse> getSharedUsers(String username, String publicId) {
		List<SharedUserResponse> result = new ArrayList<>();
			
		// result에 소유자 추가
		DriveItem driveItem = driveRepository.findByPublicId(publicId).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. publicId="+ publicId));
		User owner = driveItem.getUser(); // 파일/폴더 소유자
		result.add(new SharedUserResponse(owner,PermissionType.OWNER));
			
		// result에 권한 소유자 추가
		List<Permission> permissionList = permissionRepository.findByItem(driveItem);
		for(Permission permission : permissionList) {
			result.add(new SharedUserResponse(
					permission.getUser(),permission.getType()));
		}
		return result;
	}
	
	
	
}
