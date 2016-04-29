---
title: Gun-shot Wound by User-Friendly (in the Foot)
robotsmeta:
  - index,follow
categories:
  - Uncategorized
tags:
  - git
  - osx
---
## Ingredients

*   One spoonful of OSX
*   A sprinkling of Git
*   Three pounds source code

## Preparation

1.  Rename `user.coffee` to `User.coffee`, setting `core.ignorecase` just in case
2.  Commit, push
3.  Edit `User.coffee` and watch as `git diff`s don’t make any sense, `git reset` doesn’t reset, `git stash` doesn’t stash, `git commit -a` doesn’t commit.
4.  Laugh with glee as your editor jumps between the current and an old-old-old version
5.  Go on holiday, give up, freak out

## Serve for two

1.  Realize (probably with help from colleagues) that the OSX file-system is not case-sensitive
2.  Go to GitHub or clone the project on Linux
3.  Realize that both `user.coffee` and `User.coffee` exist
4.  Delete `user.coffee`
