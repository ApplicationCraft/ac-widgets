/**
 * @lends       WiziCore_UI_PopupDropdownMobileWidget#
 */
(function($, window, document, undefined){
    function findOption(target) {
        return $(target).closest('.ac-navbar-item');
    }

    function eventCallback(ev) {
        var option = findOption(ev.target);
        if (option.length > 0) {
            var widget = option.data("widget");
            widget && widget.enable() !== false && widget._isParentEnable() !== false && widget._itemClickCallback.call(widget, ev, option.data("optionValue"), option.data("label"), option.data("position"));
        }

    }

    function bindSelectEvent() {
        $(document).bind("vclick", eventCallback);

        bindSelectEvent = null;
    }

    var WiziCore_UI_NavBarMobileWidget = AC.Widgets.WiziCore_UI_NavBarMobileWidget =  AC.Widgets.WiziCore_UI_SingleSelectMobileWidget.extend($.extend({}, WiziCore_Methods_Widget_ActionClick, {
        _widgetClass: "WiziCore_UI_NavBarMobileWidget",
        _select: null,
        _selectedIndex: null,
        /**
         * Description of constructor
         * @class       Some words about popup dropdown mobile widget class
         * @author      Timofey Tatarinov
         * @version     0.2
         *
         * @constructs
         */
        init: function() {
            this._super.apply(this, arguments);

            //this is fix for wrong data format...
            var data = this._project['data'],
                item,
                res;
            if (data && $.isArray(data)){
                for (var i = 0, l = data.length; i < l; i++){
                    item = data[i];
                    if (item['icon']){
                        res = this.getUserIconResource(item['icon']);
                        if (res){
                            item['icon'] = res;
                        }
                    }
                }
            }
        },
        _itemClickCallback: function(ev, optionValue, label, i) {
            this._setButtonActiveState(ev);
            var that = this,
                app = this.form();
            setTimeout(function(){
                if (app && !app.isDestroyed()){
                    var res = that.onItemClick.call(that, label, i);
                    if (optionValue.action && res !== false){
                        that.onActionClick(ev, optionValue.action, app);
                    }
                }
                ev.stopPropagation();
            },100);
        },
        _setButtonActiveState: function(ev){
            var el = $(ev.target).closest("a");
            var mobileTheme = this.mobileTheme();
            if (!el.hasClass("m-ui-disabled")){
                var allElements = this._mainCnt.find("a");
                allElements.removeClass( $.mobile.activeBtnClass + " m-ui-btn-active-" + mobileTheme );
				el.addClass( $.mobile.activeBtnClass + " m-ui-btn-active-" + mobileTheme );
            }
        },
        draw: function() {
//        this._mainCnt = $("<div style='width:100%; height:100%;'></div>");
            this._super.apply(this, arguments);
            var self = this;
            $(this.form()).bind(AC.Widgets.WiziCore_Api_Form.PageChanging.onShow+ "." + this.id(), function(ev, page){
                self.updateActiveBtnByPage(page);
            });
        },

        onRemove: function(){
            $(this.form()).unbind(AC.Widgets.WiziCore_Api_Form.PageChanging.onShow + "." + this.id());
        },

        initProps: function() {
            this._super();

//        this.border = this.themeProperty('border', this._border);
            this.useImage = this.themeProperty('useImage', this._redraw);
            this.iconPosition = this.themeProperty('iconPosition', this._redraw);
            this.inset = this.themeProperty('inset', this._redraw);
            this.customImageStyle = this.themeProperty("customImageStyle", this._updateUserImages);
//        this.selectionTheme = this.htmlProperty('selectionTheme', this._redraw);
        },

        _redraw: function() {
            this._data(this._project['data']);
        },

        selectElemId: function() {
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
                }
            }
            return ret;
        },

        _data: function(val) {
            var trState = jQuery.fn.__useTr ;
            jQuery.fn.__useTr = false;

            if (this._mainCnt != undefined) {
                this._mainCnt.empty().remove();

            }
            this._mainCnt = $("<div style='width:100%; height:100%;'></div>");
            this.base().append(this._mainCnt);
            var navbar = $('<div data-role="navbar"></div>'),
                list = $('<ul>'),
                useImage = this.useImage();
                //iconPos = this.iconPosition(
            if (!this.inset()) {
                navbar.addClass("m-ui-bar-" + this.mobileTheme());
                navbar.css("border", "0");
            }
            navbar.append(list);
            if (val){
                for (var i = 0, l = val.length; i < l; i++) {
                    var item = val[i];
                    if (item['visible'] == false) {
                        continue;
                    }

                    var icon = item['icon'],
                        optionValue = WiziCore_Helper.isLngToken(item['label']) ? this._getTranslatedValue(item['label']) : item['label'],
                        option = $("<li>"),
                        link = $("<a>" + optionValue + "</a>"),
                        isCurrentPage = this._checkCurrentPage(item.action);

                    if (useImage && icon && icon != 'local' && icon != "none") {
                        var data_icon = icon,
                            res_icon = this.getUserIconResource(icon);
                        if (res_icon){
                            data_icon = 'user-icon';
                            link.attr("data-userlink", res_icon);
                        }
                        link.attr('data-icon', data_icon);//.attr('data-iconpos', iconPos);

                    }
                    if (isCurrentPage) {
                        link.addClass('m-ui-btn-active');
                    }
                    link.data('widget', this);
                    link.data('optionValue', item);
                    link.data('label', optionValue);
                    link.data('position', i);
                    link.addClass('ac-navbar-item');
                    //link.click(callback(item, optionValue, i));

                    option.append(link);

                    list.append(option);
                }
            }
            bindSelectEvent && bindSelectEvent();
            this._mainCnt.append(navbar);
            if (this._isDrawn) {
                this._refresh();
            }
            this._super();
            jQuery.fn.__useTr = trState;
        },

        updateActiveBtnByPage: function(page) {
            if (page !== undefined && this._mainCnt) {
                var data = this.data();
                if (data){
                    for (var i = 0, l = data.length; i < l; ++i) {
                        if (this._checkCurrentPage(data[i]['action'], page)) {
                            this.selectByPos(i);
                            break;
                        }
                    }
                }
            }
        },

        selectByPos: function(i) {
            var uiActive = 'm-ui-btn-active',
                theme = uiActive + '-' + this.mobileTheme();
            this._mainCnt.find('a').removeClass(theme + " " + uiActive);
            this._mainCnt.find('a:eq(' + i + ')').addClass(theme);
            this._selectedIndex = i;
        },

        selectByPage: function(value) {
            var page = value;
            if (typeof value == "string") {
                page = {
                    name: function() {
                        return value;
                    },
                    id: function() {
                        return value;
                    }
                };
            }
            this.updateActiveBtnByPage(page);
        },


        _checkCurrentPage: function(action, page) {
            if (action) {
                var page = page? page : this.page();
                if (page && (page.name() == action || page.id() == action)) {
                    return true;
                }
            }
            return false;
        },

        onItemClick: function(val, i) {
            var triggerEvent = new $.Event(WiziCore_UI_NavBarMobileWidget.onClick);
            $(this).trigger(triggerEvent, [val, i]);
            var isStopped = triggerEvent.isPropagationStopped();
            if (!isStopped) {
                this.sendDrillDown(val['value']);
            }
            return !isStopped;
        },

        onPageDrawn: function() {
            this._super.apply(this, arguments);
            this._refresh();
        },

        _refresh: function() {
            var o = this._getJQMOptions(),
                inset = this.inset() === true;
            o.iconpos = this.iconPosition();
            o.shadow = inset;
            o.corners = inset;
            this._mainCnt.find(":jqmData(role='navbar')").navbar(o);
            this._updateEnable();
            this._updateUserImages();
        },

        _updateUserImages: function(){
            //update user Images
            var style = this.customImageStyle(), self = this;
            var haveStandardIcons = this._mainCnt.find('a[data-icon!="user-icon"]').length > 0;
            var haveUserIcons = this._mainCnt.find('a[data-icon="user-icon"]').length > 0;
            if (!haveUserIcons){
                this.cssClassUpdate(this.base(), "ac-icon-padding-top-", "");
            } else {
                if (haveStandardIcons && style.height){
                    style.height = Math.round(style.height);
                    style.height = (style.height < 18) ? 18 : style.height;
                }
            }
            this._mainCnt.find('a[data-icon="user-icon"]').each(function(){
                var link = $(this);
                if (link.attr("data-icon") == "user-icon"){
                    if (style){
                        link.addClass("ac-custom-images");
                        if (style.width) {
                            var margin = Math.round(style.width/2);
                            var width = Math.round(style.width);
                            self.cssClassUpdate(link, "ac-icon-width-", width);
                            self.cssClassUpdate(link, "ac-icon-margin-left-", margin);
                        } else {
                            self.cssClassUpdate(link, "ac-icon-width-", "");
                            self.cssClassUpdate(link, "ac-icon-margin-left-", "");
                        }
                        if (style.height){
                            var height = Math.round(style.height);
                            self.cssClassUpdate(link, "ac-icon-height-", height);
                            var padding_top = height - 18 + 33; //18 is icon height in jqm, 33 is padding-top
                            self.cssClassUpdate(self.base(), "ac-icon-padding-top-", padding_top);
                        } else {
                            self.cssClassUpdate(link, "ac-icon-height-", "");
                            self.cssClassUpdate(self.base(), "ac-icon-padding-top-", "");
                        }
                    } else {
                        link.removeClass("ac-custom-images");
                        self.cssClassUpdate(self.base(), "ac-icon-padding-top-", "");
                        self.cssClassUpdate(link, "ac-icon-height-", "");
                        self.cssClassUpdate(link, "ac-icon-width-", "");
                        self.cssClassUpdate(link, "ac-icon-margin-left-", "");
                    }
                }
            });
        },

        _enable: function(val) {
            if (this._mainCnt) {
                var method = (val === true) ? "enable" : "disable";
                var el = this._mainCnt.find(":jqmData(role='navbar')");
                el.data("navbar") && el.navbar(method);
                (val !== true) ? this._mainCnt.find('.ac-navbar-item').addClass('wa-disable-cursor') : this._mainCnt.find('.ac-navbar-item').removeClass('wa-disable-cursor');

            }
        },

        value: function(i) {
            if (i !== undefined) {
                this.selectByPos(i);
            }
            return this._selectedIndex;
        },

        /**
         * Get or set the visibility of NavBar item by item index
         * @param itemIndex from 0
         * @param isVisible boolean
         */
        itemVisibility: function(itemIndex, isVisible) {
            var res = null,
                items = this.data();

            if ($.isArray(items)) {
                var specifiedItem = items[itemIndex];
                if (specifiedItem) {
                    if (isVisible != undefined && specifiedItem.visible != isVisible) { //redraw only if visibility changed
                        specifiedItem.visible = isVisible;
                        this.data(items);
                    }
                    res = specifiedItem.visible;
                }
            }

            return res;
        },

        initDomState : function () {
            this._super();
//        this._border(this.border());
        },

        getDataModel: function() {
            return [
                {name: "widget_label", uid: "label"},
                {name: "widget_icon", uid: "icon"},
                {name: "widget_action", uid: "action"},
                {name: "widget_visible", uid: "action"}
            ];
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
    }));

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_NavBarMobileWidget.emptyProps = function() {
    return {bgColor: "#f7f7f7", fontColor: "black", font: "normal 12px verdana", border: "1px solid gray",
        selectedBg: "gray", selectedFont: "normal 12px verdana", selectedColor: "silver"};
};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_NavBarMobileWidget.defaultProps = function() {
    return {valName: "selectedItems",  x: "0", y: "0", height: "30", width: "320", zindex: "auto", enable: true,
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        data: [
            {label: "Page1", image: ""},
            {label: "Page2", image: ""}
        ], name: "NavBar", border: "",
        customImageStyle: {},
        dragAndDrop: false, displayHourglassOver: "inherit",
        widgetStyle: "default",
        alignInContainer: 'left',
        customCssClasses: "",
        htmlLabel: false, mobileTheme: "a",
        iconPosition: 'top',
        pWidth: 100,
        inset: false

    };
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_NavBarMobileWidget.inlineEditPropName = function() {
    return "data";
};


var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        {name: "data", type : "navbarData", set: "data", get: "data", alias : "widget_records"}
    ]},
    { name: AC.Property.group_names.layout, props:[
        AC.Property.layout.pWidthHidden,
        AC.Property.layout.widthHidden,
        AC.Property.layout.heightHidden,
        AC.Property.layout.sizes,
        AC.Property.layout.minWidth,
        AC.Property.layout.maxWidth,
        AC.Property.layout.repeat,
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.zindex,
        AC.Property.layout.tabindex,
        AC.Property.layout.tabStop,
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.visible,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.useImage,
        AC.Property.style.margin,
        AC.Property.style.mobileTheme,
        AC.Property.style.mobileButtonIconPos,
        {name: "inset", type : "boolean", set: "inset", get: "inset", alias : "widget_inset"},
        {name: "customImageStyle", type: "imgsizes", set: "customImageStyle", get: "customImageStyle", alias: "widget_custom_image_style"},
//        {name: "selectionTheme", type : "mobileTheme", set: "selectionTheme", get: "selectionTheme", alias : "widget_selectionTheme"},
//        {name: "countTheme", type : "mobileTheme", set: "countTheme", get: "countTheme", alias : "widget_countTheme"},
        AC.Property.general.displayHourglassOver,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_NavBarMobileWidget.props = function() {
    return _props;
};
WiziCore_UI_NavBarMobileWidget.onClick = 'Event#NavBarMobile#onClick';
/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_NavBarMobileWidget.actions = function() {
    return {
        'onClick': {alias: "widget_event_onclick", funcview: "onClick", action: "AC.Widgets.WiziCore_UI_NavBarMobileWidget.onClick", params: "label, pos", group: "widget_event_general"}
    };

};

WiziCore_UI_NavBarMobileWidget.valuePropName = undefined;



WiziCore_UI_NavBarMobileWidget.isField = function() {
    return true;
};

})(jQuery,window,document);