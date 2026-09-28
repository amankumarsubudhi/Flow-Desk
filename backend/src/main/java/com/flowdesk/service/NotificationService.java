package com.flowdesk.service;

import com.flowdesk.model.Notification;
import com.flowdesk.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification sendNotification(String targetRole, String userId, String title, String message, String requestId, String type) {
        Notification notification = Notification.builder()
                .targetRole(targetRole)
                .userId(userId)
                .title(title)
                .message(message)
                .requestId(requestId)
                .type(type != null ? type : "INFO")
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push via WebSocket STOMP (Section 5.7)
        try {
            messagingTemplate.convertAndSend("/topic/events", saved);
            if (targetRole != null) {
                messagingTemplate.convertAndSend("/topic/roles/" + targetRole.toLowerCase(), saved);
            }
        } catch (Exception e) {
            // Graceful degradation
        }

        return saved;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead() {
        List<Notification> all = notificationRepository.findAll();
        all.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(all);
    }
}
