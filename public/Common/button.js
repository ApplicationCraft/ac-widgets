/**
 * @lends       ButtonWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_ButtonWidget = AC.Widgets.WiziCore_UI_ButtonWidget = AC.Widgets.Base.extend({
    _widgetClass: "WiziCore_UI_ButtonWidget",
    _input: null,
    _dataPropName: "label",

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

    draw: function() {
        var base = this.base();
        this._link = $("<a></a>").css({'text-decoration': "none", "display": "block", "width": "100%", "height": "100%"});
        this._input = $('<a href="javascript:void(0)" type="button" class="input clear-input-border" onclick="return false;" style="text-decoration: none; width: 100%; height:' + this.height() + '; border: 0px; " ></a>');
        this._input.attr('data-ajax', false); // drop catching from jquery.mobile.navigation
        if (!$.browser.msie) {
            var table = $('<table style="width:100%; height:100%"></table>');
            var tr = $("<tr></tr>");
            var td = $("<td style='vertical-align:middle; text-align:center;'></td>");
            td.append(this._input);
            tr.append(td);
            table.append(tr);
            this._link.append(table);
            base.prepend(this._link);
        }
        else {
            base.css({'vertical-align':'middle', 'text-align':'center'});
            base.prepend(this._input);
        }
        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            base.css('cursor', 'pointer');
        }
        base.css({"overflow" : "hidden", "text-overflow" : "ellipsis"}); //hide text if more than width of widget
//        var div = $("<div style='display: table-cell; width: 100%; height: 100%'></div>");
//        div.append(this._input);

        if (this._bindingEvents[AC.Widgets.Base.onClick] == 0 || this._bindingEvents[AC.Widgets.Base.onClick] == undefined) {
            this.eventsHandles()[AC.Widgets.Base.onClick] = AC.Widgets.Base.onClick;
            if (this.mode() == WiziCore_Visualizer.RUN_MODE)
                this.bindEvent(AC.Widgets.Base.onClick);
        }
        var self = this;

        //set initial value
        if (this.value() == undefined) {
            this.value(this[this._dataPropName]());
        }
        this._super.apply(this, arguments);
    },

    _onSTUpdated: function() {
        this._label(this._project['label']);
    },

    _onInitLanguage: function() {
        this.label(this.label());
    },

    initProps: function() {
        this._super();

        this.font = this.themeProperty('font', this._font);
        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.shadow = this.themeProperty('shadow', this._shadow);

        this.pageJump = this.normalProperty('pageJump');
        this.label = this.htmlLngPropertyBeforeSet('label', this._labelBefore, this._label);
        this.value = this.label;

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.readonly = this.htmlProperty('readonly', this._readonly);
        this.link = this.normalProperty('link', this._updateLink);
    },

    initDomState: function () {
        this._super();
        this.initDomStatePos();
        this._bg(this.bg());
        this._font(this.font());
        this._fontColor(this.fontColor());
        this._borderRadius(this.borderRadius());
        this._border(this.border());
        this._label(this._project['label']);
        this._shadow(this.shadow());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());
        this._updateReadonly();
    },

    _updateLayout: function() {
        this._super();
        this._input.height(this.height());
        /*this._input.width(this.width())
         .height(this.height());*/

        /*if (jQuery.browser.msie) { //no need bcos of <a>
            this._input.css("line-height", this.height() + "px"); // line-height - fix for IE =(
        }*/
        this.tableBase().css("height", this.height());

        if (this.pWidth() == undefined || this.pWidth() == '' || this.parent().getLayoutType() == 'absolute') {
            this.tableBase().css('width', this.width());
        }

    },

    setFocus: function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._input.focus();
        }
    },

    _enable: function(flag) {
        this._super(flag, this._input);
        (flag === false) ? this._input.addClass('ui-state-disabled'): this._input.removeClass('ui-state-disabled');
        this.showEnableDiv(flag);
    },

    _tabindex: function(value) {
        this._super(value, this._input);
    },

    _tabStop: function(value) {
        this._super(value, this._input);
    },

    _fontColor: function(val) {
        this._super(val, this._input);
    },

    _bg: function(value) {
        this._super(value);
        this._super(value, this._input);
    },

    _borderRadius: function(val) {
        this._super(val);
        this._super(val, this._input);
    },

    _labelBefore: function(text) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(text),
                token = isToken ? text : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, text);

            return token;
        } else
            return text;
    },

    _label: function(text) {
        var res = this.getTrValueAddLngAttr(text, this._input);

        if (res === null) res = "";
        this._input.text(res);
    },

    _font: function(val) {
        this._super(val, this._input);
    }
});

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ButtonWidget.actions = function() {
    var actions = jQuery.extend({}, AC.Widgets.Base.actions(), {});
    WiziCore_UI_ButtonWidget.actions = function() {return actions};
    return actions;
};
WiziCore_UI_ButtonWidget._props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.label
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
        AC.Property.layout.alignInContainer,
        AC.Property.layout.tabindex,
        AC.Property.layout.tabStop
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.resizing,
        AC.Property.behavior.visible,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.shadow,
        AC.Property.style.font,
        AC.Property.style.fontColor,
        AC.Property.style.margin,
        AC.Property.style.bgColor,
        AC.Property.style.border,
        AC.Property.style.borderRadius,
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
WiziCore_UI_ButtonWidget.props = function() {
    return WiziCore_UI_ButtonWidget._props;
};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ButtonWidget.emptyProps = function() {
    return {bgColor : "#f7f7f7",fontColor : "black", font:"normal 12px verdana", border:"1px solid gray", borderRadius:"0", shadow: ""};
};
/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ButtonWidget.inlineEditPropName = function() {
    return "label";
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ButtonWidget.defaultProps = function() {
    return  {
        x : "0", y: "0", width: "80", height: "26", zindex : "auto", label: "Button", enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true, opacity : 1,
        name : "button1", margin: "", alignInContainer: 'left', pWidth: "", hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        dragAndDrop: false,
        resizing: false,
        widgetStyle: "default", tabStop: true
    };
};

WiziCore_UI_ButtonWidget.isField = function() {
    return true
};
})(jQuery,window,document);