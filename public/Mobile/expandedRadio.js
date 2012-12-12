/**
 * @lends       WiziCore_UI_ExpandedRadioMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_ExpandedRadioMobileWidget = AC.Widgets.WiziCore_UI_ExpandedRadioMobileWidget =  AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.extend({
    _widgetClass: "WiziCore_UI_ExpandedRadioMobileWidget",
    _radioInputs: null,
    _oldVal: null,

    /**
     * Description of constructor
     * @class       Some words about expanded area mobile widget class
     * @author      Timofey Tatarinov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._radioInputs = [];
        this._super.apply(this, arguments);

        if (!("selectedIndex" in this._project)) {
            this._project["selectedIndex"] = -1;
        }
    },

    draw: function() {
        this._mainCnt = $("<div style='width:100%; height:100%'></div>");

        this.base().append(this._mainCnt);
        this._super.apply(this, arguments);
    },

    expandedRadioId: function() {
        return "ExpandedRadio-" + this.htmlId();
    },

    getRadioIdByNum: function(num) {
        return this.expandedRadioId() + "-" + "radio-choice-" + num;
    },

    _data: function(val) {
        this._redraw();
    },

    _dataRedraw: function(val) {
        this.removeEvent(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);

        if (this._div != undefined) {
            this._div.empty().remove();
        }
        var expRadioId = this.expandedRadioId();
        var div = $('<div />');
        div.attr("id", expRadioId);
        this._div = div;

        var controlGroup = $("<div data-role='controlgroup' style='width:100%'/>");
        this._controlGroup = controlGroup;
        var firstInputName = "";
        this._radioInputs = [];
        if (val){
            var i = 0, l = val.length;
            if (this._isDataManual != undefined){
                var res = this._getStartAndLength(l);
                i = res.i;
                l = res.l;
            }
            for (; i < l; ++i) {
                var elName = (val[i][0]) ? "" + val[i][0].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : "";
                elName = WiziCore_Helper.isLngToken(elName) ? this._getTranslatedValue(elName) : elName;

                var value = WiziCore_Helper.escapeHTMLtags("" + val[i][1]);

                var num = i + 1;
                var input = $("<input>");
                var name = expRadioId + "-" + "radio-choice-" + num;
                input.attr("id", name);
                input.attr("type", "radio");
                if (i == 0) {
                    firstInputName = name;
                }
                input.attr("name", firstInputName);
                input.attr("value", value);
                input.attr("data-index", i);

                var label = $("<label>");

                label.html(this.checkEmptyLabel(elName));
                label.attr("for", name);

                controlGroup.append(input);
                controlGroup.append(label);

                this._radioInputs.push(input);
            }
        }

        this.selectOption(this._project['selectedIndex']);

        this._div.append(controlGroup);
        this._mainCnt.append(this._div);
        this.addEvent(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);
    },

    updateRadioInputs: function(radioInputs) {
        var newRadioInputsArray = [];
        for (var i = 0; i < radioInputs.length; ++i) {
            var input = this._getHtmlElemById(this.getRadioIdByNum(i + 1));
            newRadioInputsArray.push(input);
        }
        return newRadioInputsArray;
    },

    _redraw: function() {
        if (!this._mainCnt)
            return;

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;
        this._dataRedraw(this._project['data']);

        var o = this._getJQMOptions();
        o.excludeInvisible = false;
        this._controlGroup.find("input").checkboxradio(o);
        this._controlGroup.controlgroup(o);
        this._updateEnable();
        jQuery.fn.__useTr = trState;
    },

    onPageDrawn: function() {
        this._super.apply(this, arguments);
        this._tabindex(this.tabindex());
    },

    onChange: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);
        var prev = self._oldVal;
        var val = $(this).val();
        self._oldVal = val;
        self._project["selectedIndex"] = $(this).attr("data-index");
        $(self).trigger(triggerEvent, [val, prev]);
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    addEvent: function(event) {
        switch (event) {
            case AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange:
                this._mainCnt.find('input').bind("change.expRadio", {self: this}, this.onChange);
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
    removeEvent: function(event, force) {
        switch (event) {
            case AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange:
                    if (this._mainCnt) {
                        this._mainCnt.find('input').unbind("change.expRadio");
                    }
                break;

            default:
                break;
        }
    },

    getSelectedOption: function() {
        var selectedLabel = this._div.find(".m-ui-btn-active");
        var selectedOption = this._div.find("#" + selectedLabel.attr("for"));

        return {text: selectedLabel.text(), value: selectedOption.val()};
    },

    value: function(val) {
        var data = this.data();
        if (data == undefined) {
            return undefined;
        }

        var dataRowsCount = data.length;

        if (val !== undefined) {

            var currIndex = val['index'];
            currIndex = (currIndex == undefined) ? currIndex: (currIndex);
            var currValue = val['value'];
            var currLabel = val['label'];

            //fill to select indexes array
            for (i = 0; i < dataRowsCount; ++i) {
                var rowData = data[i];
                var rowLabel = rowData[0];
                var rowValue = rowData[1];
                if (currValue == rowValue) {
                    currIndex = i;
                }
                if (currLabel == rowLabel) {
                    currIndex = i;
                }
            }

            this._project["selectedIndex"] = currIndex;

            if (this._isDrawn) {
                this.selectOption(currIndex);
            }
        }

        //getter
        var retVal = null;
        var index = this._project["selectedIndex"];
        // HACK: temporary fix for index - value can't be null, first one is selected
        if (index == -1) {
            index = 0;
        }
        var dataRow = data[index];
        if (dataRow != undefined) {
            retVal = {
                "index": index,
                "value": dataRow[1],
                "label": dataRow[0]
            };
        }

        return retVal;
    },

    selectOption: function(index) {
        var inputs = this._radioInputs;
        if (inputs[index] != undefined) {
            inputs[index].attr('checked', true);
        } else if (inputs[0] != undefined) {
            inputs[0].attr('checked', true);
        }
        if (this._isDrawn) {
            var input;
            for (var i = 0, l = inputs.length; i < l; i++){
                input = $(inputs[i]);
                input.data("checkboxradio") && input.checkboxradio("refresh");
            }
        }
    },

    _shadow: function(val){
        this._super(val, this._controlGroup);
    },


    collectDataSchema: function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var elementDataType = this.dataType() || AC.Widgets.WiziCore_Api_Form.Type.STRING;
        var widgetDescription = {
            'label': this.name(),
            'type': AC.Widgets.WiziCore_Api_Form.Kind.OBJECT,
            'structure': {
                'value': {
                    'label': null,
                    'type': AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                    'structure': elementDataType
                },
                'label': {
                    'label': null,
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
        var self = this;
        return this._simpleDataObjectValue(dataObject, force, function(value) {
            if (value != null) {
                value = {
                    value: value.value,
                    label: value.label
                };
            }
            else {
                if (self.mandatory()) {
                    invalidMandatoryWidgets[self.id()] = true;
                }
            }
            return value;
        });
    },

    setValueFromDataObject: function(dataObject, force) {
        this._setDataObjectValueSimple(dataObject, function(value) {
            if (!(typeof value == 'object' && 'value' in value)) {
                value = {value: value}; // old value format
            }
            return value;
        }, force);
    },

    _enable: function(val) {
        if (this._controlGroup) {
            val = (val === true) ? "enable" : "disable";
            var inpt = this._controlGroup.find("input");
            inpt.data("checkboxradio") && inpt.checkboxradio(val);
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
});

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ExpandedRadioMobileWidget.emptyProps = function() {
    return {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray",
        selectedBg: "gray", selectedFont: "normal 12px verdan", selectedColor: "silver"};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ExpandedRadioMobileWidget.defaultProps = function() {
    return {valName: "selectedItems",  x: "0", y: "0", height: "45", width: "150", zindex: "auto", enable: true,
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        data: [
            ["Label", "Value", true]
        ], name: "RadioButtonGroup1", border: "",
        dragAndDrop: false, resizing: false,  displayHourglassOver: "inherit",
        label : "Label",
        widgetStyle: "default" , mobileTheme: 'c',
        currPage : 1, selectedIndex: 0,
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE

    };
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ExpandedRadioMobileWidget.inlineEditPropName = function() {
    return "data";
};

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ExpandedRadioMobileWidget.props = AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.props

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ExpandedRadioMobileWidget.actions = AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.actions;


WiziCore_UI_ExpandedRadioMobileWidget.valuePropName = undefined;


WiziCore_UI_ExpandedRadioMobileWidget.isField = function() {
    return true;
};

})(jQuery,window,document);