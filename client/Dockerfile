FROM denoland/deno:1.14.2

WORKDIR /app

RUN echo 'deb http://httpredir.debian.org/debian-security stretch/updates main' >/etc/apt/sources.list.d/jessie-backports.list

# Install OpenJDK-8
RUN apt-get update && \
  apt-get install -y openjdk-8-jre-headless && \
  apt-get clean;

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deps.ts .
RUN deno cache --unstable deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --unstable main.ts

CMD ["run", "--allow-read", "--allow-write", "--allow-run", "--allow-net", "--allow-env", "--unstable", "main.ts"]
