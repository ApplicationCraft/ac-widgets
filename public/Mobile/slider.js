/**
 * @lends       WiziCore_UI_SliderMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_SliderMobileWidget = AC.Widgets.WiziCore_UI_SliderMobileWidget =  AC.Widgets.WiziCore_UI_BaseMobileWidget.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple ,{
    _widgetClass: "WiziCore_UI_SliderMobileWidget",
    _slider: null,
    _div: null,
    _labelObj: null,
    _dataPropName: "value",
    _oldVal: null,

    /**
     * Description of constructor
     * @class  Some words about slider widget class
     * @author      Konstantin Khukalenko
     * @version     0.1
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        this._cnt = $('<div>');
        this.base().append(this._cnt);
        this._super.apply(this, arguments);
    },

    _redraw: function() {
        this._cnt.empty();

        var self = this;
        var htmlId = this.htmlId();

        this._div = $("<div style='padding: 5px; min-width:230px;'/>");
        this._div.attr("id", htmlId);

        this._slider = $('<input data-role="slider" type="number" value="' + this.value() + '" min="' + this.min() + '" max="' + this.max() + '"/>');
        this._slider.attr("id", 'slider' + htmlId);

        if (this.step() != undefined)
            this._slider.attr("step", this.step());

        this._div.append(this._slider);
        this._cnt.prepend(this._div);

        this._slider.bind("change", {self: self}, self.onSlide);
        this._slider.bind("blur", {self: self}, self.onChange);
        this._slider.bind("keydown", {self: self}, function(ev) {
            (ev.keyCode === 13) ? self.onChange(ev) : null;
        });
        this._super.apply(this, arguments);

        this._div.bind("resize", {self: self}, self._updateSlider);
        var options = this._getJQMOptions();
        options.highlight = this.activeStateBg();
        this._slider.mobileSlider(options);
        var base = this.base();
        var slider = base.find(".m-ui-slider");
        this._updateEnable();
//        slider.unbind("slide").bind("slide", {self: self}, function(ev){
//            debugger;
//        });
        slider.unbind("mousedown.custom").bind("mousedown.custom", {self: self}, self.onStart);
        slider.unbind("touchstart.custom").bind("touchstart.custom", {self: self}, self.onStart);
    },

    onDestroy: function() {
        if (this._slider) {
            this._slider.unbind();
            var slider = this.base().find(".ui-slider");
            slider.unbind();
        }
        var htmlid = this.htmlId();
        $(document).unbind("mouseup." + htmlid);
        $(document).unbind("touchend." + htmlid);
    },

    initProps: function() {
        this._super();
        this.name = this.normalProperty('name');

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.isUnique = this.normalProperty('isUnique');

        this.enable = this.htmlProperty('enable', this._enable);
        this.visible = this.htmlProperty('visible', this._visible);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.activeStateBg = this.themeProperty('activeStateBg', this._redraw);

        this.max = this.checkedPropTemplate('max');
        this.min = this.checkedPropTemplate('min');
        this.step = this.htmlProperty('step', this._step);
        this.value = this.htmlProperty('mobileSliderValue', this._value);

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalProperty('filter');
        this.resetfilter = this.normalProperty('resetfilter');
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');
    },

    /**
     * @return returns undefined if values is ok, else return new values
     */
    checkProps: function(props) {
        var min = props['min'];
        var max = props['max'];
        var values = props['value'];

        var newValues = ($.isArray(values)) ? [values[0], values[1]]: values;
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
            return isNaN(value) ? min: Math.min(max, Math.max(min, value));
        };
        var isInRange = function(min, max, value) {
            return (value >= min) && (value <= max);
        };

        if (!$.isArray(newValues)) {
            newValues = [newValues];
            changedValues = true;
        }
        if (!isInRange(min, max, newValues[0])) {
            newValues = normalize(min, max, newValues[0]);
            changedValues = true;
        }

        var newProps = {};
        if (changedValues) {
            newProps['values'] = newValues;
        }
        if (changedMinMax) {
            newProps['min'] = min;
            newProps['max'] = max;
        }

        return (changedValues || changedMinMax) ? newProps: undefined;
    },

    checkedPropTemplate: function(prop) {
        return function(value) {
            if (value !== undefined) {
                //setter
                var propsToCheckList = ['max', 'min'];
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
                        }
                    }
                }
            }
            return this._project[prop];
        };
    },

    _updateLayout: function(){
        this._super();
        this._updateSlider();
    },

    _shadow: function(val){
        this._super(val, this._slider);
    },

    _updateSlider: function(ev){
        var self = this;
        if (ev != undefined){
            self = ev.data.self;
        }
        if (self._div && self._div.find('.m-ui-slider').length > 0){
            var sliderWidth = Math.floor((self._div.width() - self._slider.width()*1.5 - 20 - (self._div.width() * 0.02)) / self._div.width() * 100);
            self._div.find('.m-ui-slider').css({'width': sliderWidth + '%'});
        }
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();

        this._max(this.max());
        this._min(this.min());


        this._visible(this.visible());
        this._opacity(this.opacity());
//        this._label(this.label());
//        this._labelDisabled(this.labelDisabled());
        this._value(this.value());
    },

    onPageDrawn: function() {
//        this._slider = this._getHtmlElemById('slider' + this.htmlId());

        this._super.apply(this, arguments);
        this._updateSlider();
        this._tabindex(this.tabindex());
    },

    _enable: function(flag) {
        if (!this._slider)
            return;

        if (this._slider.data("mobileSlider")){
            if (flag)
                this._slider.mobileSlider('enable');
            else {
                this._slider.mobileSlider('disable');
            }
        }
    },

    /**
     * On onStart event
     */
    onChange: function(ev, ui) {
        var self = ev.data.self;
        if (!self.enable()){
            return;
        }
        var triggerEvent = new jQuery.Event(WiziCore_UI_SliderMobileWidget.onChange);
        var oldVal = self._oldVal;
        var val = self._slider.val();
        self._project['mobileSliderValue'] = val;
        self._oldVal = val;
        $(self).trigger(triggerEvent, [val, oldVal]);
    },

    onStart: function(ev){
        var self = ev.data.self;
        if (!self.enable()){
            return;
        }
        var htmlid = self.htmlId();
        $(document).unbind("mouseup." + htmlid).bind("mouseup." + htmlid, {self: self}, self.onStop);
        $(document).unbind("touchend." + htmlid).bind("touchend." + htmlid, {self: self}, self.onStop);
        var triggerEvent = new jQuery.Event(WiziCore_UI_SliderMobileWidget.onStart);
        var val = self._slider.val();
        $(self).trigger(triggerEvent, [val]);
    },

    onStop: function(ev){
        var self = ev.data.self;
        if (!self.enable()){
            return;
        }
        var htmlid = self.htmlId();
        $(document).unbind("mouseup." + htmlid);
        $(document).unbind("touchend." + htmlid);
        var triggerEvent = new jQuery.Event(WiziCore_UI_SliderMobileWidget.onStop);
        var val = self._slider.val();
        $(self).trigger(triggerEvent, [val]);
        self.onChange(ev);
    },

    onSlide: function(ev){
        var self = ev.data.self;
        if (!self.enable()){
            return;
        }
        var triggerEvent = new jQuery.Event(WiziCore_UI_SliderMobileWidget.onSlide);
        var val = self._slider.val();
        $(self).trigger(triggerEvent, [val]);
    },

    _label: function(text) {
        this._labelObj.text(text);
    },

    _enable: function(val){
        if (this._slider){
            val = (val === true) ? "enable" : "disable";
            this._slider.data("mobileSlider") && this._slider.mobileSlider(val);
        }
    },

    reDraw: function(){
        if (this._slider){
            this._slider.data("mobileSlider") && this._slider.mobileSlider("refresh");
        }
    },

    _max: function(val) {
        if (this._isDrawn) {
            this._slider.attr("max", val);
            this.reDraw();
        }
    },

    _step: function(val) {
        if (this._isDrawn && val) {
            this._slider.attr("step", val);
            this.reDraw();
        }
    },

    _min: function(val) {
        if (this._isDrawn) {
            this._slider.attr("min", val);
            this.reDraw();
        }
    },

    _value: function(val) {
        if (this._isDrawn) {
            this._slider.val(val);
            this.reDraw();
        }
    },

    transData: function(data) {
        var val = [];
        val = this.transDataFromQuery(data, ["valueuid"]);

        if (val[0] != undefined) {
            this.value(val[0]);
        }
    },

    collectDataSchema: function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        return this._simpleDataSchema(dataSchema);
    },

    getDataModel: function() {
        return [
            {name: "value", value: "", uid: "valueuid"}
        ];
    },

    _tabindex: function(value) {
        this._super(value, this.base().find('input, a'));
    },

    _tabStop: function(val) {
        this._super(val, this.base().find('input, a'));
    },

    setFocus: function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this.base().find('input').focus();
        }
    },

    isBindableToData: function() {
        return true;
    }
}));

