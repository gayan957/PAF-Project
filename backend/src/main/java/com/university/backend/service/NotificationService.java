package com.university.backend.service;

import com.university.backend.dto.NotificationDTO;
import com.university.backend.model.NotificationType;
import com.university.backend.model.User;

import java.util.List;

public interface NotificationService {

    void sendNotification(User recipient, NotificationType type, String title, String message,
                          Long referenceId, String referenceType);

    void sendNotificationToAllAdmins(NotificationType type, String title, String message,
                                     Long referenceId, String referenceType);

    List<NotificationDTO> getNotificationsForUser(String email);

    long getUnreadCount(String email);

    NotificationDTO markAsRead(Long notificationId, String email);

    void markAllAsRead(String email);

    void deleteNotification(Long notificationId, String email);

    void clearAllNotifications(String email);
}
