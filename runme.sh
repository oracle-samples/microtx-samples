#!/bin/sh

GREEN="$(tput setaf 2)"
RED="$(tput setaf 1)"
DEFAULT_VERSION="1.0-SNAPSHOT"

VERSION="${VERSION:-$DEFAULT_VERSION}"
PIDS=()
DASHBOARD_PIDS=()
MICROTX_INPUT_FILE="microtx_runme_history.log"
IS_SE_LINUX=false
CONTAINER_LOCAL_HOST="host.docker.internal"

MICROTX_DOCKER_IMAGE="container-registry.oracle.com/database/otmm:latest"

DISTRIBUTION_PACKAGE_PATH=false
DISTRIBUTION_PACKAGE_LINK="https://www.oracle.com/database/technologies/transaction-manager-for-microservices-downloads.html"

# Uncomment this if the env is Mac with Rancher desktop and podman
COORDINATOR_DOCKER_NETWORK_MODE="host"

printf "${GREEN}\n*************************\n\n Use this script to run microservices and get started with Oracle Transaction Manager for Microservices.\n
*************************\n"

cli_exists() {
    command -v "$1" >/dev/null 2>&1
}

#/**
# docker -> run the microtx free with the default settign
# minikube -> basic yaml microtx free -> create a mini yaml for minikube -> direct yaml deployement
#          -> ask for the distribution package realtive path
# K8s-> Ask for the distribution package realtive path
# {
#   otmm distribution package - > path
#
# }
#*/

handle_environment_prerequisites() {
    if [ $environment == 2 ]; then
        printf "${GREEN}\nSetting up the minikube environment. Memory = 6114 and CPUs = 4"
        sleep 5
        minikube config set memory 6114
        minikube config set cpus 4
        printf "${GREEN}\nStarting minikube.\n"
        export KUBECONFIG=$HOME/.kube/minikube
        minikube start
        eval $(minikube docker-env)
    fi
}
delete_certificates() {
    kubectl delete -n istio-system secret tls-credential
    rm -rf $ROOT/certificates
    runkeytool=/tmp/runkeytool.sh
    cat << EOF > $runkeytool
    #!/bin/bash
    export JAVA_HOME=$JAVA_HOME
    export PATH=${PATH}
    keytool -delete -trustcacerts -alias tmm-dev -keystore $JAVA_HOME/lib/security/cacerts
    keytool -delete -trustcacerts -alias demo-tmm-dev -keystore $JAVA_HOME/lib/security/cacerts
EOF
    chmod +x $runkeytool
    sudo $runkeytool
    rm $runkeytool
}

create_certificates() {
    mkdir $ROOT/certificates
    openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -subj '/O=tmm.dev Inc./CN=tmm.dev' -keyout $ROOT/certificates/tmm.dev.key -out $ROOT/certificates/tmm.dev.crt
    openssl req -newkey rsa:2048 -nodes -subj "/CN=demo.tmm.dev/O=hello world from tmm.dev" -keyout $ROOT/certificates/demo.tmm.dev.key -out $ROOT/certificates/demo.tmm.dev.csr
    openssl x509 -req -days 365 -CA $ROOT/certificates/tmm.dev.crt -CAkey $ROOT/certificates/tmm.dev.key -set_serial 0 -in $ROOT/certificates/demo.tmm.dev.csr -out $ROOT/certificates/demo.tmm.dev.crt

    runkeytool=/tmp/runkeytool.sh
    cat << EOF > $runkeytool
    #!/bin/bash
    export JAVA_HOME=$JAVA_HOME
    export PATH=$PATH
    # echo "$istio_ip  demo.tmm.dev" | sudo tee -a /etc/hosts
    if grep -q "$istio_ip  demo.tmm.dev" "/etc/hosts"; then
        echo "entry '$istio_ip  demo.tmm.dev' already exist in /etc/hosts"
    else
        echo "$istio_ip  demo.tmm.dev" | sudo tee -a /etc/hosts
    fi
    keytool -import -trustcacerts -alias tmm-dev -file $ROOT/certificates/tmm.dev.crt -keystore $JAVA_HOME/lib/security/cacerts
    # sudo -E keytool -import -trustcacerts -alias tmm-dev-pem -file $ROOT/certificates/tmm.dev.pem -keystore $JAVA_HOME/lib/security/cacerts

    keytool -import -trustcacerts -alias demo-tmm-dev -file $ROOT/certificates/demo.tmm.dev.crt -keystore $JAVA_HOME/lib/security/cacerts
    # sudo -E keytool -import -trustcacerts -alias demo-tmm-dev-pem -file $ROOT/certificates/demo.tmm.dev.pem -keystore $JAVA_HOME/lib/security/cacerts
EOF
    chmod +x $runkeytool
    sudo $runkeytool
    rm $runkeytool
    kubectl create -n istio-system secret tls tls-credential --key=$ROOT/certificates/demo.tmm.dev.key --cert=$ROOT/certificates/demo.tmm.dev.crt

}
install_istio() {
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        sleep 3
        namespaceStatus=$(kubectl get ns istio-system -o json)
        if [[ ! -z "$namespaceStatus" ]]; then
           printf "${GREEN}\nIstio is already present in the system. Skipping the installation of istio."
        else
            printf "${GREEN}\nIstio is not installed in the cluster. Installing istio."
            istioctl install --set meshConfig.accessLogFile=/dev/stdout --set meshConfig.accessLogEncoding=JSON --set meshConfig.enableTracing=true --set meshConfig.defaultConfig.tracing.sampling=100.0 --set components.cni.enabled=true -y
        fi

        if [ $environment == 2 ]; then
            printf "${GREEN}\n\n*************************\n"
            printf "${GREEN}\nOpen a new terminal, and then run the following commands."
            printf "${GREEN}\n1. 'export KUBECONFIG=$HOME/.kube/minikube' - To set kubectl to execute commands on minikube"
            printf "${GREEN}\n2. 'minikube tunnel' - To start a tunnel to Istio ingress gateway. If prompted for password, enter the system password."
            printf "${GREEN}\n\nOnce the steps are completed, press enter key to continue"
            read proceed
        fi
        declare -i sleep_time=5
        while [[ -z "$istio_ip" ]]
        do
            if [[ $sleep_time -gt 1800 ]]; then
                printf "${RED}Error: Istio-ingressgateway loadbancer is not provisioned."
                clean_up "n" "y" "y"
            fi
            printf "${GREEN}\nWaiting for Istio-ingressgateway loadbancer to be provisioned. Will try again in $sleep_time seconds."
            sleep $sleep_time
            istio_ip=$(kubectl get service -n istio-system istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
            sleep_time=`expr $sleep_time \* 2`
        done
        istio_url="http://$istio_ip:80"
        if [ $environment == 3 ]; then
            printf "${GREEN}\nCreating a self signed certificate to enable TLS connection to transaction coordinator."
            printf "${GREEN}\nEnter the system/keytool password when prompted. This is required to connect to transaction coordinator running on TLS and hence the certificates should be trusted."
            printf "${GREEN}\nPreceding command requires sudo access. On password prompt, please enter sudo user password.\n"
            delete_certificates
            create_certificates
            istio_url="https://demo.tmm.dev:443"
        fi
        printf "${GREEN}\nIstio-ingressgateway url is $istio_url"
    fi
}

install_istio_dashboards() {
  if [ $environment == 3 ]; then
      if [ -z "$(kubectl get pods -n istio-system --selector='app in (kiali,jaeger)' -o jsonpath='{.items[*].status.phase}')" ]; then
          sleep 2
          printf "${GREEN}\nDo you want to install dashboards to visualize applications deployed on istio mesh ?\n"
          select yn in "Yes" "No"; do
             case $yn in
                Yes )
                    printf "${GREEN}Fetching installed istio version\n"
                    istio_version=$(istioctl version -o json | jq -r ".meshVersion[0].Info.version")
                    istio_major_version=$(echo $(istioctl version -o json | jq -r ".meshVersion[0].Info.version") | awk -F'.' '{printf "%s.%s" , $1,$2}')
                    printf "${GREEN}Installed istio version is ${istio_version} and major version is ${istio_major_version}\n"

                    printf "${GREEN}\nDo you want to deploy Kiali ?\n";
                    select yn in "Yes" "No"; do
                      case $yn in
                         Yes )
                            kialiDeploymentName=$(kubectl get deployment -n istio-system --selector=app=kiali -o jsonpath='{.items[*].metadata.name}')
                            if [[ ! -z "$kialiDeploymentName" ]]; then
                              printf "${GREEN}Kiali is already installed on istio-system namespace.\n";
                            else
                              install_prometheus ${istio_major_version}
                              printf "${GREEN}Deploying Kiali dashboard\n\n";
                              kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${istio_major_version}/samples/addons/kiali.yaml
                              printf "${GREEN}\nDeployed Kiali dashboard on istio-system namespace\n\n";
                            fi
                            start_istio_dashboard kiali
                         break;;
                         No )
                            printf "${GREEN}Kiali dashboard will not be installed.\n";
                         break;
                      esac
                    done

                    printf "${GREEN}\nDo you want to deploy Jaeger ?\n";
                    select yn in "Yes" "No"; do
                       case $yn in
                          Yes )
                             jaegerDeploymentName=$(kubectl get deployment -n istio-system --selector=app=jaeger -o jsonpath='{.items[*].metadata.name}')
                             if [[ ! -z "$jaegerDeploymentName" ]]; then
                               printf "${GREEN}Jaeger is already installed on istio-system namespace.\n";
                             else
                               printf "${GREEN}Deploying Jaeger dashboard\n\n";
                               kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${istio_major_version}/samples/addons/jaeger.yaml
                               printf "${GREEN}\nDeployed Jaeger dashboard on istio-system namespace\n\n";
                             fi
                             start_istio_dashboard jaeger
                          break;;
                          No )
                             printf "${GREEN}Jaeger dashboard will not be installed.\n";
                          break;
                       esac
                    done
                    printf "${GREEN}\nDashboards installation complete\n\n"
                break;;
                No )
                  printf "${GREEN}Dashboards will not be installed.\n\n";
                break;
             esac
          done
      else
          printf "${GREEN}Kiali and Jaeger dashboard services are already deployed on istio-system namespace.\n";
          printf "${GREEN}To open dashboard, run: istioctl dashboard <dashboard-name>\n";
          printf "${GREEN}example: istioctl dashboard kiali\n\n";
      fi
  fi
}

