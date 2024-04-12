package com.oracle.example.teller.entity;

import lombok.Data;

@Data
public class Transfer {
    private String from;
    private String to;
    private double amount;
}