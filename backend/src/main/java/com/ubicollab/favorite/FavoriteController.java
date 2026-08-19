package com.ubicollab.favorite;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ubicollab.driveitem.dto.DriveItemCreateDto;
import com.ubicollab.driveitem.dto.DriveItemResponseDto;
import com.ubicollab.favorite.Favorite;
import com.ubicollab.favorite.FavoriteService;

import jakarta.validation.Valid;
	
//React 요청을 허용함.	
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/favorite")
public class FavoriteController {
	private final FavoriteService favoriteService;
	
	public FavoriteController(FavoriteService favoriteService) {
		this.favoriteService = favoriteService;
	}
	
	// [즐겨찾기] 즐겨찾기 생성 API (POST '/api/favorite/create')
	@PostMapping("/create/{id}")
	public ResponseEntity<Favorite> createFavorite(@PathVariable("id") String publicId,
			Authentication authentication) {
		String username = authentication.getName();
		favoriteService.createFavorite(username, publicId);
		return ResponseEntity
		        .status(HttpStatus.CREATED)
		        .build();
	}
	
	// [즐겨찾기] 즐겨찾기 조회 API (GET '/api/favorite')
	@GetMapping
	public ResponseEntity<List<DriveItemResponseDto>> getFavorites(
			@RequestParam(value = "foldId", required = false) String foldId,
			Authentication authentication) {
		String username = authentication.getName(); // 현재 사용자 username
		return ResponseEntity.status(HttpStatus.OK)
				.body(favoriteService.getFavorites(foldId, username));
	}
	
	// [즐겨찾기] 현재 경로 가져오기 API (GET '/api/favorite/path/{id}')
	@GetMapping("/path/{foldId}")
	public ResponseEntity<List<DriveItemResponseDto>> getDrivePath(@PathVariable("foldId") String foldId,
			Authentication authentication) {
		String username = authentication.getName();
		return ResponseEntity.status(HttpStatus.OK)
				.body(favoriteService.getDrivePath(foldId, username));
	}
	
	// [즐겨찾기] 즐겨찾기 삭제 API (DELETE '/api/favorite/delete/{id}')
		@DeleteMapping("/delete/{id}")
		public ResponseEntity<String> deleteFavorite(@PathVariable("id") String publicId,
				Authentication authentication) {
			String username = authentication.getName();
			favoriteService.deleteFavorite(publicId,username);
		    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}
	
	
}
