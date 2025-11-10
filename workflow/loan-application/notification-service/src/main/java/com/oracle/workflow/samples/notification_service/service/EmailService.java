package com.oracle.workflow.samples.notification_service.service;

import com.oracle.workflow.samples.notification_service.domain.Mail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final String HTML_TEMPLATE = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f6f6f6; margin: 0; padding: 0; }
            .container { max-width:600px; margin:50px auto; background:#fff; padding:40px; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .header { font-size:24px; color:#003366; font-weight:bold; margin-bottom:16px; }
            .logo { height:40px; margin-bottom:24px; }
            .content { font-size:16px; color:#333; line-height:1.7; margin-bottom:16px; }
            .footer { color:#999; font-size:13px; padding-top:20px; border-top:1px solid #eee; text-align:center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">${subject}</div>
            <div class="content">${body}</div>
            <div class="footer">&copy; 2025 Oracle. All rights reserved.</div>
          </div>
        </body>
        </html>
        """;

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendMail(Mail mail) {
        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(mail.getFrom());
            helper.setTo(mail.getTo());
            if (mail.getCc() != null && !mail.getCc().isEmpty()) {
                helper.setCc(mail.getCc());
            }
            helper.setSubject(mail.getSubject());

            if (mail.isEmailBodyText()) {
                helper.setText(mail.getBody() == null ? "" : mail.getBody(), false);
            } else {
                String htmlContent = HTML_TEMPLATE
                    .replace("${subject}", escapeHtml(mail.getSubject()))
                    .replace("${body}", mail.getBody() == null ? "" : escapeHtml(mail.getBody()).replace("\n", "<br>"));
                helper.setText(htmlContent, true);
            }

            mailSender.send(message);
        } catch (MessagingException e) {
            // Handle error (could log or rethrow as runtime exception)
            throw new RuntimeException("Failed to send email", e);
        }
    }

    // Basic HTML escaping for subject/body
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&")
                   .replace("<", "<")
                   .replace(">", ">");
    }
}
