/**
 * @lends       WiziCore_UI_TextMobileWidget#
 */
(function($, windows, document, undefined){
    var w = WiziCore_UI_TextMobileWidget = AC.Widgets.WiziCore_UI_TextMobileWidget = AC.Widgets.WiziCore_UI_TextMobileWidget = AC.Widgets.TextMobile = function() {
        this.init.apply(this, arguments);
    };

    AC.extend(w, AC.Widgets.WiziCore_UI_BaseMobileWidget);
    var p = w.prototype;
    AC.copyExtension(p, WiziCore_WidgetAbstract_DataIntegrationSimple);
    AC.copyExtension(p, AC.WidgetExt.Placeholder);

    p._widgetClass = "TextMobile";
    p._input = null;
    p._dataPropName = "text";
    p._valueDefaultPropName = "text";
    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Konstantin Khukalenko
     * @version     0.1
     *
     * @constructs
     */
    p.init = function() {
        w._sc.init.apply(this, arguments);
    };

    p.draw = function() {
        var cnt = $('<div>');
        this.base().append(cnt);
        this._cnt = cnt;
        w._sc.draw.apply(this, arguments);
    };

    p._redraw = function() {
        if (this._input) {
            this.unbindEventCustom.call(this);
        }
        this._cnt.empty();
        var div = $("<div data-role='fieldcontain'/>");
        this._div = div;
//        div.css({'padding-left': 5, 'padding-right': 5, "box-sizing": "border-box"});
        var htmlId = this.htmlId();

        var input = $("<input type='" + this._getTextType(this.mobileTextType()) + "'/>");
        input.attr("id", htmlId + "_text");
        input.attr("name", htmlId + "_text");
        w._sc._tabindex.call(this, this.tabindex(), input);
        if (!WiziCore_Helper.isAndroid()){
            input.css("width", "100%");
        }
        var text = this.text();
        input.val(text);
        var cnt = $('<div style="padding-right: 15px;"></div>');
        input.css("margin", "0 auto");
        cnt.append(input);
        div.append(cnt);

        this._cnt.prepend(div);


        var self = this;
        input.bind("change.custom", {self: self}, self.onChangeText);
        input.textinput(this._getJQMOptions());
        this._input = input;
        if (this._input) {
            this.bindEventCustom.call(this);
        }
        this._updateEnable();
        this._updateReadonly();
        this._updateWidthOfInput();
        this._placeholderText(this._project['placeholderText']);
        this._maxChars(this.maxChars());
        this._textAlign(this.textAlign());

//        this._super.apply(this, arguments);
    };

    p._updateWidthOfInput = function(){
        var inp = this._input;
        if (inp){
            if (this.getContainerLayoutType() == WiziCore_Widget_Layout.LAYOUT_TYPES.Absolute){
                inp.width(this.width());
                inp.parent().css("padding-right", "");
            } else {
                inp.width("100%");
                inp.parent().css("padding-right", "15px");
            }
        }
    };

    p.onContainerChangeLayout = function(){
        this._updateWidthOfInput();
    };

    p.onPageDrawn = function() {
        w._sc.onPageDrawn.apply(this, arguments);
        this._updateSize();
    };

    p._updateSize = function() {
//        if (this._input) {
//            //this._input.css('height', this.height() - 15);
//            //this.base().css('overflow', 'hidden');
//        }
    };

    p.destroy = function() {
        $(this._input).unbind('change.custom');
        w._sc.destroy.call(this);
    };

    p.initDomState = function() {
        w._sc.initDomState.call(this);
        this.initDomStatePos();
//        this._text(this.text());
        //this._mobileTextType(this.mobileTextType());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());
        this._updateReadonly();

    };

    p._getTextType = function (val){
        //return to standart ios behaviour
        /*if (WiziCore_Helper.isIOS() && val == "number"){
            //fix for IOS, because if input have type = number, ios have strange behavior with big numbers, they are not accept o_O
            val = "text";
        }*/
        return val;
    };

    p._mobileTextType = function(val) {
        if (this._input){
            this._input.prop('type', this._getTextType(val));
        }
        this._maxChars(this.maxChars());
    };

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    p.bindEventCustom = function() {

        var obj = this._input;
        obj.bind("keydown", {self: this}, this.onKeyDown);
        obj.bind("keyup", {self: this}, this.onKeyUp);
        obj.bind("keypress", {self: this}, this.onKeyPress);
        obj.bind("focus", {self: this}, this.onFocus);
        obj.bind("blur", {self: this}, this.onBlur);
        this._bindPlaceholderEvents(obj);
    };


    /**
     * Function call, then to elements unbind event
     * @param {String} event type of event
     * @param {Boolean} forse forse unbind
     * @private
     */
    p.unbindEventCustom = function() {
        var obj = this._input;
        obj.unbind("keydown", this.onKeyDown);
        obj.unbind("keyup", this.onKeyUp);
        obj.unbind("keypress", this.onKeyPress);
        obj.unbind("focus", this.onFocus);
        obj.unbind("blur", this.onBlur);
        this._unbindPlaceholderEvents(obj);
    };

    /**
     * On key press event
     */
    p.onFocus = function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(w.onFocus);
        $(self).trigger(triggerEvent);
    };

    /**
     * On key down event
     */
    p.onBlur = function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(w.onBlur);
        $(self).trigger(triggerEvent);
    };

    /**
     * On key press event
     */
    p.onKeyPress = function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(w.onKeyPress);
        $(self).trigger(triggerEvent, [ev]);
    };

    /**
     * On key down event
     */
    p.onKeyDown = function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(w.onKeyDown);
        var val = self._input.val();
        $(self).trigger(triggerEvent, [ev, val]);
    };

    /**
     * On key up event
     */
    p.onKeyUp = function(ev) {
        var self = ev.data.self,
            triggerEvent = new $.Event(w.onKeyUp),
            val = self._input.val();
//        self._project['text'] = val;
        $(self).trigger(triggerEvent, [ev, val]);
    };

    /**
     * On change text event
     * @param {Object} ev event
     */
    p.onChangeText = function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(w.onChange);

        var oldValue = self._project['text']; //.text gets drawn value
        var newValue = self._text();

        self._project['text'] = newValue;   // new value avaiable with onChange event
        $(self).trigger(triggerEvent, [newValue, oldValue]);

        if (!triggerEvent.isPropagationStopped()) {
            self._project['text'] = newValue;
            self.sendDrillDown();
        } else {
            self._project['text'] = oldValue;
            self._text(oldValue);
        }
        self._placeholderText(self.placeholderText());
