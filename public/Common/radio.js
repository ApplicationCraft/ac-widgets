/**
 * @lends       WiziCore_UI_RadioWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_RadioWidget = AC.Widgets.WiziCore_UI_RadioWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple ,{
    _widgetClass: "WiziCore_UI_RadioWidget",
    _input: null,
    _labelElement: null,
    _dataPropName: "checked",
    _valueDefaultPropName: 'checked',
    _div: null,
    _group: null,

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        //var div = $("<div style='position: relative'>");
        var div = $("<table style='width: 100%; height: "+ this.height() +"; float:left; border-style:none; border-spacing:0px;'>");
        if ($.browser.msie){
            div.css("border-collapse", "collapse");
        }
        var tdLeft = $("<td>").css({"width": "1px", "text-align": "center", "padding": "2px 5px"});
        var tdRight = $("<td>");
        div.append($("<tr>").append(tdLeft, tdRight));


        //div.css("position", "absolute");//for autosize property
        var tuid = "radio_" + this.id();
        var label = $('<label>');

        var input = $('<input type="radio"/>');
        input.attr("id", tuid + "_input");
        label.append(input);

        label.click(function(){
            var isDisabled = input.attr("disabled");
            if (!input.is(":checked") && (isDisabled === undefined || isDisabled === false)){
                self._checked(!input.is(":checked"));
                input.change();
            }
        });
        label.css({"vertical-align": "top"});

        this._labelElement = label;
        this._input = input;

        tdLeft.append(input);
        tdRight.append(label);

        this._div = div;
        this.base().prepend(div);

        var self = this;
        this._input.bind("change", function() {
            var name = $(this).attr("name");
            if (name != undefined) {
                $("input:radio[name="+ name +"]").trigger(WiziCore_UI_RadioWidget.onCallByNames);
            } else{
                self.onChange();
            }
        });

        this._input.bind(WiziCore_UI_RadioWidget.onCallByNames, function() {
            self.onChange();
        });
        this._super.apply(this, arguments);
    },

    _onInitLanguage: function() {
        this.label(this.label());
    },

    _onSTUpdated: function() {
        this._label(this._project['label']);
    },

    initProps: function() {
        this._super();
        this.font = this.themeProperty('font', this._font);
        this.label = this.htmlLngPropertyBeforeSet('label', this._beforeLabel, this._label);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.bg = this.themeProperty('bgColor', this._bg);

        this.radioValue = this.htmlProperty('radioValue', this._radioValue);
        //this.checked = this.htmlProperty('checked', this._checked);
        this.value = this.checked;
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.verticalAlign = this.htmlProperty('verticalAlign', this._verticalAlign);

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
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
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
        if (this._group != null) {
            this._input.attr("name", this._group);
        }
        this._tabindex(this.tabindex());
        this._verticalAlign(this.verticalAlign());
    },

    applyDataFromRequest: function (error, data) {
        if (error === false) {
            if (data != undefined && data[1] != undefined) {
                var map = this.getMap(data);
                this.label(data[1][map['labeluid']]);
                var isChecked = (data[1][map['valueuid']] !== false);
                this.checked(isChecked);
            }
        }
    },

    destroy: function() {
        if (this._input != null){
            this._input.unbind("click");    
        }
        this._super();
    },

    setFocus: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this._input.focus();
        }
    },

    onChange: function(needUpdateValue) {
        var triggerEvent = new $.Event(WiziCore_UI_RadioWidget.onChange);
        var oldVal = this.checked();
        var val = this._input.is(":checked");
        $(this).trigger(triggerEvent, [val, oldVal]);
        var isStopped = triggerEvent.isPropagationStopped();
        if (!isStopped) {
            this._project['checked'] = val;
            this.sendDrillDown();
        }
        return !triggerEvent.isPropagationStopped();
    },

    /**
     * Set name of grouping
     * it's not a property
     */
    group: function(name) {
        this._group = name;
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

    _verticalAlign: function(val){
        if (this._div){
            val = (!val || val == "center") ? "middle" : val; //by default use "center"
            this.cssClassUpdate(this._div, "vertical-align-", val);
        }
    },

    /**
     * Set value widget label
     *
     * @param {String} text     text value
     * @return          {String} return widget text value
     */
    _label: function(text) {
        var trVal = this.getTrValueAddLngAttr(text, this._labelElement);
        return this._labelElement.text(trVal);
    },

    _enable: function(flag) {
        this._super(flag, this._input);
    },

    checked: function(flag){
        var ret = this.htmlProperyTemplate(this, undefined, this._checked, 'checked', flag, false);
        if (flag == undefined && this._isDrawn && ret == undefined){
            ret = this._checked();
        }
        return ret;
    },

    _checked: function(flag) {
        var checkboxElement = this._input
        if (flag == true || flag == "checked"){
            checkboxElement.attr('checked', true);
        } else if (flag == false){
            checkboxElement.removeAttr('checked');
        }
        return checkboxElement.is(":checked");
    },
    
    _radioValue: function(val) {
        return this._input.val(val);
    },

    _tabindex: function(val) {
        this._super(val, this._input);
    },

    _tabStop: function(val) {
        this._super(val, this._input);
    },

    /*calculateHeight : function(height){
        this._super(height);
        this._updateLayout();
    },*/

    _updateLayout: function(){
        this._super();
        var h = this.height();
        this._div.height(h);
        /*this._div.width(this.width())
                .height(this.height());*/
    },

    isBindableToData: function() {
        return true;
    }

}));

WiziCore_UI_RadioWidget.onChange = "E#WiziCore_UI_RadioWidget#onChange";
WiziCore_UI_RadioWidget.onCallByNames = "E#WiziCore_UI_RadioWidget#onChangeCallByName";

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_RadioWidget.inlineEditPropName = function() {
    return "label";
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_RadioWidget.actions = function() {
    var ret = {
        onChange: {alias: "widget_event_onchange", funcview: "onChange", action: "WiziCore_UI_RadioWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_RadioWidget.actions = function(){return ret};
    return ret;
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.label,
            AC.Property.general.radioValue,
            AC.Property.general.checked
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
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_RadioWidget.props = function() {
    return _props;
};

WiziCore_UI_RadioWidget.isField = function() { return true};
/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_RadioWidget.emptyProps = function() {
    var ret = {bgColor: "", fontColor: "black", font: "normal 12px verdana"};
    return ret;
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_RadioWidget.defaultProps = function() {
    var ret = {
        pWidth: "",
        margin: "", alignInContainer: 'left',
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        x: "0",
        y: "0",
        width: "80",
        height: "16",
        zindex: "auto",
        label: "radio",
        enable: true,
        checked: true,
        opacity: 1,
        dragAndDrop: false, resizing: false,
        radioValue: "radio",
        verticalAlign: "center",
        anchors: {left: true, top: true, bottom: false, right: false},
        visible: true,
        widgetStyle: "default",
        name: "radio1"
    };
    return ret;
};
})(jQuery,window,document);