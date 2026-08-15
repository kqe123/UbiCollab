package com.ubicollab.permission.enums;

public enum PermissionType {
	OWNER("owner"),
	VIEWER("viewer"),
	COMMENTOR("commentor"),
	EDITOR("editor"),
	MANAGER("manager");
	
	private final String type;
	
	PermissionType(String type) {
		this.type = type;
	}
	
	public String getType() {
		return type;
	}
}
