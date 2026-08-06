package com.ubicollab.user.dto;

import com.ubicollab.user.User;

public class UserResponse {
	private Long id;
	private String username;
	private String nickname;
	private String profileImageKey;
	
	public UserResponse(User user) {
		this.id = user.getId();
		this.username = user.getUsername();
		this.nickname = user.getNickname();
		this.profileImageKey = user.getProfileImageKey();
	}
	
	public Long getId() {
		return id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getProfileImageKey() {
		return profileImageKey;
	}

	public void setProfileImageKey(String profileImageKey) {
		this.profileImageKey = profileImageKey;
	}
		
}
