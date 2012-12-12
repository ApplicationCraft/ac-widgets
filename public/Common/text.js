/**
 * @lends       WiziCore_UI_TextWidget#
 */
(function($, window, document, undefined){

    function _getDrawnValue(projectValue) {
        if (!this._input)
            return projectValue;
        return this._input.val();
    }

    var WiziCore_UI_TextWidget = AC.Widgets.WiziCore_UI_TextWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, AC.WidgetExt.Placeholder,{
    _widgetClass: "WiziCore_UI_TextWidget",
    _input: null,
    _dataPropName: "text",
    _valueDefaultPropName: "text",
    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    /**
     *
     */
    draw: function() {

        if (this._input == null) {
            // check for existing input
            var input = this._input = $('<input type="text" class="input clear-input-border" style="position: relative; width: 100%; height: 100%; outline: none; "/>');
            if ($.browser.msie){
                //fix for hide blinked cursor in right side (#3553)
                input.css("padding-right", "1px");
            }
            this.base().prepend(input);

        }
        var self = this,
            inp = this._input;
        $(inp).unbind("change.custom").bind("change.custom", {self: self}, self.onChangeText);
        this._bindPlaceholderEvents(inp);
        this._super.apply(this, arguments);
    },

    _updateLayout: function(){
        this._super();
        this._input.height(this.height());

        if ($.browser.msie){
            this._input.css("line-height", this.height() + "px"); // line-height - fix for IE =(
        }
    },

    onContainerChangeLayout: function(){
        if (this.getContainerLayoutType() == WiziCore_Widget_Layout.LAYOUT_TYPES.Absolute){
            this._input.width(this.width());
        } else {
            if ($.browser.msie){
                this._input.width("98%");
            } else {
                this._input.width("100%");
            }
        }
    },

    onRemove: function() {
        if (this._checkRepeatBeforeRemove()){
            return;
        }
        if (this._input){
            this._input.remove();
        }
    },

    onDestroy: function() {
        var input = $(this._input);
        input.unbind('change.custom');
        this._unbindPlaceholderEvents(input);
        this._input = null;
    },

    initProps: function() {
        this._super();

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');

        this.font = this.themeProperty('font', this._font);
        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.shadow = this.themeProperty('shadow', this._shadow);

        this.text = AC.Property.htmlBeforeSetAfterGet('text', undefined, this._text, _getDrawnValue);
        this.value = this.text;
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.readonly = this.htmlProperty('readonly', this._updateReadonly);

        this.typefield = this.htmlProperty('typefield', this._typefield);
        this.textAlign = this.htmlProperty('textAlign', this._textAlign);
        this.maxChars = this.htmlProperty('maxChars', this._maxChars);

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();
        this._bg(this.bg());
        this._font(this.font());
        this._fontColor(this.fontColor());
        this._borderRadius(this.borderRadius());
        this._border(this.border());
        this._text(this.text());
        this._shadow(this.shadow());

        this._updateEnable();
        this._updateReadonly();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());

        this._typefield(this.typefield());
        this._textAlign(this.textAlign());
        this._maxChars(this.maxChars());
        this._placeholderText(this._project['placeholderText']);
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    bindEvent: function(event) {
        this._super(event);

        if (this._bindingEvents[event] > 1 || this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            return;
        }

        var self = this;

        switch (event) {
            case WiziCore_UI_TextWidget.onKeyDown:
                $(self._input).bind("keydown", {self: self}, self.onKeyDown);
            break;

            case WiziCore_UI_TextWidget.onKeyUp:
                $(self._input).bind("keyup", {self: self}, self.onKeyUp);
            break;

            case WiziCore_UI_TextWidget.onKeyPress:
                $(self._input).bind("keypress", {self: self}, self.onKeyPress);
            break;

            case WiziCore_UI_TextWidget.onFocus:
                $(self._input).bind("focus", {self: self}, self.onFocus);
            break;

            case WiziCore_UI_TextWidget.onBlur:
                $(self._input).bind("blur", {self: self}, self.onBlur);
            break;

            default:
                break;
        }

    },

    /**
     * Function call, then to elements unbind event
     * @param {String} event type of event
     * @param {Boolean} forse forse unbind
     * @private
     */
    unbindEvent: function(event, forse) {
        this._super(event, forse);

        if (this._bindingEvents[event] > 0 && forse != true) {
            return;
        }

        var self = this;

        switch (event) {
            case WiziCore_UI_TextWidget.onKeyDown:
                $(self._input).unbind("keydown", self.onKeyDown);
            break;

            case WiziCore_UI_TextWidget.onKeyUp:
                $(self._input).unbind("keyup", self.onKeyUp);
            break;

            case WiziCore_UI_TextWidget.onKeyPress:
                $(self._input).unbind("keypress", self.onKeyPress);
            break;

            case WiziCore_UI_TextWidget.onFocus:
                $(self._input).unbind("focus", self.onFocus);
            break;

            case WiziCore_UI_TextWidget.onBlur:
                $(self._input).unbind("blur", self.onBlur);
            break;

            default:
                break;
        }
    },

    setFocus: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.focus();
        }
    },

    selectContents: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.select();
        }
    },

    /**
     * On key press event
     */
    onFocus: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_TextWidget.onFocus);
        $(self).trigger(triggerEvent);
    },

    /**
     * On key down event
     */
    onBlur: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_TextWidget.onBlur);
        $(self).trigger(triggerEvent);
    },

    /**
     * On key press event
     */
    onKeyPress: function(ev) {
        var self = ev.data.self;
        var typedVal = self._text();
        var triggerEvent = new $.Event(WiziCore_UI_TextWidget.onKeyPress);
        $(self).trigger(triggerEvent, [ev, typedVal]);
    },

    /**
     * On key down event
     */
    onKeyDown: function(ev) {
        var self = ev.data.self;
        var typedVal = self._text();
        var triggerEvent = new $.Event(WiziCore_UI_TextWidget.onKeyDown);
        $(self).trigger(triggerEvent, [ev, typedVal]);
    },

    /**
     * On key up event
     */
    onKeyUp: function(ev) {
        var self = ev.data.self;
        var typedVal = self._text();
        var triggerEvent = new $.Event(WiziCore_UI_TextWidget.onKeyUp);
        $(self).trigger(triggerEvent, [ev, typedVal]);
    },

    /**
     * On change text event
     * @param {Object} ev event
     */
    onChangeText: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_TextWidget.onChange);

        var oldValue = self._project['text'];
        var newValue = self._text();

        $(self).trigger(triggerEvent, [newValue, oldValue]);

        if (!triggerEvent.isPropagationStopped()) {
            self._project['text'] = newValue;
            self.sendDrillDown();
        } else {
            self._text(oldValue);
        }
        self._placeholderText(self.placeholderText());
        //return !triggerEvent.isPropagationStopped();
    },

    _fontColor: function(val) {
        this._super(val, this._input);
    },

    _font: function(val) {
        this._super(val, this._input);
    },

    _text: function(text) {
        if (text === null) text = "";
        if (text !== undefined) {
            this._input.val(text);
            this._checkTextWithPlaceholder(text);
        }
        var ret = this._input.val();
        ret = this._updateTextWithPlaceholder(ret);
        return ret;
    },

    _readonly: function(flag) {
        this._super(flag, this._input);
    },

    _tabindex: function(value) {
        this._super(value, this._input);
    },

    _tabStop: function(value) {
        this._super(value, this._input);
    },

    _enable: function(val){
        this._super(val, this._input);
        (val === false) ? this._input.addClass('ui-state-disabled') : this._input.removeClass('ui-state-disabled');
    },

    /**
     * Set typefield by name
     * @param {Object} val val
     */
    _typefield: function(val) {

        val = (typeof val == "object" && val.value != undefined) ? val.value : val;
        switch (val) {
            case "alphanumeric":
                this._input.alphanumeric();
                break;
            case "alpha":
                this._input.alpha();
                break;
            case "numeric":
                this._input.numericParse();
                break;
        }

    },

    _textAlign: function(val) {
        this._super(val, this._input);
    },

    _borderRadius: function(val, div) {
        this._super.apply(this, arguments);
        this._setElementBorderRadius(val, this._input);
    },

    _maxChars: function(val) {
        this._input.attr("maxlength", val);
    },

    _bg: function(bg) {
        this._super(bg);
        this._setElementBg(bg, this._input);
    },

    getNewWidgetSize: function() {
        var el = this.base();
        var isFirefox = WiziCore_Helper.isFirefox();
        var w = el.width();
        var h = el.height();
        return {width: w, height: h};
    },


    appendValueToDataObject: function(dataObject, invalidMandatoryWidgets, force) {
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
    },

    getDataModel: function() {
        return this._valueDataModel();
    },

    isBindableToData: function() {
        return true;
    }
}));

