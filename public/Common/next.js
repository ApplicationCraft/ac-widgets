/**
 * @lends       WiziCore_UI_NextButtonWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_NextButtonWidget = AC.Widgets.WiziCore_UI_NextButtonWidget =  AC.Widgets.WiziCore_UI_ButtonWidget.extend($.extend({}, WiziCore_Methods_Widget_ActionClick, {
    _widgetClass : "WiziCore_UI_NextButtonWidget",
    _dataPropName : "label",

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

    onClick: function(ev) {
        var triggerEvent = new jQuery.Event(AC.Widgets.WiziCore_Widget_Base.onClick),
            pageJump = this.pageJump(),
            app = this.form();
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", this.id());
        $(this).trigger(triggerEvent, [ev]);
        (!triggerEvent.isPropagationStopped()) && this.onActionClick(ev, pageJump, app);
        ev.stopPropagation();
    },

    draw : function() {
        var self = this;
        if (this._bindingEvents[AC.Widgets.Base.onClick] == 0 || this._bindingEvents[AC.Widgets.Base.onClick] == undefined) {
            this.object().eventsHandles()[AC.Widgets.Base.onClick] = AC.Widgets.Base.onClick;
            if (this.mode() == WiziCore_Visualizer.RUN_MODE)
                this.bindEvent(AC.Widgets.Base.onClick);
        }
        this._super.apply(this, arguments);
    }
}));

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_NextButtonWidget.inlineEditPropName = function() {
    return "label";
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_NextButtonWidget.actions = function() {
    var ret = AC.Widgets.Base.actions();
    var ret2 = {
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    // append base actions
    ret = $.extend(true, {}, ret, ret2);
    WiziCore_UI_NextButtonWidget.actions = function(){return ret};
    return ret;
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.label,
        AC.Property.general.link,
        AC.Property.general.pageJump
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
    //   { name: AC.Property.group_names.data, props:[
    //           AC.Property.data.view,
    //          AC.Property.data.fields,
    //           AC.Property.data.groupby,
    //           AC.Property.data.orderby,
    //           AC.Property.data.filter,
    //           AC.Property.data.onview,
    //           AC.Property.data.applyview,
    //           AC.Property.data.listenview,
    //           AC.Property.data.resetfilter,
//            AC.Property.data.autoLoad
    //       ]},
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
WiziCore_UI_NextButtonWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_NextButtonWidget.emptyProps = function() {
    var ret = {bgColor : "#f7f7f7",fontColor : "black", font:"normal 12px verdana", border:"1px solid gray", borderRadius:"0"};
    return ret;
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_NextButtonWidget.defaultProps = function() {
    var ret = {x : "0", y: "0", width: "80", height: "26", zindex : "auto", label: "Button", enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, name:"actionBtn1", visible: true,
        widgetStyle: "default", opacity: 1, pWidth: "", margin: "", alignInContainer: 'left', tabStop: true, hourglassImage: "Default",
        dragAndDrop: false, resizing: false, shadow: "", displayHourglassOver: "inherit", customCssClasses: "",
        isField: false
    };
    WiziCore_UI_NextButtonWidget.defaultProps = function(){return ret};
    return ret;
};
})(jQuery,window,document);