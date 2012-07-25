/**
 * @lends       WiziCore_UI_SubmitButtonMobileWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_SubmitButtonMobileWidget = AC.Widgets.WiziCore_UI_SubmitButtonMobileWidget =  AC.Widgets.WiziCore_UI_ButtonMobileWidget.extend({
    _widgetClass: "WiziCore_UI_SubmitButtonMobileWidget",
    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Timofey Tatarinov
     * @version     0.3
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    initProps: function() {
        this.action = this.normalProperty('action');
//        this.label = this.htmlProperty('content', this._content);
        this._super.apply(this, arguments);
    },

    /**
     *
     * On click event
     */
    onClick: function(ev) {
        var triggerEvent = new jQuery.Event(AC.Widgets.Base.onClick);
        debuger.systemLog("triggerEvent", triggerEvent, "self.id()", this.id());
        $(this).trigger(triggerEvent, [ev]);
        if (triggerEvent.isPropagationStopped()) {
            return;
        }
        var act = this.action();
        var val = (typeof act == "object") ? act.value : act;
        switch (val) {
            case "submit_create":
            case "submit_save":
                var createInstance = (val == "submit_create");
                this.form().submitCurrentInstance(createInstance);
                break;
            default:
                break;
        }
        ev.stopPropagation();
    }

});

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_SubmitButtonMobileWidget.inlineEditPropName = function(){
    return "label";
};

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_SubmitButtonMobileWidget.actions = function(){
   var ret = {

    };
    // append base actions
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_SubmitButtonMobileWidget.actions = function(){return ret};
    return ret;
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.label,
            AC.Property.general.submit_action
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
            AC.Property.layout.tabindex,
            AC.Property.layout.tabStop,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer
        ]},
    { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable
        ]},
    { name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.margin,
            AC.Property.style.mobileTheme,
            AC.Property.style.mobileButtonIcon,
            AC.Property.style.mobileButtonIconPos,
            AC.Property.general.displayHourglassOver,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_SubmitButtonMobileWidget.props = function(){
    return _props;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SubmitButtonMobileWidget.defaultProps = function(){
    return {x : "0", y: "0", width: "150", height: "55", zindex : "auto", content: "Button", enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, name:"submitBtn",
        widgetStyle: "default",
        action: "submit_create",
        visible: true, opacity: 1, displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false, customCssClasses: "",
        pWidth: '', margin: '', alignInContainer: 'left',
        mobileTheme: "b", icon: "none", iconPosition: 'left'
    };
};
})(jQuery,window,document);


