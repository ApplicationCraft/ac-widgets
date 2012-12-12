(function($, window, document, undefined){

    // This top section should always be present
    var widget = AC.Widgets.MediaElementAudio = function() {
        this.init.apply(this, arguments);
    };
    AC.extend(widget, AC.Widgets.MediaElementBase);
    var p = widget.prototype;

    // Define the widget Class name
    p._widgetClass = "MediaElementAudio";
    p._playerType = "audio";

    var actions = $.extend({}, AC.Widgets.MediaElementBase.actions(), actions);

    // The following lines are required

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    var props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,  // required
            AC.Property.general.name,         // required
            {name: "source", type : "audioSourceList", set: "source", get: "source", alias: "widget_mediaelementbase_sources"},
            AC.Property.media.autoplay,
            AC.Property.media.controls,
            AC.Property.media.preload,
            AC.Property.media.volume
        ]},
        { name: AC.Property.group_names.layout, props:[
            AC.Property.layout.x,
            AC.Property.layout.y,
            AC.Property.layout.pWidthHidden,
            AC.Property.layout.widthHidden,
            AC.Property.layout.heightHidden,
            AC.Property.layout.sizes,
            AC.Property.layout.minWidth,
            AC.Property.layout.maxWidth,
            AC.Property.layout.repeat,
            AC.Property.layout.zindex,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer
        ]},
        { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable
        ]},
        { name: AC.Property.group_names.data, props:[
            AC.Property.data.view,
            AC.Property.data.fields,
            AC.Property.data.groupby,
            AC.Property.data.orderby,
            AC.Property.data.filter,
            AC.Property.data.onview,
            AC.Property.data.applyview,
            AC.Property.data.listenview,
            AC.Property.data.resetfilter,
            AC.Property.data.autoLoad
        ]},
        { name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.bgColor,
            AC.Property.style.customCssClasses,
            AC.Property.style.widgetStyle
        ]}],
        defaultProps = {width: "240", height: "30", x : "100", y: "100", zindex : "auto", margin: "", alignInContainer: 'left', pWidth: "",
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
            opacity : 0.8, bgColor: "#000000", name: "Audio", data:[], enable: true, resizing: false, border:"1px solid gray",
            autoplay: false, preload:false, volume: 0.8, controls: true, source: [], widgetStyle: "default", customCssClasses: ""
        },
        lng = jQuery.extend(true, {'en': {widget_name_mediaelementaudio: "Audio"}}, AC.Widgets.MediaElementBase.langs());

    widget.props = function() {
        return props;
    };

    /**
     * Return empty widget prop
     * @return {Object} default properties
     */
    widget.emptyProps = function() {
        return $.extend({}, AC.Widgets.MediaElementBase.emptyProps());
    };

    /**
     * Return widget inline edit prop name
     * @return {String} default properties
     */
    widget.inlineEditPropName = function() {
        return "data";
    };

    widget.defaultProps = function() {
        return defaultProps;
    };

    /**
     * Return available widget actions
     * @return {Object} available actions
     */
    widget.actions = function() {
        return actions;
    };


    /* Lang constants */
    /**
     * Return available widget langs
     * @return {Object} available actions
     */
    widget.langs = function() {
        return lng;
    };

//    $.fn.createUnknownTag(p._playerType);

    AC.Core.lang().registerWidgetLang(lng);

})(jQuery,window,document);



