# DSN Validator

### Build

```
docker pull contribsys/faktory
docker build --platform=linux/arm64 -t client client/
docker build --platform=linux/arm64 -t server server/
```

### Run

If you're using `docker-compose`, run `docker-compose up -d --build`.
Alternatively you can use the following commands.

```
docker run --rm -it -p 7419:7419 -p 7420:7420 contribsys/faktory:latest
docker run --env FAKTORY_HOST=host.docker.internal --rm -v /tmp/uploads:/app/uploads client
docker run --env FAKTORY_HOST=host.docker.internal --rm -p 8080:8080 -v /tmp/uploads:/app/uploads server
```

The server doesn't need to be dockerized if you have `deno` locally. For example
you can use the `--watch` or `--inspect` flag for development purposes.

```
brew install deno
deno run --watch --allow-net --allow-write --allow-env server/main.ts
```

Sending a file to the parser can be done using either the form on
http://localhost:8080 or using the following `cURL` command.

```sh
# Define the path of the DSN
FILE_PATH=$HOME/Downloads/DSN_DUPLICATED-Demo-account-DEMO-FR.txt

# Upload the file to the server
curl -v -F file=@$FILE_PATH http://localhost:8080/upload
```
