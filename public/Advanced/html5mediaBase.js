(function($, windows, document, undefined){

    // This top section should always be present
    var widget = AC.Widgets.HTML5MediaBase = function() {
        this.init.apply(this, arguments);
    };
    AC.extend(widget, AC.Widgets.Base);
    var p = widget.prototype;
    AC.copyExtension(p, AC.WidgetExt.DataIntegration.AssocArray);

    // Define the widget Class name
    p._widgetClass = "HTML5MediaBase";
    p._dataPropName = "data";
    p._cont = null;
    p._lockDiv = null;
    p._player = null;
    p._playerType = "video";

    /**
     * Constructor
     * @class  Constructor / Destructor below
     * @constructs
     */
    p.init = function() {
        widget._sc.init.apply(this, arguments);

        if (this._player == null && this._playerType == 'audio') {
            var self = this;
            setTimeout(function() {self._data(self._project['data']); }, 10);
        }
    };

    p.destroy = function() {
        _removePlayer.call(this);
        widget._sc.destroy.apply(this, arguments);
    };

    /**
     * Widget draw function
     */
    p.draw = function() {
        var needPlay = (this._player) ? !this._player.get(0).paused : false;

        widget._sc.draw.apply(this, arguments);

        if (this._player == null && this._playerType == 'video') {
            this._data(this._project['data']);
        }

        this.base().css("overflow", "visible");

        if (this._player != null && needPlay && typeof this._player.get(0).play == 'function') {
            this._player.get(0).play();
        }

        this._updateEnable();
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

        if (this._cont) {
            this._cont.height(this.height());
        }

        if (this._lockDiv)
            this._lockDiv.height(this.height());

    };

    p._enable = function(flag) {
        widget._sc._enable.apply(this, arguments);
        this.showEnableDiv(flag === true);
    };

    p.initDomState = function() {
        widget._sc.initDomState.call(this);
        this.initDomStatePos();
        this._bg(this.bg());

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
        _removeEvents.call(this);

        if (this._player) {
            this.pause();
            this._player.remove();
            this._player = null;
        }

        if (this._cont) {
            this._cont.remove();
            this._cont = null;
        }
    }

    p.getHTMLMediaElement = function() {
        return this._player;
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

        var i, l, source, src, type,
            self = this;

        if (!this._cont) {
            this._cont = $("<div style='width:100%; position: relative; ' />");
            this._cont.height(this.height());
            this.base().append(this._cont);

            this.base().unbind('resize._data').bind('resize._data', function() {
                if (self._player) {
                    self._player.width($(this).width());
                    self._player.height($(this).height());
                }
            });
        }

        if (!this._lockDiv) {
            this._lockDiv = $("<div id='lockDiv' style='width:100%; position: relative;' />");
            this._lockDiv.height(this.height());
        }

        try {
            this._player = $("<" + this._playerType + " style='position: absolute; left: 0px; top: 0px;' />");
        } catch(e) {}

        var w = this.base().width() != 0 ? this.base().width() : '1px';

        this._player.width(w);
        this._player.height("100%");

        _addEvents.call(this);

        var isEditorMode = this.mode() == WiziCore_Visualizer.EDITOR_MODE;

        if (this.autoplay() && !isEditorMode)
            this._player.attr("autoplay", "autoplay");

        if (this.preload())
            this._player.attr("preload", "preload");

        for (i = 0, l = data.length; i < l; i++) {
            type = WiziCore_Helper.isLngToken(data[i].type) ? this._getTranslatedValue(data[i].type) : data[i].type;
            src = WiziCore_Helper.isLngToken(data[i].src) ? this._getTranslatedValue(data[i].src) : data[i].src;
            source = $("<source />");
            source.attr("type", type).attr("src", src);
            this._player.append(source);
        }

        this._player.append("<span style='color: #ffffff'>HTML5 " + this._playerType + " is not supported</span>");
        this._cont.prepend(this._player);

        if (isEditorMode)
            this._cont.append(this._lockDiv);

        this._controls(this.controls());
        this._poster(this.poster());
        this.volume(this._project["volume"]);
        jQuery.fn.__useTr = trState;
    };

    //TODO: hack for mobile click event
    p.onClick = function() {};

    function _addEvents() {
        var self = this;
        if (this._player) {
            this._player.bind('loadstart', function(){ $(self).trigger(new jQuery.Event(widget.onLoadStart)); });
            this._player.bind('progress', function(){ $(self).trigger(new jQuery.Event(widget.onProgress)); });
            this._player.bind('suspend', function(){ $(self).trigger(new jQuery.Event(widget.onSuspend)); });
            this._player.bind('abort', function(){ $(self).trigger(new jQuery.Event(widget.onAbort)); });
            this._player.bind('error', function(){ $(self).trigger(new jQuery.Event(widget.onError)); });
            this._player.bind('emptied', function(){ $(self).trigger(new jQuery.Event(widget.onEmptied)); });
            this._player.bind('stalled', function(){ $(self).trigger(new jQuery.Event(widget.onStalled)); });
            this._player.bind('loadedmetadata', function(){ $(self).trigger(new jQuery.Event(widget.onLoadedMetadata)); });
            this._player.bind('loadeddata', function(){ $(self).trigger(new jQuery.Event(widget.onLoadedData)); });
            this._player.bind('canplay', function(){ $(self).trigger(new jQuery.Event(widget.onCanPlay)); });
            this._player.bind('canplaythrough', function(){ $(self).trigger(new jQuery.Event(widget.onCanPlayThrough)); });
            this._player.bind('playing', function(){ $(self).trigger(new jQuery.Event(widget.onPlaying)); });
            this._player.bind('waiting', function(){ $(self).trigger(new jQuery.Event(widget.onWaiting)); });
            this._player.bind('seeking', function(){ $(self).trigger(new jQuery.Event(widget.onSeeking)); });
            this._player.bind('seeked', function(){ $(self).trigger(new jQuery.Event(widget.onSeeked)); });
            this._player.bind('ended', function(){ $(self).trigger(new jQuery.Event(widget.onEnded)); });
            this._player.bind('durationchange', function(){ $(self).trigger(new jQuery.Event(widget.onDurationChange)); });
            this._player.bind('timeupdate', function(){ $(self).trigger(new jQuery.Event(widget.onTimeUpdate), [self.currentTime()]); });
            this._player.bind('play', function(){ $(self).trigger(new jQuery.Event(widget.onPlay)); });
            this._player.bind('pause', function(){ $(self).trigger(new jQuery.Event(widget.onPause)); });
            this._player.bind('ratechange', function(){ $(self).trigger(new jQuery.Event(widget.onRateChange)); });
            this._player.bind('volumechange', function(){ $(self).trigger(new jQuery.Event(widget.onVolumeChange)); });
        }
    }

    function _removeEvents() {
        if (this._player) {
            this._player.unbind();
        }
    }

    p.volume = function(val) {
        if (val != undefined && !isNaN(val)) {
            val = Math.max(0, Math.min(1, val));
            this._project['volume'] = val;
            var obj = {"volume": this._project['volume']};
            this.sendExecutor(obj);

            if (this._player) {
                this._player.get(0).volume = val;
            }
        }

        return this._player ? this._player.get(0).volume : this._project["volume"];
    };

    p._controls = function(val) {
        if (val != undefined && this._player) {
            val = val === true;
            val ? this._player.attr("controls", "controls") : this._player.removeAttr("controls");
        }
    };

    p.play = function() {
        if (this._player && typeof this._player.get(0).play == 'function') {
            this._player.get(0).play();
        }
    };

    p.pause = function() {
        if (this._player && typeof this._player.get(0).play == 'function') {
            this._player.get(0).pause();
        }
    };

    p.load = function() {
        if (this._player && typeof this._player.get(0).play == 'function') {
            this._player.get(0).pause();
            this._player.get(0).load();
        }
    };

    p.muted = function(val) {
        if (val != undefined && this._player) {
            val = val === true;
            this._player.get(0).muted = val;
        }
        return this.player ? this.player.get(0).muted : false;
    };

    p.currentTime = function(val) {
        if (this._player && val != undefined && !isNaN(val)) {
            try {
                this._player.get(0).currentTime = val;
            } catch(e) {}
        }
        return (this._player) ? this._player.get(0).currentTime : 0;
    };

    p.duration = function() {
        return (this._player && !isNaN(this._player.get(0).duration)) ? this._player.get(0).duration : 0;
    };

    p.state = function() {
        var player = (this._player) ? this._player.get(0) : null;
        if (player)
            return {networkState: player.networkState, readyState: player.readyState, paused: player.paused, ended: player.ended};
        else
            return null;
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

    widget.onLoadStart = "E#HTML5MediaBase#onLoadStart";
    widget.onProgress = "E#HTML5MediaBase#onProgress";
    widget.onSuspend = "E#HTML5MediaBase#onSuspend";
    widget.onAbort = "E#HTML5MediaBase#onAbort";
    widget.onError = "E#HTML5MediaBase#onError";
    widget.onEmptied = "E#HTML5MediaBase#onEmptied";
    widget.onStalled = "E#HTML5MediaBase#onStalled";
    widget.onLoadedMetadata = "E#HTML5MediaBase#onLoadedMetadata";
    widget.onLoadedData = "E#HTML5MediaBase#onLoadedData";
    widget.onCanPlay = "E#HTML5MediaBase#onCanPlay";
    widget.onCanPlayThrough = "E#HTML5MediaBase#onCanPlayThrough";
    widget.onPlaying = "E#HTML5MediaBase#onPlaying";
    widget.onWaiting = "E#HTML5MediaBase#onWaiting";
    widget.onSeeking = "E#HTML5MediaBase#onSeeking";
    widget.onSeeked = "E#HTML5MediaBase#onSeeked";
    widget.onEnded = "E#HTML5MediaBase#onEnded";
    widget.onDurationChange = "E#HTML5MediaBase#onDurationChange";
    widget.onTimeUpdate = "E#HTML5MediaBase#onTimeUpdate";
    widget.onPlay = "E#HTML5MediaBase#onPlay";
    widget.onPause = "E#HTML5MediaBase#onPause";
    widget.onRateChange = "E#HTML5MediaBase#onRateChange";
    widget.onVolumeChange = "E#HTML5MediaBase#onVolumeChange";

    var actions = {
        onLoadStart: {alias: "widget_html5mediabase_on_loadstart", funcview: "onLoadStart", action: "AC.Widgets.HTML5MediaBase.onLoadStart", params: "", group: "widget_event_general"},
        onProgress: {alias: "widget_html5mediabase_on_progress", funcview: "onProgress", action: "AC.Widgets.HTML5MediaBase.onProgress", params: "", group: "widget_event_general"},
        onSuspend: {alias: "widget_html5mediabase_on_suspend", funcview: "onSuspend", action: "AC.Widgets.HTML5MediaBase.onSuspend", params: "", group: "widget_event_general"},
        onAbort: {alias: "widget_html5mediabase_on_abort", funcview: "onAbort", action: "AC.Widgets.HTML5MediaBase.onAbort", params: "", group: "widget_event_general"},
        onError: {alias: "widget_html5mediabase_on_error", funcview: "onError", action: "AC.Widgets.HTML5MediaBase.onError", params: "", group: "widget_event_general"},
        onEmptied: {alias: "widget_html5mediabase_on_emptied", funcview: "onEmptied", action: "AC.Widgets.HTML5MediaBase.onEmptied", params: "", group: "widget_event_general"},
        onStalled: {alias: "widget_html5mediabase_on_stalled", funcview: "onStalled", action: "AC.Widgets.HTML5MediaBase.onStalled", params: "", group: "widget_event_general"},
        onLoadedMetadata: {alias: "widget_html5mediabase_on_loadedmetadata", funcview: "onLoadedMetadata", action: "AC.Widgets.HTML5MediaBase.onLoadedMetadata", params: "", group: "widget_event_general"},
        onLoadedData: {alias: "widget_html5mediabase_on_loadeddata", funcview: "onLoadedData", action: "AC.Widgets.HTML5MediaBase.onLoadedData", params: "", group: "widget_event_general"},
        onCanPlay: {alias: "widget_html5mediabase_on_canplay", funcview: "onCanPlay", action: "AC.Widgets.HTML5MediaBase.onCanPlay", params: "", group: "widget_event_general"},
        onCanPlayThrough: {alias: "widget_html5mediabase_on_canplaythrough", funcview: "onCanPlayThrough", action: "AC.Widgets.HTML5MediaBase.onCanPlayThrough", params: "", group: "widget_event_general"},
        onPlaying: {alias: "widget_html5mediabase_on_playing", funcview: "onPlaying", action: "AC.Widgets.HTML5MediaBase.onPlaying", params: "", group: "widget_event_general"},
        onWaiting: {alias: "widget_html5mediabase_on_waiting", funcview: "onWaiting", action: "AC.Widgets.HTML5MediaBase.onWaiting", params: "", group: "widget_event_general"},
        onSeeking: {alias: "widget_html5mediabase_on_seeking", funcview: "onSeeking", action: "AC.Widgets.HTML5MediaBase.onSeeking", params: "", group: "widget_event_general"},
        onSeeked: {alias: "widget_html5mediabase_on_seeked", funcview: "onSeeked", action: "AC.Widgets.HTML5MediaBase.onSeeked", params: "", group: "widget_event_general"},
        onEnded: {alias: "widget_html5mediabase_on_ended", funcview: "onEnded", action: "AC.Widgets.HTML5MediaBase.onEnded", params: "", group: "widget_event_general"},
        onDurationChange: {alias: "widget_html5mediabase_on_durationchange", funcview: "onDurationChange", action: "AC.Widgets.HTML5MediaBase.onDurationChange", params: "", group: "widget_event_general"},
        onTimeUpdate: {alias: "widget_html5mediabase_on_timeupdate", funcview: "onTimeUpdate", action: "AC.Widgets.HTML5MediaBase.onTimeUpdate", params: "", group: "widget_event_general"},
        onPlay: {alias: "widget_html5mediabase_on_play", funcview: "onPlay", action: "AC.Widgets.HTML5MediaBase.onPlay", params: "", group: "widget_event_general"},
        onPause: {alias: "widget_html5mediabase_on_pause", funcview: "onPause", action: "AC.Widgets.HTML5MediaBase.onPause", params: "", group: "widget_event_general"},
        onRateChange: {alias: "widget_html5mediabase_on_ratechange", funcview: "onRateChange", action: "AC.Widgets.HTML5MediaBase.onRateChange", params: "", group: "widget_event_general"},
        onVolumeChange: {alias: "widget_html5mediabase_on_volumechange", funcview: "onVolumeChange", action: "AC.Widgets.HTML5MediaBase.onVolumeChange", params: "", group: "widget_event_general"}
    };
    actions = jQuery.extend({}, AC.Widgets.Base.actions(), actions);

    /**
     * Property definitions and then their default values
     */
    var props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,  // required
            AC.Property.general.name,         // required
            {name: "source", type : p._playerType + "SourceType", set: "source", get: "source", alias: "widget_html5mediabase_sources"},
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
            AC.Property.style.bgColor
        ]}

    ],
        defaultProps = {width: "240", height: "160", x : "100", y: "100", zindex : "auto", margin: "", alignInContainer: 'left', pWidth: "",
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
            opacity : 0.8, bgColor: "#000000", name: "HTML5MediaBase", data:[], enable: true, resizing: false,
            poster : '', autoplay: false, preload:false, volume: 0.8, controls: true, source: []
        },

        lng = { "en" : {
            widget_html5mediabase_on_loadstart: "On Load Start",
            widget_html5mediabase_on_progress: "On Progress",
            widget_html5mediabase_on_suspend: "On Suspend",
            widget_html5mediabase_on_abort: "On Abort",
            widget_html5mediabase_on_error: "On Error",
            widget_html5mediabase_on_emptied: "On Emptied",
            widget_html5mediabase_on_stalled: "On Stalled",
            widget_html5mediabase_on_loadedmetadata: "On Loaded Metadata",
            widget_html5mediabase_on_loadeddata: "On Loaded Data",
            widget_html5mediabase_on_canplay: "On Can Play",
            widget_html5mediabase_on_canplaythrough: "On Can Play Through",
            widget_html5mediabase_on_playing: "On Playing",
            widget_html5mediabase_on_waiting: "On Waiting",
            widget_html5mediabase_on_seeking: "On Seeking",
            widget_html5mediabase_on_seeked: "On Seeked",
            widget_html5mediabase_on_ended: "On Ended",
            widget_html5mediabase_on_durationchange: "On Duration Change",
            widget_html5mediabase_on_timeupdate: "On Time Update",
            widget_html5mediabase_on_play: "On Play",
            widget_html5mediabase_on_pause: "On Pause",
            widget_html5mediabase_on_ratechange: "On Rate Change",
            widget_html5mediabase_on_volumechange: "On Volume Change"
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

//    $.fn.createUnknownTag("source");


})(jQuery,window,document);

