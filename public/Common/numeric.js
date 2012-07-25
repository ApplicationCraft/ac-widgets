/**
 * @lends       WiziCore_UI_NumericWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_NumericWidget = AC.Widgets.WiziCore_UI_NumericWidget =  AC.Widgets.WiziCore_UI_TextWidget.extend({
    _widgetClass : "WiziCore_UI_NumericWidget",
    _oldText : null,

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Konstantin Khukalenko
     * @version     0.1
     * @augments    WiziCore_UI_TextWidget
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    initProps: function() {
        this._super();

        this.numericFormat = this.htmlProperty('numericFormat', this._numericFormat);
        this.numericLocale = this.htmlProperty('numericLocale', this._numericFormat);
        this.dataType = this.normalProperty('dataType');
    },

    _text: function(text) {
        if (text === null) text = "";
        if (text !== undefined) {
            this._input.val(text);
            this._input.formatNumber({format:this.numericFormat(), locale: this.numericLocale()});
        }
        return this._input.parseNumber({format:this.numericFormat(), locale: this.numericLocale()}, false);
    },

    _numericFormat : function(val) {
        this._text(this._project['text']);
    },

    onChangeText: function(ev) {
        var self = ev.data.self;
        if (this != self) {
            return self.onChangeText.apply(self, arguments);
        }
        this._super.apply(self, arguments);
        this._text(this._project['text']);
    },

    collectDataSchema: function(dataSchema) {
        var dataType = this.dataType() || AC.Widgets.WiziCore_Api_Form.Type.REAL;
        return this._simpleConstDataSchema(dataType, dataSchema);
    }
});

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_NumericWidget.inlineEditPropName = function() {
    return "text";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.text,
        AC.Property.general.numericFormat,
        AC.Property.general.numericLocale
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataTypeNumeric,
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
        AC.Property.layout.tabindex,
        AC.Property.layout.tabStop,
        AC.Property.layout.zindex,
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
WiziCore_UI_NumericWidget.props = function() {
    return _props;
};

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_NumericWidget.actions = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_TextWidget.actions(), ret);
    WiziCore_UI_NumericWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_NumericWidget.defaultProps = function() {
    return {
        text: "0",
        x: "0",
        y: "0",
        width: "100",
        height: "22",
        zindex: "auto",
        readonly: false,
        enable: true,
        anchors: {left: true, top: true, bottom: false, right: false},
        visible: true,
        widgetStyle: "default",
        opacity: 1,
        name: "Numeric1",
        numericFormat: "#,###.00",
        numericLocale: "us",
        textAlign: "Right",
        pWidth: "",
        margin: "", alignInContainer: 'left',
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        tabStop: true, shadow: "",
        dragAndDrop: false, resizing: false,
        dataType: AC.Widgets.WiziCore_Api_Form.Type.REAL
    };
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_NumericWidget.emptyProps = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_TextWidget.emptyProps(), ret);
    WiziCore_UI_NumericWidget.emptyProps = function(){return ret};
    return ret;
};

WiziCore_UI_NumericWidget.isField = function() {
    return true;
};
})(jQuery,window,document);