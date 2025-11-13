// FILE: EmailTemplateService.java
package com.notificationservice.services;

import com.notificationservice.entities.Notification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service for generating professional HTML email templates
 * Design inspired by Epic Games email style
 */
@Service
public class EmailTemplateService {

    private static final String PRIMARY_COLOR = "#1e293b";
    private static final String ACCENT_COLOR = "#84cc16";
    private static final String SUCCESS_COLOR = "#10b981";
    private static final String WARNING_COLOR = "#f59e0b";
    private static final String DANGER_COLOR = "#ef4444";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Generate HTML email template based on notification type
     */
    public String generateEmailTemplate(Notification notification, String userEmail, String userName) {
        String notificationType = notification.getNotificationType().toString();
        
        // Determine email style based on notification type
        if (notificationType.contains("payment") || notificationType.contains("charging_complete")) {
            return generateReceiptEmail(notification, userEmail, userName);
        } else if (notificationType.contains("incident")) {
            return generateIncidentEmail(notification, userEmail, userName);
        } else if (notificationType.contains("reservation")) {
            return generateReservationEmail(notification, userEmail, userName);
        } else {
            return generateStandardEmail(notification, userEmail, userName);
        }
    }

    /**
     * Generate receipt-style email (Epic Games style)
     * Used for: payment_success, charging_complete
     */
    private String generateReceiptEmail(Notification notification, String userEmail, String userName) {
        String headerTitle = "Thank You.";
        String iconColor = SUCCESS_COLOR;
        String icon = "✓";
        
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: #f5f5f5;">
                <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <!-- Logo Section -->
                            <div style="margin-bottom: 30px;">
                                <div style="background: %s; color: white; display: inline-block; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: 800; letter-spacing: 2px;">
                                    ⚡ EV CHARGE
                                </div>
                                <div style="color: %s; font-size: 11px; margin-top: 8px; letter-spacing: 1px;">
                                    STATION MANAGEMENT SYSTEM
                                </div>
                            </div>
                            
                            <!-- Thank You Header -->
                            <h1 style="font-size: 48px; font-weight: 800; color: %s; margin: 30px 0;">
                                %s
                            </h1>
                            
                            <!-- Main Content Card -->
                            <table width="100%%" max-width="600px" cellpadding="0" cellspacing="0" border="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <tr>
                                    <td style="padding: 40px;">
                                        <!-- Greeting -->
                                        <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">
                                            Xin chào <strong>%s</strong>!
                                        </p>
                                        <p style="font-size: 14px; color: #666; margin: 0 0 30px 0;">
                                            Cảm ơn bạn đã sử dụng dịch vụ EV Charge Station.
                                        </p>
                                        
                                        <!-- Notification ID -->
                                        <div style="margin: 30px 0;">
                                            <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                                THÔNG BÁO ID:
                                            </div>
                                            <div style="font-size: 32px; font-weight: 800; color: %s; font-family: 'Courier New', monospace;">
                                                N%s
                                            </div>
                                        </div>
                                        
                                        <!-- Main Message -->
                                        <div style="background: #f9fafb; border-left: 4px solid %s; padding: 20px; margin: 30px 0; border-radius: 4px;">
                                            <div style="font-size: 14px; font-weight: 700; color: %s; margin-bottom: 8px;">
                                                %s
                                            </div>
                                            <div style="font-size: 14px; color: #666; line-height: 1.6;">
                                                %s
                                            </div>
                                        </div>
                                        
                                        <!-- Timestamp -->
                                        <div style="margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 6px;">
                                            <table width="100%%" cellpadding="8" cellspacing="0" border="0">
                                                <tr>
                                                    <td style="font-size: 13px; color: #999; font-weight: 600;">Thời gian:</td>
                                                    <td align="right" style="font-size: 13px; color: #333; font-weight: 700;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size: 13px; color: #999; font-weight: 600;">Email:</td>
                                                    <td align="right" style="font-size: 13px; color: %s;">%s</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <!-- Footer Message -->
                                        <p style="font-size: 12px; color: #999; margin: 30px 0 0 0; font-style: italic;">
                                            Vui lòng giữ email này để làm bằng chứng giao dịch.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer -->
                            <div style="margin-top: 40px; padding: 20px; color: #999; font-size: 12px; text-align: center;">
                                <div style="margin-bottom: 10px;">
                                    <a href="#" style="color: #999; text-decoration: none; margin: 0 10px;">Chính sách</a>
                                    <span style="color: #ddd;">•</span>
                                    <a href="#" style="color: #999; text-decoration: none; margin: 0 10px;">Hỗ trợ</a>
                                    <span style="color: #ddd;">•</span>
                                    <a href="#" style="color: #999; text-decoration: none; margin: 0 10px;">Liên hệ</a>
                                </div>
                                <div style="color: #bbb;">
                                    © 2025 EV Charge Station Management System. All rights reserved.
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
            notification.getTitle(),
            PRIMARY_COLOR, PRIMARY_COLOR,
            PRIMARY_COLOR, headerTitle,
            userName != null ? userName : "Khách hàng",
            PRIMARY_COLOR,
            String.format("%09d", notification.getNotificationId()),
            iconColor, PRIMARY_COLOR,
            notification.getTitle(),
            notification.getMessage(),
            notification.getCreatedAt().format(DATE_FORMATTER),
            PRIMARY_COLOR, userEmail
        );
    }

    /**
     * Generate incident alert email
     */
    private String generateIncidentEmail(Notification notification, String userEmail, String userName) {
        return generateStyledEmail(notification, userEmail, userName, 
            "🚨 Cảnh Báo Sự Cố", DANGER_COLOR, "⚠");
    }

    /**
     * Generate reservation confirmation email
     */
    private String generateReservationEmail(Notification notification, String userEmail, String userName) {
        return generateStyledEmail(notification, userEmail, userName, 
            "Xác Nhận Đặt Chỗ", SUCCESS_COLOR, "✓");
    }

    /**
     * Generate standard notification email
     */
    private String generateStandardEmail(Notification notification, String userEmail, String userName) {
        return generateStyledEmail(notification, userEmail, userName, 
            "Thông Báo", PRIMARY_COLOR, "i");
    }

    /**
     * Generic styled email template
     */
    private String generateStyledEmail(Notification notification, String userEmail, String userName, 
                                       String headerTitle, String accentColor, String icon) {
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: #f5f5f5;">
                <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <!-- Logo -->
                            <div style="margin-bottom: 30px;">
                                <div style="background: linear-gradient(135deg, %s 0%%, #0f172a 100%%); color: white; display: inline-block; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: 800; letter-spacing: 2px; box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);">
                                    ⚡ EV CHARGE
                                </div>
                                <div style="color: #64748b; font-size: 11px; margin-top: 8px; letter-spacing: 1px; font-weight: 600;">
                                    ELECTRIC VEHICLE CHARGING STATION
                                </div>
                            </div>
                            
                            <!-- Header -->
                            <h1 style="font-size: 42px; font-weight: 800; color: %s; margin: 30px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                %s
                            </h1>
                            
                            <!-- Main Card -->
                            <table width="100%%" style="max-width: 600px; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding: 40px;">
                                        <!-- Greeting -->
                                        <p style="font-size: 16px; color: #1e293b; margin: 0 0 8px 0; font-weight: 600;">
                                            Xin chào %s,
                                        </p>
                                        
                                        <!-- Notification ID Badge -->
                                        <div style="background: %s; color: white; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin: 20px 0;">
                                            THÔNG BÁO #%s
                                        </div>
                                        
                                        <!-- Title Section -->
                                        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.03) 0%%, rgba(30, 41, 59, 0.01) 100%%); border-left: 4px solid %s; padding: 24px; margin: 24px 0; border-radius: 8px;">
                                            <div style="font-size: 18px; font-weight: 700; color: %s; margin-bottom: 12px; display: flex; align-items: center;">
                                                <span style="display: inline-block; width: 32px; height: 32px; background: %s; color: white; border-radius: 50%%; text-align: center; line-height: 32px; margin-right: 12px; font-size: 18px;">%s</span>
                                                %s
                                            </div>
                                            <div style="font-size: 15px; color: #475569; line-height: 1.7;">
                                                %s
                                            </div>
                                        </div>
                                        
                                        <!-- Details Table -->
                                        <table width="100%%" style="margin: 30px 0; border-collapse: collapse;" cellpadding="0" cellspacing="0" border="0">
                                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                                <td style="padding: 16px 0; font-size: 14px; color: #64748b; font-weight: 600;">
                                                    Thời gian:
                                                </td>
                                                <td align="right" style="padding: 16px 0; font-size: 14px; color: #1e293b; font-weight: 700;">
                                                    %s
                                                </td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                                <td style="padding: 16px 0; font-size: 14px; color: #64748b; font-weight: 600;">
                                                    Email:
                                                </td>
                                                <td align="right" style="padding: 16px 0; font-size: 14px; color: %s;">
                                                    <a href="mailto:%s" style="color: %s; text-decoration: none;">%s</a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Action Button (optional) -->
                                        <div style="text-align: center; margin: 40px 0 20px 0;">
                                            <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, %s 0%%, #0f172a 100%%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);">
                                                Xem Chi Tiết
                                            </a>
                                        </div>
                                        
                                        <!-- Footer Note -->
                                        <div style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #e2e8f0; text-align: center;">
                                            <p style="font-size: 12px; color: #94a3b8; margin: 0; font-style: italic;">
                                                📧 Vui lòng giữ email này để làm bằng chứng giao dịch.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer Links -->
                            <div style="margin-top: 40px; text-align: center;">
                                <div style="margin-bottom: 16px;">
                                    <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 12px; font-size: 13px; font-weight: 500;">Chính sách bảo mật</a>
                                    <span style="color: #cbd5e1;">•</span>
                                    <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 12px; font-size: 13px; font-weight: 500;">Điều khoản sử dụng</a>
                                    <span style="color: #cbd5e1;">•</span>
                                    <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 12px; font-size: 13px; font-weight: 500;">Hỗ trợ</a>
                                </div>
                                <div style="color: #cbd5e1; font-size: 12px; font-weight: 500;">
                                    © 2025 EV Charge Station Management System. All rights reserved.
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
            notification.getTitle(),
            PRIMARY_COLOR, PRIMARY_COLOR,
            PRIMARY_COLOR, headerTitle,
            userName != null ? userName : "Khách hàng",
            accentColor, String.format("%09d", notification.getNotificationId()),
            accentColor, PRIMARY_COLOR, accentColor, icon,
            notification.getTitle(),
            notification.getMessage(),
            notification.getCreatedAt().format(DATE_FORMATTER),
            PRIMARY_COLOR, userEmail, PRIMARY_COLOR, userEmail,
            PRIMARY_COLOR
        );
    }
}




