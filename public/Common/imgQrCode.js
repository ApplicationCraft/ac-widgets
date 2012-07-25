(function($, windows, document, undefined){
var WiziCore_UI_ImgQrCodeWidget = AC.Widgets.WiziCore_UI_ImgQrCodeWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, WiziCore_Methods_Widget_ActionClick, {
    _widgetClass : "WiziCore_UI_ImgQrCodeWidget",
    _image: null,
    _div: null,
    _url: null,
    _dataPropName : "text",

    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.3
     *
     * @constructs
     */
    init: function() {
        this._originImgSize = {height: "100px", width: "100px", start: true};
        this._super.apply(this, arguments);
    },

    draw : function() {
        var self = this;

        //init id
        var tuid = "img_" + this.htmlId();

        //this._div = $("<table><tr><td></td></tr><tr><td></td></tr></table>");


        this._image = $("<img style=' border:0; align: center; top: 0px'>");
        this._image.attr("id", tuid + "_image");
        this._link = $("<div  style='overflow:hidden; word-wrap: break-word; align: center; bottom: 0px'><a href='#'>link</a>");

        //this._div.append(this._image);
        /*this._div.find("td:first").append(this._image);
        this._div.find("td:last").append(this._link);*/

        this.base().append(this._image).append(this._link);
        this._link.find("a").attr('data-ajax', false);
        //this._div = this.base();
        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            $(this._image).bind("vclick.custom", {self: this}, function(ev) {
                self.onClick(ev);
            });
            this._link.find("a").bind("vclick.custom", {self: this}, function(ev){
                self.onClick(ev);
            }).bind("click vclick" ,function(ev){
                ev.preventDefault();
            });
        }

        if (this._bindingEvents[AC.Widgets.Base.onClick] == 0 || this._bindingEvents[AC.Widgets.Base.onClick] == undefined) {
            this.eventsHandles()[AC.Widgets.Base.onClick] = AC.Widgets.Base.onClick;
            if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
                this.bindEvent(AC.Widgets.Base.onClick);
            }
        }

        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this.updateCursorByAction(true);
        }

        this._super.apply(this, arguments);
    },

    initProps: function() {
        this._super();
        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.font = this.themeProperty('font', this._font);
        this.hrefColor = this.themeProperty('hrefColor', this._hrefColor);
        this.dataType = this.normalProperty('dataType');
        this.mandatory = this.normalProperty('mandatory');
        this.shadow = this.themeProperty('shadow', this._shadow);

        this.border = this.themeProperty('border', this._border);
        this.text = this.htmlLngPropertyBeforeSet('text', this._beforeText, this._checkShortUrl);
        this.formId = this.htmlLngPropertyBeforeSet('formId', this._beforeFormId, this._checkShortUrl);

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.textAlign = this.htmlProperty('textAlign', this._textAlign);
        this.showUrl = this.htmlProperty('showUrl', this._showUrl);
        this.urlMargin = this.htmlProperty('urlMargin', this._urlMargin);
        //this.tabindex = this.htmlProperty('tabindex', this._tabindex);

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

    _beforeFormId: function(formId) {
        return this._beforeLngProp(formId, 'formid');
    },

    _beforeLngProp : function(val, suffix) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(val),
                token = isToken ? val : ('ac-' + this.id() + '_' + suffix);

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, val);

            return token;
        } else
            return val;
    },

    _onInitLanguage: function() {
        this.text(this.text());
        this.formId(this.formId());
    },

    _onSTUpdated: function() {
        this._onLanguageChanged();
    },

    _onLanguageChanged: function() {
        this._checkShortUrl();
    },

    _getPath: function(){
        var ret, formId = this._project['formId'];
        var trVal = WiziCore_Helper.isLngToken(formId) ? this._getTranslatedValue(formId, true) : formId;
        var isToken = formId && WiziCore_Helper.isLngToken(trVal);
        if (trVal && !isToken){
            var form = this.context().forms().forms()[trVal];
            var txt = (form) ? form.getLiveUrl(): this.context().config().clientApi() + "live.php?formId=" + trVal;
            ret = txt;
        } else {
            ret = this._project['text'];
        }
        return ret;
    },

    _showUrl: function(val){
        var h = this.height(),
            w = this.width(),
            linkDiv = this._link;
        if (val == undefined || val == true){
            linkDiv.show();
            linkDiv.css("height", "");
            var lh = linkDiv.height();
            h = h - ((lh != 0) ? lh : 16);
        } else {
            linkDiv.hide();
        }
        this._image.css({width: w, 'max-width': w, height: h});
    },

    _urlMargin: function(val){
        this._link.css({margin: val});
        var a = this._link;//div.find("td:last div");
        var h = a.height() + parseInt(a.css("margin-top")) + parseInt(a.css("margin-bottom"));
        this._link.css({height: h + 'px'});
        this._showUrl(this.showUrl());
    },

    _checkShortUrl: function(){
        var path = this._getPath();

        var trVal = WiziCore_Helper.isLngToken(path) ? this._getTranslatedValue(path) : path;
        if (trVal == '%SetCurrentAppQRCode%' || trVal == '') {
            trVal = this._getCurrentAppQrCode();
        }
        if (trVal && trVal.indexOf("://") == -1){
            //check for link in trVal
            if (trVal.indexOf(".") == -1){
                //if only word "example" -> "http://ac-dev.applicationcraft.com/example"
                trVal = this.context().config().clientApi() + trVal;
            } else {
                //if word with dot "example.com" -> "http://example.com"
                trVal = "http://" + trVal;
            }

        }

        this._url = trVal;

        var self = this,
            url = this._url,
            title = url;


        function checkTitle(subUrl){
            title = self.text();
            if (!self.formId()){
                title = subUrl;
            }
        }
        checkTitle(url);

        if (url.match(/\/\/acft\.ws\//gi) != null || url.match(/\/\/qcrd\.co\//gi) != null)
        {
            this._setText(url, title);
            return;
        }

        this.context().webClient().httpRequest("http://acft.ws/", "GET", function(reply, error){
            if (error === false){
                var shortUrl = reply.url;
                if (shortUrl != undefined && shortUrl != ""){
                    checkTitle(shortUrl);
                    self._setText(shortUrl, title);
                }
            } else {
                self._setText(url, title);
            }
        }, {json: 'true', url: url}, "json");

    },

    initDomState : function () {
        this._super();
        this.initDomStatePos();

        //this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._shadow(this.shadow());
        //this._tabindex(this.tabindex() );
//        this._aspectRatio(this.aspectRatio(), true);// 'aspect' must be early than 'img' property
        this._updateLayout();
        this._checkShortUrl();
        this._border(this.border());
        this._font(this.font());
        this._urlMargin(this.urlMargin());
        this._textAlign(this.textAlign() );
//        this._updateLayout();
    },

    onPageDrawn: function() {
        this._showUrl(this.showUrl());
    },

    _updateLayout: function() {
        this._super();
        this._showUrl(this.showUrl());
    },

    _enable: function(flag) {

    },

    /**
     *
     * On click event
     */
    onClick : function(ev) {
        if (this.enable() === false){
            return;
        }
        var triggerEvent = new jQuery.Event(AC.Widgets.Base.onClick);
        $(this).trigger(triggerEvent, [ev]);
        if (!triggerEvent.isPropagationStopped()) {
            window.open(this._url);
        }
        ev.stopPropagation();
    },

    _beforeText: function(path) {
        return this._beforeLngProp(path, 'text');
    },

    _setText: function(path, title){
        var self = this,
            base = this.base();
        title = (title == undefined) ? path : title;

        function updateText(){
            self._link.find("a").html(title).attr("href", path);
            self._hrefColor(self.hrefColor());
            var w = self.width(),
                h = w;
            path = 'https://chart.googleapis.com/chart?chs=' + w + 'x' + (h - self._link.height()) + '&cht=qr&chl=' + path + '&choe=UTF-8&chld=Q|0';
            self._image.attr("src", path);
        }

        if (this._timeout){
            clearTimeout(self._timeout);
        }
        if (!self.base().is(':visible')){
            this._timeout = setTimeout(function(){
                if (self.base().is(':visible')){
                    updateText();
                    clearTimeout(self._timeout);
                }
            }, 200);
        } else {
            updateText();
        }
    },

    _textAlign: function(val){
        var div = this._link;
        if (val != undefined){
            val = (val === 'Center') ? 'middle' :
                    (val === 'Left') ? 'left' :
                    (val === 'Right') ? 'right' : val;
            div.attr("align", val);
        }
    },

    _getCurrentAppQrCode: function() {
        var url = this.form().shortUrl();
        return (url != undefined && url != "") ? url : this.form().getLiveUrl();
    },

    isBindableToData: function() {
        return true;
    },

    getDataModel: function() {
        return [
            {name: "src", value: "", uid: "srcuid"}
        ];
    }
}));

    var actions = AC.Widgets.Base.actions();
