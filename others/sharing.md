## Keys

### key 1
```
abcgelsfhsdjfwgjpg
```

### key 2 
```
ghgoeivnveijgrpmeb
```

### key 3
```
vgeheqogbvpdjfbpqe
```


## Troubleshooting: UI Server is unresponsive

If UI becomes unresponsive, copy and execute below command:

```
kubectl delete pod -l app=otmm-console -n workflow && kubectl wait --for=condition=Ready pod -l app=otmm-console -n workflow --timeout=120s && sleep 60
```

This command will restart the UI server.
