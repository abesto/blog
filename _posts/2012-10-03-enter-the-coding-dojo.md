---
title: 'Enter: the Coding Dojo'
robotsmeta:
  - index,follow
categories:
  - Uncategorized
tags:
  - kata
---
After having fought my way through [Clean Code][1]![][2], I’m now reading [The Clean Coder][3]![][4]. Both are great books you should read. Clean Code helped me crystallize and expand on the ideas I had about good code. The Clean Coder is more about the part of programming you spend away from your computer; estimation, testing strategies, communicating inside and outside the team, generally being a professional. The whole book is really about being professional. (Disclaimer: links are affiliate links to Amazon)

 [1]: http://www.amazon.com/gp/product/0132350882/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0132350882&linkCode=as2&tag=abesswoes-20
 [2]: http://www.assoc-amazon.com/e/ir?t=abesswoes-20&l=as2&o=1&a=0132350882
 [3]: http://www.amazon.com/gp/product/0137081073/ref=as_li_tf_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0137081073&linkCode=as2&tag=abesswoes-20
 [4]: http://www.assoc-amazon.com/e/ir?t=abesswoes-20&l=as2&o=1&a=0137081073

I already have two active to-do items. There’s a whole paragraph asking “do you know what X is”? And honestly, I have no idea about most of those X’s. Not even what they may be about. So it’s probably time to pick up some more theory. On the other hand, Uncle Bob emphasizes actively honing your programming skills. A good way to do that is code katas. The term, apparently started [here][5], is taken from martial arts: a kata is a series of excercises you practice until you achieve perfect form (for an appropriately small threshold).

 [5]: http://codekata.pragprog.com/

 <!-- more -->

I’ve written three small scripts that should help document katas. One asks which kata you want to do, what language you want to use, sets up the environment and commits the initial state. The other makes sure your tests pass and commits your code. The third runs tests and commits the state after each test run. A kata “run” goes into a branch named after the kata, the language and the date. The branch reference is deleted after the kata is done. There’s one template directory per language; this is used to initialize a new kata by the script. A kata is just a directory with a README; it’ll contain all the actual kata “runs”. Here, have a look: [code-kata@GitHub][6]

 [6]: https://github.com/abesto/code-katas

The only template at the time is for Ruby; I’m usually knee deep in chef cookbooks nowadays, so getting more fluent in Ruby looks like a good idea. The “start” and “done” scripts are also in Ruby for the same reason. Testing is done with [rspec][7], a really cool DSL for writing tests. The first kata I did is [Prime Factors][8]. The spec is very simple, but the goal is to get the feel of the thing. It was also useful for fine-tuning the framework.

 [7]: http://rspec.info/
 [8]: http://amirrajan.net/Blog/code-katas-prime-factors

Here’s an example session using the tool:

    $ ./start.rb

    Language:
    0. ruby
    Choice: 0

    Kata:
    0. prime-factors
    Choice: 0
    You can now start working in katas/prime-factors/ruby-20121003-0
    When done, just come back here and say ./done.rb
    (creates a new branch, checks it out)

    # Write test
    ./test.sh
    tests fail (creates a commit with message FAIL)

    # Write code
    ./test.sh
    tests pass (creates a commit with message PASS)

    # Write test

    $ ./done.rb
    Running tests for katas/prime-factors/ruby-20121003-0
    Tests failed. Can't finish the kata if tests fail.

    # Write code

    $ ./done.rb
    Running tests for katas/prime-factors/ruby-20121003-0
    Grats, that's another one down. Don't forget to push!
    (Commits, merges the kata into master, deletes the branch reference)
