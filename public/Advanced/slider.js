/**
 * @lends       WiziCore_UI_SliderWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_SliderWidget = AC.Widgets.WiziCore_UI_SliderWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationInterval ,{
    _widgetClass: "WiziCore_UI_SliderWidget",
    _padding: null,
    _slider: null,
    _div: null,
    _currValue: null,
    _slideWidgetObj: null,
    _oldVal: null,


    _dataPropName: "values",

    /**
     * Description of constructor
     * @class  Some words about slider widget class
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
        this._padding = 8;
        this._div = $("<div style='padding:"+ this._padding +"px; font-size:62.5%;'>");
        this._slider = $("<div>");
        this._div.append(this._slider);
        this.base().prepend(this._div);
        this.slideBindgingsImageCache();

        this.initSlideWidget();
        this.initSlider();
        self.onSlideBinding(this.prop("values"));
        $(this._slider).bind("slide.custom", function(ev, ui) {
            if (self.range() !== 'On') {
                self.onSlideBinding(ui.value);
            }
        });

        $(this._slider).bind("slidechange.widget", {self: self}, self.onChange);

        this._super.apply(this, arguments);
    },

    onPageDrawn: function(){
        this._updateLayout();
    },

    initProps: function() {
        this._super();

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.isUnique = this.normalProperty('isUnique');

        this.bg = this.themeProperty('bgColor', this._bgColor);
        this.borderColor = this.themeProperty('borderColor', this._borderColor);
        this.hoverColor = this.themeProperty('hoverColor', function(){});
        this.defaultColor = this.themeProperty('defaultColor', this._defaultColor);
        this.activeColor = this.themeProperty('activeColor', function(){});

        this.opacity = this.themeProperty('opacity', this._opacity);
        //this.tabindex = this.htmlProperty('tabindex', this._tabindex);

        this.orientation = this.htmlProperty('orientation', this._orientation);
        this.step = this.htmlProperty('step', this._step);

        this.max = this.checkedPropTemplate('max');
        this.min = this.checkedPropTemplate('min');
        this.range = this.checkedPropTemplate('range');
        this.values = this.checkedPropTemplate('values');
        this.value = this.values;

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');

        this.slideBinding = this.normalProperty('slideBinding');
        this.slideWidget = this.normalPropBeforeSet('slideWidget', this.getUidWidgetFromObjectChooser, this.initSlideWidget);
    },

    _updateLayout: function(){
        this._super();
        if (this._isDrawn) {
            if (this.orientation().toLowerCase() == "vertical") {
                this._slider.css("height", parseInt(this._project['height']) - this._padding * 2);
            }
        }
    },

    onRemove: function() {
        if (this._checkRepeatBeforeRemove()){
            return;
        }
        $(this._slider).unbind("slidechange.widget", self.onChange);
    },

    isInterval: function() {
        return (this.range() == 'On');
    },

    getSlideWidgetValFix: function(){
        //:todo remove this after change prop in server side
        var slideVal = this.slideWidget();
        slideVal = (typeof slideVal == "object" && slideVal.uid != undefined ) ? slideVal.uid : slideVal;
        return slideVal;
    },

    initSlideWidget: function(){
        var slideVal = this.getSlideWidgetValFix();
        this._slideWidgetObj = this.form().find(slideVal );
    },

    /**
     * @return returns undefined if values is ok, else return new values
     */
    checkProps: function(props) {
        var min = props['min'];
        var max = props['max'];
        var range = props['range'];
        var values = props['values'];
        
        var newValues = ($.isArray(values)) ? [values[0], values[1]] : values;
        var changedValues = false;
        var changedMinMax = false;

        if (min > max) {
            var newMin = max;
            var newMax = min;
            min = newMin;
            max = newMax;
            changedMinMax = true;
        }

        var normalize = function(min, max, value) {
            return isNaN(value) ? min : Math.min(max, Math.max(min, value));
        };
        var isInRange = function(min, max, value) {
            return (value >= min) && (value <= max);
        };

        if (range == 'On') {
            if (!$.isArray(newValues)) {
                newValues = [newValues, newValues];
                changedValues = true;
            }

            for (var i = 0; i < 2; ++i) {
                if (!isInRange(min, max, newValues[i])) {
                    newValues[i] = normalize(min, max, newValues[i]);
                    changedValues = true;
                }
            }
            if (newValues[1] < newValues[0]) {
                var temp = newValues[1];
                newValues[1] = newValues[0];
                newValues[0] = temp;
                changedValues = true;
            }

        }
        else {
            if (!$.isArray(newValues)) {
                newValues = [newValues];
                changedValues = true;
            }
            if (!isInRange(min, max, newValues[0])) {
                newValues = normalize(min, max, newValues[0]);
                changedValues = true;
            }
        }

        var newProps = {};
        if (changedValues) {
            newProps['values'] = newValues;
        }
        if (changedMinMax) {
            newProps['min'] = min;
            newProps['max'] = max;
        }

        return (changedValues || changedMinMax) ? newProps : undefined;
    },

    checkedPropTemplate: function(prop) {
        return function(value) {
            if (value !== undefined) {
                //setter
                var propsToCheckList = ['max', 'min', 'range', 'values'];
                var propsToCheck = {};
                for (var i = 0; i < propsToCheckList.length; ++i) {
                    var curPropName = propsToCheckList[i];
                    propsToCheck[curPropName] = this._project[curPropName]
                }
                propsToCheck[prop] = value;
                var checkedProps = this.checkProps(propsToCheck);

                var obj = {};
                obj[prop] = value;
                this._project[prop] = value;
                if (checkedProps != undefined) {
                    for (var checkedProp in checkedProps) {
                        obj[checkedProp] = checkedProps[checkedProp];
                        this._project[checkedProp] = checkedProps[checkedProp];
                    }
                }
                this.sendExecutor(obj);
                if (this._isDrawn) {
                    for (var propName in obj) {
                        var val = obj[propName];
                        switch (propName) {
                            case 'max':
                                this._max(val);
                                break;
                            case 'min':
                                this._min(val);
                                break;
                            case 'range':
                                this._range(val);
                                break;
                        }
                    }
                    this._values(this._project['values']);
                }
            }
            var ret = this._project[prop];
            return ret;
        };
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();

        this._bgColor(this.bg());
        this._borderColor(this.borderColor());
        this._defaultColor(this.defaultColor());

        this._orientation(this.orientation());
        this._max(this.max());
        this._min(this.min());
        this._values(this.values());
        this._step(this.step());
        this._range(this.range());

        this._visible(this.visible());
        this._opacity(this.opacity());
        //this._tabindex(this.tabindex());
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    bindEvent: function(event) {
        this._super(event);

        if (this._bindingEvents[event] > 1 || this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            return;
        }

        var self = this;

        switch (event) {
            case WiziCore_UI_SliderWidget.onStart:
                $(this._slider).bind("slidestart.widget", {self: self}, self.onStart);
            break;

            case WiziCore_UI_SliderWidget.onSlide:
                $(this._slider).bind("slide.widget", {self: self}, self.onSlide);
            break;

            default:
                break;
        }
    },

    /**
     * Function call, then to elements unbind event
     * @param {String} event type of event
     * @param {Boolean} force force unbind
     * @private
     */
    unbindEvent: function(event, force) {
        this._super(event, force);

        if (this._bindingEvents[event] > 0 && force != true) {
            return;
        }

        var self = this;

        switch (event) {
            case WiziCore_UI_SliderWidget.onStart:
                $(this._slider).unbind("slidestart.widget", self.onStart);
            break;

            case WiziCore_UI_SliderWidget.onSlide:
                $(this._slider).unbind("slide.widget", self.onSlide);
            break;

            default:
                break;
        }
    },

    /**
     * On onStart event
     */
    onStart: function(ev, ui) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_SliderWidget.onStart);
        var val = ui.value;
        if (self.range() == 'On') {
            val = {min: ui.values[0], max: ui.values[1]};
        }
        $(self).trigger(triggerEvent, [val]);
    },

    /**
     * On onStart event
     */
    onChange: function(ev, ui) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_SliderWidget.onChange);
        var prev = self._oldVal;
        var val = ui.value;
        if (self.range() == 'On') {
            val = {min: ui.values[0], max: ui.values[1]};
        }
        self._oldVal = val;
        $(self).trigger(triggerEvent, [val, prev]);
    },

    /**
     * On onStart event
     */
    onSlide: function(ev, ui) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_SliderWidget.onSlide);
        var val = ui.value;
        if (self.range() == 'On') {
            val = {min: ui.values[0], max: ui.values[1]};
        }

        $(self).trigger(triggerEvent, [val]);
    },

    /**
     * Preload images for slideBinging
     */
    slideBindgingsImageCache: function() {
        var slideBinding = this.slideBinding();
        var slideWidget = this.getSlideWidgetValFix();

        if (slideBinding != null &&
            slideBinding.rows != undefined &&
            slideWidget != null) {
            var sVals = slideBinding.rows;

            for (var i =0, l = sVals.length; i < l; i++) {
                var link = sVals[i].data[1];
                var img = new Image();
                img.src = link;
            }
        }
    },

    onSlideBinding: function(val) {
        //getting slide bindings and slide widget
        if (this.range() === 'On' || this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            return;
        }
        var slideBinding = this.slideBinding();
        var slideWidget = this._slideWidgetObj;

        if (slideBinding != null &&
            slideBinding.rows != undefined &&
            slideWidget != null) {
            var sVals = slideBinding.rows;
            var newLink = null;
            var oldDx = null;
            for (var i = 0, l = sVals.length; i < l;i++) {
                var item = sVals[i];
                var value = parseInt(item.data[0]);
                if ($.isArray(val) && val[0] != undefined) {
                    val = val[0];
                }
                var dx = val - value;
                if (oldDx === null) {
                    oldDx = dx;
                }
                var link = item.data[1];
                if (val >= value && oldDx >= dx && dx >= 0) {
                    newLink = link;
                    oldDx = dx;
                }
            }
            if (newLink != null) {
                //set new value to slide widget
                var oldValue = slideWidget.getData();
                if (oldValue !== newLink) {
                    slideWidget.setData(newLink);
                }
            }
        }
    },

    initSlider: function() {
        this._slider.data("slider") && this._slider.slider('destroy');
        var self = this;
        var params = {orientation: this.orientation().toLowerCase()};
        if (this.range() != "") {
            params['range'] = this.range();
        }
        if (this.max() != "") {
            params['max'] = this.max();
        }
        if (this.min() != "") {
            params['min'] = this.min();
        }
        var values = this.values();
        if (values != "" && values != null) {
            if (this.range() == 'On') {
                params['values'] = values;
            } else {
                params['value'] = values[0];
            }
        }
        if (this.step() != "") {
            params['step'] = this.step();
        }
        this._slider.slider(params);
        this._updateEnable();
        var aHref = this._slider.find("a");
        $(this._slider).unbind("slidestop");
        $(this._slider).bind("slidestop", {self: self}, function(ev) {
            self.onStop(ev);
            aHref.css("background", self.defaultColor());
        });
        var clicked = false;
        aHref.mousedown(function(){
            if (!self.enable() || !self._isParentEnable())
                return;

            aHref.css("background", self.hoverColor());
            clicked = true;
        }).hover(function() {
            if (!self.enable() || !self._isParentEnable())
                return;

            if (!clicked)
            $(this).css("background", self.hoverColor());
        }, function() {
            if (!self.enable() || !self._isParentEnable())
                return;

            if (!clicked)
            $(this).css("background", self.defaultColor());
        }).mouseup(function(){
            if (!self.enable() || !self._isParentEnable())
                return;

            clicked = false;
            aHref.css("background", self.defaultColor());
        });

    },

    onStop: function(ev) {
        var triggerEvent = new $.Event(WiziCore_UI_SliderWidget.onStop);

        var oldValue = this.prop("values");
        
        var valueOptionName = (this.range() == 'On') ? "values" : "value";
        var newValue = $(this._slider).slider("option", valueOptionName);
        acDebugger.systemLog1("value", newValue);

        $(this).trigger(triggerEvent, [newValue, oldValue]);

        if (triggerEvent.isPropagationStopped() == false) {
            this._project['values'] = newValue;

            var eventValue = (this.range() == 'On') ? {min: newValue[0], max: newValue[1]} : {value: newValue};
            this.sendDrillDown();
        }
        else {
            this.values(oldValue);
        }
    },

    _enable: function(flag){
        if (this._slider != null){
            (flag === false) ? this._slider.slider('disable') : this._slider.slider('enable');
        }
    },

    /**
     * Sets orientation to slider
     */
    _orientation: function(val) {
        val = (typeof val == "object") ? val.value : val; 
        if (val == "horizontal") {
            this._slider.css("height", "");
        }

        this._slider.hide();
        $(this._slider).slider("option", "orientation", val);

        this._slider.show();
    },

    _range: function(val) {
        val = (typeof val == "object") ? val.value : val; 
        var rangeVal = val.toLowerCase();
        rangeVal = (rangeVal == 'on') ? true : rangeVal;
        $(this._slider).slider("option", "range", rangeVal);
    },

    _max: function(val) {
        $(this._slider).slider("option", "max", val);
    },

    _min: function(val) {
        $(this._slider).slider("option", "min", val);
    },

    _values: function(val) {
        var range = this.range();
        var valueOptionName = (range == 'On') ? 'values' : 'value';
        if (range != 'On') {
            val = val[0];
        }
        $(this._slider).slider("option", valueOptionName, val);
    },

    _borderColor: function(val) {
        if (this._slider != null) {
            this.base().find(".ui-slider").css("border", "1px solid " +val);
        }
    },

    _bgColor: function(val) {
        if (this._slider != null) {
            this.base().find(".ui-widget-content").css("background-color", val);
        }
    },
    
    _defaultColor: function(val) {
        if (this._slider != null) {
            this.base().find(".ui-state-default").css("background", val);
        }
    },
    
    _step: function(val) {
        $(this._slider).slider("option", "step", val);
    },

    collectDataSchema: function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var range = this.range();
        if (range === 'On') {
            var partDataType = this.dataType() || AC.Widgets.WiziCore_Api_Form.Type.STRING;

            var partDescription = {
                'label': null,
                'type': AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                'structure': partDataType
            };
            var description = {
                'label': this.name(),
                'type': AC.Widgets.WiziCore_Api_Form.Kind.OBJECT,
                'structure': {
                    'min': partDescription,
                    'max': partDescription
                },
                'unique': this.isUnique()
            };
            dataSchema[this.id()] = description;
            return description;
        }
        else {
            return this._simpleDataSchema(dataSchema);
        }
    },

    appendValueToDataObject: function(dataObject, invalidMandatoryWidgets, force) {
        var self = this;
        return this._simpleDataObjectValue(dataObject, force, function(value) {
            return self._valueToRdbValue(value);
        });
    },

    setValueFromDataObject: function(dataObject, force) {
        var self = this;

        this._setDataObjectValueSimple(dataObject, function(value) {
            return self._rdbValueToValue(value);
        }, force);
    },

    getDataModel: function() {
        var values = [];
        if (this.range() == 'On') {
            values = [{name: "Value Left", value: "", uid: "valueuid"}, {name: "Value Right", value: "", uid: "valueuid1"} ];
        }
        else {
            values = this._valueDataModel();
        }
        return values;
    },

    isBindableToData: function() {
        return true;
    },

    rdbValueDataModel: function() {
        if (this.range() == 'On') {
            return [
                {name: "Min", value: "", uid: "min"},
                {name: "Max", value: "", uid: "max"}
            ];
        } else {
            return null;
        }
    },

    _rdbValueToValue: function(value) {
        if (value !== undefined) {
            var range = this.range();
            if (range === 'On') {
                var isObject = (typeof value == 'object')
                value = (!isObject) ? [value, value] : [value.min, value.max]
            }
            else {
                if (typeof value == 'object' && value.min != undefined) {
                    value = (value.min != undefined) ? value.min : null;
                }
            }
        }
        return value;
    },

    _valueToRdbValue: function(value) {
        var range = this.range();
        var isArray = $.isArray(value);
        var dataObjectValue = null;
        if (range === 'On') {
            if (!isArray) {
                value = [value, value];
            }
            dataObjectValue = {
                min: value[0],
                max: value[1]
            }
        }
        else {
            if (isArray) {
                value = value[0];
            }
            dataObjectValue = value;
        }
        return dataObjectValue;
    },

    rdbValue: function(val) {
        if (val !== undefined) {
            this.value(this._rdbValueToValue(val));
            return undefined;
        } else {
            return this._valueToRdbValue(this.value());
        }
    }
}));