install_prometheus(){
    istio_major_version=$1
    printf "${GREEN}\nPrometheus is required as prerequisite for Kiali\n";
    prometheusDeploymentName=$(kubectl get deployment -n istio-system --selector=app=prometheus -o jsonpath='{.items[*].metadata.name}')
    if [[ ! -z "$prometheusDeploymentName" ]]; then
      printf "${GREEN}Prometheus is already installed on istio-system namespace. Proceeding further.\n\n";
    else
      printf "${GREEN}Deploying Prometheus on istio-system namespace\n\n";
      kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${istio_major_version}/samples/addons/prometheus.yaml
      printf "${GREEN}\nDeployed Prometheus on istio-system namespace\n\n";
    fi
}

start_istio_dashboard(){
  dashboard_appname=$1
  printf "${GREEN}Starting ${dashboard_appname} dashboard..\n"
  for i in {1..3}
  do
    sleep 5
    dashboard_pod_status=$(kubectl get pods -n istio-system --selector=app=${dashboard_appname} -o jsonpath='{.items[*].status.phase}')
    if [[ $dashboard_pod_status =~ "Running" ]]; then
        nohup istioctl dashboard ${dashboard_appname} > ${dashboard_appname}-info.log 2>&1 &
        DASHBOARD_PIDS+=($!)
        printf "${GREEN}${dashboard_appname} dashboard is available on localhost via port forwarding.\n"
        printf "${GREEN}If dashboard does not open on default browser, please check ${dashboard_appname}-info.log present in current directory.\n"
        break;
    else
        printf "${GREEN}Waiting for ${dashboard_appname} pod to start. Current status of ${dashboard_appname} pod is ${dashboard_pod_status}\n"
    fi
    if [[ $i -eq 3 ]]; then
       printf "${RED}${dashboard_appname} pod did not start in 15s. Current status of ${dashboard_appname} pod is ${dashboard_pod_status}\n"
       printf "${RED}Fix the ${dashboard_appname} pod and run: istioctl dashboard ${dashboard_appname} on new terminal session \n"
    fi;
  done
}

create_namespace() {
    if [ $environment = 2 ] || [ $environment = 3 ]; then
        printf "${GREEN}\nCreating a namespace 'otmm' for deployment."
        sleep 5
        kubectl create ns otmm
        printf "${GREEN}\nAdding label 'istio-injection=enabled' to namespace 'otmm' for enabling istio envoy injection."
        sleep 5
        kubectl label namespace otmm istio-injection=enabled
    fi
}

create_image_pull_secret() {
    if [ $environment == 3 ]; then
        if [ -z $CLUSTER ]; then
            printf "${GREEN}\nEnter docker image registry \nThis value corresponds to --docker-server parameter in docker-registry secret"
            printf "${GREEN}\n(Example: iad.ocir.io): "
            read CLUSTER
            echo "CLUSTER=$CLUSTER" >> "$MICROTX_INPUT_FILE";
        fi
        if [ -z $CLUSTER_PREFIX ]; then
            printf "${GREEN}\nEnter docker image registry prefix for image tagging. (This is a requirement to tag and push images to the registry).\n Example: iad.ocir.io/<tenancy-namespace>\n"
            printf "${GREEN}\nFor more information about container registry, see https://docs.oracle.com/iaas/Content/Registry/Concepts/registryconcepts.htm\n"
            read CLUSTER_PREFIX
            echo "CLUSTER_PREFIX=$CLUSTER_PREFIX" >> "$MICROTX_INPUT_FILE";
        fi
        if [ -z $CLUSTER_USER_NAME ]; then
            printf "${GREEN}\nCreating docker secret for image pull.\n"
            printf "${GREEN}\nEnter registry username (Example: <tenancy-name>/<username>):"
            read CLUSTER_USER_NAME
            echo "CLUSTER_USER_NAME=$CLUSTER_USER_NAME" >> "$MICROTX_INPUT_FILE";
        fi
        printf "${GREEN}\nEnter $CLUSTER_USER_NAME user registry password for docker image registry ${CLUSTER} (Password will not appear on the screen):"
        read -s CLUSTER_PASSWORD
        docker login $CLUSTER -u $CLUSTER_USER_NAME -p $CLUSTER_PASSWORD
        kubectl create secret -n otmm docker-registry regcred --docker-server=$CLUSTER --docker-username=$CLUSTER_USER_NAME --docker-password=$CLUSTER_PASSWORD
    fi
}

install_tmm_helmchart() {
    cd "helmcharts"
    printf "${GREEN}\nInstalling MicroTx transaction coordinator helm chart"
    if [ $environment == 2 ];then
        result=$(helm install otmm --namespace otmm tmm --values ./quickstart/minikube/qs-minikube-values.yaml -o json)
    elif [ $environment == 3 ];then
        image_name=$(printf "$CLUSTER_PREFIX/tmm:${VERSION}" | sed 's;/;\\/;g')
        sed "s/tmm:${VERSION}/$image_name/g" ./quickstart/oke/qs-oke-values.yaml > ./quickstart/oke/values1.yaml
        result=$(helm install otmm --namespace otmm tmm --values ./quickstart/oke/values1.yaml -o json)
        rm ./quickstart/oke/values1.yaml
    fi
    check_pod_running "otmm-tcs"
    cd ".."
}

install_microtx_basic_minikube() {
    if [ $environment == 2 ];then
      result=$(helm install otmm --namespace otmm tmm --values ./helmcharts/minikube/qs-minikube-values.yaml -o json)
    else
      printf"${GREEN}\n Minikube environment not present, exiting the script"
      result=$(helm install otmm --namespace otmm tmm --values ./quickstart/minikube/qs-minikube-values.yaml -o json)
      exit 1
    fi
    }

load_coordinator_image(){
    coordinator_image_name="tmm:${DEFAULT_VERSION}"
    if [ $environment == 2 ];then
        if ! minikube image ls | grep -q $coordinator_image_name; then
            printf "${GREEN}\nLoading the MicroTx transaction coordinator image into minikube registry.\n"
            minikube image load ./image/tmm-arm-${DEFAULT_VERSION}.tgz
            minikube image load ./image/tmm-${DEFAULT_VERSION}.tgz
        fi
    else
        if ! docker images $coordinator_image_name | awk '{print $1":"$2}' | grep -q $coordinator_image_name; then
            printf "${GREEN}\nLoading transaction coordinator docker image.\n"
            docker image load -i ./image/tmm-arm-${DEFAULT_VERSION}.tgz
            docker image load -i ./image/tmm-${DEFAULT_VERSION}.tgz
        fi
    fi
}

handle_tmm() {

    case $environment in
    "1")
        #Directly running the docker image from the official docker image
        printf "${GREEN}\nRunning the MicroTx transaction coordinator in a docker container."
        if [ "$(docker ps -a -q -f name=otmm)" ]; then
            printf "Transaction coordinator docker container with name 'otmm' exists. Deleting and recreating."
            docker container rm otmm -f
        fi
        if [[ "${COORDINATOR_DOCKER_NETWORK_MODE}" == "host" ]] && [[ $IS_SE_LINUX == "true" ]]; then
            printf "${GREEN}\nRunning MicroTx coordinator container network in ${COORDINATOR_DOCKER_NETWORK_MODE} mode as non-root user with podman\n"
            docker container run --name otmm  -p 9000:9000/tcp  --env LISTEN_ADDR="0.0.0.0:9000" --env INTERNAL_ADDR="http://localhost:9000" --env EXTERNAL_ADDR="http://localhost:9000" --env SERVE_TLS_ENABLED=false  --env LRA_COORDINATOR_ENABLED=true --env LRA_COORDINATOR_ENABLED=true --env XA_COORDINATOR_ENABLED=true --env TCC_COORDINATOR_ENABLED=true --network=host -d ${MICROTX_DOCKER_IMAGE}
        elif [ "${COORDINATOR_DOCKER_NETWORK_MODE}" == "host" ]; then
            printf "${GREEN}\nRunning MicroTx coordinator container network in ${COORDINATOR_DOCKER_NETWORK_MODE} mode\n"
            docker container run --name otmm  -p 9000:9000/tcp --env LISTEN_ADDR="0.0.0.0:9000" --env INTERNAL_ADDR="http://localhost:9000" --env EXTERNAL_ADDR="http://localhost:9000" --env SERVE_TLS_ENABLED=false  --env LRA_COORDINATOR_ENABLED=true --env LRA_COORDINATOR_ENABLED=true --env XA_COORDINATOR_ENABLED=true --env TCC_COORDINATOR_ENABLED=true --network=host -d ${MICROTX_DOCKER_IMAGE}
        else
            docker container run --name otmm  -p 9000:9000/tcp --env LISTEN_ADDR="0.0.0.0:9000" --env INTERNAL_ADDR="http://localhost:9000" --env EXTERNAL_ADDR="http://localhost:9000" --env SERVE_TLS_ENABLED=false  --env LRA_COORDINATOR_ENABLED=true --env LRA_COORDINATOR_ENABLED=true --env XA_COORDINATOR_ENABLED=true --env TCC_COORDINATOR_ENABLED=true --add-host host.docker.internal:host-gateway -d ${MICROTX_DOCKER_IMAGE}
        fi
        printf "${GREEN}\nTransaction coordinator url is http://localhost:9000/api/v1"
        cd ".."
        ;;
    "2")
        check_for_distribution_package
        if is_distribution_package_available ; then
          printf "${GREEN}\nDistribution pacakge available."
          pushd ${DISTRIBUTION_PACKAGE_PATH}/otmm
          load_coordinator_image
          install_tmm_helmchart
          popd
        else
          printf "${GREEN}\n Running Minikube with github repository."
          install_microtx_basic_minikube
        fi
        ;;
    "3")
        check_for_distribution_package
        if is_distribution_package_available ; then
          printf "${GREEN}\nDistribution pacakge available."
          pushd ${DISTRIBUTION_PACKAGE_PATH}/otmm
          load_coordinator_image
          printf "${GREEN}\nPushing Docker image $CLUSTER_PREFIX/tmm:${VERSION} to the registry.\n"
          docker image tag tmm:${VERSION} $CLUSTER_PREFIX/tmm:${VERSION}
          docker image push $CLUSTER_PREFIX/tmm:${VERSION}
          install_tmm_helmchart
          popd
         else
          printf "${GREEN}\n To deploy in kubernetes environment, please download the distribution package from ${DISTRIBUTION_PACKAGE_LINK}"
          exit 1
         fi
        ;;
    esac
    cd ".."
}

