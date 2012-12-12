/**
 * @lends       WiziCore_UI_ButtonMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_ButtonMobileWidget = AC.Widgets.WiziCore_UI_ButtonMobileWidget = AC.Widgets.WiziCore_UI_BaseMobileWidget.extend({
    _widgetClass: "WiziCore_UI_ButtonMobileWidget",
    _input: null,
    _dataPropName : "label",
    _theme: 'b',
    _div: null,

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Timofey Tatarinov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
        var res = this.getUserIconResource(this._project['icon']);
        if (res){
            this._project['icon'] = res;
        }
    },

    _updateLayout: function() {
        this._super.apply(this, arguments);
        this._updateButtonStyle(this.height());
    },

    _updateButtonViewOnClick: function(){
        if (WiziCore_Helper.isMobile() || WiziCore_Helper.isNative()){
            var anchor = this.base().find("a"),
                mobileTheme = this.mobileTheme();
            anchor.addClass("m-ui-btn-active-" + mobileTheme);
            var self = this;
            setTimeout(function(){
                anchor.removeClass("m-ui-btn-active-" + mobileTheme);
            },400);
        }
    },

    onResize:function() {
        this._updateButtonStyle(this.base().height());
    },

    onWidgetMovedByCommand: function(){
        var height = this.height();
        if (this.parent() && this.parent().widgetClass() == "WiziCore_UI_ContainerMobileWidget"){
            //55 is default height of button
            //check for parent if it's mobile toolbar then small button used and widget size changes to 47 (Bug #3189)
            (height == "55") && (this._project['height'] = '46');
        }
    },

    _updateButtonStyle:function(height, forced) {
        //check for parent if it's mobile toolbar then small button used and widget size changes to 47 (Bug #3189)
        if (typeof(height) == 'string'){
            height = height * 1;
        }

        var btn = this._cnt.find(">.m-ui-btn"),
                f = 'm-ui-footer';
        if (btn.length == 0) {
            return
        }
        if (height < 47 && (!this._cnt.hasClass(f) || forced)) {
            this._cnt.addClass(f);
            btn.css('width', '100%');
            this._cnt.css('padding', '3px 5px 3px 3px');
//            this.base().css('padding-right', 3);
            if ($.browser.mozilla){
                this._cnt.css("-moz-box-sizing", "border-box");
            } else {
                this._cnt.css("box-sizing", "border-box");
            }
        }
        else if (height >= 47 && (this._cnt.hasClass(f) || forced)){
            this._cnt.removeClass(f);
            btn.css('width', '');
            this._cnt.css('padding', '');
//            this.base().css('padding-right', '');

        }
    },

    draw: function() {
        this._cnt = $('<div>');
        this.base().append(this._cnt);

        //set initial value
        if (this.value() == undefined) {
            this.value(this._project['label']);
        }

        this._super.apply(this, arguments);
    },

    _redraw: function() {
        if (!this._cnt)
            return;

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;
        this._super();
        var self = this;

        this._cnt.empty();

        var i = $("<a href='javascript:void(0);'/>");
        i.html(this.checkEmptyLabel(this.label()));
        var icon = this.icon(),
            userLink;
        if (icon && icon != 'none' ) {
            var res_icon = this.getUserIconResource(icon);
            if (res_icon){
                userLink = res_icon;
                icon = 'user-icon';
            }
            i.data('icon', icon);
            i.data('iconpos', this.iconPosition());
        }
        AC.Widgets.Base.prototype._tabindex.call(this, this.tabindex(), i);
        this._cnt.prepend(i);

        i.mobileButton(this._getJQMOptions());

        if (userLink){
            var link = this._cnt.find(".m-ui-btn");
            link.addClass("m-ui-userlink");
            link.find(".m-ui-icon").css({"background-image": "url(" + userLink + ")"});
        }

        if (this._bindingEvents[AC.Widgets.Base.onClick] == 0 || this._bindingEvents[AC.Widgets.Base.onClick] == undefined) {
            this.eventsHandles()[AC.Widgets.Base.onClick] = AC.Widgets.Base.onClick;
            if (this.mode() != WiziCore_Visualizer.EDITOR_MODE)
                this.bindEvent(AC.Widgets.Base.onClick);
        }
        this._input = i;
        this._updateButtonStyle(this.height(), true);
        //this._input.css("cursor", "pointer");
        this._updateEnable();
        this._link = this._cnt.find("a");
        this._updateLink(this.link());
        jQuery.fn.__useTr = trState;
    },

    _enable: function(val){
        if (this._input){
            val = (val === true) ? "enable" : "disable";
            this._input.data("mobileButton") && this._input.mobileButton(val);
        }
    },

    _shadow: function(val, div){
        this._super(val, div || this._input);
    },


//    onPageDrawn: function() {
//        this._super.apply(this, arguments);
//        this._input.data("mobileButton") && this._input.mobileButton({theme: this._theme});
//    },

    setFocus: function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._input.focus();
        }
    },

    _beforeLabel: function(text) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(text),
                token = isToken ? text : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, text);

            return token;
        } else
            return text;
    },

    _onInitLanguage: function() {
        this.label(this.label());
    },

    _onSTUpdated: function() {
        this._redraw();
    },

    _onLanguageChanged: function() {
        this._redraw();
    },

    initProps: function() {
        this._super();
        this.name = this.normalProperty('name');

        this.label = this.htmlLngPropertyBeforeSet('content', this._beforeLabel, this._redraw);
        this.value = this.label;

        this.enable = this.htmlProperty('enable', this._enable);
        this.visible = this.htmlProperty('visible', this._visible);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._redraw);
        this.icon = this.themeProperty('icon', this._redraw);
        this.iconPosition = this.themeProperty('iconPosition', this._redraw);
        this.link = this.normalProperty('link', this._updateLink);
//        this.readonly = this.htmlProperty('readonly', this._readonly);
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
//        this._tabindex(this.tabindex());
//        this._updateReadonly();
    }
});

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ButtonMobileWidget.actions = function() {
    var ret = $.extend({}, AC.Widgets.Base.actions(), {});
    WiziCore_UI_ButtonMobileWidget.actions = function(){return ret};
    return ret;
};
//WiziCore_UI_ButtonMobileWidget._props = [
//    { name: AC.Property.group_names.general, props:[
//        AC.Property.general.widgetClass,
//        AC.Property.general.name,
//        AC.Property.general.content
//    ]},
//    { name: AC.Property.group_names.layout, props:[
//        AC.Property.layout.x,
//        AC.Property.layout.y,
//        AC.Property.layout.width,
//        AC.Property.layout.height,
//        AC.Property.layout.repeat,
//        AC.Property.layout.zindex,
//        AC.Property.layout.tabindex,
//        AC.Property.layout.tabStop,
//        AC.Property.layout.anchors,
//        AC.Property.layout.alignInContainer
//
//    ]},
//    { name: AC.Property.group_names.behavior, props:[
//        AC.Property.behavior.dragAndDrop,
//          AC.Property.behavior.resizing,
//          AC.Property.behavior.visible,
//        AC.Property.behavior.enable
//    ]},
//    { name: AC.Property.group_names.style, props:[
//        AC.Property.behavior.opacity,
//        AC.Property.style.mobileStyle,
//        AC.Property.style.customCssClasses,
//			AC.Property.style.widgetStyle
//    ]}
//];
///**
// * Return available widget prop
// * @return {Object} available property
// */
//WiziCore_UI_ButtonMobileWidget.props = function() {
//    return WiziCore_UI_ButtonWidget._props;
//};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ButtonMobileWidget.emptyProps = function() {
    return {bgColor : "#f7f7f7",fontColor : "black", font:"normal 12px verdana", borderRadius:"0"};
};
/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ButtonMobileWidget.inlineEditPropName = function() {
    return "label";
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ButtonMobileWidget.defaultProps = function() {
    return  {
        x : "0", y: "0", width: "150", height: "55", zindex : "auto", content: "Button", enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true, opacity : 1,
        name : "button1",
        dragAndDrop: false, resizing: false,
        widgetStyle: "default", customCssClasses: "", alignInContainer: 'left',
        mobileTheme: "a"
    };
};

WiziCore_UI_ButtonMobileWidget.isField = function() {
    return true
};
})(jQuery,window,document);