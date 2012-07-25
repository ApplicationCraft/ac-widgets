/**
 * @lends       WiziCore_UI_IFrameWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_IFrameWidget = AC.Widgets.WiziCore_UI_IFrameWidget =  AC.Widgets.Base.extend({
    _widgetClass : "WiziCore_UI_IFrameWidget",
    _dataPropName : "iframeUrl",
    _iframe: null,

    /**
     * Description of constructor
     * @class  Some words about iframe widget class
     * @author      Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
	init: function(){
        this._super.apply(this, arguments);
	},

    draw: function() {
        this._super.apply(this, arguments);
    },

    onPageDrawn: function(){
        this.createIFrame();
        this._updateEnable();
    },

    initProps: function() {
        this._super();

        this.iframeUrl = this.htmlLngPropertyBeforeSet('iframeUrl', this._beforeIframeUrl, this._iframeUrl);
        this.iframeMode = this.normalProperty('iframeMode', this.createIFrame);
        this.value = this.iframeUrl;

        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');

        this.border = this.themeProperty('border', this._border);
        this.bg = this.themeProperty('bgColor', this._bg);

        this.shadow = this.themeProperty('shadow', this._shadow);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.enable = this.htmlProperty('enable', this._enable);
        //this.tabindex = this.htmlProperty('tabindex', this._tabindex);

    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();

        this._bg(this.bg());
        this._border(this.border());

        this._visible(this.visible());
        this._opacity(this.opacity());
        this._shadow(this.shadow());
        //this._tabindex(this.tabindex());
    },

    _updateLayout: function(){
        this._super();
        if (this._iframe != null){
           $(this._iframe).width(this.width())
           $(this._iframe).height(this.height());
        }
        if (this._enableDiv != null){
            this._enableDiv.height(this.base().height())
                            .width(this.base().width());
        }
    },

    getDataWithoutIFrame: function(src){
        var self = this;
        var wc = this.context().webClient();
        wc["httpRequest"].call(wc, src, "GET", function(res, error){
            if (self.mode() == WiziCore_Visualizer.RUN_MODE && self.form().runtimeMode() != WiziCore_UI_FormRuntime.PREVIEW_MODE){
                self.onLoad();
            }
            if (res == "Error result" || error) {
                self.prepareDataAndAppend(false);
            } else {
                src = src.replace(/http:\/\//i, '');
                var url = "http://" + src.match(/(([a-z_\-\.]+[\/])*)(((\d{2,4}[\/]){1,3})?)(([a-z0-9_\-]+[\.][a-z]{3,4})|([\d]*))?/i)[1];
                self.prepareDataAndAppend(res, url);
            }
        },undefined, "html", undefined, {'useProxy': true});
    },

    prepareDataAndAppend: function(data, domainUrl){
        if (data){
            var self = this;
            var frameId = "#iframe_" + self.htmlId();
            var html = data.replace(/\<![^>]*\>/i, '');
            html = html.replace(/(\<\/*)head[^>]*(\>)/gi, '$1div$2');
            html = html.replace(/((\<)(html)([^>]*\>))|((\<\/)(html)(\>))/gi, '$2$6div$4$8')
            html = html.replace(/(\<\/*)body[^>]*(\>)/gi, '$1div$2');
            html = html.replace(/(\s+(src|href)=['"])((?!(http|https):)\/*)(([^"']*)['"])/gi, "$1" + domainUrl + "$4");
            html = html.replace(/(<object[^>]*data=['"])((?!(http|https):)\/*)(([^"']*)['"])/gi, "$1" + domainUrl + "$4");

            var styleArr = [];
            var findStyles = /<link[^>]*href=['"]([^'"]*.css[^'"]*)["'][^>]*>/gi;
            var myArray = null;
            while ((myArray = findStyles.exec(html)) != null){
                styleArr.push([myArray[0], myArray[1]]);
            }

            var findScripts = /<script[^>]*src=['"]([^'"]*.js[^'"]*)["'][^>]*>/gi;
            while ((myArray = findScripts.exec(html)) != null){
                styleArr.push([myArray[0], myArray[1]]);
            }

            //check style files and concat them to one, then add div #id and insert them to <style> tag
            findStyles = /<style[^>]*>([^<]*)<\/style[^>]*>/gi;
            var additionStyles = "";
            while ((myArray = findStyles.exec(html)) != null){
                if (myArray[1].trim().length > 0){
                    if (self.mode() == WiziCore_Visualizer.RUN_MODE && self.form().runtimeMode() != WiziCore_UI_FormRuntime.PREVIEW_MODE){
                        html = html.replace(myArray[1], (frameId + " " + myArray[1].replace(/\n/g,'').replace(/([},]+)([^{},]*)(?=[{,])/gi,' $1 ' + frameId + ' $2 ')));
                    } else {
                        html = html.replace(myArray[1], "");
                    }
                }
            }

            $(this.base()).one(WiziCore_UI_IFrameWidget.stylesReady, function(){
                for (var i = 0, l = self._styles.length; i < l; i++){
                    if (self._styles[i][0].indexOf('<script') >= 0){
                        var replacer = self._styles[i][0].replace(/src=['"][^'"]*['"]/gi,'').replace(/\/>/gi,'>') + self._styles[i][1];
                        if (self.mode() == WiziCore_Visualizer.RUN_MODE && self.form().runtimeMode() != WiziCore_UI_FormRuntime.PREVIEW_MODE){
                            if (self._styles[i][0].indexOf('\/>') >= 0){
                                html = html.replace(self._styles[i][0], replacer + "</script>");
                            } else {
                                html = html.replace(self._styles[i][0], replacer);
                            }
                        } else {
                            html = html.replace(self._styles[i][0], "");
                        }
                    } else {
                        self._styles[i][1] = frameId + " " + self._styles[i][1].replace(/\n/g,'').replace(/([},]+)([^{},]*)(?=[{,])/gi,' $1 ' + frameId + ' $2 ');
                        var replacer = self._styles[i][0].replace(/<link/gi, '<style').replace(/href=['"][^'"]*['"]/gi,'').replace(/\/>/gi,'>') + self._styles[i][1] + "</style>";
                        if (self.mode() == WiziCore_Visualizer.RUN_MODE && self.form().runtimeMode() != WiziCore_UI_FormRuntime.PREVIEW_MODE){
                            html = html.replace(self._styles[i][0], replacer);
                        } else {
                            html = html.replace(self._styles[i][0], "");
                        }
                    }
                }
                if (self.mode() == WiziCore_Visualizer.EDITOR_MODE || self.form().runtimeMode() == WiziCore_UI_FormRuntime.PREVIEW_MODE){
                    html = html.replace(/<\s*?script[^>]*?>[\s\S]*?<\s*?\/script[^>]*?>/gi, "");
                    html = html.replace(/<\s*?\/script[^>]*?>/gi, "");
                }
                if (self._iframe){
                    self._iframe.empty().append(html);
                }
            });
            this._getStyles(styleArr);
        }
    },

    _getStyles: function(styleFilesArr){
        this._styles = [];
        this._counter = 0;
        if (!styleFilesArr || styleFilesArr.length < 1){
            $(this.base()).trigger(WiziCore_UI_IFrameWidget.stylesReady);
            return;
        }
        var self = this;
        var wc = this.context().webClient();
        var functionStyleGet = function(z){
            return function(res, error){
                if (!(error || res == "Error result")){
                    self._styles.push([styleFilesArr[z][0], res]);
                }
                self._counter++;
                if (self._counter == styleFilesArr.length){
                    $(self.base()).trigger(WiziCore_UI_IFrameWidget.stylesReady);
                }
            }
        };
        for (var i = 0, l = styleFilesArr.length; i < l; i++){
            wc["httpRequest"].call(wc, styleFilesArr[i][1], "GET", functionStyleGet(i), undefined, "html", undefined, {'useProxy': true});
        }
    },

    /**
     * Creating iFrame html element
     */
    createIFrame: function(){
        var iFrame, frameId;
        if (this.iframeMode() == 'iframe'){
            if (this._iframeDiv){
                this._iframeDiv.hide();
            }
            if (this._iframeFrame){
                iFrame = this._iframeFrame;
                $(iFrame).show();
            } else {
                iFrame = document.createElement('iframe');
                frameId = "iframe_" + this.htmlId();
                iFrame.setAttribute("id", frameId);
                iFrame.setAttribute("name", frameId);
                iFrame.setAttribute("scrolling", "auto");
                iFrame.setAttribute("frameBorder", 0);
                iFrame.setAttribute("hspace", 0);
                iFrame.setAttribute("vspace", 0);
                this._iframeFrame = iFrame;
            }
        } else {
            if (this._iframeFrame){
                $(this._iframeFrame).hide();
            }
            if (this._iframeDiv){
                iFrame = this._iframeDiv;
                iFrame.show();
            } else {
                iFrame = $("<div>").css({"overflow": "auto"});
                frameId = "iframe_" + this.htmlId();
                iFrame.attr("id", frameId);
                this._iframeDiv = iFrame;
            }
        }
        this._iframe = iFrame;
        $(iFrame).css({width: this.width(), height: this.height()});
        //var htmlContainer = document.getElementById( divCont.attr("id") );
        //htmlContainer.appendChild(iFrame);
        this.base().append(iFrame);
        var self = this;
        if (self.mode() == WiziCore_Visualizer.RUN_MODE){
            if (this.iframeMode() == 'iframe'){
                $(iFrame).load(function(ev){
                    self.onLoad(ev);
                });
            }
        }
        this._updateEnable();
        this._iframeUrl(this._project['iframeUrl']);
    },

    onLoad: function(ev){
        var triggerEvent = new $.Event(WiziCore_UI_IFrameWidget.onLoad);
        $(this.object()).trigger(triggerEvent);
        return !triggerEvent.isPropagationStopped();
    },

    _onInitLanguage: function() {
        this.iframeUrl(this.iframeUrl());
    },

    _onSTUpdated: function() {
        this._onLanguageChanged();
    },

    _onLanguageChanged: function() {
        this._iframeUrl(this._project['iframeUrl']);
    },

    _beforeIframeUrl: function(val) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(val),
                token = isToken ? val : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, val);

            return token;
        } else
            return val;
    },

    _iframeUrl: function(val){
        var trVal = WiziCore_Helper.isLngToken(val) ? this._getTranslatedValue(val) : val;

        if (trVal === null) trVal = "";
        if (trVal != undefined){
            if (this._iframe != null){
                if (this.iframeMode() == 'iframe'){
                    this._iframe.setAttribute("src", trVal);
                } else {
                    this.getDataWithoutIFrame(trVal);
                }
            }
		}
	},

    value: function(val){
        /*
    	var ret = this.iframeUrl(val);
    	if (this.object() != null){
    		this.object().prop("iframeUrl", val);
    		if (this.object().value() != val)
    			this.object().value(val);
    	}
        return ret;
        */
    },

    _enable: function(flag){
        if (this._iframe != null){
            this.showEnableDiv(flag);
        }

    },

    _border: function(val) {
        if (val != undefined) {
            this._super(val);
            if (this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
                WiziCore_Helper.setIfNeedDefaultContainerBorder(this.base(), this.border());
            }
        }
    },

    getDataModel: function() {
        return [{name: "widget_url", value: "", uid: "labeluid"}];
    },

    onContainerChangeLayout: function(layout) {
        //calls from _updateLayout or when parent change layout property
        this._setPosEnableDiv();
    }
});
WiziCore_UI_IFrameWidget.onLoad = "E#IFrame#onLoad";
WiziCore_UI_IFrameWidget.stylesReady = "E#IFrame#stylesReady";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_IFrameWidget.actions = function(){
    var ret = {
                load : {alias : "widget_event_onload", funcview : "onLoad", action : "AC.Widgets.WiziCore_UI_IFrameWidget.onLoad", params : "", group : "widget_event_general"}
               };
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    return ret;
};

var _props = [{ name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.iframeUrl,
            AC.Property.advanced.iframeMode
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
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.bgColor,
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
WiziCore_UI_IFrameWidget.props = function(){
    return _props;
};



    var capabilities = {
        actions: WiziCore_UI_IFrameWidget.actions(),

        defaultProps: {width: 150, height: 100, x : "100", y: "50", zindex : "auto",
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true, enable: true,
            dragAndDrop: false, resizing: false, shadow: "", iframeMode: "iframe",
            iframeUrl: "", displayHourglassOver: "inherit", customCssClasses: "",
            widgetStyle: "default", opacity : 1, name:"iFrame1", pWidth: "", margin: "", alignInContainer: 'left', hourglassImage: "Default"
        },

        inlineEditPropName: "iframeUrl", //doubleClick support for widget

        emptyProps: {bgColor : "", border: ""},
        isField: false,
        props: WiziCore_UI_IFrameWidget.props(),

        containerType: AC.Widgets.Base.CASE_TYPE_ITEM
    };
    WiziCore_UI_IFrameWidget.capabilities = function(){
    return capabilities;
};

})(jQuery,window,document);