---
title: 'Mostly Shiny: Vector Graphics with MVVM in the Browser'
author: Zoltán Nagy
layout: post
permalink: /vector-graphics-with-mvvm-in-the-browser
description:
  - >
    A minimalistic graph-drawing example (graph as in "graph theory"), using
    Knockout for MVVM and Raphael for the graphics.
robotsmeta:
  - index,follow
categories:
  - Client
tags:
  - javascript
  - knockout
  - raphael
---
I’d like to show you how to make two great libraries work together: Raphael and Knockout. I’ve built the basics of a purely browser-based application for creating simple graphs (as in “graph theory”). This article was supposed to be a longish explanation of how it all works, but unfortunately I’m really short on time.

*   The working example is [here][1]
*   And the docco-annotated source code is [here][2]

 [1]: http://abesto.net/kor/index.html
 [2]: http://abesto.net/kor/docs/script.html

### Some links and introductions are in order

**[Raphaël][3]:** ”a small JavaScript library that should simplify your work with vector graphics on the web”. It also includes a handy light-weight event framework called “eve” (yes, another one; yes, its good enough to exist). It’s a very useful common interface to SVG and VML (which is what IE supports instead of SVG).

 [3]: http://raphaeljs.com/

**[Knockout][4]:** a library implementing MVVM for the browser, with dependency tracking and template support using [jquery.tmpl][5].

 [4]: http://knockoutjs.com/
 [5]: http://api.jquery.com/jquery.tmpl/

**[MVVM][6]**: a design pattern that can be considered an alternative to MVC in some respects. The idea is that view-models (VM) and views (the first V) are bound once, and they automatically update anything connected to them when they change, while updating some kind of storage (the first M). The storage is neglected in the example, but it’s supported just fine by Knockout.

 [6]: http://en.wikipedia.org/wiki/Model_View_ViewModel
