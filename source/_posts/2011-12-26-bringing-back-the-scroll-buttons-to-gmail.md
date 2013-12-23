---
title: 'Quick fix: Bring back the scroll buttons to GMail'
author: Zoltán Nagy
layout: post
permalink: /bringing-back-the-scroll-buttons-to-gmail
robotsmeta:
  - index,follow
categories:
  - Client
  - Desktop
---
**Update (2013-12-23)**: The horrible extinction of the scroll-bar buttons has spread from GMail to all of Chrome. The style-sheet is now updated to work with recent versions of Chrome, and look much better than before. The design update is an adaptation of the stylesheet [here](https://www.coffeepowered.net/2011/06/17/sexy-css-scrollbars/).

There’s been [some][1] [noise][2] [on the ‘net][3] about missing scroll up/down buttons in the new Google design. Note that this only affects the browsers based on WebKit (Chrome, Safari and some KDE browsers, to name a few). Here’s a way to fix that.

 [1]: http://www.google.gg/support/forum/p/gmail/thread?tid=0d5d7ea34ac7f5da&hl=en
 [2]: http://www.google.gg/support/forum/p/gmail/thread?tid=0052f4d2c7e2ab88&hl=en
 [3]: http://www.google.gg/support/forum/p/gmail/thread?tid=7072d994efc061ad&hl=en

## Why are the buttons gone?

As IE before, WebKit has introduced styleable scroll-bars. (Whether that’s a good idea or not is not the point of this article.) The new Google design uses this new feature in a lot of places. This has two effects: 1) the scroll-bars fit in nicely and 2) the scroll buttons are gone. The special CSS selectors provide a very detailed, if verbose, way for making sure the scroll-bars on the site match the design; there’s a great article explaining them at [CSS-Tricks][4].

 [4]: http://css-tricks.com/custom-scrollbars-in-webkit/

## The solution

I haven’t managed to find a way to disable this feature in Chromium; there’s no way to disable these customized scroll-bars. The best solution I could find is creating visible elements via a user stylesheet where the buttons should be. We can do anything with them, but in this example we’ll just make simple gray boxes.

### 1. Find the file / text box for custom stylesheets

For Chrome (and Chromium) you’ll need to find a file. The changes will be applied as soon as you save it – there’s no need to restart the browser.

**Windows:**
`%LOCALAPPDATA%\Google\Chrome\User Data\Default\User StyleSheets\Custom.css`
(`%LOCALAPPDATA%` is usually `C:\Users\username\AppData\Local`, where `AppData` is a hidden folder)

**Mac:**
`/Users/username/Library/Application Support/Google/Chrome/Default/User StyleSheets/Custom.css`
**Linux:**
`~/.config/chrom(e|ium)/Default/User StyleSheets/Custom.css`

In Safari you don’t even have to leave your browser: you can create stylesheets in the Preferences → Advanced tab. Note that by default you’ll have to restart your browser for changes to take effect. Check out [this Macworld hint][5] if you want to work around that.

 [5]: http://hints.macworld.com/article.php?story=20060715042932352

### 2. Add custom styles

Any CSS  you enter here will be applied to all pages loaded in the browser. The following snippet makes sure that the scroll up/left button at the start and the scroll down/right button at the end of the scroll-bar are visible as a gray box. It does not contain anything to apply it to only Google applications, but chances are that if you want the scroll buttons here, you’ll want them everywhere.

```css
::-webkit-scrollbar:hover {
  height: 18px; }

::-webkit-scrollbar-button:start:decrement,
::-webkit-scrollbar-button:end:increment {
  height: 15px;
  width: 13px;
  display: block;
  background: #606261;
  background-repeat: no-repeat; }


::-webkit-scrollbar-track-piece {
  background-color: #151716; }

::-webkit-scrollbar-thumb:vertical {
  height: 50px;
  background: -webkit-gradient(linear, left top, right top, color-stop(0%, #4d4d4d), color-stop(100%, #333333));
  border: 1px solid #0d0d0d;
  border-top: 1px solid #666666;
  border-left: 1px solid #666666; }

::-webkit-scrollbar-thumb:horizontal {
  width: 50px;
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #4d4d4d), color-stop(100%, #333333));
  border: 1px solid #1f1f1f;
  border-top: 1px solid #666666;
  border-left: 1px solid #666666; }
```
