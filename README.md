# microtx-samples

Oracle Transaction Manager for Microservices (MicroTx) enables enterprise users to adopt and increase use of microservices architecture for mission-critical applications by providing capabilities that make it easier to develop, deploy, and maintain data consistency in such applications. It manages transactions and provides consistency across polyglot microservices. It supports several distributed transaction protocols, such as XA, Eclipse MicroProfile Long Running Actions (Long Running Activity) and Try-Confirm/Cancel (TCC).

Running sample applications is the fastest way for you to get familiar with MicroTx. Sample applications are microservices that demonstrate how you can integrate your applications with MicroTx while using different transaction protocols. The code of the sample applications includes the MicroTx libraries. You can use the sample applications as a reference while using the MicroTx libraries with your custom applications.

## Documentation

See [Documentation set for Oracle Transaction Manager for Microservices](https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/index.html).

## Repository Structure for Sample Applications

Sample applications are microservices that demonstrate how you can develop your services for participating in different transaction protocols using MicroTx. MicroTx client libraries are already incorporated with the sample application code. You can use the sample applications as a reference while using the MicroTx libraries with your application.

This source repository contains code of the sample applications for MicroTx. Each sub-folder contains the sample application source code and a YAML file which contains the configuration details.

Directory | Description
------------ | -------------
[`docker/`](docker/) | YAML file where you must provide details to configure and deploy the sample applications in Docker Swarm environments.
[`lra/`](lra/) | Source files for the Trip Booking application, which consists of four microservices, and uses the Long Running Action (LRA) transaction protocol. This application demonstrates how you can use MicroTx to manage LRA transactions.
[`lra/nested/cinema-booking/`](nested/cinema-booking/) | Source files for the application that you can use to Book a Seat in a Cinema. This application demonstrates how XA transactions are nested within an LRA transaction. 
[`tcc/`](tcc/) | Source files for a Travel Agent application, which consists of several microservices, and uses the TCC transaction protocol. This application demonstrates how you can use MicroTx to manage TCC transactions.
[`xa/`](xa/) | Source files for a Banking application, which consists of Teller microservice and two Departments, and uses the XA transaction protocol. This application demonstrates how you can use MicroTx to manage XA transactions.

## Prerequisites

Ensure that you complete the prerequisite step before you install MicroTx and run the sample applications.

* Deploy the sample microservices in the same namespace in which you have installed MicroTx.

* Associate all the microservices with a single identity domain to share user definitions and authentication by using a common identity provider.

* The MicroTx uses a data store to maintain data about global transactions and transaction logs. Set up the data store or use local memory.

* The Banking application, which uses the XA transaction protocol, the participant microservices connect to resource managers, which are external services for the participant microservices. Set up the required resource managers for the application.

See [Plan](https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/22.3/tmmdg/plan.html#GUID-83380640-0A2A-4038-910D-7484C1A1D02E) and [Prepare](https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/22.3/tmmdg/prepare.html#GUID-E85CDBEA-69EF-470F-9CE1-711F5BD1A7A8).

## Install MicroTx

Install MicroTx in a Kubernetes cluster or Docker Swarm environment, and then run the sample applications in local environment, Kubernetes cluster, or Docker Swarm environments.

See [Workflow to Install and Use MicroTx](https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/22.3/tmmdg/oracle-transaction-manager-microservices.html#GUID-F6ED47D2-97FE-481E-A41E-C320A3611C0B).

## Contributing

This project welcomes contributions from the community. Before submitting a pull request, please [review our contribution guide](./CONTRIBUTING.md)

## Security

Please consult the [security guide](./SECURITY.md) for our responsible security vulnerability disclosure process

## License

Copyright (c) 2023 Oracle and/or its affiliates.

Released under the Universal Permissive License v1.0 as shown at
<https://oss.oracle.com/licenses/upl/>.
