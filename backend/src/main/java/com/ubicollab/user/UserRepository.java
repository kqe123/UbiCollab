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
	// 현재 로그인 사용자가 소유한 아이템을 공유받은 적이 있는 사용자들 반환 (최대 10명)
	// 단, 해당 DriveItem 소유자와 이미 권한을 가진 사용자는 제외
	@Query("""
		SELECT u
		FROM Permission p
		JOIN p.user u
		WHERE p.item.user.username = :username
		AND u.username <> :ownerUsername
		AND NOT EXISTS (
			SELECT 1
			FROM Permission p2
			WHERE p2.user = u
			AND p2.item.publicId = :itemPublicId
		)
		GROUP BY u
		ORDER BY MAX(p.createdDate) DESC
		LIMIT 10
	""")
	List<User> findSharedUsers(@Param("username") String username,
							   @Param("ownerUsername") String ownerUsername,
							   @Param("itemPublicId") UUID itemPublicId);
}
