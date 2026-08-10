package com.ubicollab.driveitem.enums;

public enum DriveItemExtension {
    UC("uc"),
    HTML("html"),
    TXT("txt"),
	PDF("pdf");

    private final String extension;

    DriveItemExtension(String extension) {
        this.extension = extension;
    }

    public String getExtension() {
        return extension;
    }
    
}