/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ImgQrCodeWidget.actions = function() {
    return actions;
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ImgQrCodeWidget.inlineEditPropName = function() {
    return "text";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.text,
        AC.Property.general.formId,
        AC.Property.general.showUrl,
        AC.Property.general.urlMargin,
        AC.Property.style.textAlign
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.mandatory
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
        AC.Property.style.shadow,
        AC.Property.style.border,
        AC.Property.style.margin,
        AC.Property.general.displayHourglassOver,
        AC.Property.general.hourglassImage,
        AC.Property.style.font,
        AC.Property.style.hrefColor,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ImgQrCodeWidget.props = function() {
    return _props;
};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ImgQrCodeWidget.emptyProps = function() {
    return {border:""};
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */

    var defaultProps = {x : "0", y: "0", width: "200", height: "200", zindex : "auto", enable : true,
        img: null, anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
        name: "QrCodeImg1",
        widgetStyle: "default",
        relationId: null,
        margin: "", alignInContainer: 'left', urlMargin: "",
        opacity: 1, customCssClasses: "",
        dragAndDrop: false, resizing: false,
        text: '%SetCurrentAppQRCode%',
        shadow: "",
        showUrl: true,
        textAlign: "Center"
    };
    WiziCore_UI_ImgQrCodeWidget.defaultProps = function() {
        return defaultProps;
};

WiziCore_UI_ImgQrCodeWidget.isField = function() {
    return true
};


})(jQuery,window,document);