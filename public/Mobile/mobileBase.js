/**
 * @lends       WiziCore_UI_ButtonMobileWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_BaseMobileWidget = AC.Widgets.WiziCore_UI_BaseMobileWidget =  AC.Widgets.Base.extend({
    initProps: function() {
        this._super();
        this._mobileThemeFunc = this.themeProperty('mobileTheme', this._redraw);
    },

    mobileTheme: function() {
        var val = this._mobileThemeFunc.apply(this, arguments);
        val = (val == "" || val === undefined)? 'c': val;
        return val;
    },

    _redraw: function() {

    },

    isMobileWidget: function() {
        return true;
    },

    checkEmptyLabel: function(label){
        if (label == undefined || (label.trim && label.trim() == "")){
            label = "&nbsp;";
        }
        return label;
    },

    getUserIconResource: function(icon){
        var res = false;
        if (typeof icon == "object" && icon.opt == "image-select" && icon.val != undefined){
            res = icon.val;
        } else if (icon && (icon.indexOf("http:") == 0 || icon.indexOf("https:") == 0 || icon.indexOf(".") >= 0)){
            res = icon;
        }
        return res;
    },

    _getJQMOptions: function() {
        var opts = {theme: this.mobileTheme()};
        var mobilePerfomance = WiziCore_Helper.isMobile();
        opts.mobilePerfomance = mobilePerfomance;
        return opts;
    },

    onPageDrawn: function() {
        if (this.mode() == WiziCore_Visualizer.RUN_MODE) {
            this.base().css('overflow', "visible"); // for correct showing focus shadow
        }
        this._super.apply(this, arguments);
        this._redraw();
    }
});
})(jQuery,window,document);