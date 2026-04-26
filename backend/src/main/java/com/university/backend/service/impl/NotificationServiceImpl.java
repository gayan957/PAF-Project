package com.university.backend.service.impl;

import com.university.backend.dto.NotificationDTO;
import com.university.backend.model.Notification;
import com.university.backend.model.NotificationType;
import com.university.backend.model.Role;
import com.university.backend.model.User;
import com.university.backend.repository.NotificationRepository;
import com.university.backend.repository.UserRepository;
import com.university.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void sendNotification(User recipient, NotificationType type, String title,
                                  String message, Long referenceId, String referenceType) {
        Notification notification = Notification.builder()
            .user(recipient)
            .type(type)
            .title(title)
            .message(message)
            .referenceId(referenceId)
            .referenceType(referenceType)
            .read(false)
            .build();

        NotificationDTO dto = toDTO(notificationRepository.save(notification));

        try {
            messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/notifications", dto);
        } catch (Exception e) {
            log.warn("WebSocket push failed for user {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    @Override
    @Transactional
    public void sendNotificationToAllAdmins(NotificationType type, String title, String message,
                                             Long referenceId, String referenceType) {
        userRepository.findByRole(Role.ROLE_ADMIN).forEach(admin ->
            sendNotification(admin, type, title, message, referenceId, referenceType)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsForUser(String email) {
        User user = findUserByEmail(email);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
            .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = findUserByEmail(email);
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long notificationId, String email) {
        User user = findUserByEmail(email);
        Notification notification = notificationRepository.findByIdAndUser(notificationId, user)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return toDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        User user = findUserByEmail(email);
        notificationRepository.markAllAsReadForUser(user);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, String email) {
        User user = findUserByEmail(email);
        Notification notification = notificationRepository.findByIdAndUser(notificationId, user)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void clearAllNotifications(String email) {
        User user = findUserByEmail(email);
        notificationRepository.deleteAllByUser(user);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
            .id(n.getId())
            .userId(n.getUser().getId())
            .type(n.getType())
            .title(n.getTitle())
            .message(n.getMessage())
            .read(n.isRead())
            .referenceId(n.getReferenceId())
            .referenceType(n.getReferenceType())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
