package com.example.docprocess.mcpserver;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.Region;
import com.oracle.bmc.aivision.model.*;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.aivision.AIServiceVisionClient;
import com.oracle.bmc.aivision.requests.AnalyzeImageRequest;
import com.oracle.bmc.aivision.requests.CreateImageJobRequest;
import com.oracle.bmc.aivision.requests.GetImageJobRequest;
import com.oracle.bmc.aivision.responses.AnalyzeImageResponse;
import com.oracle.bmc.aivision.responses.CreateImageJobResponse;
import com.oracle.bmc.aivision.responses.GetImageJobResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class OciVisionTextExtraction {

    public static void main(String[] args) {
        //String preAuthUrl = "https://objectstorage.us-ashburn-1.oraclecloud.com/p/cItYmC9mAKXNOl2Sw5DXrobjAMm0IKXSfvrPY5VevqUwiZvllWRyhYVEPFc1chq_/n/oabcs1/b/microtx-conductor/o/Californian_sample_driver%27s_license,_c._2019%20copy.jpg";
        String preAuthUrl = "https://objectstorage.us-chicago-1.oraclecloud.com/p/tevpGQWDCIbUlIUI5i-aFe6lOVrNxShwDcE9BanXM2fQChqnYfNfLLD0G2gxktrh/n/oabcs1/b/microtx-conductor/o/Californian_sample_driver%27s_license,_c._2019-1.jpeg";
        String content = "";
        try {
            content = readFromPreAuthUrl(preAuthUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }

        String configurationFilePath = "~/.oci/config";
        String profile = "US_CHICAGO";

        String compartmentId = "ocid1.tenancy.oc1..aaaaaaaak4im7gb2b3z7rdlas4uogaxyhgm5wrd66fpmtl3z6qzfulla6yca";
        String namespaceName = "oabcs1";
        String bucketName = "microtx-conductor";
        String objectName = "Californian_sample_driver's_license,_c._2019-1.jpeg";

        // --- Authentication ---
        AuthenticationDetailsProvider provider;
        try {
            provider = new ConfigFileAuthenticationDetailsProvider(configurationFilePath, profile);
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        byte[] bytes;
        try {
            bytes = Files.readAllBytes(Paths.get("/Users/pruthvithej/Downloads/Californian_sample_driver_license.jpeg"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        ObjectStorageImageDetails img = new ObjectStorageImageDetails(namespaceName, bucketName, objectName);

        /* Create a service client */
        AIServiceVisionClient client = AIServiceVisionClient.builder().build(provider);

        List<ImageFeature> features = new ArrayList<>();
        ImageFeature textDetectImageFeature = ImageTextDetectionFeature.builder().build();
        features.add(textDetectImageFeature);

        InlineImageDetails inlineImageDetails = InlineImageDetails.builder().data(bytes).build();

        /* Create a request and dependent object(s). */
        AnalyzeImageDetails analyzeImageDetails = AnalyzeImageDetails.builder()
                //.features(new ArrayList<>(Arrays.asList(ImageTextDetectionFeature.builder()
                   //     .language(DocumentLanguage.Eng).build())))
                .features(features)
                //.image(InlineImageDetails.builder()
                  //      .data(Base64.getEncoder().encodeToString(content.getBytes()).getBytes()).build())
                //.image(inlineImageDetails)
                .image(img)
                .compartmentId(compartmentId).build();

        AnalyzeImageRequest analyzeImageRequest = AnalyzeImageRequest.builder()
                .analyzeImageDetails(analyzeImageDetails)
                //.opcRequestId(UUID.randomUUID().toString())
                .build();

        /* Send request to the Client */
        AnalyzeImageResponse response = client.analyzeImage(analyzeImageRequest);

        // Parse response
        ObjectMapper mapper = new ObjectMapper();
        mapper.setFilterProvider(new SimpleFilterProvider().setFailOnUnknownId(false));

        String json = null;
        try {
            json = mapper.writeValueAsString(response.getAnalyzeImageResult());
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        System.out.println("AnalyzeImage Result");
        System.out.println(json);
    }

    public static void main3(String[] args) throws Exception {

        String configurationFilePath = "~/.oci/config";
        String profile = "US_CHICAGO";

        String compartmentId = "ocid1.tenancy.oc1..aaaaaaaak4im7gb2b3z7rdlas4uogaxyhgm5wrd66fpmtl3z6qzfulla6yca";
        String namespaceName = "oabcs1";
        String bucketName = "microtx-conductor";
        String objectName = "path/to/your/image.jpg";

        // --- Authentication ---
        AuthenticationDetailsProvider provider;
        try {
            provider = new ConfigFileAuthenticationDetailsProvider(configurationFilePath, profile);
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        //String preAuthUrl = "https://objectstorage.us-ashburn-1.oraclecloud.com/p/cItYmC9mAKXNOl2Sw5DXrobjAMm0IKXSfvrPY5VevqUwiZvllWRyhYVEPFc1chq_/n/oabcs1/b/microtx-conductor/o/Californian_sample_driver%27s_license,_c._2019%20copy.jpg";
        String preAuthUrl = "https://objectstorage.us-chicago-1.oraclecloud.com/p/tevpGQWDCIbUlIUI5i-aFe6lOVrNxShwDcE9BanXM2fQChqnYfNfLLD0G2gxktrh/n/oabcs1/b/microtx-conductor/o/Californian_sample_driver%27s_license,_c._2019-1.jpeg";
        String content = "";
        try {
            content = readFromPreAuthUrl(preAuthUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }

        /* Create a service client */
        AIServiceVisionClient client = AIServiceVisionClient.builder().build(provider);

        /* Create a request and dependent object(s). */
        AnalyzeImageDetails analyzeImageDetails = AnalyzeImageDetails.builder()
                .features(new ArrayList<>(Arrays.asList(ImageTextDetectionFeature.builder()
                        .language(DocumentLanguage.Deu).build())))
                .image(InlineImageDetails.builder()
                        .data(content.getBytes())
                        .build())
                .compartmentId(compartmentId).build();

        AnalyzeImageRequest analyzeImageRequest = AnalyzeImageRequest.builder()
                .analyzeImageDetails(analyzeImageDetails)
                .opcRequestId("KS1UVTQI0K6SUX9P40DM12").build();

        /* Send request to the Client */
        AnalyzeImageResponse response = client.analyzeImage(analyzeImageRequest);
        System.out.println(response.getAnalyzeImageResult());
    }

    public static String readFromPreAuthUrl(String preAuthUrl) throws Exception {
        URL url = new URL(preAuthUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        // Optional: handle redirects, timeouts, etc.
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);

        int responseCode = connection.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new RuntimeException("Failed to fetch file. HTTP error code: " + responseCode);
        }

        // Read the content
        StringBuilder content = new StringBuilder();
        try (InputStream inputStream = connection.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {

            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
        }

        return content.toString();
    }

    public static void main1(String[] args) throws IOException, InterruptedException {
        String configurationFilePath = "~/.oci/config";
        String profile = "US_CHICAGO";

        String compartmentId = "ocid1.tenancy.oc1..aaaaaaaak4im7gb2b3z7rdlas4uogaxyhgm5wrd66fpmtl3z6qzfulla6yca";
        String namespaceName = "oabcs1";
        String bucketName = "microtx-conductor";
        String objectName = "path/to/your/image.jpg";

        // --- Authentication ---
        AuthenticationDetailsProvider provider;
        try {
            provider = new ConfigFileAuthenticationDetailsProvider(configurationFilePath, profile);
        } catch (IOException e) {
            e.printStackTrace();
            return;
        }

        AIServiceVisionClient aiVisionClient = AIServiceVisionClient.builder().build(provider);
        System.out.println("Successfully initialized AI Vision Client.");
        System.out.println("Attempting to analyze image: " + namespaceName + "/" + bucketName + "/" + objectName);

        // --- Prepare Image Location Details ---
        ObjectLocation imageLocation = ObjectLocation.builder()
                .namespaceName(namespaceName)
                .bucketName(bucketName)
                .objectName(objectName)
                .build();

        // --- Prepare Feature Details (Text Detection) ---
        ImageTextDetectionFeature textDetectionFeature = ImageTextDetectionFeature.builder()
                //        .featureType(ImageTextDetectionFeature.FeatureType.TextDetection)
                //       .generateSearchablePdf(false) // Set to true if you need a searchable PDF
                .build();

        List<ImageFeature> features = new ArrayList<>();
        features.add(textDetectionFeature);

        // --- Prepare Analyze Image Details ---
        AnalyzeImageDetails analyzeImageDetails = AnalyzeImageDetails.builder()
                //.image(imageLocation) // For images in Object Storage
                .features(features)
                .compartmentId(compartmentId) // Required for AnalyzeImage
                .build();

        // --- Create and Send Analyze Image Request ---
        AnalyzeImageRequest analyzeImageRequest = AnalyzeImageRequest.builder()
                .analyzeImageDetails(analyzeImageDetails)
                .build();

        try {
            System.out.println("Sending request to Vision API...");
            AnalyzeImageResponse response = aiVisionClient.analyzeImage(analyzeImageRequest);
            System.out.println("Received response from Vision API.");

            // --- Process the Response ---
            if (response != null && response.getAnalyzeImageResult() != null) {
                System.out.println("\n--- Text Detection Results ---");
                if (response.getAnalyzeImageResult().getImageText() != null &&
                        response.getAnalyzeImageResult().getImageText().getLines() != null) {

                    for (Line line : response.getAnalyzeImageResult().getImageText().getLines()) {
                        System.out.println("Line: " + line.getText());
                        // You can also access individual words and their confidence scores
                        // for (Word word : line.getWords()) {
                        //     System.out.println("\tWord: " + word.getText() + " (Confidence: " + word.getConfidence() + ")");
                        // }
                    }
                } else {
                    System.out.println("No text detected or text detection was not requested/successful.");
                }

                // You can also get the full JSON response if needed
                // System.out.println("\nFull JSON Response:\n" + response.getAnalyzeImageResult().toString());

            } else {
                System.err.println("Failed to analyze image. Response or result was null.");
            }

        } catch (Exception e) {
            System.err.println("Error during OCI Vision API call: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // --- Close the client ---
            aiVisionClient.close();
            System.out.println("\nAI Vision Client closed.");
        }

        /*
        // --- ALTERNATIVE: For large files or when you need asynchronous processing, use CreateImageJob ---
        // This is more robust for larger images or when you don't want to wait for immediate results.

        System.out.println("\n--- Using CreateImageJob (Asynchronous) ---");
        AIServiceVisionClient asyncAiVisionClient = AIServiceVisionClient.builder().build(provider);
        // asyncAiVisionClient.setRegion(Region.US_ASHBURN_1); // Set region if needed

        try {
            ObjectLocation inputImgLocation = ObjectLocation.builder()
                    .namespaceName(namespaceName)
                    .bucketName(bucketName)
                    .objectName(objectName)
                    .build();

            InputLocation inputLocation = InputLocation.builder()
                    .sourceType(InputLocation.SourceType.ObjectListInlineInputLocation) // Or ObjectListInlineInputLocation for multiple
                    .objectLocations(java.util.Collections.singletonList(inputImgLocation))
                    .build();

            // Define where the output JSON will be stored
            OutputLocation outputLocation = OutputLocation.builder()
                    .namespaceName(namespaceName)
                    .bucketName(bucketName) // Can be the same or a different bucket
                    .prefix("vision_output/" + System.currentTimeMillis() + "/") // Prefix for output files in the bucket
                    .build();

            ImageTextDetectionFeature textFeatureForJob = ImageTextDetectionFeature.builder()
                .featureType(ImageTextDetectionFeature.FeatureType.TextDetection)
                .build();
            List<ImageFeature> featuresForJob = new ArrayList<>();
            featuresForJob.add(textFeatureForJob);


            CreateImageJobDetails createImageJobDetails = CreateImageJobDetails.builder()
                    .compartmentId(compartmentId)
                    .inputLocation(inputLocation)
                    .features(featuresForJob)
                    .outputLocation(outputLocation)
                    .displayName("MyTextExtractionJob_" + System.currentTimeMillis())
                    .isZipOutputEnabled(false) // Set to true if you want results zipped
                    .build();

            CreateImageJobRequest createImageJobRequest = CreateImageJobRequest.builder()
                    .createImageJobDetails(createImageJobDetails)
                    .build();

            System.out.println("Submitting Image Job...");
            CreateImageJobResponse createImageJobResponse = asyncAiVisionClient.createImageJob(createImageJobRequest);
            String jobId = createImageJobResponse.getImageJob().getId();
            System.out.println("Image Job submitted with ID: " + jobId);
            System.out.println("Opc-request-id: " + createImageJobResponse.getOpcRequestId());


            // --- Poll for Job Completion ---
            ImageJob.LifecycleState jobState;
            GetImageJobResponse getImageJobResponse;
            int maxPolls = 20; // Approx 10 minutes if 30s sleep
            int pollCount = 0;

            do {
                System.out.println("Polling job status... (Attempt " + (pollCount + 1) + ")");
                TimeUnit.SECONDS.sleep(30); // Wait before polling again
                getImageJobResponse = asyncAiVisionClient.getImageJob(GetImageJobRequest.builder().imageJobId(jobId).build());
                jobState = getImageJobResponse.getImageJob().getLifecycleState();
                System.out.println("Job Status: " + jobState);
                pollCount++;
            } while (jobState == ImageJob.LifecycleState.InProgress ||
                     jobState == ImageJob.LifecycleState.Accepted ||
                     jobState == ImageJob.LifecycleState.Creating && pollCount < maxPolls);


            if (jobState == ImageJob.LifecycleState.Succeeded) {
                System.out.println("Image Job Succeeded!");
                System.out.println("Output should be available at: " + outputLocation.getNamespaceName() + "/" + outputLocation.getBucketName() + "/" + outputLocation.getPrefix());
                // You would then typically download the JSON result from the outputLocation in Object Storage
                // and parse it to get the text details. The structure of this JSON is detailed in the OCI Vision documentation.
                // For example, the result might be a file named something like:
                // vision_output/timestamp/your_image_name_TEXT_DETECTION.json

            } else {
                System.err.println("Image Job did not succeed. Final state: " + jobState);
                if (getImageJobResponse.getImageJob().getLifecycleDetails() != null) {
                    System.err.println("Details: " + getImageJobResponse.getImageJob().getLifecycleDetails());
                }
            }

        } catch (Exception e) {
            System.err.println("Error during OCI Vision Job creation/polling: " + e.getMessage());
            e.printStackTrace();
        } finally {
            asyncAiVisionClient.close();
            System.out.println("\nAsync AI Vision Client closed.");
        }
        */
    }
}
