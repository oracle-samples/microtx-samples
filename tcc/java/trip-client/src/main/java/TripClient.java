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
import model.ErrorResponse;
import model.TripBooking;

import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.Invocation.Builder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Objects;

public class TripClient {
    private static String TRAVEL_AGENT_SERVICE_BASE_URL;

    public static void main(String[] args) throws Exception {
        String serviceHost = System.getProperty("travel.agent.http.host", "localhost");
        int servicePort = Integer.getInteger("travel.agent.http.port", 8080);

        String accessToken = System.getenv("ACCESS_TOKEN");
        String refreshToken = System.getenv("REFRESH_TOKEN");
        if (accessToken != null) {
            accessToken = "Bearer " + accessToken;
        }
        String travelAgentServiceURL = System.getenv("TRAVEL_AGENT_SERVICE_URL");
        if (travelAgentServiceURL != null && !travelAgentServiceURL.isEmpty()) {
            TRAVEL_AGENT_SERVICE_BASE_URL = travelAgentServiceURL;
        } else {
            TRAVEL_AGENT_SERVICE_BASE_URL = "http://" + serviceHost + ":" + servicePort + "/travel-agent/api/";
        }

        // show banner
        boolean makeBooking = true;
        System.out.println(
                "***********************************************************************************************************************");
        System.out.println(
                "************************************************  TRAVEL AGENT SERVICE ************************************************");
        System.out.println(
                "***********************************************************************************************************************");
        System.out.println(
                "\nWelcome to the Travel Agent Service. This service books a trip which includes a Hotel booking and a Flight booking.\n");
        System.out.println(
                "[Successful Trip Booking]: A successful trip booking involves two steps - 1) Travel Agent reserves the resources followed by 2) A User Confirmation/Cancellation Step.\n");
        System.out.println(
                "[Failed Trip Booking]: Trip booking can fail if any or both of Hotel and Flight reservation fail. In such scenarios, the Trip Booking will get automatically cancelled\n"
                        +
                        "and any associated reservations will also get automatically cancelled.\n");

        makeBooking = getConfirmation("Do you want to proceed ? (y) / (n)", "y");
        if (!makeBooking) {
            System.out.printf("\nBye\n");
            System.exit(0);
        }

        Response tripReservationApiResponse = null;
        Response bookingDetailsResponse = null;
        Response confirmCancelResponse = null;
        String tccTransactionLinkHeader = null;
        try {
            tripReservationApiResponse = TripReservation("Hilton", "AA2250", accessToken, refreshToken);
            if (tripReservationApiResponse.getStatus() == Response.Status.OK.getStatusCode()) {
                tccTransactionLinkHeader = tripReservationApiResponse.getHeaderString("link");
                TripBooking tripReservationResponse = tripReservationApiResponse.readEntity(TripBooking.class);
                PrintReservedBookingDetails(tripReservationResponse);
                boolean confirm = false;
                System.out.println("\nBOOKING SUCCESS - successfully reserved the hotel and flight resources. At this point you can confirm or cancel the booking.");
                confirm = getConfirmation("Confirm Booking ? (y) / (n) ?", "y");
                System.out.println(String.format("You selected to %s the booking", (confirm) ? "confirm" : "cancel"));

                confirmCancelResponse = (confirm)
                        ? ConfirmTrip(tripReservationResponse.getTripBookingId(), tccTransactionLinkHeader, accessToken, refreshToken)
                        : CancelTrip(tripReservationResponse.getTripBookingId(), tccTransactionLinkHeader, accessToken, refreshToken);

                if (confirmCancelResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                    ErrorResponse errorResponse = confirmCancelResponse.readEntity(ErrorResponse.class);
                    System.out.printf("\nFailed to %s the booking [ %s ].\n", (confirm) ? "confirm" : "cancel", errorResponse.getMessage());
                    System.exit(0);
                }
                showAnimation(confirm);
                bookingDetailsResponse = GetTripDetails(tripReservationResponse.getTripBookingId(), accessToken, refreshToken);
                if (bookingDetailsResponse.getStatus() == Response.Status.OK.getStatusCode()) {
                    TripBooking bookingDetails = bookingDetailsResponse.readEntity(TripBooking.class);
                    PrintFinalBookingDetails(bookingDetails);
                } else {
                    ErrorResponse errorResponse = bookingDetailsResponse.readEntity(ErrorResponse.class);
                    System.out.printf("\nFailed to retrieve the trip details of booking id [ %s ].\n", errorResponse.getMessage());
                    System.exit(0);
                }
            } else {
                ErrorResponse errorResponse = tripReservationApiResponse.readEntity(ErrorResponse.class);
                System.out.println("\nBOOKING FAILURE - Trip Booking failed because an associated booking reservation failed. Trip Booking is cancelled.");
                System.out.printf("\tReason : [ %s ] \n", errorResponse.getMessage());
                System.exit(0);
            }
        } finally {
            if (Objects.nonNull(tripReservationApiResponse)) {
                tripReservationApiResponse.close();
            }
            if (Objects.nonNull(bookingDetailsResponse)) {
                bookingDetailsResponse.close();
            }
            if (Objects.nonNull(confirmCancelResponse)) {
                bookingDetailsResponse.close();
            }
        }
    }

