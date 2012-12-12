/**
 * @lends       WiziCore_UI_PopupListboxMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_PopupListboxMobileWidget = AC.Widgets.WiziCore_UI_PopupListboxMobileWidget =  AC.Widgets.WiziCore_UI_PopupDropdownMobileWidget.extend({
    _widgetClass: "WiziCore_UI_PopupListboxMobileWidget",
    _select: null,
    _oldVal: null,
    /**
     * Description of constructor
     * @class       Some words about popup listbox mobile widget class
     * @author      Timofey Tatarinov
     * @version     0.2
     *
     * @constructs
     */

    init: function() {
        this._super.apply(this, arguments);

        if (!("selectedIndices" in this._project)) {
            this._project["selectedIndices"] = {};
        }
    },

    onPageDrawn: function() {
        this._super.apply(this, arguments);
        this._tabindex(this.tabindex());
    },

    _data: function(val) {
        if (!this._mainCnt)
            return;

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        this.removeEvents(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);

        if (this._div != undefined) {
            this._div.empty().remove();
        }

        this._div = $('<div/>');
        var selectDivId = "selectDiv-" + this.htmlId();
        this._div.attr("id", selectDivId);

        var div = this._div;

        var selectId = this.selectElemId();
        var label = $('<label class="select">');
        label.attr("for", selectId);
        label.text(this.label());
        label.hide();
        var select = $('<select multiple="multiple"></select>');
        select.attr("name", selectId);
        select.attr("id", selectId);
        if (!WiziCore_Helper.isMobile()){
            select.append($("<option>" + this.label() + "</option>"));
        }
        this.placeholder = this.label();
        var i = 0, l = val ? val.length : 0;
        if (this._isDataManual != undefined){
            var res = this._getStartAndLength(l);
            i = res.i;
            l = res.l;
        }
        if (val){
            for (; i < l; i++) {
                var optionValue = WiziCore_Helper.escapeHTMLtags("" + val[i][1]),
                    optionText = (val[i][0] || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

                optionText = WiziCore_Helper.isLngToken(optionText) ? this._getTranslatedValue(optionText) : optionText;

                var option = $("<option>").attr({"value": i}).text("" + optionText).attr("data-index", i);
                select.append(option);
            }
        }
        div.append(label);
        div.append(select);
        this._select = select;
        this.selectOptions(this._project['selectedIndices']);
        this._mainCnt.append(this._div);

        if (this._isDrawn) {
            this._refresh();
        }

        this.addEvents(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);
        jQuery.fn.__useTr = trState;
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
            case AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange:
                var evName = (WiziCore_Helper.isMobile())? "change" : "close";
                this._select.bind(evName, {self: this}, this.onChange);
                break;

            default:
                break;
        }
    },

    /**
     * On onChange event
     */
    onChange: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new jQuery.Event(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);
        var val = [];
        var data = self.data();
        var items = self._select.val();
        items = (items == null || !$.isArray(items)) ? [] : items;
        var prev = self._oldVal;
        self._project['selectedIndices'] = {};

        if (data) {
            for (var i = 0, l = items.length; i < l; i++){
                self._project['selectedIndices'][items[i]] = true;
                val.push({value: data[items[i]][1], label: data[items[i]][0], index: items[i]});
            }
        }

        if ((val.length == 0) && (prev == null || prev.length == 0)){
            return;
        }

        if ($.isArray(prev) && (val.length == prev.length)) {
            for (var i = 0, l = val.length; i < l; i++) {
                var v = val[i],
                    p = prev[i];

                if ((v.value == p.value) && (v.label == p.label) && (v.index == p.index)) {
                    return; //if same values don't send on change
                }
            }
        }
        self._oldVal = val;
        $(self).trigger(triggerEvent, [val, prev]);
        (!triggerEvent.isPropagationStopped()) && self.sendDrillDown();
    },

    value: function(val) {
        var data = this.data();
        if (data == undefined) {
            return undefined;
        }
        var dataRowsCount = data.length;
        var i;

        if (val !== undefined) {
            val = (typeof val == "number") ? val + "" : val;
            val = (typeof val == "string") ? [{value: val}] : val;
            val = (val === null) ? [] : val;
            val = (jQuery.isArray(val)) ? val : [val];
            var indices = {};
            var values = {};
            var labels = {};

            for (i = 0; i < val.length; ++i) {
                var currIndex = val[i].index;
                currIndex = (currIndex == undefined) ? currIndex : (currIndex);
                var currValue = val[i].value;
                var currLabel = val[i].label;
                if (currIndex != undefined) {
                    indices[currIndex] = true;
                }
                else if (currValue != undefined) {
                    values[currValue] = true;
                }
                else if (currLabel != undefined) {
                    labels[currLabel] = true;
                }
            }

            for (i = 0; i < dataRowsCount; ++i) {
                var rowData = data[i];
                var rowLabel = rowData[0];
                var rowValue = rowData[1];
                if (values[rowValue]) {
                    indices[i] = true;
                }
                if (labels[rowLabel]) {
                    indices[i] = true;
                }
            }

            this.selectOptions(indices);
            this._project["selectedIndices"] = indices;
        }

        var retVal = [];
        if (this._project["selectedIndices"] != null) {
            for (i in this._project["selectedIndices"]) {
                if (!this._project["selectedIndices"][i]) {
                    continue;
                }
                var dataRow = data[i];
                if (dataRow != undefined) {
                    retVal.push({
                        "index": i,
                        "value": dataRow[1],
                        "label": dataRow[0]
                    });
                }
            }
        }
        retVal = (retVal.length == 0) ? null : retVal;

        return retVal;
    },

    multiSelect: function() {
        return true;
    },

    _tabindex: function(value) {
        this._super(value, this._btnDiv);
    },

    _tabStop: function(val) {
        this._super(val, this._btnDiv);
    },

    setFocus: function() {
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._btnDiv.focus();
        }
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
                this.data(propData);
            }
        } else {
            data = this.data();
            selectedIndices = this._project["selectedIndices"];
            var newData = [];
            if (data){
                for (i = 0, l = data.length; i < l; ++i) {
                    dataRow = data[i];
                    newData[i] = [dataRow[0], dataRow[1], !!selectedIndices[i]];
                    newData[i].userData = {id:i};
                }
            }
            res = newData;
        }
        return res;
    },

    selectOptions: function(indexes) {
        if (this._isDrawn){
            this._select.find('option')
                    .removeAttr('selected')
                    .each(function(ind, el){
                if (indexes[$(el).attr("data-index")]){
                    $(el).attr('selected', true);
                }
            });
            this._select.data("selectmenu") && this._select.selectmenu("refresh");
        }
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

        if (data){
            for (var index in this._project["selectedIndices"]) {
                if (this._project["selectedIndices"]) {
                    var dataRow = data[index];
                    if (dataRow != undefined) {
                        result.rows.push({data: [dataRow[1], dataRow[0]]});
                    }
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

    setValueFromDataObject: function(dataObject) {
        if (!this.isIncludedInSchema()) {
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
                    if (value.rows[i]['data']) {
                        listValues[value.rows[i]['data'][0]] = true;
                    } else {
                        listValues[value.rows[i][0]] = true;
                    }
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
            if (data){
                for (i = 0, l = data.length; i < l; ++i) {
                    var rowData = data[i];
                    var rowValue = rowData[1];
                    if (listValues[rowValue]) {
                        indices[i] = true;
                    }
                }
            }
            this.selectOptions(indices);
            this._project["selectedIndices"] = indices;
        }
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
});

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_PopupListboxMobileWidget.emptyProps = function() {
    return {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray",
        selectedBg: "gray", selectedFont: "normal 12px verdan", selectedColor: "silver"};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_PopupListboxMobileWidget.defaultProps = function() {
    return {valName: "selectedItems",  x: "0", y: "0", height: "45", width: "150", zindex: "auto", enable: true,
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        data: [
            ["Label", "Value", ""]
        ], name: "popupListbox1", border: "",
        label : "Label",
        widgetStyle: "default",  displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false,
        alignInContainer: 'left',
        opacity: 1,
        customCssClasses: "",
        currPage : 1,
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE

    };
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_PopupListboxMobileWidget.inlineEditPropName = function() {
    return "data";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.elementsPerPage,
        AC.Property.general.currPage,
        AC.Property.general.dataWithValue,
        AC.Property.general.label
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
WiziCore_UI_PopupListboxMobileWidget.props = function() {
    return _props;
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_PopupListboxMobileWidget.actions =  AC.Widgets.WiziCore_UI_PopupDropdownMobileWidget.actions;


WiziCore_UI_PopupListboxMobileWidget.valuePropName = undefined;


WiziCore_UI_PopupListboxMobileWidget.isField = function() {
    return true;
};
})(jQuery,window,document);