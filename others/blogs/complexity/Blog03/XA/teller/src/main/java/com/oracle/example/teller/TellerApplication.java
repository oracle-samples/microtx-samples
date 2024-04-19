package com.oracle.example.teller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan("com.oracle")
public class TellerApplication {

	public static void main(String[] args) {
		SpringApplication.run(TellerApplication.class, args);
	}

}
