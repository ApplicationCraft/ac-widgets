/**
 * @lends       WiziCore_UI_MenuAdvancedWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_MenuAdvancedWidget = AC.Widgets.WiziCore_UI_MenuAdvancedWidget =  AC.Widgets.Base.extend({
    _widgetClass: "WiziCore_UI_MenuAdvancedWidget",

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Konstantin Khukalenko
     * @version     0.1
     *
     * @constructs
     */
    _menu: null,
    _menuOverlay: null,
    _menuTextStyle: null, //css for menu
    _menuBgStyle: null,
    _afterFirstLevelSpaceHeight: 2, //space between first level of menu and dropdown

    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        this._super.apply(this, arguments);
    },

    _redraw : function() {
        this.base().empty();
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;
        var base = this.base();
        var data = this._project['menuData'];
        base.addClass('oe_wrapper');
        var self = this, title;

        var relativeDiv = $('<div style="position: relative;">');
        var overlay = $('<div class="oe_overlay" style="width:100%"></div>')
            //.width(this.width())
            .height(this.height() + this._afterFirstLevelSpaceHeight);
        var menuList = $('<ul class="oe_menu" style="padding:  0px; margin: 0px">');

        if (data != undefined) {
            for (var i = 0, l = data.items.length; i < l; i++) {
                var menuItem = data.items[i];
                var menuItemId = MenuBuilder_MenuItem_Base.option(menuItem, 'id');
                var isVisible = MenuBuilder_MenuItem_Base.option(menuItem, 'visible');
                if (!isVisible) {
                    continue;
                }

                var menuItemInnerDiv = $('<div data-for="' + menuItemId + '"/>');
                title = MenuBuilder_MenuItem_Base.option(menuItem, 'title');
                title = WiziCore_Helper.isLngToken(title) ? this._getTranslatedValue(title) : title;
                var menuItemLi = $('<li id="' + menuItemId + '"><a href="">' + title + '</a></li>');

                var menuItemChildren = MenuBuilder_MenuItem_Base.children(menuItem);

                var callbackFunction = function(menuItem3Level) {
                    return function() {
                        if (self.onItemSelect(MenuBuilder_MenuItem_Base.option(menuItem3Level, 'id'))) {
                            self._pageJump(MenuBuilder_MenuItem_Base.option(menuItem3Level, 'pageJump'));
                        }
                    };
                };

                for (var j = 0, l2 = menuItemChildren.length; j < l2; j++) {
                    var menuItem2Level = menuItemChildren[j];
                    var isVisible = MenuBuilder_MenuItem_Base.option(menuItem2Level, 'visible');
                    if (!isVisible) {
                        continue;
                    }

                    var menuItem2LevelUl = $('<ul style="list-style: none; padding: 0px; margin: 0px; width: 100%"/>');
                    title = MenuBuilder_MenuItem_Base.option(menuItem2Level, 'title');
                    title = WiziCore_Helper.isLngToken(title) ? this._getTranslatedValue(title) : title;
                    var menuItem2LevelLi = $('<li class="oe_heading">' + title + '</li>');
                    menuItem2LevelUl.append(menuItem2LevelLi);

                    var menuItem2LevelChildren = MenuBuilder_MenuItem_Base.children(menuItem2Level);

                    for (var k = 0, l3 = menuItem2LevelChildren.length; k < l3; k++) {
                        var menuItem3Level = menuItem2LevelChildren[k];
                        var isVisible = MenuBuilder_MenuItem_Base.option(menuItem3Level, 'visible');
                        if (!isVisible) {
                            continue;
                        }

                        var menuItem3LevelLi = $('<li>');
                        title = MenuBuilder_MenuItem_Base.option(menuItem3Level, 'title');
                        title = WiziCore_Helper.isLngToken(title) ? this._getTranslatedValue(title) : title;
                        var menuItem3LevelA = $('<a href="javascript:void(0)">' + title + '</a>');
                        menuItem3LevelA.click(callbackFunction(menuItem3Level));

                        menuItem3LevelLi.append(menuItem3LevelA);
                        menuItem2LevelUl.append(menuItem3LevelLi);
                    }

                    menuItemInnerDiv.append(menuItem2LevelUl);
                }

                menuList.append(menuItemInnerDiv);
                menuList.append(menuItemLi);
            }
        }


        relativeDiv.append(overlay);
        relativeDiv.append(menuList);
        base.append(relativeDiv);
        this._menu = menuList;
        this._menuOverlay = overlay;

        jQuery.fn.__useTr = trState;

        this._bindEvents();

        this._visible(this.visible());
        this._opacity(this.opacity());
        this._textColors(this.textColors());
        this._bgColors(this.bgColors());
        this._updateLayout();
    },

    _bindEvents: function() {
        var menu = this._menu;
        var menuItems = menu.children('li');
        var overlay = this._menuOverlay;

        menuItems.unbind('mouseenter').unbind('mouseleave').bind('mouseenter',function() {
            menuItems.removeClass('selected');
            var $this = $(this);
            var menuItemId = $this.attr('id');
            var contentDiv = menu.children('div[data-for="' + menuItemId + '"]');
            $this.addClass('slided selected');

            contentDiv.css('z-index','9999').stop(true,true).slideDown(200, function() {
                menuItems.not('.slided').siblings('div[data-for!=' + menuItemId + ']').hide();
                $this.removeClass('slided');
            });
        }).bind('mouseleave',function(){
            var menuItemId = $(this).attr('id');
            $(this).siblings('div[data-for=' + menuItemId + ']').css('z-index','1');
        });

        menu.unbind('mouseenter').unbind('mouseleave').bind('mouseenter',function() {
            overlay.stop(true,true).fadeTo(200, 0.6);
            $(this).addClass('hovered');
        }).bind('mouseleave',function() {
            $(this).removeClass('hovered');
            menuItems.removeClass('selected');
            overlay.stop(true, true).fadeTo(200, 0);
            menu.find('div').hide();
        });
    },

    initProps: function() {
        this._super();

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.menuData = this.htmlPropertyBeforeSetAfterGet('menuData', this._beforeMenuData, this._menuData, this._menuDataAfterGet);
        this.textColors = this.htmlProperty('advancedMenuTextColors', this._textColors);
        this.bgColors = this.htmlProperty('advancedMenuBgColors', this._bgColors);
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();
        this._redraw();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._textColors(this.textColors());
        this._bgColors(this.bgColors());
        this._updateLayout();
    },

    _bgColors: function(val) {
        if (val != undefined && val != '' && val.colors != undefined) {
            //base.find('ul.oe_menu > li > a').css('color', val.colors[0]);

            if (this._menuBgStyle != null) {
                this._menuBgStyle.remove();
                delete this._menuBgStyle;
            }

            var htmlId = this.htmlId();

            /*{1: "widget_menu_1lvl_bg_color", 2: "widget_menu_1lvl_bg_color_hover",
                    3: 'widget_menu_3lvl_bg_color_hover', 4: 'widget_menu_dropdown_bg_color',
                    5: 'widget_menu_overlay_color'};*/


            var cssStyle = "#" + htmlId + ' .oe_overlay { background: ' + val.colors[4] + ';} '; //overlay
            cssStyle += "#" + htmlId + ' ul.oe_menu div{ background: ' + val.colors[3] + ';} '; //dd gb
            cssStyle += "#" + htmlId + ' ul.oe_menu > li > a { background: ' + val.colors[0] + ';} '; //1 level
            cssStyle += "#" + htmlId + ' ul.oe_menu div ul li a:hover { background: ' + val.colors[2] + ';} '; //3 level hover
            cssStyle += "#" + htmlId + '.oe_wrapper ul.hovered > li > a { background: ' + val.colors[1] + ';} '; //1 level hover

            this._menuBgStyle = $("<style>" + cssStyle + "</style>");
            this.tableBase().prepend(this._menuBgStyle);
        }
    },

    _beforeMenuData: function(data) {
        if (!data || !data.items || !$.isArray(data.items) || this.form().language() == null)
            return data;

        var form = this.form(),
            prevShowLng = form._showLngTokens,
            oldData,
            hasLanguage = form.language() != null;

        if (hasLanguage && !form._skipTokenCreation) {
            form._showLngTokens = true;
            oldData = this.menuData();
            form._showLngTokens = prevShowLng;
            this._processMenuItems(data.items, oldData);
        }
        return data;
    },

    _processMenuItems: function(items, oldData) {
        var title, isToken, token, i, l, oldTitle;
        for (i = 0, l = items.length; i < l; i++) {
            title = items[i].options['title'];
            isToken = WiziCore_Helper.isLngToken(title);
            if (!isToken) {
                if (items[i].id != undefined) {
                    oldTitle = this._getItemTitleById(oldData, items[i].id);
                    token = WiziCore_Helper.isLngToken(oldTitle) ? oldTitle : null;
                }
                token = !token ? WiziCore_Helper.generateId(10, 'ac-') : token;
                this.form().addTokenToStringTable(this.id(), this.name(), token, title);
                items[i].options['title'] = token;
                if (items[i].id != undefined)
                    items[i].id = undefined;
            }
            this._processMenuItems(items[i].children, oldData);
        }
    },

    _getItemTitleById: function(data, id) {
        var i, l, item = null, res, ids = id.split('|');
        for (i = 0, l = ids.length; i < l; i++) {
            item = (!item) ? data.items[ids[i]] : item.children[ids[i]];
        }
        res = item ? item.options['title'] : null;
        return res;
    },

    _onInitLanguage: function() {
        this.menuData(this.menuData());
    },

    _onSTUpdated: function() {
        this._redraw();
    },

    _onLanguageChanged: function() {
        this._redraw();
    },

    _menuData: function(data) {
        this._redraw();
    },

    _menuDataAfterGet: function(data) {
        if (!data || !data.items || !$.isArray(data.items) || this.form().language() == null)
            return data;

        var ret = WiziCore_Helper.clone(data);
        this._translateItems(ret.items, '');
        return ret;
    },

    _translateItems: function(items, id) {
        var i, l;
        for (i = 0, l = items.length; i < l; i++) {
            items[i].options['title'] = this._getTranslatedValue(items[i].options['title']);
            items[i].id = id + i;
            this._translateItems(items[i].children, items[i].id + '|');
        }
    },

    _updateLayout: function() {
        this._super();
        var base = this.base();
        var height =  this.height();
        var width = this.width();

        base.find('ul.oe_menu').css('height', height); //menu elements is square
        base.find('ul.oe_menu > li').css('width', height); //menu elements is square
        base.find('ul.oe_menu div').css('top', height + this._afterFirstLevelSpaceHeight);
        base.css('width', width);
        base.css('height', height);

        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            base.css('overflow', 'visible');
        } else {
            base.css('overflow', 'hidden');
        }
    },

    _textColors: function(val) {
        if (val != undefined && val != '' && val.colors != undefined) {
            if (this._menuTextStyle != null) {
                this._menuTextStyle.remove();
                delete this._menuTextStyle;
            }

            var htmlId = this.htmlId();

            var cssStyle = "#" + htmlId + ' ul.oe_menu div ul li a:hover { color: ' + val.colors[4] + ';} '; //3 level hover
            cssStyle += "#" + htmlId + ' ul.oe_menu div ul li a { color: ' + val.colors[2] + ';} '; //3 level
            cssStyle += "#" + htmlId + ' ul.oe_menu > li > a { color: ' + val.colors[0] + ';} '; //1 level
            cssStyle += "#" + htmlId + ' ul.oe_menu > li.selected > a, ul.oe_menu > li > a:hover { color: ' + val.colors[3] + ';} '; //1 level hover
            cssStyle += "#" + htmlId + ' li.oe_heading { color: ' + val.colors[1] + '; border-bottom: 1px solid ' + val.colors[1] + ';} '; //2 level border

            this._menuTextStyle = $("<style>" + cssStyle + "</style>");
            this.base().prepend(this._menuTextStyle);
        }
    },

    onItemSelect: function(id) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_MenuAdvancedWidget.onItemSelect);
        $(this).trigger(triggerEvent, [id]);
        return !triggerEvent.isPropagationStopped();
    },

    _pageJump: function(pJump) {
        var app = this.form();
        switch (pJump){
            case "calling":
                app.pageCalling();
                break;
            case "next":
                app.showNextPage();
                break;
            case "prev":
                app.showPrevPage();
                break;
            default:
                //find page
                var pages = app.pages();
                    for (var i = 0, l = pages.length; i < l; i++){
                        if (pages[i].id() == pJump){
                            app.pageJump(pJump);
                            break;
                        }
                    }
                break;
        }
    }

});

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_MenuAdvancedWidget.actions = function() {
    var ret = {
        onItemSelect: {alias: "widget_event_onitemselect", funcview: "onItemSelect", action: "AC.Widgets.WiziCore_UI_MenuAdvancedWidget.onItemSelect", params: "id", group: "widget_event_mouse"}
    };
    ret = jQuery.extend(AC.Widgets.Base.actions(), ret);
return ret;
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.menuData
    ]},

    { name: AC.Property.group_names.layout, props:[
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.width,
        AC.Property.layout.height,
        AC.Property.layout.alignInContainer,
        AC.Property.layout.repeat,
        AC.Property.layout.zindex,
        AC.Property.layout.anchors
    ]},

    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.resizing,
        AC.Property.behavior.visible
    ]},

    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.margin,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle,
        AC.Property.style.advancedMenuTextColors,
        AC.Property.style.advancedMenuBgColors
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_MenuAdvancedWidget.props = function() {
    return _props;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_MenuAdvancedWidget.emptyProps = function() {
    var ret = {};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_MenuAdvancedWidget.defaultProps = function() {
    var ret = {
        name : "AdvancedMenu1",
        widgetStyle: "default",
        widgetClass: "WiziCore_UI_MenuAdvancedWidget",
        width : 250,
        height : 100,
        x : 0,
        y : 0,
        visible: true,
        enable: true,
        zindex : 'auto',
        opacity : 1, customCssClasses: "",
        margin: "",
        dragAndDrop: false, resizing: false,
        alignInContainer: "left",
        menuData: {
            maxLevel: 2,
            items: [
                {
                    options:  {
                        title: "New Menu Item",
                        visible: true,
                        id: "wufnflxfmxkxfwqdcu2fnwn38n8fidfv1cmg"
                    },
                    children: [
                        {
                            options: {
                                title: "New Menu Item",
                                visible: true,
                                id: "w154ptu3vf878bq2-kkcgh--56-iup8jfyq4"
                            },
                            children: [
                                {
                                    options: {
                                        title: "New Menu Item",
                                        visible: true,
                                        id: "wbpwnfue69i-jgzseo8o2wylkjz5jtca8kjx"
                                    },
                                    children: [],
                                    openState: true
                                }
                            ],
                            openState: true
                        }
                    ],
                    openState: true
                },

                {
                    options: {
                        title: "New Menu Item",
                        visible: true,
                        id: "w39ye3yq2aw-9ek88jbaz1v7hstd6f1g0gbj"
                    },
                    children: [
                        {
                            options: {
                                title: "New Menu Item",
                                visible: true,
                                id: "wc002h6bn-57toxke01-pqzowglyzjz58rv8"
                            },
                            children: [
                                {
                                    options: {
                                        title: "New Menu Item",
                                        visible: true,
                                        id: "ws5omj3sylmuu8dgxgyif8m88015pvupmssd"
                                    },
                                    children: [],
                                    openState: true
                                }
                            ],
                            openState: true
                        },
                        {
                            options: {
                                title: "New Menu Item",
                                visible: true,
                                id: "w5tti2o2i71vpf39dng2syu17rze40hkl6cp"
                            },
                            children: [
                                {
                                    options:  {
                                        title: "New Menu Item",
                                        visible: true,
                                        id: "wbr0gkm7lm2nhnruyfvvecb7woekre0kdb0f"
                                    },
                                    children: [],
                                    openState: true
                                }
                            ],
                            openState: true
                        }
                    ],
                    openState: true
                }
            ]
        },
        advancedMenuTextColors: {
            useColors: true,
            colors: [
                    "#aaaaaa", //1 level
                    "#aaaaaa", //2 level
                    "#222222", //3 level
                    "#222222", //1 hover
                    "#fff" //3 level hover
            ]
        },
        advancedMenuBgColors: {
            useColors: true,
            colors: [
                    "#101010", //1 level
                    "#fff", //1 level hover
                    "#000", //3 level hover
                    "#fff", //drop down
                    "#000" //overlay
            ]
        }
    };
    WiziCore_UI_MenuAdvancedWidget.defaultProps = function(){return ret};
    return ret;
};

WiziCore_UI_MenuAdvancedWidget.onItemSelect = "E#MenuAdvanced#onItemSelect";
})(jQuery,window,document);