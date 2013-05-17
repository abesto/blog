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
`%LOCALAPPDATA%GoogleChromeUser DataDefaultUser StyleSheetsCustom.css`
(`%LOCALAPPDATA%` is usually `C:UsersusernameAppDataLocal`, where `AppData` is a hidden folder)

**Mac:**
`/Users/username/Library/Application Support/Google/Chrome/Default/User StyleSheets/Custom.css`
**Linux:**
`~/.config/chrom(e|ium)/Default/User StyleSheets/Custom.css`

In Safari you don’t even have to leave your browser: you can create stylesheets in the Preferences → Advanced tab. Note that by default you’ll have to restart your browser for changes to take effect. Check out [this Macworld hint][5] if you want to work around that.

 [5]: http://hints.macworld.com/article.php?story=20060715042932352

### 2. Add custom styles

Any CSS  you enter here will be applied to all pages loaded in the browser. The following snippet makes sure that the scroll up/left button at the start and the scroll down/right button at the end of the scroll-bar are visible as a gray box. It does not contain anything to apply it to only Google applications, but chances are that if you want the scroll buttons here, you’ll want them everywhere.

```css
    ::-webkit-scrollbar-button:start:decrement,
    ::-webkit-scrollbar-button:end:increment {
      background-color: #ddd;
      height: 16px !important;
      width: 16px !important;
      border: 1px outset silver;
      display: block !important;
    }
```

This is really unacceptable from a design perspective (read: it looks bad). It’s also ridiculous that we have to resort to hacks like this to have scroll buttons… Still, this is the only way I could come up with (other than disabling this extension in the Chromium/WebKit source and compiling).
