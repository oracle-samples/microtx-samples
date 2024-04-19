package com.oracle.example.department.resource;

import com.oracle.example.department.data.IAccountOperationService;
import com.oracle.example.department.data.IAccountQueryService;
import com.oracle.example.department.exception.NotFoundException;
import com.oracle.example.department.exception.UnprocessableEntityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/accounts")
public class AccountResource {

    private static final Logger LOG = LoggerFactory.getLogger(AccountResource.class);

    @Autowired
    IAccountOperationService accountOperationService;

    @Autowired
    IAccountQueryService accountQueryService;

    @RequestMapping(value = "/{accountId}", method = RequestMethod.GET)
    public ResponseEntity<?> getAccountDetails(@PathVariable("accountId") String accountId) {
        try {
            return ResponseEntity.ok(this.accountQueryService.getAccountDetails(accountId));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
    }

    @RequestMapping(value = "/{accountId}/withdraw", method = RequestMethod.POST)
    public ResponseEntity<?> withdraw(@PathVariable("accountId") String accountId, @RequestParam("amount") double amount) {
        try {
            this.accountOperationService.withdraw(accountId, amount);
            return ResponseEntity.ok("Amount withdrawn from the account");
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnprocessableEntityException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(e.getMessage());
        } catch (Exception e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
    }

    @RequestMapping(value = "/{accountId}/deposit", method = RequestMethod.POST)
    public ResponseEntity<?> deposit(@PathVariable("accountId") String accountId, @RequestParam("amount") double amount) {
        try {
            this.accountOperationService.deposit(accountId, amount);
            return ResponseEntity.ok("Amount deposited to the account");
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
    }
}