check_sample_appl_helmchart_deployed() {
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        status=$(printf $1 | jq .info.status)
        printf "${GREEN}\nHelmchart installation status: $status"
        if [[ $status == "failed" ]]; then
            printf "${GREEN}\nHelmchart installation failed. Reason:"
            printf $1 | jq .info.description
            printf "${GREEN}\nDo you want to clean up ?\n"
            select yn in "Yes" "No"; do
                case $yn in
                    Yes ) clean_up "y" "y" "y"; break;;
                    No ) break;;
                esac
            done
        fi
        printf "${GREEN}\nWaiting for the microservices to start."
        sleep 25
    fi
}

check_pod_running() {
   phase="unknown"
   pod_name="unknown"
   declare -i remainging_checks=10
   pod_name=$(kubectl get pods -n otmm -l=app=$1 -o jsonpath='{.items[0].metadata.name}')
   phase=$(kubectl get pod -n otmm $pod_name -o jsonpath='{.status.phase}')
   printf "${GREEN}\nCurrent phase of pod $pod_name: $phase"
   while [[ $remainging_checks > 0 ]] && [[ $phase != "Running" ]];
   do
        ((remainging_checks--))
        printf "${GREEN}\nWaiting for pod $pod_name to be in phase running. Remaining checks: $remainging_checks"
        sleep 10
        phase=$(kubectl get pod -n otmm $pod_name -o jsonpath='{.status.phase}')
        printf "${GREEN}\nCurrent phase of pod $pod_name: $phase"
   done
   if [[ $phase != "Running" ]]; then
        printf "${GREEN}\nPod $pod_name is stuck in phase $phase"
        printf "${GREEN}\nPrinting pod describe output for pod $pod_name"
        kubectl describe pod $pod_name -n otmm
        if [[ $1 == 'otmm-tcs' ]];then
            clean_up "n" "y" "y"
        else
            clean_up "y" "y" "y"
        fi
   fi
}

collect_xa_database_details() {

    printf "${GREEN}\n\n***** helidon/dept1 XA database details *****"
    printf "${GREEN}\nEnter below details for department helidon/dept1 XA resource"

    if [ -z $WALLET_LOCATION_1 ]; then
        printf "${GREEN}\nIf you are using Oracle Autonomous Database, download the Database wallet and provide the downloaded location of the database wallet."
        printf "${GREEN}\n(If you are not using Oracle Autonomous Database, skip this step by pressing enter): "
        read WALLET_LOCATION_1
        echo "WALLET_LOCATION_1=$WALLET_LOCATION_1" >> "$MICROTX_INPUT_FILE";
    fi
    if [ -z $DB_CONNECT_STRING_1 ]; then
        printf "${GREEN}\nEnter the Oracle database connect string (Format: jdbc:oracle:thin:@tcps://<host>:<port>/<service_name>?wallet_location=Database_Wallet):"
        read DB_CONNECT_STRING_1
        echo "DB_CONNECT_STRING_1=$DB_CONNECT_STRING_1" >> "$MICROTX_INPUT_FILE";
    fi
    if [ -z $DB_USER_1 ]; then
        printf "${GREEN}\nEnter the user name to access the Oracle database:"
        read DB_USER_1
        echo "DB_USER_1=$DB_USER_1" >> "$MICROTX_INPUT_FILE";
    fi
    printf "${GREEN}\nUsing Database connection string : $DB_CONNECT_STRING_1\n"
    printf "${GREEN}\nEnter the password for database user $DB_USER_1 to access the Oracle database (password will not appear on the screen):"
    read -s DB_PASSWORD_1

    printf "${GREEN}\n\n***** spring/dept2 XA database details *****"
    printf "${GREEN}\nEnter below details for department spring/dept2 XA resource"

    if [ -z $WALLET_LOCATION_2 ]; then
        printf "${GREEN}\nIf you are using Oracle Autonomous Database, download the database wallet and provide the downloaded location of the database wallet."
        printf "${GREEN}\n(If you are not using Oracle Autonomous Database, skip this step by pressing enter): "
        read WALLET_LOCATION_2
        echo "WALLET_LOCATION_2=$WALLET_LOCATION_2" >> "$MICROTX_INPUT_FILE";
    fi
    if [ -z $DB_CONNECT_STRING_2 ]; then
        printf "${GREEN}\nEnter the Oracle database connect string (Format: jdbc:oracle:thin:@tcps://<host>:<port>/<service_name>?wallet_location=Database_Wallet):"
        read DB_CONNECT_STRING_2
        echo "DB_CONNECT_STRING_2=$DB_CONNECT_STRING_2" >> "$MICROTX_INPUT_FILE";
    fi
    if [ -z $DB_USER_2 ]; then
        printf "${GREEN}\nEnter the user name to access the Oracle database:"
        read DB_USER_2
        echo "DB_USER_2=$DB_USER_2" >> "$MICROTX_INPUT_FILE";
    fi
    printf "${GREEN}\nUsing Database connection string : $DB_CONNECT_STRING_1\n"
    printf "${GREEN}\nEnter the password for database user $DB_USER_2 to access the Oracle database (password will not appear on the screen):"
    read -s DB_PASSWORD_2

    printf "${GREEN}\n\n***** Building XA sample app with the provided details *****\n\n"
}

handle_xa_java_teller_application() {
    cd "teller"
    case $environment in
    "1")
        printf "${GREEN}\nRunning teller microservice on your local machine - location: samples/xa/java/teller \n"
        export ORACLE_TMM_CALLBACK_URL="http://${CONTAINER_LOCAL_HOST}:8080"
        mvn clean package
        java -jar target/teller.jar &
        PIDS+=($!)
        sleep 10
        ;;
    "2")
        printf "${GREEN}\nBuilding teller docker image: xa-java-teller:1.0 - location: samples/xa/java/teller\n"
        minikube image build -t xa-java-teller:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding teller docker image $CLUSTER_PREFIX/xa-java-teller:1.0 - location: samples/xa/java/teller\n"
        docker image build  -t $CLUSTER_PREFIX/xa-java-teller:1.0 .
        printf "${GREEN}\nPushing teller docker image $CLUSTER_PREFIX/xa-java-teller:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/xa-java-teller:1.0
        ;;
    esac
    cd ".."
}

