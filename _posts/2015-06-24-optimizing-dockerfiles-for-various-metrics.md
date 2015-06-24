---
title: Optimizing Dockerfiles for various metrics
---

When optimizing algorithms, we make trade-offs between space, run-time
complexity and code complexity. Methods for exploring these trade-offs
are quite well researched. Similarly, when optimizing `Dockerfile`s, we make
trade-offs between the complexity of the `Dockerfile`, build time from
zero, incremental build-time, number of FS layers and ultimate image
size. In this post I explore parts of this latter family of trade-offs.

<!-- more -->

## Base-line

Let's establish a base `Dockerfile` to measure our work against. This
is a simplified version of the `Dockerfile` used to generate and host
this very blog.

```docker
FROM nginx

# Locale
RUN apt-get update
RUN apt-get install locales
RUN dpkg-reconfigure locales
RUN locale-gen C.UTF-8
RUN /usr/sbin/update-locale LANG=C.UTF-8
ENV LC_ALL C.UTF-8

# Install all system packages
RUN apt-get install git ruby ruby-dev build-essential python nodejs -y

# Install Ruby build dependencies
ADD Gemfile.lock /src/Gemfile.lock
ADD Gemfile /src/Gemfile
WORKDIR /src
RUN gem install bundler
RUN bundle install --path .bundle-dir --without test

# Build site
ADD . /src
RUN bundle exec jekyll build -s /src -d /blog

# Finally, add the nginx conf
COPY nginx.conf /etc/nginx/conf.d/blog.conf
```

| Metric | Value | Comment |
| ------ | ----- | ------ |
| Initial build time | 3m50s | `time docker build --no-cache .` |
| Repeat build time | 1s | The same build ran again, without the `--no-cache` option |
| Incremental build time | 5s | Updated a blog post and ran without `--no-cache` |
| Nr. of FS layers | 11 | Does NOT include the base image `nginx`. |
| Image size | 340.246MB | Does NOT include the base image `nginx`. For reference, the size of the `nginx` image is 126.682MB. |

Please keep in mind that build times are not benchmarks for anything
useful in themselves; they will only be useful when comparing
different incarnations of the `Dockerfile`.

Scripts used to generate the last two metrics:

```sh
# Nr. of FS layers
expr $(docker history -q $IMAGE | wc -l) - $(docker history -q nginx | wc -l)
# Image size
expr $(docker inspect $IMAGE | jq '.[0].VirtualSize') - \
     $(docker inspect nginx | jq '.[0].VirtualSize') | \
     awk '{ foo = $1 / 1024 / 1024 ; print foo "MB" }'
```
