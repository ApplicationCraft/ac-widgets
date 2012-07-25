/**
 * @lends       WiziCore_UI_ContextMenuMobileWidget#
 */
(function($, windows, document, undefined){

    var listenWidgets = [];

    function findOption(target) {
        return $(target).closest('.ac-widget-item');
    }

    function eventCallback(ev) {
        var option = findOption(ev.target);
        if (option.length > 0) {
            var widget = option.data("widget"), w;
            for (var i = 0, l = listenWidgets.length; i < l; i++){
                w = listenWidgets[i];
                //call in all listen objects function checkClickEvent
                if (w && typeof w.checkClickEvent == "function"){
                    w.checkClickEvent( ev, widget );
                }
            }
        }

    }

    function bindClickToDocument(){
        $(document).bind("vclick", eventCallback);
        bindClickToDocument = null;
    }

    function bindClickEvent(widget) {
        //first bind
        listenWidgets.push( widget );
    }

    function unBindClickEvent(widget) {
        for (var i = 0, l = listenWidgets.length; i < l; i++){
            var w = listenWidgets[i];
            if (w && widget.id() == w.id()){
                listenWidgets.splice(i, 1);
                break;
            }
        }
    }


var WiziCore_UI_ContextMenuMobileWidget = AC.Widgets.WiziCore_UI_ContextMenuMobileWidget =  AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.extend({
    _widgetClass: "WiziCore_UI_ContextMenuMobileWidget",
    _oldVal: null,

    /**
     * Description of constructor
     * @class       Some words about popup dropdown mobile widget class
     * @author      Dmitry Suchkov
     * @version     0.2
     *
     * @constructs
     */

    init: function(){
        this._super.apply(this, arguments);

    },

    initProps : function(){
        this._super();
        this.wparent = this.normalProperty('wparent');
    },

    remove: function() {
        if (this._checkRepeatBeforeRemove()){
            return;
        }
        unBindClickEvent(this);
        $(this.page()).unbind(AC.Widgets.WiziCore_Api_Page.onPageLeft+'.'+this.selectElemId() );
        this._super();
    },

    checkClickEvent : function(event, w){
        var widget = this.wparent();
        if (!widget){
            return;
        }
        var widgetUid = (!widget.uid) ? widget : widget.uid;
        if (widgetUid == w.id()){
            this.openMenu();
        }
    },

    draw: function() {
        var _self = this;
        bindClickToDocument && bindClickToDocument();
        this._mainCnt = $("<div style='width:100%; height:100%'></div>");

        this.base().append(this._mainCnt);
        this._super.apply(this, arguments);
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE){
            this.base().css({display : "block", "text-align" : "center"}).text(AC.Core.lang().trText("m_widget_name_contextmenu") + " : " + this.name());
        } else {
            bindClickEvent(this);

            this.base().css({display : "none"});

            $(this.page()).bind(AC.Widgets.WiziCore_Api_Page.onPageLeft+'.'+_self.selectElemId(), function () {
                if (_self._isContextMenuOpened){
                    _self._isContextMenuOpened = false;
                    _self._select.selectmenu("close");
                }
            });

        }
    },

    openMenu : function(){
        var _self = this;
        if (_self._isContextMenuOpened == true){
            return;
        }
        _self.onPreShow();
        _self._select.selectmenu("open");
        _self._isContextMenuOpened = true;
        var popupmenu = $("#" + _self.selectElemId() + "-menu").parent();
        var w = popupmenu.width(), h = popupmenu.height(), sW = $(window).width(), sH = $(window).height();
        if (h < sH){
            var screen = popupmenu.prev();
            screen.css( {"background-color" : "black", opacity : 0.4} );
            popupmenu.css( { left :  parseInt( ( ( (sW - w) / 2 ) ), 10) + "px", top :  parseInt( ( ( (sH - h) / 2 ) ), 10) + "px", position : "fixed" } );
            screen.one("vclick", function(ev){
                ev.preventDefault();
            });
        }

    },

    selectElemId: function() {
        return "select-" + this.htmlId();
    },

    _data: function(val) {

        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE){
            return;
        }

        this.removeEvents(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);

        if (this._div != undefined) {
            //remove old created element
            $("#" + this.selectElemId() + "-menu").parent().remove();

            this._div.empty();
            this._div.remove();
        }

        this._div = $('<div/>');
        var selectDivId = "selectDiv-" + this.htmlId();
        this._div.attr("id", selectDivId);
        var label = $('<label  data-native-menu="false"  class="select" for="' + selectId + '"></label>'),
            div = this._div,
            selectId = this.selectElemId(),
            select = this._select = $('<select name="' + selectId + '" id="' + selectId + '"/>'),
            i = 0, l = val ? val.length : 0;

        div.append(label);
        div.append(select);

        select.data('native-menu', false);
        if (this._isDataManual != undefined){
            var res = this._getStartAndLength(l);
            i = res.i;
            l = res.l;
        }

        var o = $("<option style='display: none;'>").attr({"value": ""}).html("");
        select.append(o);

        if (val){
            for (; i < l; ++i) {
                var optionText = (val[i][0]) ? val[i][0].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : "";
                if (optionText == "" || optionText == " "){
                    optionText = "&nbsp;"
                }
                var o = $("<option>").attr({"value": i}).html("" + optionText);
                select.append(o);
            }
        }

        this.addEvents(AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.onChange);

        this._mainCnt.append(this._div);

        if (this._isDrawn) {
            this._refresh();
        }
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this.base().css({display : "none"});
        }
        //this._super();
    },

    _refresh: function() {
        var o = this._getJQMOptions();
        o.nativeMenu = false;
        o.raw = true;
        this._select.selectmenu(o);
        this._updateEnable();
    },

    onPageDrawn: function() {
        this._super.apply(this, arguments);
        this._tabindex(this.tabindex());
    },

    /**
     * On onPreShow event
     */
    onPreShow: function() {
        var self = this;
        var triggerEvent = new jQuery.Event(WiziCore_UI_ContextMenuMobileWidget.onPreShow);
        $(self).trigger(triggerEvent);
    },

    /**
     * On onChange event
     */
    onChange: function(ev) {
        var self = ev.data.self;
        var triggerEvent = new jQuery.Event(WiziCore_UI_ContextMenuMobileWidget.onClick);
        var pos = self._select.val();
        self._project['selectedIndex'] = pos;
        if (pos != "" && self._isContextMenuOpened === true){
            var data = self.data();
            var val = (pos != null)? {label: data[pos][0], value: data[pos][1], index: pos}: null;
            $(self).trigger(triggerEvent, [val]);
        }
        self._isContextMenuOpened = false;

    },

    selectOption: function(ind){
        if (this._select && ind > 0){
            //this._select.children().eq(ind).attr("selected", "selected");
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
            this._project["selectedIndex"] = index;
            if (this._isDrawn) {
                if (index == -1) {
                    //this._comboBox.setComboText("");
                }
                this._data(this.data());
            }
        }

    },

    value: function(val) {
        val = (typeof val == "number") ? val + "" : val;
        if (val !== undefined && (typeof val == "object" || typeof val == "string")) {
            this._applyValue(val);
        }
        var retVal = null,
            index = this._project["selectedIndex"],
            data = this.data();

        if (index == -1 || index == null) {
            index = 0;
        }

        if (data != undefined) {
            var selectedRow = data[index];
            if (selectedRow != undefined) {
                retVal = {
                    index: index,
                    value: selectedRow[1],
                    label: selectedRow[0]
                };
            }
        }
        return retVal;
    },

    _label: function() {
        (this._isDrawn) ? this._data(this.data()) : null;
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

});

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ContextMenuMobileWidget.emptyProps = function() {
    return {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray",
        selectedBg: "gray", selectedFont: "normal 12px verdan", selectedColor: "silver"};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ContextMenuMobileWidget.defaultProps = function() {
    return {valName: "selectedItems",  x: "0", y: "0", pWidth : "100", height: "30px", width: "250px", zindex: "auto", enable: true,
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        data: [
            ["Label", "Value", ""]
        ], name: "contextMenu1", border: "",
        label : "Label",
        dragAndDrop: false, resizing: false,
        widgetStyle: "default",
        customCssClasses: "",
        opacity: 1,
        currPage : 1,
        elementsPerPage : WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE

    };
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ContextMenuMobileWidget.inlineEditPropName = function() {
    return "data";
};


    var _props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.dataWithValue,
            {name: "action", type : "idwidgetlist", set: "wparent", get: "wparent", alias : "widget_parent"}
        ]},
        { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.enable
        ]},
        { name: AC.Property.group_names.style, props:[
            AC.Property.style.mobileTheme,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
    ];

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ContextMenuMobileWidget.props = function() {
    return _props;
};

WiziCore_UI_ContextMenuMobileWidget.valuePropName = undefined;

WiziCore_UI_ContextMenuMobileWidget.isField = function() {
    return true;
};

WiziCore_UI_ContextMenuMobileWidget.onClick = "E#WiziCore_UI_ContextMenuMobileWidget#onClick";
WiziCore_UI_ContextMenuMobileWidget.onPreShow = "E#WiziCore_UI_ContextMenuMobileWidget#onPreShow";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ContextMenuMobileWidget.actions = function() {
    return {
        'onClick': {alias: "widget_event_onclick", funcview: "onClick", action: "AC.Widgets.WiziCore_UI_ContextMenuMobileWidget.onClick", params: "value", group: "widget_event_general"},
        'onPreShow': {alias: "widget_event_onpreshow", funcview: "onPreShow", action: "AC.Widgets.WiziCore_UI_ContextMenuMobileWidget.onPreShow", params: "", group: "widget_event_general"}
    };

};

})(jQuery,window,document);
