(function($, window, document, undefined){
    var w = AC.Widgets.Mobiscroll = function() {
        this.init.apply(this, arguments);
    };

    AC.extend(w, AC.Widgets.WiziCore_UI_BaseMobileWidget);
    var p = w.prototype;
    AC.copyExtension(p, WiziCore_WidgetAbstract_DataIntegrationSimple);

    p._widgetClass = "Mobiscroll";
    p._input = null;
    p._dataPropName = "dateValue";
    p._valueDefaultPropName = "dateValue";
    p._currentDateValue = null;
    p._isDateSelected = false;

    /**
     * Description of constructor
     * @class       Some words about mobiscroll widget class
     * @author      Mikhail Loginov
     * @version     0.1
     *
     * @constructs
     */
    p.init = function() {
        w._sc.init.apply(this, arguments);
    };

    p.initProject = function(json) {
        w._sc.initProject.apply(this, arguments);
        this._currentDateValue = (this._project['dateValue']) ? new Date(this._project['dateValue']) : null;

        if (this._currentDateValue)
            this._isDateSelected = true;
    };

    p.project = function(json) {
        var retVal = w._sc.project.apply(this, arguments);

        if (this._currentDateValue)
            retVal['dateValue'] = this._currentDateValue.toString();

        return retVal;
    };

    p.draw = function() {
        var cnt = $('<div>');
        this.base().append(cnt);
        this._cnt = cnt;
        w._sc.draw.apply(this, arguments);
    };

    p._redraw = function() {
        this._cnt.empty();
        var div = $("<div data-role='fieldcontain'/>");
        this._div = div;
        var htmlId = this.htmlId();

        var input = $("<input type='text' class='mobiscroll' />");
        this._input = input;
        input.attr("id", htmlId + "_mobiscroll");
        input.attr("name", htmlId + "_mobiscroll");
        input.css("width", "100%");
        var cnt = $('<div style="padding-right: 15px;"></div>');
        input.css("margin", "0 auto");
        cnt.append(input);
        div.append(cnt);

        this._cnt.prepend(div);

        input.textinput(this._getJQMOptions());

        var self = this,
            timeFormat = this.ampm() ? 'hh:ii A' : 'HH:ii',
            timeWheels = this.ampm() ? 'hhiiA' : 'HHii',
            dateOrder = getDateOrder(this.dateFormat());

        input.scroller({preset: this.preset(),
                        timeWheels: timeWheels,
                        timeFormat: timeFormat,
                        mode: this.scrollerMode(),
                        theme: this.scrollerTheme(),
                        dateFormat: this.dateFormat(),
                        onSelect: function() { self._onMobiscrollSelect(); }
            });

        if (dateOrder != null)
            input.scroller('option', {dateOrder: dateOrder});

        this._updateYear(null);
        this._updateEnable();
        this._updateWidthOfInput();
        this._dateValue(this._currentDateValue);
    };

    p.clearData = function() {
        this._currentDateValue = null;
        this._isDateSelected = false;

        if (this._input)
            this._input.val('');

        //this._redraw();
    };

    p._shadow = function(val){
        w._sc._shadow.apply(this, [val, this._input]);
    };

    p._updateWidthOfInput = function(){
        var inp = this._input;
        if (inp){
            if (this.getContainerLayoutType() == WiziCore_Widget_Layout.LAYOUT_TYPES.Absolute){
                inp.width(this.width());
                inp.parent().css("padding-right", "");
            } else {
                inp.width("100%");
                inp.parent().css("padding-right", "15px");
            }
        }
    };

    p.onContainerChangeLayout = function(){
        this._updateWidthOfInput();
    };

    p.onDestroy = function() {
        if (this._input)
            this._input.scroller('destroy');
    };

    p.initDomState = function() {
        w._sc.initDomState.call(this);
        this.initDomStatePos();
        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._dateValue(this._currentDateValue);
    };

    p._onMobiscrollSelect = function() {
        this._isDateSelected = true;
        this._currentDateValue = this._input.scroller('getDate');
        $(this).trigger(AC.Widgets.Mobiscroll.onSelectValue, [this._currentDateValue]);
    };

    p.dateValue = function(val) {
        var res;

        if (val !== undefined) {
            if (val == null || val == ""){
                this.clearData();
            } else {
                this._dateValue(val);
            }
        }

        if (this._isDrawn && this._input && this._isDateSelected)
            res = this._input.scroller('getDate');
        else
            res = this._currentDateValue;

        return res;
    };

    p._dateValue = function(val) {
        if (val != undefined) {
            var date;
            if (typeof val == "string")
                date = new Date(val);
            if (typeof val == "object" && typeof val["getTime"] == "function")
                date = val;

            if (date && !isNaN(date.getTime())) {
                this._isDateSelected = true;
                if (this._isDrawn || this._input) {
                    this._input.scroller('setDate', date, true);
                    this._currentDateValue = this._input.scroller('getDate');
                } else
                    this._currentDateValue = date;
            }
        }
    };

    p._enable = function(val) {
        if (this._input) {
            val = (val === true) ? "enable" : "disable";
            this._input.scroller(val);
            this._input.textinput(val);
        }
    };

    p._preset = function(val) {
        if (val != undefined && this._input) {
            var dateOrder = getDateOrder(val);
            if (dateOrder != null)
                this._input.scroller('option', {dateOrder: dateOrder});

            this._input.scroller('option', {preset: val});
            this._dateValue(this._currentDateValue);
        }
    };

    function getDateOrder(value) {
        var dateOrder = null;
        if (value) {
            var dIndex = value.search(/[dD]/),
                mIndex = value.search(/[mM]/),
                yIndex = value.search(/[yY]/);

            dateOrder = [];
            dateOrder[dIndex] = 'dd';
            dateOrder[mIndex] = 'mm';
            dateOrder[yIndex] = 'y';
            dateOrder = dateOrder.join('');
        }

        return dateOrder;
    }

    p._ampm = function(val) {
        if (val != undefined && this._input) {
            val = val === true;
            var timeFormat = val ? 'hh:ii A' : 'HH:ii',
                timeWheels = this.ampm() ? 'hhiiA' : 'HHii';
            this._input.scroller('option', {'timeWheels': timeWheels, timeFormat: timeFormat});
            this._dateValue(this._currentDateValue);
        }
    };

    p._scrollerMode = function(val) {
        if (val != undefined && this._input) {
            this._input.scroller('option', {'mode': val});
        }
    };

    p._scrollerTheme = function(val) {
        if (val != undefined && this._input) {
            this._input.scroller('option', {'theme': val});
        }
    };

    p._dateFormat = function(val) {
        if (val != undefined && this._input) {
            this._input.scroller('option', {'dateFormat': val});
            this._dateValue(this._currentDateValue);
        }
    };

    p._updateYear = function(val) {
        var yToShow = this.yearsToShow(),
            yToStart = this.yearToStart(), temp, start, end;

        if (yToShow != undefined && yToStart != undefined && this._input) {
            if (yToStart != "mid") {
                temp = (yToShow < 0) ? 1 : 0;
                start = Math.min(new Date().getFullYear() + parseInt(yToStart) + yToShow, new Date().getFullYear() + parseInt(yToStart)) + temp;
            }
            else {
                temp = (yToShow < 0 && (yToShow%2) == 0) ? 1 : 0;
                start = new Date().getFullYear() - Math.floor((Math.abs(yToShow) - 1)/2) - temp;
            }
            end = start + Math.abs(yToShow) - 1;

            this._input.scroller('option', {'startYear': start, 'endYear': end});
        }
    };

    p.getMobiscrollObject = function() {
        return this._input;
    };

    p.appendValueToDataObject = function(dataObject, invalidMandatoryWidgets, force) {
        var self = this;

        return this._simpleDataObjectValue(dataObject, force, function(value) {
            if (value == null) {
                if (self.mandatory()) {
                    invalidMandatoryWidgets[self.id()] = true;
                }
                return null;
            }
            var datePickerType, tz, withTime, toUtc, dataObjectValue;

            datePickerType = self.preset();
            tz = self.dateTimezone();
            withTime = (datePickerType in {'datetime': 1, 'time': 2});
            toUtc = (datePickerType == 'datetime');

            dataObjectValue = WiziCore_Helper.isoDateString(self.form(), value, withTime, toUtc, tz);

            return dataObjectValue;
        });
    };

    p.collectDataSchema = function(dataSchema) {
        return (this.isIncludedInSchema()) ? this._simpleConstDataSchema(AC.Widgets.WiziCore_Api_Form.Type.DATE, dataSchema) : null;
    };

    p.setValueFromDataObject = function(dataObject, force) {
        var self = this;
        this._setDataObjectValueSimple(dataObject, function(value) {
            var isValid, fromUtc, tz;

            isValid = ((value != undefined) && (typeof value == 'string'));

            if (!isValid) {
                self.resetValue();
                return undefined;
            }
            fromUtc = (self.preset() == 'datetime' || self.preset() == 'time');
            tz = self.dateTimezone();
            return WiziCore_Helper.parseUTCISO8601(self.form(), value, fromUtc, tz);
        }, force);
    };

    p.isBindableToData = function() {
        return true;
    };

    p.rdbValueDataModel = function() {
        return null; // simple value
    };

    p._rdbValueToValue = function(value) {
        var isValid = (value != undefined && (typeof value == 'string' || (typeof value == "object" && typeof value["getTime"] == "function"))),
            isDateObj = (typeof value == "object" && typeof value["getTime"] == "function");

        if (!isValid) {
            return null;
        }
        return isDateObj ? value : WiziCore_Helper.mysqlTimeStampToDate(value);
    };

    p.rdbValue = function(val) {
        if (val !== undefined) {
            this._dateValue(this._rdbValueToValue(val));
            return undefined;
        } else {
            if (this.value() != null)
                return WiziCore_Helper.dateToMysqlTimeStamp(this.value());
        }
    };

    p.getDataModel = function() {
        return [
            { name: "value", value: "", uid: "valueuid" }
        ];
    };

    /** properties
     *
     */

    p.name = AC.Property.normal('name');

    p.isIncludedInSchema = AC.Property.normal('isIncludedInSchema', p._updateStorageFlag);
    p.dataType = AC.Property.normal('dataType');
    p.isUnique = AC.Property.normal('isUnique');
    p.mandatory = AC.Property.normal('mandatory');

    p.value = p.dateValue;
    p.preset = AC.Property.html('preset', p._preset);
    p.ampm = AC.Property.html('ampm', p._ampm);
    p.scrollerMode = AC.Property.html('scrollerMode', p._scrollerMode);
    p.scrollerTheme = AC.Property.html('scrollerTheme', p._scrollerTheme);

    p.enable = AC.Property.html('enable', p._enable);
    p.visible = AC.Property.html('visible', p._visible);
    p.opacity = AC.Property.theme('opacity', p._opacity);

    p.view = AC.Property.normal('view');
    p.fields = AC.Property.normal('fields');
    p.groupby = AC.Property.normal('groupby');
    p.orderby = AC.Property.normal('orderby');
    p.filter = AC.Property.normal('filter');
    p.resetfilter = AC.Property.normal('resetfilter');
    p.listenview = AC.Property.normal('listenview');
    p.applyview = AC.Property.normal('applyview');
    p.onview = AC.Property.normal('onview');

    p.dateTimezone = AC.Property.normal('dateTimezone');
    p.dateFormat = AC.Property.html('dateFormat', p._dateFormat);
    p.yearsToShow = AC.Property.normal("yearsToShow", p._updateYear);
    p.yearToStart = AC.Property.normal("yearToStart", p._updateYear);

    w.onSelectValue = "E#Mobiscroll#onSelectValue";

    /**
     * Return available widget prop
     * @return {Object} available property
     */
    w.actions = function() {
        var ret = {
            onSelectValue: {alias: "widget_event_onselectionchange", funcview: "onSelectionChange", action: "AC.Widgets.Mobiscroll.onSelectValue", params: "value", group: "widget_event_general"}
        };
        ret = $.extend(AC.Widgets.Base.actions(), ret);
        return ret;
    };

    /**
     * Return default inline edit prop
     * @return {Object} default inline edit prop
     */
    w.inlineEditPropName = function() {
        return "dateTime";
    };

    var _props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            {name: "preset", type : "mobiscrollpreset", set: "preset", get: "preset", alias: "widget_mobiscroll_preset"},
            {name: "ampm", type : "boolean", set: "ampm", get: "ampm", alias: "widget_mobiscroll_ampm"},
            {name: "scrollerMode", type : "mobiscrollMode", set: "scrollerMode", get: "scrollerMode", alias: "widget_mobiscroll_mode"},
            {name: "scrollerTheme", type : "mobiscrollTheme", set: "scrollerTheme", get: "scrollerTheme", alias: "widget_mobiscroll_theme"},
            {name: "yearsToShow", type : "int", set: "yearsToShow", get: "yearsToShow", alias: "mobiscroll_yearsToShow"},
            {name: "yearToStart", type : "yearToShow", set: "yearToStart", get: "yearToStart", alias: "mobiscroll_yearToStart"}
        ]},
        { name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.isUnique,
            AC.Property.database.mandatory
        ]},
        { name: AC.Property.group_names.layout, props:[
            AC.Property.layout.pWidthHidden,
            AC.Property.layout.widthHidden,
            AC.Property.layout.heightHidden,
            AC.Property.layout.sizes,
            AC.Property.layout.minWidth,
            AC.Property.layout.maxWidth,
            AC.Property.layout.x,
            AC.Property.layout.y,
            AC.Property.layout.zindex,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer
        ]},
        { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable,
            AC.Property.behavior.dateTimezone,
            AC.Property.behavior.dateFormat
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
            AC.Property.style.mobileTheme,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}

    ],
        lng = { "en" : {
            widget_name_mobiscroll: "Mobiscroll Date",
            widget_mobiscroll_preset: "Source",
            prop_mobiscroll_preset_date: 'Date',
            prop_mobiscroll_preset_time: 'Time',
            prop_mobiscroll_preset_date_time: 'DateTime',
            widget_mobiscroll_ampm: 'AMPM',
            widget_mobiscroll_mode: 'Mode',
            widget_mobiscroll_theme: 'Scroller Theme',
            prop_mobiscroll_mode_scroller: 'Scroller',
            prop_mobiscroll_mode_clickpick: 'ClickPick',
            prop_mobiscroll_theme_default: 'Default',
            prop_mobiscroll_theme_android_ics: 'Android ICS',
            prop_mobiscroll_theme_android_ics_light: 'Android ICS Light',
            prop_mobiscroll_theme_android: "Android",
            prop_mobiscroll_theme_sense_ui: 'Sense UI',
            prop_mobiscroll_theme_ios: 'iOS',
            mobiscroll_yearsToShow: "Years To Show",
            mobiscroll_yearToStart: "Year To Start"
        } }
        ;
    /**
     * Return available widget prop
     * @return {Object} available property
     */
    w.props = function() {
        return _props;
    };

    /**
     * Return empty widget prop
     * @return {Object} default properties
     */
    w.emptyProps = function() {
        return {};
    };

    w.langs = function() {
        return lng;
    };

    /**
     * Return default widget prop
     * @return {Object} default properties
     */
    w.defaultProps = function() {
        return {
            x: "0",
            y: "0",
            width: "210",
            height: "35",
            zindex: "auto",
            enable: true,
            anchors: {
                left: true,
                top: true,
                bottom: false,
                right: false
            },
            visible: true,
            name: "mobiscroll1",
            opacity: 1,
            customCssClasses: "",
            widgetStyle: "default",
            dragAndDrop: false, resizing: false,
            alignInContainer: 'left',
            mobileTheme: 'c',
            margin: '',
            preset: 'date',
            dateTimezone: "local",
            ampm: true,
            scrollerMode: 'scroller',
            scrollerTheme: 'default',
            dateFormat: "mm/dd/yy",
            yearsToShow: 3,
            yearToStart: '0'
        };
    };

    w.isField = function() {
        return true
    };

    AC.Core.lang().registerWidgetLang(lng);
})(jQuery,window,document);