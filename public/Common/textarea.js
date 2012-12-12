/**
 * @lends       WiziCore_UI_TextAreaWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_TextAreaWidget = AC.Widgets.WiziCore_UI_TextAreaWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, AC.WidgetExt.Placeholder,{
    _widgetClass: "WiziCore_UI_TextAreaWidget",
    _input: null,
    _dataPropName: "text",
    _valueDefaultPropName: 'text',
    _charsWidgets: null ,

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._charsWidgets = {};
        this._super.apply(this, arguments);
    },

    draw: function() {
        var input = $('<textarea class="textarea clear-input-border" style="width:100%; height:100%; outline: none; border: 0px"/>');

        this.base().prepend(input);
        this._input = input;

        this.initCountCharsWidgets();

        var self = this;

        $(input).bind("change.ta", {self: self}, self.onChangeText);

        if (this._bindingEvents[WiziCore_UI_TextAreaWidget.onKeyUp] == 0 || this._bindingEvents[WiziCore_UI_TextAreaWidget.onKeyUp] == undefined) {
            this.bindEvent(WiziCore_UI_TextAreaWidget.onKeyUp);
        }
        this._bindPlaceholderEvents($(input));
        this._super.apply(this, arguments);
    },

    initProps: function() {
        this._super();

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');

        this.charsField = this.normalPropBeforeSet('charsField', this.getUidWidgetFromObjectChooser, this.initCountCharsWidgets);
        this.leftCharsField = this.normalPropBeforeSet('leftCharsField', this.getUidWidgetFromObjectChooser, this.initCountCharsWidgets);
        this.wordField = this.normalPropBeforeSet('wordField', this.getUidWidgetFromObjectChooser, this.initCountCharsWidgets);

        this.font = this.themeProperty('font', this._font);
        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.shadow = this.themeProperty('shadow', this._shadow);

        this.text = this.htmlProperty('text', this._text);
        this.value = this.text;

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._readonly);

        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
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
        this._shadow(this.shadow());

        this._text(this.text());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._updateReadonly();

        this._tabindex(this.tabindex());
        this._maxChars(this.maxChars());
        this._placeholderText(this._project['placeholderText']);
    },

    _updateLayout: function(){
        this._super();
        this._input.height(this.height());
    },

    onContainerChangeLayout: function(){
        if (this.getContainerLayoutType() == WiziCore_Widget_Layout.LAYOUT_TYPES.Absolute){
            this._input.width(this.width());
        } else {
            this._input.width("100%");
        }
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

            case WiziCore_UI_TextAreaWidget.onKeyDown:
                $(self._input).bind("keydown", {self: self}, self.onKeyDown);
            break;

            case WiziCore_UI_TextAreaWidget.onKeyUp:
                $(self._input).bind("keyup", {self: self}, self.onKeyUp);
            break;

            case WiziCore_UI_TextAreaWidget.onKeyPress:
                $(self._input).bind("keypress", {self: self}, self.onKeyPress);
            break;

            case WiziCore_UI_TextAreaWidget.onFocus:
                $(self._input).bind("focus", {self: self}, self.onFocus);
            break;

            case WiziCore_UI_TextAreaWidget.onBlur:
                $(self._input).bind("blur", {self: self}, self.onBlur);
            break;

            default:
                break;
        }

    },

    /**
     * Function call, then to elements unbind event
     * @param {String} event type of event
     * @param {Boolean} force force unbind
     * @private
     */
    unbindEvent: function(event, force) {
        this._super(event, force);

        if (this._bindingEvents[event] > 0 && force != true) {
            return;
        }

        var self = this;

        switch (event) {
            case WiziCore_UI_TextAreaWidget.onKeyDown:
                $(self._input).unbind("keydown", self.onKeyDown);
            break;

            case WiziCore_UI_TextAreaWidget.onKeyUp:
                $(self._input).unbind("keyup", self.onKeyUp);
            break;

            case WiziCore_UI_TextAreaWidget.onKeyPress:
                $(self._input).unbind("keypress", self.onKeyPress);
            break;

            case WiziCore_UI_TextAreaWidget.onFocus:
                $(self._input).unbind("focus", self.onFocus);
            break;

            case WiziCore_UI_TextAreaWidget.onBlur:
                $(self._input).unbind("blur", self.onBlur);
            break;

            default:
                break;
        }
    },

    selectContents: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.select();
        }
    },

    setFocus: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.focus();
        }
    },

    /**
     * On key press event
     */
    onFocus: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new jQuery.Event(WiziCore_UI_TextAreaWidget.onFocus);
        $(self).trigger(triggerEvent);
    },

    /**
     * On key down event
     */
    onBlur: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new jQuery.Event(WiziCore_UI_TextAreaWidget.onBlur);
        $(self).trigger(triggerEvent);
    },

    /**
     * On key press event
     */
    onKeyPress: function(ev) {
        var self = ev.data.self;
        var val = self._input.val();
        var triggerEvent = new jQuery.Event(WiziCore_UI_TextAreaWidget.onKeyPress);
        $(self).trigger(triggerEvent, [ev], val);
    },

    initCountCharsWidgets: function(){
        var chWidgets = this._charsWidgets;
        var form = this.form();
        chWidgets['charsField'] = form.find( this.charsField() );
        chWidgets['leftCharsField'] = form.find( this.leftCharsField() );
        chWidgets['wordField'] = form.find( this.wordField() );
    },

    setCountOfChars: function() {
        if (this._input == null)
            return;
        
        var chWidgets = this._charsWidgets;

        var charsField = chWidgets['charsField'];

        var charsCount = this._input.val().length;
        if (charsField != null) {
            charsField.setData(charsCount + "");
        }

        //set left count of chars
        var leftCharsField = chWidgets['leftCharsField'];
        var maxChars = this.maxChars();
        if (leftCharsField != null && maxChars != null) {
            var leftCharsCount = maxChars - charsCount;
            leftCharsField.setData(leftCharsCount + "");
        }

        //set count of words
        var wordField = chWidgets['wordField'];
        if (wordField != null) {
            var text = this._input.val();
//            var re = new RegExp('[^\\s\\.,~`!@#$%^&*()_+|\\\'\";:\\?/]+');
            var re = new RegExp("[^\\s\\.,~`!@#$%^&*()+\\-=|\\\\'\\\";:\\?/<>\\[\\]\\{\\}]+", 'g');
            var wordCount = (text.match(re) != null) ? text.match(re).length : 0;
            wordField.setData(wordCount + "");
        }
    },

    /**
     * On key down event
     */
    onKeyDown: function(ev) {
        var self = ev.data.self;
        var val = self._input.val();
        var triggerEvent = new jQuery.Event(WiziCore_UI_TextAreaWidget.onKeyDown);
        $(self).trigger(triggerEvent, [ev, val]);
    },

    /**
     * On key up event
     */
    onKeyUp: function(ev) {
        var self = ev.data.self;
        var val = self._input.val();
        var triggerEvent = new jQuery.Event(WiziCore_UI_TextAreaWidget.onKeyUp);
        $(self).trigger(triggerEvent, [ev, val]);
        self.setCountOfChars();
    },

    onChangeText: function(ev) {
        var self = ev.data.self;

        var oldValue = self._project['text'];
        var newValue = self._input.val();

        var triggerEvent = new jQuery.Event(WiziCore_UI_TextAreaWidget.onChange);

        $(self).trigger(triggerEvent, [newValue, oldValue]);

        if (!triggerEvent.isPropagationStopped()) {
            self._project['text'] = newValue;
            self.sendDrillDown();
        }
        else {
            self._text(oldValue);
        }
        self._placeholderText(self._project['placeholderText']);
    },

    _enable: function(val){
        this._super(val, this._input);
        (val === false) ? this._input.addClass('ui-state-disabled') : this._input.removeClass('ui-state-disabled');  
    },

    _font: function(val) {
        this._super(val, this._input);
    },

    _fontColor: function(val) {
        this._super(val, this._input);
    },
    
    _tabindex: function(value) {
        this._super(value, this._input);
    },

    _text: function(text) {
        if (text === null) text = "";
        if (text !== undefined){
            this._input.val(text);
            this._checkTextWithPlaceholder(text);
        }
    },

    _readonly: function(flag) {
        this._super(flag, this._input);
    },

    _maxChars: function(val) {
        this._input.maxChars(val);
    },

    _bg: function(bg) {
        this._super(bg);
        this._super(bg, this._input);
    },

    _borderRadius: function(val) {
        this._super(val);
        this._super(val, this._input);
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

    getNewWidgetSize: function() {
        var el = this.base();
        var isFirefox = WiziCore_Helper.isFirefox();
        var w = el.width();
        var h = isFirefox ? el.height() : el.height() - 3;
        return {width: w, height: h};
    },

    getDataModel: function() {
        return this._valueDataModel();
    },

    isBindableToData: function() {
        return true;
    }
}));

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_TextAreaWidget.inlineEditPropName = function() {
    return "text";
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.text,
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
            AC.Property.layout.alignInContainer,
            AC.Property.layout.repeat
        ]},
    { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable,
            AC.Property.behavior.readonly,
            AC.Property.behavior.maxChars,
            AC.Property.behavior.charsField,
            AC.Property.behavior.leftCharsField,
            AC.Property.behavior.wordField
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
            AC.Property.style.shadow,
            AC.Property.style.font,
            AC.Property.style.fontColor,
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.borderRadius,
            AC.Property.style.bgColor,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_TextAreaWidget.props = function() {
    return _props;
};

WiziCore_UI_TextAreaWidget.onClick = "ETextArea#onClick";
WiziCore_UI_TextAreaWidget.onDbClick = "ETextArea#onDbClick";

WiziCore_UI_TextAreaWidget.onMouseDown = "ETextArea#onMouseDown";
WiziCore_UI_TextAreaWidget.onMouseUp = "ETextArea#onMouseUp";

WiziCore_UI_TextAreaWidget.onMouseEnter = "ETextArea#onMouseEnter";
WiziCore_UI_TextAreaWidget.onMouseLeave = "ETextArea#onMouseLeave";

WiziCore_UI_TextAreaWidget.onKeyUp  = "ETextArea#onKeyUp";
WiziCore_UI_TextAreaWidget.onKeyDown  = "ETextArea#onKeyDown";
WiziCore_UI_TextAreaWidget.onKeyPress = "ETextArea#onKeyPress";

WiziCore_UI_TextAreaWidget.onChange = "ETextArea#onChange";
WiziCore_UI_TextAreaWidget.onFocus = "ETextArea#onFocus";
WiziCore_UI_TextAreaWidget.onBlur = "ETextArea#onBlur";


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextAreaWidget.emptyProps = function() {
    var ret = {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray"};
    return ret;
};
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_TextAreaWidget.actions = function() {
    var ret = {
                //keypress: {alias: "widget_event_onkeypress", funcview: "onKeyPress", action: "WiziCore_UI_TextAreaWidget.onKeyPress", params: "keyev, val", group: "widget_event_key"},
                keyup: {alias: "widget_event_onkeyup", funcview: "onKeyUp", action: "AC.Widgets.WiziCore_UI_TextAreaWidget.onKeyUp", params: "keyev, value", group: "widget_event_key"},
                keydown: {alias: "widget_event_onkeydown", funcview: "onKeyDown", action: "AC.Widgets.WiziCore_UI_TextAreaWidget.onKeyDown", params: "keyev, value", group: "widget_event_key"},

                change: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_TextAreaWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
                onFocus: {alias: "widget_event_onfocus", funcview: "onFocus", action: "AC.Widgets.WiziCore_UI_TextAreaWidget.onFocus", params: "", group: "widget_event_general"},
                onBlur: {alias: "widget_event_onblur", funcview: "onBlur", action: "AC.Widgets.WiziCore_UI_TextAreaWidget.onBlur", params: "", group: "widget_event_general"},

                dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
                dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
            };
    ret = jQuery.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_TextAreaWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextAreaWidget.defaultProps = function() {
    var ret = {
        valName: "currText",
        text: "",
        x: "0",
        y: "0",
        width: "200",
        height: "70",
        pWidth: "",
        margin: "", alignInContainer: 'left',
        zindex: "auto",
        readonly: false,
        enable: true,
        anchors: {left: true, top: true, bottom: false, right: false},
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        visible: true,
        opacity: 1,
        widgetStyle: "default",
        name: "textArea1",
        dragAndDrop: false, resizing: false,
        tabStop: true,
        placeholderText: "",
        shadow: ""
    };
    return ret;
};

WiziCore_UI_TextAreaWidget.isField = function() {return true};
})(jQuery,window,document);