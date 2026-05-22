# Troubleshooting

This page lists common issues and fixes while running `quickstart.sh`, especially on Minikube.

## 1) Resource changes are not applied in Minikube

If CPU or memory values are changed, restart Minikube for the changes to take effect:

```bash
minikube delete
minikube start
```

## 2) Database or app pods are slow to become ready

Oracle Database startup can take **5-10 minutes** in some environments.

Check pod status:

```bash
kubectl get pods -n otmm
kubectl get pods -n oracledb-free
```

## 3) Pod issues (crash/restart/not ready)

Use describe and logs for diagnostics:

```bash
kubectl describe pod <POD> -n <NAMESPACE>
kubectl logs <POD> -n <NAMESPACE>
```

## 4) Istio issues

Verify Istio pods are running:

```bash
kubectl get pods -n istio-system
```

## 5) Keep Minikube tunnel running

The OTMM Console requires `minikube tunnel` to stay active.

## 6) Script cleanup-phase errors (404/500)

During first-time install, **404/500 errors in cleanup phase can be expected and benign**.

## 7) Context issues while running kubectl/minikube commands

If commands fail due to context mismatch, update Minikube context:

```bash
minikube update-context
```

## 8) Console page not loading in browser

Restart the console pod and wait for it to become ready:

```bash
kubectl delete pod -l app=otmm-console -n otmm
kubectl get pods -n otmm
```

Then open:

```text
http://<istio-ingress-host>/consoleui/
```

## 9) DNS resolver fix inside Minikube

Update DNS nameservers in Minikube:

```bash
minikube ssh -- "echo -e 'nameserver 1.1.1.1\nnameserver 8.8.8.8' | sudo tee /etc/resolv.conf"
```

Example output:

```text
nameserver 1.1.1.1
nameserver 8.8.8.8
```

## 10) Update CoreDNS configuration

```bash
kubectl get configmap coredns -n kube-system -o yaml > /tmp/coredns-backup.yaml
sed 's#forward \. /etc/resolv.conf#forward . 1.1.1.1 8.8.8.8#' /tmp/coredns-backup.yaml > /tmp/coredns-modified.yaml
kubectl apply -f /tmp/coredns-modified.yaml
kubectl rollout restart deployment coredns -n kube-system
```

## 11) FREE edition package prerequisite

If the distribution package is FREE edition, run this command where `quickstart.sh` script is present. Skip this if you are using Enterprise Edition.

Linux:

```bash
sed -i \
  -e 's|transaction-coordinator-amd\.tar\.gz|transaction-coordinator-free-amd.tar.gz|g' \
  -e 's|transaction-coordinator-arm\.tar\.gz|transaction-coordinator-free-arm.tar.gz|g' \
  -e 's|workflow-server-amd\.tar\.gz|workflow-server-free-amd.tar.gz|g' \
  -e 's|workflow-server-arm\.tar\.gz|workflow-server-free-arm.tar.gz|g' \
  quickstart.sh
```

macOS / BSD:

```bash
sed -i '' \
  -e 's|transaction-coordinator-amd\.tar\.gz|transaction-coordinator-free-amd.tar.gz|g' \
  -e 's|transaction-coordinator-arm\.tar\.gz|transaction-coordinator-free-arm.tar.gz|g' \
  -e 's|workflow-server-amd\.tar\.gz|workflow-server-free-amd.tar.gz|g' \
  -e 's|workflow-server-arm\.tar\.gz|workflow-server-free-arm.tar.gz|g' \
  quickstart.sh
```

---

[← Back to Quickstart Home](./README.md)
