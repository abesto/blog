---
layout: post
title: "Recurring madness: functional bash"
date: 2013-06-21 16:55
comments: true
categories:
---

There are some ideas that have a will of their own. All the mighty strength of
these wills is focused on a single goal, with a narrow-mindedness comparable
only to a surgical laser. That goal is to become reality. You know this is so
because these crazy stupid ideas keep happening again and again to different
people.

One of these ideas is functional programming in bash.

<!-- more -->

## Function composition

Remember function composition? It's defined as follows: `(g ∘ f )(x) =
g(f(x))`. How do you even start thinking about that in bash? Well, functions in
bash are named, right? So if we can reference a function by name, it shouldn't
be too hard to create a new function that calls one, then calls the other with
the result, and prints the output.

The problem is the "create" part. I want to be able to write something like we
can do in Haskell:

```haskell
-- Given two functions
add1 = 1 +
add2 = 2 +
-- Compose in a really clean way
add3 = add1 . add2
```

There's no way to return a function in bash. We can return a number with
`return`, or echo some string. That's it. A number won't cut it, so the output
will need to be the name of the function. But that's not good enough, it would
mean that I don't have complete control of what exists in my
namespace. Consider: if the "return value" is a string, which is the name of the
new function, I can assign it to a new name, but the (probably mangled)
generated name is already polluting my namespace. So it follows that the only
solution is passing in the name I want for the result of the composition.

Great. So the signature (if there's even such a thing in Bash) will be something
like `compose(result_function, outer_function, inner_function)`. Let's write
code for that.

```bash
compose() {
    result_fun=$1; shift
    f1=$1; shift
    f2=$1; shift
    # OK, what now?
}
```

One could naively write:

```bash
compose() {
    result_fun=$1; shift
    f1=$1; shift
    f2=$1; shift
    $result_fun() {
        $f1 $($f2 $*);
    }
}
```

But Bash throws that right back in our face, saying: `$result_fun: not a valid
identifier`. Alright. Remember, this is a hack. What's a hack about? Breaking
boundaries. What's the root of all evil? (We have several of those, now that I
think about it). Anyway, one possible root of all evil is `eval`. It lets us
build a string, and evaluate it in the current context. Can we build a string
that, when evaluated, will define exactly the function we need? *HELL YES!*.

```bash
compose() {
    result_fun=$1; shift
    f1=$1; shift
    f2=$1; shift
    eval "$result_fun() {
              $f1 \$($f2 \$*);
          }"
}
```

Let's see it in action!

```bash
#!/bin/bash

compose() {
    result_fun=$1; shift
    f1=$1; shift
    f2=$1; shift
    eval "$result_fun() {
              $f1 \$($f2 \$*);
          }"
}

add() {
    expr $1 + $2
}

square() {
    expr $1 \* $1
}

compose square_of_sum square add
square_of_sum 2 3
```

Can you guess the result? ;)

## Turning it up a notch: partial application

Partial application of a function `f(x,y)` to a single argument creates a
function `g(y)` such that `f(x,y) = g(y)` for any `x` and `y`. (Partial
application can of course happen from the right, or for a specific argument; for
the purposes of this post, let's just do it from the left)

If you've ever written partial application in another language, you should now
see the general shape of the solution. To give you an idea, here's a solution in
JavaScript, if you're into that thing:

```js
function partial() {
  var partial_arguments = Array.prototype.slice.call(arguments),
      f = partial_arguments.shift();
  return function() {
    var rest = Array.prototype.slice.call(arguments);
    return f.apply(this, partial_arguments.concat(rest));
  };
}

function add(a, b) { return a + b; }
var add2 = partial(add, 2);
console.log(add2(3));
```

Or the same thing in Python. Interestingly enough, it's much cleaner, even
though Python is not usually touted for its support of function programming
(take a look at the built-in [`functools`][3] module though, it's full of awesome).

```python
def partial(f, *args):
    def result_fun(*rest):
        return f(*(args + rest))
    return result_fun

def add(a, b):
    return a + b

add2 = partial(add, 2)

print add2(3)
```

So with that, let's take a look at how that same thing works in Bash:

```bash
#!/bin/bash

add() {
    expr $1 + $2
}

partial() {
    exportfun=$1; shift
    fun=$1; shift
    params=$*
    eval "$exportfun() {
        more_params=\$*;
        $fun $params \$more_params;
    }"
}

partial add2 add 2
add2 3
```

We can even use `compose` and `partial` together to build more and more
complicated functions:

```bash
#!/bin/bash

compose() {
    result_fun=$1; shift
    f1=$1; shift
    f2=$1; shift
    eval "$result_fun() {
              $f1 \$($f2 \$*);
          }"
}

partial() {
    exportfun=$1; shift
    fun=$1; shift
    params=$*
    eval "$exportfun() {
        more_params=\$*;
        $fun $params \$more_params;
    }"
}

add() {
    expr $1 + $2
}

square() {
    expr $1 \* $1
}

partial add1 add 1
compose maybe_a_prime add1 square

maybe_a_prime 1
maybe_a_prime 2
maybe_a_prime 3
maybe_a_prime 4
```

So there, a tiny piece of functional programming in Bash. I hope it horrifies
you as much as it does me. You can find this code along with the madness of
others in [this GitHub repo][2].

Happy hacking!


 [1]: http://quasimal.com/posts/2012-05-21-funsh.html
 [2]: https://github.com/abesto/fun.sh
 [3]: http://docs.python.org/2/library/functools.html‎
