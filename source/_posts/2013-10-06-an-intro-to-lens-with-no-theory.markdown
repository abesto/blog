---
layout: post
title: "An intro to Lens with no theory"
date: 2013-10-06 09:15
comments: true
---

`Control.Lens` is an awesome Haskell library by Edward Kmett that makes working with complex data-types a joy. That might sound boring, but consider updating a deeply nested value. Which of the following do you prefer?

## Motivation

```haskell
-- With pattern matching
updateZ :: Alpha -> (Int -> Int) -> Alpha
updateZ a@Alpha{beta=b@Beta{gamma=g@Gamma{z=old}}} f = a{beta=b{gamma=g{z=f old}}}

-- With field accessors
updateZ' :: Alpha -> (Int -> Int) -> Alpha
updateZ' a f = a{beta=b{gamma=g{z=new}}}
                where b = beta a
                      g = gamma b
                      new = f $ z $ gamma $ beta a

-- With Control.Lens
-- There's some cheating going on, this is just here to show the difference.
-- See below for complete examples.
updateZ'' :: Alpha -> (Int -> Int) -> Alpha
updateZ'' a f = a&beta.gamma.z %~ f
```

If you picked number three, read on. First, here are two programs for actually running the above examples, so you can poke at them. Then we'll examine parts of the [tutorial at lens.github.io](http://lens.github.io/tutorial.html) (which is totally great), look at some generalizations and finish with some extra coolness. You can also find some useful links at the bottom.

<!-- MORE -->

### Without `Lens`

```haskell
data Alpha = Alpha { beta :: Beta, x :: Int } deriving Show
data Beta  = Beta { gamma :: Gamma, y :: Int } deriving Show
data Gamma = Gamma { z :: Int } deriving Show

-- With pattern matching
updateZ :: Alpha -> (Int -> Int) -> Alpha
updateZ a@Alpha{beta=b@Beta{gamma=g@Gamma{z=old}}} f = a{beta=b{gamma=g{z=f old}}}

-- With field accessors
updateZ' :: Alpha -> (Int -> Int) -> Alpha
updateZ' a f = a{beta=b{gamma=g{z=new}}}
                where b = beta a
                      g = gamma b
                      new = f $ z $ gamma $ beta a

alpha = Alpha { beta = Beta { gamma = Gamma 5, y = 4 }, x = 3 }

main = do
    print $ show $ updateZ alpha (+3)
    print $ show $ updateZ' alpha (+3)

-- Output:
-- "Alpha {beta = Beta {gamma = Gamma {z = 8}, y = 4}, x = 3}"
-- "Alpha {beta = Beta {gamma = Gamma {z = 8}, y = 4}, x = 3}"
```

### With `Lens`

```haskell
{-# LANGUAGE TemplateHaskell #-}
-- The above line tells Haskell that we're gonna do some magic

import Control.Lens

-- Add an underscore to the field names; it's for the type magic to work.
data Alpha = Alpha { _beta :: Beta, _x :: Int } deriving Show
data Beta  = Beta { _gamma :: Gamma, _y :: Int } deriving Show
data Gamma = Gamma { _z :: Int } deriving Show

-- This performs the aforementioned type magic
makeLenses ''Alpha
makeLenses ''Beta
makeLenses ''Gamma

updateZ :: Alpha -> (Int -> Int) -> Alpha
updateZ a f = a&beta.gamma.z %~ f

alpha = Alpha { _beta = Beta { _gamma = Gamma 5, _y = 4 }, _x = 3 }

main = print $ show $ updateZ alpha (+3)
-- Output:
-- "Alpha {_beta = Beta {_gamma = Gamma {_z = 8}, _y = 4}, _x = 3}"
```

## Reading and writing

Let's look at some examples from [lens.github.io/tutorial.html](http://lens.github.io/tutorial.html). The first one goes like this:

```
ghci> ("hello","world")^._2
"world"
```

You can correctly infer that we've just read the second value of the tuple in a really complicated way. But what exactly is going on? Here's an almost character-by-character translation to plain English.

 * `("hello","world")` is just a standard tuple. Nothing to see here.
 * `value^.` says: we're going to be reading from the thing on the left. In an object-oriented language this would be simply a dot, except with `Lens` we'll have a separate symbol for saying we're going to update the thing on the left.
 * `_2` is a predefined lens for the second element of a tuple. `Control.Lens` comes with a whole bunch of predefined lens for built-in data types (and for some provided by libraries)

