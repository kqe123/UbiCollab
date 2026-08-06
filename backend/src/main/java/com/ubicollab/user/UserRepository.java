package com.ubicollab.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends CrudRepository<User, Long>{
	Optional<User> findByUsername(String username);
	@Query("""
		SELECT u
		FROM User u
		WHERE u.username LIKE CONCAT(:keyword, '%')	
	""")
	List<User> searchByUsername(@Param("keyword") String keyword);
}
