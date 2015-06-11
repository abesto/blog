---
author: Zoltán Nagy
layout: post
title: "Mindset: Your Dev Environment is Software"
date: 2014-05-05 22:29:05 +0200
comments: true
categories:
---

If you write software for a living (or just for fun), you're probably using a
bunch of other pieces of software to help you get your job done.

> At that moment, the developer was enlightened.

I'm going to rant a bit about how this realization should change your life. What
realization? That the thing you are working _on_ and the thing you are working
_with_ are of the same substance. You can, and you should, use the same tools to
improve both.

<!-- more -->

But first, a side-note: if you're writing code for fun, chances are you can make
a living out of it. Give it a try sometime. Now that I've gained some karma for
giving good life advice, lemme burn it right away:
[we're hiring](https://prezi.com/jobs/).

### Back on topic

I'll state the obvious: an extensible editor is a big win. Emacs is the
traditional example of this (alright, and vim), but lately Sublime has been a
worthy competitor. Unless, of course, you actually like writing Lisp. Which you
should totally give a try, it's another useful perspective on
programming. Clojure is a very stable, modern dialect that runs on the JVM with
proper integration and tooling.

What happens when you have two editors, perhaps traditionally at war with each
other, that both have great features, but no integration between them? If you
said "write some glue code", you're getting the hang of this post. That's
exactly what some projects did, for example [Eclim](http://eclim.org/) that
integrates Eclipse with basically anything else, any way you want it.

Another possibility is taking the subset of features you want from one editor,
then implementing those as extensions of another. The Vim way of editing text is
one usual suspect here. It got to the point where I won't even look at an IDE /
editor that doesn't have a Vim plugin. Yes, that includes Emacs. I'm writing
this very post on Emacs using [Evil](http://www.emacswiki.org/emacs/Evil), which
is basically a lot of Vim implemented on top of Emacs.

### Enough with the editors!

Fine, let me just drop a link to
[this video](http://www.ustream.tv/recorded/46664399), answering the age-old
question of "can I write equations that look like rendered LaTeX intermingled
with my C code?"

Let's look at something simpler: your shell. (If you caught the lie in that
sentence, congrats, you're now officially a sysadmin.)

How many times did you type `git commit` today? If the answer is zero, you have
some learning and/or evangelization to do. Or maybe you just already know what
I'm about to write. How many times did you type `git commit --all`? `git reset
--hard`? How about `cd ../../../..`? These are simple ones to fix, using
[aliases](http://tldp.org/LDP/abs/html/aliases.html). You can just say `alias
gca='git commit --all'`, end of story. You've just saved a few minutes of typing
a day.

Step one of achieving tooling Nirvana: notice that this is a lot of work. You
need to keep track of what commands you type most often, then find aliases for
them. Step two of achieving tooling Nirvana: find that someone already wrote the
tool that does this for you, based on your shell history: enter
[Huffshell](https://github.com/paulmars/huffshell).

### Aliases are so last year!

Fine, let's take it further. This is a very specific use-case; generally you'll
need to find the things that need automation in your own daily work. But for
this example, just find the right substitutions if you're not working with
Python and virtualenv. Or if you're using Python, but not virtualenv, then go
[learn about virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/).
I'll wait.

Every time you activate a virtualenv, you type something like
`. ./virtualenv/bin/activate`. But maybe it's `. ./venv/bin/activate`, or
`. ../virtualenv/bin/activate`, or, Heaven forbid,
`. ../../virtualenv/bin/activate`. And you need to remember which one to use!
Horrible!

Here's two solutions. One:
[virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/). This
is software, written just like any other piece of software. Only it serves you,
the developer, instead of serving the end-user. Here's the feature list from the site:

1. Organizes all of your virtual environments in one place.
1. Wrappers for managing your virtual environments (create, delete, copy).
1. Use a single command to switch between environments.
1. Tab completion for commands that take a virtual environment as argument.
1. User-configurable hooks for all operations (see Per-User Customization).
1. Plugin system for more creating sharable extensions (see Extending Virtualenvwrapper).

The other solution - this is actually what I use, because we have a tradition
(and tooling around) keeping virtualenvs inside the application's directory:

```bash
v () {
	for candidate in virtualenv venv ../virtualenv ../../virtualenv ../ ../../
	do
		if [ -f $candidate/bin/activate ]
		then
			. $candidate/bin/activate
			return
		fi
	done
}
```

This is just a `(ba|z)sh` function you drop in `.bashrc` or whatever you're
using. Say `v`, boom, your virtualenv is active.

One surprising thing about doing these is that the first time you write `v`
instead of `. ../../virtalnv\Wvirtualenv/bin/activate`, you'll just sit there
for a few seconds, not knowing what to do. Your brain expects those seconds of
idle time between "I need to activate the virtualenv" and "let's see the next
step". By teaching yourself to not expect that downtime, you've just converted
saved typing to an extra minute or so to think, each day. Big win for a few simple
aliases, no?

While we're on the topic of shells:
[No, really. Use Zsh.](http://fendrich.se/blog/2012/09/28/no/) Yes, it does
make a difference. One shiny example: real-time syntax highlighting of the
command you're typing. (Not out of the box, you need to install a plugin).

### What else?

No no no, wrong question. Fish, and teaching people, and fishing, and net, and
all that stuff. The right question is: how?

Find whatever pains you during your work. What's boring? Now go and build a tool
to automate it. The more boring, the more painful the task, the more shiny,
well-tested, robust and user-friendly the tool should be. Don't forget the
user-friendly part. If using the tool sucks, then you've just shoveled the pain
around - I've learned this the hard way.

A few more areas that can probably use improvement, to get you thinking:

 - Management of cross-repository dependencies (I'm hoping to soon open-source a project around this)
 - Deployment.
 - Setting up the development environment - this is a special case, because you only experience it very rarely, but then it hurts a lot.
 - Code review.
 - Your branching strategy - if you're using git, take a look at [git-flow](https://github.com/nvie/gitflow) for ideas.
 - GMail. It has shortcuts. They're awesome.
 - Change management. Imagine: your site is down. Quick, what's changed in the last three hours? Threetwoone time is up. This is a great weekend project by the way - a simple REST API that receives reports about everything, with a simple web interface to look at and filter events.
 - Configuration management of your servers. Seriously, check out Chef, Puppet and/or Ansible.

Oh, and: if you build something awesome, share it! People will come and make it even awesomer :)
