/**
 * @lends       WiziCore_UI_SliderVWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_SliderVWidget = AC.Widgets.WiziCore_UI_SliderVWidget =  AC.Widgets.WiziCore_UI_SliderWidget.extend({
    _widgetClass: "WiziCore_UI_SliderVWidget"
});

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_SliderVWidget.inlineEditPropName = function() {
    return "values";
};

var _props = AC.Widgets.WiziCore_UI_SliderWidget.props();

/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_SliderVWidget.props = function() {
    return _props;
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_SliderVWidget.actions = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_SliderWidget.actions(), ret);
    WiziCore_UI_SliderVWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderVWidget.defaultProps = function() {

    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_SliderWidget.defaultProps(), ret);
    ret.orientation = "vertical";
    ret.name = "sliderV1";
    ret.height = 200;
    ret.width = 25;
    return ret;
};

/**
 * Return widget resize properties
 * @return {Object} default properties
 */
WiziCore_UI_SliderVWidget.resizeProperties = function() {
    var ret = {handles: "s"};
    return ret;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderVWidget.emptyProps = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_SliderWidget.emptyProps(), ret);
    return ret;
};

WiziCore_UI_SliderVWidget.isField = function() {return true;};
})(jQuery,window,document);