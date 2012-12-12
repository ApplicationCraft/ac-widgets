/* Fancy Button jQuery plugin */
    /*!
     *
     * Copyright 2010-2011, Acid Media
     * Licensed under the MIT license.
     *
     */
    (function ($) {

        function darken(hex, lum) {
            // validate hex string
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex.split('');
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            lum = lum || 0;
            // convert to decimal and change luminosity
            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i * 2, 2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }
            return rgb;
        }

        function Button(elm, settings) {
            var that = this,
                pre = ['-webkit-', '-moz-', '-ms-', '-o-', ''],
                e = $(elm),
                s = $.extend({}, defaults, settings),
                ttxt = s.text !== undefined ? s.text : e.text(),
                txt = $.trim(ttxt) == '' ? '&nbsp;' : ttxt,
                i = $((s.image ? '<img src="' + s.image + '" alt="' + txt + '" />' : '') + '<span class="fancy-inner" style="' + (s.padding ? ('padding:' + s.padding) : '') + '">' + txt + '</span>'),
                style = $('<style id="fancy_style_' + elm.id + '" type="text/css"></style>').appendTo('head'),
                style1 = '.fancy-' + elm.id + ' {',
                style2 = '.fancy-' + elm.id + ' .fancy-inner {',
                hover = '.fancy-' + elm.id + ':hover {',
                after = '.fancy-' + elm.id + ':after {',
                afterHover = '.fancy-' + elm.id + ':hover:after {',
                pressed = '.fancy-pressed-' + elm.id + ' {',
                pressedHover = '.fancy-pressed-' + elm.id + ':hover {',
                pressedAfter = '.fancy-pressed-' + elm.id + ':after {',
                pressedHoverAfter = '.fancy-pressed-' + elm.id + ':hover:after {',
                disabled = s.disabled || e.hasClass('fancy-disabled');

            e.html(i)
                .addClass('fancy fancy-' + elm.id + ' ' + s.cssClass + (disabled ? ' fancy-disabled' : '') + (s.image ? ' fancy-img' : ''))
                .bind(START_EVENT + '.fancy', function() {
                    if (!disabled && s.pushEffect)
                        $(this).addClass('fancy-active');
                })
                .bind('vclick.fancy', function() {
                    if (!disabled && s.sticky)
                        $(this).toggleClass('fancy-pressed-' + elm.id);
                });

            var pdg = i.innerWidth() - i.width() + 4;

            if (s.width && s.width - pdg > i.width()) {
                i.width(s.width - pdg);
            }

            var fill = true,
                f = s.fill,
                color1 = $.isArray(f) ? f[0] : f,
                color2 = $.isArray(f) ? (f[1] ? f[1] : darken(color1, -0.4)) : f,
                border = darken(color1, -0.5),
                hover1 = darken(color1, -0.1)
            hover2 = darken(color2, -0.1)
            width = i.outerWidth(),
                height = e.outerHeight(),
                w2 = Math.round(width / 2),
                w1 = w2 * 2;

            var defaultColorStyle = 'background-color:' + color1 + ';';
            var defaultHoverStyle = 'background-color:' + hover1 + ';';

            if (!s.image) {
                // Shape styles
                switch (s.shape) {
                    case 'circle':
                        i.css('padding', i.css('padding-top'));
                        var width = i.outerWidth(),
                            b = Math.round(width / 2),
                            w = i.width() - 2;
                        style1 += 'border-color:' + border + ';';
                        style2 += 'height:' + w + 'px;line-height:' + w + 'px;';
                        $.each(pre, function(i, v) {
                            style1 += v + 'border-radius:' + b + 'px;';
                            style2 += v + 'border-radius:' + b + 'px;';
                        });
                        break;
                    case 'rounded':
                        style1 += 'border-color:' + border + ';';
                        $.each(pre, function(i, v) {
                            style1 += v + 'border-radius:5px;';
                            style2 += v + 'border-radius:5px;';
                        });
                        break;
                    case 'triangle-n':
                        i.css('padding', '0 0 0.5em 0');
                        fill = false;
                        style1 += 'width:0;height:0;border:0;border-bottom:' + w1 + 'px solid ' + color1 + ';border-left:' + w2 + 'px solid transparent;border-right:' + w2 + 'px solid transparent;';
                        style2 += 'width:' + w1 + 'px;position:absolute;bottom:-' + w1 + 'px;left:-' + w2 + 'px;border:0;';
                        hover  += 'border-color: transparent transparent ' + hover1 + ' !important;';
                        break;
                    case 'triangle-e':
                        i.css('padding', '0 0 0 0.5em');
                        fill = false;
                        style1 += 'width:0;height:0;border:0;border-left:' + w1 + 'px solid ' + color1 + ';border-top:' + w2 + 'px solid transparent;border-bottom:' + w2 + 'px solid transparent;';
                        style2 += 'position:absolute;top:-' + w2 + 'px;left:-' + w1 + 'px;line-height:' + w1 + 'px;border:0;';
                        hover  += 'border-color: transparent transparent transparent ' + hover1 + ' !important;';
                        break;
                    case 'triangle-s':
                        i.css('padding', '0.5em 0 0 0');
                        fill = false;
                        style1 += 'width:0;height:0;border:0;border-top:' + w1 + 'px solid ' + color1 + ';border-left:' + w2 + 'px solid transparent;border-right:' + w2 + 'px solid transparent;';
                        style2 += 'width:' + w1 + 'px;position:absolute;top:-' + w1 + 'px;left:-' + w2 + 'px;border:0;';
                        hover  += 'border-color:' + hover1 + ' transparent !important;';
                        break;
                    case 'triangle-w':
                        i.css('padding', '0 0.5em 0 0');
                        fill = false;
                        style1 += 'width:0;height:0;border:0;border-right:' + w1 + 'px solid ' + color1 + ';border-top:' + w2 + 'px solid transparent;border-bottom:' + w2 + 'px solid transparent;';
                        style2 += 'position:absolute;top:-' + w2 + 'px;right:-' + w1 + 'px;line-height:' + w1 + 'px;border:0;';
                        hover  += 'border-color:transparent ' + hover1 + ' transparent !important;';
                        break;
                    case 'ios-w':
                        e.addClass('fancy-ios fancy-ios-w');
                        var x = Math.sqrt(height * height / 2) + 1;
                        style1 += 'border-color:' + border + ';margin-left:' + (height / 2) + 'px;';
                        after += 'height:' + (x-1) + 'px;width:' + x + 'px;left:-' + (height * 0.3125) + 'px;top:' + ((height - x) / 2 - 1.7) + 'px;border-color:' + border + ';';

                        after += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + color1 + '), to(' + color2 + '));';
                        afterHover  += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + hover1 + '), to(' + hover2 + '));';
                        pressedAfter  += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + color2 + '), to(' + color1 + '));';
                        pressedHoverAfter  += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + hover2 + '), to(' + hover1 + '));';
                        $.each(pre, function(i, v) {
                            after += defaultColorStyle + 'background-image:' + v + 'linear-gradient(top left,' + color1 + ',' + color2 + ');';
                            afterHover += defaultHoverStyle + 'background-image:' + v + 'linear-gradient(top left,' + hover1 + ',' + hover2 + ');';
                            pressedAfter  += defaultColorStyle + 'background-image:' + v + 'linear-gradient(top left,' + color2 + ',' + color1 + ');';
                            pressedHoverAfter  += defaultHoverStyle + 'background-image:' + v + 'linear-gradient(top left,' + hover2 + ',' + hover1 + ');';
                        });
                        break;
                    case 'ios-e':
                        e.addClass('fancy-ios fancy-ios-e');
                        var x = Math.sqrt(height * height / 2) + 1;
                        style1 += 'border-color:' + border + ';margin-right:' + (height / 2) + 'px;';
                        after += 'height:' + (x-1) + 'px;width:' + x + 'px;right:-' + (height * 0.3125) + 'px;top:' + ((height - x) / 2 - 1.7) + 'px;border-color:' + border + ';';
                        after += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + color1 + '), to(' + color2 + '));';
                        afterHover  += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + hover1 + '), to(' + hover2 + '));';
                        pressedAfter  += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + color2 + '), to(' + color1 + '));';
                        pressedHoverAfter  += 'background-image:-webkit-gradient(linear, 0 0, 100% 100%, from(' + hover2 + '), to(' + hover1 + '));';
                        $.each(pre, function(i, v) {
                            after += defaultColorStyle + 'background-image:' + v + 'linear-gradient(top left,' + color1 + ',' + color2 + ');';
                            afterHover += defaultHoverStyle + 'background-image:' + v + 'linear-gradient(top left,' + hover1 + ',' + hover2 + ');';
                            pressedAfter  += defaultColorStyle + 'background-image:' + v + 'linear-gradient(top left,' + color2 + ',' + color1 + ');';
                            pressedHoverAfter  += defaultHoverStyle + 'background-image:' + v + 'linear-gradient(top left,' + hover2 + ',' + hover1 + ');';
                        });
                        break;
                    default:
                        style1 += 'border-color:' + border + ';';
                }

                // Fill
                if (fill) {
                    style1 += defaultColorStyle;
                    hover  += defaultHoverStyle;
                    pressed  += 'background-color:' + color2 + ';';
                    pressedHover  += 'background-color:' + hover2 + ';';
                    if ($.isArray(f)) { // Linear gradient
                        style1 += 'background-image:-webkit-gradient(linear, 0 0, 0 100%, from(' + color1 + '), to(' + color2 + '));';
                        hover  += 'background-image:-webkit-gradient(linear, 0 0, 0 100%, from(' + hover1 + '), to(' + hover2 + '));';
                        pressed  += 'background-image:-webkit-gradient(linear, 0 0, 0 100%, from(' + color2 + '), to(' + color1 + '));';
                        pressedHover  += 'background-image:-webkit-gradient(linear, 0 0, 0 100%, from(' + hover2 + '), to(' + hover1 + '));';
                        $.each(pre, function(i, v) {
                            style1 += 'background-image:' + v + 'linear-gradient(' + color1 + ',' + color2 + ');';
                            hover  += 'background-image:' + v + 'linear-gradient(' + hover1 + ',' + hover2 + ');';
                            pressed  += 'background-image:' + v + 'linear-gradient(' + color2 + ',' + color1 + ');';
                            pressedHover  += 'background-image:' + v + 'linear-gradient(' + hover2 + ',' + hover1 + ');';
                        });
                    }
                }
            }
            else {
                style2 += 'margin-top:-' + Math.round($('.fancy-inner', e).height() / 2) + 'px;';
            }

            var st = style1 + '}' + style2 + '}' + hover + '}' + pressed + '}' + pressedHover + '}' + after + '}' + afterHover + '}' + pressedAfter + '}' + pressedHoverAfter + '}';

            if (style[0].styleSheet) // IE
                style[0].styleSheet.cssText = st;
            else
                style.html(st);

            this.settings = s;
        }

        var date = new Date(),
            uuid = date.getTime(),
            touch = 'ontouchstart' in window,
            START_EVENT = touch ? 'touchstart' : 'mousedown',
            MOVE_EVENT = touch ? 'touchmove' : 'mousemove',
            END_EVENT = touch ? 'touchend' : 'mouseup',
            buttons = {},
            defaults = {
                shape: 'rectangle',
                fill: ['#08C'],
                cssClass: '',
                pushEffect: true,
                sticky: false,
                disabled: false
            },
            methods = {
                init: function(options) {
                    if (options === undefined) options = {};
                    return this.each(function () {
                        //$(this).data('class', $(this).attr('class'));
                        if (!this.id) {
                            uuid += 1;
                            this.id = 'fancy' + uuid;
                        }
                        buttons[this.id] = new Button(this, options);
                    });
                },
                destroy: function() {
                    return this.each(function () {
                        var btn = buttons[this.id];
                        if (btn) {
                            $('#fancy_style_' + this.id).remove();
                            $(this).unbind('.fancy').removeClass('fancy fancy-img fancy-ios fancy-ios-w fancy-ios-e fancy-pressed-' + this.id + ' fancy-' + this.id + ' ' + btn.settings.cssClass);
                            //$(this).unbind('.fancy').attr('class', $(this).data('class'));
                        }
                    });
                }
            };

        $(document).bind(END_EVENT, function() {
            $('.fancy').removeClass('fancy-active');
        });

        $.fn.fancy = function (method) {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            }
            else {
                $.error('Unknown method');
            }
        }

        $.fancy = {
            darken: function(hex, lum) {
                return darken(hex, lum);
            }
        }

    })(jQuery);

    /* End of fancy button jQuery plugin */