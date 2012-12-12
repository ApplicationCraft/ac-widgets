/**
 * @lends       toolbar
 */
(function($, window, document, undefined){
var WiziCore_UI_ContainerMobileWidget = AC.Widgets.WiziCore_UI_ContainerMobileWidget =  AC.Widgets.WiziCore_UI_PanelContainerWidget.extend({
    _widgetClass : "WiziCore_UI_ContainerMobileWidget",
    _currPage:null,
    _cnt: null,

    draw: function() {
//        var c = this._cnt = $("<div>");
//        c.css("min-height", this.height());
        this.base().css({"border-left": 0, "border-right": 0});
        this._super.apply(this, arguments);
    },

//    _updateLayout: function() {
//        this._super();
//        this._cnt.css("min-height", this.height());
//    },

    initProps: function() {
        this._super();
        this.mobileTheme = this.themeProperty('mobileTheme', this._mobileTheme);
    },

    _redraw: function() {
        this._super.apply(this, arguments);
    },

    _mobileTheme: function(val) {
        var removeCallback = function (index, className) {
            var matches = className.match(/m-ui-bar-\w/g) || [];
            return (matches.join(' '));
        };
        this.base().removeClass(removeCallback)
                .addClass('m-ui-bar-' + val);
    },

    _getJQMOptions: function() {
        return {theme: this.mobileTheme()};
    },
    initDomState: function() {
        this._super();
        this._mobileTheme(this.mobileTheme());
    },

    onPageDrawn: function() {
        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            this.base().css('overflow', "hidden"); // for containers overflow must be hidden
            this._updateScrolling();
        }
        this._super.apply(this, arguments);
    }
});
var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.layout
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
        AC.Property.layout.zindex,
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer,
        AC.Property.layout.repeat,
        AC.Property.layout.scrolling
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
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
        AC.Property.style.border,
        AC.Property.style.borderRadius,
        AC.Property.style.margin,
        AC.Property.style.mobileTheme,
        AC.Property.style.fixed,
//        AC.Property.style.bgColor,
//        AC.Property.general.backgroundImage,
//        AC.Property.general.backgroundRepeat,
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
WiziCore_UI_ContainerMobileWidget.props = function() {
    return _props;

};

WiziCore_UI_ContainerMobileWidget.capabilities = function() {
    return {
        defaultProps: {
            width: "320", height: "30", x : "0", y: "0",
            widgetClass : "WiziCore_UI_ContainerMobileWidget",
            name: "MobileToolbar", opacity : 1, zindex : "auto", enable : true, visible : true, widgetStyle: "default",
            anchors : {left: true, top: true, bottom: false, right: false},
            centered: false,
            readonly: false,
            margin:"",
            hourglassImage: "Default", displayHourglassOver: "inherit", customCssClasses: "",
            pWidth: "100",
            dragAndDrop: false,
            layout: 'absolute',
            mobileTheme: 'a',
            scrolling: "none"
        },
        emptyProps: {borderRadius : "0"},
        props: WiziCore_UI_ContainerMobileWidget.props(),
        isField: false,
        containerType: AC.Widgets.Base.CASE_TYPE_CONTAINER

    }
};
})(jQuery,window,document);
