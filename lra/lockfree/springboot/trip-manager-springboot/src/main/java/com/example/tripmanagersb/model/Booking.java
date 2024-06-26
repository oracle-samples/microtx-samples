/*
Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data
(collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the
Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell,
offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be
included in all copies or substantial portions of the Software. **

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
 
package com.example.tripmanagersb.model;

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
                if (curBooking != null) {
                    curBooking.merge(childBooking);
                }
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
