package com.oracle.example.department.resource;

import com.oracle.example.department.data.IAccountOperationService;
import com.oracle.example.department.data.IAccountQueryService;
import com.oracle.example.department.entity.Journal;
import com.oracle.example.department.exception.NotFoundException;
import com.oracle.example.department.repository.JournalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountAdminService {

    private static final Logger LOG = LoggerFactory.getLogger(AccountAdminService.class);

    @Autowired
    IAccountOperationService accountService;

    @Autowired
    JournalRepository journalRepository;

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

    @RequestMapping(value = "/journals", method = RequestMethod.GET)
    public ResponseEntity<?> getAllJournals() {
        LOG.info("JOURNAL: Get all journals");
        try {
            return new ResponseEntity<>(journalRepository.findAll(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
