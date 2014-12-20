FROM ubuntu

RUN apt-get update
RUN apt-get install git ruby1.9.3 build-essential language-pack-en python python-dev wget -y

ENV LC_ALL en_US.utf8

ADD . /blog
WORKDIR /blog

RUN gem install bundler
RUN bundle install

RUN bundle exec rake generate
