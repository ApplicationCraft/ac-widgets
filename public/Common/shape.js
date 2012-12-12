/**
 * @lends       WiziCore_UI_ShapeWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_ShapeWidget = AC.Widgets.WiziCore_UI_ShapeWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_Methods_Widget_ActionClick, {
    _widgetClass : "WiziCore_UI_ShapeWidget",
    _div : null,
    _dataPropName: 'label',

    /**
     * Description of constructor
     * @class  Some words about label widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
	init: function(){
        this._super.apply(this, arguments);
	},

    draw : function(){
        var initialObject = this.object();
        var self = this;
        this._div = $("<table><tr><td></td></tr></table>").css({"width": "100%", "height": "100%", "float": "left", "text-align": "center", border:"0px"});
        this.base().prepend(this._div);
        this._updateEnable();

        (this.mode() != WiziCore_Visualizer.EDITOR_MODE) && this.updateCursorByAction(true);

        this._super.apply(this, arguments);
    },

    onClick: function(ev) {
        var triggerEvent = new jQuery.Event(AC.Widgets.WiziCore_Widget_Base.onClick),
            pj = this.pageJump(),
            app = this.form();
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", this.id());
        $(this).trigger(triggerEvent, [ev]);
        (!triggerEvent.isPropagationStopped()) && this.onActionClick(ev, pj, app);
        ev.stopPropagation();
    },

    _onInitLanguage: function() {
        this.label(this.label());
    },

    _onSTUpdated: function() {
        this._label(this._project['label']);
    },

    initProps: function(){
        this._super();

        this.font = this.themeProperty('font', this._font);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.pageJump = this.normalProperty('pageJump');
        this.label = this.htmlLngPropertyBeforeSet('label', this._beforeLabel, this._label);
        this.value = this.label;
        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.shadow = this.themeProperty('shadow', this._shadow);

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.enable = this.htmlProperty('enable', this._enable);
    },

    initDomState : function (){
        this._super();
        this.initDomStatePos();
        
        this._label(this._project['label']);
        
        this._shadow(this.shadow());
        this._bg(this.bg() );
        this._border(this.border() );
        this._borderRadius(this.borderRadius() );
        this._font(this.font() );
        this._fontColor(this.fontColor() );

        this._updateEnable();
        this._visible(this.visible() );
        this._opacity(this.opacity() );
    },

    _updateLayout: function(){
        this._super();
        this._div.height(this.height());
        this.base().css("overflow", "hidden");
    },

    _enable: function(val){
        (val === false) ? this._div.addClass('ui-state-disabled'): this._div.removeClass('ui-state-disabled');
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE)
            this.updateCursorByAction(val === true);
    },

    _bg: function(val){
        this._super(val);
        this._super(val, this._div)
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


    _label: function(val){
        var res = this.getTrValueAddLngAttr(val, this._div.find("td"));

        if (res === null) res = "";
        this._div.find("td").html(res);
    },

    _border: function(val){
        this._super(val, this._boxDiv);
    },

    _borderRadius: function(val){
        this._super(val);
        this._super(val, this._div);
	}
}));

 var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.label,
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
WiziCore_UI_ShapeWidget.props = function(){
    return _props;
};


WiziCore_UI_ShapeWidget.actions = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_ShapeWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ShapeWidget.emptyProps = function(){
    return {border : "1px solid #000000"};
};

WiziCore_UI_ShapeWidget.inlineEditPropName = function(){
         return "label"
};
/**
 * Return widget resize properties
 * @return {Object} default properties
 */
WiziCore_UI_ShapeWidget.resizeProperties = function(){
    return {};
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ShapeWidget.defaultProps = function(){
    return {width: 100, height: 70, x : "100", y: "50", zindex : "auto", enable: true,
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
        dragAndDrop: false, resizing: false, shadow: "", displayHourglassOver: "inherit", customCssClasses: "",
        widgetStyle: "default", opacity : 1, name: "shape1", pWidth: "", margin: "", alignInContainer: 'left', hourglassImage: "Default"
    };
};
})(jQuery,window,document);