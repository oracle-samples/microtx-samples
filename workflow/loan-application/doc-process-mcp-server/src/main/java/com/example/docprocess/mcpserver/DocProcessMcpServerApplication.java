package com.example.docprocess.mcpserver;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DocProcessMcpServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocProcessMcpServerApplication.class, args);
	}

	@Bean
	public ToolCallbackProvider weatherTools(DocProcessService docProcessService) {
		return MethodToolCallbackProvider.builder().toolObjects(docProcessService).build();
	}
}
