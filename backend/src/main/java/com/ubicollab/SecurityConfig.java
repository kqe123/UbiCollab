package com.ubicollab;

import java.util.Arrays;

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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import static org.springframework.security.config.Customizer.withDefaults;



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
	
	// Cors filter 추가
	@Bean 
	public CorsConfigurationSource corsConfigurationSource() {
		UrlBasedCorsConfigurationSource source = 
				new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(Arrays.asList("*"));
		config.setAllowedMethods(Arrays.asList("*"));
		config.setAllowedHeaders(Arrays.asList("*"));
		config.setAllowCredentials(false);
		config.applyPermitDefaultValues();
				
		source.registerCorsConfiguration("/**", config);
		return source;
	}
	   
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
			http.csrf((csrf) -> csrf.disable())
			.cors(withDefaults())
			.sessionManagement((sessionManagement) -> sessionManagement.
					sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests((authorizeHttpRequests) -> authorizeHttpRequests
					.requestMatchers(HttpMethod.POST,"/api/login").permitAll()
					.requestMatchers(HttpMethod.POST,"/api/user").permitAll()
					.requestMatchers(HttpMethod.POST,"/api/documents").permitAll() // 개발을 위해 임시 개방
					.requestMatchers(HttpMethod.GET,"/api/documents").permitAll() // 개발을 위해 임시 개방
					.requestMatchers(HttpMethod.GET, "/api/documents/*").permitAll() // 개발을 위해 임시 개방
					.requestMatchers(HttpMethod.PUT, "/api/documents/*").permitAll() // 개발을 위해 임시 개방
					.requestMatchers(HttpMethod.GET, "/api/user/check-username").permitAll() // 개발을 위해 임시 개방
					.anyRequest().authenticated())
			.addFilterBefore(authenticationFilter,
					UsernamePasswordAuthenticationFilter.class);
			return http.build();
	}
}