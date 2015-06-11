---
title: Node.js, Express and CoffeeScript
permalink: /node-js-express-and-coffeescript
robotsmeta:
  - index,follow
categories:
  - Client
  - Server
tags:
  - coffee-script
  - node.js
---
The solution oultlined here uses the compiler Connect middleware, which was removed in Connect 1.7 (and therefore in newer Express.js versions). The new alternative is [connect-assets][1].
Thanks to [Marcel Miranda][2] for pointing this out.

I’ve been working on a moderately complex hobby project for a while using [Node.js][3] and [CoffeeScript][4]. This is the first of a few posts on what I’ve learned so far. This time: using CoffeeScript on the client- **and** the server-side and auto-compiling client side scripts on the fly with [Express][5].

 [1]: https://github.com/TrevorBurnham/connect-assets
 [2]: http://reaktivo.com
 [3]: http://nodejs.org/
 [4]: http://jashkenas.github.com/coffee-script/
 [5]: http://expressjs.com/

The goal of the project is, by the way, to illustrate some common algorithms in the browser. You can check it out at GitHub: , or see a running version at [http://algo-abesto.dotcloud.com][6]. The blank area next to the controls is where you can draw your graph.

 [6]: http://algo-abesto.dotcloud.com/

## Server side

The theory is simple: CoffeeScript code is equivalent to JavaScript code. Node.js can thus be programmed in CoffeeScript. In practice, things turn out to be just as simple: write your code in CoffeeScript, use the file extension .coffee, and use `coffee app.coffee` to start your application. Even `require` works out of the box. You can see an example [here][7] (using [Express][5])

 [7]: https://github.com/abesto/algo/blob/nodejs/app.coffee

## Client side

This section assumes you’re using the Express web framework.

Express has support for *compilers*, and a compiler is shipped for `CoffeeScript`. Setting up the paths is not well documented, unfortunately. Here’s how it works: for each compiler you’ll specify a `src` and a `dest` folder, without a trailing `/`. The request path sent by the browser is appended to this.

`http://localhost:9000/js/foo/bar.js` will map to the source file `src/foo/bar.coffee` and the compiled file `dest/foo/bar.js`. If the compiled file doesn’t exist or is older than the source file then it will be (re)compiled. If there’s an error during compilation, then the browser will receive a 500 error.

What will **NOT** be done is:

*   Express won’t remove the compiled file if the source file is removed
*   Express won’t create any missing directory structure. If `dest/foo` doesn’t exist, then Express will return a 404 error to the browser. If you know how to work around this, please write a few lines :)

Note: this was originally posted to a previous version of this blog on 01. November 2011.
