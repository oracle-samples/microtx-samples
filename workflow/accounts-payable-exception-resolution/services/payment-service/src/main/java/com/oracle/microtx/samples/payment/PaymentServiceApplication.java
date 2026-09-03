package com.oracle.microtx.samples.payment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages = {"com.oracle", "com.oracle.microtx.samples.payment"})
public class PaymentServiceApplication { public static void main(String[] args) { SpringApplication.run(PaymentServiceApplication.class,args); } }
