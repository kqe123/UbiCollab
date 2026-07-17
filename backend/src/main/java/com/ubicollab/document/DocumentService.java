package com.ubicollab.document;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.ubicollab.document.DocumentRepository;
import com.ubicollab.document.Document;

@Service
public class DocumentService {
	private final DocumentRepository docRepository;
	
	public DocumentService(DocumentRepository docRepository) {
		this.docRepository = docRepository;
	}
	
	// 한 Document를 생성하는 메서드
	public Document createDocument(Document document) {
		String fileName = document.getFileName();
		String content = document.getContent();
		String extension = document.getExtension();
		
		if (fileName == null || fileName.isBlank()) {
	        throw new IllegalArgumentException("fileName은 필수입니다.");
	    }

	    if (extension == null || extension.isBlank()) {
	        throw new IllegalArgumentException("extension은 필수입니다.");
	    }

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
	public void updateDocument(Long id, Document request) {
		Document document = docRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id="+ id));
		
		if (request.getFileName() != null)
			document.setFileName(request.getFileName());
		if (request.getContent() != null)
			document.setContent(request.getContent());
		if (request.getExtension() != null)
			document.setExtension(request.getExtension());
		
		// 내용이 변경되므로 fileSize도 다시 계산
		Long fileSize = (long) request.getContent().getBytes(StandardCharsets.UTF_8).length;
		document.setFileSize(fileSize);
		docRepository.save(document);
	}
	
	// 한 Document를 제거하는 메서드
	public void deleteDocument(Long id) {
		Document document = docRepository.findById(id).orElseThrow(
				() -> new RuntimeException("문서를 찾을 수 없습니다. id="+ id));
		docRepository.delete(document);
	}
}
