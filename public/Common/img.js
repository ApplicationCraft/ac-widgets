/**
 * @lends       WiziCore_UI_ImgWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_ImgWidget = AC.Widgets.WiziCore_UI_ImgWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationSimple, WiziCore_Methods_Widget_ActionClick, {
    _widgetClass : "WiziCore_UI_ImgWidget",
    _image: null,
    _dataPropName : "img",
    _loading : null,
    _imgLoaded: false,
    _mapArea: null,
    _divForNonIEBrowsers: null,
    _selectedAreasIndexes: null,
    _originImgSize: null,


    /**
     * Description of constructor
     * @class       Some words about text widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._selectedAreasIndexes = [];
        this._originImgSize = {height: "100px", width: "100px", start: true};
        this._super.apply(this, arguments);
        if (this._project['useMap'] == "true"){
            this._project['useMap'] = true;
        } else if (this._project['useMap'] == "false"){
            this._project['useMap'] = false;
        }
    },

    draw : function() {
        var self = this,
            base = this.base();

        //init id
        var tuid = "img_" + this.htmlId();

        var mapName = tuid + "_map";
        this._mapArea = $("<map name=" + mapName + "><area shape='poly' coords='0,0,0,0'></map>"); //<area> tag must be inside, fix for IE
        base.prepend();
        this._image = $("<img style=' border:0;' usemap='#" + mapName + "'>");
        this._image.attr("id", tuid + "_image");

        this._link = $("<a style='display: block;text-decoration: none;'></a>");
        this._divForNonIEBrowsers = $("<div style='vertical-align:middle; display:table-cell;'></div>");
        if (!$.browser.msie) {
            this._divForNonIEBrowsers.append(this._image, this._mapArea);
            this._link.append(this._divForNonIEBrowsers);
            base.prepend(this._link);
        }
        else {
            this._link.append(this._image, this._mapArea);
            base.prepend(this._link);
            //base.css('vertical-align', 'middle');
        }

        this.bindAreas();

        base.css({'text-align' : 'center'}); // put on the middle
        //base.addClass("ac-widget-overflow-border-radius");
        this._loading = false;

        //set initial value
        //this.object().value(initialObject.prop(this._dataPropName));
        //update cursor pointer by actions
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this.updateCursorByAction(true);
        }

        if (this._bindingEvents[AC.Widgets.Base.onClick] == 0 || this._bindingEvents[AC.Widgets.Base.onClick] == undefined) {
            this.eventsHandles()[AC.Widgets.Base.onClick] = AC.Widgets.Base.onClick;
            if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
                this.bindEvent(AC.Widgets.Base.onClick);
            }
        }

        this._super.apply(this, arguments);
    },

    initProps: function() {
        this._super();
        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.dataType = this.normalProperty('dataType');
        this.mandatory = this.normalProperty('mandatory');

        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.img = this.htmlLngPropertyBeforeSet('img', this._beforeImg, this._img);
        this.image = this.img;
        this.aspectRatio = this.htmlProperty('aspectRatio', this._updateImgSize);
        this.link = this.normalProperty('link', this._updateLink);
        this.pageJump = this.normalProperty('pageJump');

        this.shadow = this.themeProperty('shadow', this._shadow);
        this.opacity = this.themeProperty('opacity', this._opacity);
        //this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.mapMultiSelect = this.htmlProperty('mapMultiSelect', this.fillMap);
        this.mapHighLight = this.htmlProperty('mapHighLight', this.fillMap);
        this.mapHighLightColor = this.htmlProperty('mapHighLightColor', this.fillMap);
        this.mapHighLightOpacity = this.htmlProperty('mapHighLightOpacity', this.fillMap);
        this.mapHighLightOpacity = this.htmlProperty('mapHighLightOpacity', this.fillMap);
        this.mapOutline = this.htmlProperty('mapOutline', this.fillMap);
        this.mapOutlineWidth = this.htmlProperty('mapOutlineWidth', this.fillMap);
        this.mapOutlineColor = this.htmlProperty('mapOutlineColor', this.fillMap);
        this.mapOutlineOpacity = this.htmlProperty('mapOutlineOpacity', this.fillMap);
        this.mapFade = this.htmlProperty('mapFade', this.fillMap);
        this.mapData = this.htmlProperty('mapData', function() {
            this.fillMap();
        });

        this.action = this.normalProperty('action');
        this.pageNum = this.normalProperty('pageNum');
        this.redirect = this.normalProperty('redirect');
        this.message = this.normalProperty('message');
        this.openUrl = this.normalProperty('openUrl');
        this.useMap = this.htmlProperty('useMap', this._useMap);
        this.aspectResize = this.htmlProperty('aspectResize', this._updateLayout);

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

    initDomState : function () {
        this._super();
        this.initDomStatePos();

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._shadow(this.shadow());
        //this._tabindex(this.tabindex() );
//        this._aspectRatio(this.aspectRatio(), true);// 'aspect' must be early than 'img' property
        this._updateLayout();
        this._img(this._project['img'], true);
        this._borderRadius(this.borderRadius());
        this._border(this.border());
        this._updateLink(this.link());
//        this._updateLayout();
    },

    /*    initEditorLayer: function(){
        this._super.apply(this, arguments);
     if (this._modeObject != null){
     this._modeObject.hide();
     this.base().unbind("resize");
     }
     },
     */

    _updateLayout: function() {
        this._super();
        this._updateContainerDivSize();
        this.checkResize();
        if (this.aspectRatio() == "aspect" && this.aspectResize() && this.mode() != WiziCore_Visualizer.EDITOR_MODE){
            this.relativeResize();
        }
        this._setPosEnableDiv();
    },

    _updateContainerDivSize: function() {
        this._updateImgSize();
    },

    relativeResize: function(callCheck) {
        this._super.apply(this);
        if (callCheck !== false){
            this._checkImgSize();
        }
    },

    _checkImgSize: function(){
        if (this.aspectRatio() == "aspect" && this.aspectResize()){
            this.checkResize();
            var nonIEDiv = this._divForNonIEBrowsers,
                link = this._link,
                image = this._image, ratio,
                imageHeight = image.height(), imageWidth = image.width(),
                width = (this.mode() != WiziCore_Visualizer.EDITOR_MODE) ? this.tableBase().width() : imageWidth,
                height;

            ratio = (imageHeight && imageWidth) ? imageHeight/imageWidth : this._resizeAspectRatio;
            if (this._resizeAspectRatio != ratio && (imageHeight != 0 && imageWidth !=0)){
                //if widget size is not equal with image size, aspect ratio was not right computed, needed recompute
                if (!this._resizeAspectRatioImage){
                    this._resizeAspectRatioImage = ratio;
                    this._resizeAspectRatio = ratio;
                }
                this.relativeResize(false);//and recall resize
            }

            height = (width * this._resizeAspectRatio) + "px";
            if (width){
                link.height(height);
                nonIEDiv.height(height);
                image.height(height);
            }
        }
    },

    _updateImgSize: function(val) {
        // this._divForNonIEBrowsers = only for NON IE browsers !!! 
        // soo settings will be ignored
        var tBase = this.tableBase(),
            height = this.height(),
            width = this.width(),
            pWidth = this.pWidth(),
            image = this._image,
            aspectRation = (val) ? val: this.aspectRatio();

        this._link.css({'width': width, 'height': height, display:'block'});
        this._divForNonIEBrowsers.css({'width': width, 'height': height, display:'table-cell'});
        if (aspectRation == 'aspect') {
            image.css({'max-height': height + 'px', 'max-width': width + 'px', 'height': "", 'width': "", 'vertical-align': ''});
            tBase.css({'width': width, 'height': height});

            if (pWidth > 0) {
                tBase.css({'width': pWidth + '%', 'table-layout':''});
                this._link.css({'width': '100%', display:'block'});
                this._divForNonIEBrowsers.css({'width': '100%', display:''});
                image.css({'max-width': '100%'});
            }
            else {
                tBase.css({'width': width, 'height': height, 'table-layout':''});
                this._link.css({'width': width, 'height': height, 'table-layout':''});
            }
            if (this.aspectResize()){
                image.css({height: height, "max-height" : ""});
            }
            this._checkImgSize();

        } else if (aspectRation == 'fit') {
            if ($.browser.msie) {
                image.css({'height': height, 'width': width, 'max-height': "", 'max-width': ""});
            }
            else {
                if (!pWidth || pWidth == ""){
                    image.css({'height': height, 'width': width, 'max-height': "", 'max-width': ""});
                } else {
                    image.css({'height': '100%', 'width': '100%', 'max-height': "", 'max-width': ""});
                }
            }
            image.css({'vertical-align': ''});
            if (pWidth > 0) {
                tBase.css({'width': pWidth + '%', 'height': height, 'table-layout':''});
                this._divForNonIEBrowsers.css({'width': '100%', display:''});
                this._link.css({'width': '100%', display:'block'});
            }
            else {
                tBase.css({'width': width, 'height': height, 'table-layout':''});
                this._link.css({'width': width, 'height': height, 'table-layout':''});
            }
        } else if (aspectRation == 'origin') {
            image.css({'height': '', 'width': '', 'max-height': '', 'max-width': '', 'vertical-align': 'top'}); //Bug #5358
            tBase.css({'min-width': width, 'min-height': height, width: '', height: '', 'table-layout':''});
            this._link.css({'min-width': width, 'min-height': height, width: '', height: '', 'table-layout':''});
        }
        if ($.browser.msie) {
            tBase.css('table-layout', 'fixed');
            this._link.css('table-layout', 'fixed');
        }
    },

    onResize: function() {
        if (this.aspectRatio() == 'aspect') {
            this._image.css({'max-height': this.base().height(), 'max-width': this.base().width(), 'height': "", 'width': ""});
        }
        this._link.css({'width': this.base().width(), 'height': this.base().height()});
        this._divForNonIEBrowsers.css({'width': this.base().width(), 'height': this.base().height()});
    },

    onPageDrawn: function() {
        var self = this;
        if (this._selectedAreasIndexes && $.isArray(this._selectedAreasIndexes) && this._selectedAreasIndexes.length > 0) {
            this.selectAreasByValues(this._selectedAreasIndexes);
        }
    },

    _useMap: function(val) {
        if (!val) {
            if (this.eventsHandles()[WiziCore_UI_ImgWidget.onAreaClick] > 0) {
                delete this.eventsHandles()[WiziCore_UI_ImgWidget.onAreaClick];
            }
            if (this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseEnter] > 0) {
                delete this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseEnter];
            }
            if (this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseLeave] > 0) {
                delete this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseLeave];
            }
            this._mapArea.empty();
            this._image.maphilight('destroy');
        } else {
            this.fillMap();
        }
    },

    _borderRadius: function(val, div) {
        this._super.apply(this, arguments);
        this._setElementBorderRadius(val, this._image);
    },

    _enable: function(flag) {
//        if (this.useMap()) {
//            this.fillMap();
//        }
        this.showEnableDiv(flag);
    },

