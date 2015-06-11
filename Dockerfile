FROM nginx

MAINTAINER Zoltan Nagy "abesto@abesto.net"

RUN apt-get update && apt-get install locales && \
    dpkg-reconfigure locales && \
    locale-gen C.UTF-8 && \
    /usr/sbin/update-locale LANG=C.UTF-8
ENV LC_ALL C.UTF-8

ADD . /src

RUN apt-get install git ruby ruby-dev build-essential python nodejs -y && \
    gem install pygments.rb jekyll --no-ri --no-rdoc && \
    jekyll build -s /src -d /blog && \
    apt-get --purge -y remove git ruby-dev ruby build-essential python nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/conf.d/blog.conf
