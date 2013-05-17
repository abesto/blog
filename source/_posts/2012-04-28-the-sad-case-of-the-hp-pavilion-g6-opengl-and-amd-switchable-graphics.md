---
title: The sad case of the HP Pavilion g6, OpenGL and AMD switchable graphics
author: Zoltán Nagy
layout: post
permalink: /the-sad-case-of-the-hp-pavilion-g6-opengl-and-amd-switchable-graphics
robotsmeta:
  - index,follow
categories:
  - Desktop
tags:
  - rant
---

**TL;DR** No, it doesn’t work (as of 2012. April 28). This post is just to save you some time. But I’ll buy you a beer if you manage to get it to work, and tell me how.

<!-- more -->

# The facts

HP has released the Pavilion g6 series in two (correct me if I’m wrong) versions; I can only comment on the one with the AMD/Intel switchable graphics. But I could keep commenting on that all day.

The specs look good, but they don’t mention that the switchable graphics only work with DirectX applications. You don’t get to use the beefy AMD card for OpenGL apps and games – that includes any WebGL apps, Minecraft and SpaceEngine, just to name a few. Also, the only supported operating system seems to be 64-bit Windows 7 (see [here][1]).

 [1]: http://h10025.www1.hp.com/ewfrf/wc/softwareCategory?cc=us&lc=en&dlc=en&product=5078476

# The story so far

Poeple have been complaining; there’s even [this support question][2] that lists all the previously unanswered questions. A possible workaround, which has been released for the some other lines (dv* and envy), is disabling switchable graphics from the BIOS and always using the dedicated video card. No such BIOS update has been released for the Pavilion g6 yet.

 [2]: http://h30434.www3.hp.com/t5/Notebook-Display-and-Video/HP-What-is-wrong-with-your-support-g-series-switchable-graphics/td-p/964099

There’s a [third-party driver project][3] for AMD/Intel switchable graphics that releases with the newest versions of both drivers. This *might* be a solution, but it didn’t work for me. What’s more, after fooling around with three different versions of it, Windows 7 now reboots after a split-second BSOD – even in safe mode. Good thing I only use Windows to play games.

 [3]: http://leshcat.blogspot.com/

HP doesn’t release Linux drivers. Switchable graphics via vga_switcheroo get as far as powering the discrete graphics card up or down, but my up-to-date Arch Linux system freezes when I actually try to switch to the AMD card. The official proprietary Linux AMD drivers (fglrx 12.3 and 12.4) supposedly support switchable graphics. The newest version of Xorg is not supported yet, but let’s downgrade to an older version, and what do we find? The drivers don’t want to make friends with the hardware and complain loudly, saying “Invalid ATI BIOS from int10, the adapter is not VGA-enabled”. After which they don’t recognize the screen as usable; X11 fails to start.

# Conclusion

There is no way to use the main selling point of the notebook with OpenGL applications, or at all on Linux. Not good.
