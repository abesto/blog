FROM ubuntu

RUN apt-get update
RUN apt-get install git ruby1.9.3 build-essential language-pack-en python python-dev wget -y

ENV LC_ALL en_US.utf8

# install octopress dependencies
RUN wget https://raw.githubusercontent.com/abesto/blog/master/Gemfile
RUN gem install bundler
RUN bundle install
