package com.ubicollab.document.enums;

public enum DocumentExtension {
    UC("uc"),
    HTML("html"),
    TXT("txt"),
	PDF("pdf");

    private final String extension;

    DocumentExtension(String extension) {
        this.extension = extension;
    }

    public String getExtension() {
        return extension;
    }
}