    private static WebTarget getTripTarget() {
        return ClientBuilder.newClient().target(TRAVEL_AGENT_SERVICE_BASE_URL);
    }

    private static Response TripReservation(String hotelName, String flightNumber, String accessToken, String refreshToken) throws Exception {
        WebTarget webTarget = getTripTarget().path("bookings").path("reserve").queryParam("hotelName", hotelName).queryParam("flightNumber", flightNumber);
        Builder requestBuilder = webTarget.request();
        requestBuilder.header("Accept", "application/json");
        if (accessToken != null) {
            requestBuilder.header("authorization", accessToken);
        }
        if (refreshToken != null) {
            requestBuilder.header("refresh-token", accessToken);
        }
        Response response = requestBuilder.post(null);
        return response;
    }

    private static Response ConfirmTrip(String bookingId, String tccTransactionLinkHeader, String accessToken, String refreshToken) throws Exception {
        WebTarget webTarget = getTripTarget().path("/confirm").path(bookingId);
        Builder requestBuilder = webTarget.request();
        requestBuilder.header("Accept", "application/json");
        requestBuilder.header("link", tccTransactionLinkHeader);

        if (accessToken != null) {
            requestBuilder.header("authorization", accessToken);
        }
        if (refreshToken != null) {
            requestBuilder.header("refresh-token", accessToken);
        }

        return requestBuilder.put(Entity.json(""));
    }

    private static Response CancelTrip(String bookingId, String tccTransactionLinkHeader, String accessToken, String refreshToken) throws Exception {
        WebTarget webTarget = getTripTarget().path("/cancel").path(bookingId);
        Builder requestBuilder = webTarget.request();
        requestBuilder.header("Accept", "application/json");
        requestBuilder.header("link", tccTransactionLinkHeader);

        if (accessToken != null) {
            requestBuilder.header("authorization", accessToken);
        }
        if (refreshToken != null) {
            requestBuilder.header("refresh-token", accessToken);
        }
        return requestBuilder.delete();
    }

    private static Response GetTripDetails(String bookingId, String accessToken, String refreshToken) throws Exception {
        WebTarget webTarget = getTripTarget().path("/bookings").path(bookingId);
        Builder requestBuilder = webTarget.request();
        if (accessToken != null) {
            requestBuilder.header("authorization", accessToken);
        }
        if (refreshToken != null) {
            requestBuilder.header("refresh-token", accessToken);
        }
        return requestBuilder.get();
    }

    private static boolean getConfirmation(String confirmationMsg, String confirmationChoice) throws IOException {
        boolean confirm = true;
        System.out.println(confirmationMsg);
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String userInput = reader.readLine();
        if (!(userInput.equals("y") || userInput.equals("n"))) {
            System.out.println("Invalid user input. User entered " + userInput);
            System.out.println("Exiting..");
            System.exit(0);
        }
        confirm = userInput.equals(confirmationChoice);
        return confirm;
    }

    private static void PrintReservedBookingDetails(TripBooking booking) {
        System.out.printf("\n%s\n", "*".repeat(30));
        System.out.printf("Trip Booking Reservation Info:\n");
        System.out.println("*".repeat(30));
        PrintBookingDetails(booking);
    }

    private static void PrintFinalBookingDetails(TripBooking booking) {
        System.out.printf("\n%s\n", "*".repeat(24));
        System.out.printf("Final Trip Booking Info:\n");
        System.out.println("*".repeat(24));
        PrintBookingDetails(booking);
    }

    private static void PrintBookingDetails(TripBooking booking) {
        System.out.printf("\tBooking ID : %s\n", booking.getTripBookingId());
        System.out.printf("\tBooking Status : %s\n", booking.getStatus());
        System.out.printf("\tBooking Info : %s\n", booking.getMessage());
        System.out.printf("\tAssociated Booking Info : \n");
        System.out.printf("\t\tHotel Booking : [ Booking ID : %s , Hotel Name : %s ]\n", booking.getHotelBooking().getBookingId(), booking.getHotelBooking().getName());
        System.out.printf("\t\tAssociated Flight Booking : [ Booking ID : %s, Flight Number: %s ]\n", booking.getFlightBooking().getBookingId(), booking.getFlightBooking().getName());
    }

    private static void showAnimation(boolean confirm) throws IOException, InterruptedException {
        String anim = "|/-\\";
        for (int x = 0; x < 100; x++) {
            // String data = "\r" + anim.charAt(x % anim.length()) + " " + x;
            String data = "\r" + anim.charAt(x % anim.length()) + " ";
            if (x == 15) {
                System.out.println((confirm ? "Confirming" : "Cancelling") + " your booking ...");
            }
            if (x == 50) {
                System.out.println("Fetching Final Booking Status ...");
            }
            System.out.write(data.getBytes());
            Thread.sleep(10);
        }
    }

}
