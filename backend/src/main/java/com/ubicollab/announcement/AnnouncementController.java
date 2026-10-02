package com.ubicollab.announcement;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//React 요청을 허용함.
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/announcement")
public class AnnouncementController {
	
}
