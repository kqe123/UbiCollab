package com.ubicollab.user;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtService {
	static final long EXPIRATIONTIME = 3_600_000L;
	static final String PREFIX = "Bearer ";
	
	private final SecretKey KEY;

    public JwtService(@Value("${JWT_SECRET}") String secret) {
        this.KEY = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }
		
	// 사용자가 로그인에 성공했을 때 서명된 JWT를 만들고 반환
    // (LoginController에서 사용)
	public String getToken(String username) {
		String token = Jwts.builder()
		.subject(username) 
		.expiration(new Date(System.currentTimeMillis() + EXPIRATIONTIME)) 
		.signWith(KEY)
		.compact();
			
		return token;
	}
		
	// Authorization 헤더에서 JWT를 꺼내 사용자 이름 반환 
	// (AuthenticationFilter에서 사용)
	public String getAuthUser(HttpServletRequest request) {
		// Http Request 중 Authorization 헤더를 가져옴.
		String authorizationHeader =
	            request.getHeader(HttpHeaders.AUTHORIZATION);
		
		//Authorization 헤더가 없거나 Authorization 헤더 시작이 Bearer가 아니면 null 반환
	    if (authorizationHeader == null ||
	            !authorizationHeader.startsWith(PREFIX)) {
	        return null;
	    }
	    
	    // authorization 헤더에서 PREFIX(Bearer) 제거
	    String token = authorizationHeader.substring(PREFIX.length());
	    
	    // JWT가 만료/위조/문자열이 깨짐 등이 발생하면 예외 처리
	    try {
	        return Jwts.parser()
	                .verifyWith(KEY)
	                .build()
	                .parseSignedClaims(token)
	                .getPayload()
	                .getSubject();

	    } catch (JwtException | IllegalArgumentException e) {
	        return null;
	    }
	}
}
