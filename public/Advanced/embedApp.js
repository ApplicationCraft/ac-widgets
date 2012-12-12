/**
 * @lends       WiziCore_UI_EmbedAppWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_EmbedAppWidget = AC.Widgets.WiziCore_UI_EmbedAppWidget =  AC.Widgets.Base.extend({
    _widgetClass : "WiziCore_UI_EmbedAppWidget",
    _boxTable: null,
    _labelContainer: null,
    _embedContainer: null,
    _dataPropName: "embedApp",
    _childApp: null,

    /**
     * Description of constructor
     * @class  Some words about label widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
	init: function(){
        this._super.apply(this, arguments);
	},

    draw : function(){
        var table = this._boxTable = $("<table style='width:100%; height:" + this.height() + "; text-align:center;'><tr><td></td></tr></table>");
        var eId = "embedAppBox_" + this.htmlId();
        //table.css({width: "100%", height: "100%"});
        this._labelContainer = table.find("td").attr("id", eId).css({"width": "100%", "height": "100%"});
        this._embedContainer = $("<div style='overflow: auto; width:100%; display:none;'>");
        this.base().append(table, this._embedContainer);
        this._super.apply(this, arguments);
    },

    _onSTUpdated: function() {
        this._label(this._project['label']);
    },

    _onInitLanguage: function() {
        this.label(this.label());
    },

    initProps: function(){
        this._super();

        this.label = this.htmlLngPropertyBeforeSet('label', this._beforeLabel, this._label);
        this.embedApp = this.htmlProperty('embedApp', this._embedApp);
        this.value = this.embedApp;

        this.opacity = this.themeProperty('opacity', this._opacity);
        
        this.border = this.themeProperty('border', this._border);
    },

    _updateLayout: function(){
        this._super();
        this._boxTable.height(this.height()).width(this.width());
        this._checkEmbedSizes();
    },


    _dragAndDrop: function(val){
        this._super.apply(this, arguments);
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this.base().addClass("live-select-outline-display-table-fix");
            if ($.browser.webkit){
                var boxSize = (val !== false) ? "" : undefined;
                this._setBoxSizing(boxSize, this.tableBase());
            }
        }
    },

    _checkEmbedSizes: function(){
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            if (this.base().css("display") != "none"){
                this.base().css("display", "table");
            }
            var maxWidth = this.maxWidth();
            var minWidth = this.minWidth();
            var maxHeight = this.maxHeight();
            var minHeight = this.height();
            minHeight = (minHeight && minHeight !="") ? parseInt(minHeight) : "";
            minWidth = (minWidth && minWidth !="") ? parseInt(minWidth) : "";
            maxWidth = (maxWidth && maxWidth !="") ? parseInt(maxWidth) : "";
            maxHeight = (maxHeight && maxHeight !="") ? parseInt(maxHeight) : "";
            var emdWnd = this._embedContainer;
            if (emdWnd.css("display") != "none"){
                if (maxHeight != "" || maxWidth != "" || minWidth != ''){
                    emdWnd.css("display", "");
                } else {
                    emdWnd.css("display", "table");
                }
            }

            emdWnd.css({"max-width": maxWidth, "max-height": maxHeight, 'min-width': minWidth, 'min-height': minHeight});
        }

    },

    initDomState : function (){
        this._super();
        this.initDomStatePos();
        this._label(this._project['label']);
        this._updateEnable();
        this._visible(this.visible() );
        this._opacity(this.opacity() );
        this._border(this.border());
    },

    onPageDrawn: function(){
        this._embedApp(this.embedApp());
    },

    _beforeLabel: function(text) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(text),
                token = isToken ? text : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, text);

            return token;
        } else
            return text;
    },

    _label: function(val){
        var res = this.getTrValueAddLngAttr(val, this._labelContainer);

        var eApp = this.embedApp();
        if (eApp && eApp != ""){
            this._boxTable.show();
        }
        this._labelContainer.html(res);
    },

    _embedApp: function(val){
        if (val == undefined) return;
        var runnedAppId = (this._childApp) ? this._childApp.id() : undefined;
        if (this.enable() && runnedAppId != val) {
            this.stopApp();
            this._boxTable.show();
            var form = this.form();
            if (val && val != "") {
                if (this.mode() != WiziCore_Visualizer.EDITOR_MODE){
                    var self = this,
                        twirlyThing = {mode: true, form: this.form(), widget: this}, //"text": "", bgColor: "", opacity: "", image: "Default",
                        embedWnd = self._embedContainer;
                        //embedWnd.width("100%"); // for correct sizes of hourglass
                        embedWnd.empty().append(self._boxTable);
                        embedWnd.show();
                    if(this._hourglassImage != "Default"){
                        twirlyThing.image = this.hourglassImage();
                    }
                    form._loadFormForRuntime({appId: val, embedWnd : embedWnd, twirlyThing: twirlyThing}, true, function(eForm){
                        self._boxTable.hide();
                        self.base().append(self._boxTable);
                        //embedWnd.width(""); // drop after correct sizes of hourglass
                        if (self._childApp != null){
                            self.stopApp();
                        }
                        embedWnd.show();
                        self._setApps(eForm, form);
                        return {parentApp: form, embedWidget: self};
                    });
                }
            } else {
                this._label(this._project['label']);
            }
        }
    },

    _setApps: function(childApp, pApp){
        this._childApp = childApp;
        childApp._parentApp = pApp;
    },

    onEmbedAppStarted: function(ev){
        $(this).trigger(WiziCore_UI_EmbedAppWidget.onStarted);
    },

    onEmbedAppStopped: function(){
        this._embedContainer.hide();
        this._boxTable.show();
        if (this._childApp){
            $(this).trigger(WiziCore_UI_EmbedAppWidget.onStopped);
        }
        this._childApp = null;
    },

    stopApp: function(){
        if (this._childApp) {
            this._childApp._stopRuntimeApp();
        }
        this.onEmbedAppStopped();
    },

    isAppLoaded: function(){
        return (this._childApp != null);
    },

    childApp: function() {
        if (this._childApp) {
            return this._childApp;
        }
        throw 'App not loaded';
    },

    _visible: function(value) {
        this._super(value);
        this._checkEmbedSizes();
    },

    _enable: function(val){
        var ret = this._super(val);
        if (val === true) {
            if (this._isDrawn){
                this._embedApp(this.embedApp());
            }
        }
        (val === false) ? this.base().addClass('ui-state-disabled') : this.tableBase().removeClass('ui-state-disabled');
        return ret;
    },

    destroy: function(){
        if (this._childApp && !this._childApp.isDestroyed()) { //stop visualize done in visualized embededApps
            $(this._childApp).unbind();
            this._childApp.destroy();
        }
        this._childApp = null;
        this._super.apply(this, arguments);
    }
});

WiziCore_UI_EmbedAppWidget._props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.label,
            AC.Property.general.embedApp
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
            AC.Property.layout.maxHeight,
            AC.Property.layout.repeat,
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
    { name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.margin,
            AC.Property.style.border,
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
WiziCore_UI_EmbedAppWidget.props = function(){
    return WiziCore_UI_EmbedAppWidget._props;
};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_EmbedAppWidget.emptyProps = function(){
    var ret = {border : "1px solid #000000"};
    return ret;
};

WiziCore_UI_EmbedAppWidget.inlineEditPropName = function(){
         return "label"
};
/**
 * Return widget resize properties
 * @return {Object} default properties
 */
