/**
 * @lends       WiziCore_UI_PanelContainerWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_PanelContainerWidget = AC.Widgets.WiziCore_UI_PanelContainerWidget =  AC.Widgets.WiziCore_Widget_Container.extend($.extend({}, WiziCore_ContainerDataBind, WiziCore_WidgetAbstract_DataIntegrationContainer, {
    _widgetClass : "WiziCore_UI_PanelContainerWidget",

    /**
     * Description of constructor
     * @class  Container widget
     * @author      Timofey Tatarinov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw : function() {
        this._super.apply(this, arguments);
        this.initAdaptiveLayout();
    },

    initAdaptiveLayout: function() {
        var layout = this.adaptiveLayout();
        if (layout && layout.length > 0)
        {
            var i = this._adaptiveLayout = new AC.Ext.AdaptiveLayout(this);
            i.initAdaptiveLayout();
        }
    },

    destroy: function() {
        if (this._adaptiveLayout)
            this._adaptiveLayout.unsetAdaptiveLayout();
        this._super();
    },

    _updateAdaptiveLayout: function(value) {
        if (this._adaptiveLayout)
            this._adaptiveLayout.adaptiveLayout(value);
        else {
            this.initAdaptiveLayout();
        }
    },

    initProps: function() {
        this._super();

        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._updateReadonly);
        //this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.shadow = this.themeProperty('shadow', this.checkShadowDocked);
        this.backgroundImage = this.themeProperty("backgroundImage", this._updateBackgroundImage);
        this.backgroundRepeat = this.themeProperty("backgroundRepeat", this._updateBackgroundImage);

        this.foreignAppWriting = this.normalProperty('foreignAppWriting');
        this.autoRelationships = this.normalProperty('autoRelationships');

        //data section
        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.listenview = this.normalProperty('listenview');
        this.keyFields = this.normalProperty('keyFields');
        this.adaptiveLayout = this.normalProperty('adaptiveLayout', this._updateAdaptiveLayout);
        this.fixed = this.themeProperty('fixed', this._fixed);
    },

    checkShadowDocked: function(){
        this._shadow(this.prop("shadow"));
    },

    _applyFixed: function() {
        return (this.mode() == WiziCore_Visualizer.RUN_MODE &&
            this.form().runtimeMode() != WiziCore_UI_FormRuntime.PREVIEW_MODE);
    },

    _fixed: function(val) {
        //called when fixed prop changed
    },

    repeatPage : function(page) {
        this._currRepPage = page;
        this._super.call(this, page);
        var fixed = this.fixed();
        if (this._applyFixed() && (fixed == 'top' || fixed == 'bottom')){
            //page.tableBase().css("padding-" + this.fixed(), this.tableBase().outerHeight());
            //this._setFixedPosition(fixed);
        }
    },

//    _setFixedPosition: function(val) {
//        var pos, position = "top";
//        if (WiziCore_Helper.isMobile()) {
//            pos = (val == "top")? $(window).scrollTop() : $(window).scrollTop() + window.innerHeight - this.tableBase().outerHeight()-8;
//        }
//        else {
//            pos = 0;
//            position = (val == "top")? "top": "bottom";
//            this.tableBase().css("position", 'fixed');
//        }
//        this.tableBase().css(position, pos);
//
//    },

    initDomState : function () {
        this._super();
        //this.initDomStatePos();
        this.checkShadowDocked();
        this._bg(this.bg());
        this._borderRadius(this.borderRadius());
        this._border(this.border());

        this._visible(this.visible());
        this._opacity(this.opacity());
        this._updateBackgroundImage();
        //this._tabindex(this.tabindex() );
        this._updateReadonly();
        this._updateEnable();
    }
/**
 *
 * Return base widget div
 *
 * @return  {Object} base widget div
 */
//    base : function() {
//        if (this._base == null) {
//            var divBase = $("<div>");
////                divBase.css({"position": "absolute", "overflow": "hidden", "z-index": 10, "outline": "none"});
//            divBase.attr("id", this.htmlId());
//            divBase.addClass(this.widgetClass());
//            this._base = divBase;
//        }
//        return this._base;
//    },

//    onPageDrawn: function() {
////        this._centered(this.centered() );
//        this._super();
//    }
}));

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.layout,
        AC.Property.general.adaptiveLayout
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.foreignAppWriting,
        AC.Property.database.autoRelationships
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
        AC.Property.layout.maxHeight,
        AC.Property.layout.zindex,
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer,
        AC.Property.layout.repeat
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.resizing,
        AC.Property.behavior.visible,
        AC.Property.behavior.readonly,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.data, props:[
        AC.Property.data.view,
        AC.Property.data.fields,
        AC.Property.data.groupby,
        AC.Property.data.orderby,
        AC.Property.data.filter,
        AC.Property.data.listenview,
        AC.Property.data.autoLoad,
        AC.Property.data.keyFields
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.shadow,
        AC.Property.style.border,
        AC.Property.style.borderRadius,
        AC.Property.style.margin,
        AC.Property.style.padding,
        AC.Property.style.bgColor,
        AC.Property.style.fixed,
        AC.Property.general.backgroundImage,
        AC.Property.general.backgroundRepeat,
        AC.Property.general.displayHourglassOverParent,
        AC.Property.general.hourglassImage,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_PanelContainerWidget.props = function() {
    return _props;

};

WiziCore_UI_PanelContainerWidget.actions = WiziCore_Widget_Container.actions;

WiziCore_UI_PanelContainerWidget.capabilities = function() {
    return {
        defaultProps: {
            width: "200", height: "100", x : "0", y: "0",
            widgetClass : "WiziCore_UI_PanelContainerWidget",
            name: "PanelContainer1", opacity : 1, zindex : "auto", enable : true, visible : true, widgetStyle: "default",
            anchors : {left: true, top: true, bottom: false, right: false},
            centered: false,
            readonly: false,
            margin:"",
            hourglassImage: "Default",
            displayHourglassOver: "inherit", customCssClasses: "",
            pWidth: "",
            dragAndDrop: false, resizing: false,
            layout: 'absolute',
            shadow : ""
        },
        emptyProps: {bgColor : "#f7f7f7", border : "1px solid gray", borderRadius : "0"},
        props: WiziCore_UI_PanelContainerWidget.props(),
        isField: false,
        containerType: AC.Widgets.Base.CASE_TYPE_CONTAINER
    }
};

})(jQuery,window,document);