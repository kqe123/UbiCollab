package com.ubicollab.user;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ubicollab.user.JwtService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class LoginController {
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	
	
	public LoginController(JwtService jwtService,
			AuthenticationManager authenticationManager) {
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
	}
	
	//로그인 시 인증을 수행
	@PostMapping("/login")
	public ResponseEntity<?> getToken(@RequestBody UserCredentials credentials) {
		UsernamePasswordAuthenticationToken creds = new
				UsernamePasswordAuthenticationToken(credentials.username(),
													credentials.password());
		Authentication auth = authenticationManager.authenticate(creds);
		
		// 토큰 생성
		String jwts = jwtService.getToken(auth.getName());
		
		// Authorization Header에 JWT를 포함시켜서 HTTP RESPONSE 반환
		return ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION,
				"Bearer " + jwts).header(HttpHeaders.
						ACCESS_CONTROL_EXPOSE_HEADERS,
						"Authorization").build();
	}
}

