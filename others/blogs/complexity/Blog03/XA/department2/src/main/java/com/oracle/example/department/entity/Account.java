package com.oracle.example.department.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "Accounts")
@Data
public class Account {

    @Column(name="account_id")
    @Id
    String accountId;

    @Column(name="name")
    String name;

    @Column(name="amount")
    double amount;
}