//    getNewWidgetSize: function() {
//        this._divForNonIEBrowsers.css({'width': this.base().width(), 'height': this.base().height()});
//        return this._super();
//    },

    /**
     *
     * On click event
     */
    onClick: function(ev) {
        var triggerEvent = new jQuery.Event(AC.Widgets.Base.onClick),
            pageJump = this.pageJump(),
            app = this.form();
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", this.id());

        $(this).trigger(triggerEvent, [ev]);
        (!triggerEvent.isPropagationStopped()) && this.onActionClick(ev, pageJump, app);
        ev.stopPropagation();
    },

    fillMapAreas : function() {
        var map = this._mapArea;
        map.empty();
        var self = this;

        if (!this.useMap() || this.mode() != WiziCore_Visualizer.RUN_MODE ||
                this.enable() === false) {
            //drop appending areas in not run mode
            return;
        }

        var mapData = this.mapData();
        if (mapData != undefined && mapData.rows != undefined) {
            for (var i in mapData.rows) {
                var item = mapData.rows[i];
                var area = $("<area>").attr({
                    shape: item.data[0],
                    coords: item.data[1],
                    title: item.data[2],
                    value: item.data[2],
                    "data-index": item.id
                });
                map.append(area);
            }
        }

    },

    fillMap: function() {
        var map = this._mapArea;
        var mapData = this.mapData();
        this._image.maphilight('destroy');
        this.fillMapAreas();
        if (!this.useMap() ||
                mapData == null ||
                this.enable() === false ||
                this.mode() != WiziCore_Visualizer.RUN_MODE) {
            //drop create map
            return;
        }

        if (this.eventsHandles()[WiziCore_UI_ImgWidget.onAreaClick] == undefined) {
            this.eventsHandles()[WiziCore_UI_ImgWidget.onAreaClick] = WiziCore_UI_ImgWidget.onAreaClick;
        }
        if (this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseEnter] == undefined) {
            this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseEnter] = WiziCore_UI_ImgWidget.OnAreaMouseEnter;
        }
        if (this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseLeave] == undefined) {
            this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseLeave] = WiziCore_UI_ImgWidget.OnAreaMouseLeave;
        }

        var mapHighLightColor = this.mapHighLightColor();
        var mapHighLightOpacity = this.mapHighLightOpacity();
        var mapOutlineWidth = this.mapOutlineWidth();
        var mapOutlineColor = this.mapOutlineColor();
        var mapOutlineOpacity = this.mapOutlineOpacity();
        var highlight = this.mapHighLight();
        var outLine = this.mapOutline();
        var fade = this.mapFade();

        var props = {
            fill: highlight,
            stroke: outLine,
            fade: fade,
            fillColor : ((mapHighLightColor != null && mapHighLightColor != "") ? mapHighLightColor.substr(1): '000000' ),
            fillOpacity: ((mapHighLightOpacity != null && mapHighLightOpacity != "") ? mapHighLightOpacity: 0.2),
            strokeColor: ((mapOutlineColor != null && mapOutlineColor != "") ? mapOutlineColor.substr(1): 'ff0000'),
            strokeOpacity: ((mapOutlineOpacity != null && mapOutlineOpacity != "") ? mapOutlineOpacity: 1),
            strokeWidth: ((mapOutlineWidth != null && mapOutlineWidth != "") ? mapOutlineWidth: 1)
        };
        this._image.maphilight(props);
        this._image.css("display", "inline");
    },

    bindAreas: function() {
        var canBind = (this.mode() != WiziCore_Visualizer.EDITOR_MODE);
        if (canBind) {
            var self = this;
            if (this.eventsHandles()[WiziCore_UI_ImgWidget.onAreaClick] !== undefined){
                this._mapArea.unbind("vclick.custom").bind("vclick.custom", function(ev) {
                    if (ev.target && (ev.target.tagName).toLowerCase() == "area"){
                        self.onAreaClick(ev);
                    }
                });
            }
            if (this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseEnter] !== undefined){
                this._mapArea.unbind("mouseenter.custom").bind("mouseenter.custom", function(ev){
                    if (ev.target && (ev.target.tagName).toLowerCase() == "area"){
                        self.onMouseOverArea(ev);
                    }
                });
            }
            if (this.eventsHandles()[WiziCore_UI_ImgWidget.OnAreaMouseLeave] !== undefined){
                this._mapArea.unbind("mouseleave.custom").bind("mouseleave.custom", function(ev){
                    if (ev.target && (ev.target.tagName).toLowerCase() == "area"){
                        self.onMouseLeaveArea(ev);
                    }
                });
            }
        }
    },

    getDataFromAreaEvent: function(ev, isClick){
        var self = this;
        var area = $(ev.target);
        var ids = $(area).attr("data-index");
        var mapData = self.mapData();
        var value = "";
        if (mapData != null) {
            var mapArea = self._mapArea;
            if (self.mapMultiSelect()) {
                if (isClick){
                    value = [];
                    ids = [];
                    self._selectedAreasIndexes = [];
                    //change highLight state
                    var data = area.data('maphilight') || {};

                    data.alwaysOn = !data.alwaysOn;
                    area.data('maphilight', data);
                    mapArea.find("area").each(function(ind, el) {
                        var el = $(el);
                        var data = el.data('maphilight');
                        var elValue = el.attr("value");
                        var areaId = el.attr("data-index");
                        if (data != undefined && data.alwaysOn) {
                            ids.push(areaId);
                            self._selectedAreasIndexes.push(elValue);
                        }
                    });
                }

                //getting value
                for (var i in mapData.rows) {
                    var item = mapData.rows[i];
                    for (var j in ids) {
                        if (item.id == ids[j]) {
                            if (isClick){
                                value.push(item.data[2]);
                            } else {
                                value = item.data[2];
                            }
                        }
                    }
                }
            } else {
                //single select
                var selAreaId = $(area).attr("data-index");
                mapArea.find("area").each(function(ind, el) {
                    //drop all areas, but select only one
                    var el = $(el);
                    var data = el.data('maphilight') || {};
                    var areaId = el.attr("data-index");
                    var elValue = el.attr("value");
                    if (isClick){
                        data.alwaysOn = (selAreaId == areaId);
                        $(el).data('maphilight', data);
                        if (data.alwaysOn) {
                            ids = areaId;
                            self._selectedAreasIndexes = [elValue];
                        }
                    }
                });

                //getting value
                for (var i in mapData.rows) {
                    var item = mapData.rows[i];
                    if (item.id == ids) {
                        value = item.data[2];
                        break;
                    }
                }
            }
        }
        return {mapData: mapData, ids: ids, value: value};
    },

    onAreaClick: function(ev) {
        var self = this;
        var data = self.getDataFromAreaEvent(ev, true);

        //update state of areas (highlight or not)
        if (data.mapData != null){
            self._mapArea.trigger('alwaysOn.maphilight');
        }

        var triggerEvent = new jQuery.Event(WiziCore_UI_ImgWidget.onAreaClick);
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", self.id());
        $(self).trigger(triggerEvent, [ev, data.ids, data.value]);
        self.sendDrillDown();
    },

    onMouseOverArea: function(ev){
        var self = this;
        var data = self.getDataFromAreaEvent(ev);

        var triggerEvent = new jQuery.Event(WiziCore_UI_ImgWidget.OnAreaMouseEnter);
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", self.id());
        $(this).trigger(triggerEvent, [ev, data.ids, data.value]);
    },

    onMouseLeaveArea: function(ev){
        var self = this;
        var data = self.getDataFromAreaEvent(ev);

        var triggerEvent = new jQuery.Event(WiziCore_UI_ImgWidget.OnAreaMouseLeave);
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", self.id());
        $(this).trigger(triggerEvent, [ev, data.ids, data.value]);
    },



    resetValue: function() {
        this._selectedAreasIndexes = [];
        this.selectAreasByValues([]);
    },

    selectAreasByValues : function(vals) {
        if (!jQuery.isArray(vals)) {
            vals = [vals];
        }
        var self = this;
        var map = this._mapArea;
        if (self.mapMultiSelect() !== true) {
            //fix for single select
            vals = [vals[0]];
        }
        self._selectedAreasIndexes = vals;
        if (map != null && this._isDrawn) {
            self._selectedAreasIndexes = [];
            map.find("area").each(function(end, el) {
                //for each area drop alwaysOn
                var area = $(el);
                var elValue = area.attr("value");
                var data = area.data('maphilight') || {};
                data.alwaysOn = false;
                area.data('maphilight', data);
                if (WiziCore_Helper.inArray(elValue, vals)) {
                    data.alwaysOn = true;
                    area.data('maphilight', data);
                    self._selectedAreasIndexes.push(elValue);
                }
            });
            map.trigger('alwaysOn.maphilight');
        }
        return self._selectedAreasIndexes;
    },

    _beforeImg: function(path) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(path),
                token = isToken ? path : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, path);

            return token;
        } else
            return path;
    },

    _onInitLanguage: function() {
        this.img(this.img());
    },

    _onSTUpdated: function() {
        this._onLanguageChanged();
    },

    _onLanguageChanged: function() {
        this._img(this._project['img']);
    },

    _img: function(path, fromInitDomState) {
        if (!this._image)
            return;

        var trVal = WiziCore_Helper.isLngToken(path) ? this._getTranslatedValue(path) : path;
        var el = this._image;
        var self = this;
        if (self.useMap()) {
            this._image.maphilight('destroy');
        }
//        el.hide();
        this._updateImgSize();
        if (trVal != null && trVal != "") {
            if (this.base().hasClass('wiziNoImage')) {
                this.base().removeClass('wiziNoImage');
            }
//            this.originalImageSize(path);
//            el.unbind("load.custom");//if path changed before image loaded
//            self._imgLoaded = false;
//            el.bind('load.custom', function(ev) {
//                self._imgLoaded = true;
//                self.setMaintainAspectRatio(function(){
//                    self.showImageByFade();
//                }, fromInitDomState, "img");
//                self._image.unbind("load.custom");
//            });
            el.attr("src", trVal).show();
            if (self.useMap()) {
                self.fillMap();
            }
        } else {
            if (self.mode() == WiziCore_Visualizer.EDITOR_MODE){
                this.base().addClass('wiziNoImage');
            }
            el.attr("src", null).hide();
//            el.show();
        }
        this._updateLayout();
    },

    showImageByFade: function() {
        this._image.fadeIn(50, function() {
            //if (self.useMap()) { self.fillMap(); }
        });
    },

    _aspectRatio: function(val, fromInitDomState) {
        if (this.img() != '' && this.img() != undefined) {
            this._updateImgSize(val);
//            var self = this;
//            if (fromInitDomState !== true){
//                by first time, we don't need to change width and height by original image size
//                switch (val) {
//                    case "aspect":
//                        this.setMaintainAspectRatio(function(){
//                            self._updateContainerDivsize();
//                            self.showImageByFade();
//                        }, undefined, "aspect");
//                        break;
//                    case "fit":
//                        self._updateContainerDivsize();
//                        this._updateImgSize();
//                        break;
//                    case "origin":
//                        var size = self.originalImageSize();
//                        self.width(size.width);
//                        self.height(size.height);
//                        break;
//                }
//            }
        }
    },

