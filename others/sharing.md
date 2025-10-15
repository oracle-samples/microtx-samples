## PAR URL

[HOL-Resource](https://objectstorage.us-ashburn-1.oraclecloud.com/p/aPLJo5Zzd8KKE1SHr8CSXrmkcqoRuvLk3NgD4n0Kc-_B9nVl-9DQJJsEFwQeU-Vb/n/oabcs1/b/MicroTx-Share/o/HOL-2025-ResourceAI-World.txt)


## Troubleshooting: UI Server is unresponsive

If UI becomes unresponsive, copy and execute below command:

```
kubectl delete pod -l app=otmm-console -n workflow && kubectl wait --for=condition=Ready pod -l app=otmm-console -n workflow --timeout=120s && sleep 60
```

This command will restart the UI server.
