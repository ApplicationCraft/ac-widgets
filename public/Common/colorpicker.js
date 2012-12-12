/**
 * @lends       WiziCore_UI_ColorPickerWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_ColorPickerWidget = AC.Widgets.WiziCore_UI_ColorPickerWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, {
    _widgetClass: "WiziCore_UI_ColorPickerWidget",
    _colorTable: null,
    _colorDiv: null,
    _dataPropName: "color",
    _valueDefaultPropName: 'color',

    /**
     * Description of constructor
     * @class  Some words about label widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        var self = this;

        var color = $('<div>').css({width: this.width(), height: this.height()});
        this._colorDiv = color;
        color.ColorPicker({
            onShow: function(){
                return self.enable();
            },
            onSubmit: function(hsb, hex, rgb, el, trans, cancel) {
                if (trans){
                    hex = "transparent";
                } else {
                    hex = (hex.charAt(0) != "#") ? "#" + hex : "";
                }
                $(el).ColorPickerHide();
                if (!cancel){
                    self.onChangeColor({data: {self: self}}, hex);
                }
            },
            onChange: function(hsb, hex, rgb) {
                if (hex.charAt(0) != "#") hex = "#" + hex;
            },
            onBeforeShow: function() {
                var colorValue = self.color();
                if (colorValue != null) {
                    $(this).ColorPickerSetColor(colorValue);
                }
            }
        });
        this.base().prepend(color);
        color.append("<table border='0' style='width:100%; height:100%; text-align:center;'><tr><td></td></tr></table>");
        this._colorTable = color;
        this._super.apply(this, arguments);
    },

    _onSTUpdated: function() {
        this._displayText(this._project['displayText']);
    },

    _onInitLanguage: function() {
        this.displayText(this.displayText());
    },

    initProps: function() {
        this._super();

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.isUnique = this.normalProperty('isUnique');

        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.color = this.themeProperty('color', this._bg);
        this.value = this.color;
        this.displayText = this.htmlLngPropertyBeforeSet('displayText', this._beforeDisplayText, this._displayText);

        this.shadow = this.themeProperty('shadow', this._shadow);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);

        // data
        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();
        this._bg(this.color());
        this._border(this.border());
        this._borderRadius(this.borderRadius());
        this._displayText(this._project['displayText']);

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());
        this._shadow(this.shadow());
    },

    _updateLayout: function(){
        this._super();
        this._colorDiv.css({height: this.height()});
        if (this._enableDiv != null){
            this._enableDiv.height(this.base().height())
                            .width(this.base().width());
        }
    },

    onChangeColor: function(ev, hexColor) {
        var self = ev.data.self;

        var oldValue = self.color();
        var newValue = hexColor;

        var triggerEvent = new jQuery.Event(WiziCore_UI_ColorPickerWidget.onChange);
        $(self).trigger(triggerEvent, [newValue, oldValue]);

        var valueToSet = oldValue;
        if (!triggerEvent.isPropagationStopped()) {
            valueToSet = newValue;
            self._project['color'] = newValue;
            this.sendDrillDown();
        }
        self._bg(valueToSet);
        self.setWidgetColors(valueToSet);
    },

    setWidgetColors: function(colorValue) {
        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            var self = this;
            var form = self.form();

            var wcolor = form.find(self.widgetColor()),
                wbgcolor = form.find(self.widgetBGColor()),
                wbordercolor = form.find(self.widgetBorderColor());

            //set color and bgColor properties
            if (wcolor != null) {
                wcolor.prop("color", colorValue);
                wcolor.prop("fontColor", colorValue);
            }
            if (wbgcolor != null) {
                wbgcolor.prop("bgColor", colorValue);
            }

            //set border color of property "border"
            if (wbordercolor != null) {
                var border = wbordercolor.prop("border"),
                    tmpBorder = $("<div>").css("border", border).css("border-color", colorValue).css("border");

                wbordercolor.prop("border", tmpBorder);
            }

            //set display color
            var color = new WiziCore_Api_Color(colorValue);
            color.rgbToGray();
            var textColor = (color.greenValue() > 128) ? "#000" : "#fff";
            if (this._isDrawn) {
                self._colorTable.find("table").css("color", textColor);
            }
        }
    },

    _enable: function(flag){
        this.showEnableDiv(flag); 
    },

    _bg: function(val){
        if (val === null) val = "";
        this._super(val);
    },

    _beforeDisplayText: function(val) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(val),
                token = isToken ? val : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, val);

            return token;
        } else
            return val;
    },

    _displayText: function(val) {
        var res = this.getTrValueAddLngAttr(val, this._colorTable.find("td"));
        this._colorTable.find("td").html(res);
    },

    widgetColor: function(val) {
        if (val != undefined) {
            var uid = this.getUidWidgetFromObjectChooser(val);
            this._project['widgetColor'] = uid;
            var obj = {'widgetColor': uid};
            this.sendExecutor(obj);
        }
        return this._project['widgetColor'];
    },


    widgetBGColor: function(val) {
        if (val != undefined) {
            var uid = this.getUidWidgetFromObjectChooser(val);
            this._project['widgetBGColor'] = uid;
            var obj = {'widgetBGColor': uid};
            this.sendExecutor(obj);
        }
        return this._project['widgetBGColor'];
    },


    widgetBorderColor: function(val) {
        if (val != undefined) {
            var uid = this.getUidWidgetFromObjectChooser(val);
            this._project['widgetBorderColor'] = uid;
            var obj = {'widgetBorderColor': uid};
            this.sendExecutor(obj);
        }
        return this._project['widgetBorderColor'];
    },

    collectDataSchema: function(dataSchema) {
        return this._simpleConstDataSchema(AC.Widgets.WiziCore_Api_Form.Type.INTEGER, dataSchema);
    },

    appendValueToDataObject: function(dataObject, invalidMandatoryWidgets, force) {
        return this._simpleDataObjectValue(dataObject, force, function(value) {
            if (value.charAt(0) == '#') {
                value = value.slice(1);
            }
            var color = (value != 'transparent') ? parseInt(value, 16) : -1;
            return color;
        });
    },

    setValueFromDataObject: function(dataObject, force) {
        this._setDataObjectValueSimple(dataObject, function(value) {
            return (value != -1) ? '#' + value.toString(16) : 'transparent';
        }, force);
    },

    getDataModel: function() {
        return this._labelDataModel();
    },

    isBindableToData: function() {
        return true;
    },

    onContainerChangeLayout: function(layout) {
        //calls from _updateLayout or when parent change layout property
        this._setPosEnableDiv();
    }
}));

WiziCore_UI_ColorPickerWidget._props =  [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.color,
            AC.Property.general.displayText,
            AC.Property.general.widgetColor,
            AC.Property.general.widgetBGColor,
            AC.Property.general.widgetBorderColor
        ]},
    { name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.isUnique
        ]},
    { name: AC.Property.group_names.layout, props:[
            AC.Property.layout.pWidthHidden,
            AC.Property.layout.widthHidden,
            AC.Property.layout.heightHidden,
            AC.Property.layout.sizes,
            AC.Property.layout.minWidth,
            AC.Property.layout.maxWidth,
            AC.Property.layout.x,
            AC.Property.layout.y,
            AC.Property.layout.zindex,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer,
            AC.Property.layout.repeat
        ]},
    { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable
        ]},
    { name: AC.Property.group_names.data, props:[
            AC.Property.data.view,
            AC.Property.data.fields,
            AC.Property.data.groupby,
            AC.Property.data.orderby,
            AC.Property.data.filter,
            AC.Property.data.onview,
            AC.Property.data.applyview,
            AC.Property.data.listenview,
            AC.Property.data.resetfilter,
            AC.Property.data.autoLoad
        ]},
    { name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.shadow,
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.borderRadius,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
] ;
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ColorPickerWidget.props = function() {
    return WiziCore_UI_ColorPickerWidget._props;
};


/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ColorPickerWidget.actions = function() {
    var ret = {
        change: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_ColorPickerWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data"},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    return ret;
};

WiziCore_UI_ColorPickerWidget.capabilities = function() {
    var ret = {
        actions: WiziCore_UI_ColorPickerWidget.actions(),
        defaultProps: {
            pWidth: "",
            margin: "", alignInContainer: 'left',
            hourglassImage: "Default",
            displayHourglassOver: "inherit", customCssClasses: "",
            width: 45,
            height: 45,
            x: "100",
            y: "50",
            zindex: "auto",
            anchors: {left: true, top: true, bottom: false, right: false},
            visible: true,
            opacity: 1,
            enable: true,
            name: "colorPicker1",
            color: "#949494",
            shadow: "",
            dragAndDrop: false, resizing: false,
            widget_pcat_generalaction: "none"
        },
        inlineEditPropName: "color", //doubleClick support for widget
        props: WiziCore_UI_ColorPickerWidget.props(),
        isField: true,
        containerType: AC.Widgets.Base.CASE_TYPE_ITEM
    }
    return ret;
};

WiziCore_UI_ColorPickerWidget.onChange = "E#ColorPicker#onChange";
})(jQuery,window,document);