WiziCore_UI_TextWidget.onKeyUp  = "E#Text#onKeyUp";
WiziCore_UI_TextWidget.onKeyDown  = "E#Text#onKeyDown";
WiziCore_UI_TextWidget.onKeyPress = "E#Text#onKeyPress";

WiziCore_UI_TextWidget.onChange = "E#Text#onChange";
WiziCore_UI_TextWidget.onFocus = "E#Text#onFocus";
WiziCore_UI_TextWidget.onBlur = "E#Text#onBlur";

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_TextWidget.actions = function() {
    var ret = {
        //keypress: {alias: "widget_event_onkeypress", funcview: "onKeyPress", action: "WiziCore_UI_TextWidget.onKeyPress", params: "keyev, val", group: "widget_event_key"},
        keyup: {alias: "widget_event_onkeyup", funcview: "onKeyUp", action: "AC.Widgets.WiziCore_UI_TextWidget.onKeyUp", params: "keyev, value", group: "widget_event_key"},
        keydown: {alias: "widget_event_onkeydown", funcview: "onKeyDown", action: "AC.Widgets.WiziCore_UI_TextWidget.onKeyDown", params: "keyev, value", group: "widget_event_key"},

        change: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_TextWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        onFocus: {alias: "widget_event_onfocus", funcview: "onFocus", action: "AC.Widgets.WiziCore_UI_TextWidget.onFocus", params: "", group: "widget_event_general"},
        onBlur: {alias: "widget_event_onblur", funcview: "onBlur", action: "AC.Widgets.WiziCore_UI_TextWidget.onBlur", params: "", group: "widget_event_general"},
        
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_TextWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_TextWidget.inlineEditPropName = function() {
    return "text";
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.text,
            AC.Property.general.maxChars,
            AC.Property.general.placeholderText
        ]},
    { name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.dataTypeText,
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
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle,
            AC.Property.style.shadow,
            AC.Property.style.font,
            AC.Property.style.fontColor,
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.borderRadius,
            AC.Property.style.bgColor,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage
        ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_TextWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextWidget.emptyProps = function() {
    return {
        bgColor: "#f7f7f7",
        fontColor: "#000000",
        font: "normal 12px verdana",
        border: "1px solid gray",
        borderRadius: "0"
    };
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextWidget.defaultProps = function() {
    return {
        valName: "currText",
        text: "",
        x: "0",
        y: "0",
        pWidth: "",
        margin: "", alignInContainer: 'left',
        width: "200",
        height: "22",
        zindex: "auto",
        readonly: false,
        enable: true,
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        anchors: {
            left: true,
            top: true,
            bottom: false,
            right: false
        },
        visible: true,
        name: "text1",
        widgetStyle: "default",
        opacity: 1,
        textAlign: "Left",
        dragAndDrop: false, resizing: false,
        shadow: "",
        placeholderText: "",
        tabStop: true
    };
};

WiziCore_UI_TextWidget.isField = function() {return true};
})(jQuery,window,document);