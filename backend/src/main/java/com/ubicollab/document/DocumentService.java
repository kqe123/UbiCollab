package com.ubicollab.document;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.ubicollab.document.DocumentRepository;
import com.ubicollab.document.dto.DocumentCreateRequest;
import com.ubicollab.document.dto.DocumentUpdateRequest;
import com.ubicollab.document.enums.DocumentExtension;
import com.ubicollab.document.Document;

@Service
public class DocumentService {
	private final DocumentRepository docRepository;
	
	public DocumentService(DocumentRepository docRepository) {
		this.docRepository = docRepository;
	}
	
	// 한 Document를 생성하는 메서드
	public Document createDocument(DocumentCreateRequest document) {
		String fileName = document.getFileName();
		String content = document.getContent();
		DocumentExtension extension = document.getExtension();
		
	    if (content == null) {
	        content = "";
	    }
		
		long fileSize = content.getBytes(StandardCharsets.UTF_8).length;
		
		Document newDocument = new Document(
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
	public Iterable<Document> getDocuments() { 
		return docRepository.findAll();
	}
	
	// 한 Document를 반환하는 메서드
	public Document getDocument(Long id) {
		Document document = docRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id=" + id));
		return document;
	}
	
	// 한 Document를 수정하는 메서드 (filename 또는 content가 수정되야함.)
	public void updateDocument(Long id, DocumentUpdateRequest request) {
		Document document = docRepository.findById(id).orElseThrow(
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
		Document document = docRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id="+ id));
		docRepository.delete(document);
	}
}
