/**
 * @lends       WiziCore_UI_CheckBoxMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_CheckBoxMobileWidget = AC.Widgets.WiziCore_UI_CheckBoxMobileWidget = AC.Widgets.WiziCore_UI_BaseMobileWidget.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, {
    _widgetClass: "WiziCore_UI_CheckBoxMobileWidget",
    _input: null,
    _labelObj: null,
    _div: null,
    _dataPropName: "checked",
    _valueDefaultPropName: 'checked',

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Konstatin Khukalenko
     * @version     0.1
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        this._cnt = $('<div class="ac-m-ui-checkbox-radio-container">');
        this.base().append(this._cnt);

//        if (this._bindingEvents[AC.Widgets.Base.onClick] == 0 || this._bindingEvents[AC.Widgets.Base.onClick] == undefined) {
        //this.bindEvent(AC.Widgets.Base.onClick);
//        }

        this._super.apply(this, arguments);
    },


    _redraw: function() {
        if (!this._cnt)
            return;

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;
        this._super();
        this._cnt.empty();

        this._div = $("<div data-role='fieldcontain' />");
        var htmlId = this.htmlId();

        var input = $('<input type="checkbox" />');
        input.attr("id", htmlId + "_ch");
        input.attr("name", htmlId + "_ch");
        input.attr('checked', this.checked());
        var label = $('<label>');
        label.attr("for", input.attr("id"));

        label.text(this.checkEmptyLabel(this.label()));


        this._input = input;
        this._labelObj = label;

        this._div.append($('<legend>'));
        this._div.append(input);
        this._div.append(label);

        this._cnt.prepend(this._div);
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._input.bind("change", {self: this}, this.onChange);
            this._input.bind("vclick", {self: this}, this.onClick);
        }
        this._input.checkboxradio(this._getJQMOptions());
        this._updateEnable();
        jQuery.fn.__useTr = trState;
    },

    initProps: function() {
        this._super();
        this.name = this.normalProperty('name');

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');

        this.label = this.htmlLngPropertyBeforeSet('content', this._beforeLabel, this._redraw);

        this.enable = this.htmlProperty('enable', this._enable);
        this.checked = this.htmlProperty('checked', this._checked);
        this.value = this.checked;
        this.visible = this.htmlProperty('visible', this._visible);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);

        // data
        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalProperty('filter');
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');
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

    initDomState: function() {
        this._super();
        this.initDomStatePos();
        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());
    },

    onChange: function(ev) {
        var self = ev.data.self,
            oldVal = self.checked(),
            newValue = self._checked();
        self._project['checked'] = newValue;
        var triggerEvent = new jQuery.Event(WiziCore_UI_CheckBoxMobileWidget.onChange);
        $(self).trigger(triggerEvent, [newValue, oldVal]);
        var isStopped = triggerEvent.isPropagationStopped();
        if (isStopped) {
            self._project['checked'] = oldVal;
        } else {
            self.sendDrillDown();
        }
        return !isStopped;
    },

    onClick: function(ev) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_CheckBoxMobileWidget.onClick);
        $(this).trigger(triggerEvent);
        return !triggerEvent.isPropagationStopped();
    },

    onDestroy: function() {
        this._input && $(this._input).unbind();
    },

    _shadow: function(val){
        this._super(val, this._labelObj);
    },


    _checked: function(flag) {
        var el = this._input;
        if (flag === undefined){
            el.data("checkboxradio") && el.checkboxradio('refresh');// strange double refresh gets right value...
        }
        if (this._isDrawn && el) {
            el.attr('checked', flag);
            el.data("checkboxradio") && el.checkboxradio('refresh');
        }
        return el.is(":checked");
    },

    _enable: function(val) {
        if (this._input) {
            val = (val === true) ? "enable" : "disable";
            this._input.data("checkboxradio") && this._input.checkboxradio(val);
        }
    },

//    onPageDrawn: function() {
//        this._input.data("checkboxradio") && this._input.checkboxradio();
//    },

    _tabindex: function(val) {
        this._super(val, this._input);
    },

    _tabStop: function(val) {
        this._super(val, this._input);
    },

    setFocus: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.focus();
        }
    },

    getDataModel: function() {
        return [
            {name: "widget_label", value: "", uid: "labeluid"},
            {name: "widget_value", value: "", uid: "valueuid"}
        ];
    },

    collectDataSchema: function(dataSchema) {
        this._simpleConstDataSchema(AC.Widgets.WiziCore_Api_Form.Type.BOOLEAN, dataSchema);
    },

    isBindableToData: function() {
        return true;
    }
}));

WiziCore_UI_CheckBoxMobileWidget.onChange = "E#CheckBoxMobile#onChange";
WiziCore_UI_CheckBoxMobileWidget.onClick = "E#WCheckBoxMobile#onClick";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_CheckBoxMobileWidget.actions = function() {
    return {
//        click: {alias: "widget_event_onchange", funcview: "onChange", action: "WiziCore_UI_CheckBoxMobileWidget.onChange", params: "value", group: "widget_event_mouse"},
        onChange: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_CheckBoxMobileWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"}
    };
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.label,
        AC.Property.general.checked
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.isUnique,
        AC.Property.database.mandatoryHighlight,
        AC.Property.database.mandatory
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
        AC.Property.layout.tabindex,
        AC.Property.layout.tabStop,
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
WiziCore_UI_CheckBoxMobileWidget.props = function() {
    return _props;
};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_CheckBoxMobileWidget.emptyProps = function() {
    return {bgColor: "", fontColor: "black", font: "normal 12px verdana"};
};
/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_CheckBoxMobileWidget.inlineEditPropName = function() {
    return "label";
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_CheckBoxMobileWidget.defaultProps = function() {
    return {
        x: "0",
        y: "0",
        width: "150",
        height: "36",
        zindex: "auto",
        content: "checkBox",
        enable: true,
        checked: false,
        name:"checkbox1",
        anchors: {
            left: true,
            top: true,
            bottom: false,
            right: false
        },
        visible: true,
        opacity: 1,
        widgetStyle: "default",
        customCssClasses: "", displayHourglassOver: "inherit",
        margin: '',
        pWidth: '',
        dragAndDrop: false, resizing: false,
        alignInContainer: 'left',
        mobileTheme: "c"
    };
};
WiziCore_UI_CheckBoxMobileWidget.isField = function() {
    return true
};
/**
 * Return widget resize properties
 * @return {Object} default properties
 *//*
 WiziCore_UI_CheckBoxMobileWidget.resizeProperties = function() {
 var ret = {handles : "e, s"};
 return ret;
 };*/

WiziCore_UI_CheckBoxMobileWidget.valuePropName = 'checked';

})(jQuery,window,document);