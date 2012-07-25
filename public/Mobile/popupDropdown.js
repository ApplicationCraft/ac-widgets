/**
 * @lends       WiziCore_UI_PopupDropdownMobileWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_PopupDropdownMobileWidget = AC.Widgets.WiziCore_UI_PopupDropdownMobileWidget =  AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.extend({
    _widgetClass: "WiziCore_UI_PopupDropdownMobileWidget",
    _oldVal: null,
    _selected: false,

    /**
     * Description of constructor
     * @class       Some words about popup dropdown mobile widget class
     * @author      Timofey Tatarinov
     * @version     0.2
     *
     * @constructs
     */

    init: function(){
        this._super.apply(this, arguments);
        this._project["selectedIndex"] = (this._project["selectedIndex"] != undefined) ? this._project["selectedIndex"] : -1 ;
        var data = this._project['data'],
            selectedIndex = this._project["selectedIndex"];
        this._defaultData = data;
        if (data && data[selectedIndex]) {
            this._defaultValue = data[selectedIndex][1];
        }
    },

    draw: function() {
        this._mainCnt = $("<div style='width:100%; height:100%'></div>");

        this.base().append(this._mainCnt);
        this._super.apply(this, arguments);

        if (!("selectedIndex" in this._project)) {
            this._project["selectedIndex"] = -1;
        } if (this._project['selectedIndex'] != -1 && this._project['selectedIndex'] != null) {
            this._selected = true;
        }
    },

    selectElemId: function() {
        return "select-" + this.htmlId();
    },

    _data: function(val) {

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        this.removeEvents(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);

        if (this._div != undefined) {
            this._div.empty();
            this._div.remove();
        }

        this._div = $('<div/>');
        var selectDivId = "selectDiv-" + this.htmlId();
        this._div.attr("id", selectDivId);
        var label = $('<label class="select" for="' + selectId + '"></label>'),
            div = this._div,
            selectId = this.selectElemId(),
            select = $('<select name="' + selectId + '" id="' + selectId + '"/>'),
            i = 0, l = val ? val.length : 0;

        select.data('native-menu', WiziCore_Helper.isMobile());
        if (this._isDataManual != undefined){
            var res = this._getStartAndLength(l);
            i = res.i;
            l = res.l;
        }
        if (val){
            for (; i < l; ++i) {
                var optionText = (val[i][0]) ? val[i][0].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : "";
                if (optionText == "" || optionText == " "){
                    optionText = "&nbsp;"
                }
                optionText = WiziCore_Helper.isLngToken(optionText) ? this._getTranslatedValue(optionText) : optionText;

                var o = $("<option>").attr({"value": i}).html("" + optionText);
                select.append(o);
            }
        }
        this._select = select;
        this.selectOption(this._project['selectedIndex']);
        div.append(label);
        div.append(select);

        this.addEvents(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);

        this._mainCnt.append(this._div);

        if (this._isDrawn) {
            this._refresh();
        }
        this._super();
        jQuery.fn.__useTr = trState;
    },
    
    //TODO: fix bug 3743: on android brouser not refresh DOM, then change style - select work not correct
    _visible : function(value){
        this._super.apply(this, arguments);
        if (value !== false && WiziCore_Helper.isAndroid()){
            var div = document.createElement('div');
            div.setAttribute("style", "width:0px;height:0px;");
            div.innerHTML = "&nbsp;";
            document.body.appendChild(div);
            setTimeout(function(){
                document.body.removeChild(div);
            }, 100);
        }
    },
    //TODO: end fix

    onPageDrawn: function() {
        this._super.apply(this, arguments);
        this._tabindex(this.tabindex());
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


    /**
     * On onChange event
     */
    onChange: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new $.Event(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);
        var pos = self._select.val();
        var data = self.data();
        var prev = self._oldVal;
        var val = (pos != null && data) ? {label: data[pos][0], value: data[pos][1], index: pos}: null;
        if (val && prev && (val.label == prev.label)
            && (val.value == prev.value)
            && (val.index == prev.index)){
            return; //same as old val
        }
        self._oldVal = val;
        self._project['selectedIndex'] = pos;
        self._selected = true;
        $(self).trigger(triggerEvent, [val, prev]);
        if (!triggerEvent.isPropagationStopped()) {
            self.sendDrillDown();
        }
    },

    selectOption: function(ind){
        if (this._select && ind > 0){
            this._selected = true;
            this._select.children().eq(ind).attr("selected", "selected");
        }
    },

    getIndexByValue: function(val){
        var data = this.data(),
            index = null;
        if (data && data.length > 0){
            for (var i = 0, l = data.length; i < l; i++){
                var comboRowValue = data[i][1];
                if (comboRowValue == val) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    },

    getIndexByLabel: function(label) {
        var index = null,
            dataRows = this.data();
        if (dataRows != undefined) {
            var dataRowsLength = dataRows.length;
            for (var i = 0; i < dataRowsLength; ++i) {
                var comboRowLabel = dataRows[i][0];
                if (comboRowLabel == label) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    },

    _applyValue: function(val){
        if (typeof val == "string"){
            val = {value: val};
        }
        if (val === null) {
            val = {index: -1};
        }

        var index = val.index;
        var value = val.value;
        var label = val.label;

        var data = this.data();
        if (data == undefined) {
            return;
        }
        var dataRowsLength = (data != undefined) ? data.length : 0;
        if (index != undefined && (index >= dataRowsLength || index < -1)) {
            index = -1;
        }

        if (index == undefined && value != undefined) {
            var valueIndex = this.getIndexByValue(value);
            index = (valueIndex != null) ? valueIndex : index;
        }

        if (index == undefined && label != undefined) {
            var labelIndex = this.getIndexByLabel(label);
            index = (labelIndex != null) ? labelIndex : index;
        }

        if (index != undefined) {
            this._selected = true;
            this._project["selectedIndex"] = index;
            this._oldVal = (index != null && data) ? {label: data[index][0], value: data[index][1], index: index}: null
            if (this._isDrawn) {
                if (index == -1) {
                    //this._comboBox.setComboText("");
                }
                this._data(this._project['data']);
            }
        }

    },

    value: function(val) {
        if (val === null) { //restore default
            val = this._defaultValue;
        }
        val = (typeof val == "number") ? val + "" : val;
        if (val !== undefined && (typeof val == "object" || typeof val == "string")) {
            this._applyValue(val);
        }
        var retVal = {index: null, value: null, label: null},
            index = this._project["selectedIndex"],
            data = this.data();

        if (index == -1 || index == null) {
            index = 0;
        }

        if (data != undefined && this._selected) {
            var selectedRow = data[index];
            if (selectedRow != undefined) {
                retVal.index = index;
                retVal.value = selectedRow[1];
                retVal.label = selectedRow[0];
            }
        }
        return retVal;
    },

//    _beforeLabel: function(text) {
//        if (this.form().language() != null) {
//            var isToken = WiziCore_Helper.isLngToken(text),
//                token = isToken ? text : ('ac-' + this.id());
//
//            if (!isToken)
//                this.form().addTokenToStringTable(this.id(), this.name(), token, text);
//
//            return token;
//        } else
//            return text;
//    },
//
//    _label: function() {
//        (this._isDrawn) ? this._data(this._project['data']) : null;
//    },

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
            } else {
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

    getDataFromMap: function(dataArray, map) {
        var res = [];
        var length = dataArray.length;
        for (var i = 0; i < length; i++) {
            var row = {};
            for (var j in map) {
                var mapValue = map[j];
                if (mapValue != undefined) {
                    row[j] = (AC.Widgets.Base.getDataItemWithMap(dataArray[i], mapValue));
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
WiziCore_UI_PopupDropdownMobileWidget.emptyProps = function() {
    return {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray",
        selectedBg: "gray", selectedFont: "normal 12px verdan", selectedColor: "silver"};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_PopupDropdownMobileWidget.defaultProps = function() {
    return {valName: "selectedItems",  x: "0", y: "0", height: "45", width: "150", zindex: "auto", enable: true,
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        data: [
            ["Label", "Value", true]
        ], name: "popupDropdown1", border: "",
        label : "Label",
        selectedIndex: 0,  displayHourglassOver: "inherit",
        dragAndDrop: false, resizing: false,
        widgetStyle: "default",
        opacity: 1,
        currPage : 1,
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE

    };
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_PopupDropdownMobileWidget.inlineEditPropName = function() {
    return "data";
};

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_PopupDropdownMobileWidget.props = AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.props;

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_PopupDropdownMobileWidget.actions = AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.actions;


WiziCore_UI_PopupDropdownMobileWidget.valuePropName = undefined;

WiziCore_UI_PopupDropdownMobileWidget.isField = function() {
    return true;
};
})(jQuery,window,document);