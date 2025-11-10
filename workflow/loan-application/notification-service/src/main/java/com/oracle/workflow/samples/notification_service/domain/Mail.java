package com.oracle.workflow.samples.notification_service.domain;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Mail {
    private String from;
    private String to;
    private String cc;
    private String subject;
    private String body;
    private boolean isEmailBodyText;
}
