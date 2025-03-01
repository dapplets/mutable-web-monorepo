# Backend

## Development

### Run PostgreSQL

Run Docker container with PostgreSQL

```sh
docker run --name mweb-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -e POSTGRES_DB=mweb -p 5432:5432 -d pgvector/pgvector:pg16
```

### Install OpenSaaS

Install OpenSaaS in Kubernetes:

```sh
helm repo add openfaas https://openfaas.github.io/faas-netes/
helm repo update
kubectl create namespace openfaas-fn
helm upgrade openfaas --install openfaas/openfaas --create-namespace --namespace openfaas
```

Specify `--set ingress.enabled=true` to use IngressController with TLS.
See more info at [OpenFaaS Documentation](https://github.com/openfaas/faas-netes/blob/master/chart/openfaas/README.md#2-install-with-helm)

To verify that openfaas has started, run:

```sh
kubectl -n openfaas get deployments -l "release=openfaas, app=openfaas"
```

To retrieve the admin password, run:

```sh
echo $(kubectl -n openfaas get secret basic-auth -o jsonpath="{.data.basic-auth-password}" | base64 --decode)
```

Fetch your public IP or NodePort via 

```sh
kubectl get svc -n openfaas gateway-external -o wide
```

Visit `http://127.0.0.1:31112/`
