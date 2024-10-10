package com.example.tripmanagersb.feignclient;

import com.example.tripmanagersb.model.Booking;
import com.oracle.microtx.springboot.lra.clientinterceptor.MicroTxLRAFeignClientInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "${flight.service.name}", url = "${flight.service.url}", configuration = MicroTxLRAFeignClientInterceptor.class)
public interface FlightFeignClient {
    @RequestMapping(method = RequestMethod.POST)
    Booking bookFlight(@RequestParam("flightNumber") String flightNumber);
}
