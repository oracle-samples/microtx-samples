## Introduction

This is User Banking application, it integrates both customer banking and stock broker options at one place using the user interface with authencation.

## Docker
Build the docker image
```
docker image build --no-cache -t=user-banking .
```

User can use `build.sh` script as well to build the docker image. The script tags the built docker image and pushes it to container registry.
```
- Edit deploy.sh file in the current directory and update the <container-registry> host
- Execute the shell script with Tag version
    sh build.sh 1.0
  "1.0" refers to tag
```