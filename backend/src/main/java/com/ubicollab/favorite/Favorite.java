package com.ubicollab.favorite;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.ubicollab.driveitem.DriveItem;
import com.ubicollab.driveitem.enums.DriveItemExtension;
import com.ubicollab.driveitem.enums.DriveItemType;
import com.ubicollab.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Favorite {
	// 기본키
		@Id
		@GeneratedValue(strategy=GenerationType.IDENTITY)
		private Long id;
		
		// 즐겨찾기에 등록한 DriveItem
		@ManyToOne(fetch = FetchType.LAZY)
		@JoinColumn(name = "item_id", unique = true)
		@OnDelete(action = OnDeleteAction.CASCADE)
	    private DriveItem item;
		
		// 즐겨찾기에 등록한 사용자 (외래키)
	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "user_id", nullable = false)
	    private User user;
	    
	    @Column(nullable = false, updatable = false)
	    private LocalDateTime createdDate;
	    
	  //생성자
		public Favorite() {}
		
		public Favorite(DriveItem item, User user, LocalDateTime createdDate) {
			this.item = item;
			this.user = user;
			this.createdDate = createdDate;
		}

		public Long getId() {
			return id;
		}

		public DriveItem getItem() {
			return item;
		}

		public void setItem(DriveItem item) {
			this.item = item;
		}

		public User getUser() {
			return user;
		}

		public void setUser(User user) {
			this.user = user;
		}

		public LocalDateTime getCreatedDate() {
			return createdDate;
		}

		public void setCreatedDate(LocalDateTime createdDate) {
			this.createdDate = createdDate;
		}
}
