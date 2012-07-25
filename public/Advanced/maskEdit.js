/**
 * @lends       WiziCore_UI_MaskEditWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_MaskEditWidget = AC.Widgets.WiziCore_UI_MaskEditWidget =  AC.Widgets.WiziCore_UI_TextWidget.extend({
    _widgetClass : "WiziCore_UI_MaskEditWidget",
    _input: null,
    _dataPropName : "text",

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov
     * @version     0.1
     * @augments    WiziCore_UI_TextWidget
     * @constructs
     */
	init: function(){
        this._super.apply(this, arguments);
	},

    initProps:function(){
        this._super();
        this.mask = this.htmlProperty('mask', this._mask);
    },

    initDomState: function(){
        this._super();
        this._mask(this.mask() );
    },
    /**
     * Set input mask
     */
    _mask: function(val){
            this._input.unmask();
            this._input.mask(val);
    },

    _readonly: function(val){
        this._input.unmask();
        this._super(val, this._input);
        this._input.mask(this.mask());
    }

});

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_MaskEditWidget.inlineEditPropName = function(){
    return "text";
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.mask,
            AC.Property.general.text
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
WiziCore_UI_MaskEditWidget.props = function(){
    return _props;

};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_MaskEditWidget.emptyProps = function(){
    return {bgColor : "#f7f7f7",fontColor : "black", font:"normal 12px verdana", border:"1px solid gray"};
};
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_MaskEditWidget.actions = function(){
    var ret = {
            };
    ret = $.extend(AC.Widgets.WiziCore_UI_TextWidget.actions(), ret);
    WiziCore_UI_MaskEditWidget.actions= function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_MaskEditWidget.defaultProps = function(){
    return { text : "11/11/1111", x : "0", y: "0", width: "200", height: "22", zindex : "auto", readonly : false, enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true, mask: "99/99/9999", opacity : 1,
        widgetStyle: "default", name:"maskEdit1", tabStop: true, hourglassImage: "Default",
        pWidth: "", shadow: "", displayHourglassOver: "inherit", customCssClasses: "",
        dragAndDrop: false, resizing: false,
        margin: "", alignInContainer: 'left'
    };
};
})(jQuery,window,document);