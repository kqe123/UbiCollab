package com.ubicollab.comment;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import com.ubicollab.driveitem.DriveItem;

public interface CommentRepository extends CrudRepository<Comment, Long>{
	Optional<Comment> findByPublicId(UUID publicId);
}
