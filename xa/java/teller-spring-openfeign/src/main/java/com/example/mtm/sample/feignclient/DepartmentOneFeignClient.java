package com.example.mtm.sample.feignclient;

import com.oracle.microtx.springboot.interceptor.MicroTxXaFeignInterceptorConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(value = "${departmentOneServiceName}", url = "${departmentOneEndpoint}", configuration = { MicroTxXaFeignInterceptorConfig.class})
public interface DepartmentOneFeignClient {
    @RequestMapping(method = RequestMethod.POST, value = "/accounts/{accountId}/withdraw")
    ResponseEntity<String> withdraw(@RequestParam("amount") double amount, @PathVariable String accountId);
}
