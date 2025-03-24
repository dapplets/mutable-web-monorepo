# Backend

## Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Go to Settings, enable Kubernetes, click on Apply & Restart
3. Create `helm/values.yaml` and `.env` files as written above (see also `helm/values.example.yaml` and `.example.env`)
4. Install [Lens](https://k8slens.dev/) [Optionally]
5. Install [`kubectl`](https://kubernetes.io/docs/tasks/tools/)
6. Install [`helm`](https://helm.sh/docs/intro/install/)

## Install with Helm

Create `values.yaml` with the following secrets:

```yaml
openaiApiKey: sk-proj-example-key
nearAiApiKey: '{"account_id":"example.near","signature":"example==","public_key":"ed25519:example","callback_url":"http://localhost:54875/capture","nonce":"1234567890","recipient":"ai.near","message":"Welcome to NEAR AI","on_behalf_of":null}'
```

Install helm chart from GitHub Registry:

```bash
cd apps/crawler-backend
kubectl create namespace openfaas-fn
helm upgrade aigency oci://ghcr.io/dapplets/aigency --install --create-namespace --namespace aigency -f ./helm/values.yaml
```

If the `secrets "basic-auth" already exists` error occured, try this:

```bash
helm upgrade aigency oci://ghcr.io/dapplets/aigency --install --create-namespace --namespace aigency -f ./helm/values.yaml
helm uninstall aigency --namespace aigency
helm upgrade aigency oci://ghcr.io/dapplets/aigency --install --create-namespace --namespace aigency -f ./helm/values.yaml
helm upgrade aigency oci://ghcr.io/dapplets/aigency --install --create-namespace --namespace aigency -f ./helm/values.yaml
```

Aigency will be available at `http://localhost:30001`

Add port forwarding to PostgreSQL

```
kubectl port-forward service/postgres 5432 5432 --namespace aigency
```

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

## Build this project with Docker

```sh
cd mutable-web-monorepo
docker buildx create --use # if you didn't it before
docker buildx build --platform linux/amd64,linux/arm64 -f apps/crawler-backend/Dockerfile . --tag ghcr.io/dapplets/crawler-backend:latest --push
```

## Deploy to Kubernetes

Use the hash from the previous step

```sh
helm upgrade aigency ./helm --install --create-namespace --namespace aigency -f ./helm/values.yaml
```
