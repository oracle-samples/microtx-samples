package com.oracle.example.teller;

import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class Configuration {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
