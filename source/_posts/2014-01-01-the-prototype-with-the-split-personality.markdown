---
layout: post
title: "The prototype with the split personality"
date: 2014-01-01 17:47
comments: true
categories: server
---

A tragedy in one act.<br>
Sub-title: the case-insensitive file system strikes again.<br>
Location: an OSX development machine.

##Dramatis personae:

 * Node.JS, a lightweight webserver
 * HFS Plus, a file system that doesn't care if something's up or UP
 * alpha.js, an innocent-looking file with a single prototype
 * Developer, a simple monkey
 
Lights, camera, action.
 
Enter all.

**alpha.js**: `exports.Class = function() {};`

**Developer**:
```js
var alpha = require('./alpha');
var AlPhA = require('./AlPhA');
```

**HFS Plus**: Hah, those both point to the same file!

**Node.js**: But they're still different modules. The names are not the same. `'a' != 'A'`!

**Developer** (not having heard the previous two talking):
```js
var obj = new alpha.Class();
console.log(obj instanceof alpha.Class);
console.log(obj instanceof AlPhA.Class);
```

**Node.js**: `true`, `false`

**Developer**: WTF? (commits suicide)

Curtain.