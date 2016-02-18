---
title: Communication models
---

Communication is such an overloaded word. It means so many things that the real
meaning often is defined by context and - ironically enough - when communication
is sub-par, different people will infer different meanings from the same
context. Worse yet, the person you're talking to may be in a very different
context than you are, even in the very same conversation. (Say, "Your project is
interesting, but today I care more about my new-born daughter")

So for the purposes of this post, communication is about reaching the same
understanding about an idea. Not consensus on whether it's a good or a bad idea;
just a shared understanding of what the idea *is*. I'm not an expert at this by
any means; have no formal education (or otherwise, really), but I've been told I
usually do a good job of conveying ideas; so here's a few ways I think about
communication.

<!-- more -->

## Communication as serialization and deserialization

If you've worked on software or telecommunications systems, you've most likely
come across the concept of serialization and its inverse, deserialization. The
idea is simple: you have a complex representation of some data with potential
cross-references across the data structure, and you want to transfer this
complex data over a medium that only supports transferring data sequentially,
then turn it back into the same model. To give you a concrete example, you may
have a list of cats and cat owners, and cat owners hold a reference to their
cats, and cats hold a reference to their owners. Sometimes, the owners and the
cats don't agree on which cats are owned by which cat owners. Sometimes, cats
don't agree that people own cats, but insist it's the other way around; but I
digress.

If you want to represent this data set as text, in which one character strictly
follows another character, you need to come up with a way to represent the
relations between cats and owners, and maybe even drop some information that
only makes sense inside one system and not another. Human languages have tools
for this, as do computer systems. Whatever tool is used to represent a complex
idea as a sequence of characters, it's an instance of serialization.

When thinking about human-to-human communication, I often use the same mental
model. I have a complex model of some idea; its various parts are interconnected
with connections of varying kinds and strengths. When communicating this
complex idea to another person, my goal is to manipulate the brain of the person
on the receiving end into having the same, or at least a very similar, model of
the idea.

How do we do this? We do this by serializing the idea into words, which the
other person will then deserialize; that is, turn back into a similarly complex
idea. The trick is of course to emit information in a sequence that allows for
easy deserialization, and to ensure that at the end of deserialization the
receiving party has a similar model to yours. Having an understanding or at
least intuition for how the other person structures their thoughts helps this
immensely.

### In practice

There are a few structures that work well regardless of who's receiving the
information. My favorite one is about minimizing the surprise each piece of
information causes. 

 * Structure your text (spoken or written, the same principle applies) in a way
that each piece of information builds on the previous ones, towards a clear
conclusion. If done right, the listener will expect your conclusion by the time
you're just half-way there.
 * When referencing previous pieces of information, it pays to not go back very
far; keep related pieces of information close together in the data stream. 
 * Make sure that for each piece of information, everything required to
understand it has already been provided.
 * If you expect a question to arise in the listener at a given point, try to
handle it right there; it'll otherwise take up space in their cache, leaving
less processing power for interpreting your words.

If you're into that kind of thing, you can think of this as axiomatic
communication.

## Communication as collaborative (distributed) sculpting

The previous part was about one-way communication; one party conveys some idea
to another party. But of course the more interesting kind of communication is
conversation, when you work together with someone in shaping an idea.

Imagine, if you will, the idea you're shaping together as a clay sculpture. You
can poke holes in it, stretch it, remove parts, add clay in other parts. You
have a sculpture representing the idea, as does your partner. The trick: *you
can never look at the sculpture of your partner*. You can only ever talk about
it, using for example the technique outlined above. Based on this conversation,
you have some idea of what their sculpture looks like, just like they have some
idea of what yours looks like. This goes back to the inherently lonely feeling
of never being able to fully understand another person; but it makes for a very
exciting exercise that, when done right, is extremely fulfilling.

So in this model, there are a couple of actions you can take (and your partner too),
and no set order in which you can take these actions:

 * Tell your partner about some feature of your sculpture
 * Ask your partner about some feature of their sculpture
 * Tell your partner about some feature you think their sculpture has
 * Ask your partner what they imagine a particular feature of your sculpture
   looks like
 * Change your sculpture
 * Tell your partner about a change you made to your sculpture

A simplistic algorithm then goes like this:

 * Tell your partner about your current sculpture
 * Ask your partner about their sculpture
 * Talk about the sculptures and your models of each others sculptures until
   you're reasonably sure you have a sufficiently accurate model of each others
   sculptures
 * Make small changes to your sculpture, and communicate them
 * Watch for changes that don't make sense; if your partner removes clay that
   isn't there, it means your sculptures have diverged, and you need to go back
   to (near) the beginning.
   
This model has often helped me fix misunderstandings. Specifically, when the
last step is not observed, confusion and frustration is inevitable. "What do you
mean, you don't understand how I poke a hole at coordinates 1,5,3? What's there
to not understand?" - "Man, there is NO CLAY there? How do you poke a hole?" And
that's the point to realize that you need to go back and sync.

The art is in doing as little syncing as possible, while making as many and big
changes as possible, while keeping the sculptures and the models of each others
sculptures perfectly in sync. When that happens, it's what I imagine
professional dancers feel during a dance routine.
