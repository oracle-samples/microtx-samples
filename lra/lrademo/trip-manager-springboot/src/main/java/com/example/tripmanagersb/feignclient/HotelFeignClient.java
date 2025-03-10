package com.example.tripmanagersb.feignclient;

import com.example.tripmanagersb.model.Booking;
import com.oracle.microtx.springboot.lra.clientinterceptor.MicroTxLRAFeignInterceptorConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "${hotel.service.name}", url = "${hotel.service.url}", configuration = MicroTxLRAFeignInterceptorConfig.class)
public interface HotelFeignClient {
    @RequestMapping(method = RequestMethod.POST)
    Booking bookHotel(@RequestParam("hotelName") String hotelName);
}
