/**
 * @lends       WiziCore_UI_ListBoxWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_ListBoxWidget = AC.Widgets.WiziCore_UI_ListBoxWidget = AC.Widgets.ListBoxWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationList, WiziCore_Source_Widget_PagingAPI, {
    _widgetClass: "WiziCore_UI_ListBoxWidget",
    _div: null,
    _ol: null,
    _reloadData: false,

    _dataPropName: "data",

    _isMultiSelectLive: null,

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

        this._isMultiSelectLive = this.multiSelect();
        if (!("selectedIndices" in this._project)) {
            this._project["selectedIndices"] = {};
        }
    },

    _onInitLanguage: function() {
        this._stopDropIndices = true;
        this.data(this.data());
        this._selectIndicesSet(this._project["selectedIndices"]);
        this._stopDropIndices = false;
    },

    _onSTUpdated: function() {
        this._data(this._project['data']);
    },

    /**
     * Append element to DOM
     */
    draw: function() {
        this._div = $("<div>")
                 .css({
                         "overflow": "auto",
                         "width": "100%",
                         "height": "100%",
                         "-moz-user-select": "none",
                         "-khtml-user-select": "none"
                        })
                 .attr("unselectable", "on");
        if ($.browser.msie){
            this._div.css("overflow-x", "hidden");
        }
        this.base().prepend(this._div);

        if (this.mode() == WiziCore_Visualizer.RUN_MODE && this._query != null) {
            this._query.loadData();
        }

        this._super.apply(this, arguments);
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
        this.bg = this.themeProperty('bgColor', this._bg);
        this.lineSpace = this.themeProperty('lineSpace', this._lineSpace);
        this.selectedBg = this.themeProperty('selectedBg', this._selectedBg);
        this.selectedFont = this.themeProperty('selectedFont', this._selectedFont);
        this.selectedColor = this.themeProperty('selectedColor', this._selectedColor);
        this.multiSelect = this.htmlProperty('multySelect', this._multiSelect);

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.shadow = this.themeProperty('shadow', this._shadow);
        //this.tabindex = this.htmlProperty('tabindex', this._tabindex);

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

    dataWithValue: function(data) {
        var i, l, propData, selectedIndices, dataRow, res;
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
                this._stopDropIndices = true;
                this.data(propData);
                this._stopDropIndices = false;
                this._selectIndicesSet(selectedIndices);
            }
        } else {
            res = this._getDataWithValue();
        }
        return res;
    },

    _getDataWithValue: function() {
        var data, dataRow,selectedIndices, i, l;
        data = this.data();
        selectedIndices = this._project['selectedIndices'];
        var newData = [];
        for (i = 0, l = data.length; i < l; ++i) {
            dataRow = data[i];
            newData[i] = [dataRow[0], dataRow[1], !!selectedIndices[i]];
            newData[i].userData = {id:i};
        }
        return newData;
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

        if (hasLanguage && !form._skipTokenCreation) {
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
            if (!this._stopDropIndices){
                this._project["selectedIndices"] = {};
            }
        }
        data = (data === null) ? [] : data;
        return this.htmlPropertyBeforeSetAfterGet('data', this._beforeData, this._data, this._afterGet).call(this, data);
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();
        this._bg(this.bg());
        this._border(this.border());
        this._font(this.font());
        this._fontColor(this.fontColor());
        this._data(this._project['data']);

        this._shadow(this.shadow());
        this._lineSpace(this.lineSpace());
//        this._selectedBg(this.selectedBg());
//        this._selectedFont(this.selectedFont());
//        this._selectedColor(this.selectedColor());
        this._multiSelect(this.multiSelect());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        //this._tabindex(this.tabindex());

        var selectedIndices = this._project["selectedIndices"];
        var isSelectedIndicesEmpty = WiziCore_Helper.objectIsEmpty(selectedIndices);

        // XXX: for compatibility with format of data where selected indices are in the data
        if (isSelectedIndicesEmpty) {
            var data = this.data();
            selectedIndices = {};
            if (data != undefined) {
                for (var i = 0, l = data.length; i < l; ++i) {
                    if (data[i][2]) {
                        selectedIndices[i] = true;
                    }
                }
            }
        }

        this._selectItemsByIndicesSet(selectedIndices);
    },

    _updateLayout: function(){
        this._super();
        this._div.height(this.height());
    },

    addItem: function(item) {
        if (item != null && item.value != null && item.label != null) {
            var data = this.data();
            if (data == null) {
                data = [];
            }
            data.push([item.value, item.label]);
            this.data(data);
        }
    },

    deleteSelItems: function() {
        var self = this;
        if (this._ol != null) {
            var delItems = [];
            this._ol.find("li.ui-selected").each(function() {
                delItems.splice(0, 0, $(this).attr("ident"));
                $(this).remove();
            });
            var data = self.data();

            if (jQuery.isArray(data)) {
                for (var i in delItems) {
                    data.splice(delItems[i], 1);
                }
                self.data(data);
            }
        }
    },

    getSelectedItems: function() {
        var selItems = [];
        if (this._ol != null) {
            this._ol.find("li.ui-selected").each(function() {
                selItems.splice(0, 0, $(this).attr("val"));
            });
        }
        return selItems;
    },

    clear: function() {
        if (this._ol != null) {
            this._ol.find("li").each(function() {
                $(this).remove();
            });
        }
        this.data([]);
    },

    deleteItems: function(ids) {
        var data = this.data();
        if (data != null && ids != undefined) {
            for (var i in ids) {
                if (data[ids[i]] != undefined) {
                    data.splice(ids[i], 1);
                }
            }
            this.data(data);
        }
    },

    onStop: function(list) {
        try {
            var sel = [],
                index = {},
                isMulti = this.multiSelect(),
                prev = this._project["selectedIndices"],
                prevValue = [];

            function getItem($this, curIndex){
                return {index: curIndex, value: $this.attr("val"), label: $this.text()};
            }

            this._ol.find("li").each(function() {
                var $this = $(this),
                    isSelected = $this.hasClass("ui-selected"),
                    curIndex = (+$this.attr("ident"));

                if (curIndex in prev){
                    prevValue.push(getItem($this, curIndex));
                }

                if (isSelected && (isMulti || (sel.length == 0))) {
                    sel.push(getItem($this, curIndex));
                    index[curIndex] = true;
                }
            });

            if (!isMulti) {
                sel = (sel[0] != undefined) ? sel[0] : null;
                prevValue = (prevValue[0]) ? prevValue[0] : null;
            }

            var triggerEvent = new jQuery.Event(WiziCore_UI_ListBoxWidget.onStop);
            $(this).trigger(triggerEvent, [sel]);
            var isStopped = triggerEvent.isPropagationStopped();
            if (!isStopped) {
                var update = !WiziCore_Helper.objectsAreEqual(prev, index);
                if (update) {
                    this._project["selectedIndices"] = index;
                    $(this).trigger(WiziCore_UI_ListBoxWidget.onSelectValue, [sel, prevValue]);
                    this.sendDrillDown();
                }
            }
        } catch(er) {
            acDebugger.systemLog1("err in listbox!!!", er);
        }
        return !isStopped;
    },

    selectItemsByValues: function(values) {
        var el = this._div;
        if (el != null) {
            el.find("li").each(function() {
                if ($.inArray($(this).attr("val"), values) != -1) {
                    $(this).addClass("ui-selected");
                }
                else {
                    $(this).removeClass("ui-selected");
                }
            });
        }
    },

    onRequestResetFilter: function() {
        this.base().find(".ui-selected").removeClass("ui-selected");
    },

    onRequestReloadData: function() {
        var selectedValues = [];
        var list = this.base();
        $(".ui-selected", list).each(function() {
            selectedValues.push($(this).attr("val"));
        });
        this._reloadData = selectedValues;
    },

    _data: function(val) {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        var self = this;
        var div = this._div;

        if (this._ol != null) {
            this._ol.selectable('destroy');
        }
        div.empty();
        div.hide();
        var ol = $('<ol style="width:100% ">');
        var data = val;
        if (jQuery.isArray(data)){
            var i = 0, l = data.length;
            if (this._isDataManual != undefined){
                var res = this._getStartAndLength(l);
                i = res.i;
                l = res.l;
            }
            for (; i < l; i++) {
                var lival = (data[i][1]) ? WiziCore_Helper.escapeHTMLtags(data[i][1]) : "";
                var text = (data[i][0]) ? data[i][0].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : "";
                var li;
                if (WiziCore_Helper.isLngToken(text))
                    li = $("<li>").attr({"val": lival, "ident": i, "data-lng": text}).text(this._getTranslatedValue(text));
                else
                    li = $("<li>").attr({"val": lival, "ident": i}).text(text);

                li.click(function(){
                    var $this = $(this);
                    $this.focus();
                });
                ol.append(li);
            }
        }
        ol.selectable({
            selected: function(event, ui){
                if (ui.selected){
                    self._setItemCss($(ui.selected));
                }
            },
            unselected: function(event, ui){
                if (ui.unselected){
                    self._setItemCss($(ui.unselected), true);
                }
            },
            stop: function(event, ui) {
                self.onStop(this, ui);
            },
            multiple: self.multiSelect()
        });

        if (this.enable() === false){
            ol.selectable('disable');
        }
        this._ol = ol;
        div.append(ol);
        div.show();
        jQuery.fn.__useTr = trState;
    },

    _enable: function(flag){
        if (this._ol != null) {
            (flag === false) ? this._ol.selectable('disable') : this._ol.selectable('enable');
        }
    },

    _multiSelect: function(val) {
        if (this._ol != null) {
            this._ol.selectable("option", "multiple", val);
        }
    },

    _lineSpace: function(val) {
        if (this._ol != null) {
            val = parseInt(val, 10);
            var base = this.base(),
                pClass = "list-line-spacing-",
                oldClass = base.data(pClass);
            base.removeClass(pClass + oldClass);
            base.data(pClass, val);
            base.addClass(pClass + val);
        }
    },

    _setItemCss: function(item, drop){
        if (drop){
            item.css({"background-color": "", font: "", color: ""});
        } else {
            item.css({"background-color": this.selectedBg(), font: this.selectedFont(), color: this.selectedColor()});
        }
    },

    _selectedBg: function(val) {
        if (this._ol != null) {
            this.base().find(".ui-selected, .ui-selecting").css("background-color", val);
        }
    },

    _selectedFont: function(val) {
        if (this._ol != null) {
            this.base().find(".ui-selected, .ui-selecting").css("font", val);
        }
    },

    _selectedColor: function(val) {
        if (this._ol != null) {
            this.base().find(".ui-selected, .ui-selecting").css("color", val);
        }
    },

    _selectItemsByIndicesSet: function(indicesSet) {
        var el = this._div,
            self = this;
        if (el != null) {
            el.find("li").each(function() {
                // this == element
                var $this = $(this),
                    currIndex = (+$this.attr("ident"));
                if (indicesSet[currIndex]) {
                    $this.addClass("ui-selected");
                    self._setItemCss($this);
                }
                else {
                    self._setItemCss($this, true);
                    $this.removeClass("ui-selected");
                }
            });
        }
    },

    value: function(val) {
        var data = this.data();
        if (data == undefined) {
            return undefined;
        }
        var dataRowsCount = data.length;
        var isMulti = this.multiSelect();

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
                currIndex = (currIndex == undefined) ? currIndex : (+currIndex);
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

            this._selectIndicesSet(indices);
        }

        var retVal = [];
        if (this._project["selectedIndices"] != null) {
            for (i in this._project["selectedIndices"]) {
                if (!this._project["selectedIndices"]) {
                    continue;
                }
                var dataRow = data[i];
                if (dataRow != undefined) {
                    retVal.push({
                        "index": i,
                        "value": dataRow[1],
                        "label": dataRow[0]
                    });
                    if (!isMulti) {
                        break;
                    }
                }
            }
        }

        if (!isMulti) {
            retVal = (retVal.length > 0) ? retVal[0] : null;
        }
        return retVal;
    },

    _selectIndicesSet: function(indices) {
        var isMulti = this.multiSelect();
        if (!isMulti) {
            var newIndices = {};
            for (var i in indices) {
                if (indices.hasOwnProperty(i) && indices[i]) {
                    newIndices[i] = true;
                    break;
                }
            }
            indices = newIndices;
        }
        this._project["selectedIndices"] = indices;

        if (this._isDrawn) {
            this._selectItemsByIndicesSet(indices);
        }
    },

    resetValue: function() {
        this._project["selectedIndices"] = {};
        this._selectItemsByIndicesSet({});
    },

    collectDataSchema: function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var isMultiSelect = this.multiSelect();
        var elementDataType = this.dataType() || AC.Widgets.WiziCore_Api_Form.Type.STRING;
        var name = this.name();
        var kind = (isMultiSelect) ? AC.Widgets.WiziCore_Api_Form.Kind.OBJECT_LIST : AC.Widgets.WiziCore_Api_Form.Kind.OBJECT;
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
        var result = null;

        var isMulti = this._isMultiSelectLive;
        if (isMulti) {
            result = {columns: ['value', 'label'], rows: []};
        }

        for (var index in this._project["selectedIndices"]) {
            if (this._project["selectedIndices"]) {
                var dataRow = data[index];
                if (dataRow != undefined) {
                    if (isMulti) {
                        result.rows.push({data: [dataRow[1], dataRow[0]]});
                    } else {
                        result = {
                            value: dataRow[1],
                            label: dataRow[0]
                        };
                    }
                }
                if (!isMulti) {
                    break;
                }
            }
        }

        if (this.mandatory() && (result == null || isMulti && result.rows.length == 0)) {
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
                    listValues[value.rows[i][0]] = true;
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
            for (i = 0, l = data.length; i < l; ++i) {
                var rowData = data[i];
                var rowValue = rowData[1];
                if (listValues[rowValue]) {
                    indices[i] = true;
                }
            }
            this._selectIndicesSet(indices);
        }
    },

    empty: function(){
        this.reset();
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
    }

    /*isBindableToData: function() {
        return (!(this.multiSelect() && (typeof this.foreignAppWriting == 'function') && this.foreignAppWriting()));
    },

    rdbValueDataModel: function() {
        return [
            {name: "Value", value: "", uid: "value"},
            {name: "Label", value: "", uid: "label"}
        ];
    }*/
}));

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ListBoxWidget.inlineEditPropName = function() {
    return "data";
};

