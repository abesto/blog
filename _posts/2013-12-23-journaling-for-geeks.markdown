---
layout: post
title: "Journaling for Geeks"
date: 2013-12-23 19:50
author: Zoltán Nagy
comments: true
categories: 
---
There's [a](http://lifehacker.com/5816473/keep-a-work-diary-to-minimize-mistakes-and-document-successes) [whole](http://www.lifehack.org/articles/lifehack/journal-writing-5-smart-reasons-why-you-should-start-doing-today.html) [lot](http://www.myrkothum.com/the-benefits-of-writing-a-personal-journal/) [of](http://evolveandexpress.com/top-10-reasons-for-writing-a-diary/) [material](http://lifehacker.com/5877106/keep-a-journal-of-awesomeness-to-boost-your-self-esteem) on the 'net about why you should keep a diary, so I'm not writing about it. I'm writing about how I'm planning to do it, starting today. There are a few conditions the medium needs to satisfy:

 * Be software, obviously :)
 * Be plain-text
 * Have a nice-looking version I can read later
 * Be synchronized online
 * I want to have a lot of control over the data (no submitting entries in a web form)
 * Be encrypted

<!-- more -->
 
Plain text + nice output means some markup language. I decided to go with Markdown, but anything works. With regard to synchronization: there's a trade-off between convenience and privacy. On one end we have a public GitHub repo, on the other end is the server running in your basement. Dropbox (my choice) is somewhere in the middle. Encryption is easy, GPG already does it pretty well.

### Show me the codez!

```bash
#!/bin/bash -x
diary_editor=${DIARY_EDITOR:-"/usr/bin/vim"}
file=${DIARY_FILE:-"$HOME/Dropbox/diary.gpg"}
if [ "$DIARY_SYMMETRIC" == "yes" ]; then
	encrypt='--symmetric'
else
	encrypt='--encrypt'
fi
tmp=`mktemp`
cp "$file" "$tmp" && gpg --output "$tmp" --decrypt --yes "$file" && "$diary_editor" "$tmp" && gpg --output "$file" $encrypt --yes "$tmp"
rm "$tmp"
```

This creates a temporary file, decrypts the diary overwriting the temporary file, opens the decrypted file with an editor, and once that's finished, re-encrypts the file into the original location, removing the temporary (decrypted) file in the end. Note that at no point does the plain-text version exist on Dropbox.

### Getting started
1. Paste the above code into an executable text file on your `PATH`
2. Create an (empty) encrypted file at `$DIARY_FILE` (see below)
3. Run the script
4. There is no step 4

### I don't like vim :(

There are some points you can customize in your `.(|ba|z|c)shrc` by exporting variables:

 * `DIARY_EDITOR`: the binary used for editing the decrypted journal file
 * `DIARY_FILE`: location of the encrypted diary file; note that you need to create the first version manually
 * `DIARY_SYMMETRIC`: if set to `"yes"`, gpg will use symmetric encryption instead of the usual keypair-based encryption
 
For example:

```bash
export DIARY_EDITOR=/Applications/Mou.app/Contents/MacOS/Mou
export DIARY_FILE=$HOME/Dropbox/diary.gpg
export DIARY_SYMMETRIC=yes
```
 
## Emacs can do all that and more!
Yes.

## I want more features!
Great! I'm looking for an excuse to make this a terribly over-engineered shellscript, complete with a GitHub repository and multi-page README file. Tell me what you need! Some crazy ideas:

* Pluggable sync systems (anything that's mounted to the local FS, git, svn, scp, rsync)
* Pluggable encryption systems (no encryption, GPG/keypair, GPG/symmetric, no idea what else)
* Create the empty encrypted diary file if it doesn't exist at startup (ok, this one is not so crazy)
* Fall back to `EDITOR` if `DIARY_EDITOR` is not set