handle_xa_java_department_helidon_application() {
    cd "department-helidon"
    case $environment in
    "1")
        printf "${GREEN}\nRunning department helidon microservice on your local machine - location: samples/xa/java/department-helidon \n"
        export ORACLE_TMM_CALLBACK_URL="http://${CONTAINER_LOCAL_HOST}:8081"
        if [ $WALLET_LOCATION_1 ]; then
            cp $WALLET_LOCATION_1/* ./Database_Wallet
        fi
        export DEPARTMENTDATASOURCE_URL=$(printf "$DB_CONNECT_STRING_1" | sed 's/localhost/${CONTAINER_LOCAL_HOST}/g')
        export DEPARTMENTDATASOURCE_USER=$DB_USER_1
        export DEPARTMENTDATASOURCE_PASSWORD=$DB_PASSWORD_1
        mvn clean package
        java -jar target/department.jar &
        PIDS+=($!)
        sleep 10
        ;;
    "2")
        if [ $WALLET_LOCATION_1 ]; then
            cp $WALLET_LOCATION_1/* ./Database_Wallet
        fi
        printf "${GREEN}\nBuilding department helidon docker image: department-helidon:1.0 - location: samples/xa/java/department-helidon\n"
        minikube image build  -t department-helidon:1.0 .
        ;;
    "3")
        if [ $WALLET_LOCATION_1 ]; then
            cp $WALLET_LOCATION_1/* ./Database_Wallet
        fi
        printf "${GREEN}\nBuilding department helidon docker image: $CLUSTER_PREFIX/department-helidon:1.0 - location: samples/xa/java/department-helidon\n"
        docker image build  -t $CLUSTER_PREFIX/department-helidon:1.0 .
        printf "${GREEN}\nPushing XA JAVA department helidon docker image $CLUSTER_PREFIX/department-helidon:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/department-helidon:1.0
        ;;
    esac
    cd ".."
}

handle_xa_java_department_spring_application() {
    cd "department-spring"
    case $environment in
    "1")
        printf "${GREEN}\nRunning department spring microservice on your local machine - location: samples/xa/java/department-spring"
        export ORACLE_TMM_CALLBACK_URL="http://${CONTAINER_LOCAL_HOST}:8082"
        export SPRING_MICROTX_PARTICIPANT_URL="http://${CONTAINER_LOCAL_HOST}:8082"
        if [ $WALLET_LOCATION_2 ]; then
            cp $WALLET_LOCATION_2/* ./Database_Wallet
        fi
        export DEPARTMENTDATASOURCE_URL=$(printf "$DB_CONNECT_STRING_2" | sed 's/localhost/${CONTAINER_LOCAL_HOST}/g')
        export DEPARTMENTDATASOURCE_USER=$DB_USER_2
        export DEPARTMENTDATASOURCE_PASSWORD=$DB_PASSWORD_2
        mvn clean package
        java -jar target/department.jar &
        PIDS+=($!)
        sleep 10
        ;;
    "2")
        if [ $WALLET_LOCATION_2 ]; then
            cp $WALLET_LOCATION_2/* ./Database_Wallet
        fi
        printf "${GREEN}\nBuilding department spring docker image: department-spring:1.0 - location: samples/xa/java/department-spring\n"
        minikube image build  -t department-spring:1.0 .
        ;;
    "3")
        if [ $WALLET_LOCATION_2 ]; then
            cp $WALLET_LOCATION_2/* ./Database_Wallet
        fi
        printf "${GREEN}\nBuilding department spring docker image: $CLUSTER_PREFIX/department-spring:1.0 - location: samples/xa/java/department-spring\n"
        docker image build  -t $CLUSTER_PREFIX/department-spring:1.0 .
        printf "${GREEN}\nPushing department spring docker image $CLUSTER_PREFIX/department-spring:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/department-spring:1.0
        ;;
    esac
    cd ".."
}

handle_xa_java_department_helidon_embedded_application() {
    cd "department-helidon-embedded"
    printf "${GREEN}\nRunning department helidon embedded  microservice on your local machine. Using Apache Derby as embedded database. - location: samples/xa/java/department-helidon-embedded \n"
    export ORACLE_TMM_CALLBACK_URL="http://${CONTAINER_LOCAL_HOST}:8081"
    mvn clean package
    java -jar target/department-helidon-embedded.jar &
    PIDS+=($!)
    sleep 10
    cd ".."
}

handle_xa_java_department_spring_embedded_application() {
    cd "department-spring-embedded"
    printf "${GREEN}\nRunning department spring embedded microservice on your local machine. Using Apache Derby as embedded database. - location: samples/xa/java/department-spring-embedded"
    export ORACLE_TMM_CALLBACK_URL="http://${CONTAINER_LOCAL_HOST}:8082"
    export SPRING_MICROTX_PARTICIPANT_URL="http://${CONTAINER_LOCAL_HOST}:8082"
    mvn clean package
    java -jar target/department-spring-embedded.jar &
    PIDS+=($!)
    sleep 10
    cd ".."
}

handle_xa_embedded_java_applications() {
    cd "java"
    if [ $environment == 2 ]; then
        printf "${GREEN}\n The in memory XA Sample apps not applicable to Minikube environment "
        exit 1
      elif [ $environment == 3 ]; then
        printf "${GREEN}\n The in memory XA Sample apps not applicable to Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE) environment"
        exit 1
    fi
    printf "${GREEN}\nThis XA demo includes three microservices:"
    printf "${GREEN}\nDepartment Helidon Embedded - location: samples/xa/java/department-helidon-embedded"
    printf "${GREEN}\nDepartment Spring Embedded - location: samples/xa/java/department-spring-embedded"
    printf "${GREEN}\nTeller - location: samples/xa/java/teller \n"
    sleep 3

    handle_xa_java_teller_application
    handle_xa_java_department_helidon_embedded_application
    handle_xa_java_department_spring_embedded_application
    cd ".."
}

handle_xa_java_applications() {
    cd "java"
    printf "${GREEN}\nThis XA demo includes three microservices:"
    printf "${GREEN}\nDepartment Helidon - location: samples/xa/java/department-helidon"
    printf "${GREEN}\nDepartment Spring - location: samples/xa/java/department-spring"
    printf "${GREEN}\nTeller - location: samples/xa/java/teller \n"
    sleep 3

    collect_xa_database_details
    handle_xa_java_teller_application
    handle_xa_java_department_helidon_application
    handle_xa_java_department_spring_application

    if [ $environment == 2 ]; then
        cd "helmcharts"
        URL_1=$(printf "$DB_CONNECT_STRING_1" | sed 's;/;\\/;g')
        sed "s/<Fill in the connect string dept1>/$URL_1/g" ./transfer/values.yaml > ./transfer/values1.yaml
        sed "s/<Fill in the database user dept1>/$DB_USER_1/g" ./transfer/values1.yaml > ./transfer/values2.yaml
        sed "s/<Fill in the database password dept1>/$DB_PASSWORD_1/g" ./transfer/values2.yaml > ./transfer/values3.yaml
        

        URL_2=$(printf "$DB_CONNECT_STRING_2" | sed 's;/;\\/;g')
        sed "s/<Fill in the connect string dept2>/$URL_2/g" ./transfer/values3.yaml > ./transfer/values4.yaml
        sed "s/<Fill in the database user dept2>/$DB_USER_2/g" ./transfer/values4.yaml > ./transfer/values5.yaml
        sed "s/<Fill in the database password dept2>/$DB_PASSWORD_2/g" ./transfer/values5.yaml > ./transfer/values6.yaml
        
        sed "s/<Fill the unique identifier assigned to the dept1 database>/de5eb98f-670b-49c6-a8f3-b82faf4eb883/g" ./transfer/values6.yaml > ./transfer/values7.yaml
        sed "s/<Fill the unique identifier assigned to the dept2 database>/ac1b5483-66c3-4577-be72-b9149237ce2f/g" ./transfer/values7.yaml > ./transfer/values8.yaml
        
        printf "${GREEN}\nInstalling helm chart - Location: samples/xa/java/helmcharts/transfer \n"
        result=$(helm install -n otmm transfer transfer --values ./transfer/values8.yaml -o json)
        rm ./transfer/values1.yaml ./transfer/values2.yaml ./transfer/values3.yaml ./transfer/values4.yaml ./transfer/values5.yaml ./transfer/values6.yaml ./transfer/values7.yaml ./transfer/values8.yaml

    elif [ $environment == 3 ]; then
        cd "helmcharts"
        xa_image_prefix=$(printf "$CLUSTER_PREFIX" | sed 's;/;\\/;g')
        sed "s/xa-java-teller:1.0/$xa_image_prefix\/xa-java-teller:1.0/g" ./transfer/values.yaml > ./transfer/values1.yaml
        sed "s/department-helidon:1.0/$xa_image_prefix\/department-helidon:1.0/g" ./transfer/values1.yaml > ./transfer/values2.yaml
        sed "s/department-spring:1.0/$xa_image_prefix\/department-spring:1.0/g" ./transfer/values2.yaml > ./transfer/values3.yaml
        URL_1=$(printf "$DB_CONNECT_STRING_1" | sed 's;/;\\/;g')
        sed "s/<Fill in the connect string dept1>/$URL_1/g" ./transfer/values3.yaml > ./transfer/values4.yaml
        sed "s/<Fill in the database user dept1>/$DB_USER_1/g" ./transfer/values4.yaml > ./transfer/values5.yaml
        sed "s/<Fill in the database password dept1>/$DB_PASSWORD_1/g" ./transfer/values5.yaml > ./transfer/values6.yaml

        URL_2=$(printf "$DB_CONNECT_STRING_2" | sed 's;/;\\/;g')
        sed "s/<Fill in the connect string dept2>/$URL_2/g" ./transfer/values6.yaml > ./transfer/values7.yaml
        sed "s/<Fill in the database user dept2>/$DB_USER_2/g" ./transfer/values7.yaml > ./transfer/values8.yaml
        sed "s/<Fill in the database password dept2>/$DB_PASSWORD_2/g" ./transfer/values8.yaml > ./transfer/values9.yaml
        
         sed "s/<Fill the unique identifier assigned to the dept1 database>/de5eb98f-670b-49c6-a8f3-b82faf4eb883/g" ./transfer/values9.yaml > ./transfer/values10.yaml
        sed "s/<Fill the unique identifier assigned to the dept2 database>/ac1b5483-66c3-4577-be72-b9149237ce2f/g" ./transfer/values10.yaml > ./transfer/values11.yaml
        
        printf "${GREEN}\nInstalling helm chart - Location: samples/xa/java/helmcharts/transfer .\n"
        result=$(helm install -n otmm transfer transfer --values ./transfer/values11.yaml -o json)
        rm ./transfer/values1.yaml ./transfer/values2.yaml ./transfer/values3.yaml ./transfer/values4.yaml ./transfer/values5.yaml ./transfer/values6.yaml ./transfer/values7.yaml ./transfer/values8.yaml
        rm ./transfer/values9.yaml ./transfer/values10.yaml ./transfer/values11.yaml
    fi
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        check_pod_running "dept1"
        check_pod_running "dept2"
        check_pod_running "teller"
    fi
    cd ".."
}

run_xa_transfer_scenario() {
    if [ $environment == 1 ]; then
        department_one_url="http://localhost:8081/accounts"
        department_two_url="http://localhost:8082/accounts"
        initiator_url="http://localhost:8080"
    else
        department_one_url="$istio_url/dept1"
        department_two_url="$istio_url/dept2"
        initiator_url="$istio_url"
    fi    
    printf "${GREEN}\nEnter the name of the account from which you want to withdraw an amount (Example: account1):"
    read account1
    account1=${account1:-account1}
    printf "${GREEN}\nExecuting command to fetch account balance: curl --location --request GET $department_one_url/$account1"
    sleep 5
    if [ $environment == 3 ]; then
        output="$(curl --location -H "Host:demo.tmm.dev" --resolve "demo.tmm.dev:443:$istio_ip" --cacert $ROOT/certificates/tmm.dev.crt --request GET $department_one_url/$account1)"
    else
        output="$(curl --location --request GET $department_one_url/$account1)"
    fi
    printf "${GREEN}\nBalance in the $account1 account before the transfer is: $output\n"
    
    sleep 5

    printf "${GREEN}\nEnter the name of the account to which you want to deposit an amount (Example: account2):"
    read account2
    account2=${account2:-account2}
    printf "${GREEN}\nExecuting command to fetch account balance: curl --location --request GET $department_two_url/$account2"
    sleep 5
    if [ $environment == 3 ]; then
        output="$(curl --location -H "Host:demo.tmm.dev" --resolve "demo.tmm.dev:443:$istio_ip" --cacert $ROOT/certificates/tmm.dev.crt --request GET $department_two_url/$account2)"
    else
        output="$(curl --location --request GET $department_two_url/$account2)"
    fi
    printf "${GREEN}\nBalance in the $account2 account before the transfer is: $output\n"
    sleep 5

    printf "${GREEN}\nEnter the amount that you want to transfer (Example: 100):"
    read amount
    amount=${amount:-100}
    printf "${GREEN}\nExecuting command to initiate a transfer: curl --location --request --header 'Content-Type: application/json 
    --data '{
                "from": "'$account1'",
                "to": "'$account2'",
                "amount": '$amount'
            }') 
    POST $initiator_url/transfers \n"
    sleep 5
    if [ $environment == 3 ]; then
        output=$(curl --location -H "Host:demo.tmm.dev" --resolve "demo.tmm.dev:443:$istio_ip" --cacert $ROOT/certificates/tmm.dev.crt --request POST $initiator_url/transfers \
        --header 'Content-Type: application/json' \
        --data '{
                "from": "'$account1'",
                "to": "'$account2'",
                "amount": '$amount'
            }')
    else
        output=$(curl --location --request POST $initiator_url/transfers \
            --header 'Content-Type: application/json' \
            --data '{
                    "from": "'$account1'",
                    "to": "'$account2'",
                    "amount": '$amount'
                }')
    fi
    printf "${GREEN}\nTransfer output: $output \n"
    
    printf "${GREEN}\nExecuting command to fetch account balance: curl --location --request GET $department_one_url/$account1"
    sleep 5
    if [ $environment == 3 ]; then
        output="$(curl --location -H "Host:demo.tmm.dev" --resolve "demo.tmm.dev:443:$istio_ip" --cacert $ROOT/certificates/tmm.dev.crt --request GET $department_one_url/$account1)"
    else
        output="$(curl --location --request GET $department_one_url/$account1)"
    fi
    printf "${GREEN}\nBalance in the $account1 account after the transfer is:$output\n"
    sleep 5

    printf "${GREEN}\nExecuting command to fetch account balance: curl --location --request GET $department_two_url/$account2"
    sleep 5
    if [ $environment == 3 ]; then
        output="$(curl --location -H "Host:demo.tmm.dev" --resolve "demo.tmm.dev:443:$istio_ip" --cacert $ROOT/certificates/tmm.dev.crt --request GET $department_two_url/$account2)"
    else
        output="$(curl --location --request GET $department_two_url/$account2)"
    fi
    printf "${GREEN}\nBalance in the $account2 account after the transfer is:$output\n"
    
    sleep 10
}

handle_xa_samples() {
    cd "xa"
    printf "${GREEN}\nEnter a number (1-2) to specify database type for XA samples\n"
    select yn in "Embedded in-memory database" "XA DataSource"; do
        case $yn in
            "Embedded in-memory database" ) sample=1; handle_xa_embedded_java_applications;  break;;
            "XA DataSource" ) sample=2; handle_xa_java_applications; break;;
        esac
    done
    sleep 10
    printf "${GREEN}\nThe microservice implements a scenario where a Teller microservice transfers money from one department to another by creating an XA transaction. The two departments in the organization are Department Helidon and Department Spring. The XA transaction is implemented by using the Transaction Manager for Microservices. Within the XA transaction, all actions such as withdraw and deposit either succeed, or they all are rolled back in case of a failure of any one or more actions."
    printf "${GREEN}\nDo you want to run microservice example scenario ?\n"
    select yn in "Yes" "No"; do
        case $yn in
            Yes ) run_xa_transfer_scenario; break;;
            No ) break;;
        esac
    done
    cd ".."
}

handle_lra_hotel_application() {
    cd "hotel"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the LRA hotel microservice on your local machine - location: samples/lra/lrademo/hotel \n"
        sleep 5
        export MP_LRA_PARTICIPANT_URL="http://${CONTAINER_LOCAL_HOST}:8082"
        mvn clean package
        java -jar target/hotel.jar &
        PIDS+=($!)
        sleep 5
        ;;
    "2")
        printf "${GREEN}\nBuilding the LRA hotel microservice docker image lra-hotel:1.0 - location: samples/lra/lrademo/hotel \n"
        sleep 5
        minikube image build  -t lra-hotel:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the LRA hotel microservice docker image $CLUSTER_PREFIX/lra-hotel:1.0 - location: samples/lra/lrademo/hotel \n"
        sleep 5
        docker image build  -t $CLUSTER_PREFIX/lra-hotel:1.0 .
        printf "${GREEN}\nPushing the LRA hotel microservice docker image $CLUSTER_PREFIX/lra-hotel:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/lra-hotel:1.0
        ;;
    esac
    cd ".."
}

handle_lra_flight_application() {
    cd "flight-springboot"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the LRA flight microservice on your local machine - location: samples/lra/lrademo/flight-springboot \n"
        sleep 5
        export ORACLE_TMM_CALLBACK_URL="http://${CONTAINER_LOCAL_HOST}:8083"
        export SPRING_MICROTX_LRA_PARTICIPANT_URL="http://${CONTAINER_LOCAL_HOST}:8083"
        mvn clean package
        java -jar target/flight-sb.jar &
        PIDS+=($!)
        sleep 5
        ;;
    "2")
        printf "${GREEN}\nBuilding the LRA flight microservice docker image lra-flight:1.0 - location: samples/lra/lrademo/flight-springboot \n"
        sleep 5
        minikube image build  -t lra-flight:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the LRA flight microservice docker image $CLUSTER_PREFIX/lra-flight:1.0 - location: samples/lra/lrademo/flight-springboot \n"
        sleep 5
        docker image build  -t $CLUSTER_PREFIX/lra-flight:1.0 .
        printf "${GREEN}\nPushing the LRA flight microservice docker image $CLUSTER_PREFIX/lra-flight:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/lra-flight:1.0
        ;;
    esac
    cd ".."
}

handle_lra_flight_node_application() {
    cd "flight"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the LRA flight microservice on your local machine - location: samples/lra/lrademo/flight \n"
        sleep 5
        export ORACLE_TMM_CALLBACK_URL="http://${CONTAINER_LOCAL_HOST}:8083"
        npm install
        npm run tsc
        node ./build/server.js &
        PIDS+=($!)
        sleep 5
        ;;
    "2")
        printf "${GREEN}\nBuilding the LRA flight microservice docker image lra-flight:1.0 - location: samples/lra/lrademo/flight \n"
        sleep 5
        minikube image build  -t lra-flight:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the LRA flight microservice docker image $CLUSTER_PREFIX/lra-flight:1.0 - location: samples/lra/lrademo/flight \n"
        sleep 5
        docker image build  -t $CLUSTER_PREFIX/lra-flight:1.0 .
        printf "${GREEN}\nPushing the LRA flight microservice docker image $CLUSTER_PREFIX/lra-flight:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/lra-flight:1.0
        ;;
    esac
    cd ".."
}

handle_lra_trip_manager_application() {
    cd "trip-manager"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the LRA Trip Manager microservice on your local machine - location: samples/lra/lrademo/trip-manager \n"
        sleep 5
        export MP_LRA_PARTICIPANT_URL="http://${CONTAINER_LOCAL_HOST}:8081"
        mvn clean package
        java -jar target/trip-manager.jar &
        PIDS+=($!)
        sleep 5
        ;;
    "2")
        printf "${GREEN}\nBuilding the LRA trip manager microservice docker image lra-trip-manager:1.0 - location: samples/lra/lrademo/trip-manager \n"
        sleep 5
        minikube image build  -t lra-trip-manager:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the LRA trip manager microservice docker image $CLUSTER_PREFIX/lra-trip-manager:1.0 - location: samples/lra/lrademo/trip-manager \n"
        sleep 5
        docker image build  -t $CLUSTER_PREFIX/lra-trip-manager:1.0 .
        printf "${GREEN}\nPushing the LRA trip manager microservice docker image $CLUSTER_PREFIX/lra-trip-manager:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/lra-trip-manager:1.0
        ;;
    esac
    cd ".."
}

run_lra_samples() {
    printf "${GREEN}\nLocally running trip client microservice - location: samples/lra/lrademo/trip-client."
    cd "lrademo/trip-client"
    if [ $environment == 1 ]; then
        export TRIP_SERVICE_URL="http://localhost:8081/trip-service/api/trip"
    fi
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        TRIP_MANAGER_URL="$istio_url/trip-service/api/trip"
        export TRIP_SERVICE_URL=$TRIP_MANAGER_URL
    fi

    if [ ! -f "target/trip-client.jar" ]; then
        mvn clean package
    fi
    java -jar target/trip-client.jar
    cd "../.."
    sleep 5
}

handle_lra_samples() {
    cd "lra/lrademo"
    printf "${GREEN}\nThis LRA demo includes three microservices:"
    printf "${GREEN}\nFlight - location: samples/lra/lrademo/flight-springboot"
    printf "${GREEN}\nHotel - location: samples/lra/lrademo/hotel"
    printf "${GREEN}\nTrip Manager - location: samples/lra/lrademo/trip-manager\n"
    sleep 5

    handle_lra_hotel_application
    handle_lra_flight_application
    handle_lra_trip_manager_application
    cd ".."

    if [ $environment == 2 ]; then
        printf "${GREEN}\nInstalling sampleappslra helm chart - location: samples/lra/helmcharts/sampleappslra \n"
        result=$(helm install -n otmm sampleappslra helmcharts/sampleappslra -o json)
    elif [ $environment == 3 ]; then
        cd "./helmcharts"
        printf "${GREEN}\nInstalling sampleappslra helm chart - location: samples/lra/helmcharts/sampleappslra \n"
        lra_image_prefix=$(printf "$CLUSTER_PREFIX" | sed 's;/;\\/;g')
        sed "s/lra-trip-manager:1.0/$lra_image_prefix\/lra-trip-manager:1.0/g" ./sampleappslra/values.yaml > ./sampleappslra/values1.yaml
        sed "s/lra-flight:1.0/$lra_image_prefix\/lra-flight:1.0/g" ./sampleappslra/values1.yaml > ./sampleappslra/values2.yaml
        sed "s/lra-hotel:1.0/$lra_image_prefix\/lra-hotel:1.0/g" ./sampleappslra/values2.yaml > ./sampleappslra/values3.yaml
        result=$(helm install -n otmm sampleappslra  sampleappslra --values ./sampleappslra/values3.yaml -o json)
        rm ./sampleappslra/values1.yaml ./sampleappslra/values2.yaml ./sampleappslra/values3.yaml
        cd ..        
    fi
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        check_pod_running "hotel"
        check_pod_running "flight"
        check_pod_running "trip-manager"
    fi
    sleep 10
    printf "${GREEN}\nThe microservices are microservices that demonstrate how services can be developed for participating in LRA transactions while using Transaction Manager for Microservices to coordinate the transactions."
    printf "${GREEN}\nThe sample LRA microservice implements a scenario where a different microservices perform different tasks. One microservice books a trip, another books a flight, and a third microservice books a hotel."
    printf "${GREEN}\nDo you want to run microservice example scenario ?\n"
    select yn in "Yes" "No"; do
        case $yn in
            Yes ) run_lra_samples; break;;
            No ) break;;
        esac
    done
}

handle_tcc_java_hotel_application() {
    cd "hotel-booking"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the TCC hotel microservice on your local machine - location: samples/tcc/java/hotel-booking \n"
        export BOOKING_BASE_URL="http://${CONTAINER_LOCAL_HOST}:8081/api/bookings"
        mvn clean package
        java -jar target/hotel-booking.jar &
        PIDS+=($!)
        sleep 10
        ;;
    "2")
        printf "${GREEN}\nBuilding the TCC hotel docker image tcc-java-hotel:1.0 - location: samples/tcc/java/hotel-booking \n"
        minikube image build  -t tcc-java-hotel:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the TCC hotel docker image $CLUSTER_PREFIX/tcc-java-hotel:1.0 - location: samples/tcc/java/hotel-booking \n"
        docker image build  -t $CLUSTER_PREFIX/tcc-java-hotel:1.0 .
        printf "${GREEN}\nPushing the LRA Hotel docker image $CLUSTER_PREFIX/lra-hotel:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/tcc-java-hotel:1.0
        ;;
    esac
    cd ".."
}

handle_tcc_java_flight_application() {
    cd "flight-booking"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the TCC flight microservice on your local machine - location: samples/tcc/java/flight-booking \n"
        export BOOKING_BASE_URL="http://${CONTAINER_LOCAL_HOST}:8082/api/bookings"
        mvn clean package
        java -jar target/flight-booking.jar &
        PIDS+=($!)
        sleep 10
        ;;
    "2")
        printf "${GREEN}\nBuilding the TCC flight docker image tcc-java-flight:1.0 - location: samples/tcc/java/flight-booking \n"
        minikube image build  -t tcc-java-flight:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the TCC flight docker image $CLUSTER_PREFIX/tcc-java-flight:1.0 - location: samples/tcc/java/flight-booking \n"
        docker image build  -t $CLUSTER_PREFIX/tcc-java-flight:1.0 .
        printf "${GREEN}\nPushing the Flight docker image $CLUSTER_PREFIX/tcc-java-flight:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/tcc-java-flight:1.0
        ;;
    esac
    cd ".."
}

handle_tcc_java_travel_agent_application() {
    cd "travel-agent"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the TCC travel agent microservice on your local machine - location: samples/tcc/java/travel-agent \n"
        mvn clean package
        java -jar target/travel-agent.jar &
        PIDS+=($!)
        sleep 10
        ;;
    "2")
        printf "${GREEN}\nBuilding the TCC travel agent docker image tcc-java-travel-agent:1.0 . - location: samples/tcc/java/travel-agent \n"
        minikube image build  -t tcc-java-travel-agent:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the TCC travel agent docker image $CLUSTER_PREFIX/tcc-java-travel-agent:1.0 - location: samples/tcc/java/travel-agent \n"
        docker image build  -t $CLUSTER_PREFIX/tcc-java-travel-agent:1.0 .
        printf "${GREEN}\nPushing the travel agent docker image $CLUSTER_PREFIX/tcc-java-travel-agent:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/tcc-java-travel-agent:1.0
        ;;
    esac
    cd ".."
}

handle_tcc_nodejs_hotel_application() {
    cd "hotel"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the TCC hotel microservice on your local machine - location: samples/tcc/nodejs/hotel \n"
        export BOOKING_BASE_URL="http://${CONTAINER_LOCAL_HOST}:8081/api/bookings"
        npm install
        npm run tsc
        node ./build/server.js &
        PIDS+=($!)
        ;;
    "2")
        printf "${GREEN}\nBuilding the TCC hotel docker image tcc-nodejs-hotel:1.0 . - location: samples/tcc/nodejs/hotel \n"
        minikube image build  -t tcc-nodejs-hotel:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the TCC hotel docker image $CLUSTER_PREFIX/tcc-nodejs-hotel:1.0 . - location: samples/tcc/nodejs/hotel \n"
        docker image build  -t $CLUSTER_PREFIX/tcc-nodejs-hotel:1.0 .
        printf "${GREEN}\nPushing the hotel docker image $CLUSTER_PREFIX/tcc-nodejs-hotel:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/tcc-nodejs-hotel:1.0
        ;;
    esac
    cd ".."
    sleep 10
}

handle_tcc_nodejs_flight_application() {
    cd "flight"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the TCC flight microservice on your local machine - location: samples/tcc/nodejs/flight \n"
        export BOOKING_BASE_URL="http://${CONTAINER_LOCAL_HOST}:8082/api/bookings"
        npm install
        npm run tsc
        node ./build/server.js &
        PIDS+=($!)
        ;;
    "2")
        printf "${GREEN}\nBuilding the TCC flight docker image tcc-nodejs-flight:1.0 - location: samples/tcc/nodejs/flight \n"
        minikube image build  -t tcc-nodejs-flight:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the TCC flight docker image $CLUSTER_PREFIX/tcc-nodejs-flight:1.0 - location: samples/tcc/nodejs/flight \n"
        docker image build  -t $CLUSTER_PREFIX/tcc-nodejs-flight:1.0 .
        printf "${GREEN}\nPushing the flight docker image $CLUSTER_PREFIX/tcc-nodejs-flight:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/tcc-nodejs-flight:1.0
        ;;
    esac
    cd ".."
    sleep 10
}

handle_tcc_nodejs_travel_agent_application() {
    cd "travel-agent"
    case $environment in
    "1")
        printf "${GREEN}\nRunning the TCC travel agent microservice on your local machine - location: samples/tcc/nodejs/travel-agent \n"
        npm install
        npm run tsc
        node ./build/server.js &
        PIDS+=($!)
        ;;
    "2")
        printf "${GREEN}\nBuilding the TCC travel agent docker image tcc-nodejs-travel-agent:1.0 - location: samples/tcc/nodejs/travel-agent \n"
        minikube image build  -t tcc-nodejs-travel-agent:1.0 .
        ;;
    "3")
        printf "${GREEN}\nBuilding the TCC travel agent docker image $CLUSTER_PREFIX/tcc-nodejs-travel-agent:1.0 - location: samples/tcc/nodejs/travel-agent \n"
        docker image build  -t $CLUSTER_PREFIX/tcc-nodejs-travel-agent:1.0 .
        printf "${GREEN}\nPushing the travel agent docker image $CLUSTER_PREFIX/tcc-nodejs-travel-agent:1.0 to the registry.\n"
        docker image push $CLUSTER_PREFIX/tcc-nodejs-travel-agent:1.0
        ;;
    esac
    cd ".."
    sleep 10
    
}

check_node_prerequisites(){
    if [ $environment == 1 ] && ! cli_exists npm; then
        printf "${RED}\nError: Please install node. node and npm cli is required to run this script.\n";
        exit 1
    fi
}

handle_tcc_nodejs_applications() {
    check_node_prerequisites
    cd "nodejs"
    printf "${GREEN}\nThis TCC demo includes three microservices:"
    printf "${GREEN}\nFlight - location: samples/tcc/nodejs/flight"
    printf "${GREEN}\nHotel - location: samples/tcc/nodejs/hotel"
    printf "${GREEN}\nTravel Agent - location: samples/tcc/nodejs/travel-agent \n"
    sleep 5

    handle_tcc_nodejs_hotel_application
    handle_tcc_nodejs_flight_application
    handle_tcc_nodejs_travel_agent_application
    if [ $environment == 2 ]; then
        cd "helmcharts"
        printf "${GREEN}\nInstalling sampleappstccnode helm chart - location: samples/tcc/nodejs/helmcharts/sampleappstccnode. \n"
        result=$(helm install -n otmm sampleappstccnode sampleappstccnode -o json)
        cd ..
    elif [ $environment == 3 ]; then
        cd "helmcharts"
        tcc_image_prefix=$(printf "$CLUSTER_PREFIX" | sed 's;/;\\/;g')
        sed "s/tcc-nodejs-travel-agent:1.0/$tcc_image_prefix\/tcc-nodejs-travel-agent:1.0/g" ./sampleappstccnode/values.yaml > ./sampleappstccnode/values1.yaml
        sed "s/tcc-nodejs-flight:1.0/$tcc_image_prefix\/tcc-nodejs-flight:1.0/g" ./sampleappstccnode/values1.yaml > ./sampleappstccnode/values2.yaml
        sed "s/tcc-nodejs-hotel:1.0/$tcc_image_prefix\/tcc-nodejs-hotel:1.0/g" ./sampleappstccnode/values2.yaml > ./sampleappstccnode/values3.yaml
        printf "${GREEN}\nInstalling helm chart - location: samples/tcc/java/helmcharts/sampleappstccnode. \n"
        result=$(helm install -n otmm sampleappstccnode sampleappstccnode --values ./sampleappstccnode/values3.yaml -o json)
        rm ./sampleappstccnode/values1.yaml ./sampleappstccnode/values2.yaml ./sampleappstccnode/values3.yaml
        cd ..
    fi
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        check_pod_running "hotel"
        check_pod_running "flight"
        check_pod_running "travel-agent"
    fi
    cd ".."
    sleep 10
}

handle_tcc_java_applications() {
    cd "java"
    printf "${GREEN}\nThis TCC demo includes three microservices:"
    printf "${GREEN}\nFlight Booking - location: samples/tcc/java/flight-booking"
    printf "${GREEN}\nHotel Booking - location: samples/tcc/java/hotel-booking"
    printf "${GREEN}\nTravel Agent - location: samples/tcc/java/travel-agent \n"
    sleep 5

    handle_tcc_java_hotel_application
    handle_tcc_java_flight_application
    handle_tcc_java_travel_agent_application
    if [ $environment == 2 ]; then
        cd "helmcharts"
        printf "${GREEN}\nInstalling sampleappstcc helm chart - location: samples/tcc/java/helmcharts/sampleappstcc. \n"
        result=$(helm install -n otmm sampleappstcc sampleappstcc -o json)
        cd ..
    elif [ $environment == 3 ]; then
        cd "helmcharts"
        tcc_image_prefix=$(printf "$CLUSTER_PREFIX" | sed 's;/;\\/;g')
        sed "s/tcc-java-travel-agent:1.0/$tcc_image_prefix\/tcc-java-travel-agent:1.0/g" ./sampleappstcc/values.yaml > ./sampleappstcc/values1.yaml
        sed "s/tcc-java-flight:1.0/$tcc_image_prefix\/tcc-java-flight:1.0/g" ./sampleappstcc/values1.yaml > ./sampleappstcc/values2.yaml
        sed "s/tcc-java-hotel:1.0/$tcc_image_prefix\/tcc-java-hotel:1.0/g" ./sampleappstcc/values2.yaml > ./sampleappstcc/values3.yaml
        printf "${GREEN}\nInstalling sampleappstcc helm chart - location: samples/tcc/java/helmcharts/sampleappstcc. \n"
        result=$(helm install -n otmm sampleappstcc sampleappstcc --values ./sampleappstcc/values3.yaml -o json)
        rm ./sampleappstcc/values1.yaml ./sampleappstcc/values2.yaml ./sampleappstcc/values3.yaml
        cd ..
    fi
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        check_pod_running "hotel-booking"
        check_pod_running "flight-booking"
        check_pod_running "travel-agent"
    fi
    cd ".."
    sleep 10
}

run_tcc_samples() {
    printf "${GREEN}\nLocally running trip client microservice - location: samples/tcc/java/trip-client"
    cd "java/trip-client"
    if [ $environment == 1 ]; then
        export TRAVEL_AGENT_SERVICE_URL="http://localhost:8080/travel-agent/api/"
    fi
    if [ $environment == 2 ] || [ $environment == 3 ]; then
        export TRAVEL_AGENT_SERVICE_URL="$istio_url/travel-agent/api/"
    fi

    if [ ! -f "target/trip-client.jar" ]; then
        mvn clean package
    fi
    java -jar target/trip-client.jar
    cd "../.."
    sleep 5
}

handle_tcc_samples() {
    cd "tcc"
    printf "${GREEN}\nEnter a number (1 or 2) to select the language of the TCC microservices that you want to run:\n"
    select yn in "Java" "Nodejs"; do
        case $yn in
            "Java" ) language=1; handle_tcc_java_applications; break;;
            "Nodejs" ) language=2; handle_tcc_nodejs_applications; break;;
        esac
    done
    sleep 20
    printf "${GREEN}\n The Try-Confirm/Cancel (TCC) transaction protocol holds some resources in a reserved state until the transaction is either confirmed or canceled. If the transaction is canceled, the reserved resources are released and are available in the inventory"
    printf "${GREEN}\nThe sample TCC microservice implements a scenario where a different microservices perform different tasks. One microservice books a trip, another books a flight, and a third microservice books a hotel."
    printf "${GREEN}\nDo you want to run microservice example scenario ?\n"
    select yn in "Yes" "No"; do
        case $yn in
            Yes ) run_tcc_samples; break;;
            No ) break;;
        esac
    done
    cd ".."
}

handle_samples() {

    cd "${ROOT}"
    COLUMNS=12
    printf "${GREEN}\nEnter a number (1-3) to specify the transaction model of the microservice that you want to run:\n"
    select yn in "XA" "LRA - Long Running Activities" "TCC - Try-Confirm/Cancel"; do
        case $yn in
            "XA" ) sample=1; handle_xa_samples; break;;
            "LRA - Long Running Activities" ) sample=2; handle_lra_samples; break;;
            "TCC - Try-Confirm/Cancel" ) sample=3; handle_tcc_samples; break;;
        esac
    done
    cd "${ROOT}"
}

remove_coordinator() {
    if [ $environment == 1 ]; then
        printf "${GREEN}\nDeleting docker container "
        docker container stop otmm
        docker container rm otmm
    else
        printf "${GREEN}\nUninstalling MicroTx transaction coordinator helmchart from the cluster."
        helm uninstall -n otmm otmm
        printf "${GREEN}\nDeleting otmm namespace and all resources created in it."
        kubectl delete ns otmm
    fi
}

clean_up_tmm() {
    printf "${GREEN}\nDo you want to uninstall the transaction coordinator installation?\n"
    select yn in "Yes" "No"; do
        case $yn in
            Yes ) remove_coordinator; break;;
            No ) break;;
        esac
    done
}

kill_process() {
    for i in "${PIDS[@]}"; do
        kill -9 $i
    done
}

remove_samples() {
    if [ $environment == 1 ]; then
        printf "${GREEN}\nStopping all running microservices."
        kill_process
    else
        printf "${GREEN}\nUninstalling deployed sample helmcharts from the cluster."
        if [ $sample == 1 ]; then
            helm uninstall -n otmm transfer
        elif [ $sample == 2 ]; then
            helm uninstall -n otmm sampleappslra
        else
            if [ $language == 1 ]; then	
                helm uninstall -n otmm sampleappstcc	
            else	
                helm uninstall -n otmm sampleappstccnode	
            fi
        fi
    fi
}

clean_up_samples() {
    printf "${GREEN}\nDo you want to uninstall the deployed sample apps?\n"
    select yn in "Yes" "No"; do
        case $yn in
            Yes ) remove_samples; break;;
            No ) break;;
        esac
    done
}

remove_minikube() {
    printf "${GREEN}\nDeleting minikube cluster"
    minikube delete
    rm $HOME/.kube/minikube
}

remove_istio() {
    printf "${GREEN}\nUninstalling istio from the cluster."
    istioctl x uninstall --purge
    kubectl delete ns istio-system
}

kill_dashboard_process() {
    for i in "${DASHBOARD_PIDS[@]}"; do
        kill -9 $i
    done
}

# Not uninstalling Prometheus, as it could be used for other application metrics.
clean_up_istio_dashboards() {
  if [ $environment == 3 ]; then
     if [ ! -z "$(kubectl get pods -n istio-system --selector='app in (kiali,jaeger)' -o jsonpath='{.items[*].status.phase}')" ]; then
         printf "${GREEN}\nDo you want to uninstall dashboard services (Kiali and Jaeger) on istio-system ?\n"
         select yn in "Yes" "No"; do
            case $yn in
              Yes )
                  kill_dashboard_process
                  printf "${GREEN}\nUninstalling istio Dashboards.\n";
                  istio_version=$(istioctl version -o json | jq -r ".meshVersion[0].Info.version")
                  istio_major_version=$(echo $(istioctl version -o json | jq -r ".meshVersion[0].Info.version") | awk -F'.' '{printf "%s.%s" , $1,$2}')
                  printf "${GREEN}Installed istio version is ${istio_version} and major version is ${istio_major_version}\n"

                  kialiDeploymentName=$(kubectl get deployment -n istio-system --selector=app=kiali -o jsonpath='{.items[*].metadata.name}')
                  if [[ ! -z "$kialiDeploymentName" ]]; then
                      printf "${GREEN}\nUninstalling Kiali dashboard\n";
                      kubectl delete -f https://raw.githubusercontent.com/istio/istio/release-${istio_major_version}/samples/addons/kiali.yaml
                      printf "${GREEN}\nKiali dashboard uninstalled from istio-system namespace\n";
                  fi

                  jaegerDeploymentName=$(kubectl get deployment -n istio-system --selector=app=jaeger -o jsonpath='{.items[*].metadata.name}')
                  if [[ ! -z "$jaegerDeploymentName" ]]; then
                      printf "${GREEN}\nUninstalling Jaeger dashboard\n";
                      kubectl delete -f https://raw.githubusercontent.com/istio/istio/release-${istio_major_version}/samples/addons/jaeger.yaml
                      printf "${GREEN}\nJaeger dashboard uninstalled from istio-system namespace\n";
                  fi
                break;;
              No ) break;;
            esac
         done
     fi
  fi
}

clean_up_istio() {
    if [ $environment == 2 ]; then
        printf "${GREEN}\nDo you want to delete minikube?\n"
        select yn in "Yes" "No"; do
            case $yn in
                Yes ) remove_minikube; break;;
                No ) break;;
            esac
        done
    elif [ $environment == 3 ]; then
        printf "${GREEN}\nDo you want to uninstall istio?\n"
        select yn in "Yes" "No"; do
            case $yn in
                Yes ) remove_istio; break;;
                No ) break;;
            esac
        done
    fi
}

clean_up() {
    if [ $1 == "y" ]; then
        clean_up_samples
    fi
    if [ $1 == "y" ]; then
        clean_up_tmm
    fi
    if [ $1 == "y" ]; then
        clean_up_istio_dashboards
        clean_up_istio
    fi
    exit 1
}


check_application_ports(){
    REQUIRED_PORTS_IN_USE=false
    if [ $environment == 1 ]; then
        application_ports=(8080 8081 8082 8083)
        printf "${GREEN}\nChecking if the required application ports (${application_ports[*]}) are available\n";
        sleep 10
        if cli_exists netstat; then
            for port in "${application_ports[@]}"; do
                if netstat -an | grep -w "$port" | grep -q "ESTABLISHED\|LISTEN"; then
                    printf "${RED}\nError: Port $port is already in use. Please stop the associated process and make the port available to proceed further.\n";
                    REQUIRED_PORTS_IN_USE=true
                fi
            done
        elif cli_exists lsof; then
            for port in "${application_ports[@]}"; do
                if lsof -Pi :"$port" -sTCP:LISTEN | grep "$port" | grep -q "ESTABLISHED\|LISTEN"; then
                printf "${RED}\nError: Port $port is already in use. Please stop the associated process and make the port available to proceed further.\n";
                REQUIRED_PORTS_IN_USE=true
                fi
            done
        fi
    fi
    if [ "$REQUIRED_PORTS_IN_USE" = true ]; then
        exit 1
    fi
}

check_selinux(){
    if [ $environment == 1 ] && cli_exists sestatus; then
        if sestatus | grep -q "SELinux status.*enabled"; then
            printf "${GREEN}\nCurrent linux environment has SELinux enabled.\n";
            IS_SE_LINUX="true"
        fi
    fi
}

check_software_prerequisites(){
    check_selinux
    if cli_exists podman; then
       alias docker=podman
       COORDINATOR_DOCKER_NETWORK_MODE="host"
       SYSTEM_INFO=$(uname -sm)
       if [[ "$SYSTEM_INFO" == Darwin* ]]; then
           CONTAINER_LOCAL_HOST="host.docker.internal"
       else
           CONTAINER_LOCAL_HOST="localhost"
       fi

       printf "${GREEN}\nUsing podman as container engine and containers will run in host network mode.\n";
    elif cli_exists docker; then
       printf "${GREEN}\nUsing docker as container engine and containers will run in host-gateway mode.\n";
    else
       printf "${RED}\nError: Either podman or docker is required to run this script.\n";
       exit 1
    fi

    if ! cli_exists java; then
       printf "${RED}\nError: java is not installed. JDK 17+ is required to run this script.\n";
       exit 1
    else
        java_version=$(java -version 2>&1 | grep version | awk -F '"' '{print $2}' | awk -F '.' '{print $1}')
        if [ ! "$java_version" -ge 17 ]; then
            printf "${RED}\nError: Java version is not above 17. JDK 17+ is required to run this script.\n";
            exit 1
        fi
    fi

    if ! cli_exists mvn; then
        printf "${RED}\nError: Maven CLI is not installed. Maven is required to run this script. Please install maven with JAVA_HOME property set.\n";
        exit 1
    fi

    if [ $environment == 2 ] || [ $environment == 3 ]; then
        if ! cli_exists helm; then
            printf "${RED}\nError: Helm CLI is not installed. Helm is required to run this script.\n";
            exit 1
        fi

        if ! cli_exists kubectl; then
            printf "${RED}\nError: kubectl CLI is not installed. kubectl is required to run this script on Kubernetes environment.\n";
            exit 1
        fi

        if ! cli_exists istioctl; then
            printf "${RED}\nError: istioctl CLI is not installed. Istio is required to run this script.\n";
            exit 1
        fi

        if [ $environment == 2 ] && ! cli_exists minikube; then
            printf "${RED}\nError: Please install minikube. minikube cli is required to run this script.\n";
            exit 1
        fi
    fi
    check_application_ports
}



check_input_log_file(){
    if [ -f "$MICROTX_INPUT_FILE" ]; then
        printf "${GREEN}\nUser input file exist. Do you want to reuse the values provided earlier ?\n"
        select yn in "Yes" "No"; do
            case $yn in
                 Yes ) . "${MICROTX_INPUT_FILE}";
                       break;;
                 No ) rm ${MICROTX_INPUT_FILE};
                       break;;
            esac
        done
    fi
}

is_distribution_package_available(){
  if [[ -n "$DISTRIBUTION_PACKAGE_PATH" ]]; then
      return 0
  else
      return 1
  fi
}
check_for_distribution_package(){
    if [ -f "$MICROTX_INPUT_FILE" ]; then
        printf "${GREEN}\nDo you want to use microtx distribution package?\n"
        select yn in "Yes" "No"; do
            case $yn in
                 Yes ) printf "${GREEN}\nDo you have  microtx distribution package downloaded?\n"
                                 select xy in "Yes" "No"; do
                                    case $xy in
                                                    Yes ) printf "${GREEN}\n Enter path for microtx distribution package\n";
                                                          read DISTRIBUTION_PACKAGE_PATH
                                                          echo "DISTRIBUTION_PACKAGE_PATH=$DISTRIBUTION_PACKAGE_PATH" >> "$MICROTX_INPUT_FILE";
                                                          break;;
                                                    No ) printf "${GREEN}\n Download the Distribution package from ${DISTRIBUTION_PACKAGE_LINK}";
                                                         printf "${GREEN}\n After successful download rerun the script";
                                                          break;;
                                               esac
                                done
                       break;;
            esac
        done
    fi
}

cleanup_input_log_file(){
    if [ -f "$MICROTX_INPUT_FILE" ]; then
        printf "${GREEN}\nUser input file is present from the current execution and it contains database details. Do you want to delete it ?\n"
        select yn in "Yes" "No"; do
            case $yn in
                 Yes ) rm ${MICROTX_INPUT_FILE};
                       break;;
                 No ) break;;
            esac
        done
    fi
}


start() {

    ROOT=$PWD
    MICROTX_INPUT_FILE="$ROOT/$MICROTX_INPUT_FILE"
    printf "${GREEN}\nEnter a number (1-3) to specify the platform on which you want to run the microservice\n"
    select yn in "Docker - only the transaction coordinator will run in a docker container and the sample microservices will run in the local environment" "Minikube" "Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE)"; do
    case $yn in
        "Docker - only the transaction coordinator will run in a docker container and the sample microservices will run in the local environment" ) environment=1; break;;
        "Minikube" ) environment=2; break;;
        "Oracle Cloud Infrastructure Container Engine for Kubernetes (OKE)" ) environment=3; break;;
    esac
    done
    if [ $environment == 1 ] || [ $environment == 2 ]; then 
        printf "${GREEN}\nWarning: Transaction coordinator and the sample microservices will run without TLS. Do you want to continue?\n"
        select yn in "Yes" "No"; do
            case $yn in
                Yes ) break;;
                No ) exit 1;;
            esac
        done
    fi
    check_input_log_file
    check_software_prerequisites

    handle_environment_prerequisites
    install_istio
    install_istio_dashboards
    create_namespace
    create_image_pull_secret
    handle_tmm
    handle_samples
    sleep 10
    printf "${GREEN}\nPress any key to exit."
    read -n 1 -s
    clean_up "y" "y" "y"
    printf "${GREEN}\nCompleted."
}

# Starting point
start