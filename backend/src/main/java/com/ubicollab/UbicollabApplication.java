package com.ubicollab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.DriveItemRepository;
import com.ubicollab.user.User;
import com.ubicollab.user.UserRepository;
@SpringBootApplication
public class UbicollabApplication implements CommandLineRunner {
	private final DriveItemRepository docRepository;
	private final UserRepository urepository;
	
	public UbicollabApplication(DriveItemRepository docRepository,
			UserRepository urepository) {
		this.docRepository = docRepository;
		this.urepository = urepository;
	}
	
	public void run(String... args) throws Exception {
		//urepository.save(new User("admin","$2a$10$NVM0n8ElaRgg7zWO1CxUdei7vWoPg91Lz2aYavh9.f9q0e4bRadue",
		//"user1",LocalDateTime.now(),"ADMIN",null));
	}
	
	public static void main(String[] args) {
		SpringApplication.run(UbicollabApplication.class, args);
	}

}
