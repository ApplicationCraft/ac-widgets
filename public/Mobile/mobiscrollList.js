(function($, window, document, undefined){
    var w = AC.Widgets.MobiscrollList = function() {
        this.init.apply(this, arguments);
    };

    AC.extend(w, AC.Widgets.WiziCore_UI_BaseMobileWidget);
    var p = w.prototype;
    AC.copyExtension(p, AC.WidgetExt.DataIntegration.MultyColumnList);

    p._widgetClass = "MobiscrollList";
    p._input = null;
    p._dataPropName = "data";
    p._stopDropValue = false;

    /**
     * Description of constructor
     * @class       Some words about mobiscroll list widget class
     * @author      Mikhail Loginov
     * @version     0.1
     *
     * @constructs
     */
    p.init = function() {
        w._sc.init.apply(this, arguments);
    };

    p._onInitLanguage = function() {
        this._stopDropValue = true;
        this.data(this.data());
        this._stopDropValue = false;
    };

    p._onSTUpdated = function() {
        this._data(this._project['data']);
    };

    p.draw = function() {
        var cnt = $('<div>');
        this.base().append(cnt);
        this._cnt = cnt;
        w._sc.draw.apply(this, arguments);
    };

    p._redraw = function() {
        this._cnt.empty();
        var div = $("<div data-role='fieldcontain'/>");
        this._div = div;
        var htmlId = this.htmlId();

        var input = $("<input type='text' class='mobiscrollList' />");
        this._input = input;
        input.attr("id", htmlId + "_mobiscrollList");
        input.attr("name", htmlId + "_mobiscrollList");
        input.css("width", "100%");
        var cnt = $('<div style="padding-right: 15px;"></div>');
        input.css("margin", "0 auto");
        cnt.append(input);
        div.append(cnt);

        this._cnt.prepend(div);

        input.textinput(this._getJQMOptions());

        var self = this;

        input.scroller({
            mode: this.scrollerMode(),
            theme: this.scrollerTheme(),
            headerText: false,
            showLabel: false,
            onSelect: function() { self._onMobiscrollListSelect(); }
        });

        this._updateEnable();
        this._updateWidthOfInput();
        this._data(this._project['data']);
    };

    p.resetValue = function() {
        this.value([]);
    };

    p._shadow = function(val){
        w._sc._shadow.apply(this, [val, this._input]);
    };

    p._updateWidthOfInput = function(){
        var inp = this._input;
        if (inp){
            if (this.getContainerLayoutType() == WiziCore_Widget_Layout.LAYOUT_TYPES.Absolute){
                inp.width(this.width());
                inp.parent().css("padding-right", "");
            } else {
                inp.width("100%");
                inp.parent().css("padding-right", "15px");
            }
        }
    };

    p.onContainerChangeLayout = function(){
        this._updateWidthOfInput();
    };

    p.onDestroy = function() {
        if (this._input)
            this._input.scroller('destroy');
    };

    p.initDomState = function() {
        w._sc.initDomState.call(this);
        this.initDomStatePos();
        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._data(this._project['data']);
    };

    p._onMobiscrollListSelect = function() {
        $(this).trigger(AC.Widgets.MobiscrollList.onSelectValue, [this._input.scroller('getValue')]);
        this.sendDrillDown(this._input.scroller('getValue'));

    };

    p.items = function(data) {
        var i, l, j, k, propData, selectedValue, dataRow, res, tableData;
        if (data != undefined) {
            if ($.isArray(data)) {
                propData = [];
                selectedValue = [];
                for (i = 0, l = data.length; i < l; i++) {
                    tableData = data[i];
                    propData[i] = [];
                    if (!$.isArray(tableData))
                        continue;

                    for (j = 0, k = tableData.length; j < k; j++) {
                        dataRow = tableData[j];
                        propData[i][j] = [dataRow[0], dataRow[1]];
                        if (dataRow['userData'])
                            propData[i][j]['userData'] = dataRow['userData'];

                        if (dataRow[2] === true) {
                            selectedValue[i] = dataRow[1];
                        }
                    }
                }

                this.data(propData);
                this.value(selectedValue);
            }
        } else {
            res = this._getDataWithValue();
        }
        return res;
    };

    p._getDataWithValue = function() {
        var data, tableData, dataRow,selectedValue, i, l, j, k, isSelected;
        data = this.data();
        if ($.isArray(data)) {
            selectedValue = this._project['selectedValue'];
            var newData = [];
            for (i = 0, l = data.length; i < l; i++) {
                tableData = data[i];
                newData[i] = [];
                for (j = 0, k = tableData.length; j < k; j++) {
                    dataRow = tableData[j];
                    isSelected = selectedValue != undefined && (selectedValue[i] == dataRow[1]);
                    newData[i][j] = [dataRow[0], dataRow[1], isSelected];
                    newData[i][j].userData = {id:j};
                }
            }
            return newData;
        } else
            return data;
    };

    p._beforeData = function(data){
        if (!$.isArray(data)) {
            return data;
        }

        var i, l, j, k, oldData, tableData, row,
            form = this.form(),
            prevShowLng = form._showLngTokens,
            hasLanguage = form.language() != null;

        form._showLngTokens = true;
        oldData = this.data();
        form._showLngTokens = prevShowLng;

        if (hasLanguage && !form._skipTokenCreation) {
            for (i = 0, l = data.length; i < l; i++) {
                tableData = data[i];
                if (!$.isArray(tableData))
                    continue;

                for (j = 0, k = tableData.length; j < k; j++) {
                    row = tableData[j];
                    var id = (row.userData && row.userData.id != undefined) ? row.userData.id : null,
                        isValueToken = WiziCore_Helper.isLngToken(row[0]),
                        token, hasToken;
                    if (!isValueToken) {
                        hasToken = (id != null) && WiziCore_Helper.isLngToken(oldData[i][id][0]);
                        if (hasToken)
                            token = oldData[i][id][0];
                        else
                            token = WiziCore_Helper.generateId(10, 'ac-');

                        this.form().addTokenToStringTable(this.id(), this.name(), token, row[0]);
                        row[0] = token;
                    }

                    if (row.userData != undefined)
                        row.userData = undefined;
                }
            }
        }
        return data;
    };

    p._afterGet = function(data) {
        var ret = WiziCore_Helper.clone(data), tableData, i, j, k, l;

        if ($.isArray(ret)) {
            for (i = 0, l = ret.length; i < l; i++) {
                tableData = ret[i];
                if (!$.isArray(tableData))
                    continue;

                for (j = 0, k = tableData.length; j < k; j++) {
                    tableData[j][0] = this._getTranslatedValue(tableData[j][0]);
                }
            }
        }
        return ret;
    };

    p.data = function(data) {
        if (data != undefined && !this._stopDropValue) {
            this._project['selectedValue'] = [];
        }

        data = (data === null) ? [[]] : data;
        return this.htmlPropertyBeforeSetAfterGet('data', this._beforeData, this._data, this._afterGet).call(this, data);
    };

    p._data = function(data) {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        if ($.isArray(data) && this._isDrawn && this._input) {
            var wheels = [{}], i, l, j, k, tableData, wheel;
            for (i = 0, l = data.length; i < l; i++) {
                tableData = data[i];
                wheel = {};
                if (!$.isArray(tableData))
                    continue;

                for (j = 0, k = tableData.length; j < k; j++) {
                    wheel[tableData[j][1]] = this._getTranslatedValue(tableData[j][0]);
                }
                wheels[0][i] = wheel;
            }
            this._input.scroller('option', {'wheels': wheels});
        }

        this.value(this._project['selectedValue']);
        jQuery.fn.__useTr = trState;
    };

    p.value = function(val) {
        if (val != undefined && $.isArray(val)) {
            if (this._input)
                this._input.scroller('setValue', val, true);

            this._project["selectedValue"] = val;
        } else
            return (this._input) ? this._input.scroller('getValue') : this._project['selectedValue'];
    };

    p._enable = function(val) {
        if (this._input) {
            val = (val === true) ? "enable" : "disable";
            this._input.scroller(val);
            this._input.textinput(val);
        }
    };

    p._scrollerMode = function(val) {
        if (val != undefined && this._input) {
            this._input.scroller('option', {'mode': val});
        }
    };

    p._scrollerTheme = function(val) {
        if (val != undefined && this._input) {
            this._input.scroller('option', {'theme': val});
        }
    };

    p.getMobiscrollObject = function() {
        return this._input;
    };

    p.getDataFromMap = function(dataArray, map) {
        var res = [], row, columnIndex;
        for (var i = 0, l = dataArray.length; i < l; i++) {
            row = [];
            columnIndex = parseInt(AC.Widgets.Base.getDataItemWithMap(dataArray[i], map["columnIndex"]));
            var mapLabelVal = map['label'];
            var mapValueVal = map['value'];
            if (mapLabelVal != undefined && mapValueVal != undefined && !isNaN(columnIndex)) {
                if (res[columnIndex] == undefined)
                    res[columnIndex] = [];

                row[0] = AC.Widgets.Base.getDataItemWithMap(dataArray[i], mapLabelVal);
                row[1] = AC.Widgets.Base.getDataItemWithMap(dataArray[i], mapValueVal);
                res[columnIndex].push(row);
            }
        }
        return res;
    };

    p.getDataModel = function() {
        return [
            {name: "widget_column_index", value: "", uid: "columnIndex"},
            {name: "widget_label", value: "", uid: "labeluid"},
            {name: "widget_value", value: "", uid: "valueuid"}
        ];
    };

    p.getValueDataModel = function() {
        return ['valueuid', 'valueuid','valueuid','valueuid','valueuid'];
    };
    /** properties
     *
     */

    p.name = AC.Property.normal('name');

    p.isIncludedInSchema = AC.Property.normal('isIncludedInSchema', p._updateStorageFlag);
    p.dataType = AC.Property.normal('dataType');
    p.isUnique = AC.Property.normal('isUnique');
    p.mandatory = AC.Property.normal('mandatory');

    p.scrollerMode = AC.Property.html('scrollerMode', p._scrollerMode);
    p.scrollerTheme = AC.Property.html('scrollerTheme', p._scrollerTheme);

    p.enable = AC.Property.html('enable', p._enable);
    p.visible = AC.Property.html('visible', p._visible);
    p.opacity = AC.Property.theme('opacity', p._opacity);

    p.view = AC.Property.normal('view');
    p.fields = AC.Property.normal('fields');
    p.groupby = AC.Property.normal('groupby');
    p.orderby = AC.Property.normal('orderby');
    p.filter = AC.Property.normal('filter');
    p.resetfilter = AC.Property.normal('resetfilter');
    p.listenview = AC.Property.normal('listenview');
    p.applyview = AC.Property.normal('applyview');
    p.onview = AC.Property.normal('onview');

    w.onSelectValue = "E#MobiscrollList#onSelectValue";

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    w.actions = function() {
        var ret = {
            onSelectValue: {alias: "widget_event_onselectionchange", funcview: "onSelectionChange", action: "AC.Widgets.MobiscrollList.onSelectValue", params: "value", group: "widget_event_general"}
        };
        ret = $.extend(AC.Widgets.Base.actions(), ret);
        return ret;
    };

    /**
     * Return default inline edit prop
     * @return {Object} default inline edit prop
     */
    w.inlineEditPropName = function() {
        return "data";
    };

    var _props = [
            { name: AC.Property.group_names.general, props:[
                AC.Property.general.widgetClass,
                AC.Property.general.name,
                {name: "items", type : "mcListData", set: "items", get: "items", alias: "widget_mobiscrollList_items"},
                {name: "scrollerMode", type : "mobiscrollMode", set: "scrollerMode", get: "scrollerMode", alias: "widget_mobiscroll_mode"},
                {name: "scrollerTheme", type : "mobiscrollTheme", set: "scrollerTheme", get: "scrollerTheme", alias: "widget_mobiscroll_theme"}
            ]},
            { name: AC.Property.group_names.database, props:[
                AC.Property.database.isIncludedInSchema,
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
                AC.Property.layout.anchors,
                AC.Property.layout.alignInContainer
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
                AC.Property.style.customCssClasses,
                AC.Property.style.widgetStyle
            ]}

        ],
        lng = { "en" : {
            widget_name_mobiscroll_list: "Mobiscroll List",
            widget_mobiscrollList_items: "Items"
        } }
        ;
    /**
     * Return available widget prop
     * @return {Object} available property
     */
    w.props = function() {
        return _props;
    };

    /**
     * Return empty widget prop
     * @return {Object} default properties
     */
    w.emptyProps = function() {
        return {};
    };

    w.langs = function() {
        return lng;
    };

    /**
     * Return default widget prop
     * @return {Object} default properties
     */
    w.defaultProps = function() {
        return {
            x: "0",
            y: "0",
            width: "210",
            height: "35",
            zindex: "auto",
            enable: true,
            anchors: {
                left: true,
                top: true,
                bottom: false,
                right: false
            },
            visible: true,
            name: "mobiscrollList",
            opacity: 1,
            customCssClasses: "",
            widgetStyle: "default",
            dragAndDrop: false,
            resizing: false,
            alignInContainer: 'left',
            mobileTheme: 'c',
            margin: '',
            scrollerMode: 'scroller',
            scrollerTheme: 'default',
            data: [[["Label", "Value", ""], ["Label1", "Value1", ""]], [["Label", "Value", ""], ["Label1", "Value1", ""], ["Label2", "Value2", ""]]]
        };
    };

    w.isField = function() {
        return true
    };

    AC.Core.lang().registerWidgetLang(lng);
})(jQuery,window,document);