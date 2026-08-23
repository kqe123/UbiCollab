package com.ubicollab.driveitem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.ubicollab.driveitem.enums.DriveItemType;

public interface DriveItemRepository extends CrudRepository<DriveItem, Long>{
	Optional<DriveItem> findByPublicId(UUID publicId);
	List<DriveItem> findByType(DriveItemType type);
	List<DriveItem> findByUserUsername(String username);
	List<DriveItem> findByParent(DriveItem parent);
	List<DriveItem> findByParentPublicId(UUID parentpublicId);
	List<DriveItem> findByTypeAndUserUsername(DriveItemType type, String username);
	List<DriveItem> findByUserUsernameAndParentPublicId(String username,UUID parentPublicId);
	List<DriveItem> findByUserUsernameAndIsTrashRoot(String username, Boolean isTrashRoot);
}
