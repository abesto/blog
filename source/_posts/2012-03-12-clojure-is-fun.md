---
title: Clojure is fun
author: Zoltán Nagy
layout: post
permalink: /clojure-is-fun
robotsmeta:
  - index,follow
categories:
  - Uncategorized
---
It was time to try it out. Here’s the result – 67 lines of Clojure code for an RPN calculator with the basic operators. Also, [Seesaw][1] (GUI lib for Clojure) rocks.

 [1]: https://github.com/daveray/seesaw "Seesaw"

[GitHub repository][2]

 [2]: https://github.com/abesto/calc-clj

```clojure RPN calculator
    (ns net.abesto.calc_clj.core
      (:gen-class)
      (:use seesaw.core))

    (native!)

    (def stack-size 4)
    (def stack (ref []))
    (def gui-stack (ref []))

    (defn push [x] (dosync (ref-set stack (concat (next (deref stack)) [x]))))
    (defn popn [n]
      (dosync
       (let [ret (take-last n (deref stack))]
         (ref-set stack (take stack-size (concat (repeat n 0) (deref stack))))
         ret)))

    (defn sync-gui [] (dorun (map value! (deref gui-stack) (map str (deref stack)))))

    (defn number [n]
      (action
       :handler
       (fn [e]
         (dosync (push (  n (* 10 (first (popn 1))))))
         (sync-gui))
       :name (str n)
       ))

    (defn operator [label operator operand-count]
      (action
       :handler (fn [e]
                  (let [operands (popn operand-count)]
                    (push (apply operator operands)))
                  (sync-gui))
       :name label))

    (defn -main [&#038; args]
      (invoke-later
       (dosync
        (ref-set gui-stack (take stack-size (repeatedly #(text :editable? false))))
        (ref-set stack (repeat stack-size 0)))

       (sync-gui)
       (-> (frame
            :title "Hello",
            :content
            (vertical-panel
             :items [
                     (vertical-panel :items (deref gui-stack))
                     (horizontal-panel :items [
                                               (action :name "Enter" :handler (fn [e] (push 0) (sync-gui)))
                                               (operator " /-" - 1)
                                               ])
                     (grid-panel
                      :rows 4
                      :columns 4
                      :items [(number 7) (number 8) (number 9) (operator " "   2)
                              (number 4) (number 5) (number 6) (operator "-" - 2)
                              (number 1) (number 2) (number 3) (operator "*" * 2)
                              (number 0) ""         ""         (operator "/" / 2)
                              ])
                     ])
            :on-close
            :exit)
           pack!
           show!)
       ))
```
