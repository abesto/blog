---
title: Linux Server Security Tips
permalink: /linux-server-security-tips
robotsmeta:
  - index,follow
categories:
  - Server
tags:
  - monitoring
  - security
  - ssh
---
##  IANAD

(I am not a disclaimer. Oh wait, yes I am.)

I’m not a system administrator by training. All of this information can be found online; this is only a collection that I hope may come in handy for someone. Let me emphasize that *you don’t get a secure system just by following these instructions.* That said, I’ve listed all the security measures I’ve taken to protect the server running this blog at the time of writing; this setup is good enough for me. Still, the server has no sensitive information, and I’m not a sysadmin.

<!-- more -->

## The obvious

*   Always keep your system up to date with security patches. No amount of configuration can save you if your version of sshd allows anyone born before 1970-01-01 to log in as root.
*   Always employ the [Principle of least privilege][1]: give users only the permissions they strictly need.
*   Check that your system doesn’t run a telnet daemon by default.
*   Use a firewall to close all unused ports manage ports available for local applications to listen on.[[2][2]] See [ufw][3] (Uncomplicated Firewall) for a simple iptables-based solution.

 [1]: http://en.wikipedia.org/wiki/Principle_of_least_privilege
 [2]: #footer-2
 [3]: https://help.ubuntu.com/community/UFW

## The less obvious

*   Disable administrative interfaces like PhpMyAdmin, the Nagios web GUI and cPanel when not used. You may also consider disabling the web-based interfaces of Cacti, Munin and friends; they should be password-protected at the least.
*   Even when you use them, they should be behind strict firewall rules[[1][4]] and HTTPS. A self-signed certificate will work just fine for the HTTPS part. The nginx manual has a simple procedure for setting this up [here][5]. The configuration options for apache are listed [here][6] (you might want to follow the key creation procedure from the nginx manual; it’s summed up rather nicely).

 [4]: #footer-1
 [5]: http://wiki.nginx.org/HttpSslModule
 [6]: http://httpd.apache.org/docs/2.0/ssl/ssl_howto.html

## SSH

The goal of many attackers is to gain shell access to your box. Hardening your sshd configuration is an important step in preventing this. Everything you’ll find below is tested with OpenSSH. The configuration options must be added to the sshd configuration file, usually `/etc/ssh/sshd_config`. Changes to this file will take effect after you restart the sshd server or reload the configuration options with `/etc/init.d/sshd reload` (replace `init.d` with `rc.d` if needed :))

### Restrict remote login to users that really need it

#### Why:

Less users mean less targets, obviously. Specially, root *never* needs SSH access. Note that disabling login by setting the login shell to /bin/false prevents only a subset of the attacks handled by this solution.

#### How:

Use the `AllowUsers` and/or `AllowGroups` directives. Users not covered by either directive are not allowed to log in via SSH.

#### Example:

    AllowUsers user1 user2 user3
    AllowGroups group1 group2
    PermitRootLogin no

### Disable password authentication

#### **Why:**

Password based authentication is inherently less secure than the public-key alternative. You can find an easy to follow comparison at [Rongchaua’s blog][7].

 [7]: http://rongchaua.net/blog/ssh-password-vs-public-key/

#### How:

1.  If you don’t have a GPG SSH[[3][8]] key yet, you’ll have to create one. See this [GPG Quick Start][9] guide On Unix-based systems `ssh-keygen` will create your SSH keypair after you answer a few simple questions[[1][4]], or see [this guide][10] for PuTTY on Windows.
2.  Once you have the private and public keys, paste the public key into the file $HOME/.ssh/authorized_keys on the server. OpenSSH is quite picky about the permissions of files, so make sure that only you can access it (“`chmod 0600 $HOME/.ssh/authorized_keys`“ should be good enough).
3.  *Make sure you can log in without entering your login password.* If you disable password authentication without setting this up correctly, you can lock yourself out of the system.
4.  Disable password login and other unsecure login methods:

 [8]: #footer-3
 [9]: http://www.madboa.com/geek/gpg-quickstart/
 [10]: http://unixwiz.net/techtips/putty-openssh.html#keypair

    ChallengeResponseAuthentication no
    PasswordAuthentication no
    UsePAM no

### Force the usage of SSH-2

#### Why:

 The older protocol, SSH-1 is less secure, and all modern clients support the new protocol. Using only SSH-2 in sshd is also the default in modern servers[[1][4]].

#### How:

    Protocol 2

### Use a non-standard port

#### Why:

Running the SSH daemon on a random port requires little effort, for a little security through obscurity decreasing the number of attackers a bit[[1][4]].

#### Why not:

A decent port scan will usually still find the service. It might not be worth the effort; decide for yourself.

#### **How:**

The port number should probably be below 1024, because binding to these ports require root privileges, thus reducing the risk of port hijacking. Make sure you choose a port not already associated with an application (eg. by checking that it’s not in the [nmap-services][11] file).[[1][4]]

 [11]: http://nmap.org/book/nmap-services.html

    port $PORT

You can then log in via the command-line client using the -p switch:

    $ ssh -p $PORT user@host

Take this a few steps further, and we get port knocking. It’s a technique not universally accepted as a useful solution in production environments. Setting up port knocking is out of the scope of this article, but there are plenty of resources out there.

## Monitoring tools

The steps outlined above make it harder for an attacker to gain access to your system. It should be noted that this is far from being a complete guide on setting up a secure server; there are whole books dedicated to the topic for a reason.

Anyway, when a bad guy manages to access your system, you want to know about it, fast. Finding out about the problem from a request to stop brute-forcing another server does *not* qualify as fast.

[fail2ban][12] ”scans log files like `/var/log/pwdfail` or `/var/log/apache/error_log` and bans IP that makes too many password failures. It updates firewall rules to reject the IP address.” This will stop brute-force attacks, but not DDoS attacks. Dealing with denial of service attacks is still not a completely solved issue; see [this article][13] for some of the problems and solutions.

 [12]: http://www.fail2ban.org/wiki/index.php/Main_Page
 [13]: http://thenextweb.com/media/2011/05/02/ddos-attacks-prevention-and-mitigation/

[ossec][14] is “an Open Source Host-based Intrusion Detection System. It performs log analysis, file integrity checking, policy monitoring, rootkit detection, real-time alerting and active response.” Chances are it will pick up the side-effects of most intrusions. Be sure to configure at least the notification address where alert emails are delivered, even if you leave other options on their default.

 [14]: http://www.ossec.net/

**Update:** Coming out and stating that this is the setup I use is not acceptable from a security perspective. I accept the risk, and the potential* fun* it will bring. What I really want to say is: I eat my own dogfood. Even if stating this makes said dogfood less tasty for me.

[1] Thanks to kdorf for pointing this out in [this comment on reddit][15]
[2] Thanks to ngroot for pointing this out in [this comment on reddit][16]
[3] Thanks to mowrawn for pointing this out in [this comment on reddit][17]

 [15]: http://www.reddit.com/r/linux/comments/n2g2n/basic_linux_server_security_tips/c35qx08
 [16]: http://www.reddit.com/r/linux/comments/n2g2n/basic_linux_server_security_tips/c35tetr
 [17]: http://www.reddit.com/r/linux/comments/n2g2n/basic_linux_server_security_tips/c35u3yr
