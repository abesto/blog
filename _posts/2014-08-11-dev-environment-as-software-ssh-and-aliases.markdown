---
layout: post
author: Zoltán Nagy
title: "Dev Environment as Software - SSH and Aliases"
date: 2014-08-11 22:46:55 +0200
comments: true
---

In
[Mindset: Your Dev Environment Is Software](http://abesto.net/mindset-your-dev-environment-is-software/)
I showed several small examples for how you can optimize parts of your
development workflow, just by realizing that the stuff you're using to
develop is also software. (Yes, this is trivial, but stating it
explicitly leads to interesting results.)

Today I'd like to give a detailed explanation of how a biggish
refactor of your workflow might look like. Case in point: SSHing to
nodes by ip, by hostname, by EC2 instance id, by Chef role, as
different users. **Fast.**

<!-- more -->

## Just some simple functions

More often than not, it usually starts with some simple aliases. For
example, I'll very often SSH in to a host as root. That's `ssh root@`,
or alternatively `ssh -l root`. Other times I'll want to ssh as the
user `publisher`. I never want to log in as any other user. So
obviously, create trivial functions.

```sh
sr () {
	ssh "$@" -l root
}
sp () {
    ssh "$@" -l publisher
}
```

This lets us go from `ssh root@host` to `sr host`. Not bad, for
basically no effort.

## Executing stuff on lots of nodes

Sometimes you need to run a one-off command on several nodes. And see
the output. Real use-case: I have a list of IPs / hostnames for nodes
where Chef has been misbehaving. After uploading the fix, I want to
re-run chef just on these nodes, right now. Let's call the function
`sm` for `ssh multiple`.

```sh
sm() {
  cmd=$1; shift
  for h in $*
  do
    echo $cmd on $h | tee $h.out
    sr $h "$cmd" | tee -a $h.out
  done
}
```

With just that bit of code we can run a command on all those pesky
nodes: `sm 'pkill -USR1 chef-client' app{1..5}` will tell the running
Chef client on app1 through app5 to start a chef run. Note how the
script also saves output into a file per host.

If the command is long-running, we may want to run the commands in
parallel (after trying it out on a few hosts first to see that it
works as intended). Easy, just a tiny modification of the above:

```sh
smp() {
  cmd=$1; shift
  for h in $*
  do
    echo $cmd on $h in background | tee $h.out
    (sr $h "$cmd" | tee -a $h.out) &
  done
}
```

This could be more elegant and better controlled with xargs or GNU
parallel, but we're aiming for quick and dirty. The name of course
stands for `ssh multiple parallel`.

## EC2 instances

I'll often have just an EC2 instance ID to identify a host. For
reference, these look something like `i-189d8c21` (id changed to protect
the innocent). There are two ways to go about logging in:

 - I can either go to the EC2 web interface, log in typing the
   2-factor token from my phone, oh wait it was invalidated just as I
   was finishing, ok got it now, find the instance by the id, find the
   IP on the bottom part of the screen, copy it, then `sr
   <paste>`. That's around a minute.
 - There are a bunch of command-line tools to query and manipulate
   instance EC2 instance data. For example `ec2-describe-instance $id`
   is will show some data, including the address I need. However, I
   won't remember the string `ec2-describe-instance`, and there's also
   the copy-pasting. This takes around 30 seconds.

I hope by now you're jumping out of your chair screaming BUT WE CAN
USE THAT TOOL TO AUTOMATE SOME OF THIS! Unless there's people around
you, then I hope you're just metaphorically jumping and only screaming
inside your head.

So yes, after some tweaking, we can get the IP address of a host from
an instance id:
```sh
ec2-describe-instances --show-empty-fields $id | grep '^INSTANCE' | cut -f4
```

Let's wrap it in a handy function:
```sh
ec2_ssh() {
    id=$1; shift
    ssh_debug "Logging in to EC2 instance $id"
    ec2host=$(ec2-describe-instances --show-empty-fields $id | grep '^INSTANCE' | cut -f4)
    ssh $ec2host "$@"
}
```

Now we can go `ec2_ssh -l root i-189d8c21`. By the way: I shamelessly
stole this function and some of the later ideas from
[zsol](https://github.com/zsol). That's another great way to optimize
your workflow: look at how others do it.

You could of course create wrappers like `ec2_sr` to log in as root,
but we'll do better than that. But first...

## Log in to lots of instances, by Chef role

This is another very common thing to do. What I'd usually do is
something like this:

 1. Go to my chef repo clone (we have all our stuff in a single
 repository), let's call it `$CHEF_HOME`
 2. `knife ssh something_app -x root cssh`
 3. Oh look, no nodes found.
 4. `ls roles | ag something`
 5. Of _course_, there's a dash instead of an underscore
 6. `knife ssh something-app -x root cssh`
 7. And _then_ get to work.

This sucks. Can we optimize it? SURE! First we'll need to figure out
which role we actually want to work on. If there are several
candidates, we'll just return them all here and deal with it later.

```sh
find_roles() {
    regex="$1"; shift
    ls $CHEF_HOME/roles | sed 's/\.json$//' | grep -E "$regex"
}
```

Once we have a list of roles (ideally containing only one role), we
can easily write a function that logs in to all of the nodes in a
role. Note that `knife ssh` uses `-x` for the username instead of
`-l`.

```sh
chef_ssh() {
    role_regex=$1; shift
    role=$(find_roles "$role_regex")
    if [ $(echo "$role" | wc -w) = '0' ]; then
        echo "No idea how to SSH into $role"
    elif [ $(echo "$role" | wc -w) != '1' ]; then
        echo "Found more than one matching Chef role:"
        echo "$role"
    else
        ssh_debug "Logging in to nodes with Chef role $role"
        cd $CHEF_HOME
        knife ssh roles:$role cssh -x root
    fi
}
```

Note that we use the input as a regex in `find_roles` (`grep
-E`). This lets us do fancy tricks, like: if you don't remember
whether it's `something_app` or `something-app`, you can just say
`something.app`. Also, if there are roles called both `foo` and
`foobar`, then `chef_ssh foo` will fail saying there are two matching
roles. You can of course extend the function to prefer exact
matches. I'm a bit lazy, so instead of thinking more, I'd just use
`chef_ssh foo\$`.

## Putting it all together

I still need to remember which function to call. Since we're already
optimizing, let's go all the way and create a single function that
will use the above functions to do the right thing. There's some
thinking we have to do:

 - Check if a string is an EC2 instance id: `grep -o 'i-[0-9a-f]\{8\}'`
 - Check if a string resolves as a host / ip address. The `host`
   command can do this for us, but if the intertubes are slow / your
   DNS server is down, this can take quite a while, so let's put a
   timeout on it: `timeout 2 host "$1"`

We'll also want some verbose output for debugging our logic, which
should be off by default. A useful pattern is writing a function
like this:

```sh
ssh_debug() {
    [ -n "$SSH_DEBUG" ] && echo "$@"
}
```

Then instead of `echo useful debug info` you can write `ssh_debug
useful debug info`, and have it only actually written to STDOUT if you
ran your command with something like `SSH_DEBUG=1` in the ENV.

Now, linking this all up:

```sh
s() {
    id=$(echo $1 | grep -o 'i-[0-9a-f]\{8\}')
    if [ $? -eq 0 ]; then
        shift
        ssh_debug "First argument looks like an EC2 instance id"
        ec2_ssh $id "$@"
    elif timeout 2 host "$1" > /dev/null; then
        ssh_debug "First argument doesn't look like an EC2 instance id, but I can resolve it as a hostname. Logging in directly."
        ssh "$@"
    else
        ssh_debug "First argument doesn't look like an EC2 instance id, I can't resolve it as a hostname, assuming it's a Chef role (maybe a regex)"
        chef_ssh "$@"
    fi
}
```

And then the wrapper functions `sr` and `sp` can be updated to use `s`
instead of `ssh`. Since `sm` and `smp` were already using `sr`, they
automatically benefit from the implementation of `s`. Note that when
using Chef roles, extra arguments like `-l root` will be ignored due to
the differences in argument schemes.

To see the whole thing in one piece, just look at
[my aliases file](https://github.com/abesto/dotfiles/blob/master/.oh-my-zsh/custom/aliases.zsh). The
SSH part begins at around line 45 (no direct link since it'll probably
change, this link will always point to the latest version instead of
the correct line).

## Take-away

 1. You're dedicated, having read this far. Good, good.
 2. If you apply just the tiniest bit of the experience you already
    use in your job (in a somewhat new way), you can significantly
    speed up how you actually do said job.

Happy hacking!
