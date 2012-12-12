/**
 * @lends       WiziCore_UI_ButtonMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_CollapsibleMobileWidget = AC.Widgets.WiziCore_UI_CollapsibleMobileWidget = AC.Widgets.WiziCore_UI_PanelContainerWidget.extend({
    _widgetClass : "WiziCore_UI_CollapsibleMobileWidget",
    _childrenDiv: null,
    _template : "/*@include_tpl(collapsible.tpl)*/",


    init: function() {
        this._super.apply(this, arguments);
        var children = this.children(),
                containerObj;

        if (children.length != 0) {
            containerObj = children[0];
        } else {
            var propsDefault = AC.Core.Widgets().getDefaultWidgetProperties("WiziCore_Widget_Container");
            containerObj = this.addNewWidget({widgetClass: "WiziCore_Widget_Container", project: propsDefault});
            containerObj.prop({width: 10, pWidth: 100, height: 100, x: 0, y: 0, layout: "vertical"});
//            containerObj.parent(this);
        }
        containerObj.isDraggable = this;
        containerObj.isEditable = false;

    },

//    _setWidgetPosition: function(w) {
//
//        if (w && w._tableBase) {
//            w._tableBase.css({display: 'table', height: w.height(), width: '100%'});
//        }
//
//    },

    _updateLayout: function() {
        this._super.apply(this, arguments);
        this._tableBase.css('min-height', '47px'); //constant size for collapsible
        this._tableBase.css('padding-right', '3px'); //constant size for collapsible
    },

    layoutEx: function() {
        return 'vertical';
    },

    createChild: function() {
        var child = this._super.apply(this, arguments);
        child.isDraggable = this;
        child.isEditable = false;
        child.isResizable = true;
        child._manualDrawPosition = false;
        return child;
    },

    initProps: function() {
        this._super();

        this.mobileTheme = this.themeProperty('mobileTheme', this._mobileTheme);
        this.highlightExpanded = this.themeProperty('highlightExpanded', this._highlightExpanded);
        this.title = this.htmlLngPropertyBeforeSet('title', this._beforeTitle, this._title);
        this.open = this.htmlProperty('open', this._open);
//        this.mobileTheme = this.htmlProperty('mobileTheme', this._mobileTheme);
    },

    _onInitLanguage: function() {
        this.title(this.title());
    },

    _onSTUpdated: function() {
        this._title(this._project['title']);
    },

    draw: function() {
        var c = $('<div></div>');
        c.append(this._template);
        this._headingObj = c.find(".ac-collapsible-heading");
        this._content = c.find(".ac-collapsible-content");
        this._theme = c.find(".ac-collapsible-theme");
        this._collapsibleHeading = c.find(".m-ui-collapsible-heading");
        this._collapsibleContain = c.find(".m-ui-collapsible-contain");
        this._childrenDiv = c;
        this.base().append(c);
        this._attachEvents();
        this._super.apply(this, arguments);
    },

    _attachEvents: function() {
        //events
        var self = this,
                bindEvent = this.mode() == WiziCore_Visualizer.EDITOR_MODE ? 'click': 'vclick';
        this._collapsibleContain
                .bind("collapse", function(event) {
            if (! event.isDefaultPrevented() &&
                    $(event.target).closest(".m-ui-collapsible-contain").is(self._collapsibleContain)) {

                event.preventDefault();

                self._collapsibleHeading
                        .addClass("m-ui-collapsible-heading-collapsed")
                        .find(".m-ui-collapsible-heading-status")
                        .end()
                        .find(".m-ui-icon")
                        .removeClass("m-ui-icon-minus")
                        .addClass("m-ui-icon-plus");

                self._content.addClass("m-ui-collapsible-content-collapsed").attr("aria-hidden", true);

                if (self._collapsibleContain.jqmData("collapsible-last")) {
                    self._collapsibleHeading
                            .find("a:eq(0), .ui-btn-inner")
                            .addClass("ui-corner-bottom");
                }
                self._highlightExpanded(self.highlightExpanded());
            }
            if (self.children().length != 0) {
                self.children()[0].onParentVisibleChanged(false);
            }
        })
                .bind("expand", function(event) {
                    if (!event.isDefaultPrevented()) {

                        event.preventDefault();

                        self._collapsibleHeading
                                .removeClass("m-ui-collapsible-heading-collapsed")
                                .find(".m-ui-collapsible-heading-status");

                        self._collapsibleHeading.find(".m-ui-icon").removeClass("m-ui-icon-plus").addClass("m-ui-icon-minus");

                        self._content.removeClass("m-ui-collapsible-content-collapsed").attr("aria-hidden", false);

                        if (self._collapsibleContain.jqmData("collapsible-last")) {

                            self._collapsibleHeading
                                    .find("a:eq(0), .m-ui-btn-inner")
                                    .removeClass("m-ui-corner-bottom");
                        }
                        self._highlightExpanded(self.highlightExpanded());

                        if (self.children().length != 0) {
                            self.children()[0].onParentVisibleChanged(true);
                        }
                    }
                })
                .trigger(!this.open() ? "collapse": "expand");

        // Close others in a set
//		if ( collapsibleParent.length && !collapsibleParent.jqmData( "collapsiblebound" ) ) {
//
//			collapsibleParent
//				.jqmData( "collapsiblebound", true )
//				.bind( "expand", function( event ) {
//
//					$( event.target )
//						.closest( ".m-ui-collapsible-contain" )
//						.siblings( ".m-ui-collapsible-contain" )
//						.trigger( "collapse" );
//
//				});
//
//			var set = collapsibleParent.children( ":jqmData(role='collapsible')" );
//
//			set.first()
//				.find( "a:eq(0)" )
//					.addClass( "m-ui-corner-top" )
//						.find( ".m-ui-btn-inner" )
//							.addClass( "m-ui-corner-top" );
//
//			set.last().jqmData( "collapsible-last", true );
//		}

        self._collapsibleHeading
                .bind(bindEvent, function(event) {
//                if (self.mode() == WiziCore_Visualizer.EDITOR_MODE && !self.selected) {
//                    return;
//                }
            if ($(this).hasClass('ui-state-disabled'))
                return;

            var type = self._collapsibleHeading.is(".m-ui-collapsible-heading-collapsed") ?
                    "expand": "collapse";

            if (self.onStateChange(type == "expand") === false) {
                return;
            }

            self._collapsibleContain.trigger(type);

            event.preventDefault();
        });
    },

    _enable: function(val) {
        if (this._collapsibleHeading) {
            if (val === false){
                this._collapsibleHeading.addClass('ui-state-disabled');
                this._collapsibleHeading.find('.m-ui-btn').css('cursor', 'default');
            } else {
                this._collapsibleHeading.removeClass('ui-state-disabled');
                this._collapsibleHeading.find('.m-ui-btn').css('cursor', '');
            }
        }
    },

    _highlightExpanded: function(val) {
        var theme = this.mobileTheme(),
                collapse = 'm-ui-btn-up-' + theme,
                expand = 'm-ui-btn-active-' + theme,
                both = collapse + ' ' + expand;
        this._theme.removeClass(both);
        if (val && !this._collapsibleHeading.is(".m-ui-collapsible-heading-collapsed")) {
            this._theme.addClass(expand);
        }
        else {
            this._theme.addClass(collapse);
        }
    },

    onStateChange: function(val) {
        // TODO: need to override
        var triggerEvent = new $.Event(WiziCore_UI_CollapsibleMobileWidget.onStateChange);
        $(this).trigger(triggerEvent, [val]);
        return !triggerEvent.isPropagationStopped();
    },

    _redraw: function() {
        this._super.apply(this, arguments);
    },

    _mobileTheme: function(val) {
        var removeCallback = function (index, className) {
            var matches = className.match(/m-ui-btn-(up|active)-\w/g) || [];
            return (matches.join(' '));
        };
        this._theme.removeClass(removeCallback)
                .addClass('m-ui-btn-up-' + val);
        this._highlightExpanded(this.highlightExpanded());
    },

    _beforeTitle: function(text) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(text),
                token = isToken ? text : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, text);

            return token;
        } else
            return text;
    },

    checkEmptyLabel: function(label){
        if (label == undefined || (label.trim && label.trim() == "")){
            label = "&nbsp;";
        }
        return label;
    },

    _title: function(val) {
        var res = this.getTrValueAddLngAttr(val, this._headingObj);
        this._headingObj.html(this.checkEmptyLabel(res));
    },
    _open: function(val) {
        this._collapsibleContain.trigger(!val ? "collapse": "expand");
    },

    drawChildren: function() {
        var children = this.children();
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].draw(this._content);
        }

        //this._sectionsAfter(this.sections() );
    },

    _getJQMOptions: function() {
        return {theme: this.mobileTheme()};
    },

    initDomState: function() {
        this._super();
        this._mobileTheme(this.mobileTheme());
        this._title(this._project['title']);
    },

    onPageDrawn: function() {
        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            this.base().css('overflow', "visible");
        }
        this._super.apply(this, arguments);
    },

    currentContainer: function() {
        return this.children()[0];
    }
});
var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        {name: "title", type : "text", set: "title", get: "title", alias : "widget_title"},
        {name: "open", type : "boolean", set: "open", get: "open", alias : "widget_open"}
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.foreignAppWriting,
        AC.Property.database.autoRelationships
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
        AC.Property.layout.zindex,
        AC.Property.layout.alignInContainer,
        AC.Property.layout.repeat
    ]},
    { name: AC.Property.group_names.behavior, props:[
        AC.Property.behavior.dragAndDrop,
        AC.Property.behavior.visible,
        AC.Property.behavior.readonly,
        AC.Property.behavior.enable
    ]},
    { name: AC.Property.group_names.data, props:[
        AC.Property.data.view,
        AC.Property.data.fields,
        AC.Property.data.groupby,
        AC.Property.data.orderby,
        AC.Property.data.filter,
        AC.Property.data.listenview,
        AC.Property.data.autoLoad,
        AC.Property.data.keyFields
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.margin,
        AC.Property.style.mobileTheme,
        {name: "highlightExpanded", type : "boolean", set: "highlightExpanded", get: "highlightExpanded", alias : "widget_highlightExpanded"},
//        AC.Property.style.bgColor,
//        AC.Property.general.backgroundImage,
//        AC.Property.general.backgroundRepeat,
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
WiziCore_UI_CollapsibleMobileWidget.props = function() {
    return _props;

};
WiziCore_UI_CollapsibleMobileWidget.onStateChange = "E#SingleSelectMobile#onChange";

WiziCore_UI_CollapsibleMobileWidget.actions = function() {
    return {
        'onStateChange': {alias: "widget_event_onstatechange", funcview: "onStateChange", action: "AC.Widgets.WiziCore_UI_CollapsibleMobileWidget.onStateChange", params: "isExpanded", group: "widget_event_general"}
    };
    //ret = $.extend(AC.Widgets.Base.actions(), ret);
};

WiziCore_UI_CollapsibleMobileWidget.capabilities = function() {
    return {
        defaultProps: {
            width: "250", height: "47", x : "0", y: "0",
            widgetClass : "WiziCore_UI_CollapsibleMobileWidget",
            name: "Collapsible", opacity : 1, zindex : "auto", enable : true, visible : true, widgetStyle: "default",
            anchors : {left: true, top: true, bottom: false, right: false},
            centered: false,
            readonly: false,
            margin:"",
            hourglassImage: "Default", displayHourglassOver: "inherit", customCssClasses: "",
//            pWidth: "100",
            dragAndDrop: false,
            layout: 'absolute',
            mobileTheme: 'a',
            title: 'Heading',
            open: false ,
            highlightExpanded: false
        },
        emptyProps: {borderRadius : "0"},
        props: WiziCore_UI_CollapsibleMobileWidget.props(),
        isField: false,
        containerType: AC.Widgets.Base.CASE_TYPE_COMPOSITE_CONTAINER

    }
};
})(jQuery,window,document);