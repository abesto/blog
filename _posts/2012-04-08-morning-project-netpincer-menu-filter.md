---
title: 'Morning Project: NetPincér Menu Filter'
permalink: /morning-project-netpincer-menu-filter
robotsmeta:
  - index,follow
categories:
  - Client
tags:
  - javascript
  - user-script
---
[NetPincér][1] is an online food ordering service in Hungary. The website has quite a few problems, but one of the most annoying ones is that there’s no way to filter the menu of a restaurant based on what’s in the food. Even though most of the restaurants list some ingredients as the description of the course.

 [1]: http://www.netpincer.hu

Solution: a user script that adds whitelist and blacklist filtering. It looks like this:

{% image netpincer-filter.png %}

It works in both Chrome as a user script and as a Gresemonkey script in Firefox. You can get it from userscripts.org:

 []: http://abesto.net/wp-content/uploads/2012/04/snapshot1.png
