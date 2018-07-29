# Title: Image tag with caption for Jekyll
# Description: Easily output images with captions

module Jekyll

  class CaptionImageTag < Liquid::Tag
    @img = nil
    @title = nil
    @class = ''
    @width = ''
    @height = ''

    def initialize(tag_name, markup, tokens)
      if markup =~ /([^ ]*) +(.*)/i
        @img = $1
        @title = $2
      end
      super
    end

    def render(context)
      if @img
        Liquid::Template.parse("<span class='caption-wrapper'>" +
          "{% asset #{@img} width='#{@width}' height='#{@height}' alt='#{@title}' title='#{@title} 'class='caption' %}" +
          "<span class='caption-text'>#{@title}</span>" +
        "</span>").render(context)
      else
        "Error processing input, expected syntax: {% imgcap [class name(s)] /url/to/image [width height] [title text] %}"
      end
    end
  end
end

Liquid::Template.register_tag('imgcap', Jekyll::CaptionImageTag)
