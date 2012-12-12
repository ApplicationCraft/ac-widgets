(function($, window, document, undefined){

    // This top section should always be present
    var widget = AC.Widgets.Photoswipe = function() {
        this.init.apply(this, arguments);
    };
    AC.extend(widget, AC.Widgets.Base);
    var p = widget.prototype;
    AC.copyExtension(p, AC.WidgetExt.DataIntegration.AssocArray);

    // Define the widget Class name
    p._widgetClass = "Photoswipe";
    p._dataPropName = "data";
    p._cont = null;
    p._galCont = null;
    p._photoswipe = null;
    p._onParentContInited = false;
    p._isSlideShowActive = false;
    p._skipSlideshowStartStopEvents = false;

    /**
     * Constructor
     * @class  Constructor / Destructor below
     * @constructs
     */
    p.init = function() {
        widget._sc.init.apply(this, arguments);
    };

    p.onDestroy = function() {
        this._removeGallery();

        if (this._cont) {
            this._cont.remove();
            this._cont = null;
        }
    };

    p._onInitLanguage = function() {
        this.data(this.data());
    };

    p._onSTUpdated = function() {
        this._onLanguageChanged();
    };

    p._onLanguageChanged = function() {
        this._data(this._project['data']);
    };

    /**
     * Widget draw function
     */
    p.draw = function() {
        widget._sc.draw.apply(this, arguments);

        this._cont = $("<div style='width:100%;position: relative; overflow: hidden' />");
        this.base().append(this._cont);

        this._data(this._project['data']);
        this._updateEnable();

        var self = this;

        //hack to prevent photoswipe freeze
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            $(this.form()).bind(AC.Widgets.WiziCore_Api_Form.PageChanging.onStart + '.' + this.htmlId(), function (e, id) {
                if (self.page().id() != id && self._photoswipe && self._photoswipe.carousel) {
                    self._skipSlideshowStartStopEvents = true;
                    self._photoswipe.stop();
                    self._photoswipe.carousel.isSliding = false;
                    Code.Util.Animation.stop(self._photoswipe.carousel.contentEl);
                    self._skipSlideshowStartStopEvents = false;
                }
            });
            $(this.repeatCompatiblePage())
                .bind(AC.Widgets.WiziCore_Api_Page.onPageShow + '.' + this.htmlId(), function () {
                    if (self._photoswipe && self._isSlideShowActive) {
                        self._skipSlideshowStartStopEvents = true;
                        self._photoswipe.play();
                        self._skipSlideshowStartStopEvents = false;
                    }
                });
        }
    };

    p.onRemove = function(){
        $(this.form()).unbind(AC.Widgets.WiziCore_Api_Form.PageChanging.onStart + '.' + this.htmlId());
        $(this.repeatCompatiblePage()).unbind(AC.Widgets.WiziCore_Api_Page.onPageShow + '.' + this.htmlId());
    };


    p._updateLayout = function() {
        widget._sc._updateLayout.apply(this, arguments);

        if (this.photoswipeMode() == 'swipe' && this._cont != null) {
            this._cont.height(this.height() + 'px');

            if (this._photoswipe)
                this._photoswipe.resetPosition(true);
        }

        if (!this.pWidth() || this.parent().getLayoutType() == 'absolute') {
            this.tableBase().css('width', this.width());
        }

        if (this.photoswipeMode() == 'swipe')
            this._setPosEnableDiv();
    };

    p._enable = function(flag) {
        widget._sc._enable.apply(this, arguments);
        var isSwipe = this.photoswipeMode() == 'swipe';
        var needToShowEnableDiv = (flag === false && isSwipe);
        this.showEnableDiv(!needToShowEnableDiv);
        this._zindex(901, this._enableDiv);

        if (this._cont) {
            if (flag !== true && !isSwipe) {
                this._cont.addClass('ui-state-disabled');
                this._cont.find('a').css('cursor', 'default');
            } else {
                this._cont.removeClass('ui-state-disabled');
                this._cont.find('a').css('cursor', '');
            }
        }
        Code.PhotoSwipe.stopTapEvent = !flag;
    };

    //TODO: hack for mobile click event
    p.onClick = function() {};

    p.initDomState = function() {
        widget._sc.initDomState.call(this);
        this.initDomStatePos();
        this._bg(this.bg());
        this._border(this.border());

        this._visible(this.visible());
        this._opacity(this.opacity());
    };

    /**
     * Widget methods implementation
     */
    p.getDataFromMap = function(data, mapObject) {
        var res = [],
            i,j,l,item,mapValue;

        for (i = 0, l = data.length; i < l; i++) {
            item = {};
            for (j in mapObject) {
                mapValue = mapObject[j];
                if (mapValue != undefined) {
                    item[j] = AC.Widgets.Base.getDataItemWithMap(data[i], mapValue);
                }
            }
            res.push(item);
        }

        return res;
    };

    p._photoswipeMode = function(val) {
        if (val != undefined && this._isDrawn) {
            this._data(this.data());
            this._updateEnable();
        }
    };

    p._beforeData = function(data){
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
                this._processRowValue(id, i, data, oldData, 'title');
                this._processRowValue(id, i, data, oldData, 'thumbnail');
                this._processRowValue(id, i, data, oldData, 'thumbnailtext');
                this._processRowValue(id, i, data, oldData, 'src');

                if (data[i].userData != undefined)
                    data[i].userData = undefined;
            }
        }
        return data;
    };

    p._processRowValue = function(id, index, data, oldData, param) {
        var isValueToken = WiziCore_Helper.isLngToken(data[index][param]),
            token, hasToken;
        if (!isValueToken) {
            hasToken = (id != null) && WiziCore_Helper.isLngToken(oldData[id][param]);
            if (hasToken)
                token = oldData[id][param];
            else
                token = WiziCore_Helper.generateId(10, 'ac-');

            this.form().addTokenToStringTable(this.id(), this.name(), token, data[index][param]);
            data[index][param] = token;
        }
    };

    p._afterGet = function(data) {
        var ret = WiziCore_Helper.clone(data);

        if ($.isArray(ret)) {
            for (var i = 0, l = ret.length; i < l; i++) {
                ret[i].userData = {id:i};
                ret[i]['title'] = this._getTranslatedValue(ret[i]['title']);
                ret[i]['thumbnail'] = encodeURI(this._getTranslatedValue(ret[i]['thumbnail']));
                ret[i]['thumbnailtext'] = this._getTranslatedValue(ret[i]['thumbnailtext']);
                ret[i]['src'] = encodeURI(this._getTranslatedValue(ret[i]['src']));
            }
        }
        return ret;
    };

    p._data = function(data) {
        //clear gallery
        this._removeGallery();

        if (!this._cont || data == undefined || !$.isArray(data) || data.length == 0) {
            return;
        }

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        if (this.photoswipeMode() == 'swipe') {
            if (this._cont)
                this._cont.css('height', this.height() + 'px');

            createPhotoswipeInSwipeMode.call(this, data);
        } else {
            if (this._cont)
                this._cont.css('height', '100%');

            createPhotoswipeInGalleryMode.call(this, data);
        }
        addEvents.call(this);
        jQuery.fn.__useTr = trState;
    };

    function addEvents() {
        var self = this;

        function triggerEvent(eventName, params) {
            $(self).trigger(new $.Event(widget[eventName]), params);
        }

        if (this._photoswipe) {
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onBeforeShow, triggerEvent('onBeforeShow'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onShow, function(e){ self._onShow(); });
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onBeforeHide, triggerEvent('onBeforeHide'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onDisplayImage, function(e){ triggerEvent('onDisplayImage', [e.action, e.index]); });
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onResetPosition, triggerEvent('onResetPosition'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onSlideshowStart, $.proxy(self._onSlideShowStart, this));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onSlideshowStop, $.proxy(self._onSlideShowStop, this));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onTouch, function(e){ triggerEvent('onTouch', [e.action, e.point]); });
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onBeforeCaptionAndToolbarShow, triggerEvent('onBeforeCaptionAndToolbarShow'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onCaptionAndToolbarShow, triggerEvent('onCaptionAndToolbarShow'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onBeforeCaptionAndToolbarHide, triggerEvent('onBeforeCaptionAndToolbarHide'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onCaptionAndToolbarHide, triggerEvent('onCaptionAndToolbarHide'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onToolbarTap, triggerEvent('onToolbarTap'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onBeforeZoomPanRotateShow, triggerEvent('onBeforeZoomPanRotateShow'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onZoomPanRotateShow, triggerEvent('onZoomPanRotateShow'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onBeforeZoomPanRotateHide, triggerEvent('onBeforeZoomPanRotateHide'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onZoomPanRotateHide, triggerEvent('onZoomPanRotateHide'));
            this._photoswipe.addEventHandler(Code.PhotoSwipe.EventTypes.onZoomPanRotateTransform, triggerEvent('onZoomPanRotateTransform'));
        }
    }

    p._onShow = function() {
        if (this.photoswipeMode() == 'swipe')
            this._updateEnable();

        $(this).trigger(new jQuery.Event(widget.onShow));
    };

    p._onSlideShowStart = function() {
        if (!this._skipSlideshowStartStopEvents) {
            this._isSlideShowActive = true;
            $(this).trigger(new $.Event(widget.onSlideshowStart));
        }
    };

    p._onSlideShowStop = function() {
        if (!this._skipSlideshowStartStopEvents) {
            this._isSlideShowActive = false;
            $(this).trigger(new $.Event(widget.onSlideshowStop));
        }
    };

    function removeEvents() {
        if (this._photoswipe) {
            $(this._photoswipe).unbind();
        }
    }

    function createPhotoswipeInGalleryMode(data) {
        var i, l, imgEl, labelEl, thumbSrc, imageTr, labelTr, labelCode, thumbnail, source, title, thumbnailtext,
            columnsCount = Math.floor(100/this.columnWidth());

        this._galCont = $("<table class='photoswipe-gallery' style='width:100%;height:100%; table-layout: fixed;' />");

        for (i = 0, l = data.length; i < l; i++) {
            if (i % columnsCount == 0) {
                imageTr = $("<tr style='vertical-align: middle' />");
                labelTr = $("<tr />");
                this._galCont.append(imageTr, labelTr);
            }

            thumbnail = WiziCore_Helper.isLngToken(data[i].thumbnail) ? this._getTranslatedValue(data[i].thumbnail) : data[i].thumbnail;
            source = WiziCore_Helper.isLngToken(data[i].src) ? this._getTranslatedValue(data[i].src) : data[i].src;
            title = WiziCore_Helper.isLngToken(data[i].title) ? this._getTranslatedValue(data[i].title) : data[i].title;
            thumbnailtext = WiziCore_Helper.isLngToken(data[i].thumbnailtext) ? this._getTranslatedValue(data[i].thumbnailtext) : data[i].thumbnailtext;

            thumbSrc = (thumbnail == undefined || thumbnail == '') ? source : thumbnail;

            imgEl = $("<td style='width:" + this.columnWidth() + "%'><a class='wphotoswipe-image' href='" + source + "'><img src='" + thumbSrc + "' alt='" + title + "' /></a></td>");
            imageTr.append(imgEl);

            if (thumbnailtext != undefined && thumbnailtext != '') {
                labelCode = "<div style='text-align: center; overflow: hidden; margin: 5px'>" + thumbnailtext + "</div>";
            } else
                labelCode = '';

            labelEl = $("<td style='width:" + this.columnWidth() + "%'>" + labelCode + "</td>");
            labelTr.append(labelEl);
        }

        this._cont.append(this._galCont);

        var mode = this.mode() != WiziCore_Visualizer.EDITOR_MODE;
        this._photoswipe = this._galCont.find("a.wphotoswipe-image").photoSwipe({
            autoStartSlideshow: this.autoStartSlideshow() === true,
            captionAndToolbarAutoHideDelay: this.toolbarAutoHideDelay(),
            captionAndToolbarOpacity: this.toolbarOpacity(),
            imageScaleMethod: this.imageScaleMethod(),
            allowRotationOnUserZoom: this.allowRotationOnUserZoom(),
            captionAndToolbarHide: this.captionAndToolbarHide(),
            enableMouseWheel: mode , enableKeyboard: mode, zIndex: 900
        });
    }

    function createPhotoswipeInSwipeMode(data) {
        var i, l, imgArray = [], source, title;

        for (i = 0, l = data.length; i < l; i++) {
            source = WiziCore_Helper.isLngToken(data[i].src) ? this._getTranslatedValue(data[i].src) : data[i].src;
            title = WiziCore_Helper.isLngToken(data[i].title) ? this._getTranslatedValue(data[i].title) : data[i].title;
            imgArray.push({url: source, caption: title});
        }
        var mode = this.mode() != WiziCore_Visualizer.EDITOR_MODE;

        this._photoswipe = Code.PhotoSwipe.attach(imgArray,
            {
                target: this._cont.eq(0),
                preventHide: true,
                getImageSource: function(obj){
                    return obj.url;
                },
                getImageCaption: function(obj){
                    return obj.caption;
                },
                autoStartSlideshow: this.autoStartSlideshow() === true,
                captionAndToolbarAutoHideDelay: this.toolbarAutoHideDelay(),
                captionAndToolbarOpacity: this.toolbarOpacity(),
                imageScaleMethod: this.imageScaleMethod(),
                allowRotationOnUserZoom: this.allowRotationOnUserZoom(),
                captionAndToolbarHide: this.captionAndToolbarHide(),
                enableMouseWheel: mode , enableKeyboard: mode, zIndex: 900
            }
        );
        this._photoswipe.show(0);
    }

    p.onParentVisibleChanged = function(val){
        if (val === true && this._photoswipe && !this._onParentContInited){
            this._onParentContInited = true;
            this._photoswipe.onDocumentOverlayFadeIn(null);
        }
    };

    p._removeGallery = function() {
        if (this._photoswipe) {
            removeEvents.call(this);
            Code.PhotoSwipe.detatch(this._photoswipe);
            this._photoswipe = null;
        }

        if (this._galCont)
            this._galCont.remove();

        this._galCont = null;
    };

    p.showGallery = function() {
        if (this._photoswipe) {
            try {
                this._photoswipe.show(0);
            } catch(e) {}
        }
    };

    p.hideGallery = function() {
        if (this._photoswipe) {
            try {
                this._photoswipe.hide();
            } catch(e) {}

        }

    };

    p._columnWidth = function(val) {
        if (val != undefined && this._galCont) {
            this._data(this._project['data']);
        }
    };

    p.getCurrentImage = function() {
        var res = null;
        if (this._photoswipe) {
            res = this._photoswipe.getCurrentImage();
        }
        return res;
    };

    p.getCurrentImageIndex = function() {
        var res = -1;
        if (this._photoswipe) {
            res = this._photoswipe.currentIndex;
        }
        return res;
    };

    p.getPhotoswipeObject = function() {
        return this._photoswipe;
    };

    p.getDataModel = function() {
        return [
            {name : "widget_title", value: "",uid : "title"},
            {name : "widget_photoswipe_thumbnail", value: "",uid : "thumbnail"},
            {name : "widget_photoswipe_thumbnail_text", value: "",uid : "thumbnailtext"},
            {name : "select_resource", value: "", uid : "src"}
        ];
    };

    p.border = AC.Property.theme('border', p._border);
    p.bg = AC.Property.theme('bgColor', p._bg);
    p.opacity = AC.Property.theme('opacity', p._opacity);

    p.data = AC.Property.htmlBeforeSetAfterGet("data", p._beforeData, p._data, p._afterGet);
    p.value = p.data;
    p.source = p.data;

    p.photoswipeMode = AC.Property.html("photoswipeMode", p._photoswipeMode);
    p.columnWidth = AC.Property.html("columnWidth", p._columnWidth);
    p.autoStartSlideshow = AC.Property.normal("autoStartSlideshow");
    p.toolbarAutoHideDelay = AC.Property.normal("toolbarAutoHideDelay");
    p.captionAndToolbarHide = AC.Property.normal("captionAndToolbarHide");
    p.toolbarOpacity = AC.Property.html("toolbarOpacity");
    p.imageScaleMethod = AC.Property.normal("imageScaleMethod");
    p.allowRotationOnUserZoom = AC.Property.normal("allowRotationOnUserZoom");

    // data
    p.view = AC.Property.normal('view');
    p.fields = AC.Property.normal('fields');
    p.groupby = AC.Property.normal('groupby');
    p.orderby = AC.Property.normal('orderby');
    p.filter = AC.Property.normal('filter');
    p.resetfilter = AC.Property.normal('resetfilter');
    p.listenview = AC.Property.normal('listenview');
    p.applyview = AC.Property.normal('applyview');
    p.onview = AC.Property.normal('onview');

    widget.onBeforeShow = "E#Photoswipe#onBeforeShow";
    widget.onShow = "E#Photoswipe#onShow";
    widget.onBeforeHide = "E#Photoswipe#onBeforeHide";
    widget.onHide = "E#Photoswipe#onHide";
    widget.onDisplayImage = "E#Photoswipe#onDisplayImage";
    widget.onResetPosition = "E#Photoswipe#onResetPosition";
    widget.onSlideshowStart = "E#Photoswipe#onSlideshowStart";
    widget.onSlideshowStop = "E#Photoswipe#onSlideshowStop";
    widget.onTouch = "E#Photoswipe#onTouch";
    widget.onBeforeCaptionAndToolbarShow = "E#Photoswipe#onBeforeCaptionAndToolbarShow";
    widget.onCaptionAndToolbarShow = "E#Photoswipe#onCaptionAndToolbarShow";
    widget.onBeforeCaptionAndToolbarHide = "E#Photoswipe#onBeforeCaptionAndToolbarHide";
    widget.onCaptionAndToolbarHide = "E#Photoswipe#onCaptionAndToolbarHide";
    widget.onToolbarTap = "E#Photoswipe#onToolbarTap";
    widget.onBeforeZoomPanRotateShow = "E#Photoswipe#onBeforeZoomPanRotateShow";
    widget.onZoomPanRotateShow = "E#Photoswipe#onZoomPanRotateShow";
    widget.onBeforeZoomPanRotateHide = "E#Photoswipe#onBeforeZoomPanRotateHide";
    widget.onZoomPanRotateHide = "E#Photoswipe#onZoomPanRotateHide";
    widget.onZoomPanRotateTransform = "E#Photoswipe#onZoomPanRotateTransform";

    var actions = {
        onBeforeShow: {alias: "widget_photoswipe_events_on_before_show", funcview: "onBeforeShow", action: "AC.Widgets.Photoswipe.onBeforeShow", params: "", group: "widget_event_general"},
        onShow: {alias: "widget_photoswipe_events_on_show", funcview: "onShow", action: "AC.Widgets.Photoswipe.onShow", params: "", group: "widget_event_general"},
        onBeforeHide: {alias: "widget_photoswipe_events_on_before_hide", funcview: "onBeforeHide", action: "AC.Widgets.Photoswipe.onBeforeHide", params: "", group: "widget_event_general"},
        onHide: {alias: "widget_photoswipe_events_on_hide", funcview: "onHide", action: "AC.Widgets.Photoswipe.onHide", params: "", group: "widget_event_general"},
        onDisplayImage: {alias: "widget_photoswipe_events_on_display_image", funcview: "onDisplayImage", action: "AC.Widgets.Photoswipe.onDisplayImage", params: "action, index", group: "widget_event_general"},
        onResetPosition: {alias: "widget_photoswipe_events_on_reset_position", funcview: "onResetPosition", action: "AC.Widgets.Photoswipe.onResetPosition", params: "", group: "widget_event_general"},
        onSlideshowStart: {alias: "widget_photoswipe_events_on_slideshow_start", funcview: "onSlideshowStart", action: "AC.Widgets.Photoswipe.onSlideshowStart", params: "", group: "widget_event_general"},
        onSlideshowStop: {alias: "widget_photoswipe_events_on_slideshow_stop", funcview: "onSlideshowStop", action: "AC.Widgets.Photoswipe.onSlideshowStop", params: "", group: "widget_event_general"},
        onTouch: {alias: "widget_photoswipe_events_on_touch", funcview: "onTouch", action: "AC.Widgets.Photoswipe.onTouch", params: "action, point", group: "widget_event_general"},
        onBeforeCaptionAndToolbarShow: {alias: "widget_photoswipe_events_on_before_caption_and_toolbar_show", funcview: "onBeforeCaptionAndToolbarShow", action: "AC.Widgets.Photoswipe.onBeforeCaptionAndToolbarShow", params: "", group: "widget_event_general"},
        onCaptionAndToolbarShow: {alias: "widget_photoswipe_events_on_caption_and_toolbar_show", funcview: "onCaptionAndToolbarShow", action: "AC.Widgets.Photoswipe.onCaptionAndToolbarShow", params: "", group: "widget_event_general"},
        onBeforeCaptionAndToolbarHide: {alias: "widget_photoswipe_events_on_before_caption_and_toolbar_hide", funcview: "onBeforeCaptionAndToolbarHide", action: "AC.Widgets.Photoswipe.onBeforeCaptionAndToolbarHide", params: "", group: "widget_event_general"},
        onCaptionAndToolbarHide: {alias: "widget_photoswipe_events_on_caption_and_toolbar_hide", funcview: "onCaptionAndToolbarHide", action: "AC.Widgets.Photoswipe.onCaptionAndToolbarHide", params: "", group: "widget_event_general"},
        onToolbarTap: {alias: "widget_photoswipe_events_on_toolbar_tap", funcview: "onToolbarTap", action: "AC.Widgets.Photoswipe.onToolbarTap", params: "", group: "widget_event_general"},
        onBeforeZoomPanRotateShow: {alias: "widget_photoswipe_events_on_before_zoom_pan_rotate_show", funcview: "onBeforeZoomPanRotateShow", action: "AC.Widgets.Photoswipe.onBeforeZoomPanRotateShow", params: "", group: "widget_event_general"},
        onZoomPanRotateShow: {alias: "widget_photoswipe_events_on_zoom_pan_rotate_show", funcview: "onZoomPanRotateShow", action: "AC.Widgets.Photoswipe.onZoomPanRotateShow", params: "", group: "widget_event_general"},
        onBeforeZoomPanRotateHide: {alias: "widget_photoswipe_events_on_before_zoom_pan_rotate_hide", funcview: "onBeforeZoomPanRotateHide", action: "AC.Widgets.Photoswipe.onBeforeZoomPanRotateHide", params: "", group: "widget_event_general"},
        onZoomPanRotateHide: {alias: "widget_photoswipe_events_on_zoom_pan_rotate_hide", funcview: "onZoomPanRotateHide", action: "AC.Widgets.Photoswipe.onZoomPanRotateHide", params: "", group: "widget_event_general"},
        onZoomPanRotateTransform: {alias: "widget_photoswipe_events_on_zoom_pan_rotate_transform", funcview: "onZoomPanRotateTransform", action: "AC.Widgets.Photoswipe.onZoomPanRotateTransform", params: "", group: "widget_event_general"}
    };
    actions = jQuery.extend({}, AC.Widgets.Base.actions(), actions);

    /**
     * Property definitions and then their default values
     */
    var props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,  // required
            AC.Property.general.name,         // required
            {name: "source", type : "gallerySourceList", set: "source", get: "source", alias: "widget_photoswipe_sources"},
            {name: "photoswipeMode", type : "photoswipeMode", set: "photoswipeMode", get: "photoswipeMode", alias: "widget_photoswipe_mode"},
            {name: "autoStartSlideshow", type : "boolean", set: "autoStartSlideshow", get: "autoStartSlideshow", alias: "widget_photoswipe_autoStartSlideshow"},
            {name: "toolbarAutoHideDelay", type : "number", set: "toolbarAutoHideDelay", get: "toolbarAutoHideDelay", alias: "widget_photoswipe_toolbar_autohide_delay"},
            {name: "captionAndToolbarHide", type : "boolean", set: "captionAndToolbarHide", get: "captionAndToolbarHide", alias: "widget_photoswipe_toolbar_hide"},
            {name: "toolbarOpacity", type : "opacityF", set: "toolbarOpacity", get: "toolbarOpacity", alias: "widget_photoswipe_toolbar_opacity"},
            {name: "imageScaleMethod", type : "imageScaleMethod", set: "imageScaleMethod", get: "imageScaleMethod", alias: "widget_photoswipe_image_scale_method"},
            {name: "allowRotationOnUserZoom", type : "boolean", set: "allowRotationOnUserZoom", get: "allowRotationOnUserZoom", alias: "widget_photoswipe_allow_rotation_on_user_zoom"}
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
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.bgColor,
            {name: "columnWidth", type : "widthpercents", set: "columnWidth", get: "columnWidth", alias: "widget_photoswipe_columnwidth"},
            AC.Property.style.customCssClasses,
            AC.Property.style.widgetStyle
        ]}

    ],
        defaultProps = {width: "240", height: "160", x : "100", y: "100", zindex : "auto", margin: "", alignInContainer: 'left', pWidth: "",
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
            opacity : 1, bgColor: "#ffffff", name: "Photoswipe", data:[], enable: true, resizing: false, border:"1px solid gray",
            source: [], columnWidth: "33", autoStartSlideshow: false, imageScaleMethod: "fit", toolbarAutoHideDelay: 5000, toolbarOpacity: 0.8,
            allowRotationOnUserZoom: false, photoswipeMode: 'gallery', captionAndToolbarHide: false, customCssClasses: "", widgetStyle: "default"

        },

        lng = { "en" : {
            widget_name_photoswipe: "Photoswipe",
            widget_photoswipe_sources: "Source",
            widget_photoswipe_columnwidth: "Column Width",
            widget_photoswipe_autoStartSlideshow: "Auto Start SlideShow",
            widget_photoswipe_toolbar_autohide_delay: "Caption And Toolbar AutoHide Delay",
            widget_photoswipe_toolbar_opacity: "Caption And Toolbar Opacity",
            widget_photoswipe_image_scale_method: "Image Scale Method",
            widget_photoswipe_allow_rotation_on_user_zoom: "Allow Rotation On User Zoom",
            widget_photoswipe_mode: "Mode",
            widget_photoswipe_toolbar_hide: "Caption And Toolbar Hide",
            widget_photoswipe_events_on_before_show: "On Before Show",
            widget_photoswipe_events_on_show: "On Show",
            widget_photoswipe_events_on_before_hide: "On Before Hide",
            widget_photoswipe_events_on_hide: "On Hide",
            widget_photoswipe_events_on_display_image: "On Display Image",
            widget_photoswipe_events_on_reset_position: "On Reset Position",
            widget_photoswipe_events_on_slideshow_start: "On Slideshow Start",
            widget_photoswipe_events_on_slideshow_stop: "On Slideshow Stop",
            widget_photoswipe_events_on_touch: "On Touch",
            widget_photoswipe_events_on_before_caption_and_toolbar_show: "On Before Caption And Toolbar Show",
            widget_photoswipe_events_on_caption_and_toolbar_show: "On Caption And Toolbar Show",
            widget_photoswipe_events_on_before_caption_and_toolbar_hide: "On Before Caption And Toolbar Hide",
            widget_photoswipe_events_on_caption_and_toolbar_hide: "On Caption And Toolbar Hide",
            widget_photoswipe_events_on_toolbar_tap: "On Toolbar Tap",
            widget_photoswipe_events_on_before_zoom_pan_rotate_show: "On Before Zoom Pan Rotate Show",
            widget_photoswipe_events_on_zoom_pan_rotate_show: "On Zoom Pan Rotate Show",
            widget_photoswipe_events_on_before_zoom_pan_rotate_hide: "On Before Zoom Pan Rotate Hide",
            widget_photoswipe_events_on_zoom_pan_rotate_hide: "On Zoom Pan Rotate Hide",
            widget_photoswipe_events_on_zoom_pan_rotate_transform: "On Zoom Pan Rotate Transform"

        } },
        emptyProps = {};


    // The following lines are required

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    widget.props = function() {
        return props;
    };

    /**
     * Return empty widget prop
     * @return {Object} default properties
     */
    widget.emptyProps = function() {
        return emptyProps;
    };

    /**
     * Return widget inline edit prop name
     * @return {String} default properties
     */
    widget.inlineEditPropName = function() {
        return "data";
    };

    widget.defaultProps = function() {
        return defaultProps;
    };

    /**
     * Return available widget actions
     * @return {Object} available actions
     */
    widget.actions = function() {
        return actions;
    };


    /* Lang constants */
    /**
     * Return available widget langs
     * @return {Object} available actions
     */
    widget.langs = function() {
        return lng;
    };

AC.Core.lang().registerWidgetLang(lng);

})(jQuery,window,document);

