(function($, windows, document, undefined){
    var triggerObject  = {};

    // This top section should always be present
    var widget = AC.Widgets.Youtube = function() {
        this.init.apply(this, arguments);
    };

    function loadYoutubeApi() {
        loadYoutubeApiLib && loadYoutubeApiLib();
    }

    function loadYoutubeApiLib() {
        if (typeof YT == "undefined" || typeof YT.Player != "function") {
            if (WiziCore_Helper.isPhoneGapOnline()) {
                jQuery.getScript("http://www.youtube.com/player_api")
                    .fail(function () {
                        throw "error loading youtube api";
                    });
            }
        }
        loadYoutubeApiLib = null;
    }

    AC.extend(widget, AC.Widgets.Base);
    var p = widget.prototype;

    // Define the widget Class name
    p._widgetClass = "Youtube";
    p._dataPropName = "videoId";
    p._cont = null;
    p._player = null;
    p._playerDiv = null;
    p._isPlayerReady = false;

    /**
     * Constructor
     * @class  Constructor / Destructor below
     * @constructs
     */
    p.init = function() {
        widget._sc.init.apply(this, arguments);
    };

    p.destroy = function() {
        if (this._cont) {
            this._cont.remove();
            this._cont = null;
        }

        widget._sc.destroy.apply(this, arguments);
    };

    p._onInitLanguage = function() {
        this.source(this.source());
    };

    p._onSTUpdated = function() {
        this._onLanguageChanged();
    };

    p._onLanguageChanged = function() {
        this._videoId(this._project['videoId']);
    };

    /**
     * Widget draw function
     */
    p.draw = function() {
        widget._sc.draw.apply(this, arguments);

        this._cont = $("<div style='width:100%;position: absolute; overflow: hidden; top: 0;' />");
        this.base().prepend(this._cont);

        if (!WiziCore_Helper.checkForIE7() && (typeof YT == "undefined" || typeof YT.Player != "function")) {
            this.addOneApiInitedEvent();
            loadYoutubeApi();
        } else {
            generateFlashCallbacks.call(this);
            this._videoId(this._project['videoId']);
        }

        this._updateEnable();
    };

    p.addOneApiInitedEvent = function() {
        var self = this;
        $(triggerObject).one(AC.Widgets.Youtube.onApiLoaded, function(ev) {
            self._videoId(self._project['videoId']);
            ev.stopPropagation();
        });
    };

    p._updateLayout = function() {
        widget._sc._updateLayout.apply(this, arguments);
        if (this._cont)
            this._cont.height(this.height() + 'px');
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

    p._beforeVideoId = function(value) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(value),
                token = isToken ? value : ('ac-' + this.id());

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, value);

            return token;
        } else
            return value;
    };

    p._videoId = function(value) {
        var trVal = WiziCore_Helper.isLngToken(value) ? this._getTranslatedValue(value) : value,
            self = this;

        clearPlayer.call(this);

        if (trVal == undefined || trVal == '' || (!WiziCore_Helper.checkForIE7() && (typeof YT == "undefined" || typeof YT.Player != "function")))
            return;

        var playerId = this.htmlId() + "_player",
            isEditorMode = this.mode() == WiziCore_Visualizer.EDITOR_MODE;
        if (!this._playerDiv) {
            this._playerDiv = $("<div id='" + playerId + "' />");
            this._cont.append(this._playerDiv);
        }

        if (WiziCore_Helper.checkForIE7()) {
            this._playerDiv.append('<span>You need Flash player 8+ and JavaScript enabled to view this video.</span>');
            var params = { allowScriptAccess: "always", wmode: "opaque", allowFullScreen: true },
                atts = { id: playerId },
                origin = (window.location.origin) ? window.location.origin : window.location.protocol + "//" + window.location.host + "/",
                sourceUrl = "http://www.youtube.com/v/" + trVal + "?enablejsapi=1&playerapiid=" + playerId + "&version=3&origin=" + origin;

            if (!isEditorMode)
                sourceUrl += '&autoplay=' + (this.autoplay() ? 1 : 0);

            sourceUrl += '&controls=' + (this.controls() ? 1 : 0);
            sourceUrl += '&theme=' + this.playerTheme();

            swfobject.embedSWF(sourceUrl, playerId, this.width(), this.height(), "8", null, null, params, atts);

            getYTFlashPlayerRef.call(this);
        } else {
            this._player = new YT.Player(this._playerDiv.get(0), {
                videoId: trVal,
                width: '100%',
                height: this.height(),
                playerVars: {
                    wmode: "opaque",
                    autohide: this.autohide(),
                    autoplay: (this.autoplay() && !isEditorMode) ? 1 : 0,
                    controls: this.controls() ? 1 : 0,
                    theme: this.playerTheme()
                }
            });

            _addEventListeners.call(this);
        }

        this.base().unbind('resize._videoId').bind('resize._videoId', function() {
            if (self._player) {
                if (!WiziCore_Helper.checkForIE7() && self._player.setSize != undefined)
                    self._player.setSize($(this).width(), $(this).height());
                else {
                    self._player.width = $(this).width();
                    self._player.height = $(this).height();
                }
            }
        });

    };

    function getYTFlashPlayerRef() {
        var self = this;
        var playerId = this.htmlId() + "_player";
        this._player = document.getElementById(playerId);
        if (!this._player || typeof this._player.playVideo != 'function')
            setTimeout(function() { getYTFlashPlayerRef.call(self); }, 200);
        else {
            this._isPlayerReady = true;
            this.volume(this._project['volume']);

            _addEventListeners.call(this);
            $(this).trigger(new jQuery.Event(widget.onPlayerReady));
        }
    }

    function generateFlashCallbacks() {
        var self = this,
            htmlIdWithoutMinus = this.htmlId().replace(new RegExp("(-)", 'g'), ""),
            stageChangeFn = 'ac_yt_onStateChange_' + htmlIdWithoutMinus,
            onErrorFn = 'ac_yt_onError_' + htmlIdWithoutMinus,
            qualityChangeFn = 'ac_yt_onPlaybackQualityChange_' + htmlIdWithoutMinus;

        window[stageChangeFn] = function(ev) { self._onStateChange(ev); };
        window[onErrorFn] = function(ev) { self._onError(ev); };
        window[qualityChangeFn] = function(ev) { self._onPlaybackQualityChange(ev); };
    }

    function _addEventListeners() {
        var self = this;
        if (this._player && typeof this._player.addEventListener == 'function') {
            if (WiziCore_Helper.checkForIE7()) {
                var htmlIdWithoutMinus = this.htmlId().replace(new RegExp("(-)", 'g'), ""),
                    stageChangeFn = 'ac_yt_onStateChange_' + htmlIdWithoutMinus,
                    onErrorFn = 'ac_yt_onError_' + htmlIdWithoutMinus,
                    qualityChangeFn = 'ac_yt_onPlaybackQualityChange_' + htmlIdWithoutMinus;

                this._player.addEventListener('onStateChange', stageChangeFn);
                this._player.addEventListener('onError', onErrorFn );
                this._player.addEventListener('onPlaybackQualityChange', qualityChangeFn );
            } else {
                this._player.addEventListener('onStateChange', function(ev) { self._onStateChange(ev) } );
                this._player.addEventListener('onReady', function() { self._onPlayerReady(); } );
                this._player.addEventListener('onError', function(ev) { self._onError(ev); } );
                this._player.addEventListener('onPlaybackQualityChange', function(ev) { self._onPlaybackQualityChange(ev); } );
            }
        }
    }

    p._onPlayerReady = function() {
        this._isPlayerReady = true;
        this.volume(this._project['volume']);

        $(this).trigger(new jQuery.Event(widget.onPlayerReady));
    };

    p._onStateChange = function(ev) {
        var res = ev.data ? ev.data : ev;
        $(this).trigger(new jQuery.Event(widget.onStateChange), [res]);
    };

    p._onError = function(ev) {
        var res = ev.data ? ev.data : ev;
        $(this).trigger(new jQuery.Event(widget.onError), [res]);
    };

    p._onPlaybackQualityChange = function(ev) {
        var res = ev.data ? ev.data : ev;
        $(this).trigger(new jQuery.Event(widget.onPlaybackQualityChange), [res]);
    };

    p.destroy = function() {
        clearPlayer.call(this);
        widget._sc.destroy.apply(this, arguments);
    };

    function clearPlayer() {
        if (this._player) {
            this._isPlayerReady = false;
            try {
                this._player.stopVideo();
                this._player.destroy();
            } catch (e) {}

            this._cont.empty();
            this._player = null;
            this._playerDiv = null;
            this.base().unbind('resize._videoId');
        }
    }

    p.appendValueToDataObject = function(dataObject, invalidMandatoryWidgets, force) {
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
    };

    p.play = function() {
        if (this._player && this._isPlayerReady)
            this._player.playVideo();
    };

    p.pause = function() {
        if (this._player && this._isPlayerReady)
            this._player.pauseVideo();
    };

    p.stop = function() {
        if (this._player && this._isPlayerReady)
            this._player.stopVideo();
    };

    p.currentTime = function(val) {
        if (val != undefined && this._player && this._isPlayerReady) {
            this._player.seekTo(val, true);
        }
        return (this._player && typeof this._player.getCurrentTime == 'function') ? this._player.getCurrentTime() : 0;
    };

    p.getYoutubePlayer = function() {
        return this._player;
    };

    p.volume = function(val) {
        if (val != undefined && !isNaN(val)) {
            val = Math.max(0, Math.min(1, val));
            this._project['volume'] = val;
            var obj = {"volume": this._project['volume']};
            this.sendExecutor(obj);

            if (this._player && this._isPlayerReady) {
                this._player.setVolume(val*100);
            }
        }

        return (this._player && typeof this._player.getVolume == 'function') ? this._player.getVolume() / 100 : this._project["volume"];
    };

    p.muted = function(val) {
        if (val != undefined && this._player && this._isPlayerReady) {
            val = val === true;
            val ? this._player.mute() : this._player.unMute();
        }
        return (this._player && typeof this._player.isMuted == 'function') ? this._player.isMuted() : false;
    };

    p.duration = function() {
        return (this._player && typeof this._player.getDuration == 'function') ? this._player.getDuration() : 0;
    };

    //unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
    p.state = function() {
        return (this._player && typeof this._player.getPlayerState == 'function') ? this._player.getPlayerState() : -1;
    };

    p._controls = function(val) {
        if (val != undefined) {
            this._videoId(this._project['videoId']);
        }
    };

    p._playerTheme = function(val) {
        if (val != undefined)
            this._videoId(this._project['videoId']);
    };

    p.setPlaybackQuality = function(val) {
        if (this._player && this._isPlayerReady)
            this._player.setPlaybackQuality(val);
    };

    p.getPlaybackQuality = function() {
        return (this._player && this._isPlayerReady) ? this._player.getPlaybackQuality() : null;
    };

    p.getAvailableQualityLevels = function() {
        return (this._player && typeof this._player.getAvailableQualityLevels == 'function') ? this._player.getAvailableQualityLevels() : null;
    };

    p.getDataModel = function() {
        return this._valueDataModel();
    };

    p.isBindableToData = function() {
        return true;
    };

