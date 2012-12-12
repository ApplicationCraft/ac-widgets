/**
 * @lends       WiziCore_UI_CheckBoxGroupMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_CheckBoxGroupMobileWidget = AC.Widgets.WiziCore_UI_CheckBoxGroupMobileWidget = AC.Widgets.WiziCore_UI_BaseMobileWidget.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationList, WiziCore_Source_Widget_PagingAPI,{
    _widgetClass: "WiziCore_UI_CheckBoxGroupMobileWidget",
    _div: null,
    _mainCnt: null,
    _labelObj: null,
    _dataPropName: "data",
    _fieldset: null,

    /**
     * Description of constructor
     * @author      Konstantin Khukalenko
     * @version     0.1
     *
     */
    init: function() {
        this._super.apply(this, arguments);

        if (!("selectedIndices" in this._project)) {
            this._project["selectedIndices"] = {};
        }
    },

    draw: function() {
        this._mainCnt = $("<div style='width:100%; height:100%'></div>");

        this.base().append(this._mainCnt);
        this._super.apply(this, arguments);
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
                this._project["selectedIndices"] = {};
            }
        }
        data = (data === null) ? [] : data; //drop data if null
        return this.htmlPropertyBeforeSetAfterGet('data', this._beforeData, this._data, this._afterGet).call(this, data);
    },

    _removeFieldContain: function() {
        this._div.empty().remove();
    },

    _data: function(val) {
        this._redraw();
    },

    _dataRedraw: function(val) {
        this.removeEvent(WiziCore_UI_CheckBoxGroupMobileWidget.onChange);
        this.removeEvent(AC.Widgets.WiziCore_Widget_Base.onClick);
        var self = this;
        if (this._div) {
            this._removeFieldContain();
        }

        this._div = $("<div></div>");
        this._div.attr("id", this.htmlId());
        this._fieldset = $('<div data-role="controlgroup" style="width:100%"/>');

        if (val){
            var i = 0, l = val.length;
            if (this._isDataManual != undefined){
                var res = this._getStartAndLength(l);
                i = res.i;
                l = res.l;
            }
            for (;i < l; i++) {
                var eltValue = WiziCore_Helper.escapeHTMLtags("" + val[i][1]);
                var eltId = this.htmlId() + i;
                var input = $('<input type="checkbox" id="' + eltId + '" name="' + eltId + '"/>');
                input.attr("data-value", eltValue);
                input.attr("data-index", i);

                var trVal = WiziCore_Helper.isLngToken(val[i][0]) ? this._getTranslatedValue(val[i][0]) : val[i][0];
                var label = $('<label for="' + eltId + '">' + this.checkEmptyLabel(trVal) + ' </label>');
                this._fieldset.append(input);
                this._fieldset.append(label);
            }
        }

        this._div.append(this._fieldset);
        this._mainCnt.append(this._div);
        this.addEvent(WiziCore_UI_CheckBoxGroupMobileWidget.onChange);
        this.addEvent(AC.Widgets.WiziCore_Widget_Base.onClick);
    },

    _redraw: function() {
        if (!this._mainCnt)
            return;

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;
        this._dataRedraw(this._project['data']);
        this._selectItemsByIndexesSet();
        var o = this._getJQMOptions();
        o.excludeInvisible = false;
        this._fieldset.find("input").checkboxradio(o);
        this._fieldset.controlgroup(o);
        this._updateEnable();
        jQuery.fn.__useTr = trState;
    },

    _shadow: function(val){
        this._super(val, this._fieldset);
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    addEvent: function(event) {
        var self = this;
        switch (event) {
            case WiziCore_UI_CheckBoxGroupMobileWidget.onChange:
                this._mainCnt.find('input').bind("change.ac", {self: this}, this.onChange);
                break;
            case AC.Widgets.WiziCore_Widget_Base.onClick:
                this._mainCnt.find('input').bind("click.ac", function(ev) {
                    self.onClick(ev);
                });
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
    removeEvent: function(event) {
        switch (event) {
            case WiziCore_UI_CheckBoxGroupMobileWidget.onChange:
                    if (this._mainCnt) {
                        this._mainCnt.find('input').unbind("change.ac");
                    }
                break;
            case AC.Widgets.WiziCore_Widget_Base.onClick:
                if (this._mainCnt) {
                    this._mainCnt.find('input').unbind("click.ac");
                }
                break;
            default:
                break;
        }
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

        this.currPage = this.normalPropBeforeSet('currPage', this._currPage);
        this.elementsPerPage = this.normalPropBeforeSet('elementsPerPage', this._elementsPerPage);

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

    initDomState: function() {
        this._super();
        this.initDomStatePos();

//        this._data(this.data());
        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());

    },

    value: function(val) {
        var data = this.data();
        if (data == undefined) {
            return undefined;
        }

        var dataRowsCount = data.length;

        if (val !== undefined) {
            val = (val === null) ? []: val;
            val = ($.isArray(val)) ? val: [val];
            var indexes = {};
            var values = {};
            var labels = {};

            for (var i = 0; i < val.length; ++i) {
                var currIndex = val[i].index;
                currIndex = (currIndex == undefined) ? currIndex: (currIndex);
                var currValue = val[i].value;
                var currLabel = val[i].label;
                if (currIndex != undefined) {
                    indexes[currIndex] = true;
                }
                else if (currValue != undefined) {
                    values[currValue] = true;
                }
                else if (currLabel != undefined) {
                    labels[currLabel] = true;
                }
            }

            //fill to select indexes array
            for (i = 0; i < dataRowsCount; ++i) {
                var rowData = data[i];
                var rowLabel = rowData[0];
                var rowValue = rowData[1];
                if (values[rowValue]) {
                    indexes[i] = true;
                }
                if (labels[rowLabel]) {
                    indexes[i] = true;
                }
            }

            this._project["selectedIndices"] = indexes;

            if (this._isDrawn) {
                this._selectItemsByIndexesSet();
            }
        }

        //getter
        var retVal = [];
        if (this._project["selectedIndices"]) {
            for (var index in this._project["selectedIndices"]) {
                var dataRow = data[index];
                if (dataRow != undefined && this._project["selectedIndices"][index]) {
                    retVal.push({
                        "index": index,
                        "value": dataRow[1],
                        "label": dataRow[0]
                    });
                }
            }
        }

        retVal = (retVal.length == 0) ? null : retVal;

        return retVal;
    },

    dataWithValue: function(data) {
        var i, l, propData, selectedIndices, dataRow;
        var res;
        if (data != undefined) {
            if (data.rows !== undefined) {
                propData = [];
                selectedIndices = {};
                for (i = 0, l = data.rows.length; i < l; ++i) {
                    dataRow = data.rows[i];
                    propData[i] = [dataRow.data[0], dataRow.data[1]];
                    propData[i]['userData'] = dataRow.data['userData'];
                    if (+dataRow.data[2]) {
                        selectedIndices[i] = true;
                    }
                }
                this._project["selectedIndices"] = selectedIndices;
                this._stopDropIndices = true;
                this.data(propData);
                this._stopDropIndices = false;
                if (this._isDrawn) {
                    this._selectItemsByIndexesSet();
                }
            }
        } else {
            data = this.data();
            selectedIndices = this._project["selectedIndices"];
            var newData = [];
            for (i = 0, l = data.length; i < l; ++i) {
                dataRow = data[i];
                newData[i] = [dataRow[0], dataRow[1], !!selectedIndices[i]];
                newData[i].userData = {id:i};
            }
            res = newData;
        }
        return res;
    },

    _onInitLanguage: function() {
        this.data(this._project['data']);
    },

    _onSTUpdated: function() {
        this._redraw();
    },

    _onLanguageChanged: function() {
        this._redraw();
    },

    _beforeData: function(data){
        if (!$.isArray(data)) {
            return data;
        }

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
                    hasToken = (id != null) && WiziCore_Helper.isLngToken(oldData[id][0]);
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

    multiSelect: function() {
        return true;
    },

    /*
     select items by this._project["selectedIndices"]
     */
    _selectItemsByIndexesSet : function() {
        var self = this;
        this.base().find('input[type="checkbox"]').each(function() {
            var $this = $(this);
            // this == element
            if (self._project["selectedIndices"][+$this.attr("data-index")]){
                $this.attr('checked', true);
            } else {
                $this.removeAttr("checked");
            }
            $this.data("checkboxradio") && $this.checkboxradio('refresh');
        });
    },

    onChange: function(ev, ui) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(WiziCore_UI_CheckBoxGroupMobileWidget.onChange);

        var oldVal = self.value();
        //value of the checked checkbox
        var isChecked = $(this).attr("checked");
        var index = $(this).attr("data-index");

        if (isChecked) {
            self._project["selectedIndices"][index] = true;
        } else {
            delete self._project["selectedIndices"][index];
        }

        $(self).trigger(triggerEvent, [self.value(), oldVal]);
    },

    collectDataSchema: function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var elementDataType = this.dataType() || AC.Widgets.WiziCore_Api_Form.Type.STRING;
        var name = this.name();
        var kind = AC.Widgets.WiziCore_Api_Form.Kind.OBJECT_LIST;
        var widgetDescription = {
            'label': name,
            'type': kind,
            'structure': {
                'value': {
                    'label': 'value',
                    'type': AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                    'structure': elementDataType
                },
                'label': {
                    'label': 'label',
                    'type': AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                    'structure': AC.Widgets.WiziCore_Api_Form.Type.STRING
                }
            },
            'unique': this.isUnique()
        };

        if (this.mandatory()) {
            widgetDescription['mandatory'] = true;
        }
        dataSchema[this.id()] = widgetDescription;
        return widgetDescription;
    },

    appendValueToDataObject: function(dataObject, invalidMandatoryWidgets, force) {
        if (!force && !this.isIncludedInSchema()) {
            return undefined;
        }
        var data = this.data();
        var result = {columns: ['value', 'label'], rows: []};

        for (var index in this._project["selectedIndices"]) {
            if (this._project["selectedIndices"]) {
                var dataRow = data[index];
                if (dataRow != undefined) {
                    result.rows.push({data: [dataRow[1], dataRow[0]]});
                }
            }
        }

        if (this.mandatory() && (result == null || result.rows.length == 0)) {
            invalidMandatoryWidgets[this.id()] = true;
        }

        if (result !== undefined) {
            dataObject[this.id()] = result;
        }
        return true;
    },

    setValueFromDataObject: function(dataObject, force) {
        if (!force && !this.isIncludedInSchema()) {
            return;
        }

        var value = this._getValueFromDataObject(dataObject);
        if (value === null) {
            this.resetValue();
        }
        else if (value !== undefined) {
            var listValues = {};
            var i, l;
            if (value.columns != undefined && value.rows != undefined) {
                // TODO: check order by columns
                for (i = 0, l = value.rows.length; i < l; ++i) {
                    listValues[value.rows[i].data[0]] = true;
                }
            } else if (typeof value == 'object' && 'value' in value) {
                listValues[value['value']] = true;
            } else if ($.isArray(value)) { // for old value
                for (i = 0, l = value.length; i < l; ++i) {
                    listValues[value[i]] = true;
                }
            } else {
                listValues[value] = true;
            }
            var data = this.data();
            var indices = {};
            if (data != undefined) {
                for (i = 0, l = data.length; i < l; ++i) {
                    var rowData = data[i];
                    var rowValue = rowData[1];
                    if (listValues[rowValue]) {
                        indices[i] = true;
                    }
                }
            }
            this._project["selectedIndices"] = indices;

            if (this._isDrawn) {
                this._selectItemsByIndexesSet();
            }
        }
    },

    getDataModel: function() {
        return [
            {name: "widget_label", value: "", uid: "labeluid"},
            {name: "widget_value", value: "", uid: "valueuid"}
        ];
    },

    _enable: function(val) {
        if (this._fieldset) {
            val = (val === true) ? "enable" : "disable";
            var input = this._fieldset.find("input");
            input.data("checkboxradio") && input.checkboxradio(val);
        }
    },

    _tabindex: function(value) {
        this._super(value, this.base().find('input'));
    },

    _tabStop: function(val) {
        this._super(value, this.base().find('input'));
    },

    setFocus: function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this.base().find('input').first().focus();
        }
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
    }

    /*rdbValueDataModel: function() {
        return [
            {name: "Value", value: "", uid: "value"},
            {name: "Label", value: "", uid: "label"}
        ];
    },

    isBindableToData: function() {
        return true;
    }*/
}));

