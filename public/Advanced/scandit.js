(function($, window, document, undefined){

    // This top section should always be present
    var widget = AC.Widgets.Scandit= function() {
        this.init.apply(this, arguments);
    };

    AC.extend(widget, AC.Widgets.FancyButton);

    var p = widget.prototype;

    // Define the widget Class name
    p._widgetClass = "Scandit";

    /**
     * Constructor
     * @class  Constructor / Destructor below
     * @constructs
     */
    p.init = function() {
        widget._sc.init.apply(this, arguments);
    };

    // click events handling
    p.onClick = function(ev) {
        var triggerEvent = new $.Event(AC.Widgets.WiziCore_Widget_Base.onClick);
        acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", this.id()); // debug logs
        $(this).trigger(triggerEvent, [ev]);
        (!triggerEvent.isPropagationStopped()) && scan.call(this);
    };

    p.scan = function() {
        scan.call(this);
    };

    p.scanSuccess = function() {
        this.form().twirlyThing(this.form(), false);
        var triggerEvent = new $.Event(widget.onSuccess);
        $(this).trigger(triggerEvent, arguments);
    };

    p.scanFail = function() {
        this.form().twirlyThing(this.form(), false);
        var triggerEvent = new $.Event(widget.onFail);
        $(this).trigger(triggerEvent, arguments);
    };

    function scan() {
        var key = this.appKey();
        if (key == "") {
            WiziCore_Helper.showError('No Scandit key found', 'No Scandit key found. Please sign up at www.scandit.com and get your development key from there.', 99);
            return;
        }
        var params = generateParams.call(this);
        if (!(window['plugins'] && window.plugins['ScanditSDK'])) {
            WiziCore_Helper.showError('Scandit is not available.', 'Scandit plugin is not available. Please check that the app was built using AC Mobile Build and the plugin is enabled.', 99);
            return;
        }
        this.form().twirlyThing(this.form(), true);
        window.plugins.ScanditSDK.scan($.proxy(p.scanSuccess, this), $.proxy(p.scanFail, this), key, params);
    }

    function generateParams() {
        var params  = {};
        params['vibrate'] = !!(this.vibrate());
        params['1DScanning'] = !!(this.scan1D());
        params['2DScanning'] = !!(this.scan2D());
        if (this.hotspotX() !== undefined && this.hotspotY() != undefined) {
            params['scanningHotspot'] = this.hotspotX() + '/' + this.hotspotY();
        }
        params['beep'] = !!(this.beep());
        params['showMostLikelyUIBarcodeElement'] = !!(this.luckyShot());
        if (this.instructionText() !== undefined) {
            params['textForInitialScanScreenState'] = this.instructionText();
        }
        if (this.searchGoText() !== undefined) {
            params['searchBarActionButtonCaption'] = this.searchGoText();
        }
        if (this.toolbarCancelText() !== undefined) {
            params['toolBarButtonCaption'] = this.toolbarCancelText();
        }
        if (this.scanColor() !== undefined) {
            params['viewfinderColor'] = this.scanColor().replace('#', '');
        }
        if (this.decodedColor() !== undefined) {
            params['viewfinderDecodedColor'] = this.decodedColor().replace('#', '');
        }
        if (this.minLength() !== undefined) {
            params['minSearchBarBarcodeLength'] = this.minLength();
        }
        if (this.maxLength() !== undefined) {
            params['maxSearchBarBarcodeLength'] = this.maxLength();
        }
        return params;
    }


    p.optFn = AC.Property.html('options', p._setProp);

    p.width = AC.Property.html('width', p._setProp);

    p.padding = AC.Property.html('padding', p._setProp);
    p.appKey = AC.Property.normal('appKey');
    p.vibrate = AC.Property.normal('vibrate');
    p.beep = AC.Property.normal('beep');
    p.scan1D = AC.Property.normal('scan1D');
    p.scan2D = AC.Property.normal('scan2D');
    p.hotspotX = AC.Property.normal('hotspotX');
    p.hotspotY = AC.Property.normal('hotspotY');
    p.luckyShot = AC.Property.normal('luckyShot');
    p.instructionText = AC.Property.normal('instructionText');
    p.searchGoText = AC.Property.normal('searchGoText');
    p.toolbarCancelText = AC.Property.normal('toolbarCancelText');
    p.scanColor = AC.Property.normal('scanColor');
    p.decodedColor = AC.Property.normal('decodedColor');
    p.minLength = AC.Property.normal('minLength');
    p.maxLength = AC.Property.normal('maxLength');
    //p.sizes = AC.Property.html('sizes', p._resizing);

    /**
     * Property definitions and then their default values
     */
    var props = [
            { name: AC.Property.group_names.general, props:[
                AC.Property.general.widgetClass,  // required
                AC.Property.general.name,         // required
                {name: "appKey", type : "text",
                    set: "appKey", get: "appKey", alias: "App Key"},
                {name: "vibrate", type : "boolean",
                    set: "vibrate", get: "vibrate", alias: "Vibrate"},
                {name: "beep", type : "boolean",
                    set: "beep", get: "beep", alias: "Beep"},
                {name: "scan1D", type : "boolean",
                    set: "scan1D", get: "scan1D", alias: "Scan 1D"},
                {name: "scan2D", type : "boolean",
                    set: "scan2D", get: "scan2D", alias: "Scan 2D"},
                {name: "hotspotX", type : "float",
                    set: "hotspotX", get: "hotspotX", alias: "Hotspot X"},
                {name: "hotspotY", type : "float",
                    set: "hotspotY", get: "hotspotY", alias: "Hotspot Y"},
                {name: "luckyShot", type : "boolean",
                    set: "luckyShot", get: "luckyShot", alias: "Lucky Shot"},
                {name: "instructionText", type : "text",
                    set: "instructionText", get: "instructionText", alias: "Instruction Text"},
                {name: "searchGoText", type : "text",
                    set: "searchGoText", get: "searchGoText", alias: "Search Go Text"},
                {name: "toolbarCancelText", type : "text",
                    set: "toolbarCancelText", get: "toolbarCancelText", alias: "Toolbar Cancel Text"},
                {name: "scanColor", type : "color",
                    set: "scanColor", get: "scanColor", alias: "Scan Color"},
                {name: "decodedColor", type : "color",
                    set: "decodedColor", get: "decodedColor", alias: "Decoded Color"},
                {name: "minLength", type : "number",
                    set: "minLength", get: "minLength", alias: "Min Length"},
                {name: "maxLength", type : "number",
                    set: "maxLength", get: "maxLength", alias: "Max Length"},

                // Custom props
                { name: "options", type : "fancyDialog", set: "optFn", get: "optFn", alias: "Options" }
            ]},
            { name: AC.Property.group_names.layout, props:[
                AC.Property.layout.x,
                AC.Property.layout.y,
                AC.Property.layout.width,
                AC.Property.layout.height,
                AC.Property.layout.repeat,
                AC.Property.layout.zindex,
                AC.Property.layout.anchors,
                AC.Property.layout.alignInContainer,
                AC.Property.layout.tabindex,
                AC.Property.layout.tabStop
            ]},
            { name: AC.Property.group_names.behavior, props:[
                AC.Property.behavior.visible,
                AC.Property.behavior.enable
            ]},
            { name: AC.Property.group_names.style, props:[
                AC.Property.behavior.opacity,
                AC.Property.style.margin,
                AC.Property.style.customCssClasses,
                AC.Property.style.widgetStyle
            ]}

        ],
        defaultProps = {
            name: "Scandit", value: 1, enable: true, pageJump: 'none', link: '',
            options: { text: 'Button', pushEffect: true },
            x : "100", y: "100", zindex : "auto",
            width:90, height: 39,
            appKey:'',
            scan1D: true,
            scan2D: true,
            hotspotX: '0.5',
            hotspotY: '0.5',
            beep: true,
            vibrate: true,
            luckyShot: true,
            instructionText: "Align code with box",
            searchGoText : "Go",
            toolbarCancelText: "Cancel",
            scanColor: "ffffff",
            decodedColor: "00ff00",
            minLength: "8",
            maxLength: "15",
            margin: "", padding: "", alignInContainer: 'left',
            anchors : { left: true, top: true, bottom: false, right: false },
            visible : true, opacity : 1
        },

        /**
         * Event Handling
         */

            // If you want to just inherit the standard AC Events, then use the following line
            actions = $.extend(true, AC.Widgets.Base.actions(), {
            onSuccess: {alias: "onSuccess", funcview: "onSuccess", action: "AC.Widgets.Scandit.onSuccess", params: "value, type", group: "widget_event_general"},
            onFail: {alias: "onFail", funcview: "onFail", action: "AC.Widgets.Scandit.onFail", params: "error", group: "widget_event_general"}
        }),

    // Lang constants
        lng =  { "en" : {

        } },
        emptyProps = {};

    // onChange event constant definition
    //widget.onChange = "Event#SimpleLabel#onChange";

    // The following lines are required

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    widget.props = function() {
        return props;
    };
    widget.onSuccess = 'W#Scandit#onSuccess';
    widget.onFail = 'W#Scandit#onFail';
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

})(jQuery,window,document);

AC.Core.Widgets().registerWidget("Scandit", "widget_cat_beta", "Scandit Button", "", "", "http://ac-dev.applicationcraft.com/service/Resources/0bdc92b8-9886-4566-9cde-bd2230afb0fd.png");

//
//(function() {
//    window.ScanditSDK = {};
//    window.ScanditSDK.nativeFunction = function(successCallabck, failCallback, key, options) {
//        console.log(key);
//        console.log(options);
//        successCallabck('EAN8|24524534523');
//        failCallback("error");
//    }
//})();