//    setMaintainAspectRatio : function(callback, fromInitDomState, fromCall) {
//        var self = this,
//            newSize = {},
//            contWidth = this.width(),
//            contHeight = this.height(),
//            newImg = new Image(),
//            imgPath = this.img(),
//            isEditor = (this.mode() == WiziCore_Visualizer.EDITOR_MODE);
//
//        if (imgPath != ""){
//            $(newImg).css("opacity", 0);
//            $(newImg).load(function() {
//                var iWidth = newImg.width,
//                    iHeight = newImg.height;
//                if (fromCall == "aspect"){
//                    self.width(iWidth);
//                    self.height(iHeight);
//                } else {
//                    //call from img prop
//                    if (isEditor){
//                        //for editor mode
//                        if (fromInitDomState !=true ){
//                            self.width(iWidth);
//                            self.height(iHeight);
//                        }
//                    } else {
//                        if (self.aspectRatio() != "fit"){
//                            //for live mode
//                            var widthCoefficient = iWidth / contWidth;
//                            var heightCoefficient = iHeight / contHeight;
//                            var coefficient = (widthCoefficient > heightCoefficient) ? widthCoefficient : heightCoefficient;
//                            newSize = {width: Math.ceil(iWidth / coefficient), height: Math.ceil(iHeight / coefficient)};
//
//                            var marginTop = (contHeight - newSize.height) / 2;
//                            $(self._image).css({'margin-top': marginTop});
//                            $(self._image).css(newSize);
//                        }
//                    }
//                }
//                callback();
//            });
//            newImg.src = imgPath;
//        } else {
//            callback();
//        }
//    },
//
//    originalImageSize : function(imgPath) {
//        if (imgPath != undefined){
//            var res = this._originImgSize;
//            var newImg = new Image();
//            var callback = function(){};
//            if (typeof imgPath == "function"){
//                callback = imgPath;
//                imgPath = this.img();
//            }
//            if (imgPath != "" && imgPath != undefined){
//                $(newImg).css("opacity", 0);
//                $(newImg).load(function() {
//                    res.height = newImg.height;
//                    res.width = newImg.width;
//                    res.start = false;
//                    callback(res);
//                });
//                newImg.src = imgPath;
//            } else {
//                callback(res);
//            }
//        }
//        return this._originImgSize;
//    },

