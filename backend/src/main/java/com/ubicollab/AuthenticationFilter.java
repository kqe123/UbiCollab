package com.ubicollab;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.ubicollab.user.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {
	private final JwtService jwtService;
	
	public AuthenticationFilter(JwtService jwtService) {
		this.jwtService = jwtService;
	}
	
	// 로그인 이후 매 요청마다 JWT를 확인하는 과정
	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
		throws ServletException, java.io.IOException {
		
		// 토큰을 검증하고 유저를 가져옴.
		String user = jwtService.getAuthUser(request);
		
		
		if (user != null 
				&& SecurityContextHolder.getContext().getAuthentication() == null) {
			// 인증
			Authentication authentication = 
					new UsernamePasswordAuthenticationToken(user, null,
							java.util.Collections.emptyList());
			
			// Spring Security에게 '이 사용자는 인증이 완료된 사용자입니다.'라고 등록
			SecurityContextHolder.getContext()
			.setAuthentication(authentication);
		}
		
		filterChain.doFilter(request, response);
		
	}
}
