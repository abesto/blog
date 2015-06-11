---
author: Zoltán Nagy
layout: post
title: "CI for a Coding Dojo"
date: 2014-03-24 18:24
comments: true
categories:
---

Suppose you're hosting a [coding dojo](http://codingdojo.org/) and want to do
continuous integration; that is, you want to always show the state of the tests
while editing code. Here's a pretty stable solution I came up with after a few
tries.

<!-- more -->

I want to use two projectors: one for showing the test state, the other for
showing the code under development. This means using two computers, and that I
need to sync between them. If you're using a single machine, then you
can still use the same setup, or just leave out the `rsync` part. A quick
summary of what's going in; if you feel like it, this is enough to roll your
own:

```
    inotifywatch / fswatch
             |
             |
        rsync|client
             |                           dev machine
---------+--------------------------------------
             |                            ci machine
        rsync|server
             |
             |
    inotifywatch / fswatch
             |
             |
       compile, test
```

The things that need to happen in order, when a change is saved on the
development machine:

## 1. inotifywatch / fswatch starts an rsync operation

```sh
#!/bin/sh
remote=$1
fswatch . "date +%H:%M:%S && rsync -viru --delete . rsync://$remote/dojo"
```

This will start `fswatch` (on OSX; use `inotifywatch` on Linux), set it to watch
`pwd`, and start an `rsync` of the directory to the rsync server running on the
CI machine. You'll need to pass the `host:port` of the rsync server to this
script. `dojo` is the name of the `rsync` module configured on the server (see
below).

## 2. rsync sends changes to the server

An `rsync` server needs to be running on the CI machine. You can start one
simply by doing `rsync --daemon --no-detach --config=./rsyncd.conf`. The
interesting stuff is in `./rsyncd.conf`:

```
pid file = /tmp/dojo-rsyncd.pid
log file = /tmp/dojo-rsyncd.log
address = 0.0.0.0
port = 8873
use chroot = false

[dojo]
path = /tmp/dojo-ci-server
uid = abesto
read only = no
```

The `dojo` section is what I hinted at in the previous section. Most of this is
pretty self-explanatory. Note that the `rsync` server logs only to the log file
you set here, never to `STDOUT`. Make sure the directory `/tmp/dojo-ci-server`
is created before you start the server, and that it's writable by the user
running the `rsync` server.

## 3. The change should trigger build/test on the CI machine

Simply using `fswatch`:

```sh
#!/bin/sh
cd /tmp/dojo-ci-server
fswatch . build-and-test.sh
```

## 4. Build, test

This will depend on what technology you're using in the dojo. Using
[figlet](http://www.figlet.org/) to have a big, nice, ASCII status saying ERROR
or FAIL or PASS works very well (the font `banner3` is one that's pretty good
for this).

## Other things I've tried

 * `sshfs` with `osxfuse`: almost there, but it seems that the mounted file
   system doesn't support events on OSX, so `fswatch` doesn't pick up the
   changes.
 * Dropbox: works, but there's a longish delay between the save and the
   build/test run.

Finally, an example of the whole thing: https://github.com/abesto/bphug-dojo/tree/master/ci
