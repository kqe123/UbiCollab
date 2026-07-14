package com.ubicollab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import com.ubicollab.document.Document;
import com.ubicollab.document.DocumentRepository;

@SpringBootApplication
public class UbicollabApplication implements CommandLineRunner {
	private final DocumentRepository docRepository;
	
	public UbicollabApplication(DocumentRepository docRepository) {
		this.docRepository = docRepository;
	}
	
	public void run(String... args) throws Exception {
		// 2개의 Document 객체 추가 
		docRepository.save(new Document("Hello", "What's your name?", LocalDateTime.now(), false, "uc"));
		docRepository.save(new Document("Hello2", "My name is Bob", LocalDateTime.now(), false, "uc"));
		
		// 생성된 객체는 HeidiSQL에 접속해서 2개의 데이터가 있는지 확인해본다.
	}
	
	public static void main(String[] args) {
		SpringApplication.run(UbicollabApplication.class, args);
	}

}
