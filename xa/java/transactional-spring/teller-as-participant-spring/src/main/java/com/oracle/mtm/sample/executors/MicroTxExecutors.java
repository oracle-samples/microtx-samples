package com.oracle.mtm.sample.executors;

import com.oracle.microtx.task.decorator.MicroTxXAContextTaskDecorator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class MicroTxExecutors {

    private static final Logger LOG = LoggerFactory.getLogger(MicroTxExecutors.class);

    @Bean(name = "microTxTaskExecutor")
    public Executor microTxTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("MicroTxAsyncExecutor-");
        executor.setTaskDecorator(new MicroTxXAContextTaskDecorator());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setRejectedExecutionHandler((r, executor1) -> LOG.warn("Task rejected, thread pool is full and queue is also full"));
        executor.initialize();
        return executor;
    }

    @Bean(name = "microTxThreadPoolTaskExecutor")
    public ThreadPoolTaskExecutor microTxThreadPoolTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("MicroTxAsyncExecutor-");
        executor.setTaskDecorator(new MicroTxXAContextTaskDecorator());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setRejectedExecutionHandler((r, executor1) -> LOG.warn("Task rejected, thread pool is full and queue is also full"));
        executor.initialize();
        return executor;
    }

}
