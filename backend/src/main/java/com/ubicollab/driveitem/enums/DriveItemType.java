package com.ubicollab.driveitem.enums;

public enum DriveItemType {
	FOLDER("folder"),
	FILE("file");
	
	private final String type;
	
	DriveItemType(String type) {
		this.type = type;
	}
	
	public String getType() {
		return type;
	}
}