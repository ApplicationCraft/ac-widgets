/**
 * @lends       WiziCore_UI_TabWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_TabWidget = AC.Widgets.WiziCore_UI_TabWidget =  AC.Widgets.WiziCore_Widget_Container.extend({
    _widgetClass : "WiziCore_UI_TabWidget",
    _div : null,
    _menu : null,
    _menuHeight: 0,
    _activeTabColor : null,
    _inactiveTabColor : null,
    _useColors : true,

    /**
     * Description of constructor
     * @class       Tab widget
     * @author      Timofey Tatarinov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
        //this._tabsBefore(this.tabs() );
    },

    draw : function() {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        this._div = $("<div>").css({width: "100%", "min-height": this.height(), "background-color":"transparent"});
        var muid = "TabMenu_" + this.htmlId();
        this._menu = $("<ul>");
        this._menu.attr("id", muid);
        this._div.append(this._menu);

        var tabs = this._project['tabs'];
        var children = this.children();
        if (tabs.rows != undefined) {
            //fix for new tabs
            if (tabs.rows.length == 1 && children.length == 0) {
                this._tabsBefore(tabs);
            }

            for (var i = 0, l = tabs.rows.length; i < l; i++) {
                if (children[i] != undefined) {
                    this.drawTab(children[i], tabs.rows[i].data[1], true);
                    tabs.rows[i].id = children[i].id(); // fix for old tabs. 'id' must be like 'id' of children
                }
            }
        }
        this.base().prepend(this._div).addClass("ui-widget-content");

        //this._div.tabs();

        this._super.apply(this, arguments);
        if (this.form().currentPage()._isDrawn){//page is drawn
            this.onPageDrawn();
        }
        jQuery.fn.__useTr = trState;
    },

    initProps: function() {
        this._super();
        this.tabs = this.htmlPropertyBeforeSetAfterGet('tabs', this._tabsBefore, this._tabsAfter, this._tabsAfterGet);
        //this.data = this.normalProperty('data');

        this.shadow = this.themeProperty('shadow', this._shadow);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._updateReadonly);

        this.font = this.themeProperty('font', this._font);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);

        this.menuFontColor = this.themeProperty('menuFontColor', this.updateTabsFontColor);
        this.menuBGColor = this.themeProperty('menuBGColor', this._menuBGColor);
        this.tabBGColors = this.themeProperty('tabBGColors', this._tabBGColors);

    },

    initDomState : function () {
        this._super();
        //this.initDomStatePos();

        this._visible(this.visible());
        this._opacity(this.opacity());
        this._shadow(this.shadow());
        this._updateEnable();
        this._updateReadonly();

        this._font(this.font());
        this._bg(this.bg());
        this._border(this.border());
        this._borderRadius(this.borderRadius());

        this._menuBGColor(this.menuBGColor());
        this.updateTabsFontColor(this.menuFontColor());
        //this._tabBGColors(this.tabBGColors() );
    },

    drawChildren: function() {
        //this._tabsAfter(this.tabs() );
        var children = this.children();
        var child = children[0];
        child._manualDrawPosition = false;
        if (child != undefined) {
            var div = $(this.base().find("#" + this.generateTabItemId(child.htmlId())));
            if (div.length != 0) {
                child.draw(div);
            }
        }
    },

    onPageDrawn : function() {
//        this._super.apply(this, arguments);
        var self = this;
        if (this._div == null) {
            return;
        }
        this._div.tabs({
            remove: function() {
                self.removeInlay();
            },
            show: function(event, ui) {
                $(ui.panel).css('padding', '0');
                var index = ui.index;
                if (self._isDrawn) {
                    var children = self.children(), child;
                    for (var i = 0, l = children.length; i < l; i++) {
                        child = children[i];
                        if (child != undefined) {
                            child.onParentVisibleChanged(index == i);
                        }
                    }

                    child = children[index];
                    if (child != undefined) {
                        if (!child._isDrawn) {
                            child.draw($(ui.panel));
                            child.onPageDrawn();
                            self.updateContainerSizeAndPosition(child);
                        }
                    }
                    self.updateTabState();
                    //self.showChildren();
                }
            },
            add: function() {
                if (self._isDrawn) {
                    self.addInlay();
                }
            },
            select: function(ev, ui){
                self.onTabSelected(ev, ui);
            }
        });
        this._tabBGColors(this.tabBGColors());
        this.updateTabsFontColor();
        this._updateEnable();

        var children = this.children();
        var child = children[0];
        if (child != undefined) {
            child.onPageDrawn();
            this.updateContainerSizeAndPosition(child);
        }
        //this.updateAllContainerSizeAndPosition();
    },

    createChild: function(){
        var child = this._super.apply(this, arguments);
        child.isDraggable = this;
        child.isEditable = false;
        child.isResizable = false;
        child._manualDrawPosition = false;
        return child;
    },

    _updateLayout: function(){
        this._super();
        this._div.css("min-height", this.height());
        //this._div.height(this.height());
        this.updateAllContainerSizeAndPosition();
    },

    layoutEx: function(){
        return 'vertical';
    },

    currentContainer: function() {
        return this.getCurrentTab();
    },

    /**
     * Call children widget to show their content
     */
    showChildren: function() {
        var containers = this.children();
        for (var i in containers) {
            var container = containers[i];
            if (!container.base().is(":hidden")) {
                var children = container.children();
                for (var j in children) {
                    if (children[j].showWidgetByParent != undefined) {
                        children[j].showWidgetByParent();
                    }
                }
            }
        }
    },

    initEditorLayer: function() {
        this._super.apply(this, arguments);
        if (this._modeObject != null) {
            this._modeObject.hide();
        }
    },

    updateTabState : function() {
        this.updateTabColors();
    },

    /**
     * Generate tab content id
     * @private
     * @param {String} id  tab id
     * @return {String} tabDataId tab content id
     */
    generateTabContentId : function(id) {
        return 'TabContent_' + id;
    },

    addInlay : function() {
        // set visualize properties for new tab
        this._borderRadius(this.borderRadius());
        this.updateTabColors();
        this._font(this.font());
        this.updateTabsFontColor();
    },

    removeInlay : function() {

    },

    /**
     * Find tab by id
     * @private
     * @param {String} id tab id
     * @return {Number} found index else -1
     */
    findTab : function(id) {
        for (var i = 0; i < this.children().length; ++i) {
            if (this.children()[i].id() == id) {
                return i;
            }
        }
        return -1;
    },

    /**
     * Remove tab
     * @param tabIndex
     */
    removeTab : function(tabIndex) {
        if (tabIndex >= 0) {
            this.deleteItem(this.children()[tabIndex]);
            this._div.tabs("remove", tabIndex);
        }
    },

    createNewTab : function() {
        var propsDefault = AC.Core.Widgets().getDefaultWidgetProperties("WiziCore_Widget_Container");
        propsDefault['width'] = '100%';
        propsDefault['height'] = '100%';
        var newContainer = this.addNewWidget({widgetClass: "WiziCore_Widget_Container", project: propsDefault});
        return newContainer;
    },

    generateTabItemId : function(id) {
        return ("TabItem_" + id);
    },

    createEmptyDivOnWidget : function(id) {
        var div = $("<div>");
        div.attr("id", this.generateTabItemId(id));
        //this._div.append(div);
        return div;
    },

    generateTabTitleId : function(tabContentId) {
        return "Tabtitle_" + tabContentId;
    },

    drawTab: function(tab, title, isSimple) {
        //var div = this.createEmptyDivOnWidget(tab.data.id);
        isSimple = (isSimple == undefined) ? false : isSimple;
        var tabId = tab.htmlId();
        var id = this.generateTabItemId(tabId);
        var titleId = this.generateTabTitleId(tabId);
        var isToken = WiziCore_Helper.isLngToken(title),
            text = isToken ? this._getTranslatedValue(title) : title;
        if (this.base().find("#" + titleId).length == 0) {
            if (isSimple) {
                var li = $("<li>").append(
                        $("<a>").attr("href", "#" + id).append(
                                $("<span>").attr("id", titleId).html(text)));

                if (isToken)
                    li.find('span').attr("data-lng", title);

                this._menu.append(li);
                var div = $("<div>").attr("id", id);
                this._div.append(div);
            } else {
                var spanSrc = isToken ? "<span id=" + titleId + " data-lng=" + title + ">" + text + "</span>" : "<span id=" + titleId + ">" + text + "</span>";
                this._div.tabs("add", "#" + id, spanSrc);
                this._updateEnable();
            }
        }
        this.updateAllContainerSizeAndPosition();
    },

    getMenuHeight: function(){
        var menuH = 0;
        if (this._menu != null){
            var menu = this._menu;
            menuH = menu.height();
            if (menuH == 0){
                //fix for getting right height value of hidden elements
                var oldCss = {left: menu.css("left"), top: menu.css("top")};
                var parent = menu.parent();
                var tmp = $("<div>")
                        .attr("style", parent.attr("style"))
                        .attr("class", parent.attr("class"))
                        .css({left: "-9000px", top: "-9000px"});
                tmp.append(menu);
                $(document.body).append(tmp);
                menuH = menu.height();
                parent.prepend(menu);
                menu.css(oldCss);
                tmp.remove().empty();
            }
        }
        return menuH;

    },

    updateContainerSizeAndPosition : function(container) {
        var tab = this.getCurrentTab();
        if (tab == null || !container._isDrawn || !tab._isDrawn) {
            return null;
        }

        var border = (this.mode() == WiziCore_Visualizer.EDITOR_MODE) ? 2 : 0;
        var height = parseInt(this.height() - this.getMenuHeight() - border - 1, 10);
        container.height(height);
        container.width(parseInt(this.width(), 10) - border);
        container.base().width("100%");
    },

    updateAllContainerSizeAndPosition : function(bindMenu) {
        if (!this._isDrawn) {
            return;
        }
        var children = this.children();
        for (var i = 0, l = children.length; i < l; ++i) {
            this.updateContainerSizeAndPosition(children[i]);
        }
        if (this._menu == null) {
            return;
        }
    },

    updateTabTitle : function(tab, title) {
        if (tab != undefined) {
            var tabEl = $("#" + this.generateTabTitleId(tab.htmlId())),
                trVal = this.getTrValueAddLngAttr(title, tabEl);
            tabEl.html(trVal);
        }
    },

    _getIndexById: function(index){
        var indexById = this.findTab(index);
        index = (indexById >= 0) ? indexById : index;
        return index;
    },

    selectTab: function(index){
        index = this._getIndexById(index);
        //check for visible:
        if (this._div.data("tabs") && !$(this._div.data("tabs").panels[index]).is(":visible")){
            this._div.tabs("select", index);
        }
    },

    enableTab: function(index, mode){
        index = this._getIndexById(index);
        var eType = (mode) ? "enable" : "disable";
        this._div.tabs(eType, index);
    },

    visibleTab: function(index, mode){
        if (this._menu){
            var currTabIndex = this.getCurrentTabIndex(),
                self = this;
            function setVisible(ind){
                ind = self._getIndexById(ind);
                if (currTabIndex != ind){
                    var eType = (mode) ? "show" : "hide";
                    var tab = self._menu.children().eq(ind),
                        cont = $(self._div.data("tabs").panels[ind]);
                    tab[eType]();
                    cont[eType]();
                }
            }
            
            if ($.isArray(index)){
                for (var i = 0, l = index.length; i < l; i++){
                    setVisible(index[i]);
                }
            } else {
                setVisible(index);
            }
        }
    },

    getCurrentTabIndex: function(){
        var selected = this._div.tabs("option", "selected");
        selected = $.isNumeric(selected) ? selected : -1;
        return selected;
    },

    getCurrentTab : function() {
        // get selected index
        var selIndex = this.getCurrentTabIndex();
        if (selIndex < 0) {
            return null;
        }
        var tabIndex = this.findTab(this.tabs().rows[selIndex].id);
        return this.children()[tabIndex];
    },


    _onInitLanguage: function() {
        this._super();
        this.tabs(this.tabs());
    },

    _onSTUpdated: function() {
        this._super();
        var form = this.form(),
            data = form.stringTable();
        if (form.language() && data)
            AC.AppLng().trElement(this.base(), data[0], form.language(), form.languages().defaultLng);
    },

    _tabsBefore : function(value) {
        // create tab containers
        // change row ids to containers ids

        var valueRows = value.rows, i, j, l;
        var newIds = [];
        var oldData,
            form = this.form(),
            prevShowLng = form._showLngTokens,
            hasLanguage = form.language() != null;

        form._showLngTokens = true;
        oldData = this.tabs();
        form._showLngTokens = prevShowLng;

        for (i = 0, l = valueRows.length; i < l; i++) {
            var row = valueRows[i];
            var foundIndex = this.findTab(row.id);
            if (foundIndex < 0) {
                // if tab not exist create new tab
                var tab = this.createNewTab();
                row.id = tab.id();
            }
            newIds.push(row.id);

            if (hasLanguage && !form._skipTokenCreation && oldData.rows) {
                var id = (row.data.userData && row.data.userData.id != undefined) ? row.data.userData.id : null,
                    isValueToken = WiziCore_Helper.isLngToken(row.data[1]),
                    token, hasToken;
                if (!isValueToken) {
                    hasToken = (id != null) && WiziCore_Helper.isLngToken(oldData.rows[id].data[1]);
                    if (hasToken)
                        token = oldData.rows[id].data[1];
                    else
                        token = WiziCore_Helper.generateId(10, 'ac-');

                    this.form().addTokenToStringTable(this.id(), this.name(), token, row.data[1]);
                    row.data[1] = token;
                }
            }
            if (row.data.userData != undefined)
                row.data.userData = undefined;
        }
        // delete removed tabs
        var idsForDeleting = [];
        var children = this.children();
        for (j = 0, l = children.length; j < l; j++) {
            var tabExist = false;
            var childId = children[j].id();
            for (var kl = 0; kl < newIds.length; kl++) {
                if (childId == newIds[kl]) {
                    tabExist = true;
                    break;
                }
            }
            if (!tabExist) {
                idsForDeleting.push(children[j].id());
            }
        }
        for (var k = idsForDeleting.length - 1; k >= 0; --k) {
            var foundIndexForDeleting = this.findTab(idsForDeleting[k]);
            this.removeTab(foundIndexForDeleting);
        }
        return value;
    },

    _tabsAfter : function(value) {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        if (value != undefined) {
            var valueRows = value.rows;
            var children = this.children();
            for (var i = 0, l = valueRows.length; i < l; i++) {
                var row = valueRows[i];
                var foundIndex = this.findTab(row.id);
                var currTab = children[foundIndex];
                if (!currTab._isDrawn) {
                    this.drawTab(currTab, row.data[1]);
                }
                // update tab
                var title = row.data[1];
                this.updateTabTitle(currTab, title);
            }
        }
        jQuery.fn.__useTr = trState;
        return value;
    },

    _tabsAfterGet: function(value) {
        var ret = WiziCore_Helper.clone(value),
            rows, i, l, row;

        if (ret && ret.rows) {
            rows = ret.rows;
            for (i = 0, l = rows.length; i < l; i++) {
                row = rows[i];
                row.data[1] = this._getTranslatedValue(row.data[1]);
                row.data.userData = {id: i};
            }
            return ret;
        } else
            return value;
    },

    useColors : function(value) {
        if (value != undefined) {
            this._useColors = value;
        }
        return this._useColors;
    },

    _tabBGColors : function(tabColors) {
        this.useColors((tabColors.useColors != undefined) ? tabColors.useColors : this._useColors);
        if (this.useColors()) {
            var colors = tabColors.colors;
            if (colors != undefined) {
                if (colors.length == 2) {
                    this._activeTabColor = colors[0];
                    this._inactiveTabColor = colors[1];
                }
            }
        }
        else {
            this._activeTabColor = "#dddddd";
            this._inactiveTabColor = "#eeeeee";
        }
        this.updateTabColors();
    },

    updateTabColors : function() {
        // reset all tab colors to inactive
        var self = this;
        var id;
        var children = this.children();
        for (var i = 0, l = children.length; i < l; ++i) {
            id = this.generateTabItemId(children[i].htmlId());
            this.base().find("a[href='#" + id + "']").each(function() {
                $(this).parent().css("background", (self._inactiveTabColor == null) ? "" : self._inactiveTabColor);
            });
        }
        var currTab = this.getCurrentTab();
        if (currTab != null) {
            id = this.generateTabItemId(currTab.htmlId());
            this.base().find("a[href='#" + id + "']").each(function() {
                $(this).parent().css("background", (self._activeTabColor == null) ? "" : self._activeTabColor);
            });
        }
    },

    _enable: function(flag) {
        if (this._div != null) {
            var isTabble = this._div.data("tabs");
            if (flag === false) {
                var ret = [];
                for (var i = 0, l = this.children().length; i < l; i++) {
                    ret.push(i);
                }
                //disable
                isTabble && this._div.tabs('option', 'disabled', ret);
            } else {
                //enable
                isTabble && this._div.tabs('option', 'disabled', []);
            }

        }
    },

    _font: function(val) {
        var children = this.children();
        for (var i = 0, l = children.length; i < l; ++i) {
            var id = children[i].htmlId();
            this._super(val, this._div.find("#" + this.generateTabTitleId(id)));
            //$("#" + this.generateTabTitleId(id)).css(obj);
        }
        this.updateAllContainerSizeAndPosition();
    },

    _borderRadius: function(val) {
        if (val != undefined) {
            var base = this._div;
            this._super(val, base);

            if (this._menu != null) {
                var menuChildren = this._menu.children();
                var menuVal = val + "px " + val + "px " + "0px" + " " + "0px";
                this._super(menuVal, this._menu);
                this._super(menuVal, menuChildren);
            }

            this._super(val);
        }
    },

    updateTabsFontColor : function() {
        // reset all tab colors to inactive
        var self = this;
        var children = this.children();
        for (var i = 0, l = children.length; i < l; ++i) {
            var id = self.generateTabItemId(children[i].htmlId());
            self.base().find("a[href='#" + id + "']").each(function() {
                $(this).css("color", self.menuFontColor());
            });
        }
    },



    onTabSelected: function(ev, ui){
        var triggerEvent = new $.Event(WiziCore_UI_TabWidget.onTabSelected),
            selTab = this.children()[ui.index];

        $(this).trigger(triggerEvent, [ui.index, selTab]);
    },

    _menuBGColor : function(value) {
        this._menu.css("background", value);
    }
});

    WiziCore_UI_TabWidget.onTabSelected = "E#TabContainer#onTabSelected";

    var evs = {
        onTabSelected : {alias : "widget_event_ontabselected", funcview : "onTabSelected", action : "AC.Widgets.WiziCore_UI_TabWidget.onTabSelected", params : "index, tabContainer", group : "widget_event_general"}
    };
    // append base actions
    WiziCore_UI_TabWidget.actions = function() {
        return evs;
    };


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_TabWidget.emptyProps = function() {
    return {border : ""};
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.tabs
        //AC.Property.general.data
    ]},
    { name: AC.Property.group_names.layout, props:[
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.pWidthHidden,
        AC.Property.layout.widthHidden,
        AC.Property.layout.heightHidden,
        AC.Property.layout.sizes,
        AC.Property.layout.minWidth,
        AC.Property.layout.maxWidth,
        AC.Property.layout.repeat,
        AC.Property.layout.zindex,
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.resizing,
        AC.Property.behavior.visible,
        AC.Property.behavior.readonly,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.shadow,
        AC.Property.style.font,
        AC.Property.style.border,
        AC.Property.style.borderRadius,
        AC.Property.style.margin,
        AC.Property.style.bgColor,
        AC.Property.style.menuFontColor,
        AC.Property.style.menuBGColor,
        AC.Property.style.tabBGColors,
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
WiziCore_UI_TabWidget.props = function() {
    return _props;
};

WiziCore_UI_TabWidget.capabilities = function() {
    return {
        defaultProps: {
            x : "0", y: "0", width: "200", height: "100",
            zindex : "auto", enable : true, readonly: false,
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true, opacity : 1,
            widgetStyle: "default", name : "tab1",
            tabs: {rows : [
                {id: '1', data: ["1", "Item1"], ind: 1}
            ]},
            tabBGColors: {
                useColors: true,
                colors: ["#dddddd", "#eeeeee"]
            },
            borderRadius : "0",
            hourglassImage: "Default",
            displayHourglassOver: "inherit", customCssClasses: "",
            margin : "",
            shadow: "",
            pWidth: "",
            bgColor: '#dddddd'
        },
        isField: false,
        dragAndDrop: false, resizing: false,
        props: WiziCore_UI_TabWidget.props(),
        containerType: AC.Widgets.Base.CASE_TYPE_COMPOSITE_CONTAINER
    };
};
})(jQuery,window,document);