var _props = [
    { name: AC.Property.group_names.general, props: [
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.max,
        AC.Property.general.min,
        {name: "step", type : "_1to500", get: "step", set: "step", alias: "widget_step"},
        AC.Property.general.mobileSliderValue
    ]},
    { name: AC.Property.group_names.database, props: [
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.isUnique
    ]},
    { name: AC.Property.group_names.layout, props: [
        AC.Property.layout.pWidthHidden,
        AC.Property.layout.widthHidden,
        AC.Property.layout.heightHidden,
        AC.Property.layout.sizes,
        AC.Property.layout.minWidth,
        AC.Property.layout.maxWidth,
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.zindex,
        AC.Property.layout.tabindex,
        AC.Property.layout.tabStop,
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
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.margin,
        {name: "activeStateBg", type : "color", get: "activeStateBg", set: "activeStateBg", alias: "widget_slider_active_state"},
        AC.Property.style.mobileTheme,
        AC.Property.general.displayHourglassOver,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_SliderMobileWidget.props = function() {
    return _props;
};

WiziCore_UI_SliderMobileWidget.onChange = "E#Mobile#onChange";
WiziCore_UI_SliderMobileWidget.onStop = "E#Mobile#onStop";
WiziCore_UI_SliderMobileWidget.onStart = "E#Mobile#onStart";
WiziCore_UI_SliderMobileWidget.onSlide = "E#Mobile#onSlide";

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderMobileWidget.emptyProps = function() {
    return {};
};
/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_SliderMobileWidget.actions = function() {
    var ret = {
        onChange: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_SliderMobileWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        onStop: {alias: "widget_event_onstop", funcview: "onStop", action: "AC.Widgets.WiziCore_UI_SliderMobileWidget.onStop", params: "value", group: "widget_event_general"},
        onStart: {alias: "widget_event_onstart", funcview: "onStart", action: "AC.Widgets.WiziCore_UI_SliderMobileWidget.onStart", params: "value", group: "widget_event_general"},
        onSlide: {alias: "widget_event_onslide", funcview: "onSlide", action: "AC.Widgets.WiziCore_UI_SliderMobileWidget.onSlide", params: "value", group: "widget_event_general"}
    };
    ret = $.extend({}, AC.Widgets.Base.actions(), ret);
    WiziCore_UI_SliderMobileWidget.actions = function() {return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderMobileWidget.defaultProps = function() {
    return {
        valName: "currVal",
        width: 240,
        height: 32,
        x: "100",
        y: "50",
        zindex: "auto",
        anchors: {left: true, top: true, bottom: false, right: false},
        enable: true,
        visible: true,
        max: 100,
        min: 0,
        widgetStyle: "default", displayHourglassOver: "inherit",
        name: "mobileSlider1",
        opacity: 1,
        customCssClasses: "",
        mobileSliderValue: 10,
        dragAndDrop: false, resizing: false,
        label: "Label",
        alignInContainer: 'left',
        mobileTheme: 'c'
    };
};

/**
 * Return widget resize properties
 * @return {Object} default properties
 */
//WiziCore_UI_SliderMobileWidget.resizeProperties = function() {
//    return {handles: "e"};
//};

WiziCore_UI_SliderMobileWidget.isField = function() {
    return true;
};

})(jQuery,window,document);