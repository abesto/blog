---
title: 'I&#8217;m writing an IRC server'
author: Zoltán Nagy
layout: post
permalink: /im-writing-an-irc-server
robotsmeta:
  - index,follow
categories:
  - Server
tags:
  - python
  - python-ircd
---
Yes, really, in 2012. See here, it’s on [GitHub][1].

 [1]: https://github.com/abesto/python-ircd

### Why, in the name of all that is 8-bit?

For one, it’s fun. The core protocol is well defined by the RFCs.  In the web development world you don’t often get to program to specifications like that; it’s a nice change of pace. There’s no need for any front-end work either. I get to write Python, which I haven’t done for a while. And finally, it’s my own free time, nowgetoffmydamnlawn.

<!-- more -->

### Networking

I wrote basically zero networking code – [gevent][2] does all the hard work.

 [2]: http://www.gevent.org/

> gevent is a [coroutine][3]-based [Python][4] networking library that uses [greenlet][5] to provide a high-level synchronous API on top of the [libevent][6] event loop.

 [3]: http://en.wikipedia.org/wiki/Coroutine
 [4]: http://www.python.org/
 [5]: http://codespeak.net/py/0.9.2/greenlet.html
 [6]: http://monkey.org/~provos/libevent/

Pure goodness. It’s also ridiculously easy to use.  Note the mention of coroutines – gevent abstracts away not only the bit pushing of low-level networking, it also takes care of the handler threads greenlets. Here’s the networking code of the IRC server, all four lines of it:

```python
    def handle(socket, address):
        fileobj = socket.makefile('rw')
        # From here on, I can just use fileobj as a simple file object.
        # Yes, fileobj.close() will close the socket.

    server = gevent.server.StreamServer(('127.0.0.1', 6667), handle)
    server.serve_forever()
```

### Design and implementation

The server has four main components at the moment:

*   abnf.py: Parses and checks the ABNF grammars specified in the RFCs. No regular expressions, but not a full-fledged ABNF parser either; just some helper functions that can be considered to be a semi-complete DSL. Pretty strict syntax checking.
*   dispatcher.py: loads and calls command handlers as needed. Uses some `importlib` trickery to load handlers based on the incoming commands.
*   commands: Command handlers. They get and return abstract Message objects, and operate on the server database.
*   db: Contains the server state: users, channels, other servers when I get to that. Currently just a simplistic implementation with dictionaries, but it’s probably enough for this project.

Currently enough commands are implemented to allow irssi to connect, join a channel, and have a conversation in a channel or in private (no user lists yet though). Adding new commands is pretty simple, so I hope to have a mostly functional server soon. I’m not too optimistic about how the current parser can be extended to support less compliant clients; it’ll probably have to be replaced with a more robust design.
