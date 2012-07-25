/**
 * @lends       WiziCore_UI_SliderHWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_SliderHWidget = AC.Widgets.WiziCore_UI_SliderHWidget =  AC.Widgets.WiziCore_UI_SliderWidget.extend({
    _widgetClass: "WiziCore_UI_SliderHWidget"
});

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_SliderHWidget.inlineEditPropName = function() {
    return "values";
};

var _props = AC.Widgets.WiziCore_UI_SliderWidget.props();
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_SliderHWidget.props = function() {
    return _props;
};

/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_SliderHWidget.actions = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_SliderWidget.actions(), ret);
    WiziCore_UI_SliderHWidget.actions = function(){return ret};
    return ret;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderHWidget.defaultProps = function() {
    var ret = {};
    ret = jQuery.extend(AC.Widgets.WiziCore_UI_SliderWidget.defaultProps(), ret);
    ret.orientation = "horizontal";
    ret.name = "sliderH1";
    ret.pWidth = "";
    return ret;
};

/**
 * Return widget resize properties
 * @return {Object} default properties
 */
WiziCore_UI_SliderHWidget.resizeProperties = function() {
    var ret = {handles: "e"};
    return ret;
};

/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_SliderHWidget.emptyProps = function() {
    var ret = {};
    ret = $.extend(AC.Widgets.WiziCore_UI_SliderWidget.emptyProps(), ret);
    return ret;
};

WiziCore_UI_SliderHWidget.isField = function() {return true;};
})(jQuery,window,document);
