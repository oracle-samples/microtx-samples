package com.example.tripmanagersb.async;

import com.oracle.microtx.springboot.lra.context.MicroTxTaskDecorator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfiguration {

    @Value("${trip.booking.executor.poolsize:8}")
    private Integer tripBookingExecutorPoolSize;

    private static final Logger LOG = LoggerFactory.getLogger(AsyncConfiguration.class);

    @Bean(name = "taskExecutorForTripBooking")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(tripBookingExecutorPoolSize);
        executor.setThreadNamePrefix("TripBooking-");
        executor.setTaskDecorator(new MicroTxTaskDecorator());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setRejectedExecutionHandler((r, executor1) -> LOG.warn("Task rejected, thread pool is full and queue is also full"));
        executor.initialize();
        return executor;
    }
}
