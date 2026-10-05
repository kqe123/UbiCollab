package com.ubicollab.announcement;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import com.ubicollab.driveitem.DriveItem;

public interface AnnouncementRepository extends CrudRepository<Announcement, Long> {
	List<Announcement> findByFile(DriveItem file);
}
