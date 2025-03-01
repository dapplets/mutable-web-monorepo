# Backend

Run Docker container with PostgreSQL

```sh
docker run --name mweb-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -e POSTGRES_DB=mweb -p 5432:5432 -d postgres
```