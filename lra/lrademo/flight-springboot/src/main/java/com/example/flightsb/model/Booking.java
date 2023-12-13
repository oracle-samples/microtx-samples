package com.example.flightsb.model;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;

public class Booking {
    private String id;
    private String name;
    private BookingStatus status;
    private String type;
    private Booking[] details;

    private static final Logger LOG = LoggerFactory.getLogger(Booking.class);

    public Booking() {
    }
    public Booking(String id, String name, String type, Booking... bookings) {
        this(id, name, type, BookingStatus.PROVISIONAL, bookings);
    }

    public Booking(String id, String name, String type, BookingStatus status, Booking[] details) {
        init(id, name, type, status, details);
    }

    public Booking(Booking booking) {
        this.init(booking.getId(), booking.getName(), booking.getType(), booking.getStatus(), null);
        details = new Booking[booking.getDetails().length];
        IntStream.range(0, details.length).forEach(i -> details[i] = new Booking(booking.getDetails()[i]));
    }

    private void init(String id, String name, String type, BookingStatus status, Booking[] details) {
        this.id = id;
        this.name = name == null ? "" : name;
        this.type = type == null ? "" : type;
        this.status = status;
        if(details !=null) {
            this.details = removeNullEnElements(details);
        }
    }

    private <T> T[] removeNullEnElements(T[] a) {
        List<T> list = new ArrayList<T>(Arrays.asList(a));
        list.removeAll(Collections.singleton(null));
        return list.toArray((T[]) Array.newInstance(a.getClass().getComponentType(), list.size()));
    }
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public Booking[] getDetails() {
        return details;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setDetails(Booking[] details) {
        this.details = details;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public boolean merge(Booking booking) {
        if (!id.equals(booking.getId())) {
            return false; // or throw an exception
        }
        this.name = booking.getName();
        this.status = booking.getStatus();
        if(booking.getDetails() != null) {
            for (Booking childBooking : booking.getDetails()) {
                Booking curBooking = Arrays.stream(this.details).filter(a -> a.id.equals(childBooking.id)).findFirst().orElse(null);
                if (curBooking != null) curBooking.merge(childBooking);
            }
        }
        return true;
    }
    public enum BookingStatus {
        CONFIRMED, CANCELLED, PROVISIONAL, CONFIRMING, CANCEL_REQUESTED, FAILED;
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", status=" + status +
                ", type='" + type + '\'' +
                ", details=" + Arrays.toString(details) +
                '}';
    }
}
