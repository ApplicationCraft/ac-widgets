(function($, windows, document, undefined){

    // This top section should always be present
    var widget = WiziCore_UI_FancyButton = AC.Widgets.FancyButton = AC.Widgets.WiziCore_UI_FancyButton = function() {
        this.init.apply(this, arguments);
    };

    AC.extend(widget, AC.Widgets.Base);

    var p = widget.prototype;

    AC.copyExtension(p, WiziCore_Methods_Widget_ActionClick);

    // Define the widget Class name
    p._widgetClass = "FancyButton";

    /**
     * Constructor
     * @class  Constructor / Destructor below
     * @constructs
     */
    p.init = function() {
        widget._sc.init.apply(this, arguments);
    };

    p.destroy = function() {
        widget._sc.destroy.apply(this, arguments);
    };

    // click events handling
    p.onClick = function(ev) {
        var self = this;
        setTimeout(function(){
            var triggerEvent = new $.Event(AC.Widgets.WiziCore_Widget_Base.onClick);
            acDebugger.systemLog("triggerEvent", triggerEvent, "self.id()", self.id()); // debug logs
            $(self).trigger(triggerEvent, [ev]);
            (!triggerEvent.isPropagationStopped()) && self.onActionClick(ev, self.pageJump());
        }, 0);
    };

    /**
     * Widget draw function
     */
    p.draw = function() {
        var that = this;
        this._link = $('<a href="#"></a>');
        this._updateLink(this.link());
        this.base().html(this._link);
        widget._sc.draw.apply(this, arguments); // call parent class draw method (required)
        function setProp() {
            this._setProp();
        }
        function checkSetPropUsage(){
                    if (that.base().is(":visible")) {
                        setProp.call(that);
                    }
                    else {
                        setTimeout(checkSetPropUsage, 10);
                    }
                }
        checkSetPropUsage();
    };

    /**
     * Widget methods implementation
     */

    p._updateLayout = function(){
        widget._sc._updateLayout.apply(this, arguments);
        var options = this.optFn();
        if (options.image){
            this._fixImageSize();
        }
        if (this.parent().getLayoutType() == 'absolute'){
            return;
        }
        if (!options.image){
            switch (options.shape){
                case 'circle':
                    this.tableBase().css({"min-width": "60px", "min-height": "60px"});
                    break;
                case 'rounded':
                    this.tableBase().css({"min-width": "76px", "min-height": "37px"});
                    break;
                case 'rectangle':
                    this.tableBase().css({"min-width": "76px", "min-height": "37px"});
                    break;
                case 'triangle-n':
                    this.tableBase().css({"min-width": "74px", "min-height": "77px"});
                    break;
                case 'triangle-e':
                    this.tableBase().css({"min-width": "74px", "min-height": "77px"});
                    break;
                case 'triangle-s':
                    this.tableBase().css({"min-width": "74px", "min-height": "77px"});
                    break;
                case 'triangle-w':
                    this.tableBase().css({"min-width": "74px", "min-height": "77px"});
                    break;
                case 'ios-w':
                    this.tableBase().css({"min-width": "84px", "min-height": "35px"});
                    break;
                case 'ios-e':
                    this.tableBase().css({"min-width": "84px", "min-height": "35px"});
                    break;
                default:
                    this.tableBase().css({"min-width": "76px", "min-height": "37px"}); //same as rectangle
                    break;
            }
        }
    }

    p._fixImageSize = function(){
        this._link.find("img").css({"max-width": this.width()});
        this._link.find("img").css({"max-height": this.height()});
    },

    p._setProp = function() {
        this._link.fancy('destroy').fancy($.extend({}, { width: this.width()/*, padding: this.padding()*/ }, this.optFn()));
        this._fixImageSize();
    }

    p.optFn = AC.Property.html('options', p._setProp);

    p.link = AC.Property.html('link', p._updateLink);

    p.pageJump = AC.Property.normal('pageJump');

    p.width = AC.Property.html('width', p._setProp);

    p.opacity = AC.Property.theme('opacity', p._opacity);

    p._opacity = function(){
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE){
            this._setProp();
        }
        widget._sc._opacity.apply(this, arguments);
    };

    p.initDomState = function () {
        widget._sc.initDomState.apply(this, arguments);
        this.optFn(this.optFn());
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
                //AC.Property.layout.sizes,
                AC.Property.layout.width,
                AC.Property.layout.height,
                AC.Property.layout.repeat,
                AC.Property.layout.zindex,
                AC.Property.layout.anchors,
                AC.Property.layout.alignInContainer
            ]},
            { name: AC.Property.group_names.behavior, props:[
                AC.Property.behavior.visible
            ]},
            { name: AC.Property.group_names.style, props:[
                AC.Property.behavior.opacity
                //AC.Property.style.margin,
                //AC.Property.style.padding
            ]}

        ],
        defaultProps = {
            name: "FancyButton", value: 1, enable: true, pageJump: 'none', link: '',
            options: { text: 'Button', pushEffect: true },
            x : "100", y: "100", zindex : "auto",
            width:76, height: 30,
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
    };
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
