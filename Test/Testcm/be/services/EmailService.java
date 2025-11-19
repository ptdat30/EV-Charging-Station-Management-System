package com.quitsmoking.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Phương thức gửi email văn bản thuần túy
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("your_email@gmail.com"); // Thay bằng email của bạn hoặc email cấu hình trong application.properties

        mailSender.send(message);
    }

    // Giữ lại phương thức sendOtpEmail nếu bạn vẫn cần nó
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã OTP đặt lại mật khẩu");
        message.setText("Mã OTP của bạn là: " + otp + "\nMã này có hiệu lực trong 5 phút.");
        message.setFrom("your_email@gmail.com"); // Thay bằng email của bạn
        mailSender.send(message);
    }
}