var _props = [
    { name: AC.Property.group_names.general, props: [
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.elementsPerPage,
        AC.Property.general.currPage,
        AC.Property.general.dataWithValueListBox
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
WiziCore_UI_CheckBoxGroupMobileWidget.props = function() {
    return _props;
};

WiziCore_UI_CheckBoxGroupMobileWidget.onChange = "E#CheckBoxGroupMobile#onChange";

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_CheckBoxGroupMobileWidget.emptyProps = function() {
    return {};
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_CheckBoxGroupMobileWidget.actions = function() {
    var ret = {
        onChange: {alias: "widget_event_onselectionchange", funcview: "onSelectionChange", action: "AC.Widgets.WiziCore_UI_CheckBoxGroupMobileWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data"}
    };
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_CheckBoxGroupMobileWidget.defaultProps = function() {
    return {
        valName: "currVal",
        width: 150,
        height: 50,
        x: "15",
        y: "15",
        margin: "",
        zindex: "auto",
        alignInContainer: 'left',
        anchors: {left: true, top: true, bottom: false, right: false},
        enable: true,
        visible: true,
        name: "CheckBoxGroup1", displayHourglassOver: "inherit",
        customCssClasses: "",
        opacity: 1,
        dragAndDrop: false, resizing: false,
        mobileTheme: 'c',
        data: [
            ["Label", "Value", ""]
        ],
        currPage : 1,
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE
    };
};

WiziCore_UI_CheckBoxGroupMobileWidget.isField = function() {
    return true;
};


})(jQuery,window,document);