var _props = [
    {name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.elementsPerPage,
        AC.Property.general.currPage,
        AC.Property.general.dataWithValue,
        AC.Property.general.multiSelect
    ]},
    {name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.isUnique,
        AC.Property.database.mandatory
    ]},
    {name: AC.Property.group_names.layout, props:[
        AC.Property.layout.pWidthHidden,
        AC.Property.layout.widthHidden,
        AC.Property.layout.heightHidden,
        AC.Property.layout.sizes,
        AC.Property.layout.minWidth,
        AC.Property.layout.maxWidth,
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.zindex,
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer,
        AC.Property.layout.repeat
    ]},
    {name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.resizing,
        AC.Property.behavior.visible,
        AC.Property.behavior.enable
    ]},
    {name: AC.Property.group_names.data, props:[
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
    {name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.shadow,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle,
        AC.Property.style.font,
        AC.Property.style.fontColor,
        AC.Property.style.margin,
        AC.Property.style.border,
        AC.Property.style.bgColor,
        AC.Property.style.lineSpace,
        AC.Property.style.selectedBg,
        AC.Property.style.selectedFont,
        AC.Property.general.displayHourglassOver,
        AC.Property.general.hourglassImage,
        AC.Property.style.selectedColor
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ListBoxWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ListBoxWidget.emptyProps = function() {
    var ret = {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray",
        selectedBg: "gray", selectedFont: "normal 12px verdana", selectedColor: "silver"};
    WiziCore_UI_ListBoxWidget.emptyProps = function(){return ret};
    return ret;
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ListBoxWidget.defaultProps = function() {
    var ret = {valName: "selectedItems",  x: "0", y: "0", height: "60", width: "120", zindex: "auto", enable: true,
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true, opacity : 1,
        data: [
            ["Label", "Value", ""]
        ], name: "listBox1", border: "",
        widgetStyle: "default",
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        pWidth: "",
        dragAndDrop: false, resizing: false,
        margin: "", alignInContainer: 'left',
        multySelect: false,
        currPage : 1,
        shadow: "",
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE
    };
    WiziCore_UI_ListBoxWidget.defaultProps = function(){return ret};
    return ret;
};
WiziCore_UI_ListBoxWidget.onStop = "E#ListBox#onStop";
WiziCore_UI_ListBoxWidget.onSelectValue = "E#ListBox#onSelectValue";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ListBoxWidget.actions = function() {
    var ret = {
        onSelectValue: {alias: "widget_event_onselectionchange", funcview: "onSelectionChange", action: "AC.Widgets.ListBoxWidget.onSelectValue", params: "newValue, oldValue", group: "widget_event_general"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    ret = jQuery.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_ListBoxWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return array of objects, that contain name and value of tokens.
 * @param clientApiObj
 */
WiziCore_UI_ListBoxWidget.schemaForTokens = function(clientApiObj) {
    var ret = [];
    if (!clientApiObj.prop('multySelect')) {
        ret = [
            {name: "widget_label", value: "label"},
            {name: "widget_value", value: "value"}
        ];
    }
    return ret;
};

WiziCore_UI_ListBoxWidget.isField = function() {
    return true;
};

})(jQuery,window,document);