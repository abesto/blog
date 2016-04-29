---
title: Sup + GMail on Arch Linux
robotsmeta:
  - index,follow
categories:
  - Desktop
tags:
  - archlinux
  - email
  - sup
---

“The goal of [Sup][1] is to become the email client of choice for nerds everywhere.” It sure became *my* email client. Setting it up is quite straightforward once you have it figured out, but it takes some time if you haven’t used a similar setup yet.

 [1]: http://sup.rubyforge.org/

<!-- more -->

## Installing on Arch Linux

I don’t know if this is really because I run Arch, but I had to make some changes before Sup installed. First install the dependencies via `gem install`. Make sure you use `ncursesw` instead of `ncurses`. This supports wide (multi-byte) characters, and more importantly Ruby 1.9.x (what you’ll find in the Arch repos).

1.  Get the Sup source with `$ git clone git://gitorious.org/sup/mainline.git sup-mainline`
2.  Then edit the Rakefile:
    *   `require "sup-files"` => `require "./sup-files"`
    *   `require "sup-versions"` => `require "./sup-versions"`
    *   `s.add_dependency "ncurses"` => `s.add_dependency "ncursesw"`
3.  Finally `make gem`, and `gem install pkg/sup-999.gem`.

After that you should have a working Sup installation. However, that’s not too useful, if Sup doesn’t know where to find your mail.

## Incoming mail: offlineimap

OfflineIMAP is what it says on the box: you can access your mail even when offline. It will keep an offline copy of your mail in mailbox format, perfect for consumption with Sup.

Example OfflineIMAP setup for GMAIL ($HOME/.offlineimaprc):

    [general]
    ui = Noninteractive.Quiet
    accounts = main

    [Account main]
    autorefresh = 5
    quick = 10
    localrepository = main-local
    remoterepository = main-remote

    [Repository main-local]
    type = Maildir
    localfolders = /home/abesto/mail

    [Repository main-remote]
    keepalive = 60
    type = Gmail
    remoteuser = name@gmail.com
    remotepass = password
    nametrans = lambda foldername: re.sub ('^[gmail]', 'bak',
        re.sub ('sent_mail', 'sent',
        re.sub ('starred', 'flagged',
        re.sub (' ', '_', foldername.lower()))))
    folderfilter = lambda foldername: foldername not in '[Gmail]/All Mail' and foldername not in 'Sent mail'

Running `offlineimap` will now start fetching your emails from GMail. You’ll obviously want to run it automatically; refer to the [ArchLinux wiki][2] for how to do this. Another idea is running offlineimap in the before-poll hook.

 [2]: https://wiki.archlinux.org/index.php/OfflineIMAP#Miscellaneous

If you use IMAP folders to categorize your mail on the server (GMail labels, anyone?) you’ll have to tell sup to look in these additional folders. A simple startup.rb hook to do this:

```ruby
    dirs = `ls ~/mail | grep -v bak`
    dirs.each do |d|
      uri = "maildir:/home/abesto/mail/#{d}"
      unless SourceManager.source_for uri
        source = Maildir.new uri, true, false, nil, [LabelManager.label_for(d)]
        SourceManager.add_source source
        log "Added source #{uri}"
      end
    end
```
## Outgoing mail: ssmtp

ssmtp gives a sendmail alias, and sends mails via an SMTP server. Beware: the configuration is system-wide (needs some extra work in multi-user environments with environment variables, if usable at all).
Even attachments will work just fine. I didn’t test signed/encrypted attachments.

msmtp is a slightly more complex, but similar tool, that uses per-user configuration.

Example ssmtp config (/etc/ssmtp/ssmtp.conf):

```ini
    #
    # /etc/ssmtp.conf -- a config file for sSMTP sendmail.
    #
    # The person who gets all mail for userids &lt; 1000
    # Make this empty to disable rewriting.
    root=name@gmail.com
    # The place where the mail goes. The actual machine name is required
    # no MX records are consulted. Commonly mailhosts are named mail.domain.com
    # The example will fit if you are in domain.com and you mailhub is so named.
    # Where will the mail seem to come from?
    #rewriteDomain=y
    # The full hostname
    hostname=my_hostname

    AuthUser=name@gmail.com
    AuthPass=password
    FromLineOverride=YES
    mailhub=smtp.gmail.com:587
    UseSTARTTLS=YES
```

This will make ssmtp send everything (even cron-generated error reporting mails) through GMail.

## Filters, labels, notifications, etc.

Sup provides a convenient hook system. You can write scripts in Ruby that will be executed with certain variables (functions, really) set for you. A list of available hooks can be found at the [Sup wiki][3]. One useful thing you can do is filter messages in the before-add-message hook. A simple but complete lib to help with that can be found at GitHub: [javcius/sup-filters][4].

 [3]: http://sup.rubyforge.org/wiki/wiki.pl?Hooks
 [4]: https://github.com/jacius/sup-filters

## GnuPG

You can use gpg-agent for signing and encryption. A simple way to ensure that there’s always exactly one gpg-agent running can be found at the [Arch wiki][5]. Make sure you source `/etc/profile.d/gpg-agent.sh` in your shell init script (.zshrc, .bashrc, …) if you won’t run Sup in a login shell.

 [5]: https://wiki.archlinux.org/index.php/GnuPG

## Tweak those labels!

Sup comes with `sup-tweak-labels`, that lets you modify message (thread? I’m not sure) labels based on queries. For query syntax, check out the Sup README. For example, the following line will mark all messages coming from “joe” at any mail provider as read, remove them from the inbox and add the label nsfw.

    sup-tweak-labels -q 'from:joe' -r 'inbox,unread' -a 'nsfw' --all-sources

**Update 2011/05/14**: Florian Unglaub (f dot unglaub at googlemail dot com) wrote an improved version of the startup hook. It adds “a little bit more ruby action to get a nice source URI and label tag without any need to rename things in offlineimap and grep for it.”

```ruby
    Dir[ENV['HOME'] '/mail/*'].map do |d|
      uri = "maildir:" d
      log "Processing source #{uri}"
      unless SourceManager.source_for uri
        source = Maildir.new uri, true, false, nil, [LabelManager.label_for(File.basename(d))]
        SourceManager.add_source source
        log "Added source #{d}"
      end
    end
```

**Update 2011/01/13**: Adding the line `SourceManager.save_sources` to the startup hook below will have two nice nice effects. Sup will have less work to do on startup, and you can use the sources with all the sup-related tools (like `sup-tweak-labels`).
