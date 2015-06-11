---
title: Octopress 2 to Jekyll
---

A few days ago
[Soft Skills: The software developer's life manual](http://manning.com/sonmez/)
reminded me that blogging is a Good Thing &#8482;, so I cloned [the old
repository](https://github.com/abesto/blog). First things first, let's upgrade
[Octopress](http://octopress.org/)! Since I last looked, Octopress
received a major version upgrade from version 2 to 3. That's good, the
post detailing the release is really promising. It didn't, on the other
hand, receive a migration guide. That's less good. After looking
around the interwebz and finding
[several](http://www.campaul.net/blog/2014/05/08/moving-from-octopress-to-jekyll/)
[articles](https://lauris.github.io/blogging/2014/08/16/jekyll-vs-octopress/)
about
[moving from Octopress to Jekyll](http://jason.pureconcepts.net/2015/02/migrating-from-octopress-to-jekyll/),
I also decided to take the leap. Here are some learnings not covered
or not detailed in those articles.

<!-- more -->

Side-note: if you ever wonder whether you should switch from tech X to
tech Y, searching for "X to Y" is a good first place to look. Make
sure to also search for "Y to X", you want to keep bias out of your
data. These hits usually provide stories and reasonings for the
switch. Similarly, hits for "X vs Y" (and "Y vs X") usually provide
good pro-con comparisons.
[Google Trends](http://www.google.com/trends/) is another good input;
just don't forget to look at trends as well as the current state.

The source of this blog is available at
[https://github.com/abesto/blog](https://github.com/abesto/blog), so
if you want to see more context, feel free to go there and look
around.

## Code highlighting vs excerpts

Just for the record: if you want to use GitHub-style code highlighting
in Markdown, you need to add this line to `_config.yml`:

```yaml
markdown: redcarpet
```

The first thing I encountered after copying over the `_posts`
directory was that `jekyll serve` blew up with this unfriendly error
message:

```
  Liquid Exception: highlight tag was never closed in _posts/2015-06-11-octopress-2-to-jekyll.md/#excerpt
  jekyll 2.5.3 | Error:  highlight tag was never closed
```

Around an hour of
[frantic](https://www.youtube.com/watch?v=_I6y5-GuLPM) searching
turned up
[Jekyll issue #1401](https://github.com/jekyll/jekyll/issues/1401),
which basically says that if you don't have an `excerpt_separator`
configured, then Jekyll will use the first paragraph as the
excerpt. Unfortunately whatever code extracts the first paragraph
doesn't consider that there may be unclosed tags, so from
the post

{% raw %}
```
---
---
{% highlight c %}

{%endhighlight %}
```

the extracted excerpt is:

```
{% highlight c %}
```
{% endraw %}

Which of course fails with the error message we saw above. Two ways to
work around this, which are nice to do anyway:

 - add `excerpt_separator: '<!-- more -->'` to `_config.yml`. You can
   now add the string `<!-- more -->` to the source of your post to
   fine-tune where the excerpt should end.
 - use the GitHub way (```) of marking up code listings

## Embedding Disqus

Adding the embed code is as simple as it gets; you can just open up
`_layouts/post.html`, and add the snippet provided by Disqus. See also
[the instructions](https://help.disqus.com/customer/portal/articles/472138-jekyll-installation-instructions)
provided by Disqus themselves. If you want to get a bit more fancy to keep the layout cleaner, you can create `_includes/disqus.html`, use a config variable for the Disqus shortname, and just include the snippet in `_layouts/post.html`.

`_includes/disqus.html`

{% raw %}
```html
{% if site.disqus_shortname %}
  <div id="disqus_thread"></div>
  <script type="text/javascript">
          var disqus_shortname = '{{ site.disqus_shortname }}';
          (function() {
                  var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                  dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
                  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
          })();
  </script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
{% endif %}
```
{% endraw %}

Note that to display the above code listing, I had to wrap it with `{% raw %}{% raw %}{% endraw %}` to keep Liquid from interpolating values like `{% raw %}{{ page.title }}{% endraw %}`.

`_config.yml`

```yaml
# ...
disqus_shortname: abestoswoes
# ...
```

`_layouts/post.html`

{% raw %}
```html
<!-- ... -->
<h1>Comments</h1>
{% include "disqus.html" %}
<!-- ... -->
```
{% endraw %}

## Migrating Disqus (trailing `/`)

In my setup the migration changed the URL scheme in one tiny detail:
there is now a trailing slash. Unfortunately this caused the Disqus
conversations to be effectively lost. Luckily Disqus
[provides documentation](https://help.disqus.com/customer/portal/articles/286778-migration-tools)
for how to migrate when URLs or even domains change. In my case it
turned out that the old (`/`-less) URLs redirect to the new URLs, so I
could just run the Redirect Crawler. One click, and all the
discussions are back in place. Great experience.

## Embedding Google Analytics

I used the very same approach as for Disqus:

`_includes/google_analytics.html`

{% raw %}
```html
{% if site.google_analytics_tracking_id %}
  <script type="text/javascript">
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', '{{ site.google_analytics_tracking_id }}']);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
  </script>
{% endif %}
```
{% endraw %}

`_config.yml`

```yaml
# ...
google_analytics_tracking_id: UA-17390698-2
# ...
```

`_includes/head.html`

{% raw %}
```html
<!-- ... -->
  {% include google_analytics.html %}
<!-- ... -->
```
{% endraw %}

## Sitemap and RSS feed

For sitemap generation, the
[sitemap_generator](https://github.com/kinnetica/jekyll-plugins)
plugin provides a great and simple solution; just drop the `.rb` file
into your `_plugins` directory. Of course there's the question of
automating the sitemap submission when it changes, which ties into
automating deployment of a Jekyll blog; that's a story for another
time.

For the RSS feed, I wanted to keep the URL I had previously, namely
`/atom.xml`. Jekyll initializes the project with the RSS feed at
`/feed.xml`. The solution is deceptively simple; I looked for
configuration variables to tweak for several minutes before realizing
that there's an actual `feed.xml` file in the root of the project that
I can just rename to `atom.xml`. The filename is referenced in three
places, they need to be updated: in the `.xml` file itself, in
`index.html` and `_includes/head.html`. (I actually forgot to do that
until I wrote about it in this post)

## In conclusion

I like how much cleaner the repository is with
Jekyll compared to Octopress 2. To be fair, that's one of the main
concerns Octopress 3 addresses. I also prefer the default Jekyll
template to the Octopress one; not that that's a huge argument. All
that's left now is to write some more content that's not about the
blog itself.

*Happy blogging!*