//    getNewWidgetSize: function(){
//        var w = parseInt(this.base().css("width")),
//            h = parseInt(this.base().css("height")),
//            ret = {width: w, height: h},
//            aspectRatio = this.aspectRatio(),
//            size = this.originalImageSize(),
//            sw = parseInt(size.width),
//            sh = parseInt(size.height),
//            ratio = sw / sh;
//        if (aspectRatio != "fit"){
//            if (ratio > 1){
//                var tmp = w / sw;
//                var h = Math.round(sh * tmp);
//                //var h = Math.round(h / ratio);
//                ret.height = h;
//            } else {
//                //var w = Math.round(w * ratio);
//                var tmp = h / sh;
//                var w = Math.round(sw * tmp);
//                ret.width = w
//            }
//        }
//        return ret;
//    },

    value : function(val) {
        //if useMap == true, use areas, or use imgPath
        if (this.useMap()) {
            if (val !== undefined) {
                this.selectAreasByValues(val);
            }
            return this._selectedAreasIndexes;
        } else {
            if (val !== undefined) {
                this.img(val);
            } else {
                return this.img();
            }
        }
    },

    getDataModel: function() {
        return [
            {name: "src", value: "", uid: "srcuid"}
        ];
    },

    appendValueToDataObject: function(dataObject, invalidMandatoryWidgets, force) {
        var self = this;
        return this._simpleDataObjectValue(dataObject, force, function(value) {
            if (self.mandatory()) {
                var isEmpty = (value == '');
                if (isEmpty) {
                    invalidMandatoryWidgets[self.id()] = true;
                }
                value = ((isEmpty) ? null : value);
            }
            return value;
        });
    },

    isBindableToData: function() {
        return true;
    }
}));