WiziCore_UI_SliderWidget._props = [{ name: AC.Property.group_names.general, props: [
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.max,
            AC.Property.general.min,
            AC.Property.general.values,
            AC.Property.general.step,
            AC.Property.general.range,
            AC.Property.general.slideBinding,
            AC.Property.general.slideWidget
        ]},
    { name: AC.Property.group_names.database, props: [
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.isUnique
    ]},
    { name: AC.Property.group_names.layout, props: [
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
    { name: AC.Property.group_names.behavior, props: [
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable
        ]},
    { name: AC.Property.group_names.data, props: [
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
    { name: AC.Property.group_names.style, props: [
            AC.Property.behavior.opacity,
            AC.Property.style.margin,
            AC.Property.style.borderColor,
            AC.Property.style.bgColor,
            AC.Property.style.hoverColor,
            AC.Property.style.defaultColor,
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
WiziCore_UI_SliderWidget.props = function() {
    return WiziCore_UI_SliderWidget._props;
};

WiziCore_UI_SliderWidget.onChange = "E#WiziCore_UI_SliderWidget#onChange";
WiziCore_UI_SliderWidget.onStop = "E#WiziCore_UI_SliderWidget#onStop";
WiziCore_UI_SliderWidget.onStart = "E#WiziCore_UI_SliderWidget#onStart";
WiziCore_UI_SliderWidget.onSlide = "E#WiziCore_UI_SliderWidget#onSlide";


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderWidget.emptyProps = function() {
    var ret = {bgColor: "#f7f7f7", borderColor: "black", hoverColor: "gray", defaultColor: "silver"};
    return ret;
};
/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_SliderWidget.actions = function() {
    var ret = {
                onChange: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_SliderWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
                onStop: {alias: "widget_event_onstop", funcview: "onStop", action: "AC.Widgets.WiziCore_UI_SliderWidget.onStop", params: "value", group: "widget_event_general"},
                onStart: {alias: "widget_event_onstart", funcview: "onStart", action: "AC.Widgets.WiziCore_UI_SliderWidget.onStart", params: "value", group: "widget_event_general"},
                onSlide: {alias: "widget_event_onslide", funcview: "onSlide", action: "AC.Widgets.WiziCore_UI_SliderWidget.onSlide", params: "value", group: "widget_event_general"},
                dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
                dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
               };
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_SliderWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderWidget.defaultProps = function() {
    var ret = {
        margin: "", alignInContainer: 'left',
        valName: "currVal",
        width: 200,
        height: 25,
        x: "100",
        y: "50",
        zindex: "auto",
        anchors: {left: true, top: true, bottom: false, right: false},
        visible: true,
        orientation: "horizontal",
        enable: true,
        max: 100,
        min: 0,
        values: [0, 0],
        step: "",
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        range: 'Off',
        widgetStyle: "default",
        name: "sliderH1",
        dragAndDrop: false, resizing: false,
        opacity: 1
    };
    return ret;
};

/**
 * Return widget resize properties
 * @return {Object} default properties
 */
WiziCore_UI_SliderWidget.resizeProperties = function() {
    var ret = {handles: "e"};
    return ret;
};

WiziCore_UI_SliderWidget.isField = function() {return true;};
})(jQuery,window,document);