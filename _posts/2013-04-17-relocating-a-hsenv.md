---
title: Relocating a hsenv
robotsmeta:
  - index,follow
categories:
  - Uncategorized
tags:
  - haskell
---
If you have a [hsenv][1] environment (kind of like virtualenv, except it’s for Haskell), you can easily move it to another location and use it there; all you need to do is change a few strings in a few files. Here’s how, assuming you’re in the directory containing the `.hsenv` folder:

 [1]: http://hackage.haskell.org/package/hsenv

```bash
    old_location=FILL_THIS
    new_location=FILL_THIS
    for file in ghc_package_path_var path_var_prependix bin/activate; do
        sed -e "s,$old_location,$new_location,g" -i .hsenv/$file
    done
```
