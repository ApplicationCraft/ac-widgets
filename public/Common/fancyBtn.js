(function($, window, document, undefined){

    // This top section should always be present
    var widget = WiziCore_UI_FancyButton = AC.Widgets.FancyButton = AC.Widgets.WiziCore_UI_FancyButton = function() {
        this.init.apply(this, arguments);
    };

    AC.extend(widget, AC.Widgets.Base);

    var p = widget.prototype;

    AC.copyExtension(p, WiziCore_Methods_Widget_ActionClick);

    // Define the widget Class name
    p._widgetClass = "FancyButton";
    p._cont = null;
    p._widgetDestroyed = false;
    p._setPropTimeoutId = -1;
    p._isRendered = false;
    /**
     * Constructor
     * @class  Constructor / Destructor below
     * @constructs
     */
    p.init = function() {
        widget._sc.init.apply(this, arguments);
    };

    p.onRemove = function(){
        $(window).unbind('orientationchange.' + this.id());
    };

    p.onDestroy = function() {
        this._widgetDestroyed = true;
    };

    // click events handling
    p.onClick = function(ev) {
        var self = this,
            id = this.id(),
            pageJump = self.pageJump(),
            app = this.form();
        setTimeout(function(){
            var triggerEvent = new $.Event(AC.Widgets.WiziCore_Widget_Base.onClick);
            acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", id); // debug logs
            $(self).trigger(triggerEvent, [ev]);
            (!triggerEvent.isPropagationStopped()) && self.onActionClick(ev, pageJump, app);
        }, 0);
    };

    /**
     * Widget draw function
     */
    p.draw = function() {
        var that = this,
            app = this.form();

        $(window).bind('orientationchange.' + this.id(), _orientationHandler);

        function _orientationHandler() {
            setTimeout(function() {
                if (app && !app.isDestroyed()){
                    that._setProperty();
                }
            }, 400);
        }

        this._cont = $("<div style='width:100%;position: relative; overflow: hidden' />");
        this._link = $('<a href="#"></a>');
        this._updateLink(this.link());
//        this.base().html(this._link);
        this._cont.append(this._link);
        this.base().prepend(this._cont);
        widget._sc.draw.apply(this, arguments); // call parent class draw method (required)
    };

    /**
     * Widget methods implementation
     */

    p._updateLayout = function(){
        widget._sc._updateLayout.apply(this, arguments);
        if (this._cont)
            this._cont.height(this.height());

        var options = this.optFn();
        if (options.image){
            this._fixImageSize();
        }

        if (this.parent().getLayoutType() == 'absolute'){
            return;
        }
        if (!options.image && this._cont){
            var cont = this.tableBase(), mw, mh;

            switch (options.shape){
                case 'circle':
                    mw = 69;
                    mh = 69;
                    break;
                case 'rounded':
                case 'rectangle':
                    mw = 84;
                    mh = 37;
                    break;
                case 'triangle-n':
                case 'triangle-e':
                case 'triangle-s':
                case 'triangle-w':
                    mw = 82;
                    mh = 81;
                    break;
                case 'ios-w':
                case 'ios-e':
                    mw = 87;
                    mh = 37;
                    break;
                default:
                    mw = 84;
                    mh = 37;
                    break;
            }
            cont.css({"min-width": mw + "px", "min-height": mh + "px"});
            if (cont.width() < mw)
                cont.width(mw + 'px');

            if (cont.height() < mh) {
                cont.height(mh + 'px');
            }

            if (this._cont.height() < mh) {
                this._cont.height(mh + 'px');
            }
        }

        this._setProp();
    };

    p.onContainerChangeLayout = function(layout) {
        if (layout != undefined)
            this._setProp();
    };

    p._enable = function(flag) {
        this.showEnableDiv(flag);
        this._zindex(2, this._enableDiv);
    };

    p._fixImageSize = function(){
        var width = 0, height;
        if (this.pWidth() == "" || this.pWidth() === undefined){
            width = this.width();
        } else {
            width = this.tableBase().width();
        }

        width = Math.max(this.base().width(), width);
        height = Math.max(this.base().height(), this.height());

        this._link.find("img").css({"max-width": width});
        this._link.find("img").css({"max-height": height});
    };

    p._setProp = function() {
        if (!this.visible() && this.mode() != WiziCore_Visualizer.EDITOR_MODE)
            return;

        if (this.base().is(":visible")) {
            this._setProperty();
        } else {
            if (this._setPropTimeoutId == -1) {
                var self = this;
                this._setPropTimeoutId = setTimeout(function() {
                    self._setProp();
                }, 10);
            }
        }
    };

    p._setProperty = function() {
        if (this._setPropTimeoutId != -1)
            clearTimeout(this._setPropTimeoutId);

        this._setPropTimeoutId = -1;

        var width = 0;
        if (this.pWidth() == "" || this.pWidth() === undefined){
            width = this.width();
        } else {
            width = this.tableBase().width();
        }
        this._link.fancy('destroy').fancy($.extend({}, { width: width - 2/*, padding: this.padding()*/ }, this.optFn()));
        this._fixImageSize();
        this._updateEnable();
        this._isRendered = true;
    };

    p.optFn = AC.Property.html('options', p._setProperty);
    p.link = AC.Property.html('link', p._updateLink);
    p.pageJump = AC.Property.normal('pageJump');
    p.width = AC.Property.html('width', p._setProperty);
    p.opacity = AC.Property.theme('opacity', p._opacity);

    p._opacity = function(){
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE){
            this._setProperty();
        }
        widget._sc._opacity.apply(this, arguments);
    };

    p._visible = function(value) {
        widget._sc._visible.apply(this, arguments);
        if (!this._isRendered)
            this._setProp();
    };

    p.initDomState = function () {
        widget._sc.initDomState.apply(this, arguments);
        this.optFn(this.optFn());
        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
    };

    //p.padding = AC.Property.html('padding', p._setProp);

    //p.sizes = AC.Property.html('sizes', p._resizing);

    /**
     * Property definitions and then their default values
     */
    var props = [
            { name: AC.Property.group_names.general, props:[
                AC.Property.general.widgetClass,  // required
                AC.Property.general.name,         // required
                AC.Property.general.link,
                AC.Property.general.pageJump,
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
            name: "FancyButton", value: 1, enable: true, pageJump: 'none', link: '',
            options: { text: 'Button', pushEffect: true },
            x : "100", y: "100", zindex : "auto",
            width:84, height: 37,
            dragAndDrop: false, resizing: false, tabStop: true,
            margin: "", padding: "", alignInContainer: 'left',
            anchors : { left: true, top: true, bottom: false, right: false },
            visible : true, opacity : 1
        },

        /**
         * Event Handling
         */

            // If you want to just inherit the standard AC Events, then use the following line
    actions = {
        click : {alias : "widget_event_onclick", funcview : "onClick", action : "AC.Widgets.Base.onClick", params : "mouseev", group : "widget_event_mouse"},
        dbclick : {alias : "widget_event_ondblclick", funcview : "onDbClick", action : "AC.Widgets.Base.onDbClick", params : "mouseev", group : "widget_event_mouse"},
        mousedown : {alias : "widget_event_onmousedown", funcview : "onMouseDown", action : "AC.Widgets.Base.onMouseDown", params : "mouseev", group : "widget_event_mouse"},
        mouseup : {alias : "widget_event_onmouseup", funcview : "onMouseUp", action : "AC.Widgets.Base.onMouseUp", params : "mouseev", group : "widget_event_mouse"},
        mouseenter : {alias : "widget_event_onmouseenter", funcview : "onMouseEnter", action : "AC.Widgets.Base.onMouseEnter", params : "mouseev", group : "widget_event_mouse"},
        mouseleave : {alias : "widget_event_onmouseleave", funcview : "onMouseLeave", action : "AC.Widgets.Base.onMouseLeave", params : "mouseev", group : "widget_event_mouse"}
        },
    //AC.Widgets.Base.actions(),

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
