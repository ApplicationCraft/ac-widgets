/**
 * @lends       WiziCore_UI_DataContainerWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_DataContainerWidget = AC.Widgets.WiziCore_UI_DataContainerWidget =  WiziCore_Widget_Container.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationContainer, {
    _widgetClass: "WiziCore_UI_DataContainerWidget",
    _singleData: true,

    /**
     * Description of constructor
     * @class  Repeat container
     * @author      Timofey Tatarinov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw : function(){
        this._super.apply(this, arguments);
        this.base().addClass("ac-widget-overflow-border-radius");
    },


    initProps: function() {
        this._super();

        this.foreignAppWriting = this.normalProperty('foreignAppWriting');
        this.autoRelationships = this.normalProperty('autoRelationships');

        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.bg = this.themeProperty('bgColor', this._bg);

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._updateReadonly);

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.listenview = this.normalProperty('listenview');
        this.autoLoad = this.normalProperty('autoLoad');
        this.keyFields = this.normalProperty('keyFields');
    },

    initDomState: function() {
        this._super();
        //this.initDomStatePos();

        this._bg(this.bg());
        this._borderRadius(this.borderRadius());
        this._border(this.border());

        this._updateEnable();
        this._updateReadonly();
        this._visible(this.visible());
        this._opacity(this.opacity());
    },

    /**
     * @private
     * @param {Array} data response data
     * @return {Object} {schema, widgetsData}
     */
    extractSchemaAndWidgetsDataFromResponse : function(data) {
        if ((data == undefined) || (data.length == undefined)) {
            return null;
        }

        var len = data.length;
        if (len == 0) {
            return null;
        }

        // create widgets data array
        var schema = data[0];
        var widgetsData = {};
        for (var j = 1; j < len; j++) {
            for (var i = 0; i < schema.length; ++i) {
                var currId = schema[i];
                if (widgetsData[currId] == undefined) {
                    widgetsData[currId] = [];
                }
                widgetsData[currId].push(data[j][i]);
            }
        }

        if (len == 1) {
            widgetsData = null;
        }

        return {schema : schema, widgetsData : widgetsData};
    },

    value : function(val){
        if (val != undefined){
            this.setData(val);
        }
        return this.getData();
    },
    
    setData: function(data){
        this.setDataToContainerWidgets(data, 0);
    },

    getData: function(){
        var children = this.children();
        var widgetsData = [];

        var rowWidgetsData = {};
        for (var j = 0, jl = children.length; j < jl; j++) {
            var child = children[j];
            rowWidgetsData[child.name()] = child.getData();
        }
        widgetsData.push(rowWidgetsData);

        return widgetsData;
    }
}));

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_DataContainerWidget.actions = function() {
    return {
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data"},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
};

WiziCore_UI_DataContainerWidget._props =  [{ name: AC.Property.group_names.general, props:[
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
            AC.Property.layout.maxHeight,
            AC.Property.layout.repeat,
            AC.Property.layout.zindex,
            AC.Property.layout.repeat,
            AC.Property.layout.alignInContainer,
            AC.Property.layout.scrolling
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
            AC.Property.style.border,
            AC.Property.style.borderRadius,
            AC.Property.style.margin,
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
WiziCore_UI_DataContainerWidget.props = function() {
    return WiziCore_UI_DataContainerWidget._props;
};


WiziCore_UI_DataContainerWidget.capabilities = function() {
    return {
        defaultProps: {
            width: 200,
            height: 100,
            x : 0,
            y: 0,
            zindex : "auto",
            widgetClass : "WiziCore_UI_DataContainerWidget",
            name : "dataContainer1",
            opacity : 1,
            margin: "", alignInContainer: 'left',
            hourglassImage: "Default",
            displayHourglassOver: "inherit", customCssClasses: "",
            visible: true,
            enable: true,
            dragAndDrop: false, resizing: false,
            readonly: false,
            scrolling: "none",
            layout: 'absolute',
            pWidth: ""
        },
        props: WiziCore_UI_DataContainerWidget.props(),
        containerType: AC.Widgets.Base.CASE_TYPE_CONTAINER,
        isField: false,
        actions: WiziCore_UI_DataContainerWidget.actions()
    };
};
})(jQuery,window,document);