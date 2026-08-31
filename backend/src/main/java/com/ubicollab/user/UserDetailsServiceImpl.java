package com.ubicollab.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// DB에서 해당 Username의 User 객체를 찾아 반환하는 서비스
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
	private final UserRepository repository;

	public UserDetailsServiceImpl(UserRepository repository) {
			this.repository = repository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User currentUser = repository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found."));

		return org.springframework.security.core.userdetails.User
				.withUsername(username)
				.password(currentUser.getPassword())
				.roles(currentUser.getRole())
				.build();
	}
}
