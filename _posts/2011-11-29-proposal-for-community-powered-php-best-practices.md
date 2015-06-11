---
title: 'Proposal: a Community-powered Collection of PHP Best Practices'
author: Zoltán Nagy
layout: post
permalink: /proposal-for-community-powered-php-best-practices
description:
  - >
    Proposal for a community-based collection of PHP best practices for solving
    middle to high level problems.
robotsmeta:
  - index,follow
categories:
  - Server
tags:
  - php
  - rant
---
Scott Griepentrog kindly rented a domain to use for this purpose and set up a publicly accessible Google Sites page. All that’s missing now is great content (actually, maybe not, if you’re from the future). You can find the wiki at [http://phpfu.org][1]

### Why?

 [1]: http://phpfu.org "PHP FU"

We all know the old argument on why PHP is often seen as a “bad” language: the barrier of entry is low, so lots of people will write PHP code without learning the fundamentals. However, the arguments usually stop there. Known fact, there’s nothing we can do. But maybe there is?

### What?

Let me be clear: I don’t want to teach design patterns to everyone who makes a worship site for their dog. What I’d like to see, and what I’m really missing, is a central repository of best practices for solving common middle to high-level problems. Ideally in a wiki format. What would this bring to the table? It would tell you that is, indeed, thoroughly solved, and also how it’s done. It can also be thought of as a FAQ of sorts, or a collection of best practices (emphasis on best).

Yes, Google is usually your friend. What Google doesn’t do is code review of blogs and tutorials. Let me give a trivial example: I’ve googled really hard when I needed to implement a secure authentication scheme. What I found was tens of “simple login script with PHP and SQL”. What I finally ended up with is basically what Phpass is doing – dynamic and static salts, bcrypt, you know the drill. It’s not as extensible or general, but the theory (and *probably* the security) is there. What I didn’t know was that Phpass existed. My Google-fu must have been weak that day or something.

I just looked until I found something good enough and went with it. I feel this is characteristic of a lot of development, and not always a bad thing. On the other hand it takes real experience to know what’s good enough, and this experience can come at a high price (especially when considering security).

> So what would this proposed wiki say on the topic of secure password storage?

Probably something like: “Use Phpass”. There, it’s not that complicated. Probably include a few good samples of using it, and we’re golden. A full framework-independent example of a complete secure authentication scheme would be killer. Mention OpenID as a full-fledged alternative, probably.

> Yes but this still assumes that the developer who needs the information realizes that s/he needs it!

Indeed. However, by making it explicit that such-and-such information can be found here, it’ll be constantly at the back of the developers mind. If it’s easy to reach, maybe we’ll start looking even when we have a full solution in mind. You know, just in case. We can do that now, but (a) making sure we don’t miss a good resource because it’s three pages down in DuckDuckGo and (b) making it really quick to check on a topic instead of reading several articles can only be a good thing.

> Why is it that only PHP need such a resource?

This is a valid question. I’m pretty sure some languages/frameworks already have this (probably called a manual or somesuch). It’s usually the documentation of a framework, so of course the documentation of PHP-the-language can’t be expected to contain these things.

### Why doesn’t this exist already?

I can probably be convinced that not even PHP needs this. Or is there such a site out there already, and I just missed it? If there isn’t, why not? Is it redundant, not worth it? Does everyone just go with “good enough”?

Is this feasible? Let’s start one!

**PS.**

Phpass being the bestestest password storage solution is not the point of the post. Feel free to name alternatives. Also, most of this rant is based not on any statistical data, only my “gut feeling”.