//        return !triggerEvent.isPropagationStopped();
    };

//    _mobileTextType: function(val) {
//        if (this._isDrawn) {
//            //var parent = this.base().parent();
////            this.removeFieldcontain();
//            this.draw();
//            this.onPageDrawn();
//        }
//    },

    p._text = function(text) {
        if (text !== undefined) {
            this._input.val(text);
            this._checkTextWithPlaceholder(text);
        }
        var ret = this._input.val();
        ret = this._updateTextWithPlaceholder(ret);
        return ret;
    };

    p._readonly = function(flag) {
        w._sc._readonly.call(this, flag, this._input);
    };

    p._tabindex = function(value) {
        if (this._input)
            w._sc._tabindex.call(this, value, this._input);
    };

    p._tabStop = function(val) {
        if (this._input)
            w._sc._tabStop.call(this, val, this._input);
    };

    p.setFocus = function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._input.focus();
        }
    };

    p._enable = function(val) {
        if (this._input) {
            val = (val === true) ? "enable" : "disable";
            this._input.textinput(val);
        }
    };

    p._textAlign = function(val) {
        w._sc._textAlign.call(this, val, this._input);
    };

    p._maxChars = function(val) {
        if (this._input){
            var input = this._input;
            if (!WiziCore_Helper.isAndroid4()){
                //max length attribute breaks input work on android4
                input.removeAttr("maxlength");
                val = (val == "") ? undefined : val;
                if (val != undefined){
                    input.attr("maxlength", val);
                }
            }
            input.removeAttr("pattern");
            input.unbind(".maxlen");
            if (this.mobileTextType() == "number"){
                var self = this;
                input.attr("pattern", "[0-9\.]*");
                input.bind("keydown.maxlen", function(event){
                    if (event.which == 8){
                        self._symbCounter > 0 ? self._symbCounter-- : null;
                    }
                });
                var dot = 44;
                if (WiziCore_Helper.isAndroid4()){
                    //android 4 don't allow , in number
                    dot = 46;
                }
                input.bind("keypress.maxlen", function(event){
                    var text = $(this).val();
                    var len = text.length;
                    if (text == self._project['text']){
                        self._symbCounter = len;
                    }
                    var isAllow = false;
                    if (len < (0 + val) || val == undefined){
                        //prevent input more than maxChars on IOS
                        var allowKeys = [8,9,13,27,dot,48,49,50,51,52,53,54,55,56,57];
                        //48-57 numeric others are keys Esc, arrows etc.

                        for (var key in allowKeys){
                            if (event.which == allowKeys[key]){
                                isAllow = true;
                            }
                        }
                        if (isAllow){
                            if (len == 0){
                                self._symbCounter = 0;
                                self._dotUsed = false;
                                if (event.which == dot){
                                    isAllow = false;
                                }
                            }
                            if (len == 1 && text[text.length - 1] == "0"){
                                //self._symbCounter = 1;
                                //console.log("symbcounter=1");
                                if (event.which != dot && !self._dotUsed){
                                    isAllow = false;
                                } else{
                                    self._dotUsed = true;
                                }
                            }
                            if (isAllow){
                                if (event.which == 8){
                                    self._symbCounter > 0 ? self._symbCounter-- : null;
                                } else if (event.which != 9 && event.which != 13 && event.which != 27){
                                    self._symbCounter < (1 + val) ? self._symbCounter++ : null;
                                }
                                if (self._symbCounter == (1 + val)){
                                    self._symbCounter--;
                                    isAllow = false;
                                }
                            }
                        }
                    }
                    if (!isAllow){
                        event.preventDefault();
                    }
                });
            }
        }
    };

    p.appendValueToDataObject = function(dataObject, invalidMandatoryWidgets, force) {
        var self = this;
        return this._simpleDataObjectValue(dataObject, force, function(value) {
            if (self.mandatory()) {
                var isEmpty = (value == '');
                if (isEmpty) {
                    invalidMandatoryWidgets[self.id()] = true;
                }
                value = ((isEmpty) ? null : value);
            }
            return value;
        });
    };

    p.getDataModel = function() {
        return [
            { name: "value", value: "", uid: "valueuid" }
        ];
    };

    p.isBindableToData = function() {
        return true;
    };

    /** properties
     *
     */

    function _getDrawnValue(projectValue) {
        if (!this._input)
            return projectValue;
        return this._input.val();
    }

    p.name = AC.Property.normal('name');

    p.isIncludedInSchema = AC.Property.normal('isIncludedInSchema', p._updateStorageFlag);
    p.dataType = AC.Property.normal('dataType');
    p.isUnique = AC.Property.normal('isUnique');
    p.mandatory = AC.Property.normal('mandatory');

    p.mobileTextType = AC.Property.html('mobileTextType', p._mobileTextType);
    p.text = AC.Property.htmlBeforeSetAfterGet('text', undefined, p._text, _getDrawnValue);
    p.value = p.text;
    p.enable = AC.Property.html('enable', p._enable);
    p.visible = AC.Property.html('visible', p._visible);
    p.opacity = AC.Property.theme('opacity', p._opacity);
    p.tabindex = AC.Property.html('tabindex', p._tabindex);
    p.readonly = AC.Property.html('readonly', p._readonly);

    p.textAlign = AC.Property.html('textAlign', p._textAlign);
    p.maxChars = AC.Property.html('maxChars', p._maxChars);

    p.view = AC.Property.normal('view');
    p.fields = AC.Property.normal('fields');
    p.groupby = AC.Property.normal('groupby');
    p.orderby = AC.Property.normal('orderby');
    p.filter = AC.Property.normal('filter');
    p.resetfilter = AC.Property.normal('resetfilter');
    p.listenview = AC.Property.normal('listenview');
    p.applyview = AC.Property.normal('applyview');
    p.onview = AC.Property.normal('onview');

    w.onKeyUp = "E#TextMobile#onKeyUp";
    w.onKeyDown = "E#TextMobile#onKeyDown";
    w.onKeyPress = "E#TextMobile#onKeyPress";

    w.onChange = "E#TextMobile#onChange";
    w.onFocus = "E#TextMobile#onFocus";
    w.onBlur = "E#TextMobile#onBlur";

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    w.actions = function() {
        var ret = {
            //keypress: {alias: "widget_event_onkeypress", funcview: "onKeyPress", action: "WiziCore_UI_TextMobileWidget.onKeyPress", params: "keyev", group: "widget_event_key"},
            keyup: {alias: "widget_event_onkeyup", funcview: "onKeyUp", action: "AC.Widgets.WiziCore_UI_TextMobileWidget.onKeyUp", params: "keyev, value", group: "widget_event_key"},
            keydown: {alias: "widget_event_onkeydown", funcview: "onKeyDown", action: "AC.Widgets.WiziCore_UI_TextMobileWidget.onKeyDown", params: "keyev, value", group: "widget_event_key"},

            change: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_TextMobileWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
            onFocus: {alias: "widget_event_onfocus", funcview: "onFocus", action: "AC.Widgets.WiziCore_UI_TextMobileWidget.onFocus", params: "", group: "widget_event_general"},
            onBlur: {alias: "widget_event_onblur", funcview: "onBlur", action: "AC.Widgets.WiziCore_UI_TextMobileWidget.onBlur", params: "", group: "widget_event_general"}
        };
        ret = $.extend(AC.Widgets.Base.actions(), ret);
        return ret;
    };

    /**
     * Return default inline edit prop
     * @return {Object} default inline edit prop
     */
    w.inlineEditPropName = function() {
        return "text";
    };

    var _props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.mobileTextType,
            AC.Property.general.text,
            AC.Property.general.maxChars,
            AC.Property.general.placeholderText
        ]},
        { name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.dataType,
            AC.Property.database.isUnique,
            AC.Property.database.mandatory
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
            AC.Property.layout.alignInContainer
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
        { name: AC.Property.group_names.appearance, props:[
            AC.Property.appearance.textAlign
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
    w.props = function() {
        return _props;
    };

    /**
     * Return empty widget prop
     * @return {Object} default properties
     */
    w.emptyProps = function() {
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
            width: "210",
            height: "35",
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
            name: "text1",
            opacity: 1,
            customCssClasses: "",
            textAlign: "Left",
            label: "Label",
            mobileTextType: "text",
            placeholderText: "", displayHourglassOver: "inherit",
            dragAndDrop: false, resizing: false,
            alignInContainer: 'left',
            mobileTheme: 'c',
            margin: ''
        };
    };

    w.isField = function() {
        return true
    };
})(jQuery,window,document);