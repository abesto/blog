---
title: 'Yesod: Ignore Trailing URL Slashes'
author: Zoltán Nagy
layout: post
permalink: /yesod-ignore-trailing-url-slashes
robotsmeta:
  - index,follow
categories:
  - Server
tags:
  - haskell
---
Just a note if you need / want to remove the redirects of [yesod][1] (a Haskell web framework) from `http://myhost.com/` to `http://myhost.com`. You can find the below instance declaration in `Foundation.hs` if you’re using the scaffold. If not, you’ll know where it is, because you put it there :)

 [1]: http://www.yesodweb.com/

```haskell
    instance Yesod App where
        cleanPath _ pieces = Right $ filter (not . ((==) "")) piece
```

This ignores any trailing slashes (and duplicates as well), so that all the following URLs will be considered the same as `http://myhost/a/b`

*   `http://myhost/a/b/`
*   `http://myhost//a//b`
*   `http://myhost/a/b//`
*   `http://myhost/a/b`