Side-note: what's a lens, anyway? For our purposes, it's a fancy field accessor.

Let's see some nesting:

```
ghci> ((1,2),(3,4))^._1._2
2
```

Note how selectors are applied left to right: we take the first element of the outer tuple (apply `_1`), then we take the second element of the tuple we just got (apply `_2`). This is pretty similar to how you'd write the same in an object-oriented language.

So how do we write, instead of reading?

```
ghci> ("hello","world")&_2 .~ "bello"
("hello","bello")
```

 * `value&` says "we'll be updating the thing on the left". This means we'll go in and modify whatever's after `&`, then return the full original value, with these changes applied.
 * `_2` is our friend from before. Note how we're using the same lens for reading and writing.
 * `.~` means "assign exactly this value".

And again, let's add some nesting:

```
ghci> ((1,2),(3,4))&_1._2 .~ 42
((1,42),(3,4))
```

## Your own data types under the lens

`Control.Lens` can automatically build lenses similar to `_1` for your own data types. You'll need to do three things, clearly demonstrated in the tutorial, copy-pasted here:

```
{-# LANGUAGE TemplateHaskell #-}
data Foo a = Foo { _bar :: Int, _baz :: Int, _quux :: a }
makeLenses ''Foo
```

 * The first line tells GHC that we'll be doing some magic. Specifically, it's a `LANGUAGE` pragma enabling the templating capabilities of GHC, which let us generate Haskell code using Haskell code at compile time. But I promised no theory, so you needn't understand that.
 * The second line is a simple record type. The only thing to note is that all fields start with an underscore. This is so that our lens can look nice (we'll be using them instead of pattern matching or using the simple accessors). Specifically, `makeLenses` will create things called `bar`, `baz` and `quux`, and the underscores are there to avoid a naming collision.
 * The third line tells `Control.Lens` to generate our lenses.

So now we can write:

```
getBar :: Foo a -> Int
getBar x = x^.bar
```

Remember that a lens can be used for both reading and writing. This means the following will also work:

```
setBar :: Foo a -> Int -> Foo a
setBar x y = x&bar .~ y
```

## More complex updates

What if we want to update a field to be a function of its original value?

```
ghci> (1,2)&_1 %~ (+1)
(2,2)
```

 * `%~` says: transform the value I've just selected on the left, using the function on the right.
 * `(+1)` is just the standard partially applied `+` operator used in all the Haskell tutorials ever.

But we can do better:

```
ghci> (1,2)&_1 +~ 1
(2,2)
```

`Control.Lens` also provides some pretty fancy ways of using lenses, as you can see.

Now let's try updating all elements of a list. We don't need lenses for that.

```
ghci> map (+1) [1,2,3]
[2,3,4]
```

But what if we wanted to update the second element of each tuple in a list of tuples?

```
ghci> map (\(x, y) -> (x, y+1)) [(1,1), (2,2), (3,3)]
[(1,2),(2,3),(3,4)]
```

As we add nesting, things get reliably ugly. Lenses to the rescue!

```
ghci> [(1,1), (2,2), (3,3)]&mapped._2 +~ 1
[(1,2),(2,3),(3,4)]
```

 * Take a list of tuples of numbers
 * `&`: we'll be updating this
 * `mapped`: for each element of the list
     *  `._2`: take the second element of the tuple
     *  `+~`: update by adding whatever's on the right of this operator

Note that `mapped` works over any container: `Data.Map`, `Data.Set`, trees, what have you. In reality it works over any `Functor`, but you can ignore that if you haven't already read the [Typeclassopedia](http://www.haskell.org/haskellwiki/Typeclassopedia). Which you totally should.

## Let's generalize a bit

Remember the example from the beginning? Here's the data structure again:

```
data Alpha = Alpha { _beta :: Beta, _x :: Int } deriving Show
data Beta  = Beta { _gamma :: Gamma, _y :: Int } deriving Show
data Gamma = Gamma { _z :: Int } deriving Show
```

We saw that we can update an `alpha.beta.gamma.z` value:

```
updateZ :: Alpha -> (Int -> Int) -> Alpha
updateZ a f = a&beta.gamma.z %~ f
```

You should now be able to figure out how this code works.

 * `a&`: we'll be updating `a` (which is of type `Alpha`)
 * `beta.gamma.z`: going down the data structure, all the way to `z`
 * `%~ f`: update the value to `f z`

What if we need to access a `z` embedded in an `Alpha` in many different places? We can define our own lens by composing other lenses:

```
zOfAlpha = beta.gamma.z
```

We can now rewrite `updateZ` as:

```
updateZ a f = a&zOfAlpha %~ f
```

Since `zOfAlpha` knows that it must operate on an `Alpha`, we can even omit that parameter.

```
updateZ :: (Int -> Int) -> Alpha -> Alpha
updateZ f = zOfAlpha %~ f
```

You may notice that `f` is at the end of both sides of the equation for `updateZ`, so we should be able to remove it. And indeed:

```
updateZ :: (Int -> Int) -> Alpha -> Alpha
updateZ = (zOfAlpha %~)
```

This fine, even if it looks a bit clumsy. Luckily the infix operators also have accompanying prefix operators. For example `.~` is the infix operator that does the same as `set` and `%~` is the infix operator for `over`. So we can write:

```
setZ :: Int -> Alpha -> Alpha
setZ = set zOfAlpha

updateZ :: (Int -> Int) -> Alpha -> Alpha
updateZ = over zOfAlpha
```

Remember that the same lens can always be used for reading as well. Maybe you've already guessed that we can use `get` similarly to `set`. In that case you wouldn't be too wrong. It's called `view`.

```
viewZ :: Alpha -> Int
viewZ = view zOfAlpha
```

## Conclusion

That should be enough to get you started writing pretty good code when using complex data structures. There's plenty more to `Control.Lens`, but I hope this tutorial gave you a grip on the basics. Here comes the full compilable code for the "z of Alpha" example, and then some links for further reading.

```
{-# LANGUAGE TemplateHaskell #-}
-- The above line tells Haskell that we're gonna do some magic

import Control.Lens

-- Add an underscore to the field names; it's for the type magic to work.
data Alpha = Alpha { _beta :: Beta, _x :: Int } deriving Show
data Beta  = Beta { _gamma :: Gamma, _y :: Int } deriving Show
data Gamma = Gamma { _z :: Int } deriving Show

-- This performs the aforementioned type magic
makeLenses ''Alpha
makeLenses ''Beta
makeLenses ''Gamma

-- Get the `z` embedded deep inside an Alpha.
-- The type is a bit more general than what we need, feel free to ignore it.
zOfAlpha :: Functor f => (Int -> f Int) -> Alpha -> f Alpha
zOfAlpha = beta.gamma.z

setZ :: Int -> Alpha -> Alpha
setZ = set zOfAlpha

updateZ :: (Int -> Int) -> Alpha -> Alpha
updateZ = over zOfAlpha

viewZ :: Alpha -> Int
viewZ = view zOfAlpha

alpha = Alpha { _beta = Beta { _gamma = Gamma 5, _y = 4 }, _x = 3 }

main = do 
    print "The original alpha"
    print $ show alpha
    print "z in the original"
    print $ show $ viewZ alpha
    print "z set to 42"
    print $ show $ setZ 42 alpha
    print "z doubled"
    print $ show $ updateZ (*2) alpha
```

## Further reading

 * [lens.github.io](http://lens.github.io/): The best-looking home-page of a Haskell library ever.
     * [The Tutorial](http://lens.github.io/tutorial.html)
     * [Operator reference](https://github.com/ekmett/lens/wiki/operators)
 * [Hackage documentation](http://hackage.haskell.org/package/lens-3.9.0.2), with a special mention to all the modules under `Data`, providing lens for lots of data types.
 * [The Lens video](https://www.youtube.com/watch?v=cefnmjtAolY&hd=1&t=1m14s): Edward Kmett introducing Lens at the New York Haskell User Group. Not theory-free in the least. Awesome talk.
 * [FPComplete on Lenses](https://www.fpcomplete.com/school/pick-of-the-week/basic-lensing), another great introduction
