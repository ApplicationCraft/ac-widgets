/**
 * @lends       WiziCore_UI_TextAreaMobileWidget#
 */
(function($, windows, document, undefined){
    function _getDrawnValue(projectValue) {
        if (!this._input)
            return projectValue;
        return this._input.val();
    }

    var WiziCore_UI_TextAreaMobileWidget = AC.Widgets.WiziCore_UI_TextAreaMobileWidget = AC.Widgets.WiziCore_UI_BaseMobileWidget.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, AC.WidgetExt.Placeholder, {
    _widgetClass: "WiziCore_UI_TextAreaMobileWidget",
    _input: null,
    _dataPropName: "text",
    _valueDefaultPropName: 'text',
    _div: null,
    _charsWidgets: null,

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Konstantin Khukalenko
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._charsWidgets = {};
        this._super.apply(this, arguments);
    },

    draw: function() {
        this._cnt = $('<div>');
        this.base().append(this._cnt);
        this.initCountCharsWidgets();

        this._super.apply(this, arguments);
    },

    _redraw: function() {
        this._cnt.empty();
        this.initEditorLayer();
        var htmlId = this.htmlId();
        var cnt = $('<div style="padding-right: 15px; box-sizing: border-box;"></div>');
        var textarea = $('<textarea style="width: 100%; height:100%"/>');
        textarea.attr("id", htmlId + "_text");
        AC.Widgets.Base.prototype._tabindex.call(this, this.tabindex(), textarea);
        textarea.attr("name", htmlId + "_text");
        textarea.val(this.text());
        cnt.append(textarea);
        this._cnt.prepend(cnt);
        this._input = textarea;

        var self = this;

        $(textarea).bind("change.ta", {self: self}, self.onChangeText);
        this.bindEventCustom();
        // scroll dirty fix
        //this.base().css("overflow", "visible");
        this._input.textinput(this._getJQMOptions());
        this._updateSize();
        this._updateEnable();
        this._updateReadonly();
        this._updateWidthOfInput();
        this._font(this.font());
        this._maxChars(this.maxChars());
        this._placeholderText(this._project['placeholderText']);
    },

    _updateSize: function() {
        var inp = this._input;
        if (inp) {
            inp.css('height', this.height() - 15);
//            this.base().css('overflow', 'hidden');
        }
    },
    _updateWidthOfInput : function(){
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
    },

    onContainerChangeLayout: function(){
        this._updateWidthOfInput();
    },

    _updateLayout: function() {
        this._super.apply(this, arguments);
        this._updateSize();
    },

    _font: function(val) {
        this._super(val, this._input);
    },

    setFocus: function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._input.focus();
        }
    },

    initProps: function() {
        this._super();
        this.name = this.normalProperty('name');

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');

        this.charsField = this.normalPropBeforeSet('charsField', this.getUidWidgetFromObjectChooser, this.initCountCharsWidgets);
        this.leftCharsField = this.normalPropBeforeSet('leftCharsField', this.getUidWidgetFromObjectChooser, this.initCountCharsWidgets);
        this.wordField = this.normalPropBeforeSet('wordField', this.getUidWidgetFromObjectChooser, this.initCountCharsWidgets);

        this.font = this.themeProperty('font', this._font);

        this.text = AC.Property.htmlBeforeSetAfterGet('text', undefined, this._text, _getDrawnValue);
//        this.text = this.htmlProperty('text', this._text);
        this.value = this.text;


        this.enable = this.htmlProperty('enable', this._enable);
        this.visible = this.htmlProperty('visible', this._visible);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._readonly);

        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.textAlign = this.htmlProperty('textAlign', this._textAlign);
        this.maxChars = this.htmlProperty('maxChars', this._maxChars);

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalProperty('filter');
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();

        //this._font(this.font());

