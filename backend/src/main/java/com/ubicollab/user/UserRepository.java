package com.ubicollab.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends CrudRepository<User, Long>{
	Optional<User> findByUsername(String username);
	Optional<User> findByPublicId(UUID publicId);
	// 해당 키워드 기준으로 'kw%'에 해당하는 유저들을 반환
	// 단, 해당 DriveItem 소유자와 해당 DriveItem 권한 소유자는 제외
	@Query("""
		SELECT u
		FROM User u
		WHERE u.username LIKE CONCAT(:keyword, '%')	
		AND u.username <> :ownerUsername
		AND NOT EXISTS (
          SELECT p
          FROM Permission p
          WHERE p.user = u
            AND p.item.publicId = :itemPublicId
		)
	""")
	List<User> searchByUsername(@Param("keyword") String keyword,
								@Param("ownerUsername") String ownerUsername,
								@Param("itemPublicId") String itemPublicId);
}
