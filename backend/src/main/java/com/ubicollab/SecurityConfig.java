package com.ubicollab;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // 설정 클래스
@EnableWebSecurity // 보안 설정을 커스터마이징함을 명시.
public class SecurityConfig {
	private final AuthenticationFilter authenticationFilter;
	
	public SecurityConfig(AuthenticationFilter authenticationFilter) {
		this.authenticationFilter = authenticationFilter;
	}
	
	// 비밀번호를 암호화(Encoding) 하고, 로그인할 때 비교(Matching) 하는 객체
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	// 로그인을 실제로 수행하는 객체
	@Bean
	public AuthenticationManager uthenticationManager(
			AuthenticationConfiguration authConfig) throws Exception {
			return authConfig.getAuthenticationManager();
	}
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
			http.csrf((csrf) -> csrf.disable())
			.sessionManagement((sessionManagement) -> sessionManagement.
					sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests((authorizeHttpRequests) -> 
				authorizeHttpRequests.requestMatchers(HttpMethod.POST,
						"/login").permitAll().anyRequest().authenticated())
			.addFilterBefore(authenticationFilter,
					UsernamePasswordAuthenticationFilter.class);
			return http.build();
	}
	
}