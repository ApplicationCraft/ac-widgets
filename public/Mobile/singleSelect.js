/**
 * @lends       WiziCore_UI_SingleSelectMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_SingleSelectMobileWidget = AC.Widgets.WiziCore_UI_SingleSelectMobileWidget =  AC.Widgets.WiziCore_UI_BaseMobileWidget.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationList, WiziCore_Source_Widget_PagingAPI, {
    _widgetClass: "WiziCore_UI_SingleSelectMobileWidget",
    _div: null,
    _btnDiv: null,
    _reloadData: false,
    _lineSpaceStyle: null,
    _dataPropName: "data",


    init: function() {
        this._super.apply(this, arguments);
    },

    /**
     * Append element to DOM
     */
    draw: function() {
        this._super.apply(this, arguments);
    },

    _onInitLanguage: function() {
        this.label(this.label());
        this.data(this._project['data']);
    },

    _onSTUpdated: function() {
        this._redraw();
    },

    _onLanguageChanged: function() {
        this._redraw();
    },

    getDataFromMap: function(dataArray, map) {
        var res = [];
        for (var i = 0, l = dataArray.length; i < l; i++) {
            var row = [];
            for (var j in map) {
                var mapValue = map[j];
                if (mapValue != undefined) {
                    row[j] = AC.Widgets.Base.getDataItemWithMap(dataArray[i], mapValue);
                }
            }
            res.push(row);
        }
        return res;
    },

    initProps: function() {
        this._super();
        this.name = this.normalProperty('name');

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');

        this.enable = this.htmlProperty('enable', this._enable);
        this.visible = this.htmlProperty('visible', this._visible);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.label = this.htmlLngPropertyBeforeSet('label', this._beforeLabel, this._label);

        this.currPage = this.normalPropBeforeSet('currPage', this._currPage);
        this.elementsPerPage = this.normalPropBeforeSet('elementsPerPage', this._elementsPerPage);

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

    data: function(data) {
        if (data != undefined) {
            // convert data before process
            if (data.rows !== undefined) {
                var tempData = [];
                for (var i = 0, l = data.rows.length; i < l; ++i) {
                    tempData [i] = [data.rows[i].data[0], data.rows[i].data[1]];
                }
                data = tempData;
            }
            if (!this._stopDropIndices){
                this._project["selectedIndex"] = -1;
            }

        }
        return this.htmlPropertyBeforeSetAfterGet('data', this._beforeData, this._data, this._afterGet).call(this, data);
    },

    _beforeData: function(data){
        if (!$.isArray(data))
            return data;

        var i, l, oldData,
            form = this.form(),
            prevShowLng = form._showLngTokens,
            hasLanguage = form.language() != null;

        if (hasLanguage && !form._skipTokenCreation) {
            form._showLngTokens = true;
            oldData = this.data();
            form._showLngTokens = prevShowLng;

            for (i = 0, l = data.length; i < l; i++) {
                var id = (data[i].userData && data[i].userData.id != undefined) ? data[i].userData.id : null,
                    isValueToken = WiziCore_Helper.isLngToken(data[i][0]),
                    token, hasToken;
                if (!isValueToken) {
                    hasToken = (id != null) && oldData && WiziCore_Helper.isLngToken(oldData[id][0]);
                    if (hasToken)
                        token = oldData[id][0];
                    else
                        token = WiziCore_Helper.generateId(10, 'ac-');

                    this.form().addTokenToStringTable(this.id(), this.name(), token, data[i][0]);
                    data[i][0] = token;
                }

                if (data[i].userData != undefined)
                    data[i].userData = undefined;
            }
        }
        return data;
    },

    _afterGet: function(data) {
        var ret = WiziCore_Helper.clone(data);
        if ($.isArray(ret)) {
            for (var i = 0, l = ret.length; i < l; i++) {
                ret[i][0] = this._getTranslatedValue(ret[i][0]);
            }
        }
        return ret;
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();
//        this._data(this.data());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        //this._tabindex(this.tabindex());
    },

    _data: function(val) {
//        this._labelDisabled(this.labelDisabled());
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

    _label: function() {
        this._redraw();
    },

    _enable: function(val){
        if (this._select) {
            val = (val === true) ? "enable" : "disable";
            this._select.data("selectmenu") && this._select.selectmenu(val);
        }
    },

    _refresh: function() {
        var o = this._getJQMOptions();
        o.nativeMenu = WiziCore_Helper.isMobile();
        this._select.selectmenu(o);

        if (this._select.data('selectmenu').listbox){
            //check for desktop popup
            this._select.data('selectmenu').listbox.popup({transition: "none", theme: "a"});
        }

        this._btnDiv = WiziCore_Helper.isMobile() ? this._div.find('.m-ui-btn') : this.base().find('a');
        this._updateEnable();
        WiziCore_Helper.pageChangingHook(this.form(), this._select, this.id(), this, {disabled: true});
    },

    _shadow: function(val, div){
        this._super(val, div || this._btnDiv);
    },

    _getJQMOptions : function() {
        var options = this._super();
        if (this.placeholder) {
            options['usePlaceholder'] = this.placeholder ;
        }
        return options;
    },

    onRemove: function(){
        if (this._checkRepeatBeforeRemove()){
            return;
        }
        if (this._select) {
            var select = this._select;
            select.data("selectmenu") && select.selectmenu("close");
            $("#select-" + this.htmlId() + "-menu").parent().trigger("closed");
            select.data("selectmenu") && select.selectmenu("destroy");
        }
        WiziCore_Helper.removePageChangingHook(this.form(), this.id());
    },

    /**
     * On onChange event
     */
    onChange: function(ev, ui) {
        // TODO: need to override
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_SingleSelectMobileWidget.onChange);
        var val = 0;
        $(self).trigger(triggerEvent, [val]);
    },

    _redraw: function() {
        this._data(this._project['data']);
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    addEvents: function(event) {
        if (this._select == null) {
            return;
        }

        switch (event) {
            case WiziCore_UI_SingleSelectMobileWidget.onChange:
                var evName = (WiziCore_Helper.isMobile())? "change": "close";
                this._select.bind(evName, {self: this}, this.onChange);
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
    removeEvents: function(event, force) {
        if (this._select == null) {
            return;
        }
        var self = this;
        switch (event) {
            case WiziCore_UI_SingleSelectMobileWidget.onChange:
                this._select.unbind("change", this.onChange);
                break;

            default:
                break;
        }
    },

    getDataModel: function() {
        return [
            {name: "widget_label", value: "", uid: "labeluid"},
            {name: "widget_value", value: "", uid: "valueuid"}
        ];
    },

    /**
     * Only for single select widgets for multy select must be overwritten
     * @param data
     */
    dataWithValue: function(data) {
        var i, l, propData, selectedIndex, dataRow;
        var res;
        if (data != undefined) {
            if (data.rows !== undefined) {
                propData = [];
                selectedIndex = -1;
                for (i = 0, l = data.rows.length; i < l; ++i) {
                    dataRow = data.rows[i];
                    propData[i] = [dataRow.data[0], dataRow.data[1]];
                    propData[i]['userData'] = dataRow.data['userData'];
                    if (+dataRow.data[2] && (selectedIndex == -1)) {
                        selectedIndex = i;
                    }
                }
                this._project["selectedIndex"] = selectedIndex;
                this._stopDropIndices = true;
                this.data(propData);
                this._stopDropIndices = false;
            }
        } else {
            data = this.data();
            selectedIndex = this._project['selectedIndex'];
            var newData = [];
            if (data){
                for (i = 0, l = data.length; i < l; ++i) {
                    dataRow = data[i];
                    newData[i] = [dataRow[0], dataRow[1], (i == selectedIndex)];
                    newData[i].userData = {id:i};
                }
            }
            res = newData;
        }
        return res;
    }

}));

    /**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_SingleSelectMobileWidget.inlineEditPropName = function() {
    return "data";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.elementsPerPage,
        AC.Property.general.currPage,
        AC.Property.general.dataWithValueRadioBox
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.isUnique,
        AC.Property.database.mandatory
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
WiziCore_UI_SingleSelectMobileWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SingleSelectMobileWidget.emptyProps = function() {
    return {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray",
        selectedBg: "gray", selectedFont: "normal 12px verdan", selectedColor: "silver"};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SingleSelectMobileWidget.defaultProps = function() {
    return {valName: "selectedItems",  x: "0", y: "0", height: "120", width: "150", zindex: "auto", enable: true,
        margin: "", alignInContainer: 'left', pWidth: "",
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        data: [
            ["Label", "Value", true]
        ], name: "popupDropdown", border: "",
        label : "Label",
        selectedIndex: 0,
        labelDisabled: false, displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false,
        widgetStyle: "default",
        customCssClasses: "",
        currPage : 1,
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE

    };
};

WiziCore_UI_SingleSelectMobileWidget.onSelectValue = "E#SingleSelectMobile#onSelectValue";
WiziCore_UI_SingleSelectMobileWidget.onChange = "E#SingleSelectMobile#onChange";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_SingleSelectMobileWidget.actions = function() {
    return {
        'onChange': {alias: "widget_event_onselectionchange", funcview: "onSelectionChange", action: "AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        'dataLoaded': {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data"}
    };
    //ret = jQuery.extend(AC.Widgets.Base.actions(), ret);
};

WiziCore_UI_SingleSelectMobileWidget.valuePropName = undefined;



WiziCore_UI_SingleSelectMobileWidget.isField = function() {
    return true;
};

})(jQuery,window,document);