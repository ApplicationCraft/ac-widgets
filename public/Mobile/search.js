    /**
 * @lends       WiziCore_UI_SearchMobileWidget#
 */
(function($, windows, document, undefined){
    var w = WiziCore_UI_SearchMobileWidget = AC.Widgets.WiziCore_UI_SearchMobileWidget =  AC.Widgets.WiziCore_UI_SearchMobileWidget = AC.Widgets.SearchMobile = function(){
        this.init.apply(this, arguments);
    };

    AC.extend(w, AC.Widgets.TextMobile);
    var p = w.prototype;

    p._widgetClass = "SearchMobile";
    p._input = null;
    p._dataPropName = "text";
    p._valueDefaultPropName = "text";
    /**
     * Description of constructor
     * @class       Some words about search widget class
     * @author      Konstantin Khukalenko
     * @version     0.1
     *
     * @constructs
     */
    p.init = function() {
        w._sc.init.apply(this, arguments);
    };

    p._text = function(text) {
        var input = this.base().find("input[type='search']");
        if (text !== undefined && text.length != 0) {
            input.val(text);
        }
        return input.val();
    };

    p._redraw = function(){
        var self = this;
        w._sc._redraw.apply(this, arguments);
        //$ mobile search =(

        if (!WiziCore_Helper.isAndroid()){
            this._input.css({"padding-left": "0px", "padding-right": "0px", "margin": "0px", "margin-left": "30px"});
            this._input.css({"width":"100%"});
            this._input.parent().css({padding: "0px", margin: "0px", "overflow": "hidden"});
        } else {
            this._input.css({"padding-left": "0px", "padding-right": "0px", "margin": "0px"});
            this._input.parent().css({padding: "0px 30px", margin: "0px", "overflow": "hidden"});
        }
        this._input.parent().parent().css("padding-right", "2px");
        this._input.unbind("change.custom").bind("change.custom", {self: self}, self.onChangeText);
        //this._input.parent().parent().css("padding-right", "2px");
        this._updateWidthOfInput();
        this._updateSize();
    };

    p.onPageDrawn = function() {
        //hack to set value after doPage() call
        w._sc.onPageDrawn.apply(this, arguments);
        this._updateSize();
        this._text(this.text());
    };

    p.getDataModel = function() {
        return [
            { name: "value", value: "", uid: "valueuid" }
        ];
    };

    p.mobileTextType = function(){
        return 'search';
    };

    p._updateSize = function(){
        if (this._input){
            this._input.css("min-height", this.height() - 15);
            //this._input.css("width", this.width() - 60);
        }
    };


    p._updateWidthOfInput = function(){
        var inp = this._input;
        if (inp){
            inp.parent().css("padding-right", "0px");
            if (this.getContainerLayoutType() == WiziCore_Widget_Layout.LAYOUT_TYPES.Absolute){
                inp.width(this.width() - 30);
            } else {
                inp.css("padding-right","30px");// fix for chrome
                inp.parent().css({"margin-right": "0px"});
                if (!WiziCore_Helper.isAndroid()){
                    inp.width("100%");
                } else {
                    inp.width("94%");
                }
            }
        }
    };

    p._updateLayout = function(){
        w._sc._updateLayout.apply(this, arguments);
        this._redraw();
    };

    p.onChangeText = function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(AC.Widgets.WiziCore_UI_TextMobileWidget.onChange);

        var oldValue = self._project['text'];
        var newValue = self._text();

        if (oldValue == newValue){
            return;
        }
        $(self).trigger(triggerEvent, [newValue, oldValue]);

        if (!triggerEvent.isPropagationStopped()) {
            self._project['text'] = newValue;
            var likeType = self.liketype();
            var searchValue = "";
            searchValue += (likeType == "Right" || likeType == "Both") ? "%" : '';
            var val = self.value().replace(/[%_\\]/g,'\\$&');
            searchValue += val;
            searchValue += (likeType == "Left" || likeType == "Both") ? '%' : '';

            if (self.mode() == WiziCore_Visualizer.RUN_MODE) {
                //only in runtime
                self.sendDrillDown(searchValue);
            }
        } else {
            self._text(oldValue);
        }
//        return !triggerEvent.isPropagationStopped();
    };

    p.sendDrillDown = function(value) {
        if (this._request !== null) {
            var field = this.field();
            var filter = ["(UPPER({" + field + "})) LIKE (UPPER('" + value + "'))"];
            this._request.drillDown(this.id(), filter, this.resetfilter());
        }
    };

    p.isBindableToData = function() {
        return true;
    };

    p.field = AC.Property.normal('field');
    p.liketype = AC.Property.normal('liketype');

    /**
     * Return available widget prop
     * @return {Object} available property
     * */
    w.actions = function() {
        var ret = $.extend(AC.Widgets.WiziCore_UI_TextMobileWidget.actions(), {});
        w.actions = function(){return ret};
        return ret;
    };

    /**
     * Return default inline edit prop
     * @return {Object} default inline edit prop
     */
    w.inlineEditPropName = function(){
        return "text";
    };

    var _props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.text,
            AC.Property.general.maxChars,
            AC.Property.general.placeholderText
        ]},
        { name: AC.Property.group_names.layout, props:[
            AC.Property.layout.pWidthHidden,
            AC.Property.layout.widthHidden,
            AC.Property.layout.heightHidden,
            AC.Property.layout.sizes,
            AC.Property.layout.minWidth,
            AC.Property.layout.maxWidth,
            AC.Property.layout.x,
            AC.Property.layout.y,
            AC.Property.layout.zindex,
            AC.Property.layout.tabindex,
            AC.Property.layout.tabStop,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer,
            AC.Property.layout.repeat
        ]},
        { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable,
            AC.Property.behavior.readonly
        ]},
        { name: AC.Property.group_names.data, props:[
            AC.Property.data.view,
            AC.Property.data.resetfilter,
            AC.Property.data.field,
            AC.Property.data.liketype,
            AC.Property.data.autoLoad
        ]},
        { name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.margin,
            AC.Property.style.mobileTheme,
            AC.Property.general.displayHourglassOver,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
    ];

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    w.props = function(){
        return _props;
    };

    /**
     * Return empty widget prop
     * @return {Object} default properties
     */
    w.emptyProps = function(){
        return {};
    };

    /**
     * Return default widget prop
     * @return {Object} default properties
     */
    w.defaultProps = function() {
        return {
            valName: "currText",
        text: "",
        x: "0",
        y: "0",
        width: "150",
        height: "30",
        zindex: "auto",
        readonly: false,
        enable: true,
        anchors: {
            left: true,
            top: true,
            bottom: false,
            right: false
        },
        visible: true,
        name: "search1",
        opacity: 1,
        customCssClasses: "",
        textAlign: "Left",
        label: "Label", displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false,
        alignInContainer: 'left',
        liketype: "Left",
        placeholderText: "",
        margin: '',
        mobileTheme: 'c'
        };
    };

    w.isField = function(){
        return true;
    };
})(jQuery,window,document);