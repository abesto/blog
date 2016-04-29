---
title: Managing Your Private Server with Chef
robotsmeta:
  - index,follow
categories:
  - Server
---
#

You’re a cool kid, right? All the cool kids have their blog and other stuff on a VPS (or on GitHub, but that’s a different story). Really cool kids have their stuff on [Linode][1], by the way; yes, that’s a referral link. All the cool kids use [Chef][2] to manage their infrastructure at work consisting of N-hundred Heroku dynos and AWS instances. So why not manage your VPS with Chef? While you’re at it, why not upload the whole thing to GitHub? (Like [this][3])

 [1]: http://www.linode.com/?r=9afc4fe35ac0a621500bf5d314b390424113b3ef
 [2]: http://www.opscode.com/chef/
 [3]: https://github.com/abesto/abesto-net-chef

<!-- more -->

**Warning**: doing this exposes your whole server setup to the world, giving potential attackers much more information than they’d otherwise get. Still, the point of this Chef thing is that it makes the server completely reproducible; you can plug the hole, format your drives, reinstall from scratch, import database dumps, and be back up in less than an hour. It’s worth it for me; consider if it’s worth it for you.

With that out of the way, here’s the first problem you’ll encounter: you don’t have a dedicated Chef server, plus the server and supporting processes eat quite a bit of memory anyway. You may still go with the server-client approach; if you do, you can skip the parts about Chef solo (which is most of this article, by the way).

## Setting up Chef solo

The [Chef Solo article][4] on the Opscode wiki is quite useful; read it if you have the time. Here’s the short version. Solo works by reading node configuration from a JSON file, reading data bags from files, and running cookbooks from local files. (You can use a tarball based approach, but I won’t discuss that here). You can tell chef-solo where to look for each of these in `/etc/chef/solo.rb`:

 [4]: http://wiki.opscode.com/display/chef/Chef Solo

```ruby
    file_cache_path "/var/chef-solo" #Default
    role_path "/var/chef-solo/roles" #Default
    data_bag_path "/var/chef-solo/data_bags" #Default
    cookbook_path ["/var/chef-solo/cookbooks", "/var/chef-solo/my-cookbooks"] #Not default
    json_attribs "/var/chef/node.json" #Also not default
```

Note how you can define several directories for cookbooks. Later ones override earlier ones. I prefer to keep the 3rd-party cookbooks in `cookbooks` and my own ones in `my-cookbooks`. Note also that you must define the path to the node descriptor file here; this can also be a remote URL.

Data bags are a nice way of separating your data from your logic (the recipes) and the server configuration (the node attributes). Chef solo supports databags; it does not support searching data bags. Fortunately, there’s an app lib for that [here][5]. This is especially useful if you want to use the users recipe for setting up your non-root user and the friends whose applications you host; that recipe uses data bag searching, so without this little hack, it won’t work with chef-solo. You should probably create different users for your different applications as well, but I’d suggest doing that as part of the application recipe, using the [user resource][6].

 [5]: https://github.com/edelight/chef-solo-search
 [6]: http://wiki.opscode.com/display/chef/Resources#Resources-User

## Problem: Chef solo, public GitHub repository and security

There will be passwords. For the users you should just set them to some random string, since you’ll be using public key authentication anyway. But there will be database passwords (root, maintainer, admin tool, application) and there will be application admin passwords. These need to be stored as node attributes; but you’re committing the node attributes to GitHub! (If you’re not, this part is not exciting for you)

I can think of two solutions: storing these values as encrypted data bags, or not adding them to public repositories at all. I went with the second version; it’s marginally safer, and it’s not a huge hassle. So we commit the file with all passwords set to something like “this is not the password”. There are two things to keep in mind here. One, that the passwords must never be committed; you could write a pre-commit hook for checking/doing that. Two, some recipes don’t take kindly to the password changing after the first run of the recipe. Specifically the MySQL recipe doesn’t cache the old root password, so if the password in the attributes descriptor file changes, it’ll fail to connect while trying to set the new password.

## Quick case study: WordPress migration and security

I didn’t use the old server for experimenting with this stuff, and once it became stable, I didn’t want to use the old one – clean slate and all that. I don’t have my WordPress customizations in version control, so the quick-and-dirty solution was just dumping the code and the DB into a recipe. The idea is simple: set up the database, import the dumped data, set up the database user, change wp-config.php, and all is well. The cookbook that does all this can be found [here][7].

 [7]: https://github.com/abesto/abesto-net-chef/blob/master/my-cookbooks/blog/recipes/default.rb

Three things to consider:

*   We need to add the DB connection info to wp-config.php; the simple way to do this is by generating it from an .erb template.
*   WordPress encrypts and salts authentication cookies; it obviously uses secret things to do that. You can either save all those keys as node attributes (using the previous technique or in an encrypted data bag), or generate new values into the template using the helpful url . This will generate new values for each run of chef-solo, logging all users out; this may or may not be a problem, depending on how you use WordPress. Either way, these secrets need to be added to the wp-config.php template.
*   The DB dump has a (salted, hashed) version of user passwords; you may want to change them.

Chef is a really powerful tool; so much so that I’ve managed to migrate all the stuff I had on the old server in two or three afternoons. The resulting setup is cleaner and safer than the old server, and it’s infinitely easier to reproduce. Also, my server is on GitHub! :)
