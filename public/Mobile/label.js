(function($, windows, document, undefined){
var WiziCore_UI_LabelMobileWidget = AC.Widgets.WiziCore_UI_LabelMobileWidget =  AC.Widgets.WiziCore_UI_BaseMobileWidget.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, WiziCore_Methods_Widget_ActionClick, {
    _labelDiv: null,
    _widgetClass: "WiziCore_UI_LabelMobileWidget",
    _dataPropName: 'label',

    init: function(){
        this._super.apply(this, arguments);
    },

    draw: function(){
        this._link = $("<a></a>").css({color: "black", "text-decoration": "none"});
        this._labelDiv = $("<div>").css({width: "100%", height: "100%"});
        this._link.append(this._labelDiv);
        this.base().prepend(this._link);
        var self = this;
        (this.mode() != WiziCore_Visualizer.EDITOR_MODE) && this.updateCursorByAction(true);
        this._super.apply(this, arguments);
        // temporary data init
    },

    _redraw: function(){
        this._labelDiv.attr("data-theme", this._getJQMOptions().theme);
        this._labelDiv.attr("class", 'm-ui-label-' + this._getJQMOptions().theme);
    },

    onClick: function(ev) {
        var triggerEvent = new jQuery.Event(AC.Widgets.WiziCore_Widget_Base.onClick);
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", this.id());
        $(this).trigger(triggerEvent, [ev]);
        (!triggerEvent.isPropagationStopped()) && this.onActionClick(ev, this.pageJump());
        ev.stopPropagation();
    },

    initProps: function(){
        this._super();
        var self = this;

        this.font = this.themeProperty('font', this._font);
        this.pageJump = this.normalProperty('pageJump');
        this.label = this.htmlLngPropertyBeforeSet('label', this._beforeLabel, this._label);
        //this.htmlText = this.htmlProperty('label', this._label);
        this.value = this.label;

        this.fontColor = this.themeProperty('fontColor', function(){
            self._fontColor.apply(self, arguments);
        });
        this.lineHeight = this.themeProperty('lineHeight', this._lineHeight);
        this.letterSpacing = this.themeProperty('letterSpacing', this._letterSpacing);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.hrefColor = this.themeProperty('hrefColor', this._hrefColor);
        this.paragraphSpacing = this.themeProperty('paragraphSpacing', this._paragraphSpacing);

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.textAlign = this.htmlProperty('textAlign', this._textAlign);

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);


//        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
//        this.applyview = this.normalProperty('applyview');
        this.wrapText = this.normalProperty('wrapText', this._wrapText);
        this.link = this.normalProperty("link", this._updateLink);
    },

    initDomState: function (){
        this._super();
        this.initDomStatePos();
        this._bg(this.bg() );

        this._paragraphSpacing(this.paragraphSpacing());
        this._label(this._project['label']);
        this._updateEnable();
        this._visible(this.visible() );
        this._opacity(this.opacity() );
        this._font(this.font() );
        this._fontColor(this.fontColor() );
        this._lineHeight(this.lineHeight() );
        this._letterSpacing(this.letterSpacing() );
        this._textAlign(this.textAlign() );
        this._updateLink(this.link());
    },

    _updateLayout: function(){
        this._super();
        //this._labelDiv.css('min-height', this.height());

        if (!this.pWidth() || this.parent().getLayoutType() == 'absolute') {
            this.tableBase().css('width', this.width());
        }

    },

    _fontColor: function(val) {
        this._super(val, this._labelDiv);
    },

    _textAlign: function(val){
        this._super(val, this._labelDiv);
    },

    _onInitLanguage: function() {
        this.label(this.label());
    },

    _onSTUpdated: function() {
        this._label(this._project['label']);
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

    /**
     * Set label widget text
     *
     * @param {String} text text value
     */
    _label: function(text) {
        var res = this.getTrValueAddLngAttr(text, this._labelDiv);

        if (res === null) res = "";
        this._labelDiv.html(res);
        this._wrapText(this.wrapText());
        this._hrefColor(this.hrefColor());
    },

    _wrapText: function(val) {
        if (val){
            var label = this.label();
            if (val === "a"){
                label = "<" + val + " href='#' style='color: #7cc4e7; padding: 0; margin: 0'>" + label + "</" + val + ">";
            } else if (val !== "none"){
                label = "<" + val + " style='padding: 0; margin: 0'>" + label + "</" + val + ">";
            }
            this._labelDiv.html(label);
        }
    },

    _enable: function(val){
        (val === false) ? this._labelDiv.addClass('ui-state-disabled') : this._labelDiv.removeClass('ui-state-disabled');
    },

    selectInlineProp: function(arr){
        var label = arr[0];
        var parsedLabel = WiziCore_Helper.labelTextCheck(this[label]());
        return label;
    },

    _lineHeight: function(val) {
//            var linesnum = this.getLinesNum();

            this._labelDiv.css("line-height", (val == "") ? val : val + "px");
/*
            if (this.isWidgetBuild()) {
                this.useAutoSize(linesnum, this._label);
            }
            */
    },

    _letterSpacing: function(val) {
/*        if (val != undefined) {
            var linesnum = this.getLinesNum();

            */

            this._labelDiv.css("letter-spacing", (val == "") ? val : val + "px");
        /*
            if (this.isWidgetBuild()) {
                this.useAutoSize(linesnum, this._label);
            }
        */
    },

    getDataModel: function() {
        return this._labelDataModel();
    },

    isBindableToData: function() {
        return true;
    }
}));

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.wrapText,
            AC.Property.general.label,
            //AC.Property.general.htmlText,
            AC.Property.appearance.textAlign,
            AC.Property.general.autoSize,
            AC.Property.general.wrapping,
            AC.Property.general.link,
            AC.Property.general.pageJump
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
            AC.Property.behavior.visible
        ]},
    { name: AC.Property.group_names.data, props:[
            AC.Property.data.view,
            AC.Property.data.fields,
            AC.Property.data.groupby,
            AC.Property.data.orderby,
            AC.Property.data.filter,
            AC.Property.data.listenview,
            AC.Property.data.autoLoad

        ]},
    { name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            //AC.Property.style.hrefColor,
            AC.Property.style.paragraphSpacing,
            //AC.Property.style.font,
            //AC.Property.style.fontColor,
            AC.Property.style.margin,
            AC.Property.style.mobileTheme,
            //AC.Property.style.bgColor,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle,
            //AC.Property.style.lineHeight,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage
            //AC.Property.style.letterSpacing
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_LabelMobileWidget.props = function() {
    return _props;
};
WiziCore_UI_LabelMobileWidget.actions = function() {
    var ret = {
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    // append base actions
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_LabelMobileWidget.actions = function(){return ret};
    return ret;
};


WiziCore_UI_LabelMobileWidget.capabilities = function() {

    return {
        actions: WiziCore_UI_LabelMobileWidget.actions(),

        defaultProps: {label : "Label ", width: 70, height: 15, x : "100", y: "50", zindex : "auto",
            pWidth: "",
            margin: "",
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
            widgetStyle: "default", opacity : 1, name:"labelmobile1", alignInContainer: 'left',
            textAlign: "Left", action: "none", hourglassImage: "Default", displayHourglassOver: "inherit", customCssClasses: "",
            relationId: null,
            addLink: 'Add',
            dragAndDrop: false,
            resizing: false,
            target: 'Same',
            wrapText: "none",
            mobileTheme: "c"
        },

        inlineEditPropName: {props: ["label", "htmlText"]}, //doubleClick support for widget

        emptyProps: {bgColor : "",fontColor : "", font:"", letterSpacing: "", lineHeight: ""},
        isField: true,
        props: WiziCore_UI_LabelMobileWidget.props(),

        containerType: AC.Widgets.Base.CASE_TYPE_ITEM
    }
};
})(jQuery,window,document);