WiziCore_UI_EmbedAppWidget.resizeProperties = function(){
    var ret = {};
    return ret;
};
WiziCore_UI_EmbedAppWidget.isField = function(){ return false};
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_EmbedAppWidget.defaultProps = function(){
    var ret = {width: 200, height: 200, x : "100", y: "50", zindex : "auto", pWidth: "", margin: "", alignInContainer: 'left',
        anchors : {left: true, top: true, bottom: false, right: false}, visible : true, hourglassImage: "Default",
        dragAndDrop: false, resizing: false, displayHourglassOver: "inherit", customCssClasses: "",
        widgetStyle: "default", opacity : 1, name:"embedApp1", label : "Embedded App", enable: true
    };
    return ret;
};

WiziCore_UI_EmbedAppWidget.onStarted = "E#EmbedApp#onStarted";
WiziCore_UI_EmbedAppWidget.onStopped = "E#EmbedApp#onStopped";

WiziCore_UI_EmbedAppWidget.actions = function() {
    var ret = {
        onStarted: {alias: "widget_event_onstarted", funcview: "onStarted", action: "AC.Widgets.WiziCore_UI_EmbedAppWidget.onStarted", params: "", group: "widget_event_general"},
        onStopped: {alias: "widget_event_appteminate", funcview: "onAppTerminate", action: "AC.Widgets.WiziCore_UI_EmbedAppWidget.onStopped", params: "", group: "widget_event_general"}
    };
    return ret;
};
})(jQuery,window,document);