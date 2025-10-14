# Troubleshooting: otmm-console UI Unresponsive

If the UI becomes unresponsive, follow these steps to restart the `otmm-console` pod:

```
kubectl delete pod -l app=otmm-console -n workflow && kubectl wait --for=condition=Ready pod -l app=otmm-console -n workflow --timeout=120s && sleep 60
```
This command will restart the `otmm-console` pod and wait for it to become ready.
