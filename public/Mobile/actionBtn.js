/**
 * @lends       WiziCore_UI_ActionButtonMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_ActionButtonMobileWidget = AC.Widgets.WiziCore_UI_ActionButtonMobileWidget = AC.Widgets.WiziCore_UI_ButtonMobileWidget.extend($.extend({},WiziCore_Methods_Widget_ActionClick, {
    _widgetClass : "WiziCore_UI_ActionButtonMobileWidget",
    _theme: "c",

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Timofey Tatarinov
     * @version     0.2
     *
     * @constructs
     */
	init: function(){
        this._super.apply(this, arguments);
	},

    draw : function(){

        this._super.apply(this, arguments);
    },

    initProps: function() {
        this._super();
        this.pageJump = this.normalProperty('pageJump');
    },

    onClick: function(ev) {
        if (!this.enable() || !this._isParentEnable())
            return;

        this._updateButtonViewOnClick();
        var self = this,
            pageJump = this.pageJump(),
            app = this.form();
        ev.stopPropagation(); // stop propagation for ios mobile button
        setTimeout(function(){
            var triggerEvent = new $.Event(AC.Widgets.Base.onClick);
            $(self).trigger(triggerEvent, [ev]);
            if (!triggerEvent.isDefaultPrevented()) //checking for false
                self.onActionClick(ev, pageJump, app);
            //ev.stopPropagation();
        },30);
    }
}));

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ActionButtonMobileWidget.inlineEditPropName = function(){
    return "label";
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ActionButtonMobileWidget.actions = function(){
   var ret = {

    };
    // append base actions
    $.extend(ret, AC.Widgets.Base.actions());
    WiziCore_UI_ActionButtonMobileWidget.actions = function(){return ret};
    return ret;
};

var _props = [{ name: AC.Property.group_names.general, props:[
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
WiziCore_UI_ActionButtonMobileWidget.props = function(){
    return _props;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ActionButtonMobileWidget.defaultProps = function(){
    return {x : "0", y: "0", width: "150", height: "55", zindex : "auto", content: "Button", enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, name:"actionBtn1", visible: true,
        widgetStyle: "default", customCssClasses: "", displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false, opacity: 1,
        isField: false, pWidth: '', margin: '', alignInContainer: 'left', mobileTheme: "c", icon: "none", iconPosition: 'left'
    };
};
})(jQuery,window,document);

