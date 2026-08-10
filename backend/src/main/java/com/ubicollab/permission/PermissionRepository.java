package com.ubicollab.permission;
import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.ubicollab.driveitem.DriveItem;

public interface PermissionRepository extends CrudRepository<Permission, Long>{
	List<Permission> findByItem(DriveItem item);
}
