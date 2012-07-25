/**
 * @lends       WiziCore_UI_ResetButtonWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_ResetButtonWidget = AC.Widgets.WiziCore_UI_ResetButtonWidget =  AC.Widgets.WiziCore_UI_ButtonWidget.extend({
    _widgetClass : "WiziCore_UI_ResetButtonWidget",
    _pageNum: null,
    _viewId : null,
    _dataPropName : "label",

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
	init: function(){
        this._super.apply(this, arguments);
	},

    draw : function(){
        var self = this;
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            $(this._input).bind("vclick.custom", {self : self}, self.onClick);
        }
        this._super.apply(this, arguments);
    },

    initProps: function(){
        this._super();
        this.action = this.normalProperty('action');
        this.viewId = this.normalProperty('viewId');
    },

    destroy: function(){
        $(this._input).unbind("click.custom");
        this._super();
    },

    /**
     *
     * On click event
     */
    onClick : function(ev){
        var self = this;
        var triggerEvent = new jQuery.Event(AC.Widgets.Base.onClick);
        $(self.object()).trigger(triggerEvent, [ev]);
        var viewId = self.viewId();
        if (viewId != undefined){
            var action = self.prop("action");
            
            if (action == "Reload" || action == "reload"){
                self.form().reloadView(viewId);
            }
            else {
                self.form().resetView(viewId);
            }
        }
        ev.stopPropagation();
    }
});

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ResetButtonWidget.inlineEditPropName = function(){
    return "label";
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ResetButtonWidget.actions = function(){
    var ret = {

    };
    // append base actions
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_ResetButtonWidget.actions = function(){return ret};
    return ret;
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.label,
            AC.Property.general.resetBtnAction,
            AC.Property.general.view
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
WiziCore_UI_ResetButtonWidget.props = function(){
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ResetButtonWidget.emptyProps = function(){
    var ret = {bgColor : "#f7f7f7",fontColor : "black", font:"normal 12px verdana", border:"1px solid gray", borderRadius:"0"};
    return ret;
};
WiziCore_UI_ResetButtonWidget.isField = function(){ return false};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ResetButtonWidget.defaultProps = function(){
    var ret = {x : "0", y: "0", width: "80", height: "26", zindex : "auto", label: "Button", enable : true, visible: true, opacity: 1,
        anchors : {left: true, top: true, bottom: false, right: false}, name:"actionBtn1", shadow: "",
        widgetStyle: "default", pWidth: "", margin: "", alignInContainer: 'left', tabStop: true, hourglassImage: "Default",
        dragAndDrop: false, resizing: false, displayHourglassOver: "inherit", customCssClasses: "",
        action:"reset"
    };
    return ret;
};
})(jQuery,window,document);