/**
 * @lends       WiziCore_UI_PageButtonWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_PageButtonWidget = AC.Widgets.WiziCore_UI_PageButtonWidget =  AC.Widgets.WiziCore_UI_ButtonWidget.extend({
    _widgetClass : "WiziCore_UI_PageButtonWidget",
    _input: null,
    _dataPropName : "label",

    /**
     * Description of constructor
     * @class       Button for RepeatContainer paging
     * @author      Timofey Tatarinov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function(){
        var self = this;
        this._super.apply(this, arguments);
        $(this._input).bind("click.custom", function(ev){
            self.onCustomClick(ev);
        });
    },

    onCustomClick: function(ev) {
        var self = this;
        if (self.sourceWidget() != null) {
            var uid = self.sourceWidget();
            uid = (typeof uid == "object" && uid.uid != undefined) ? uid.uid : uid;
            var sourceWidget = self.form().find(uid);
            sourceWidget.fetchDataPage('next');
        }
    },


    initProps: function(){
        this._super();

        this.sourceWidget = this.normalPropBeforeSet('sourceWidget', this._sourceWidgetBefore, this._sourceWidget);
    },

    onPageDrawn: function() {
        this._super();
        this._sourceWidget(this.sourceWidget());
    },

    updateNavigation: function(currPage, pageCount) {
        acDebugger.systemLog(currPage, pageCount);
    },

    _sourceWidgetBefore: function(widget) {
        widget = this.getUidWidgetFromObjectChooser(widget);
        if (this.sourceWidget() != null) {
            var oldWidget = this.form().find(this.sourceWidget())
            oldWidget.unregisterPaging(this.id());
        }

        return widget;
    },

    _sourceWidget: function(widget) {
        if (widget != undefined){
            var widgetInst = this.form().find(widget)
            if (widgetInst != null){
                widgetInst.registerPaging(this, this.updateNavigation);
            }
        }
    }
});

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.label,
            AC.Property.general.sourceWidget
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
WiziCore_UI_PageButtonWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_PageButtonWidget.emptyProps = function() {
    var ret = {bgColor : "#f7f7f7",fontColor : "black", font:"normal 12px verdana", border:"1px solid gray", borderRadius:"0"};
    return ret;
};
/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_PageButtonWidget.inlineEditPropName = function() {
    return "label";
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_PageButtonWidget.defaultProps = function() {
    var ret = {
        x : "0", y: "0", width: "80", height: "26", zindex : "auto", label: "Button", enable : true,
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true, opacity : 1,
        name : "pageButton1", pWidth: "", margin: "", alignInContainer: 'left',
        pageMode : WiziCore_UI_PageButtonWidget.MODE_NEXT,
        selPage : 1, hourglassImage: "Default", displayHourglassOver: "inherit", customCssClasses: "",
        isField: true, shadow: "",
        dragAndDrop: false, resizing: false,
        widgetStyle: "default", tabStop: true
    };
    return ret;
};
})(jQuery,window,document);