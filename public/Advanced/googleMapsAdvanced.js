(function($, windows, document, undefined){
    var triggerObject  = {},
        currentLanguage = null,
        isLoading = false,
        lngToLoad = null;

    var widget  = AC.Widgets.GoogleMapsAdvanced = function() {
        this.init.apply(this, arguments);
    };

    widget.beforeInit = function(form) {
        form.traverseChildren(function(child){
            if (typeof child.widgetClass == 'function' && child.widgetClass() == 'WiziCore_UI_GoogleMapsWidget') {
                WiziCore_Helper.showWarning('', AC.Core.lang().trText("widget_google_maps_conflict_message"), false, WiziCore_UI_MessageBoxWidget.MB_OK);
                throw 'google maps widgets conflict!';
            }
        });
    };

    function onGmapApiLoaded() {
        isLoading = false;
        $(triggerObject).trigger(AC.Widgets.GoogleMapsAdvanced.onApiLoaded);
    }
    widget.onGmapApiLoaded = onGmapApiLoaded;

    function loadGmap(key, form, language) {
        if (WiziCore_Helper.googleMapsApiVersion == 2) {
            if (!_hasAnotherGmapWidget(form))
                loadGmapScript(key, language);
            else {
                var dlg = WiziCore_Helper.showWarning('', AC.Core.lang().trText("widget_google_maps_conflict_api_message"), false, WiziCore_UI_MessageBoxWidget.MB_YESNO);
                $(dlg).one(WiziCore_UI_MessageBoxWidget.onDialogClose, function(ev, id, res) {
                    if (id == WiziCore_UI_MessageBoxWidget.IDYES){
                        loadGmapScript(key, language);
                    }
                });
            }
        }
        else
            loadGmapLib && loadGmapLib.call(this, key, language);
    }

    function _hasAnotherGmapWidget(form) {
        var res = false;
        if (form) {
            form.traverseChildren(function(child){
                if (typeof child.widgetClass == 'function' && child.widgetClass() == 'WiziCore_UI_GoogleMapsWidget') {
                    res = true;
                    return true;
                }
            });
        }
        return res;
    }

    function loadGmapLib(apiKey, language) {
        if (currentLanguage != language || typeof google == "undefined" || typeof google.maps == "undefined" || typeof google.maps.Map != "function") {
            loadGmapScript(apiKey, language);
        }
    }

    function loadGmapScript(apiKey, lang) {
        if (!isLoading) {
            currentLanguage = lang;
            isLoading = true;
            var path = "http://maps.googleapis.com/maps/api/js?libraries=adsense&v=3.6&sensor=true&callback=AC.Widgets.GoogleMapsAdvanced.onGmapApiLoaded";
            if (lang != undefined)
                path += "&language=" + lang;

            if (apiKey != null)
                path += "&key=" + apiKey;

            if (WiziCore_Helper.isPhoneGapOnline()) {
                isLoading = true;
                WiziCore_Helper.googleMapsApiVersion = 3;
                jQuery.getScript(path)
                    .fail(function (jqxhr, settings, exception) {
                        throw "error loading " + path;
                    });
            }
        }

    }

    AC.extend(widget, AC.Widgets.Base);
    var p = widget.prototype; // prototype
    AC.copyExtension(p, AC.WidgetExt.DataIntegration.AssocArray);

    p._widgetClass  = "GoogleMapsAdvanced"; //widget Class name
    p._dataPropName = "data"; //the method name, which is responsible for working with data
    p._valueDefaultPropName = 'latlong';
    p._gMapDiv = null;
    p._gMap = null;
    p._mapCanIniting = null;
    p._marker = null;
    p._myLocationMarker = null;
    p._loaded = false;
    p._overlays = null;
    p._openedInfoWindow = null;
    p._infoWindows = null;
    p._needUpdateMyLocationMarker = false;
    p._geocoder = null;
    p._directionsService = null;
    p._adUnit = null;
    p._adUnitDiv = null;
    p._newData = true;
    p._needUpdateDataObject = true;
    p._updateLatLng = false;
    p._directionsDisplay = null;

    /**
     * Description of constructor
     * @class  Some words about label widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov, Mikhail Loginov
     * @version     0.3
     *
     * @constructs
     */
    p.init = function() { //constructor
        widget._sc.init.apply(this, arguments);
        this._overlays = {};
        this._infoWindows = {};
    };

    /**
     * Building widget function
     */
    p.draw = function() {
        var self = this,
            lang = this.form().language();
        if (isLoading || currentLanguage != lang || typeof google == "undefined" || typeof google.maps == "undefined" || typeof google.maps.Map != "function" || WiziCore_Helper.googleMapsApiVersion != 3) {
            this.addOneApiInitedEvent();
        }
        else {
            self._loaded = true;
            $(self).trigger(widget.onInitialized);
        }
        var div = $("<div>");
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            div.resize(function(){self._resizeGmap();});
        }
        var tuid = "gmaps_" + this.htmlId();
        div.attr("id", tuid);
        div.css({width: "100%", height: "100%"});
        this.base().prepend(div);
        this._gMapDiv = div;

        $(this.page()).bind(AC.Widgets.WiziCore_Api_Page.onPageShow, function() {
            if (self._updateLatLng) {
                setTimeout(function() {
                    self._latlong(self.latlong());
                    self._updateLatLng = false;
                }, 300);
            }
        });

        widget._sc.draw.apply(this, arguments);
    };

    p.addOneApiInitedEvent = function() {
        var self = this;
        $(triggerObject).one(AC.Widgets.GoogleMapsAdvanced.onApiLoaded, function(ev) {
            if (lngToLoad != null) {
                self.setLanguage(lngToLoad);
                lngToLoad = null;
            } else {
                _initServices.call(self);
                if (self._mapCanIniting !== null){
                    self.apiInited();
//                loadGears();
                }
                self._loaded = true;
                $(self).trigger(widget.onInitialized);
            }
            ev.stopPropagation();
        });
    };

    function _initServices() {
        this._geocoder = new google.maps.Geocoder();
        this._directionsService = new google.maps.DirectionsService();
        this._directionsDisplay = new google.maps.DirectionsRenderer();
    }

    p.onPageDrawn = function() {
        this._mapCanIniting = false;
        if (typeof google != "undefined" && typeof google.maps != "undefined" && typeof google.maps.Map == "function" && currentLanguage == this.form().language() && !isLoading && WiziCore_Helper.googleMapsApiVersion == 3) {
            var self = this;
            _initServices.call(self);
            setTimeout(function(){ self.apiInited(); }, 100);
//            loadGears();
        }
        widget._sc.onPageDrawn.apply(this, arguments);
    };

    p._updateLayout = function(){
        widget._sc._updateLayout.apply(this, arguments);
        this._gMapDiv.height(this.height() + 'px');
        if (this._gMap != null) {
            this._resizeGmap();
        }

        this.checkResize();
    };

    p.relativeResize = function() {
        widget._sc.relativeResize.apply(this);
        if (this._gMap != null) {
            this._resizeGmap();
        }

    };

    p._resizeGmap = function() {
        if (!this._gMap) {
            return;
        }

        var gMap = this._gMap;
        setTimeout(function(){ google.maps.event.trigger(gMap, 'resize'); }, 10);
    };

    p.initDomState  = function () {
        widget._sc.initDomState.call(this);
        this._googleKey(this.googleKey());

        this._bg(this.bg());
        this._border(this.border());
        this._shadow(this.shadow());

        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
    };

    p.initGMaps = function(apiKey) {
        this.clearMap();
        loadGmap.call(this, apiKey, this.form(), this.form().language());
    };

    p.apiInited = function() {
        this._mapCanIniting = true;
        acDebugger.systemLog("apiInited for ", this.widgetId());
        this.createGMap();
    };

    p.clearMap = function() {
        if (this._gMap != null && typeof google != "undefined" && typeof google.maps != "undefined" && (typeof google.maps.Map == "function" && typeof google.maps.event == "object")) {
                google.maps.event.clearInstanceListeners(this._gMap);
        }
        delete this._gMap;
        this._gMap = null;
    };

    p.createGMap = function() {
        if (this._mapCanIniting === true) {
            var map = this._gMap;
            if (map != null)
                google.maps.event.clearInstanceListeners(map);

            var options = this._getGmOptions(true);
            delete this._gMap;
            this._gMapDiv.empty();

            //show text in map div
            this._gMapDiv.html('If this text does <br/>not disappear quickly, <br/>then your browser does <br/>not support Google Maps.');

            map = new google.maps.Map(this._gMapDiv.get(0), options);
            this._gMap = map;

            this._addMapEvents();
            this.initMarker();

            (this.adsensePublisherId()) ? this._adsensePublisherId(this.adsensePublisherId()) : null;

            this._gMapDiv.css("z-index", "");
            this._updateEnable();
            this._resizeGmap();
            this._data(this.data());
            $(this).trigger(widget.onMapDrawn);
        }
    };

    p._getGmOptions = function(withControls) {
        var map = this._gMap, zoomLevel;

        if (map && typeof map['getZoom'] == "function"){
            zoomLevel = map.getZoom();
        } else {
            zoomLevel = this.zoomLevel();
        }

        var mapType = undefined;
        if (map && typeof map['getMapTypeId'] == "function"){
            mapType = map.getMapTypeId();
        }

        var options = {
            mapTypeId: (mapType != undefined) ? mapType : google.maps.MapTypeId.ROADMAP,
            zoom: zoomLevel,
            center: new google.maps.LatLng(this.latlong()[0], this.latlong()[1], false)
        };
        (this.mapStyles() != undefined) ? options.styles = this.mapStyles() : null;
        (this.noScroll() === true) ? options.draggable = false : null;

        if (withControls === true) {
            $.extend(options, this._getControlsOptions(this.mapControls()));
        }

        return options;
    };

    p._addMapEvents = function() {
        if (this.mode() == AC.Visualizer.RUN_MODE) {
            var self = this, map = this._gMap;

            google.maps.event.addListener(map, "bounds_changed",    function() { $(self).trigger(new jQuery.Event(widget.onBoundsChanged)); });
            google.maps.event.addListener(map, "center_changed",    function() { $(self).trigger(new jQuery.Event(widget.onCenterChanged)); });
            google.maps.event.addListener(map, "click",             function(event) { self.onClick(event); });
            google.maps.event.addListener(map, "dblclick",          function(event) { self.onDbClick(event); });
            google.maps.event.addListener(map, "drag",              function() { $(self).trigger(new jQuery.Event(widget.onMapDrag)); });
            google.maps.event.addListener(map, "dragstart",         function() { self.onDragStart(); });
            google.maps.event.addListener(map, "dragend",           function() { self.onDragStop(); });
            google.maps.event.addListener(map, "heading_changed",   function() { $(self).trigger(new jQuery.Event(widget.onHeadingChanged)); });
            google.maps.event.addListener(map, "idle",              function() { $(self).trigger(new jQuery.Event(widget.onIdle)); });
            google.maps.event.addListener(map, "maptypeid_changed", function() { $(self).trigger(new jQuery.Event(widget.onMapTypeIdChanged)); });
            google.maps.event.addListener(map, "mousemove",         function(event) { $(self).trigger(new jQuery.Event(widget.onMapMouseMove), [event.latLng]); });
            google.maps.event.addListener(map, "mouseout",          function(event) { self.onMouseLeave(event); });
            google.maps.event.addListener(map, "mouseover",         function(event) { self.onMouseEnter(event); });
            google.maps.event.addListener(map, "projection_changed",function() { $(this).trigger(new jQuery.Event(widget.onProjectionChanged)); });
            google.maps.event.addListener(map, "resize",            function() { $(self).trigger(new jQuery.Event(widget.onMapResize)); });
            google.maps.event.addListener(map, "rightclick",        function(event) { $(self).trigger(new jQuery.Event(widget.onRightClick), [event.latLng]); });
            google.maps.event.addListener(map, "tilesloaded",       function() { $(self).trigger(new jQuery.Event(widget.onTilesLoaded)); });
            google.maps.event.addListener(map, "tilt_changed",      function() { $(self).trigger(new jQuery.Event(widget.onTiltChanged)); });
            google.maps.event.addListener(map, "zoom_changed",      function() { $(self).trigger(new jQuery.Event(widget.onZoomChanged)); });
        }
    };

    p.onClick = function(event) {
        if (this._gMap != null)
            $(this).trigger(new jQuery.Event(AC.Widgets.Base.onClick), [event.latLng]);
    };
    p.onDbClick = function(event) {
        if (this._gMap != null)
            $(this).trigger(new jQuery.Event(AC.Widgets.Base.onDbClick), [event.latLng]);
    };
    p.onMouseEnter = function(event) {
        if (this._gMap != null)
            $(this).trigger(new jQuery.Event(AC.Widgets.Base.onMouseEnter), [event.latLng]);
    };
    p.onMouseLeave = function(event) {
        if (this._gMap != null)
            $(this).trigger(new jQuery.Event(AC.Widgets.Base.onMouseLeave), [event.latLng]);
    };
    p.onDragStart = function() {
        if (this._gMap != null)
            $(this).trigger(new jQuery.Event(AC.Widgets.Base.onDragStart));
    };
    p.onDragStop = function() {
        if (this._gMap != null)
            $(this).trigger(new jQuery.Event(AC.Widgets.Base.onDragStop));
    };

    p.addCurrentLocation = function(callback) {
        if (this._gMap != null) {
            this._needUpdateMyLocationMarker = true;
            this.whereAmI(callback);
        } else
            throw "map not loaded yet";
    };

    p.whereAmI = function(callback) {
        if (!hasLatLngObj())
            throw "API not loaded yet";
        else {
            var self = this;
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var res = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    self._onCurrentLocationUpdated(true, res, callback);
                }, function(error) {
                    self._onCurrentLocationUpdated(false, {msg:AC.Core.lang().trText("widget_gmap_gloc_failed"), errorMsg: error.message, errorCode: error.code}, callback);
                });
            } else {
                this._onCurrentLocationUpdated(false, {msg:AC.Core.lang().trText("widget_gmap_gloc_browser_failed")}, callback);
            }
        }
    };

    function hasLatLngObj() {
        return (typeof google != "undefined" && typeof google.maps != "undefined" && typeof google.maps.LatLng == "function");
    }

    p._onCurrentLocationUpdated = function(result, data, callback) {
        if (callback)
            callback(result, data);

        if (this._needUpdateMyLocationMarker) {
            this._needUpdateMyLocationMarker = false;
            if (result === true && hasLatLngObj())
                this._updateMyLocationMarker(data);
        }
    };

    p._updateMyLocationMarker = function(location) {
        if (!this._myLocationMarker) {
            this._myLocationMarker = new google.maps.Marker({
                position: location,
                icon: this.markerImage()
            });
            var self = this;
            google.maps.event.addListener(this._myLocationMarker, 'click', function(event){ $(self).trigger(new jQuery.Event(widget.onOverlayClick), [event.latLng, null]); });
        } else
            this._myLocationMarker.setPosition(location);

        this._myLocationMarker.setMap(this._gMap);
    };

    p._showMyLocationMarker = function(val) {
        if (val != undefined && this._myLocationMarker) {
            val = val === true;
            if (val)
                this._myLocationMarker.setMap(this._gMap);
            else
                this._myLocationMarker.setMap(null);
        }
    };

    p.remove = function() {
        if (this._adUnitDiv) {
            this._adUnitDiv.remove();
            this._adUnitDiv = null;
        }

        this.clearMap();
        this._adUnit = null;
        this._geocoder = null;
        this._directionsService = null;
        this._directionsDisplay = null;

        if (this._marker != null) {
            google.maps.event.clearInstanceListeners(this._marker);
            this._marker = null;
        }

        if (this._myLocationMarker != null) {
            google.maps.event.clearInstanceListeners(this._myLocationMarker);
            this._myLocationMarker = null;
        }

        this._openedInfoWindow = null;
        this._overlays = null;
        this._infoWindows = null;

        $(triggerObject).unbind(AC.Widgets.GoogleMapsAdvanced.onApiLoaded);
        widget._sc.remove.call(this);
    };

    p._enable = function(flag){
        if (this._gMap != null){
            this.showEnableDiv(flag);
        } else if (this._gMapDiv != null) {
            (flag === false) ? this._gMapDiv.addClass('ui-state-disabled') : this._gMapDiv.removeClass('ui-state-disabled');
        }
    };

    function _getDomain(url){
        if (typeof url != "string")
            return url;

        var startPos = url.indexOf("//");
        if (startPos == -1)
            startPos = 0;

        var endPos = url.indexOf("/", startPos + 2);
        if (endPos == -1)
            endPos = url.length;

        return url.substring(startPos + 2, endPos);
    }

    function _getApiKey(val) {
        if (val == undefined)
            return null;

        var apiKey = null,
            i, l, loc,
            pathname = this.getCurrentPathName().toLowerCase(),
            locDomain = _getDomain(pathname);

        if (!(locDomain == '' || locDomain == 'localhost') && val.rows != undefined) {
            //get data from prefill dialog
            for (i =0, l= val.rows.length; i < l; i++) {
                loc = val.rows[i].data[0].toLowerCase();
                loc = _getDomain(loc);

                if (pathname.indexOf(loc) >= 0) {
                    if (!(typeof val.rows[i].data[1] == "string") || (val.rows[i].data[1].indexOf("ABQI") == 0 && val.rows[i].data[1].length == 86)) {
                        continue;
                    }
                    apiKey = val.rows[i].data[1];
                    break;
                }
            }
        }

        if (apiKey === null) {
            var key = this.form() ? this.form().gmapsApiKey() : null;
            if (key != null && key != '')
                apiKey = key;
        }

//        if (apiKey === null) {
//            //try to find in config
//            try {
//                var wfApp = WiziCore_AppContext.getInstance();
//                if (wfApp != undefined) {
//
//                    var key = wfApp.config().googleApiKey();
//                    for (i = 0, l = key.rows.length; i < l; i++) {
//                        loc = key.rows[i].data[0].toLowerCase();
//                        loc = _getDomain(loc);
//                        if (pathname.indexOf(loc) >= 0) {
//                            if (!(typeof val.rows[i].data[1] == "string") || (val.rows[i].data[1].indexOf("ABQI") == 0 && val.rows[i].data[1].length == 86)) {
//                                continue;
//                            }
//                            apiKey = key.rows[i].data[1];
//                            break;
//                        }
//                    }
//                }
//            } catch(e) {
//            }
//
//        }

        return apiKey;
    }

    p._googleKey = function(val) {
        if (val != undefined) {
            this.initGMaps(_getApiKey.call(this, val));
        }
    };

    p._onLanguageChanged = function() {
        var lng = this.form().language();
        if (lng != null)
            this.setLanguage(lng);
    };

    p.setLanguage = function(lng) {
        if (currentLanguage == lng)
            return;

        if (!isLoading) {
            this.addOneApiInitedEvent();
            loadGmapScript(_getApiKey.call(this, this.googleKey()), lng);
        } else
            lngToLoad = lng;
    };

    p.loadApi = function() {
        var form = this.form(),
            language = form ? form.language() : null;

        if (currentLanguage != language || typeof google == "undefined" || typeof google.maps == "undefined" || typeof google.maps.Map != "function") {
            this.addOneApiInitedEvent();
            loadGmap(_getApiKey.call(this, this.googleKey()), this.form(), language);
        } else
            $(this).trigger(widget.onInitialized);
    };

    p.googleMap = function(){
        return this._gMap;
    };

    p.getCurrentPathName = function() {
        return window.location.hostname;
    };

    p.initMarker = function() {
        var self = this;

        if (this._gMap !== null) {
            //create marker, if not init
            var latlng = new google.maps.LatLng(this.latlong()[0], this.latlong()[1]);
            if (this._marker !== null) {
                this._marker.setMap(null);
                google.maps.event.clearInstanceListeners(this._marker);
                this._marker = null;
            }
            this._marker = new google.maps.Marker({
                    position: latlng,
                    icon: this.markerImage()
            });

            google.maps.event.addListener(this._marker, 'click', function(event){ $(self).trigger(new jQuery.Event(widget.onOverlayClick), [event.latLng, null]); });
        }

        if (this._marker !== null) {
            this._showMarker(this.showMarker());
        }
    };

    p._showMarker = function(val) {
        if (val != undefined && this._marker) {
            val = val === true;
            if (val)
                this._marker.setMap(this._gMap);
            else
                this._marker.setMap(null);
        }
    };

    p.addMarker = function(lat, lng, mouseOverHTML, onClickHTML, markerImageURL, id) {
        return this._addMarker(id, lat, lng, mouseOverHTML, onClickHTML, markerImageURL);
    };

    p._addMarker = function(id, lat, lng, mouseOverHTML, onClickHTML, markerImageURL) {
        if (!this._gMap)
            return;

        var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                icon: markerImageURL != undefined ? markerImageURL : this.markerImage()
        });
        marker.setMap(this._gMap);

        id = id ? id : WiziCore_Helper.generateUniqueId(36, "o");

        _addClickOverPopups.call(this, id, marker, mouseOverHTML, onClickHTML);

        this._overlays[id] = {type: AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER, overlay: marker};

        if (this._needUpdateDataObject)
            _addOverlayToDataObject.call(this, id, AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER, {position:new google.maps.LatLng(lat, lng), mouseOverHTML:mouseOverHTML, onClickHTML:onClickHTML, markerImageURL:markerImageURL});

        return id;
    };

    function _addClickOverPopups(id, overlay, mouseOverHTML, onClickHTML) {
        var self = this,
            isMarker = overlay instanceof google.maps.Marker;

        if (this._infoWindows[id] != undefined)
            _clearInfoWindows.call(this, id);

        this._infoWindows[id] = {};

        if (mouseOverHTML) {
            this._infoWindows[id]['over'] = new google.maps.InfoWindow({ content: mouseOverHTML });
        }

        if (onClickHTML) {
            this._infoWindows[id]['click'] = new google.maps.InfoWindow({ content: onClickHTML });
        }

        if (this._infoWindows[id]['over']) {
            google.maps.event.addListener(overlay, 'mouseover', function(event) {
                if (!self._infoWindows[id]['click'] || self._infoWindows[id]['click'] != self._openedInfoWindow) {
                    if (isMarker)
                        self._infoWindows[id]['over'].open(self._gMap, overlay);
                    else {
                        self._infoWindows[id]['over'].position = event.latLng;
                        self._infoWindows[id]['over'].open(self._gMap);
                    }
                }
            });
            google.maps.event.addListener(overlay, 'mouseout', function() {
                self._infoWindows[id]['over'].close();
            });
        }

        if (this._infoWindows[id]['click']) {
            google.maps.event.addListener(this._infoWindows[id]['click'], 'closeclick', function(event) {
                if (self._infoWindows[id]['click'] == self._openedInfoWindow)
                    self._openedInfoWindow = null;
            });
        }

        google.maps.event.addListener(overlay, 'click', function(event) {
            $(self).trigger(new jQuery.Event(widget.onOverlayClick), [event.latLng, id]);

            if (self._infoWindows[id]['over'])
                self._infoWindows[id]['over'].close();

            if (self._openedInfoWindow != null)
                self._openedInfoWindow.close();

            if (self._infoWindows[id]['click']) {
                if (isMarker)
                    self._infoWindows[id]['click'].open(self._gMap, overlay);
                else {
                    self._infoWindows[id]['click'].position = event.latLng;
                    self._infoWindows[id]['click'].open(self._gMap);
                }
                self._openedInfoWindow = self._infoWindows[id]['click'];
            }
        });
    }

    function _clearInfoWindows(id) {
        var i, l, infoWindow, ws = this._infoWindows[id], wNames = ['over', 'click'];

        if (ws) {
            for (i = 0, l = wNames.length; i < l; i++) {
                infoWindow = ws[wNames[i]];
                if (infoWindow) {
                    infoWindow.close();
                    infoWindow = null;
                }
            }
            this._infoWindows[id] = null;
            delete this._infoWindows[id];
        }
    }

    p.removeMarker = function(id) {
        _removeOverlay.call(this, id, true);
    };

    p.removeOverlay = function(id) {
        _removeOverlay.call(this, id, true);
    };

    function _removeOverlay(id, removeFromDataObj) {
        if (id != undefined) {
            var overlayObj = this._overlays[id];
            if (overlayObj) {
                overlayObj.overlay.setMap(null);
                google.maps.event.clearInstanceListeners(overlayObj.overlay);
                if (overlayObj.type == AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER)
                    _clearInfoWindows.call(this, id);

                this._overlays[id] = null;
                delete this._overlays[id];

                if (removeFromDataObj === true)
                    _removeOverlayFromDataObject.call(this, id);
            }
        }
    }

    function _removeOverlayFromDataObject(id) {
        var data = this.data();
        if (data && data[id]) {
            this._newData = false;
            delete data[id];
            this.data(data);
            this._newData = true;
        }
    }

    p.clearMarkers = function() {
        this._clearMarkers(true);
    };

    p._clearMarkers = function(removeFromDataObj) {
        var i, overlayObj;
        for (i in this._overlays) {
            overlayObj = this._overlays[i];
            if (overlayObj.type == AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER)
                _removeOverlay.call(this, i, removeFromDataObj);
        }
    };

    p.clearOverlays = function() {
        this._clearOverlays(true);
    };

    p._clearOverlays = function(removeFromDataObj) {
        var i, overlayObj;
        for (i in this._overlays) {
            overlayObj = this._overlays[i];
            if (overlayObj.type != AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER)
                _removeOverlay.call(this, i, removeFromDataObj);
        }
    };

    p.showOverlay = function(id) {
        if (id != undefined && this._gMap) {
            var overlayObj = this._overlays[id];
            if (overlayObj) {
                overlayObj.overlay.setMap(this._gMap);
            }
        }
    };

    p.hideOverlay = function(id) {
        if (id != undefined && this._gMap) {
            var overlayObj = this._overlays[id];
            if (overlayObj) {
                overlayObj.overlay.setMap(null);
            }
        }
    };

    p.fitToOverlays = function(fitMarkers, fitOverlays) {
        if (!this._gMap || (!fitMarkers && !fitOverlays))
            return;

        var overlays = this._overlays, needFit = false;
        var bounds = new google.maps.LatLngBounds();
        for (var i in overlays) {
            var overlay = overlays[i].overlay;
            var isMarker = overlay instanceof google.maps.Marker;
            if ((isMarker && !fitMarkers) || (!isMarker && !fitOverlays))
                continue;

            needFit = true;

            if (typeof overlay.getBounds == "function") {
                bounds.union(overlay.getBounds());
            } else {
                if (typeof overlay.getPosition == "function") {
                    bounds.extend(overlay.getPosition());
                } else {
                    if (typeof overlay.getPath == "function") {
                        var path = overlay.getPath();
                        for (var j = 0, k = path.length; j < k; j++) {
                            bounds.extend(path.getAt(j));
                        }
                    }
                }
            }
        }

        if (needFit)
            this._gMap.fitBounds(bounds);
    };

    p.addPolyline = function(polyline, settings, id, mouseOverHTML, onClickHTML) {
        return this._addPolyline(id, polyline, settings, mouseOverHTML, onClickHTML);
    };

    p._addPolyline = function(id, polyline, settings, mouseOverHTML, onClickHTML) {
        if ($.isArray(polyline) !== true || !this._gMap)
            return;

        var options = {}, path = [], i, l, overlay,
            self = this;

        id = id ? id : WiziCore_Helper.generateUniqueId(36, "o");

        for (i = 0, l = polyline.length; i < l; i++) {
            path.push(new google.maps.LatLng(polyline[i][0], polyline[i][1]));
        }
        options.path = path;

        if (this._needUpdateDataObject)
            _addOverlayToDataObject.call(this, id, AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYLINE, $.extend({mouseOverHTML:mouseOverHTML, onClickHTML:onClickHTML}, options, settings));

        _addOverlaySettings.call(this, options, settings);
        overlay = new google.maps.Polyline(options);
        overlay.setMap(this._gMap);

        _addClickOverPopups.call(this, id, overlay, mouseOverHTML, onClickHTML);

        this._overlays[id] = {type: AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYLINE, overlay: overlay};
        return id;
    };

    p.addPolygon = function(polygon, settings, id, mouseOverHTML, onClickHTML) {
        return this._addPolygon(id, polygon, settings, mouseOverHTML, onClickHTML);
    };

    p._addPolygon = function(id, polygon, settings, mouseOverHTML, onClickHTML) {
        if ($.isArray(polygon) !== true || !this._gMap)
            return;

        var options = {}, paths = [], i, l, overlay,
            self = this;

        id = id ? id : WiziCore_Helper.generateUniqueId(36, "o");

        for (i = 0, l = polygon.length; i < l; i++) {
            paths.push(new google.maps.LatLng(polygon[i][0], polygon[i][1]));
        }
        options.paths = paths;

        if (this._needUpdateDataObject)
            _addOverlayToDataObject.call(this, id, AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYGON, $.extend({mouseOverHTML:mouseOverHTML, onClickHTML:onClickHTML}, options, settings));

        _addOverlaySettings.call(this, options, settings);
        overlay = new google.maps.Polygon(options);
        overlay.setMap(this._gMap);

        _addClickOverPopups.call(this, id, overlay, mouseOverHTML, onClickHTML);

        this._overlays[id] = {type: AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYGON, overlay: overlay};
        return id;
    };

    p.addCircle = function(circle, settings, id, mouseOverHTML, onClickHTML) {
        return this._addCircle(id, circle, settings, mouseOverHTML, onClickHTML);
    };

    p._addCircle = function(id, circle, settings, mouseOverHTML, onClickHTML) {
        if ($.isArray(circle) !== true || !this._gMap)
            return;

        var options = {
            center: new google.maps.LatLng(circle[0][0], circle[0][1]),
            radius: circle[1]
        }, overlay,
            self = this;

        id = id ? id : WiziCore_Helper.generateUniqueId(36, "o");

        if (this._needUpdateDataObject)
            _addOverlayToDataObject.call(this, id, AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_CIRCLE, $.extend({mouseOverHTML:mouseOverHTML, onClickHTML:onClickHTML}, options, settings));

        _addOverlaySettings.call(this, options, settings);
        overlay = new google.maps.Circle(options);
        overlay.setMap(this._gMap);

        _addClickOverPopups.call(this, id, overlay, mouseOverHTML, onClickHTML);

        this._overlays[id] = {type: AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_CIRCLE, overlay: overlay};
        return id;
    };

    p.addRectangle = function(rectangle, settings, id, mouseOverHTML, onClickHTML) {
        return this._addRectangle(id, rectangle, settings, mouseOverHTML, onClickHTML);
    };

    p._addRectangle = function(id, rectangle, settings, mouseOverHTML, onClickHTML) {
        if ($.isArray(rectangle) !== true || !this._gMap)
            return;

        var options = {
            bounds: new google.maps.LatLngBounds(new google.maps.LatLng(rectangle[0][0], rectangle[0][1]), new google.maps.LatLng(rectangle[1][0], rectangle[1][1]))
        }, overlay,
            self = this;

        id = id ? id : WiziCore_Helper.generateUniqueId(36, "o");

        if (this._needUpdateDataObject)
            _addOverlayToDataObject.call(this, id, AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_RECTANGLE, $.extend({mouseOverHTML:mouseOverHTML, onClickHTML:onClickHTML}, options, settings));

        _addOverlaySettings.call(this, options, settings);
        overlay = new google.maps.Rectangle(options);
        overlay.setMap(this._gMap);

        _addClickOverPopups.call(this, id, overlay, mouseOverHTML, onClickHTML);

        this._overlays[id] = {type: AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_RECTANGLE, overlay: overlay};
        return id;
    };

    p.getOverlayObjById = function(id) {
        return (this._overlays) ? this._overlays[id].overlay : null;
    };

    function _addOverlaySettings(options, settings) {
        var defaultOptions = {
            strokeColor : this.strokeColor(),
            strokeOpacity : this.strokeOpacity(),
            strokeWeight : this.strokeWeight(),
            fillColor : this.fillColor(),
            fillOpacity : this.fillOpacity()
        };

        $.extend(options, defaultOptions);
        if (settings != null)
            $.extend(options, settings);
    }

    function _convertPathToString(value) {
        var res = "";

        for (var i = 0, l = value.length; i < l; i++) {
            res += value[i].lat() + "," + value[i].lng() + ";";
        }
        res = res.substring(0, res.length - 1);
        return res;
    }

    function _convertStringToPointsArr(value) {
        var res = [], temp, i, l;
        temp = value.split(";");
        for (i = 0, l = temp.length; i < l; i++) {
            res.push(temp[i].split(","));
        }
        return res;
    }

    p.getAddress = function(callback, lat, lng, region) {
        if (!this._geocoder || !callback)
            return;

        if (!lat || !lng) {
            var self = this;
            function processLocationResponce(result, data) {
                if (result === true)
                    self._getAdressByCoords(callback, data, region);
            }

            this.whereAmI(processLocationResponce);
        } else
            this._getAdressByCoords(callback, new google.maps.LatLng(lat, lng), region);
    };

    p._getAdressByCoords = function(callback, latLng, region) {
        var request = {latLng: latLng};
        if (region)
            request.region = region;

        this._geocoder.geocode(request, function(results, status){
            if (status == google.maps.GeocoderStatus.OK)
                callback(true, results);
            else
                callback(false, {msg:AC.Core.lang().trText("widget_gmap_geocode_error") + " : " + status});
        });
    };

    p.getCoord = function(callback, address, region) {
        if (!this._geocoder || !callback || !address)
            return;

        var request = {address: address};
        if (region)
            request.region = region;

        this._geocoder.geocode(request, function(results, status){
            if (status == google.maps.GeocoderStatus.OK)
                callback(true, results[0].geometry.location);
            else
                callback(false, {msg:AC.Core.lang().trText("widget_gmap_geocode_error") + " : " + status});
        });
    };

    p.getDirections = function(callback, origin, destination, drawOnMap, options, rendererOptions) {
        if (!this._directionsService || !callback || !origin || !destination)
            return;

        origin = ($.isArray(origin)) ? new google.maps.LatLng(origin[0], origin[1]) : origin;
        destination = ($.isArray(destination)) ? new google.maps.LatLng(destination[0], destination[1]) : destination;
        var self = this,
            request = {
            origin : origin,
            destination : destination,
            travelMode: google.maps.TravelMode.DRIVING
        };
        if (options)
            $.extend(request, options);

        this._directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                if (self._directionsDisplay && drawOnMap === true && self._gMap) {
                    self._directionsDisplay.setMap(self._gMap);
                    self._directionsDisplay.setOptions(rendererOptions);
                    self._directionsDisplay.setDirections(result);
                }

                callback(true, result);
            } else
                callback(false, {msg:AC.Core.lang().trText("widget_gmap_direction_service_error") + " : " + status});
        });
    };

    p.removeDirections = function() {
        if (this._directionsDisplay)
            this._directionsDisplay.setMap(null);
    };

    p._zoomLevel = function(val) {
        if (val != undefined && this._isDrawn && this._gMap != null) {
            this._gMap.setZoom(Math.round(val));
        }
    };

    p._markerImage = function(val) {
        if (val != undefined && this._gMap) {
            if (this._marker !== null)
                this._marker.setIcon(val);

            var overlayObj, i;

            for (i in this._overlays) {
                overlayObj = this._overlays[i];
                if (overlayObj.type == AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER && overlayObj.overlay.markerImageURL == null)
                    overlayObj.overlay.setIcon(val);
            }
        }
    };

    p._latlongBefore = function(val) {
        var isLanLng = val != undefined && hasLatLngObj() && val instanceof google.maps.LatLng;
        val = isLanLng ? [val.lat(), val.lng()] : val;
        if (val != undefined && $.isArray(val) && val.length > 1) {
            val[0] = (val[0] > 90) ? val[0] % 90 : val[0];
            val[0] = (val[0] < -90) ? val[0] % -90 : val[0];
            val[1] = (val[1] > 180) ? val[1] % 180 : val[1];
            val[1] = (val[1] < -180) ? val[1] % -180 : val[1];
        } else
            val = undefined;

        return val;
    };

    p._latlong = function(val) {
        if (val != undefined && $.isArray(val) && val.length > 1) {
            if (this._isDrawn && this._gMap) {
                if (this.base().is(":visible")) {
                    this._gMap.setCenter(new google.maps.LatLng(val[0], val[1]));
                    this.updateMarkerPosition();
                } else
                    this._updateLatLng = true;
            }
        }
    };

    p.updateMarkerPosition = function() {
        if (this._gMap && this._marker)
            this._marker.setPosition(new google.maps.LatLng(this.latlong()[0], this.latlong()[1]));
    };

    function _addOverlayToDataObject(id, type, overlayData) {
        var overlayToAdd = {type: type},
            data = this.data();
        this._newData = false;

        switch (type) {
            case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER:
                overlayToAdd.coords = _convertPathToString([overlayData.position]);
                if (overlayData.markerImageURL)
                    overlayToAdd.markerImageURL = overlayData.markerImageURL;
                break;
            case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYLINE:
                $.extend(overlayToAdd, overlayData);
                delete overlayToAdd["path"];
                overlayToAdd.coords = _convertPathToString(overlayData.path);
                break;
            case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYGON:
                $.extend(overlayToAdd, overlayData);
                delete overlayToAdd["paths"];
                overlayToAdd.coords = _convertPathToString(overlayData.paths);
                break;
            case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_CIRCLE:
                $.extend(overlayToAdd, overlayData);
                delete overlayToAdd["center"];
                overlayToAdd.coords = _convertPathToString([overlayData.center]);
                break;
            case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_RECTANGLE:
                $.extend(overlayToAdd, overlayData);
                delete overlayToAdd["bounds"];
                overlayToAdd.coords = _convertPathToString([overlayData.bounds.getSouthWest(), overlayData.bounds.getNorthEast()]);
                break;
        }

        if (overlayData.mouseOverHTML)
            overlayToAdd.mouseOverHTML = overlayData.mouseOverHTML;
        if (overlayData.onClickHTML)
            overlayToAdd.onClickHTML = overlayData.onClickHTML;

        data[id] = overlayToAdd;
        this.data(data);
        this._newData = true;
    }

    p.getOverlays = function() {
        return this._overlays;
    };

    p._data = function(val) {
        if (val != undefined && this._newData && this._gMap) {
            this._clearMarkers(false);
            this._clearOverlays(false);
            this._needUpdateDataObject = false;
            var i, overlayObj, temp, options;
            for (i in val) {
                overlayObj = val[i];
                temp = _convertStringToPointsArr(overlayObj.coords);
                if (overlayObj.type == AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER) {
                    this._addMarker(i, temp[0][0], temp[0][1], overlayObj.mouseOverHTML, overlayObj.onClickHTML, overlayObj.markerImageURL);
                } else {
                    options = $.extend({}, overlayObj);
                    delete options.coords;
                    delete options.type;
                    delete options.mouseOverHTML;
                    delete options.onClickHTML;
                    switch (overlayObj.type) {
                        case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYLINE:
                            this._addPolyline(i, temp, options, overlayObj.mouseOverHTML, overlayObj.onClickHTML);
                            break;
                        case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_POLYGON:
                            this._addPolygon(i, temp, options, overlayObj.mouseOverHTML, overlayObj.onClickHTML);
                            break;
                        case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_RECTANGLE:
                            this._addRectangle(i, temp, options, overlayObj.mouseOverHTML, overlayObj.onClickHTML);
                            break;
                        case AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_CIRCLE:
                            temp.push(options.radius);
                            delete options.radius;
                            this._addCircle(i, temp, options, overlayObj.mouseOverHTML, overlayObj.onClickHTML);
                            break;
                    }
                }
            }
            this._needUpdateDataObject = true;
        }
    };

    p._mapStyles = function(styles) {
        if (styles != undefined && this._gMap) {
            this._gMap.setOptions({styles: styles});
        }
    };

    p._mapControls = function(value) {
        if (value != undefined && this._gMap) {
              this.createGMap();
        }
    };

    p._noScroll = function(val) {
        if (val != undefined && this._gMap) {
            this.createGMap();
        }
    };

    p._getControlsOptions = function(controls) {
        var options = {}, i;

        if (controls.useDefaultControls !== true)
        {
            for (i in controls) {
                $.extend(options, this._getControlOptions(i, controls[i]));
            }
            options.disableDefaultUI = true;
        } else
            options.disableDefaultUI = false;

        return options;
    };

    p._getControlOptions = function(controlName, data) {
        var ret = {},
            pos = google.maps.ControlPosition[data.position];

        switch(controlName) {
            case "gmMapType":
                ret.mapTypeControl = data.visible;
                ret.mapTypeControlOptions = {
                    position: pos,
                    style : google.maps.MapTypeControlStyle[data.style]
                };
                break;
            case "gmOverviewMap":
                ret.overviewMapControl = data.visible;
                ret.overviewMapControlOptions = { position: pos };
                break;
            case "gmPan":
                ret.panControl = data.visible;
                ret.panControlOptions = { position: pos };
                break;
            case "gmRotate":
                ret.rotateControl = data.visible;
                ret.rotateControlOptions = { position: pos };
                break;
            case "gmScale":
                ret.scaleControl = data.visible;
                ret.scaleControlOptions = { position: pos };
                break;
            case "gmStreetView":
                ret.streetViewControl = data.visible;
                ret.streetViewControlOptions = { position: pos };
                break;
            case "gmZoom":
                ret.zoomControl = data.visible;
                ret.zoomControlOptions = {
                    position: pos,
                    style: google.maps.ZoomControlStyle[data.style]
                };
                break;
        }
        return ret;
    };

    p._strokeColor = function(val) { _setOverlayStyleProp.call(this, "strokeColor", val); };
    p._strokeOpacity = function(val) { _setOverlayStyleProp.call(this, "strokeOpacity", val); };
    p._strokeWeight = function(val) { _setOverlayStyleProp.call(this, "strokeWeight", val); };
    p._fillColor = function(val) { _setOverlayStyleProp.call(this, "fillColor", val); };
    p._fillOpacity = function(val) { _setOverlayStyleProp.call(this, "fillOpacity", val); };

    function _setOverlayStyleProp(prop, val) {
        var overlayObj, i, options = {}, data = this.data();
        options[prop] = val;
        if (val != undefined) {
            for (i in this._overlays) {
                overlayObj = this._overlays[i];
                if (overlayObj.type != AC.Widgets.GoogleMapsAdvanced.OVERLAY_TYPE_MARKER && data[i][prop] == null)
                    overlayObj.overlay.setOptions(options);
            }
        }
    }

    p._adsensePublisherId = function(val) {
        if (val != undefined && this._gMap) {
            if (this._adUnit) {
                this._adUnit.setMap(null);
                this._adUnit = null;
            }
            if (this._adUnitDiv) {
                this._adUnitDiv.remove();
                this._adUnitDiv = null;
            }

            if (val == '')
                return;

            if (!this._adUnitDiv) {
                this._adUnitDiv = $("<div>");
                this.base().append(this._adUnitDiv);
            }

            var options = {
                format: google.maps.adsense.AdFormat[this.adsenseFormat()],
                position: google.maps.ControlPosition[this.adsensePosition()],
                map: this._gMap,
                publisherId: val,
                visible: true
            };
            if (this.adsenseChannelNumber() != undefined)
                options.channelNumber = this.adsenseChannelNumber();

            this._adUnit = new google.maps.adsense.AdUnit(this._adUnitDiv.get(0), options);
        }
    };

    p._adsenseChannelNumber = function(val) {
        if (val != undefined && this._gMap && this._adUnit) {
            this._adUnit.setChannelNumber(val);
        }
    };

    p._adsenseFormat = function(val) {
        if (val && this._gMap && this._adUnit) {
            this._adUnit.setFormat(google.maps.adsense.AdFormat[val]);
        }
    };

    p._adsensePosition = function(val) {
        if (val && this._gMap && this._adUnit) {
            this._adUnit.setPosition(google.maps.ControlPosition[val]);
        }
    };

    p.getDataFromMap = function(overlaysData, mapObject) {
        var res = {},
            i,j,l,id,item,mapValue, value;

        for (i = 0, l = overlaysData.length; i < l; i++) {
            item = {};
            id = AC.Widgets.Base.getDataItemWithMap(overlaysData[i], mapObject["id"]);
            id = (id != undefined && id != '') ? id : WiziCore_Helper.generateUniqueId(36, "o");
            for (j in mapObject) {
                mapValue = mapObject[j];
                if (mapValue != undefined && j != 'id') {
                    value = AC.Widgets.Base.getDataItemWithMap(overlaysData[i], mapValue);
                    if (value != null)
                        item[j] = value;
                }
            }
            res[id] = item;
        }

        return res;
    };

    p.getDataModel = function() {
        return [
            {name : "widget_id", value: "",uid : "id"},
            {name : "widget_gmap_overlay_type", value: "", uid : "type"},
            {name : "widget_gmap_coords", value: "", uid : "coords"},
            {name : "widget_gmap_radius", value: "", uid : "radius"},
            {name : "widget_gmap_stroke_color", value: "",uid : "strokeColor"},
            {name : "widget_gmap_stroke_opacity", value: "", uid : "strokeOpacity"},
            {name : "widget_gmap_stroke_weight", value: "", uid : "strokeWeight"},
            {name : "widget_gmap_fill_color", value: "", uid : "fillColor"},
            {name : "widget_gmap_fill_opacity", value: "",uid : "fillOpacity"},
            {name : "widget_gmap_mouseOverHTML", value: "", uid : "mouseOverHTML"},
            {name : "widget_gmap_onClickHTML", value: "", uid : "onClickHTML"},
            {name : "widget_gmap_markerImageURL", value: "", uid : "markerImageURL"}
        ];
    };

    // template properties
    p.isIncludedInSchema = AC.Property.normal('isIncludedInSchema', this._updateStorageFlag);
    p.isUnique = AC.Property.normal('isUnique');
    p.mandatory = AC.Property.normal('mandatory');

    p.shadow = AC.Property.theme('shadow', p._shadow);
    p.border = AC.Property.theme('border', p._border);
    p.bg = AC.Property.theme('bgColor', p._bg);

    p.opacity = AC.Property.html('opacity', p._opacity);

    p.zoomLevel = AC.Property.html("zoomLevel", p._zoomLevel);
    p.showMarker = AC.Property.html('showMarker', p._showMarker);
    p.googleKey = AC.Property.html('googleKey', p._googleKey);
    p.aspectResize = AC.Property.html('aspectResize', p._updateLayout);

    p.mapStyles = AC.Property.html("mapStyles", p._mapStyles);
    p.latlong = AC.Property.htmlPropBeforeSet("latlong", p._latlongBefore, p._latlong);
    p.mapControls = AC.Property.html("mapControls", p._mapControls);
    p.noScroll = AC.Property.html("noScroll", p._noScroll);
    p.data = AC.Property.html("data", p._data);
    p.value = p.latlong;

    p.markerImage = AC.Property.theme("markerImage", p._markerImage);
    p.strokeColor = AC.Property.theme("strokeColor", p._strokeColor);
    p.strokeOpacity = AC.Property.theme("strokeOpacity", p._strokeOpacity);
    p.strokeWeight = AC.Property.theme("strokeWeight", p._strokeWeight);
    p.fillColor = AC.Property.theme("fillColor", p._fillColor);
    p.fillOpacity = AC.Property.theme("fillOpacity", p._fillOpacity);

    p.adsensePublisherId = AC.Property.html("adsensePublisherId", p._adsensePublisherId);
    p.adsenseFormat = AC.Property.html("adsenseFormat", p._adsenseFormat);
    p.adsensePosition = AC.Property.html("adsensePosition", p._adsensePosition);
    p.adsenseChannelNumber = AC.Property.normal("adsenseChannelNumber", p._adsenseChannelNumber);

    // data
    p.view = AC.Property.normal('view');
    p.fields = AC.Property.normal('fields');
    p.groupby = AC.Property.normal('groupby');
    p.orderby = AC.Property.normal('orderby');
    p.filter = AC.Property.normalPropBeforeSet('filter', p._filterBefore);
    p.resetfilter = AC.Property.normal('resetfilter');
    p.listenview = AC.Property.normal('listenview');
    p.applyview = AC.Property.normal('applyview');
    p.onview = AC.Property.normal('onview');

    widget.onApiLoaded = "E#GoogleMapsAdvanced#onApiLoaded";
    widget.onInitialized = "E#GoogleMapsAdvanced#onInitialized";
    widget.onMapDrawn = "E#GoogleMapsAdvanced#onMapDrawn";
    widget.onOverlayClick = "E#GoogleMapsAdvanced#onOverlayClick";
    widget.onBoundsChanged = "E#GoogleMapsAdvanced#onBoundsChanged";
    widget.onCenterChanged = "E#GoogleMapsAdvanced#onCenterChanged";
    widget.onMapDrag = "E#GoogleMapsAdvanced#onMapDrag";
    widget.onHeadingChanged = "E#GoogleMapsAdvanced#onHeadingChanged";
    widget.onIdle = "E#GoogleMapsAdvanced#onIdle";
    widget.onMapTypeIdChanged = "E#GoogleMapsAdvanced#onMapTypeIdChanged";
    widget.onMapMouseMove = "E#GoogleMapsAdvanced#onMapMouseMove";
    widget.onProjectionChanged = "E#GoogleMapsAdvanced#onProjectionChanged";
    widget.onMapResize = "E#GoogleMapsAdvanced#onMapResize";
    widget.onRightClick = "E#GoogleMapsAdvanced#onRightClick";
    widget.onTilesLoaded = "E#GoogleMapsAdvanced#onTilesLoaded";
    widget.onTiltChanged = "E#GoogleMapsAdvanced#onTiltChanged";
    widget.onZoomChanged = "E#GoogleMapsAdvanced#onZoomChanged";

    widget.OVERLAY_TYPE_MARKER = 0;
    widget.OVERLAY_TYPE_POLYLINE = 1;
    widget.OVERLAY_TYPE_POLYGON = 2;
    widget.OVERLAY_TYPE_CIRCLE = 3;
    widget.OVERLAY_TYPE_RECTANGLE = 4;

    widget.inlineEditPropName = function() {
        return "data";
    };

    var props = [
            { name: AC.Property.group_names.general, props:[
                AC.Property.general.widgetClass,
                AC.Property.general.name,
                {name: "googleKey", type : "gmapkeysdata", get: "googleKey", set: "googleKey", alias : "widget_gmap_googlekey"},
                {name: "latlong", type : "gmlatlong", get: "latlong", set: "latlong", alias : "widget_gmap_latlong"},
                {name: "showMarker", type : "boolean", get: "showMarker", set: "showMarker", alias : "widget_gmap_showmarker"},
                {name: "zoomLevel", type : "gmzoomlevel", get: "zoomLevel", set: "zoomLevel", alias : "widget_gmap_zoomlevel"},
                {name: "noScroll", type : "boolean", get: "noScroll", set: "noScroll", alias : "widget_gmap_no_scroll"},
                {name: "mapControls", type : "gmControls", get: "mapControls", set: "mapControls", alias : "widget_gmap_mapcontrols"}
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
            { name: AC.Property.group_names.style, props:[
                AC.Property.behavior.opacity,
                AC.Property.style.border,
                AC.Property.style.shadow,
                AC.Property.style.margin,
                AC.Property.style.bgColor,
                AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
            ]},
            { name: "widget_gmap_markerStyle", props:[
                {name: "defaultMarkerImage", type : "resource", get: "markerImage", set: "markerImage", alias : "widget_gmap_marker_image"}
            ]},
            { name: "widget_gmap_overlayStyle", props:[
                {name: "strokeColor", type : "color", get: "strokeColor", set: "strokeColor", alias : "widget_gmap_stroke_color"},
                {name: "strokeOpacity", type : "opacityF", get: "strokeOpacity", set: "strokeOpacity", alias : "widget_gmap_stroke_opacity"},
                {name: "strokeWeight", type : "pixels", get: "strokeWeight", set: "strokeWeight", alias : "widget_gmap_stroke_weight"},
                {name: "fillColor", type : "color", get: "fillColor", set: "fillColor", alias : "widget_gmap_fill_color"},
                {name: "fillOpacity", type : "opacityF", get: "fillOpacity", set: "fillOpacity", alias : "widget_gmap_fill_opacity"}
            ]},
            { name: "widget_gmap_adsense", props:[
                {name: "adsensePublisherId", type : "text", get: "adsensePublisherId", set: "adsensePublisherId", alias : "widget_gmap_adsense_publisher_id"},
                {name: "adsenseChannelNumber", type : "text", get: "adsenseChannelNumber", set: "adsenseChannelNumber", alias : "widget_gmap_adsense_channel_number"},
                {name: "adsenseFormat", type : "adsenseformat", get: "adsenseFormat", set: "adsenseFormat", alias : "widget_gmap_adsense_format"},
                {name: "adsensePosition", type : "adsensepos", get: "adsensePosition", set: "adsensePosition", alias : "widget_gmap_adsense_position"}
            ]}
        ],
        defaultProps = {width: "200", height: "200", x : "100", y: "100", zindex : "auto",
                anchors : {left: true, top: true, bottom: false, right: false}, visible : true,
                opacity : 1, name: "googleMapsAdvanced1",
                latlong: [37.4419, -122.1419], mapControls: {useDefaultControls:true}, data: {},
                strokeColor: "#00000",strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#FF0000", fillOpacity: 0.35,
                zoomLevel: 12, widgetStyle: "default", showMarker:false, noScroll: false,
                adsensePublisherId: '', adsenseFormat: "HALF_BANNER", adsensePosition: "TOP_CENTER",
                googleKey : {}, enable: true,
                margin: "", alignInContainer: 'left',
                dragAndDrop: false, customCssClasses: "",
                resizing: false,
                aspectResize: false
            },
        lng = {"en" : {
            widget_name_gmapsadvanced: "Google Maps Advanced",
            widget_gmap_googlekey: "Google Api Key",
            widget_name_gmap: "Google Maps",
            widget_gmap_showmarker: "Show Marker",
            widget_gmap_zoomlevel: "Zoom",
            widget_gmap_hostname: "Host Name",
            widget_gmap_apikey: "Google Map Key",
            widget_gmap_apikeys: "Api Keys",
            widget_gmap_noapikey: "Haven't Google Api Keys for this domain '",
            widget_gmap_edit_gapikeyprop: "' please edit property 'Google Api Key'",
            widget_gmap_marker_image: "Default Marker Image",
            widget_gmap_gloc_failed: "Geolocation service failed.",
            widget_gmap_gloc_browser_failed: "Your browser doesn't support geolocation.",
            widget_gmap_event_onapiloaded: "OnApiLoaded",
            widget_gmap_event_oninitialized: "onInitialized",
            widget_gmap_event_onmapdrawn: "onMapDrawn",
            widget_gmap_event_onoverlayclick: "onOverlayClick",
            widget_gmap_event_on_bounds_changed: "onBoundsChanged",
            widget_gmap_event_on_center_changed: "onCenterChanged",
            widget_gmap_event_on_map_drag: "onMapDrag",
            widget_gmap_event_on_heading_changed: "onHeadingChanged",
            widget_gmap_event_on_idle: "onIdle",
            widget_gmap_event_on_maptypeid_changed: "onMapTypeIdChanged",
            widget_gmap_event_on_map_mousemove: "onMapMouseMove",
            widget_gmap_event_on_projection_changed: "onProjectionChanged",
            widget_gmap_event_on_map_resize: "onMapResize",
            widget_gmap_event_on_rightclick: "onRightClick",
            widget_gmap_event_on_tilesloaded: "onTilesLoaded",
            widget_gmap_event_on_tilt_changed: "onTiltChanged",
            widget_gmap_event_on_zoom_changed: "onZoomChanged",
            widget_gmap_latlong: "Lat&Lng",
            widget_gmap_mapcontrols: "Map Controls",
            widget_gmap_markerStyle: "Marker Style",
            widget_gmap_overlayStyle: "Default Overlay Style",
            widget_gmap_stroke_color: "Stroke Color",
            widget_gmap_stroke_opacity: "Stroke Opacity",
            widget_gmap_stroke_weight: "Stroke Weight",
            widget_gmap_fill_color: "Fill Color",
            widget_gmap_fill_opacity: "Fill Opacity",
            widget_gmap_geocode_error: "Geocode was not successful for the following reason",
            widget_gmap_direction_service_error: "Direction service was not successful for the following reason",
            widget_gmap_adsense: "AdSense",
            widget_gmap_adsense_publisher_id: "Publisher ID",
            widget_gmap_adsense_format: "Format",
            widget_gmap_adsense_position: "Position",
            widget_gmap_adsense_channel_number: "Channel Number",
            widget_gmap_overlay_type: "Overlay type",
            widget_gmap_coords: "Coords",
            widget_gmap_radius: "Radius",
            widget_gmap_mouseOverHTML: "mouseOverHTML",
            widget_gmap_onClickHTML: "onClickHTML",
            widget_gmap_markerImageURL: "Marker Image URL",
            widget_gmap_no_scroll: "No Scroll"
        }};

    // method to get access to static values
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
        return {};
    };

    /**
     * Return default widget prop
     * @return {Object} default properties
     */
    widget.defaultProps = function() {
//        var wfApp = WiziCore_AppContext.getInstance();
//        if (wfApp != undefined) {
//            try {
//                var key = wfApp.config().googleApiKey();
//                if (key != undefined && key != null) {
//                    defaultProps.googleKey = key;
//                }
//            } catch(e) {
//            }
//        }
        return defaultProps;
    };

    widget.actions = function() {
        var ret = {
//            onApiLoaded: {alias: "widget_gmap_event_onapiloaded", funcview: "onApiLoaded", action: "AC.Widgets.GoogleMapsAdvanced.onApiLoaded", params: "", group: "widget_event_general"},
            onInitialized: {alias: "widget_gmap_event_oninitialized", funcview: "onInitialized", action: "AC.Widgets.GoogleMapsAdvanced.onInitialized", params: "", group: "widget_event_general"},
            onMapDrawn: {alias: "widget_gmap_event_onmapdrawn", funcview: "onMapDrawn", action: "AC.Widgets.GoogleMapsAdvanced.onMapDrawn", params: "", group: "widget_event_general"},
            onOverlayClick: {alias: "widget_gmap_event_onoverlayclick", funcview: "onOverlayClick", action: "AC.Widgets.GoogleMapsAdvanced.onOverlayClick", params: "latlng, id", group: "widget_event_general"},
            onBoundsChanged: {alias: "widget_gmap_event_on_bounds_changed", funcview: "onBoundsChanged", action: "AC.Widgets.GoogleMapsAdvanced.onBoundsChanged", params: "", group: "widget_event_general"},
            onCenterChanged: {alias: "widget_gmap_event_on_center_changed", funcview: "onCenterChanged", action: "AC.Widgets.GoogleMapsAdvanced.onCenterChanged", params: "", group: "widget_event_general"},
            onMapDrag: {alias: "widget_gmap_event_on_map_drag", funcview: "onMapDrag", action: "AC.Widgets.GoogleMapsAdvanced.onMapDrag", params: "", group: "widget_event_general"},
            onHeadingChanged: {alias: "widget_gmap_event_on_heading_changed", funcview: "onHeadingChanged", action: "AC.Widgets.GoogleMapsAdvanced.onHeadingChanged", params: "", group: "widget_event_general"},
            onIdle: {alias: "widget_gmap_event_on_idle", funcview: "onIdle", action: "AC.Widgets.GoogleMapsAdvanced.onIdle", params: "", group: "widget_event_general"},
            onMapTypeIdChanged: {alias: "widget_gmap_event_on_maptypeid_changed", funcview: "onMapTypeIdChanged", action: "AC.Widgets.GoogleMapsAdvanced.onMapTypeIdChanged", params: "", group: "widget_event_general"},
            onMapMouseMove: {alias: "widget_gmap_event_on_map_mousemove", funcview: "onMapMouseMove", action: "AC.Widgets.GoogleMapsAdvanced.onMapMouseMove", params: "latlng", group: "widget_event_general"},
            onProjectionChanged: {alias: "widget_gmap_event_on_projection_changed", funcview: "onProjectionChanged", action: "AC.Widgets.GoogleMapsAdvanced.onProjectionChanged", params: "", group: "widget_event_general"},
            onMapResize: {alias: "widget_gmap_event_on_map_resize", funcview: "onMapResize", action: "AC.Widgets.GoogleMapsAdvanced.onMapResize", params: "", group: "widget_event_general"},
            onRightClick: {alias: "widget_gmap_event_on_rightclick", funcview: "onRightClick", action: "AC.Widgets.GoogleMapsAdvanced.onRightClick", params: "latlng", group: "widget_event_general"},
            onTilesLoaded: {alias: "widget_gmap_event_on_tilesloaded", funcview: "onTilesLoaded", action: "AC.Widgets.GoogleMapsAdvanced.onTilesLoaded", params: "", group: "widget_event_general"},
            onTiltChanged: {alias: "widget_gmap_event_on_tilt_changed", funcview: "onTiltChanged", action: "AC.Widgets.GoogleMapsAdvanced.onTiltChanged", params: "", group: "widget_event_general"},
            onZoomChanged: {alias: "widget_gmap_event_on_zoom_changed", funcview: "onZoomChanged", action: "AC.Widgets.GoogleMapsAdvanced.onZoomChanged", params: "", group: "widget_event_general"}
        };
        // append base actions
        ret = jQuery.extend(AC.Widgets.Base.actions(), ret);

        (ret.click != undefined) ? ret.click.params = "latlng" : null;
        (ret.dbclick != undefined) ? ret.dbclick.params = "latlng" :null;
        (ret.mouseenter != undefined) ? ret.mouseenter.params = "latlng" : null;
        (ret.mouseleave != undefined) ? ret.mouseleave.params = "latlng" : null;

        return ret;
    };

    widget.langs = function() {
        return lng;
    };

    AC.Core.lang().registerWidgetLang(lng);

//AC.Core.Widgets().registerWidget("GoogleMapsAdvanced", "sections_extensible", "widget_name_gmapsadvanced", "widget_name_gmapsadvanced", "gmapsadvanced",
//        "wiziCore/extWidgets/googleMaps/googleMaps.png");

/* Types */

if (AC.designerMode) {
    (function(gType){
    /**
     * LatLng
     */
    gType.gmlatlong = function(cell) {
        this.cell(cell);
        this._canEmpty = false;

        this.setValue = function(val) {
            if (val == undefined) {
                val = "";
            }
            var viewVal = val;
            if (val[0] != undefined && val[1] != undefined) {
                viewVal = val[0] + " : " + val[1];
            }
            this.setCValue(viewVal);
            this.sValue = val;
        };

        this.edit = function() {
            var self = this;
            var val = this.getValue();
            //clear cell

            var input1 = $("<input type='text' class='simple-grid-combo' style='width : 100%;'>");
            var input2 = $("<input type='text' class='simple-grid-combo' style='width : 45%;'>");
            $([input1, input2]).bind("change focusout", function(){
                if (!input1.is(":focus") && !input2.is(":focus")){
                    self.editStop();
                }
            });

            this.cell().empty().append(input1);
            input1.css("width", "45%");
            this.cell().append(" : ");
            this.cell().append(input2);
            if (!$.isArray(val)) {
                val = [val];
            }
            input1.val(val[0]);
            input2.val(val[1]);
            //stop event
            $(input1).click(function(ev) {
                ev.stopPropagation();
            });
            $(input2).click(function(ev) {
                ev.stopPropagation();
            });

            var paramsLat = {
                min : -90,
                max: 90,
                isFloat: true
            };
            var paramsLng = {
                min : -180,
                max: 180,
                isFloat: true
            };

            input1.numericParse(paramsLat);
            input2.numericParse(paramsLng);
            this.input1 = input1;
            this.input2 = input2;
            input1.focus();
            input1.select();
        };

        this.getNewValue = function() {
            var ret = this.getValue();
            if (this.input1){
                ret = [];
                ret[0] = parseFloat(this.input1.val());
                ret[0] = (this._canEmpty === false && isNaN(ret[0])) ? 0 : ret[0];
                this.input1.remove();
                this.input1 = undefined;

                ret[1] = parseFloat(this.input2.val());
                ret[1] = (this._canEmpty === false && isNaN(ret[1])) ? 0 : ret[1];
                this.input2.remove();
                this.input2 = undefined;
            }
            return ret;
        }
    };
    gType.gmlatlong.prototype = new gType.baseType;

    })(jqSimpleGrid.types);
}
})(jQuery,window,document);
