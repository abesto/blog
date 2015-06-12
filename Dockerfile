FROM nginx

MAINTAINER Zoltan Nagy "abesto@abesto.net"

# Locale
RUN apt-get update && apt-get install locales && \
    dpkg-reconfigure locales && \
    locale-gen C.UTF-8 && \
    /usr/sbin/update-locale LANG=C.UTF-8
ENV LC_ALL C.UTF-8

# Install all system packages
RUN apt-get install git ruby ruby-dev build-essential python nodejs -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Ruby build dependencies, clean up system dependencies we won't need afterwards
ADD Gemfile.lock /src/Gemfile.lock
ADD Gemfile /src/Gemfile
WORKDIR /src
RUN gem install bundler && \
    bundle install --path .bundle-dir --without test

# Build site, remove stuff we won't need at runtime
# Cleanup here won't remove image size, but it will make the runtime container cleaner
ADD . /src
RUN bundle exec jekyll build -s /src -d /blog && \
    apt-get --purge -y remove ruby python nodejs build-essential git && \
    apt-get clean

# Finally, add the nginx conf
COPY nginx.conf /etc/nginx/conf.d/blog.conf
