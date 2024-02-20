## About
TMM LRA demo , demonstration of a Java microservice for trip management built on the SpringBoot framework.
Default TRM LRA coordinator URL is "http://localhost:9000/api/v1/lra-coordinator"

### Trip-Manager service information
This trip-manager application exposes two REST endpoints. Both endpoint business logic remains same, while only difference is with the order of calling the LRA participants for booking.

| Endpoint    | Resource Class              | Description                                          |
| --------- |-----------------------------|------------------------------------------------------|
| `/trip-service/api` | TripManagerResourceAsync.java | Call LRA particiapnts Hotel and Flight asynchronously |
| `/trip-service/api/sync` | TripManagerResource.java    | Call LRA particiapnts Hotel and Flight sequentially  |

##### Below configurations are required to use Spring Boot @Async feature and call the participants asynchronously

#### <u> Executor Configuration </u>

Since Spring Boot `@Async` methods executes in isolated thread, we need to explicitly set the LRA context within executor thread by implementing `TaskDecorator` interface and initializing it in executor configuration.
There is a predefined TaskDecorator already present int MicroTx library for this purpose. It is present under package `com.oracle.microtx.springboot.lra.context` and `MicroTxTaskDecorator` is the decorator class. 

Custom `named` bean has to be defined for executor configuration to avoid conflicting with other executor configurations and `MicroTxTaskDecorator` task decorator has to be set. Refer to `AsyncConfiguration.java`
```
@Bean(name = "taskExecutorForTripBooking")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        ...
        executor.setTaskDecorator(new MicroTxTaskDecorator());
        ...
        return executor;
    }
```
Note: If there is already a user defined task decorator present with some logic and needed to be used in same `Executor` config, then user can override the `MicroTxTaskDecorator` and accommodate along with the changes or refer to `MicroTxTaskDecorator` class and make the same changes in your custom task decorator. 

LRA specific methods which are marked `@Async` should use the executor with the exact `bean name`. In this instance, the bean name is `@Bean(name = "taskExecutorForTripBooking")`
Refer to `BookingServiceImpl.java`

```
@Async(value = "taskExecutorForTripBooking")
public CompletableFuture bookHotel(String name, String id) {
    ...
}

@Async(value = "taskExecutorForTripBooking")
public CompletableFuture bookFlight(String flightNumber, String id) {
    ...
}
```


#### NOTE: If the LRA Initiator (trip-manager) is calling LRA participants (Hotel and Flight) in sequential order, above Executor configuration is not required. Please refer to `TripManagerResource.java`

## Quick Start
To run build:

```
mvn clean package
```

To run the application:
```
java -jar target/trip-manager-sb.jar
```
To run the application with different TRM coordinator assign the URL to mp.lra.coordinator.url system variable:
```
java -jar -Dmp.lra.coordinator.url=<url> trip-manager.jar
```
To create a docker image:
```
docker image build -t=<image_name> .
```
To run the docker image:
```
docker container run <image_name>
```
To run the docker image with different TRM coordinator assign the URL to MP_LRA_COORDINATOR_URL environment variable:
```
docker container run -e MP_LRA_COORDINATOR_URL=<URL> <image_name>
```
