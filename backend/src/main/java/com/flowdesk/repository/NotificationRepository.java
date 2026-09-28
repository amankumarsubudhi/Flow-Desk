package com.flowdesk.repository;

import com.flowdesk.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdOrTargetRoleOrderByCreatedAtDesc(String userId, String targetRole);
    List<Notification> findAllByOrderByCreatedAtDesc();
}
