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
	}
	
	public static void main(String[] args) {
		SpringApplication.run(UbicollabApplication.class, args);
	}

}
