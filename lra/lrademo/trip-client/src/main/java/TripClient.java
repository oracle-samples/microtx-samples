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

import com.fasterxml.jackson.databind.ObjectMapper;
import model.Booking;
import model.BookingResponse;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Response;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TripClient {
    static ObjectMapper objectMapper = new ObjectMapper();
    private static String TRIP_SERVICE_BASE_URL;
    private static final String ORACLE_TMM_TX_TOKEN = "Oracle-Tmm-Tx-Token";

    private static final Logger logger = Logger.getLogger(TripClient.class.getName());

    public static void main(String[] args) throws Exception {
        String serviceHost = System.getProperty("trip.service.http.host", "localhost");
        int servicePort = Integer.getInteger("trip.service.http.port", 8081);

        String accessToken = System.getenv("ACCESS_TOKEN");
        String refreshToken = System.getenv("REFRESH_TOKEN");
        if (accessToken != null) {
            accessToken = "Bearer " + accessToken;
        }
        String tripServiceURL = System.getenv("TRIP_SERVICE_URL");
        if (tripServiceURL != null && !tripServiceURL.isEmpty()) {
            TRIP_SERVICE_BASE_URL = tripServiceURL;
        } else {
            TRIP_SERVICE_BASE_URL = "http://" + serviceHost + ":" + servicePort + "/trip-service/api/trip";
        }

        TripClient tripClient = new TripClient();

        // show banner
        boolean makeBooking = true;
        System.out.println(
                "***********************************************************************************************************************");
        System.out.println(
                "************************************************  TRIP BOOKING SERVICE ************************************************");
        System.out.println(
                "***********************************************************************************************************************");
        System.out.println(
                "\nWelcome to the Trip Booking Service. This service books a trip which includes a Hotel booking and a Flight booking.\n");
        System.out.println(
                "[Successful Trip Booking]: A successful trip booking involves two steps - 1) A System generated Provisional Booking followed by 2) A User Confirmation/Cancellation Step.\n");
        System.out.println(
                "[Failed Trip Booking]: A Provisional Booking can fail if any or both of Hotel and Flight booking fail. In such scenarios, the Trip Booking will get automatically cancelled\n"
                        +
                        "and any associated Provisional booking will also get automatically cancelled.\n");

        makeBooking = getConfirmation("Do you want to proceed ? (y) / (n)", "y");
        if (!makeBooking) {
            System.out.println("Bye");
            System.exit(0);
        }

        BookingResponse bookingResponse = tripClient.bookTrip("Hilton", "AA2250", "RH456", accessToken, refreshToken);
        Booking booking = bookingResponse.getBooking();
        if (booking == null)
            return;

        System.out.printf("%nProvisional Trip Booking Info:%n\t%s%n", booking);

        Arrays.stream(booking.getDetails()).forEach(b -> System.out.printf("\tAssociated Booking: %s%n", b));

        if (booking.getStatus() == Booking.BookingStatus.FAILED
                || booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            System.out.println(
                    "\nBOOKING FAILURE - Provisional Trip Booking failed because an associated booking failed. Trip Booking is cancelled.");
            boolean confirm = false;
            showAnimation(confirm);
            Booking failedBooking = tripClient.getTrip(booking.getId(), accessToken, refreshToken);

            System.out.printf("%nFinal Trip Booking Info:%n\t%s%n", failedBooking);
            Arrays.stream(failedBooking.getDetails()).forEach(b -> System.out.printf("\tAssociated Booking: %s%n", b));
            System.exit(0);
        }

        boolean cancel = false;
        if (args.length == 0) {
            System.out.println(
                    "\nBOOKING SUCCESS - Provisional Booking successful. At this point you can confirm or cancel the booking.");
            System.out.println("Confirm Booking (y) / (n) ?");
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            String input = reader.readLine();
            if (input != null) {
                cancel = input.equals("n");
            }
            reader.close();
        } else if (args[0].equals("cancel")) {
            cancel = true;
        }

        System.out.println("You confirmed your booking: " + !cancel);

        Booking response = (cancel)
                ? tripClient.cancelTrip(booking.getId(), accessToken, refreshToken, bookingResponse.getOracleTmmTxToken())
                : tripClient.confirmTrip(booking.getId(), accessToken, refreshToken ,bookingResponse.getOracleTmmTxToken());

        showAnimation(!cancel);

        response = tripClient.getTrip(booking.getId(), accessToken, refreshToken);


        if (response != null) {
            System.out.printf("%nFinal Trip Booking Info:%n\t%s%n", response);
            Arrays.stream(response.getDetails()).forEach(b -> System.out.printf("\tAssociated Booking: %s%n", b));
        } else {
            System.out.printf("%nBooking information not found%n");
        }
    }

    private static void showAnimation(boolean confirm) throws IOException, InterruptedException {
        String anim = "|/-\\";
        for (int x = 0; x < 200; x++) {
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

    private static boolean getConfirmation(String confirmationMsg, String confirmationChoice) throws IOException {
        boolean confirm = true;
        System.out.println(confirmationMsg);
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        confirm = reader.readLine().equals(confirmationChoice);
        return confirm;
    }

    private WebTarget getTripTarget() {
        return ClientBuilder.newClient().target(TRIP_SERVICE_BASE_URL);
    }

    private BookingResponse bookTrip(String hotelName, String flightNumber, String altFlightNumber, String accessToken, String refreshToken)
            throws Exception {
        StringBuilder tripRequest = new StringBuilder(TRIP_SERVICE_BASE_URL)
                .append("/?")
                .append("hotelName").append('=').append(hotelName).append('&')
                .append("flightNumber").append('=').append(flightNumber);

        URL url = new URL(tripRequest.toString());
        return makeRequest(url, "POST", "", accessToken, refreshToken);
    }

    private Booking getTrip(String bookingId, String accessToken, String refreshToken) throws Exception {
        WebTarget webTarget = getTripTarget().path("/").path(bookingId);
        Builder requestBuilder = webTarget.request();
        if(accessToken != null){
            requestBuilder.header("authorization", accessToken);
        }
        if(refreshToken != null){
            requestBuilder.header("refresh-token", accessToken);
        }
        Response response = requestBuilder.get();
        if (response.getStatus() != Response.Status.OK.getStatusCode()) {
            response.close();
            return null;
        }

        return response.readEntity(Booking.class);
    }

    private Booking confirmTrip(String bookingId, String accessToken, String refreshToken, String oracleTransactionToken) throws Exception {
        WebTarget webTarget = getTripTarget().path("/").path(bookingId);
        Builder requestBuilder = webTarget.request();
        String lraId = new String(Base64.getDecoder().decode(bookingId.getBytes(StandardCharsets.UTF_8)));
        requestBuilder.header("Long-Running-Action", lraId);

        if(accessToken != null){
            requestBuilder.header("authorization", accessToken);
        }
        if(refreshToken != null){
            requestBuilder.header("refresh-token", accessToken);
        }
        if(oracleTransactionToken != null){
            requestBuilder.header(ORACLE_TMM_TX_TOKEN, oracleTransactionToken);
        }
        Response response = requestBuilder.put(Entity.text(""));
        if (response.getStatus() != Response.Status.OK.getStatusCode()) {
            response.close();
            return null;
        }
        return response.readEntity(Booking.class);
    }

    private Booking cancelTrip(String bookingId, String accessToken, String refreshToken, String oracleTransactionToken) throws Exception {
        WebTarget webTarget = getTripTarget().path("/").path(bookingId);
        Builder requestBuilder = webTarget.request();
        String lraId = new String(Base64.getDecoder().decode(bookingId.getBytes(StandardCharsets.UTF_8)));
        requestBuilder.header("Long-Running-Action", lraId);
        if(accessToken != null){
            requestBuilder.header("authorization", accessToken);
        }
        if(refreshToken != null){
            requestBuilder.header("refresh-token", accessToken);
        }
        if(oracleTransactionToken != null){
            requestBuilder.header(ORACLE_TMM_TX_TOKEN, oracleTransactionToken);
        }
        Response response = requestBuilder.delete();
        if (response.getStatus() != Response.Status.OK.getStatusCode()) {
            response.close();
            return null;
        }

        return null;
    }

    private BookingResponse makeRequest(URL resource, String method, String jsonBody, String accessToken, String refreshToken) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) resource.openConnection();

        try (AutoCloseable ac = connection::disconnect) {

            connection.setDoOutput(true);
            connection.setRequestMethod(method);
            connection.setRequestProperty("Content-Type", "application/json");
            if(accessToken != null){
                connection.setRequestProperty("authorization", accessToken);
            }
            if(refreshToken != null){
                connection.setRequestProperty("refresh-token", refreshToken);
            }
            try (DataOutputStream dos = new DataOutputStream(connection.getOutputStream())) {
                dos.writeBytes(jsonBody);
            }

            int responseCode = connection.getResponseCode();

            InputStream ins = null;
            try {
                if (responseCode >= 400) {
                    ins = connection.getErrorStream();
                } else {
                    ins = connection.getInputStream();
                }
                Scanner responseScanner = new Scanner(ins).useDelimiter("\\A");
                String res = responseScanner.hasNext() ? responseScanner.next() : null;

                if (res != null && responseCode >= 400) {
                    System.err.printf("Error occurred with request: (%s) '%s', error:%n%s%n",
                            method, resource, res);
                    // return null;
                }
                return new BookingResponse(objectMapper.readValue(res, Booking.class), getOracleTmmTxToken(connection));
            } catch (IOException ex) {
                throw ex;
            } finally {
                try {
                    if (ins != null) {
                        ins.close();
                    }
                } catch (IOException ex) {
                    logger.log(Level.SEVERE, ex.getLocalizedMessage());
                }
            }
        }
    }

    private String getOracleTmmTxToken(HttpURLConnection connection) {
        List<String> headerValue = connection.getHeaderFields().getOrDefault(ORACLE_TMM_TX_TOKEN, null);
        if(headerValue==null){
            headerValue = connection.getHeaderFields().getOrDefault(ORACLE_TMM_TX_TOKEN.toLowerCase(), null);
        }
        return headerValue!=null && headerValue.size() > 0 ? headerValue.get(0) : null;
    }
}