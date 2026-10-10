package com.ubicollab.announcement;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import com.ubicollab.driveitem.DriveItem;

public interface AnnouncementRepository extends CrudRepository<Announcement, Long> {
	Optional<Announcement> findByPublicId(UUID publicId);
	List<Announcement> findByFile(DriveItem file);
}
