package com.oracle.microtx.samples.ap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.oracle", "com.oracle.microtx.samples.ap"})
public class ApBackendApplication {
    public static void main(String[] args) { SpringApplication.run(ApBackendApplication.class, args); }
}