//    p.border = AC.Property.theme('border', p._border);
    p.bg = AC.Property.theme('bgColor', p._bg);
    p.opacity = AC.Property.theme('opacity', p._opacity);

    p.videoId = AC.Property.htmlLngPropBeforeSet("videoId", p._beforeVideoId, p._videoId);
    p.value = p.videoId;

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

    p.autohide = AC.Property.normal('autohide');
    p.autoplay = AC.Property.normal('autoplay');
    p.controls = AC.Property.html("controls", p._controls);
    p.playerTheme = AC.Property.theme('playerTheme', p._playerTheme);


    window['onYouTubePlayerAPIReady'] = function() {
        $(triggerObject).trigger(AC.Widgets.Youtube.onApiLoaded);
    };

    window['onYouTubePlayerReady'] = function(id) {
//        console.log('onYouTubePlayerReady');
//        console.log('id: ' + id);
    };

    AC.Widgets.Youtube.onApiLoaded = "E#Youtube#onApiLoaded";
    AC.Widgets.Youtube.onPlayerReady = "E#Youtube#onPlayerReady";
    AC.Widgets.Youtube.onStateChange = "E#Youtube#onStateChange";
    AC.Widgets.Youtube.onError = "E#Youtube#onError";
    AC.Widgets.Youtube.onPlaybackQualityChange = "E#Youtube#onPlaybackQualityChange";



    var actions = {
        onPlayerReady: {alias: "widget_youtube_on_player_ready", funcview: "onPlayerReady", action: "AC.Widgets.Youtube.onPlayerReady", params: "", group: "widget_event_general"},
        onStateChange: {alias: "widget_youtube_on_state_change", funcview: "onStateChange", action: "AC.Widgets.Youtube.onStateChange", params: "state", group: "widget_event_general"},
        onError: {alias: "widget_youtube_on_error", funcview: "onError", action: "AC.Widgets.Youtube.onError", params: "ev", group: "widget_event_general"},
        onPlaybackQualityChange: {alias: "widget_youtube_on_quality_change", funcview: "onPlaybackQualityChange", action: "AC.Widgets.Youtube.onPlaybackQualityChange", params: "quality", group: "widget_event_general"}
    };
    actions = jQuery.extend({}, AC.Widgets.Base.actions(), actions);

    /**
     * Property definitions and then their default values
     */
    var props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,  // required
            AC.Property.general.name,         // required
            {name: "videoId", type : "text", set: "videoId", get: "videoId", alias: "widget_youtube_videoid"},
            AC.Property.media.autoplay,
            AC.Property.media.controls,
            AC.Property.media.volume,
            {name: "autohide", type : "youtubeAutohide", set: "autohide", get: "autohide", alias: "widget_youtube_autohide"}
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
            {name: "playerTheme", type : "youtubeTheme", set: "playerTheme", get: "playerTheme", alias: "widget_youtube_player_theme"},
            AC.Property.behavior.opacity,
            AC.Property.style.margin,
            AC.Property.style.bgColor
        ]}

    ],
        defaultProps = {width: "320", height: "240", x : "100", y: "100", zindex : "auto", margin: "", alignInContainer: 'left', pWidth: "",
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
            opacity : 1, bgColor: "#cccccc", name: "youtube", data:[], enable: true, resizing: false,
            videoId: '', volume: 0.8, autohide: 2, autoplay: false, controls: true, playerTheme: 'dark'
        },

        lng = { "en" : {
            widget_name_youtube: "Youtube",
            widget_youtube_videoid: "Video ID",
            widget_youtube_autohide: "Autohide",
            prop_youtube_autohide_show: "Show",
            prop_youtube_autohide_hide_progress_bar: "Hide ProgressBar",
            prop_youtube_autohide_hide: "Hide",
            widget_youtube_on_player_ready: "On Player Ready",
            widget_youtube_on_state_change: "On State Change",
            widget_youtube_on_error: "On Error",
            widget_youtube_on_quality_change: "On Playback Quality Change",
            widget_youtube_player_theme: "Player Theme",
            prop_youtube_player_theme_dark: "Dark",
            prop_youtube_player_theme_light: "Light"
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

