package com.ubicollab.favorite;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.ubicollab.driveitem.DriveItem;

public interface FavoriteRepository extends CrudRepository<Favorite, Long> {
	Optional<Favorite> findByUserUsernameAndItem(String username, DriveItem item); 
	boolean existsByUserUsernameAndItem(String username, DriveItem item);
	List<Favorite> findByUserUsername(String username);
}

