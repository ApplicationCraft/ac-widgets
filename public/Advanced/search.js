/**
 * @lends       WiziCore_UI_SearchWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_SearchWidget = AC.Widgets.WiziCore_UI_SearchWidget =  AC.Widgets.WiziCore_UI_TextWidget.extend({
    _widgetClass: "WiziCore_UI_SearchWidget",
    _input: null,
    _imgBtn: null,
    _inputDiv: null,
    _textBtn: null,
    _dataPropName: "text",

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

    draw : function() {
        var table = $("<table><tr><td></td><td></td></tr></table>").css({width: "100%", height: this.height(), border:"0px"});
        var imgBtn = $('<input type="button" class="input clear-input-border"/>');
        var textBtn = $('<input type="button"/>');
        textBtn.hide();

        this._inputDiv = table;
        //div.append(imgBtn);
        //div.append(textBtn);

        table.find("td:last").css("width", "22px").append(imgBtn, textBtn);

        var theme = this.themeParams();
        var btnProps = {
            cursor : "pointer",
            width: "22px"
        };
        if (theme !== null) {
            var imgPath = theme.imgPath + "/searchwidget/";
            imgBtn.css({
                "background-repeat" : "no-repeat",
                "background-image" : "url( " + imgPath + "search.png )",
                "background-position" : "center center",
                "background-color" : "transparent"
            });
        }
        imgBtn.css(btnProps);
        textBtn.css(btnProps);

        this._imgBtn = imgBtn;
        this._textBtn = textBtn;
        var self = this;

        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            var onBtnClick = $.proxy(this.onBtnClick, this);
            this._imgBtn.click(onBtnClick);
            this._textBtn.click(onBtnClick);
        }
        this.base().prepend(this._inputDiv);
        this._super.apply(this, arguments);
        this._input.width("98%");//:todo need to fix, how remove 98% (border problem)
        table.find("td:first").prepend(this._input);

        //this._input.wrap(div);
    },

    initProps: function() {
        this._super();

        this.btnText = this.htmlLngPropertyBeforeSet('btnText', this._beforeBtnText, this._btnText);
        this.btnWidth = this.htmlProperty('btnWidth', this._btnWidth);
        this.btnType = this.htmlProperty('btnType', this._btnType);
        this.maxChars = this.htmlProperty('maxChars', this._maxChars);
        this.text = this.htmlProperty('label', this._text);

        this.btnColor = this.themeProperty('btnColor', this._btnColor);
        this.btnFont = this.themeProperty('btnFont', this._btnFont);
        this.btnBgColor = this.themeProperty('btnBgColor', this._btnBgColor);

        this.field = this.normalProperty('field');
        this.liketype = this.normalProperty('liketype');
    },

    initDomState : function () {
        this._super();
        //call from text widget        
        this._btnText(this._project['btnText']);
        this._btnWidth(this.btnWidth());
        this._btnType(this.btnType());

        this._btnColor(this.btnColor());
        this._btnFont(this.btnFont());
        this._btnBgColor(this.btnBgColor());
        this._updateEnable();
    },

    _updateLayout: function(){
        this._super();
        this._inputDiv.height(this.height());
        this._imgBtn.height(this.height());
        this._updateInput();
    },

    _updateInput: function(){

        var width = parseInt(this.width());

        var borderWidth = parseInt(this.border());
        borderWidth = (isNaN(borderWidth)) ? 0 : borderWidth * 2;
        var height = this.height() - borderWidth;
        var btnWidth = this.btnWidth();
        this._input.css({height: height, "line-height": ""});
        if ($.browser.msie){
            this._input.css("line-height", height + "px"); // line-height - fix for IE =(
        }

    },

    onChangeText : function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(AC.Widgets.WiziCore_UI_TextWidget.onChange);

        var oldValue = self._project['text'];
        var newValue = self._text();

        if (oldValue == newValue){
            return;
        }
        $(self).trigger(triggerEvent, [newValue, oldValue]);

        if (!triggerEvent.isPropagationStopped()) {
            self._project['text'] = newValue;
        }
        else {
            self._text(oldValue);
        }
    },

    onBtnClick: function(ev) {
        var triggerEvent = new $.Event(AC.Widgets.WiziCore_UI_SearchWidget.OnSearchButton);
        var newValue = this._text();
        $(this).trigger(triggerEvent, [newValue]);

        var likeType = this.liketype();
        var searchValue = "";
        searchValue += (likeType == "Right" || likeType == "Both") ? "%" : '';
        var val = this.value().replace(/[%_\\]/g,'\\$&');
        searchValue += this.value();
        searchValue += (likeType == "Left" || likeType == "Both") ? '%' : '';

        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            //only in runtime
            this.sendDrillDown(searchValue);
        }
        ev.stopPropagation();
    },

    sendDrillDown: function(value) {
        if (this._request !== null) {
            var field = this.field();
            var filter = ["(UPPER({" + field + "})) LIKE (UPPER('" + value + "'))"];
            this._request.drillDown(this.id(), filter, this.resetfilter());
        }
    },

    _enable: function(val) {
        this._super(val);
        this._enableElement(val, this._imgBtn);
        this._enableElement(val, this._textBtn);
    },

    _btnFont: function(val) {
        var obj = {"font" : val};
        if (val == "") {
            //fix for IE
            obj = {"font-style": "", "font-variant" : "", "font-weight" : "", "font-size": "", "line-height" : "", "font-family": ""};
        }
        this._textBtn.css(obj);
    },

    _btnColor: function(val) {
        this._textBtn.css("color", val);
    },

    _btnBgColor: function(val) {
        this._textBtn.css("background-color", val);
    },

    _onInitLanguage: function() {
        this._super();
        this.btnText(this.btnText());
    },

    _onSTUpdated: function() {
        this._onLanguageChanged();
    },

    _onLanguageChanged: function() {
        this._btnText(this._project['btnText']);
    },

    _beforeBtnText: function(text) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(text),
                token = isToken ? text : ('ac-' + this.id() + '-btnText');

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, text);

            return token;
        } else
            return text;
    },

    _btnText: function(val) {
        if (!this._textBtn)
            return;

        var trVal = WiziCore_Helper.isLngToken(val) ? this._getTranslatedValue(val) : val;
        this._textBtn.val(trVal);
    },

    _btnWidth: function(val) {
        this._imgBtn.css("width", val);
        this._textBtn.css("width", val);
        this._updateInput();
    },

    _btnType: function(val) {
        switch (val) {
            case 'image':
                this._imgBtn.show();
                this._textBtn.hide();
                break;

            case 'text':
                this._imgBtn.hide();
                this._textBtn.show();
                break;
        }
    },

    _border: function(val) {
        this._setElementBorder(val, this._input);
        this._updateInput();
    },

    _borderRadius: function(val) {
        this._setElementBorderRadius(val, this._input);
    },

    _bg: function(val) {
        this._setElementBg(val, this._input);
    }

});

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_SearchWidget.actions = function() {
    var ret = {
        keyup : {alias : "widget_event_onkeyup", funcview : "onKeyUp", action : "AC.Widgets.WiziCore_UI_TextWidget.onKeyUp", params : "keyev, value", group : "widget_event_key"},
        keydown : {alias : "widget_event_onkeydown", funcview : "onKeyDown", action : "AC.Widgets.WiziCore_UI_TextWidget.onKeyDown", params : "keyev, value", group : "widget_event_key"},

        change : {alias : "widget_event_onchange", funcview : "onChange", action : "AC.Widgets.WiziCore_UI_TextWidget.onChange", params : "newValue, oldValue", group : "widget_event_general"},
        onFocus : {alias : "widget_event_onfocus", funcview : "onFocus", action : "AC.Widgets.WiziCore_UI_TextWidget.onFocus", params : "", group : "widget_event_general"},
        onBlur : {alias : "widget_event_onblur", funcview : "onBlur", action : "AC.Widgets.WiziCore_UI_TextWidget.onBlur", params : "", group : "widget_event_general"},
        OnSearchButton: {alias : "widget_event_onsearchbutton", funcview : "OnSearchButton", action : "AC.Widgets.WiziCore_UI_SearchWidget.OnSearchButton", params : "value", group : "widget_event_general"}
    };

    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_SearchWidget.actions = function(){return ret};
    return ret;
};

WiziCore_UI_SearchWidget.OnSearchButton = "E#WiziCore_UI_SearchWidget#OnSearchButton";

WiziCore_UI_SearchWidget.isField = function() {
    return true
};
/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_SearchWidget.inlineEditPropName = function() {
    return "text";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.text,
        AC.Property.general.maxChars,
        AC.Property.general.btnType,
        AC.Property.general.btnWidth,
        AC.Property.general.btnText,
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
        AC.Property.behavior.readonly,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.data, props:[
        AC.Property.data.view,
        AC.Property.data.resetfilter,
        AC.Property.data.field,
        AC.Property.data.liketype,
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
        AC.Property.style.btnColor,
        AC.Property.style.btnFont,
        AC.Property.style.btnBgColor,
        AC.Property.general.displayHourglassOver,
        AC.Property.general.hourglassImage
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_SearchWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SearchWidget.emptyProps = function() {
    return {bgColor : "#f7f7f7",fontColor : "black", font:"normal 12px verdana", border:"1px solid gray", borderRadius:"0"};
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SearchWidget.defaultProps = function() {
    return {valName : "currText", text : "", x : "0", y: "0", width: "200", height: "22", zindex : "auto",
        readonly : false, enable : true, anchors : {left: true, top: true, bottom: false, right: false}, visible : true, name : "text1",
        widgetStyle: "default", opacity : 1, btnWidth: 20, liketype: "Left", tabStop: true,
        pWidth: "", hourglassImage: "Default", displayHourglassOver: "inherit", customCssClasses: "",
        margin: "", alignInContainer: 'left',
        dragAndDrop: false, resizing: false, placeholderText: "",
        textAlign: "Left", shadow: ""
    };
};

})(jQuery,window,document);