WiziCore_UI_ImgWidget.onAreaClick = "E#Img#onAreaClick";
WiziCore_UI_ImgWidget.OnAreaMouseEnter = "E#Img#OnAreaMouseEnter";
WiziCore_UI_ImgWidget.OnAreaMouseLeave = "E#Img#OnAreaMouseLeave";

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_ImgWidget.actions = function() {
    var ret = {
        onAreaClick : {alias : "widget_event_onareaclick", funcview : "onAreaClick", action : "AC.Widgets.WiziCore_UI_ImgWidget.onAreaClick", params : "ev, id, value", group : "widget_event_mouse"},
        OnAreaMouseEnter : {alias : "widget_event_onareaover", funcview : "OnAreaMouseEnter", action : "AC.Widgets.WiziCore_UI_ImgWidget.OnAreaMouseEnter", params : "ev, id, value", group : "widget_event_mouse"},
        OnAreaMouseLeave : {alias : "widget_event_onarealeave", funcview : "OnAreaMouseLeave", action : "AC.Widgets.WiziCore_UI_ImgWidget.OnAreaMouseLeave", params : "ev, id, value", group : "widget_event_mouse"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
    };
    // append base actions
    ret = jQuery.extend(AC.Widgets.Base.actions(), ret);
    return ret;
};

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_ImgWidget.inlineEditPropName = function() {
    return "img";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.aspectRatio,
        AC.Property.general.img,
        AC.Property.general.image,
        AC.Property.general.link,
        AC.Property.general.pageJump
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.dataType,
        AC.Property.database.mandatory
    ]},
    { name: AC.Property.group_names.layout, props:[
        AC.Property.layout.aspectResize,
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
    { name: AC.Property.group_names.imagemap, props:[
        AC.Property.imagemap.useMap,
        AC.Property.imagemap.mapData,
        AC.Property.imagemap.mapMultiSelect,
        AC.Property.imagemap.mapHighLight,
        AC.Property.imagemap.mapHighLightColor,
        AC.Property.imagemap.mapHighLightOpacity,
        AC.Property.imagemap.mapOutline,
        AC.Property.imagemap.mapOutlineWidth,
        AC.Property.imagemap.mapOutlineColor,
        AC.Property.imagemap.mapOutlineOpacity,
        AC.Property.imagemap.mapFade
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.border,
        AC.Property.style.borderRadius,
        AC.Property.style.margin,
        AC.Property.general.displayHourglassOver,
        AC.Property.general.hourglassImage,
        AC.Property.style.shadow,
        AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
    ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_ImgWidget.props = function() {
    return _props;
};


/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ImgWidget.emptyProps = function() {
    return {border:""};
};

    var defaultProps = {x : "0", y: "0", width: "100", height: "100", zindex : "auto", enable : true,
            img: null, anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
            name: "image1", aspectRatio:"aspect", action: "none", pageNum: 1,
            widgetStyle: "default",
            relationId: null,
            addLink: 'Add',
            target: 'Same',
            hourglassImage: "Default",
            aspectResize: false,
        displayHourglassOver: "inherit", customCssClasses: "",
            useMap: false,
            mapFade: true,
            mapOutline: true,
            mapHighLight: true,
            dragAndDrop: false, resizing: false,
            margin: "", alignInContainer: 'left',
            opacity: 1, shadow: ""
        };
/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_ImgWidget.defaultProps = function() {
    return defaultProps
};

WiziCore_UI_ImgWidget.isField = function() {
    return true
};
})(jQuery,window,document);