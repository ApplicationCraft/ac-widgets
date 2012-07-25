/**
 * @lends       WiziCore_UI_AuthButtonMobileWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_AuthButtonMobileWidget = AC.Widgets.WiziCore_UI_AuthButtonMobileWidget = AC.Widgets.WiziCore_UI_ButtonMobileWidget.extend($.extend({}, WiziCore_SignInUp, {
    _widgetClass : "WiziCore_UI_AuthButtonMobileWidget",
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

    initProps: function(){
        this._super();



        this.fieldFixData('nameField');
        this.fieldFixData('captchaField');
        this.fieldFixData('confirmInfo');
        this.fieldFixData('confirmField');
        this.fieldFixData('loginField');
        this.fieldFixData('passwordField');
        this.rememberMe = this.normalPropBeforeSet('rememberMe', this._rememberMe);
        this.defaultForm = this.normalPropBeforeSet('defaultForm', this._defaultForm);
                                        /*
        this.nameField = this.normalPropBeforeSet('nameField', this.getUidWidgetFromObjectChooser);
        this.captchaField = this.normalPropBeforeSet('captchaField', this.getUidWidgetFromObjectChooser);
        this.confirmInfo = this.normalPropBeforeSet('confirmInfo', this.getUidWidgetFromObjectChooser);
        this.confirmField = this.normalPropBeforeSet('confirmField', this.getUidWidgetFromObjectChooser);
        this.loginField = this.normalPropBeforeSet('loginField', this.getUidWidgetFromObjectChooser);
        this.passwordField = this.normalPropBeforeSet('passwordField', this.getUidWidgetFromObjectChooser);
        */
        this.minChars = this.normalPropBeforeSet('minChars', this._minChars);
        this.confirmColors = this.normalProperty('confirmColors');

        this.action = this.normalProperty('action');

    },

    _minChars : function(minChars) {
        return parseInt(minChars);
    },

    fieldFixData: function(fieldName){
        var self = this;
        this[fieldName] = function(val){
            var res = self.normalPropBeforeSet(fieldName, self.getUidWidgetFromObjectChooser).apply(self, arguments);
            res = self.getUidWidgetFromObjectChooser(res);
            return res;
        };

    },

    _rememberMe : function(val) {
        return this.getUidWidgetFromObjectChooser(val);
    },

    _defaultForm : function(val) {
        return this.getUidWidgetFromObjectChooser(val);
    },

    /**
     *
     * On click event
     */
    onClick : function(ev) {
        var triggerEvent = new jQuery.Event(AC.Widgets.Base.onClick);
        $(this).trigger(triggerEvent, [ev]);
        if (!triggerEvent.isPropagationStopped()){
            if (this.action() == 'signup') {
                this.signUpClick();
            }
            else {
                this.signInClick();
            }
        }
        ev.stopPropagation();
//        ev.preventDefault();
    }
}));

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_AuthButtonMobileWidget.inlineEditPropName = function(){
    return "label";
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_AuthButtonMobileWidget.actions = function(){
   var ret = {
       onFailed : {alias : "widget_event_auth_failure", funcview : "onFailure", action : "AC.Widgets.WiziCore_UI_AuthButtonMobileWidget.onFailed", params : "message", group : "widget_event_auth"},
       onSuccess : {alias : "widget_event_auth_success", funcview : "onSuccess", action : "AC.Widgets.WiziCore_UI_AuthButtonMobileWidget.onSuccess", params : "userId", group : "widget_event_auth"}
    };
    // append base actions
    $.extend(ret, AC.Widgets.Base.actions());
    WiziCore_UI_AuthButtonMobileWidget.actions = function(){return ret};
    return ret;
};

    WiziCore_UI_AuthButtonMobileWidget.onSessionFullLogin = WiziCore_SignInUp.onSessionFullLogin;
    WiziCore_UI_AuthButtonMobileWidget.onFailed = WiziCore_SignInUp.onFailedEv;
    WiziCore_UI_AuthButtonMobileWidget.onSuccess = WiziCore_SignInUp.onSuccessEv;

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.label,
            {name: "action", type : "authAction", set: "action", get: "action", alias : "widget_action"},
            AC.Property.general.loginField,
            AC.Property.general.passwordField,
            AC.Property.general.nameField,
            AC.Property.general.minChars,
            AC.Property.general.confirmField,
            AC.Property.general.confirmColors,
            AC.Property.general.confirmInfo,
            AC.Property.general.captchaField,
            AC.Property.general.rememberMe,
            AC.Property.general.defaultForm
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
WiziCore_UI_AuthButtonMobileWidget.props = function(){
    return _props;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_AuthButtonMobileWidget.defaultProps = function(){
    return {x : "0", y: "0", width: "150", height: "55", zindex : "auto", content: "Log In", enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, name:"authBtn", visible: true,
        widgetStyle: "default", customCssClasses: "", displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false,
        isField: false, pWidth: '', margin: '', alignInContainer: 'left', mobileTheme: "c", icon: "none", iconPosition: 'left',
        action: "signin"
    };
};

})(jQuery,window,document);