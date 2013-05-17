---
title: Form builder
author: Zoltán Nagy
layout: page
robotsmeta:
  - index,follow
---
The links are broken, I’ll fix them soon.

Links:

*   [Try it out][1]
*   [Read the thesis][2]
*   [GitHub repository][3]

 [1]: http://abesto.net/formbuilder
 [2]: http://abesto.net/formbuilder/doc/doc.pdf
 [3]: http://github.com/abesto/form-builder-web

The application I developed as part of my thesis for the OKJ (National Vocational Qualification Registry) Internet Application Developer qualification.

It’s an interactive table-based form builder written in JavaScript, with the JQuery framework. The interface for managing the saved forms is fueled by CodeIgniter. It supports multiple languages, English and Hungarian right now. All the table operations are done, and all the input types (including select) are supported. Only tested with XULRunner-based browsers, and Opera to a lesser degree. IE is explicitly non-supported. It outputs beautified HTML based on the DOM created by the user. The code and commit comments are in Hungarian as a requirement, but the UI is fully translated into English (and the source itself uses English names for variables and functions).