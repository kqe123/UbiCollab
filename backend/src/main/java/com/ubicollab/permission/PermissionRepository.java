package com.ubicollab.permission;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.user.User;

public interface PermissionRepository extends CrudRepository<Permission, Long>{
	List<Permission> findByItem(DriveItem item);
	List<Permission> findByUser(User user);
	Optional<Permission> findByItemAndUser(DriveItem item, User user);
	boolean existsByItem(DriveItem item);
	boolean existsByItemAndUser(DriveItem item, User user);
	boolean existsByItemAndUserNot(DriveItem item, User user);
	
}
