## custom-captcha

    suport three kind of content, icon/text/default;

## Usage

    yarn add custom-captcha;

    import init from 'custom-captcha';

    init().then(r => {
        if (r) {
            // do next...
        }
    });

    or

    init(options);

## Options

### backgroundColor

this can be a string like `#1890FF` OR `rgba(0,0,0,1)`.

default value is `["#1890ff", "#00bcd4"]` and this is `linear-gradient`.

### backgroundImage

this should be a url.

default value is '';

### shapes

this is a collection of shapes that will appear in random rate.

default value is `["rect", "circle", "triangle", "circle"]`.

### shape_count

default value is 10.

### shape_colors

default value is `["red", "yellow", "green"]`.

when `shape_count` > `shape_colors.length`, random color will be generated.

### shape_type

shapes can be `fill` or `stoke`.

default value is `fill`.

### modal_mask_bgColor

default value is `rgba(0,0,0,.05)`

### content position

default value is `modal_left: "50%", modal_top: "50%",`

### targetType

1. `targetType` is `icon`, `target` should be a url. like `/lib/logo.png`.
2. `targetType` is `text`, `target` should be a string. like: `hello`.
3. default value is a piece of puzzle.
