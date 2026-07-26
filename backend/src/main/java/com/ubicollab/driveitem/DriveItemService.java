package com.ubicollab.driveitem;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.driveitem.dto.DriveItemCreateRequest;
import com.ubicollab.driveitem.dto.DriveItemRequest;
import com.ubicollab.driveitem.enums.DriveItemExtension;

@Service
public class DriveItemService {
	private final DriveItemRepository docRepository;
	
	public DriveItemService(DriveItemRepository docRepository) {
		this.docRepository = docRepository;
	}
	
	// 한 Document를 생성하는 메서드
	public DriveItem createDocument(DriveItemCreateRequest document) {
		String fileName = document.getFileName();
		String content = document.getContent();
		DriveItemExtension extension = document.getExtension();
		
	    if (content == null) {
	        content = "";
	    }
		
		long fileSize = content.getBytes(StandardCharsets.UTF_8).length;
		
		DriveItem newDocument = new DriveItem(
	            fileName,
	            content,
	            LocalDateTime.now(),
	            false,
	            extension,
	            fileSize
	    );

	    return docRepository.save(newDocument);
	}
	
	
	// 전체 Document를 반환하는 메서드
	public Iterable<DriveItem> getDocuments() { 
		return docRepository.findAll();
	}
	
	// 한 Document를 반환하는 메서드
	public DriveItem getDocument(Long id) {
		DriveItem document = docRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id=" + id));
		return document;
	}
	
	// 한 Document를 수정하는 메서드 (filename 또는 content가 수정되야함.)
	public void updateDocument(Long id, DriveItemRequest request) {
		DriveItem document = docRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id="+ id));
		Long fileSize;
		
		if (request.getFileName() != null) {
		    String fileName = request.getFileName().trim();

		    if (fileName.isEmpty()) {
		        throw new IllegalArgumentException("fileName은 비어 있을 수 없습니다.");
		    }

		    if (fileName.length() > 100) {
		        throw new IllegalArgumentException("fileName은 100자 이하여야 합니다.");
		    }

		    document.setFileName(fileName);
		}
		
		
		if (request.getContent() != null) {
			document.setContent(request.getContent());
			// 내용이 변경되므로 fileSize도 다시 계산
			fileSize = (long) request.getContent().getBytes(StandardCharsets.UTF_8).length;
			document.setFileSize(fileSize);
		}
		
		if (request.getExtension() != null)
			document.setExtension(request.getExtension());
		
		if (request.getIsInTrash() != null) 
			document.setIsInTrash(request.getIsInTrash());
		
		docRepository.save(document);
	}
	
	// 한 Document를 제거하는 메서드
	public void deleteDocument(Long id) {
		DriveItem document = docRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id="+ id));
		docRepository.delete(document);
	}
}
