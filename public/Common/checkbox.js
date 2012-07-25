    /**
 * @lends       WiziCore_UI_CheckBoxWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_CheckBoxWidget = AC.Widgets.WiziCore_UI_CheckBoxWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationCheckbox, {
    _widgetClass: "WiziCore_UI_CheckBoxWidget",
    _input: null,
    _labelEl: null,
    _div: null,
    _dataPropName: "checked",
    _valueDefaultPropName: 'checked',

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.1
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        var div = $("<table style='width: 100%; height: " + this.height() + "; float: left; border-style:none; border-spacing:0px;'>");
        if (jQuery.browser.msie){
            div.css("border-collapse", "collapse");
        }
        var tdLeft = $("<td>").css({"width": "1px", "text-align": "center", "padding": "2px 5px"});
        var tdRight = $("<td>");
        div.append($("<tr>").append(tdLeft, tdRight));
        
//        div.css("position", "absolute");//for autosize property
        var tuid = "checkbox_" + this.id();
        div.attr("id", tuid);

        var input = $('<input type="checkbox"/>');
        var self = this;
        input.attr("id", tuid + "_ch");

        var label = $('<label>');
        label.click(function(){
            var isDisabled = input.attr("disabled");
            if (isDisabled === undefined || isDisabled === false){
                self._checked(!input.is(":checked"));
                input.change();
            }
        });

        this._input = input;
        this._labelEl = label;

        tdLeft.append(input);
        tdRight.append(label);

        this._div = div;
        this.base().prepend(div);

        this.bindEvent(WiziCore_UI_CheckBoxWidget.onChange);

        this._super.apply(this, arguments);
    },

    _onSTUpdated: function() {
        this._label(this._project['label']);
    },

    _onInitLanguage: function() {
        this.label(this.label());
    },

    initProps: function() {
        this._super();

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');

        this.font = this.themeProperty('font', this._font);
        this.label = this.htmlLngPropertyBeforeSet('label', this._beforeLabel, this._label);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.bg = this.themeProperty('bgColor', this._bg);

        this.checked = this.htmlProperty('checked', this._checked);
        this.value = this.checked;
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.verticalAlign = this.htmlProperty('verticalAlign', this._verticalAlign);

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.resetfilter = this.normalProperty('resetfilter');
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();
        this._bg(this.bg());
        this._fontColor(this.fontColor());
        this._font(this.font());
        this._label(this._project['label']);
        this._checked(this.checked());
        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());
        this._verticalAlign(this.verticalAlign());
    },


    bindEvent: function(event) {
        this._super(event);
        if (this._bindingEvents[event] > 1 || this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            return;
        }
        var self = this;
        switch (event) {
            case WiziCore_UI_CheckBoxWidget.onChange:
                $(self._input).bind("change", {self : self}, function(ev) {
                    return self.onChange(ev);
                });
                break;
        }
    },

    unbindEvent: function(event, force) {
        this._super(event, force);
        if (this._bindingEvents[event] > 0 && force != true) {
            return;
        }

        var self = this;
        switch (event) {
            case WiziCore_UI_CheckBoxWidget.onChange:
                    $(self._input).unbind("change");
                break;
        }
    },

    setFocus: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.focus();
        }
    },

    _verticalAlign: function(val){
        if (this._div){
            val = (!val || val == "center") ? "middle" : val; //by default use "center"
            this.cssClassUpdate(this._div, "vertical-align-", val);
        }
    },

    _tabindex: function(value) {
        this._super(value, this._input);
    },

    _tabStop: function(value) {
        this._super(value, this._input);
    },

    onChange: function(ev) {
        var self = ev.data.self;
        var oldValue = self.checked();
        var newValue = self._input.is(":checked");

        var triggerEvent = new jQuery.Event(WiziCore_UI_CheckBoxWidget.onChange);
        $(self).trigger(triggerEvent, [newValue, oldValue]);
        var isStopped = triggerEvent.isPropagationStopped();
        if (!isStopped) {
            self._project['checked'] = newValue;
        }
        return !triggerEvent.isPropagationStopped();
    },

    destroy: function() {
        try{
            this._input.unbind("click");
        }
        catch(e) {}
        this._super();
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

    /**
     * Set value widget label
     *
     * @param {String} text     text value
     */
    _label: function(text) {
        var res = this.getTrValueAddLngAttr(text, this._labelEl);
        this._labelEl.text(res);
    },

    _enable: function(flag) {
        this._super(flag, this._input);
    },

    _checked: function(flag) {
        var checkboxElement = this._input;

        if (flag  || flag == "checked"){
            checkboxElement.attr('checked', true);
        } else if (!flag){
            checkboxElement.removeAttr('checked');
        }
        return checkboxElement.is(":checked");
    },

    radioValue: function(val) {
        return this._input.val(val);
    },

    calculateHeight : function(height){
        this._super(height);
        if (this._isDrawn){
            var h = this.height();
            //this._input.parent().css('width', h + "px");
        }
    },

    _updateLayout: function(){
        this._super();
        var h = this.height();
        this._div.height(h);
        if ($.browser.msie) {
            this.tableBase().css({'min-width': this.width(), width: ''});
        }
    },

    collectDataSchema: function(dataSchema) {
        this._simpleConstDataSchema(AC.Widgets.WiziCore_Api_Form.Type.BOOLEAN, dataSchema);
    },

    appendValueToDataObject: function(dataObject, invalidMandatoryWidgets, force) {
        var self = this;
        return this._simpleDataObjectValue(dataObject, force, function(value) {
            if (self.mandatory()) {
                var isUnchanged = (self._defaultValue == value);
                if (isUnchanged) {
                    invalidMandatoryWidgets[self.id()] = true;
                }
                value = ((isUnchanged) ? null : value);
            }
            return value;
        });
    },

    isBindableToData: function() {
        return true;
    }
}));

