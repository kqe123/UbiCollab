package com.ubicollab.driveitem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import com.ubicollab.driveitem.enums.DriveItemType;

public interface DriveItemRepository extends CrudRepository<DriveItem, Long>{
	List<DriveItem> findByType(DriveItemType type);
}
