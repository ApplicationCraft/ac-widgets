/**
 * @lends       WiziCore_UI_TextANumWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_TextANumWidget = AC.Widgets.WiziCore_UI_TextANumWidget =  AC.Widgets.WiziCore_UI_TextWidget.extend({
    _widgetClass : "WiziCore_UI_TextANumWidget",

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     * @augments    WiziCore_UI_TextWidget
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    }
});

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_TextANumWidget.inlineEditPropName = function() {
    return "text";
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.text,
            AC.Property.general.typefield
        ]},
    { name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.dataType,
            AC.Property.database.isUnique,
            AC.Property.database.mandatory
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
WiziCore_UI_TextANumWidget.props = function() {
    return _props;
};

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_TextANumWidget.actions = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_TextWidget.actions(), ret);
    WiziCore_UI_TextANumWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextANumWidget.defaultProps = function() {
    return {
        text: "0",
        x: "0",
        y: "0",
        width: "200",
        height: "22",
        alignInContainer: 'left',
        zindex: "auto",
        readonly: false,
        enable: true,
        anchors: {left: true, top: true, bottom: false, right: false},
        visible: true,
        typefield: "alphanumeric",
        widgetStyle: "default",
        opacity: 1,
        margin: "",
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        name: "alphaNumeric1",
        shadow: "",
        dragAndDrop: false, resizing: false,
        tabStop: true
    };
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TextANumWidget.emptyProps = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_TextWidget.emptyProps(), ret);
    WiziCore_UI_TextANumWidget.emptyProps = function(){return ret};
    return ret;
};

WiziCore_UI_TextANumWidget.isField = function() {return true;};
})(jQuery,window,document);