#!/usr/bin/env bash

set -o errexit
set -o errtrace
set -o nounset
set -o pipefail

pkill -9 -f spring-tripmanager || echo "Failed to kill any apps"

docker-compose kill || echo "No docker containers are running"

echo "Running infra"
docker-compose up -d grafana-server prometheus-server tracing-server

echo "Running apps"
mkdir -p target
nohup java -jar spring-tripmanager-config-server/target/*.jar --server.port=8888 --spring.profiles.active=chaos-monkey > target/config-server.log 2>&1 &
echo "Waiting for config server to start"
sleep 20
nohup java -jar spring-tripmanager-discovery-server/target/*.jar --server.port=8761 --spring.profiles.active=chaos-monkey > target/discovery-server.log 2>&1 &
echo "Waiting for discovery server to start"
sleep 20
nohup java -jar spring-tripmanager-trip-service/target/*.jar --server.port=8081 --spring.profiles.active=chaos-monkey > target/trip-service.log 2>&1 &
nohup java -jar spring-tripmanager-hotel-service/target/*.jar --server.port=8082 --spring.profiles.active=chaos-monkey > target/hotel-service.log 2>&1 &
nohup java -jar spring-tripmanager-flight-service/target/*.jar --server.port=8083 --spring.profiles.active=chaos-monkey > target/flight-service.log 2>&1 &
nohup java -jar spring-tripmanager-api-gateway/target/*.jar --server.port=8080 --spring.profiles.active=chaos-monkey > target/gateway-service.log 2>&1 &
echo "Waiting for apps to start"
sleep 60
