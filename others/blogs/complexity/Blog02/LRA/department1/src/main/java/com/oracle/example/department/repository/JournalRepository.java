package com.oracle.example.department.repository;

import com.oracle.example.department.entity.Journal;
import org.springframework.data.jpa.repository.JpaRepository;


public interface JournalRepository extends JpaRepository<Journal, Long> {

    /**
     * Get Journal data from LRA ID
     * @param lraId
     * @param journalType
     * @return Journal object
     */
    Journal findJournalByLraIdAndJournalType(String lraId, String journalType);
}
