package com.oracle.example.department;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan("com.oracle")
public class Department1Application {

	public static void main(String[] args) {
		SpringApplication.run(Department1Application.class, args);
	}

}
