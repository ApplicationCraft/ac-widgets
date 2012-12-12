/**
 * @lends       WiziCore_UI_ComboBoxWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_ComboBoxWidget = AC.Widgets.WiziCore_UI_ComboBoxWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationList, WiziCore_Source_Widget_PagingAPI, {
    _widgetClass: "WiziCore_UI_ComboBoxWidget",
    _comboBox: null,
    _dataPropName: "data",
    _reloadData: false,

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
        if (!("selectedIndex" in this._project)) {
            this._project["selectedIndex"] = -1;
        }
    },
    onRemove: function() {
        if (this._checkRepeatBeforeRemove()){
            return;
        }
        if (this._comboBox){
            this._comboBox.destroy();
        }
    },

    draw: function() {
        //init id
        var tuid = "comboBox_" + this.htmlId();
        var self = this;

        //init parent div
        this._comboBox = new jqSimpleCombo(this.base(), [], {readonly: true});
        $(this._comboBox)
                .unbind(jqSimpleCombo.onSelect)
                .bind(jqSimpleCombo.onSelect, function(){
                    self.onChange();
                });

        this._bg(this.bg());
        this._font(this.font());
        this._fontColor(this.fontColor());
        this._tabindex(this.tabindex());

        this._super.apply(this, arguments);
    },

    _onSTUpdated: function() {
        this._onLanguageChanged();
    },

    _onInitLanguage: function() {
        this.data(this.data());
        if (this._isDrawn) {
            this.selectOption(this.getSelectedIndex());
        }
    },

    initProps: function() {
        this._super();

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');

        this.font = this.themeProperty('font', this._font);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.bg = this.themeProperty('bgColor', this._bg);

//        this.data = this.htmlProperty('data', this._data);

        this.shadow = this.themeProperty('shadow', this._shadow);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);

        this.currPage = this.normalPropBeforeSet('currPage', this._currPage);
        this.elementsPerPage = this.normalPropBeforeSet('elementsPerPage', this._elementsPerPage);

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
    },

    _updateLayout: function() {
        this._super();
        this._updateComboSize();
    },

    _updateComboSize: function(){
        if (this._comboBox){
            this._comboBox.height(this.height());
        }
    },

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
                this.data(propData);
                this._project["selectedIndex"] = selectedIndex;
                if (this._isDrawn) {
                    this.selectOption(selectedIndex);
                }
            }
        } else {
            data = this.data();
            selectedIndex = this._project['selectedIndex'];
            var newData = [];
            for (i = 0, l = data.length; i < l; ++i) {
                dataRow = data[i];
                newData[i] = [dataRow[0], dataRow[1], (i == selectedIndex)];
                newData[i].userData = {id:i};
            }
            res = newData;
        }
        return res;
    },

    _beforeData: function(data){
        if (!$.isArray(data)) {
            return data;
        }

        var i, l, oldData,
            form = this.form(),
            prevShowLng = form._showLngTokens,
            hasLanguage = form.language() != null;

        form._showLngTokens = true;
        oldData = this.data();
        form._showLngTokens = prevShowLng;

        for (i = 0, l = data.length; i < l; i++) {
            if (hasLanguage && !form._skipTokenCreation) {
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
            }

            if (data[i].userData != undefined)
                data[i].userData = undefined;
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

    data: function(data) {
        if (data != undefined) {
            // convert data before process
            if (data.rows !== undefined) {
                var tempData = [];
                for (var i = 0, l = data.rows.length; i < l; ++i) {
                    tempData [i] = [data.rows[i].data[0], data.rows[i].data[1]];
                    if (data.rows[i].data[2] !== undefined){
                        tempData[i].push(data.rows[i].data[2]);
                    }
                }
                data = tempData;
            }
        }
        data = (data === null) ? [] : data; //drop data if null
        if (!this.form())
            return this.htmlProperty('data', this._data).call(this, data);
        else
            return this.htmlPropertyBeforeSetAfterGet('data', this._beforeData, this._data, this._afterGet).call(this, data);
    },

    _onLanguageChanged: function() {
        this._data(this.data());
        if (this._isDrawn) {
            this.selectOption(this.getSelectedIndex());
        }
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();
        this._updateComboSize();
        this._data(this.data());

        this._borderRadius(this.borderRadius());
        this._border(this.border());

        this._visible(this.visible());
        this._opacity(this.opacity());
        this._shadow(this.shadow());
        this._updateEnable();
        this.selectOption(this._project["selectedIndex"]);
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */
    bindEvent: function(event) {
        this._super(event);
        if (this._bindingEvents[event] > 1 || this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            return;
        }

        var self = this;

        switch (event) {
            case WiziCore_UI_ComboBoxWidget.onBlur:
                $(self._comboBox).bind(jqSimpleCombo.onFocusOut, function() {
                    return self.onBlur();
                });
                break;

            case WiziCore_UI_ComboBoxWidget.onKeyPress:
                $(self._comboBox).bind(jqSimpleCombo.onKeyPress, function(ev, keyEv) {
                    return self.onKeyPress(keyEv);
                });
                break;

            case WiziCore_UI_ComboBoxWidget.onSelectionChange:
                $(self._comboBox).bind(jqSimpleCombo.onSelect + ".custom", function() {
                    return self.onSelectionChange();
                });
                break;

            default:
                break;
        }
    },

    /**
     * Function call, then to elements unbind event
     * @param {String} event type of event
     * @param {Boolean} force force unbinding
     * @private
     */
    unbindEvent: function(event, force) {
        this._super(event, force);
        if (this._bindingEvents[event] > 0 && force != true) {
            return;
        }

        var self = this;
        switch (event) {
            case WiziCore_UI_ComboBoxWidget.onBlur:
                    $(self._comboBox).unbind(jqSimpleCombo.onFocusOut);
                break;

            case WiziCore_UI_ComboBoxWidget.onKeyPress:
                    $(self._comboBox).unbind(jqSimpleCombo.onKeyPress);
                break;

            case WiziCore_UI_ComboBoxWidget.onSelectionChange:
                    $(self._comboBox).unbind(jqSimpleCombo.onSelect + ".custom");
                break;

            default:
                break;
        }
    },

    setFocus: function(){
        this.base().find(".simple-combo-input").focus();
//        if (this.readonly() === true)
//            this.closeAll();
    },

    selectContents: function(){
        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this.base().find(".simple-combo-input").select();
        }
    },

    setListHeight: function(maxH){
        if (maxH != undefined){
            this._comboBox.listHeight(maxH);
        }
    },

    setListWidth: function(width) {
        this._comboBox.listWidth(width);
    },

    onChange: function() {
        var triggerEvent = new jQuery.Event(WiziCore_UI_ComboBoxWidget.onChange);

        var oldIndex = this._project["selectedIndex"];
        var oldVal = this.data()[oldIndex];
        var oval = oldVal ? {value: oldVal[1], label: oldVal[0]} : null ;
        var sval = {value: this.getSelectedValue(), label: this.getSelectedText()};

        $(this).trigger(triggerEvent, [sval, oval]);

        var isStopped = triggerEvent.isPropagationStopped();
        if (!isStopped) {
            var newSelectedIndex = this.getSelectedIndex();
            this._project["selectedIndex"] = newSelectedIndex;
        }
        else {
            var oldSelectedIndex = this._project["selectedIndex"];
            if (oldSelectedIndex == -1) {
                this._comboBox.setText("");
            }
        }
        this.sendDrillDown();
        return isStopped;
    },

    onBlur: function() {
        var triggerEvent = new jQuery.Event(WiziCore_UI_ComboBoxWidget.onBlur);
        $(this).trigger(triggerEvent);
        return !triggerEvent.isPropagationStopped();
    },

    onKeyPress: function(key) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_ComboBoxWidget.onKeyPress);
        $(this).trigger(triggerEvent, [key]);
        return !triggerEvent.isPropagationStopped();
    },

    onSelectionChange: function() {
        var triggerEvent = new jQuery.Event(WiziCore_UI_ComboBoxWidget.onSelectionChange);
        $(this).trigger(triggerEvent);
        return !triggerEvent.isPropagationStopped();
    },

    /**
     * get selected combo box index
     * @return {String} index
     */
    getSelectedIndex: function() {
        return this._comboBox.getSelectedIndex();
    },

    getSelectedValue: function() {
        return this._comboBox.getSelectedValue();
    },

    /**
     * get selected combo box text
     * @return {String} text
     */
    getSelectedText: function() {
        return this._comboBox.getSelectedText();
    },

    /**
     * set text in covmbobox
     * @param {String} text new text label
     */
    setComboValue: function(text) {
        if (text != undefined) {
            acDebugger.systemLog("text", text);
            this._comboBox.setValue(text);
        }
    },

    /**
     * Set text in combobox
     * @param {String} text new text label
     */
    setComboText: function(text) {
        this._comboBox.setText(text);
    },

    /**
     * Get text in combobox
     */
    getComboText: function() {
        return this._comboBox.getText();
    },

    updateOption: function(value, newValue, newText){
        var data  = this._comboBox.getData();
        for (var i = 0, l = data.length; i < l; i++){
            if (data[i][1] == value){
                this._comboBox.updateItem(i, [newText, newValue])
                break;
            }
        }

    },

    _enable: function(flag){
        if (this._comboBox != null){
            flag = (flag === false) ? false : true;
            this._comboBox.enable( flag );
        }
    },

    readonly: function(){},

    _tabindex: function(value) {
        this._super(value, this.base().find(".simple-combo-input"));
    },

    _tabStop: function(value) {
        this._super(value, this.base().find(".simple-combo-input"));
    },

    _font: function(val) {
        this._data(this.data()); //for change options style (see addOption method)
        this._super(val, this._comboBox.itemsListContainer());
        this._super(val, this._comboBox.inputContainer());
    },

    _fontColor: function(val) {
        this._super(val, this.base().find(".simple-combo-input"));
    },

    _data: function(data) {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;
        var self = this;
        if (this._comboBox) {
            this._comboBox.clear();
        }
        if ($.isArray(data)) {
            var cData = [],
                text, val,
                i = 0, l = data.length;
            if (this._isDataManual != undefined){
                var res = this._getStartAndLength(l);
                i = res.i;
                l = res.l;
            }
            for (; i < l; ++i) {
                text = data[i][0];
                val = data[i][1];
                text = (text && text.replace) ? (text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")) : (text == null) ? "" : text;

                if (WiziCore_Helper.isLngToken(text))
                    text = this._getTranslatedValue(text);

                cData[i] = [text, val];
            }
            if (this._comboBox) {
                this._comboBox.setData(cData);
            }
        }
        jQuery.fn.__useTr = trState;
    },

    addOption: function(data) {
        this._comboBox.addItem(data);
    },

    onRequestResetFilter: function() {
        this._comboBox.setText("");
    },

    onRequestReloadData: function() {
        this._reloadData = this.getSelectedValue();
    },

    clear: function() {
        this._comboBox.clear();
        this._comboBox.setText("");
    },

    closeAll: function() {
        this._comboBox.closeList();
    },

    UpdateVisualizeMode: function() {
        this._super();

        if (this.mode() == WiziCore_Visualizer.RUN_MODE && this._query != null)
            this._query.loadData();
    },

    resetValue: function() {
        this.value(null);
    },

    getIndexByValue: function(value) {
        var index = null;
        var data = this.data();
        var dataRows = data;
        if (dataRows != undefined) {
            var dataRowsLength = dataRows.length;
            for (var i = 0; i < dataRowsLength; ++i) {
                var comboRowValue = dataRows[i][1];
                if (comboRowValue == value) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    },

    getIndexByLabel: function(label) {
        var index = null;
        var data = this.data();
        var dataRows = data;
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

    selectOption :function(ind) {
        if (ind == -1){
            //clear combobox selection
            this._comboBox.clearSelection();
        } else {
            this._comboBox.selectItem(ind);
        }
    },

    _applyValue: function(val) {
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
        var dataRows = data;
        var dataRowsLength = (dataRows != undefined) ? dataRows.length : 0;
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
            this._project["selectedIndex"] = index;
            if (this._isDrawn) {
                if (index == -1) {
                    this._comboBox.setText("");
                }
                this.selectOption(index);
            }
        }
    },

    value: function(val) {
        val = (typeof val == "number") ? val + "" : val;
        if (val !== undefined && (typeof val == "object" || typeof val == "string")) {
            this._applyValue(val);
        }
        var retVal = null;
        if (this._project["selectedIndex"] != null || this._project["selectedIndex"] != -1) {
            var data = this.data();
            if (data != undefined) {
                var dataRows = data;
                var selectedRow = dataRows[this._project["selectedIndex"]];
                if (selectedRow != undefined) {
                    retVal = {
                        index: this._project["selectedIndex"],
                        value: selectedRow[1],
                        label: selectedRow[0]
                    };
                }
            }
        }
        return retVal;
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

    empty: function(){
        this.reset();
        this.setData([]);
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

    /*rdbValueDataModel: function() {
        return [
            {name: "Value", value: "", uid: "value"},
            {name: "Label", value: "", uid: "label"}
        ];
    },

    isBindableToData: function() {
        return true;
    },*/

    _editable: function(flag){
        if (this._comboBox != null){
            this._comboBox.canOpenSelect(flag);
            this._comboBox.readonly(!flag);
        }
    }
}));

WiziCore_UI_ComboBoxWidget.onChange = "E#ComboBox#onChange";
WiziCore_UI_ComboBoxWidget.onBlur = "E#ComboBox#onBlur";
WiziCore_UI_ComboBoxWidget.onKeyPress = "E#ComboBox#onKeyPress";
WiziCore_UI_ComboBoxWidget.onSelectionChange = "E#ComboBox#onSelectionChange";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ComboBoxWidget.actions = function() {
    var ret = {
        change: {alias: "widget_event_onchange", funcview: "onChange", action: "AC.Widgets.WiziCore_UI_ComboBoxWidget.onChange", params: "newValue, oldValue", group: "widget_event_general"},
        blur: {alias: "widget_event_onblur", funcview: "onBlur", action: "AC.Widgets.WiziCore_UI_ComboBoxWidget.onBlur", params: "", group: "widget_event_general"},
        keypress: {alias: "widget_event_onkeypress", funcview: "onKeyPress", action: "AC.Widgets.WiziCore_UI_ComboBoxWidget.onKeyPress", params: "key", group: "widget_event_key"},
        selectionchange: {alias: "widget_event_onselectionchange", funcview: "onSelectionChange", action: "AC.Widgets.WiziCore_UI_ComboBoxWidget.onSelectionChange", params: "", group: "widget_event_general"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    ret = jQuery.extend(AC.Widgets.Base.actions(), ret);
    return ret;
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ComboBoxWidget.inlineEditPropName = function() {
    return "data";
};

WiziCore_UI_ComboBoxWidget._props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.elementsPerPage,
        AC.Property.general.currPage,
        AC.Property.general.dataWithValue
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.isUnique,
        AC.Property.database.mandatoryHighlight,
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
        AC.Property.layout.tabindex,
        AC.Property.layout.tabStop,
        AC.Property.layout.zindex,
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
        AC.Property.style.shadow,
        AC.Property.style.font,
        AC.Property.style.fontColor,
        AC.Property.style.margin,
        AC.Property.style.border,
        AC.Property.style.borderRadius,
        AC.Property.style.bgColor,
        AC.Property.general.displayHourglassOver,
        AC.Property.general.hourglassImage,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ComboBoxWidget.props = function() {
    return WiziCore_UI_ComboBoxWidget._props;
};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ComboBoxWidget.emptyProps = function() {
    return  {bgColor: "#f7f7f7", fontColor: "black", font:"normal 12px verdana", border:"1px solid gray"};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ComboBoxWidget.defaultProps = function() {
    return {valName: "selectedValue", x: "0", y: "0", height: "20", width: "120",
        zindex: "auto", enable: true, anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        data: [
            ["Label", "Value", ""]
        ], opacity: 1,
        pWidth: "",
        dragAndDrop: false, resizing: false,
        margin: "", alignInContainer: 'left', hourglassImage: "Default", displayHourglassOver: "inherit", customCssClasses: "",
        widgetStyle: "default", name:"DropDown1", tabStop: true,
        currPage : 1, shadow: "",
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE
    };
};

/**
 * Return array of objects, that contain name and value of tokens.
 */
WiziCore_UI_ComboBoxWidget.schemaForTokens = function() {
    return [
        {name: "widget_label", value: "label"},
        {name: "widget_value", value: "value"}
    ];
};

WiziCore_UI_ComboBoxWidget.isField = function() {
    return true;
};
})(jQuery,window,document);