/**
 * @lends       WiziCore_UI_PopupDropdownMobileWidget#
 */
(function($, windows, document, undefined){

    function findOption(target) {
        return $(target).closest('.ac-list-item');
    }

    function eventCallback(ev) {
        var option = findOption(ev.target);
        if (option.length > 0) {
            var widget = option.data("widget");
            widget && widget.enable() !== false && widget.onItemSelected.call(widget, option, ev);
        }

    }

    function bindSelectEvent() {
        $(document).bind("vclick", eventCallback);

        bindSelectEvent = null;
    }

    var WiziCore_UI_ListMobileWidget = AC.Widgets.WiziCore_UI_ListMobileWidget = AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.extend($.extend({}, WiziCore_Methods_Widget_ActionClick, WiziCore_WidgetAbstract_DataIntegrationAssocArray, {
        _widgetClass:"WiziCore_UI_ListMobileWidget",
        _select:null,
        /**
         * Description of constructor
         * @class       Some words about popup dropdown mobile widget class
         * @author      Timofey Tatarinov
         * @version     0.2
         *
         * @constructs
         */

        draw:function () {
            this._mainCnt = $("<div style='width:100%; height:100%;'></div>");

            this.base().append(this._mainCnt);
            this._super.apply(this, arguments);
        },

        initProps:function () {
            this._super();

//        this.border = this.themeProperty('border', this._border);
            this.imageAsThumbnail = this.themeProperty('imageAsThumbnail', this._redraw);
            this.useImage = this.themeProperty('useImage', this._redraw);
            this.htmlLabel = this.themeProperty('htmlLabel', this._redraw);
            this.inset = this.themeProperty('inset', this._redraw);
            this.useCount = this.themeProperty('useCount', this._redraw);
            this.useFilter = this.themeProperty('useFilter', this._redraw);
            this.numbered = this.themeProperty('numbered', this._redraw);
            this.readOnlyList = this.themeProperty('readOnlyList', this._redraw);
            this.useAside = this.themeProperty('useAside', this._redraw);
            this.dividerTheme = this.themeProperty('dividerTheme', this._redraw);
            this.splitTheme = this.themeProperty('splitTheme', this._redraw);
            this.countTheme = this.themeProperty('countTheme', this._redraw);
            this.highlightSelected = this.normalProperty('highlightSelected');
//        this.selectionTheme = this.normalProperty('selectionTheme');
            this.value = this.htmlPropertyBeforeSet('value', this._filterValue, this._value);
            this.wrap = this.htmlProperty('wrap', this._redraw);
        },

        _redraw:function () {
            this._data(this._project['data']);
        },

        selectElemId:function () {
            return "select-" + this.htmlId();
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
                    var id = (data[i].userData && data[i].userData.id != undefined) ? data[i].userData.id : null;

                    this._processRowValue(id, i, data, oldData, 'label');
                    this._processRowValue(id, i, data, oldData, 'aside');
                    this._processRowValue(id, i, data, oldData, 'image');

                    if (data[i].userData != undefined)
                        data[i].userData = undefined;
                }
            }
            return data;
        },

        _processRowValue: function(id, index, data, oldData, param) {
            var isValueToken = WiziCore_Helper.isLngToken(data[index][param]),
                token, hasToken;
            if (!isValueToken) {
                hasToken = (id != null) && oldData && WiziCore_Helper.isLngToken(oldData[id][param]);
                if (hasToken)
                    token = oldData[id][param];
                else
                    token = WiziCore_Helper.generateId(10, 'ac-');

                this.form().addTokenToStringTable(this.id(), this.name(), token, data[index][param]);
                data[index][param] = token;
            }
        },

        _afterGet: function(data) {
            var ret = WiziCore_Helper.clone(data);

            if ($.isArray(ret)) {
                for (var i = 0, l = ret.length; i < l; i++) {
                    ret[i].userData = {id:i};
                    ret[i]['label'] = this._getTranslatedValue(ret[i]['label']);
                    ret[i]['aside'] = this._getTranslatedValue(ret[i]['aside']);
                    ret[i]['image'] = this._getTranslatedValue(ret[i]['image']);
                }
            }
            return ret;
        },

        _data:function (val) {

            var trState = jQuery.fn.__useTr ;
            jQuery.fn.__useTr = false;

            val && (val = WiziCore_Helper.clone(val));

            if (this._div != undefined) {
                this._div.empty().remove();
            }

            this._div = $('<div/>');
            this._div.attr("id", "selectDiv-" + this.htmlId());

            var div = this._div,
                nodeType = (this.numbered()) ? 'ol' : 'ul',
                selectId = this.selectElemId(),
                label = $('<label class="select">'),
                select = $('<' + nodeType + ' data-role="listview" data-theme="c" data-insert="true"></' + nodeType + '>'),
                useImage = this.useImage(),
                isThumbnail = this.imageAsThumbnail(),
                useCount = this.useCount(),
                readOnly = this.readOnlyList(),
                useAside = this.useAside(),
                self = this;
                //wrap = this.wrap(),
            label.attr("for", selectId);
            select.attr("name", selectId);
            select.attr("id", selectId);
            select.data("divider-theme", this.dividerTheme());
            select.data("count-theme", this.countTheme());
            select.data("split-theme", this.splitTheme());

            if (val){
                var i = 0, l = val.length;
                if (this._isDataManual != undefined) {
                    var res = this._getStartAndLength(l);
                    i = res.i;
                    l = res.l;
                }
                for (; i < l; i++) {
                    var item = val[i],
    //            var optionValue = (this.htmlLabel())? "<p>" + item['label'] + "</p>": WiziCore_Helper.escapeHTMLtags("" + item['label']);
                        labelValue = WiziCore_Helper.isLngToken(item['label']) ? this._getTranslatedValue(item['label']) : item['label'],
                        optionValue = (this.htmlLabel()) ? labelValue : '<h3 class="m-ui-li-heading">' + WiziCore_Helper.escapeHTMLtags("" + labelValue) + '</h3>',
                        option = $("<li>"),
                        a,
                        isDivider = (item['divider'] === true || item['divider'] == "1");

                    if (item['image'] && WiziCore_Helper.isLngToken(item['image']))
                        item['image'] = this._getTranslatedValue(item['image']);

//                    optionValue = WiziCore_Helper.isLngToken(optionValue) ? this._getTranslatedValue(optionValue) : optionValue;
                    item['aside'] = WiziCore_Helper.isLngToken(item['aside']) ? this._getTranslatedValue(item['aside']) : item['aside'];

                    select.append(option);
                    optionValue = this.checkEmptyLabel(optionValue);
                    if (readOnly || isDivider) {
                        option.append(optionValue || "");
                    }
                    else {
                        a = $("<a>" + optionValue + "</a>");
    //                if (wrap) {
    //                    a.css('white-space', "normal");
    //                }
                        option.append(a);
                        option = a;
                    }

                    if (isDivider) {
                        option.data("role", "list-divider");
                        continue;
                    }

                    if (useImage && item['image']) {
                        var img = $("<img />").attr('src', item['image']);
                        if (isThumbnail) {
                            img.addClass('m-ui-li-icon');
                            img.css('max-width', "25px");
                        }
                        option.prepend(img);
                    }
                    if (useCount) {
                        option.append('<p class="m-ui-li-count">' + item['count'] + '</p>');
                    }
                    if (useAside) {
                        option.append('<p class="m-ui-li-aside">' + item['aside'] + '</p>');
                    }
                    option.data('optionValue', item);
                    option.data('pos', i);
                    option.data('widget', this);
                    option.addClass('ac-list-item');
                }
            }
            if (this.useFilter()) {
                select.data('filter', 'true');
            }
            div.append(label);
            div.append(select);
            this._mainCnt.append(this._div);
            this._select = select;
            if (this._isDrawn) {
                this._refresh();
            }
            var value = this.value();
            if (value !== undefined) {
                this._value(value);
            }
            if (bindSelectEvent) {
                bindSelectEvent();
            }
            this.unhighlightWidget();
            this._super();
            jQuery.fn.__useTr = trState;
        },

        unhighlightWidget: function(){
            this._updateSelection();
        },

        _filterValue: function(value){
            if (value !== null && !(value && value.value)){
                value = null;
            }
            return value;
        },

        _value:function (value) {
            if (value === null) {
                this._updateSelection(null);
            } else if (value == null){
                //do nothing
            }
            else
                this.selectItemValue(value.value);
        },

        onItemSelected:function ($btn, ev) {
            var theme = $btn.attr("data-" + $.mobile.ns + "theme");
            $btn.removeClass("m-ui-btn-up-" + theme).addClass("m-ui-btn-down-" + theme);
            var optionValue = $btn.data('optionValue'),
                i = $btn.data('pos');
            this.value(optionValue);
            var self = this;
            setTimeout(function () {
                var res = self.onItemClick.call(self, optionValue, i);
                if (optionValue.action && res !== false) {
                    self.onActionClick(ev, optionValue.action);
                }
                setTimeout(function () {
                    $btn.removeClass("m-ui-btn-down-" + theme).addClass("m-ui-btn-up-" + theme);
                }, 200)
                self._updateSelection(i);
                ev.stopPropagation();
            }, 1);
        },

        _updateSelection:function (pos) {
            if (!this.highlightSelected()) {
                return;
            }
            var theme = this.mobileTheme(),
                remove = 'm-ui-btn-up-' + theme + '  m-ui-btn-active-' + theme;
            this._select.find('li:not(li[role="heading"])') //select without divider
                .removeClass(remove)
                .addClass('m-ui-btn-up-' + theme);
            if (pos != null) {
                this._select.find('li:eq(' + pos + ')')
                    .removeClass(remove)
                    .addClass('m-ui-btn-active-' + theme);
            }

        },

        selectItemValue:function (value) {
            var i, length,
                data = this.data();
            if ($.isArray(data)) {
                for (i = 0, length = data.length; i < length; ++i) {
                    if (data[i].value == value && (data[i].divider == false || data[i].divider == null)) {
                        this._updateSelection(i);
                        break;
                    }
                }
            }
        },

        selectItemPosition:function (position) {
            var data = this.data();
            data && this.value(data[position]);
        },

        onItemClick:function (val, i) {
            this.sendDrillDown(val);
            var triggerEvent = new $.Event(WiziCore_UI_ListMobileWidget.onClick);
            $(this).trigger(triggerEvent, [val, i]);
            return  triggerEvent.returnValue;
        },

        onPageDrawn:function () {
            this._super.apply(this, arguments);
            //this._refresh();
            this._tabindex(this.tabindex());
        },

        _refresh:function () {
            var o = this._getJQMOptions();
            o.inset = this.inset();
            o.wrap = this.wrap();
            o.mobilePerfomance = WiziCore_Helper.isMobile();

            this._div.find('ol,ul').listview(o);
            if (!o.inset){
                //mobile list filter extends if inset is false
                this._div.find(".m-ui-listview-filter").css({"margin": "0px"});
            }
            this._updateEnable();
        },

        value:function () {
            return null;
        },

        _label:function () {
            if (this._isDrawn) {
                this._data(this.data());
            }
        },

        _enable:function (val) {
            if (this._div) {
                val = (val === true) ? "enable" : "disable";
                this._div.find('ol,ul').listview(val);
            }
        },

        initDomState:function () {
            this._super();
//        this._border(this.border());
        },

        getDataModel:function () {
            return [
                {name:"widget_label", uid:"label", direct:true},
                {name:"widget_Count", uid:"count", direct:true},
                {name:"widget_value", uid:"value", direct:true},
                {name:"widget_Aside", uid:"aside", direct:true},
                {name:"widget_Image", uid:"image", direct:true},
                {name:"widget_Divider", uid:"divider", direct:true}
            ];
        },

        getDataFromMap:function (dataArray, map) {
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
        },

        _tabindex:function (value) {
            this._super(value, this.base().find('a'));
        },

        _tabStop:function (val) {
            this._super(val, this.base().find('a'));
        },

        setFocus:function () {
            if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
                this.base().find('a').first().focus();
            }
        },

        collectDataSchema:function (dataSchema) {
            if (!this.isIncludedInSchema()) {
                return undefined;
            }

            var elementDataType = this.dataType() || AC.Widgets.WiziCore_Api_Form.Type.STRING;
            var widgetDescription = {
                'label':this.name(),
                'type':AC.Widgets.WiziCore_Api_Form.Kind.OBJECT,
                'structure':{
                    'value':{
                        'label':null,
                        'type':AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                        'structure':elementDataType
                    },
                    'label':{
                        'label':null,
                        'type':AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                        'structure':AC.Widgets.WiziCore_Api_Form.Type.STRING
                    }
                },
                'unique':this.isUnique()
            };

            if (this.mandatory()) {
                widgetDescription['mandatory'] = true;
            }
            dataSchema[this.id()] = widgetDescription;
            return widgetDescription;
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

    /**
     * Return empty widget prop
     * @return {Object} default properties
     */
    WiziCore_UI_ListMobileWidget.emptyProps = function () {
        return {bgColor:"#f7f7f7", fontColor:"black", font:"normal 12px verdana", border:"1px solid gray",
            selectedBg:"gray", selectedFont:"normal 12px verdan", selectedColor:"silver"};
    };
    /**
     * Return default widget prop
     * @return {Object} default properties
     */
    WiziCore_UI_ListMobileWidget.defaultProps = function () {
        return {valName:"selectedItems", x:"0", y:"0", height:"70", width:"200", zindex:"auto", enable:true,
            anchors:{left:true, top:true, bottom:false, right:false}, visible:true,
            data:[
                {value:'l1', label:"Label1", image:"", count:"1", aside:"aside", divider:false},
                {value:'l2', label:"Label2", image:"", count:"1", aside:"aside", divider:false}
            ], name:"MobileList", border:"",
            label:"Label",
            dragAndDrop:false, resizing:false, displayHourglassOver: "inherit",
            widgetStyle:"default",
            alignInContainer:'left',
            inset:true, htmlLabel:false, mobileTheme:"c", countTheme:"c", dividerTheme:"b", selectionTheme:"a",
            highlightSelected:false,
            customCssClasses: "",
            currPage:1,
            opacity:1,
            elementsPerPage:WiziCore_Source_Widget_PagingAPI.DEFAULT_ELEMENTS_PER_PAGE,
            wrap:false

        };
    };

    /**
     * Return default inline edit prop
     * @return {Object} default inline edit prop
     */
    WiziCore_UI_ListMobileWidget.inlineEditPropName = function () {
        return "data";
    };


    var _props = [
        { name:AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.elementsPerPage,
            AC.Property.general.currPage,
            AC.Property.general.assocData,
            {name:"highlightSelected", type:"boolean", set:"highlightSelected", get:"highlightSelected", alias:"widget_highlightSelected"}
        ]},
        { name:AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.dataType,
            AC.Property.database.isUnique,
            AC.Property.database.mandatory
        ]},
        { name:AC.Property.group_names.layout, props:[
            AC.Property.layout.pWidthHidden,
            AC.Property.layout.widthHidden,
            AC.Property.layout.heightHidden,
            AC.Property.layout.sizes,
            AC.Property.layout.minWidth,
            AC.Property.layout.maxWidth,
            AC.Property.layout.x,
            AC.Property.layout.y,
            AC.Property.layout.repeat,
            AC.Property.layout.zindex,
            AC.Property.layout.tabindex,
            AC.Property.layout.tabStop,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer
        ]},
        { name:AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable
        ]},
        { name:AC.Property.group_names.data, props:[
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
        { name:AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.imageAsThumbnail,
            AC.Property.style.useImage,
            AC.Property.style.useCount,
            {name:"inset", type:"boolean", set:"inset", get:"inset", alias:"widget_inset"},
            {name:"htmlLabel", type:"boolean", set:"htmlLabel", get:"htmlLabel", alias:"widget_htmlLabel"},
            {name:"wrap", type:"boolean", set:"wrap", get:"wrap", alias:"widget_wrap"},
            AC.Property.style.useFilter,
            AC.Property.style.numbered,
            AC.Property.style.readOnlyList,
            AC.Property.style.useAside,
            AC.Property.style.margin,
            AC.Property.style.mobileTheme,
            {name:"dividerTheme", type:"mobileThemeExt", set:"dividerTheme", get:"dividerTheme", alias:"widget_dividerTheme"},
//        {name: "splitTheme", type : "mobileTheme", set: "splitTheme", get: "splitTheme", alias : "widget_splitTheme"},
            {name:"countTheme", type:"mobileTheme", set:"countTheme", get:"countTheme", alias:"widget_countTheme"},
//        {name: "selectionTheme", type : "mobileTheme", set: "selectionTheme", get: "selectionTheme", alias : "widget_selectionTheme"},
            AC.Property.general.displayHourglassOver,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
    ];

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    WiziCore_UI_ListMobileWidget.props = function () {
        return _props;
    };
    WiziCore_UI_ListMobileWidget.onClick = 'Event#ListMobile#onClick';
    /**
     * Return available widget actions
     * @return {Object} available actions
     */
    WiziCore_UI_ListMobileWidget.actions = function () {
        return {
            'onClick':{alias:"widget_event_onclick", funcview:"onClick", action:"AC.Widgets.WiziCore_UI_ListMobileWidget.onClick", params:"value, pos", group:"widget_event_general"},
            'dataLoaded':{alias:"widget_event_ondataloaded", funcview:"onDataLoaded", action:"AC.Widgets.Base.onDataLoaded", params:"error, data", group:"widget_event_data"}
        };

    };

    WiziCore_UI_ListMobileWidget.valuePropName = undefined;


    WiziCore_UI_ListMobileWidget.isField = function () {
        return true;
    };

})(jQuery,window,document);