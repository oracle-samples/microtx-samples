## PAR URL

[AI-World-2026-HOL-Resource](https://objectstorage.us-ashburn-1.oraclecloud.com/p/FPr4ZUR9MUwd-_ttlsCINprmV-6N9U39nD_--Z1j2nUwLo3VBABqREzN-IeeKwK2/n/oabcs1/b/MicroTx-Share/o/HOL-2026-ResourceAI-World.txt)


## Troubleshooting: UI Server is unresponsive

If UI becomes unresponsive, copy and execute below command:

```
kubectl delete pod -l app=otmm-console -n workflow && kubectl wait --for=condition=Ready pod -l app=otmm-console -n workflow --timeout=120s && sleep 60
```

This command will restart the UI server.