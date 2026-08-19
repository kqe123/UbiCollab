package com.ubicollab.driveitem;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.user.User;

public interface DriveItemRepository extends CrudRepository<DriveItem, Long>{
	Optional<DriveItem> findByPublicId(String publicId);
	List<DriveItem> findByType(DriveItemType type);
	List<DriveItem> findByUserUsername(String username);
	List<DriveItem> findByParent(DriveItem parent);
	List<DriveItem> findByParentPublicId(String parentpublicId);
	List<DriveItem> findByTypeAndUserUsername(DriveItemType type, String username);
	List<DriveItem> findByUserUsernameAndParentPublicId(String username,String parentPublicId);
	List<DriveItem> findByUserUsernameAndIsTrashRoot(String username, Boolean isTrashRoot);
}