//        this._text(this.text());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._updateReadonly();

        this._tabindex(this.tabindex());
        this._textAlign(this.textAlign());
        this._maxChars(this.maxChars());
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    bindEventCustom: function() {
        var obj = this._input;

        obj.bind("keydown", {self: this}, this.onKeyDown);
        obj.bind("keyup", {self: this}, this.onKeyUp);
        obj.bind("keypress", {self: this}, this.onKeyPress);
        obj.bind("focus", {self: this}, this.onFocus);
        obj.bind("blur", {self: this}, this.onBlur);
        this._bindPlaceholderEvents(obj);
    },

    /**
     * Function call, then to elements unbind event
     * @param {String} event type of event
     * @param {Boolean} force force unbind
     * @private
     */
    unbindEventCustom: function() {
        var obj = this._input;
        obj.unbind("keydown", this.onKeyDown);
        obj.unbind("keyup", this.onKeyUp);
        obj.unbind("keypress", this.onKeyPress);
        obj.unbind("focus", this.onFocus);
        obj.unbind("blur", this.onBlur);
        this._unbindPlaceholderEvents(obj);
    },

    /**
     * On key press event
     */
    onFocus: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_TextAreaMobileWidget.onFocus);
        $(self).trigger(triggerEvent);
    },

    /**
     * On key down event
     */
    onBlur: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_TextAreaMobileWidget.onBlur);
        $(self).trigger(triggerEvent);
    },

    /**
     * On key press event
     */
    onKeyPress: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_TextAreaMobileWidget.onKeyPress);
        $(self).trigger(triggerEvent, [ev]);
    },

    initCountCharsWidgets: function(){
        var chWidgets = this._charsWidgets;
        var form = this.form();
        chWidgets['charsField'] = form.find( this.charsField() );
        chWidgets['leftCharsField'] = form.find( this.leftCharsField() );
        chWidgets['wordField'] = form.find( this.wordField() );
    },

    setCountOfChars: function() {
        //set count of chars
        //:todo set count of chars for new structure of widget

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
        var triggerEvent = new $.Event(WiziCore_UI_TextAreaMobileWidget.onKeyDown);
        var val = self._input.val();
        $(self).trigger(triggerEvent, [ev, val]);
    },

    /**
     * On key up event
     */
    onKeyUp: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_TextAreaMobileWidget.onKeyUp);
        var val = self._input.val();
        $(self).trigger(triggerEvent, [ev, val]);
        self.setCountOfChars();
    },

    onChangeText: function(ev) {
        var self = ev.data.self;

        var oldValue = self._project['text'];
        var newValue = self._input.val();

        var triggerEvent = new $.Event(WiziCore_UI_TextAreaMobileWidget.onChange);
        self._project['text'] = newValue;
        $(self).trigger(triggerEvent, [newValue, oldValue]);

        if (!triggerEvent.isPropagationStopped()) {
            self._project['text'] = newValue;
            self.sendDrillDown();
        } else {
            self._project['text'] = oldValue;
            self._text(oldValue);
        }
        self._placeholderText(self.placeholderText());
    },

    _tabindex: function(value) {
        if (this._input)
            this._super(value, this._input);
    },

    _tabStop: function(val) {
        if (this._input)
            this._super(val, this._input);
    },

    _text: function(text) {
        if (text === null) text = "";
        if (text !== undefined){
            this._input.val(text);
            this._checkTextWithPlaceholder(text);
        }
    },

    _enable: function(val) {
        if (this._input) {
            val = (val === true) ? "enable" : "disable";
            this._input.textinput(val);
        }
    },

    _readonly: function(flag) {
        this._super(flag, this._input);
    },

    _maxChars: function(val) {
        if (this._input){
            this._input.maxChars(val);
        }
    },

    charsField: function(val) {
        if (val != undefined) {
            var uid = this.getUidWidgetFromObjectChoiser(val);
            this._project['charsField'] = uid;
            var obj = {'charsField': uid};
            this.sendExecutor(obj);
        }
        return this._project['charsField'];
    },

    leftCharsField: function(val) {
        if (val != undefined) {
            var uid = this.getUidWidgetFromObjectChoiser(val);
            this._project['leftCharsField'] = uid;
            var obj = {'leftCharsField': uid};
            this.sendExecutor(obj);
        }
        return this._project['leftCharsField'];
    },

    wordField: function(val) {
        if (val != undefined) {
            var uid = this.getUidWidgetFromObjectChoiser(val);
            this._project['wordField'] = uid;
            var obj = {'wordField': uid};
            this.sendExecutor(obj);
        }
        return this._project['wordField'];
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
        return [
            {name: "value", value: "", uid: "valueuid"}
        ];
    },

    isBindableToData: function() {
        return true;
    }
}));

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_TextAreaMobileWidget.inlineEditPropName = function() {
    return "text";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
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
        AC.Property.style.font,
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
WiziCore_UI_TextAreaMobileWidget.props = function() {
    return _props;
};

WiziCore_UI_TextAreaMobileWidget.onClick = "E#TextAreaMobile#onClick";
WiziCore_UI_TextAreaMobileWidget.onDbClick = "E#TextAreaMobile#onDbClick";

WiziCore_UI_TextAreaMobileWidget.onMouseDown = "E#TextAreaMobile#onMouseDown";
WiziCore_UI_TextAreaMobileWidget.onMouseUp = "E#TextAreaMobile#onMouseUp";

WiziCore_UI_TextAreaMobileWidget.onMouseEnter = "E#TextAreaMobile#onMouseEnter";
WiziCore_UI_TextAreaMobileWidget.onMouseLeave = "E#TextAreaMobile#onMouseLeave";

WiziCore_UI_TextAreaMobileWidget.onKeyUp = "E#TextAreaMobile#onKeyUp";
WiziCore_UI_TextAreaMobileWidget.onKeyDown = "E#TextAreaMobile#onKeyDown";
WiziCore_UI_TextAreaMobileWidget.onKeyPress = "E#TextAreaMobile#onKeyPress";

WiziCore_UI_TextAreaMobileWidget.onChange = "E#TextAreaMobile#onChange";
WiziCore_UI_TextAreaMobileWidget.onFocus = "E#TextAreaMobile#onFocus";
WiziCore_UI_TextAreaMobileWidget.onBlur = "E#TextAreaMobile#onBlur";


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextAreaMobileWidget.emptyProps = function() {
    return {font: "normal 12px verdana"};
};
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_TextAreaMobileWidget.actions = function() {
    var ret = {
        //keypress: {alias: "widget_event_onkeypress", funcview: "onKeyPress", action: "WiziCore_UI_TextAreaMobileWidget.onKeyPress", params: "keyev", group: "widget_event_key"},
        keyup: {alias: "widget_event_onkeyup", funcview: "onKeyUp", action: "AC.Widgets.WiziCore_UI_TextAreaMobileWidget.onKeyUp", params: "keyev, value", group: "widget_event_key"},
        keydown: {alias: "widget_event_onkeydown", funcview: "onKeyDown", action: "AC.Widgets.WiziCore_UI_TextAreaMobileWidget.onKeyDown", params: "keyev, value", group: "widget_event_key"},

        change: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_TextAreaMobileWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        onFocus: {alias: "widget_event_onfocus", funcview: "onFocus", action: "AC.Widgets.WiziCore_UI_TextAreaMobileWidget.onFocus", params: "", group: "widget_event_general"},
        onBlur: {alias: "widget_event_onblur", funcview: "onBlur", action: "AC.Widgets.WiziCore_UI_TextAreaMobileWidget.onBlur", params: "", group: "widget_event_general"}
    };
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_TextAreaMobileWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextAreaMobileWidget.defaultProps = function() {
    return {
        valName: "currText",
        text: "",
        x: "0",
        y: "0",
        width: "225",
        height: "80",
        zindex: "auto",
        label: "Label",
        labelDisabled: false,
        readonly: false,
        enable: true,
        anchors: {left: true, top: true, bottom: false, right: false},
        visible: true,
        widgetStyle: "default",
        name: "textArea1",
        customCssClasses: "", displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false,
        pWidth: '',
        margin: '',
        alignInContainer: 'left',
        mobileTheme: 'c',
        placeholderText: ""

    };
};

WiziCore_UI_TextAreaMobileWidget.isField = function() {
    return true
};
})(jQuery,window,document);