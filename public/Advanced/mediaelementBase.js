(function($, window, document, undefined){

    // This top section should always be present
    var widget = AC.Widgets.MediaElementBase = function() {
        this.init.apply(this, arguments);
    };
    AC.extend(widget, AC.Widgets.Base);
    var p = widget.prototype;
    AC.copyExtension(p, AC.WidgetExt.DataIntegration.AssocArray);

    // Define the widget Class name
    p._widgetClass = "MediaElementBase";
    p._dataPropName = "data";
    p._cont = null;
    p._playerCont = null;
    p._player = null;
    p._playerType = "video";
    p._playerState = null;

    /**
     * Constructor
     * @class  Constructor / Destructor below
     * @constructs
     */
    p.init = function() {
        widget._sc.init.apply(this, arguments);

        this._playerState = widget.SOURCE_NOT_DEFINED;

        if (this._player == null && this._playerType == 'audio') {
            var self = this;
            setTimeout(function() {self._data(self._project['data']); }, 10);
        }
    };

    p.onDestroy = function() {
        _removePlayer.call(this);
    };

    /**
     * Widget draw function
     */
    p.draw = function() {
        var self = this,
            needPlay = (this._player && this._player.media) ? !this._player.media.paused : false;

        widget._sc.draw.apply(this, arguments);

        if (this._player == null && this._playerType == 'video') {
            this._data(this._project['data']);
        }

        this.base().css("overflow", "visible");

        if (this._player != null && needPlay && this._player.media.pluginType != undefined && this._player.media.pluginType != "flash")
            this._player.play();

        this._updateEnable();

        //IE controls resize fix
        $(this.repeatCompatiblePage()).bind(AC.Widgets.WiziCore_Api_Page.onPageShow + "." + this.id(), function() {
            if (self.visible()) {
                self.visible(false);
                self.visible(true);
            }
        });
    };

    p.onRemove = function(){
        $(this.repeatCompatiblePage()).unbind(AC.Widgets.WiziCore_Api_Page.onPageShow + "." + this.id());
    };

    p._onInitLanguage = function() {
        this.poster(this.poster());
        this.data(this.data());
    };

    p._onSTUpdated = function() {
        this._onLanguageChanged();
    };

    p._onLanguageChanged = function() {
        this._data(this._project['data']);
    };

    p._updateLayout = function() {
        widget._sc._updateLayout.apply(this, arguments);

        this.base().css("overflow", "visible");

        //bug with resize in ie8 (flash player)
        if (this._playerCont) {
            this._playerCont.width(this.width()).height(this.height());
        }

        if (this._player) {
            this._player.width = this.width();
            this._player.height = this.height();
            this._player.setControlsSize();
            this._player.setPlayerSize(this.width(), this.height());
        }

        this._setPosEnableDiv();
    };

    p._enable = function(flag) {
        widget._sc._enable.apply(this, arguments);
        this.showEnableDiv(flag === true);
    };

    p._visible = function(flag) {
        widget._sc._visible.apply(this, arguments);
        if (this._player) {
            this._player.width = this.width();
            this._player.height = this.height();
            this._player.setControlsSize();
            //update vol control
            if (this._player.positionVolumeHandle) {
                if (this._player.media.muted)
                    this._player.positionVolumeHandle(0);
                else
                    this._player.positionVolumeHandle(this._player.media.volume);
            }

            this._player.setPlayerSize(this.width(), this.height());
        }
    };

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

    function _removePlayer() {
        this._playerState = widget.SOURCE_NOT_DEFINED;

        if (this._player) {
            try {
                _removeEvents.call(this);
                this._player.pause();
                //not working!!
                this._player.remove();
            } catch(e) {}

            //hack for remove players from global array
            mejs.players.pop(this._player);

            this._player = null;
        }

        if (this._playerCont) {
            this._playerCont.remove();
            this._playerCont = null;
        }

        if (this._cont) {
            this._cont.empty();
        }
    }

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
                this._processRowValue(id, i, data, oldData, 'type');
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
                ret[i]['type'] = this._getTranslatedValue(ret[i]['type']);
                ret[i]['src'] = this._getTranslatedValue(ret[i]['src']);
            }
        }

        return ret;
    };

    p._data = function(data) {
        _removePlayer.call(this);

        if (data == undefined || !$.isArray(data) || data.length == 0) {
            return;
        }

        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        if (!this._cont) {
            this._cont = $("<div style='width:100%;height:100%; position: relative' />");
            this.base().prepend(this._cont);
        }

        this._playerCont = $("<" + this._playerType + " />");
        this._playerCont.attr({
            width:this.width(),
            height:this.height()});

        var isEditorMode = this.mode() == WiziCore_Visualizer.EDITOR_MODE, self = this;

        if (this.autoplay() && !isEditorMode)
            this._playerCont.attr("autoplay", this.autoplay());

        if (this._playerType == 'video' && this.poster() != undefined && this.poster() != '')
            this._playerCont.attr("poster", this.poster());

        var i, l, source, type, src;
        for (i = 0, l = data.length; i < l; i++) {
            type = WiziCore_Helper.isLngToken(data[i].type) ? this._getTranslatedValue(data[i].type) : data[i].type;
            src = WiziCore_Helper.isLngToken(data[i].src) ? this._getTranslatedValue(data[i].src) : data[i].src;
            source = $("<source />");
            source.attr("type", type).attr("src", src);
            this._playerCont.append(source);
        }
        this._cont.prepend(this._playerCont);

        this._player = new MediaElementPlayer(this._playerCont, {mode: 'auto', success: function(mediaEl, domObj) {
            setTimeout(function() { _addEvents.call(self); }, 10);
        }, enablePluginDebug:true, pauseOtherPlayers: false, pluginPath: this.context().config().staticUrl() + 'common/js/mediaelement/'});

        //fix video id undefined
        //not working remove in media player

        this._controls(this.controls());

        try {
            this._player.setVolume(this._project["volume"]);
        } catch(e){
//            acDebugger.systemLog(e.message);
        }
        jQuery.fn.__useTr = trState;
    };

    function _addEvents() {
        var self = this;

        if (this._player && this._player.media) {
            if (this._player.media.addEventListener) {
                this._player.media.addEventListener('play', function(){ _onPlaying.call(self); });
                this._player.media.addEventListener('ended', function(){ _onComplete.call(self); });
                this._player.media.addEventListener('pause', function(){ _onPaused.call(self); });
                this._player.media.addEventListener('canplay', function(){ _onReady.call(self); });
                this._player.media.addEventListener('progress', function(){ _onProgress.call(self); });
                this._player.media.addEventListener('timeupdate', function(){ _onTimeUpdate.call(self); });
                this._player.media.addEventListener('volumechange', function(){ _onVolumeChanged.call(self); });

                if (this.preload() === true)
                    this._player.load();
            } else
                setTimeout(function(){ _addEvents.call(self); }, 100);
        }
    }

    function _removeEvents() {
        var self = this;
        if (this._player && this._player.media && this._player.media.removeEventListener) {
            this._player.media.removeEventListener('play', function(){ _onPlaying.call(self); });
            this._player.media.removeEventListener('ended', function(){ _onComplete.call(self); });
            this._player.media.removeEventListener('pause', function(){ _onPaused.call(self); });
            this._player.media.removeEventListener('canplay', function(){ _onReady.call(self); });
            this._player.media.removeEventListener('progress', function(){ _onProgress.call(self); });
            this._player.media.removeEventListener('timeupdate', function(){ _onTimeUpdate.call(self); });
            this._player.media.removeEventListener('volumechange', function(){ _onVolumeChanged.call(self); });
        }
    }

    function _onPlaying() {
        this._playerState = widget.PLAYING;
        $(this).trigger(new $.Event(widget.onPlaying));
    }
    function _onComplete() {
        this._playerState = widget.COMPLETE;
        $(this).trigger(new $.Event(widget.onComplete));
    }
    function _onPaused() {
        this._playerState = widget.PAUSED;
        $(this).trigger(new $.Event(widget.onPaused));
    }
    function _onReady() {
        this._playerState = widget.READY;
        $(this).trigger(new $.Event(widget.onReady));
    }
    function _onProgress() {
        $(this).trigger(new $.Event(widget.onProgress), [this.progress()]);
    }
    function _onTimeUpdate() {
        $(this).trigger(new $.Event(widget.onTimeUpdate), [this.currentTime()]);
    }
    function _onVolumeChanged() { $(this).trigger(new $.Event(widget.onVolumeChanged)); }

    p.volume = function(val) {
        if (val != undefined && !isNaN(val)) {
            val = Math.max(0, Math.min(1, val));
            this._project['volume'] = val;
            var obj = {"volume": this._project['volume']};
            this.sendExecutor(obj);

            if (this._player) {
                try {
                    this._player.setVolume(val);
                } catch(e){
//                    acDebugger.systemLog(e.message);
                }
            }
        }

        return (this._player && typeof this._player.getVolume == "function") ? this._player.getVolume() : this._project["volume"];
    };

    p._controls = function(val) {
        if (val != undefined && this._player) {
            val = val === true;
            (!val) ? this._player.disableControls(): this._player.enableControls();
        }
    };

    p.play = function() {
        if (this._player) {
            try {
                this._player.play();
            } catch(e) {}
        }
    };

    p.pause = function() {
        if (this._player) {
            try {
                this._player.pause();
            } catch(e) {}
        }
    };

    p.load = function() {
        if (this._player)
            try {
                this._player.load();
            } catch(e) {}
    };

    p.setMuted = function(val) {
        if (this._player)
            this._player.setMuted(val === true);
    };

    p.currentTime = function(val) {
        if (this._player && val != undefined && !isNaN(val)) {
            try {
                this._player.setCurrentTime(val);
            } catch(e) {}

        }
        return (this._player) ? this._player.getCurrentTime() : 0;
    };

    p.progress = function() {
        return (this._player) ? this._player.progress : 0;
    };

    p.duration = function() {
        return (this._player && !isNaN(this._player.media.duration)) ? this._player.media.duration : 0;
    };

    p.state = function() {
        return this._playerState;
    };

    p._beforePoster = function(val) {
    };

    p._poster = function(val) {
    };

    p.getDataModel = function() {
        return [
            {name : "type", value: "",uid : "type"},
            {name : "select_resource", value: "", uid : "src"}
        ];
    };

    p.border = AC.Property.theme('border', p._border);
    p.bg = AC.Property.theme('bgColor', p._bg);
    p.opacity = AC.Property.theme('opacity', p._opacity);

    p.data = AC.Property.htmlBeforeSetAfterGet("data", p._beforeData, p._data, p._afterGet);
    p.value = p.data;
    p.source = p.data;

    p.poster = AC.Property.htmlLngPropBeforeSet("poster", p._beforePoster, p._poster);
    p.autoplay = AC.Property.normal("autoplay");
    p.preload = AC.Property.normal("preload");
    p.controls = AC.Property.normal("controls", p._controls);

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

    widget.SOURCE_NOT_DEFINED = 0;
    widget.READY = 1;
    widget.PLAYING = 2;
    widget.PAUSED = 3;
    widget.COMPLETE = 4;

    widget.onPlaying = "E#MediaElementBase#onPlaying";
    widget.onComplete = "E#MediaElementBase#onComplete";
    widget.onPaused = "E#MediaElementBase#onPaused";
    widget.onReady = "E#MediaElementBase#onReady";
    widget.onProgress = "E#MediaElementBase#onProgress";
    widget.onTimeUpdate = "E#MediaElementBase#onTimeUpdate";
    widget.onVolumeChanged = "E#MediaElementBase#onVolumeChanged";

    var actions = {
        onPlaying: {alias: "widget_mediaelementbase_on_playing", funcview: "onPlaying", action: "AC.Widgets.MediaElementBase.onPlaying", params: "", group: "widget_event_general"},
        onComplete: {alias: "widget_mediaelementbase_on_complete", funcview: "onComplete", action: "AC.Widgets.MediaElementBase.onComplete", params: "", group: "widget_event_general"},
        onPaused: {alias: "widget_mediaelementbase_on_paused", funcview: "onPaused", action: "AC.Widgets.MediaElementBase.onPaused", params: "", group: "widget_event_general"},
        onReady: {alias: "widget_mediaelementbase_on_ready", funcview: "onReady", action: "AC.Widgets.MediaElementBase.onReady", params: "", group: "widget_event_general"},
        onProgress: {alias: "widget_mediaelementbase_on_progress", funcview: "onProgress", action: "AC.Widgets.MediaElementBase.onProgress", params: "progress", group: "widget_event_general"},
        onTimeUpdate: {alias: "widget_mediaelementbase_on_time_update", funcview: "onTimeUpdate", action: "AC.Widgets.MediaElementBase.onTimeUpdate", params: "time", group: "widget_event_general"},
        onVolumeChanged: {alias: "widget_mediaelementbase_on_volume_changed", funcview: "onVolumeChanged", action: "AC.Widgets.MediaElementBase.onVolumeChanged", params: "", group: "widget_event_general"}
    };
    actions = $.extend({}, AC.Widgets.Base.actions(), actions);

    /**
     * Property definitions and then their default values
     */
    var props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,  // required
            AC.Property.general.name,         // required
            {name: "source", type : p._playerType + "SourceList", set: "source", get: "source", alias: "widget_mediaelementbase_sources"},
            AC.Property.media.poster,
            AC.Property.media.autoplay,
            AC.Property.media.controls,
            AC.Property.media.preload,
            AC.Property.media.volume
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
            AC.Property.style.customCssClasses,
            AC.Property.style.widgetStyle
        ]}

    ],
        defaultProps = {width: "240", height: "160", x : "100", y: "100", zindex : "auto", margin: "", alignInContainer: 'left', pWidth: "",
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
            opacity : 0.8, bgColor: "#000000", name: "MediaElementBase", data:[], enable: true, resizing: false, border:"1px solid gray",
            poster : '', autoplay: false, preload:false, volume: 0.8, controls: true, source: [], widgetStyle: "default", customCssClasses: ""
        },

        lng = { "en" : {
            widget_mediaelementbase_on_playing: "onPlaying",
            widget_mediaelementbase_on_paused: "onPaused",
            widget_mediaelementbase_on_complete: "onComplete",
            widget_mediaelementbase_on_ready: "onReady",
            widget_mediaelementbase_on_progress: "onProgress",
            widget_mediaelementbase_on_time_update: "onTimeUpdate",
            widget_mediaelementbase_on_volume_changed: "onVolumeChanged"
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

    $.fn.createUnknownTag("source");
})(jQuery,window,document);

