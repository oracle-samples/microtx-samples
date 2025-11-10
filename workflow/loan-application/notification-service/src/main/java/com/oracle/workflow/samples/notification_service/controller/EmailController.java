package com.oracle.workflow.samples.notification_service.controller;

import com.oracle.workflow.samples.notification_service.domain.Mail;
import com.oracle.workflow.samples.notification_service.service.EmailService;
import com.oracle.workflow.samples.notification_service.domain.EmailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/email-service")
public class EmailController {

    private final EmailService emailService;

    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/sendMail")
    public ResponseEntity<EmailResponse> sendMail(
            @RequestBody Mail mail,
            @RequestParam(name = "isMockSendMail", required = false, defaultValue = "false") boolean isMockSendMail) {
        try {
            if (isMockSendMail) {
                System.out.println("Email Sent Successfully (Mocked)");
                return ResponseEntity.ok(new EmailResponse("Email Sent Successfully (Mocked)"));
            }
            System.out.println("Sending Email");
            emailService.sendMail(mail);
            System.out.println("Email Sent Successfully");
            return ResponseEntity.ok(new EmailResponse("Email Sent Successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new EmailResponse("Fail to send email. "+e.getMessage()));
        }
    }

    @GetMapping("/hello")
    public ResponseEntity<String> sayHello(@RequestParam(name = "name", required = false, defaultValue = "world") String name) {
        return ResponseEntity.ok("Hello " + name);
    }
}


/**
 * Cache -> LRU and time

 DB Profile1 : PooledConn1 -> Cache(Conn1)
 DB Profile2 : PooledConn2 -> Cache(Conn2)
 DB Profile3 : PooledConn3 -> Cache(Conn3)

 DB Profile4 : PooledConn4 -> Cache(Conn4)

 **/



/**
 *
 * Blockchain Instance: transfer chaincode (API: /sendMoney)
 * RestProxy : /sendMoney
 *
 * [SpringBoot Service - Ms + MicroTx lib]
 *
 * [SpringBoot Service] -> calls -> RestProxy : /sendMoney
 *
 * /sendMoney : [SpringBoot Service] -> RestProxy -> Blockchain Instance
 *
 *
 */
