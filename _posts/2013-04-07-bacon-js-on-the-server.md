---
title: Bacon.js on the Server
author: Zoltán Nagy
layout: post
permalink: /bacon-js-on-the-server
robotsmeta:
  - index,follow
categories:
  - Server
tags:
  - coffee-script
---

Using Bacon.js to escape from Butcher Bay callback hell has been quite a pleasant, if mind-bending, experience. However, there hasn’t been too much talk about real usage on the server-side. I’d like to remedy this situation with some examples and tips I learned while converting a simple hand-coded REST API to Bacon.js.

<!-- more -->

## Bacon what on the server?

[Bacon.js][1] is a library for [functional reactive programming][2] in JavaScript. The basic idea is that instead of handling individual events, we can manipulate streams of events: merge them, filter them, define transformations on the events, combine them in fun ways. If this is the first time you hear of Bacon.js, you should check out [this presentation][3] from the author at mloc.js. [The slides][4] are also available. The documentation describes all the functionality provided by the library. The rest of this post assumes you already have some experience with using Bacon.

 [1]: https://github.com/raimohanska/bacon.js
 [2]: http://en.wikipedia.org/wiki/Functional_reactive_programming
 [3]: http://www.ustream.tv/recorded/29299079
 [4]: https://github.com/raimohanska/bacon-mloc

## Example one: create

Let’s assume we have a resource called `tab`. We’ll define a `create` method without using Bacon first, then see how it can be rewritten using function reactive programming. Our requirements:

*   read the field called ‘text’ from the body of the request
*   write the new tab to redis, and add it to a list of tabs
*   return a 500 response if anything goes wrong
*   respond with the new object if we succeed

So first, let’s see the traditional implementation. Let’s assume we have a redis client instance called `redis`. Further assume that `app` is an Express application.

```coffeescript
    app.post '/tab', (req, res) ->
      redis.incr 'tab', (err, id) ->
        return res.send 500, err if err
        key = tabKey(id)
        json = JSON.stringify {id: id, text: req.body.text}
        redis.set key, json, (err) ->
          return res.send 500, err if err
          redis.rpush tabsListKey, id, (err) ->
            return res.send 500, err if err
            res.send 201, json
```


Weak points: impending callback hell, error handling all over the place. Let’s see what a first implementation with Bacon might look like. First, we’ll need some way to send a response based on an EventStream.

```coffeescript
    respond = (res, stream, retCode) ->
      stream.onValue _.bind(res.send, res, retCode || 200)
      stream.onError _.bind(res.send, res, 500)
```

And the actual `create` method:

```coffeescript
    app.post '/tab', (req, res) ->
      id = Bacon.fromNodeCallback(redis.incr, 'tab').toProperty()
      key = id.map(tabKey)
      json = Bacon.combineTemplate({id: id, text: req.body.text}).map(JSON.stringify)
      create = Bacon.fromNodeCallback(redis.set, key, json)
      addToList = create.flatMap -> Bacon.fromNodeCallback(redis.rpush, tabsListKey, id)
      respond res, addToList.map(json), 201
```

Points of interest:

*   No callback hell (of course, since we’re using Bacon; still worth pointing out)
*   The last line is a bit complex, even if short. It waits for `addToList` to emit an event, then responds based on that event and the json value: if there’s an error, it will respond with an error; if there’s no error, it responds with the json.
*   Error handling happens in a single place: `respond`. All `Error` events are propagated through the streams, and end up in `respond`; that’s the only place we need to care about the non-happy path. (Of course if you need to do cleanup in error cases, you need to do that manually).

This can still be improved though: `Bacon.fromNodeCallback(redis.rpush, ...)` feels a bit clumsy. Let’s implement a helper method that wraps our redis client, making this nicer. The specification would be along the lines of “wrap an object with methods taking node-style callbacks, so that calling `object.method(args...)` on the wrapped object is equivalent to `Bacon.fromNodeCallback(object.method, args...)` using the original object”.

```coffeescript
    Bacon.wrapNodeApiObject = (obj) ->
      ret = {}
      for name, method of obj
        continue unless method instanceof Function
        do (name) ->
          ret[name] = (args...) ->
            Bacon.fromNodeCallback obj[name], args...
      ret
```

Using this, our `create` function becomes much more readable:

```coffeescript
    Bacon.redis = Bacon.wrapNodeApiObject redis
    app.post '/tab', (req, res) ->
      id = Bacon.redis.incr('tab').toProperty()
      key = id.map(tabKey)
      json = Bacon.combineTemplate({id: id, text: req.body.text}).map(JSON.stringify)
      create = Bacon.redis.set(key, json)
      addToList = create.flatMap -> Bacon.redis.rpush(tabsListKey, id)
      respond res, addToList.map(json), 201
```

This shows the main selling points I see in Bacon: centralized error handling (think Either monad in Haskell), no callback pyramids, easy to extend. Unfortunately there’s an initial bump: it’s a pretty different way of expressing your solution from both a procedural language and callback-based (Coffee|Java)Script.

## Example 2: update

Let’s take a look at a more complex example. In the case of an update, there are several error conditions we need to handle:

*   the tab the request is trying to update doesn’t exist
*   the request is trying to assign a different id to the object; we don’t want to allow that
*   redis errors, as we’ve seen before

In this case I’ll only show a Bacon-based implementation. There’s quite a lot going on here; explanations follow :)

```coffeescript
    app.put '/tab', (req, res) ->
      id = req.params.id
      key = tabKey(id)
      oldTab = Bacon.redis.get(key).toProperty().map(JSON.parse)
      response = oldTab.flatMap (tab) ->
        if tab == null
          Bacon.once [404, {error: 'tab not found'}]
        else if 'id' of req.body && req.body.id != tab.id
          Bacon.once [400, {error: 'id is read-only'}]
        else
          tab.text = req.body.text
          update = Bacon.redis.set(key, JSON.stringify(tab))
          update.map [204, null]
      response.onValue ([status, body]) -> res.send status, body
      response.onError (err) -> res.send 500, err
```

We’re catching special error cases in the branches of `oldTab.flatMap`. The stream we finally return is the first error we caught, or the result of the update operation (if there were no errors). Unfortunately here the HTTP status code comes from the stream itself, so we can’t use the previously defined `respond` function. Note that any redis errors will still get to `response` at some point, which will be handled by `onError`, resulting in a 500.

A weak point is that in the happy path we modify the original tab object, breaking the expectation that our objects are immutable (this comes from the “functional” part of FRP). Still, in this case it’s clear that this can’t cause problems because `tab` is not used anywhere else.

You can find the examples in context, with an improved `respond` function in [this][5] repo, specifically in these files:

 [5]: https://github.com/abesto/shopping-list

*   [Tab.coffee][6]: methods of the API endpoint
*   [BaconNode.coffee][7]: helper methods

 [6]: https://github.com/abesto/shopping-list/blob/0fc09d5bec879a9f649ff1e2eac0e240e6ed3ad7/routes/Tab.coffee
 [7]: https://github.com/abesto/shopping-list/blob/0fc09d5bec879a9f649ff1e2eac0e240e6ed3ad7/BaconNode.coffee

Have fun, happy hacking :)
