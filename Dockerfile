FROM dockerfile/nginx

RUN apt-get update
RUN apt-get install git ruby1.9.3 build-essential language-pack-en-base -y

ADD . /blog
WORKDIR /blog

RUN gem install bundler
RUN bundle install

ENV LANG en_US.utf8
ENV LC_ALL en_US.utf8
RUN bundle exec rake generate

COPY nginx.conf /etc/nginx/sites-enabled/blog
