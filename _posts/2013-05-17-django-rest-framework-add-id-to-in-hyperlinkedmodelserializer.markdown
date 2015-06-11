---
layout: post
title: "Django REST Framework: Add id in HyperlinkedModelSerializer"
date: 2013-05-17 23:07
comments: true
categories: Server
author: Zoltán Nagy
tags: [django, python]
---

```python
from rest_framework import serializers
from models import MyModel


class WithPkMixin(object):
    def get_pk_field(self, model_field):
        return self.get_field(model_field)


class MyModelSerializer(WithPk, serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MyModel
```


If that's enough for you, glad to be of service. Some context follows, and also a way to wrap JSON top-level list responses in a JSON object.

<!-- more -->

## Context!

[Django REST framework][1] is a lightweight but featureful and flexible REST framework on top of Django. I've been looking for something that can take care of the boilerplate of REST services, but allows for easy extension. So far, I'm happy with it: I didn't have to write a single `create` function :)

The framework breaks up the typical REST endpoint into several different concepts, making things very clear and easy to modify. The main components are:

 * Serializers: these take care of transforming a model to and from a dictionary (-like object)
 * Renderers: transform said dictionary-like object into a specific representation (JSON, XML, your custom binary format, ...)
 * Views: basically simple Django views, using serializers and renderers to respond to requests. What makes them so powerful is that the framework provides views implementing the most common patterns - not only for the views, by the way, but also for serializers and renderers. For example, `RetrieveUpdateDestroyAPIView` is a class-based view that handles `GET`, `PUT` and `DELETE` requests to specific resource instances. It interacts with your database using your Django models.

So the above snippet creates a mixin that modifies the behavior of `HyperlinkedModelSerializer`. By default the serializer includes a `url` field in the serialized data pointing to the resource in question. If we use this mixin, it _also_ includes an `id` field with the model id. This is not documented as far as I can tell, but the code of the framework is pretty easy to follow, and not long at all (Django already does a lot of heavy lifting, after all).

## A more complicated example

[The Flask framework][2] doesn't let us return a list at the top level of a JSON response for security reasons (read [this][3] to see why). Let's see how we can automatically wrap our list responses, to avoid this specific issue.

```python renderers.py
from rest_framework import renderers


class ListWrappingJSONRenderer(renderers.JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if isinstance(data, list):
            data = {'list': data}
        return super(ListWrappingJSONRenderer, self).render(data, accepted_media_type, renderer_context)
```

This will return a JSON object with a field called `list` containing the list we'd otherwise render. Since a Renderer takes a well-defined input, we can easily patch the input we recieve. The clear separation of the components make it clear where to do this. To use our new Renderer, we can simply modify `settings.py` to reference it instead of the `JSONRenderer` provided by the framework.

```python settings.py
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'restapi.renderers.ListWrappingJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
}
```

## Learn more

 * [Django REST framework homepage][1]
 * [Tutorial][5] (kind of long-winded, but gets the job done)
 * [API Guide][4]

 [1]: http://django-rest-framework.org/
 [2]: http://flask.pocoo.org/
 [3]: http://flask.pocoo.org/docs/security/#json-security
 [4]: http://django-rest-framework.org/#api-guide
 [5]: http://django-rest-framework.org/#tutorial
