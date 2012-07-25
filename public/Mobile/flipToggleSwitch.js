/**
 * @lends       WiziCore_UI_FlipToggleSwitchMobileWidget#
 */
(function($, windows, document, undefined){

var WiziCore_UI_FlipToggleSwitchMobileWidget = AC.Widgets.WiziCore_UI_FlipToggleSwitchMobileWidget =  AC.Widgets.WiziCore_UI_BaseMobileWidget.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, {
    _widgetClass: "WiziCore_UI_FlipToggleSwitchMobileWidget",
    _slider: null,
    _div: null,
    _labelObj: null,
    _dataPropName: "checked",

    /**
     * Description of constructor
     * @author      Konstantin Khukalenko
     * @version     0.1
     *
     */
    init: function() {
        this._super.apply(this, arguments);
        if (this._project['checked'] === undefined) { // fix for default value
            this._project['checked'] = false;
        }
        this._defaultValue = this._project['checked'];
    },

    draw: function() {
        this._cnt = $('<div>');
        this.base().append(this._cnt);

        this._super.apply(this, arguments);
    },

    _redraw: function() {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;
        this._cnt.empty();
        this._div = $("<div class='flip-toggle' data-role='fieldcontain'/>");

        var htmlId = this.htmlId();

        this._slider = $('<select data-role="slider"><option value="off">' + this.labelOff() + '</option><option value="on">' + this.labelOn() + '</option></select>');
        this._slider.attr("id", 'slider' + htmlId);

//        this._labelObj = $('<label>' + this.label() + '</label>');
//        this._labelObj.attr("for", this._slider.attr("id"));

//        this._div.append(this._labelObj);
        this._div.append(this._slider);
        this._cnt.prepend(this._div);

        // do jquery mobile
        this._slider.mobileSlider(this._getJQMOptions());
        var self = this;
        this._slider.unbind("change").bind("change", function() {
            var oldVal = self.value(),
                newSliderVal = $(this).val(),
                newVal = (newSliderVal == "on");

            if (oldVal != newVal) {
                self.onChange(newSliderVal);
            }
        });
        this.base().find("a").click(function(ev){
            return false;
        }).parent().bind("mouseup", function(ev){
            self.base().click();
        });
        self._checked(self.checked());
        this._updateEnable();
        jQuery.fn.__useTr = trState;
    },

    _enable: function(val){
        if (this._slider){
            val = (val === true) ? "enable" : "disable";
            this._slider.mobileSlider(val);
        }
    },

    onPageDrawn: function() {
        var self = this;
        this._super();
        this._tabindex(this.tabindex());
    },

    destroy: function() {
        $(this._slider).unbind('change');
        this._super();
    },

    onChange: function(val) {
        var oldVal = this._project['value'];
        var boolVal = (val == "on");
        this._project['value'] = boolVal;
        this._project['checked'] = boolVal;
        var triggerEvent = new jQuery.Event(WiziCore_UI_FlipToggleSwitchMobileWidget.onChange, [boolVal, oldVal]);
        $(this).trigger(triggerEvent, [boolVal]);

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

//        this.label = this.htmlProperty('label', this._label);
//        this.labelDisabled = this.htmlProperty('labelDisabled', this._labelDisabled);

        this.checkedInt = this.htmlProperty('checked', this._checked);
        this.labelOn = this.htmlLngPropertyBeforeSet('labelOn', this._beforeLabelOn, this._labelOn);
        this.labelOff = this.htmlLngPropertyBeforeSet('labelOff', this._beforeLabelOff, this._labelOff);
        this.checked = this.value;

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

    value: function(val) {
        if (val === null) {
            val = false;
        }
        return this.checkedInt(val);
    },


    initDomState: function() {
        this._super();
        this.initDomStatePos();

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._checked(this.checked());

//        this._label(this.label());
//        this._labelDisabled(this.labelDisabled());
    },

    _checked: function(val) {
        this.base().find("option").removeAttr("selected");
        if (val) {
            this.base().find("option[value='on']").attr("selected", true);
        } else {
            this.base().find("option[value='off']").attr("selected", false);
        }
        this.refresh();
    },

    _onInitLanguage: function() {
        this.labelOn(this.labelOn());
        this.labelOff(this.labelOff());
    },

    _onSTUpdated: function() {
        this._redraw();
    },

    _onLanguageChanged: function() {
        this._redraw();
    },

    _beforeLngProp : function(val, suffix) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(val),
                token = isToken ? val : ('ac-' + this.id() + '_' + suffix);

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, val);

            return token;
        } else
            return val;
    },

    _beforeLabelOn: function(text) {
        return this._beforeLngProp(text, 'on');
    },

    _labelOn: function(text) {
        this._redraw();
    },

    _beforeLabelOff: function(text) {
        return this._beforeLngProp(text, 'off');
    },

    _labelOff: function(text) {
        this._redraw();
    },

    getDataModel: function() {
        return [
            {name: "widget_value", value: "", uid: "valueuid"}
        ];
    },

    collectDataSchema: function(dataSchema) {
        this._simpleConstDataSchema(AC.Widgets.WiziCore_Api_Form.Type.BOOLEAN, dataSchema);
    },

    _tabindex: function(value) {
        this._super(value, this.base().find('a'));
    },

    _tabStop: function(val) {
        this._super(val, this.base().find('a'));
    },

    setFocus: function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this.base().find('a').focus();
        }
    },

    refresh: function() {
        if (this._isDrawn) {
            this._slider.mobileSlider('refresh');
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
        AC.Property.general.checked,
        AC.Property.general.labelOn,
        AC.Property.general.labelOff
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
WiziCore_UI_FlipToggleSwitchMobileWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_FlipToggleSwitchMobileWidget.emptyProps = function() {
    return {};
};

WiziCore_UI_FlipToggleSwitchMobileWidget.onChange = "E#FlipToggleSwitchMobile#onChange";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_FlipToggleSwitchMobileWidget.actions = function() {
    var ret = {
        click : {alias : "widget_event_onclick", funcview : "onClick", action : "AC.Widgets.Base.onClick", params : "mouseev", group : "widget_event_mouse"},
        mouseenter : {alias : "widget_event_onmouseenter", funcview : "onMouseEnter", action : "AC.Widgets.Base.onMouseEnter", params : "mouseev", group : "widget_event_mouse"},
        mouseleave : {alias : "widget_event_onmouseleave", funcview : "onMouseLeave", action : "AC.Widgets.Base.onMouseLeave", params : "mouseev", group : "widget_event_mouse"},
        dragstart : {alias : "widget_event_ondragstart", funcview : "onDragStart", action : "AC.Widgets.Base.onDragStart", params : "", group : "widget_event_mouse"},
        dragstop : {alias : "widget_event_ondragstop", funcview : "onDragStop", action : "AC.Widgets.Base.onDragStop", params : "", group : "widget_event_mouse"},
        resizestart : {alias : "widget_event_onresizestart", funcview : "onResizeStart", action : "AC.Widgets.Base.onResizeStart", params : "", group : "widget_event_mouse"},
        resizestop : {alias : "widget_event_onresizestop", funcview : "onResizeStop", action : "AC.Widgets.Base.onResizeStop", params : "", group : "widget_event_mouse"},
        change: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_FlipToggleSwitchMobileWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"}
    };
    WiziCore_UI_FlipToggleSwitchMobileWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_FlipToggleSwitchMobileWidget.defaultProps = function() {
    return {
        valName: "currVal",
        width: 100,
        height: 40,
        x: "15",
        y: "15",
        zindex: "auto",
        anchors: {left: true, top: true, bottom: false, right: false},
        enable: true,
        visible: true,
        checked: false,
        name: "flipToggleSwitch1",
        opacity: 1,
        customCssClasses: "", displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false,
        margin: '',
        alignInContainer: 'left',
        labelOn: 'On',
        labelOff: 'Off',
        mobileTheme: 'c'
    };
};

WiziCore_UI_FlipToggleSwitchMobileWidget.isField = function() {
    return true;
};
})(jQuery,window,document);