WiziCore_UI_CheckBoxWidget.onChange = "E#CheckBox#onClick";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_CheckBoxWidget.actions = function() {
    var ret = {
        click: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_CheckBoxWidget.onChange", params: "newValue, oldValue", group: "widget_event_mouse"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    ret = jQuery.extend(AC.Widgets.Base.actions(), ret);

    return ret;
};

WiziCore_UI_CheckBoxWidget._props = [{ name: AC.Property.group_names.general, props:[
                AC.Property.general.widgetClass,
                AC.Property.general.name,
                AC.Property.general.label,
                AC.Property.general.radioValue,
                AC.Property.general.checked
            ]},
        { name: AC.Property.group_names.database, props:[
                AC.Property.database.isIncludedInSchema,
                AC.Property.database.isUnique,
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
                AC.Property.style.font,
                AC.Property.style.fontColor,
                AC.Property.style.margin,
                AC.Property.style.bgColor,
                AC.Property.general.displayHourglassOver,
                AC.Property.general.hourglassImage,
                AC.Property.style.verticalAlignCenter,
                AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
            ]}
    ] ;
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_CheckBoxWidget.props = function() {
    return WiziCore_UI_CheckBoxWidget._props;
};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_CheckBoxWidget.emptyProps = function() {
    var ret = {bgColor: "", fontColor: "black", font: "normal 12px verdana"};
    return ret;
};
/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_CheckBoxWidget.inlineEditPropName = function() {
    return "label";
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_CheckBoxWidget.defaultProps = function() {
    var ret = {
        pWidth: "",
        margin: "", alignInContainer: 'left',
        x: "0",
        y: "0",
        width: "80",
        height: "16",
        zindex: "auto",
        label: "checkBox",
        enable: true,
        checked: false,
        radioValue: 'checkBox',
        name:"checkbox1",
        verticalAlign: "center",
        anchors: {
            left: true,
            top: true,
            bottom: false,
            right: false
        },
        visible: true,
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        opacity: 1,
        widgetStyle: "default",
        dragAndDrop: false,
        resizing: false,
        tabStop: true
    };
    return ret;
};
WiziCore_UI_CheckBoxWidget.isField = function() {return true};
})(jQuery,window,document);