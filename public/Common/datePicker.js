(function($, windows, document, undefined){

    var widget = AC.Widgets.DatePicker = AC.Widgets.WiziCore_UI_DatePickerWidget = function() {
        this.init.apply(this, arguments);
    };

    AC.extend(widget, AC.Widgets.Base);
    var p = widget.prototype; // prototype

    AC.copyExtension(p, AC.WidgetExt.DataIntegration.Interval);

    p._widgetClass = "DatePicker";
    p._input = null;
    p._dateDiv = null;
    p._canClose = null;
    p._tDefDates = null;
    p._dataPropName = "dateValue";
    p._valueDefaultPropName = 'dateValue';
    p._currentDateValue = null;
    p._isTyped = false;


    p.init = function() { //constructor
        widget._sc.init.apply(this, arguments);
    };

    p.initProject = function(json) {
        widget._sc.initProject.apply(this, arguments);
        this._currentDateValue = this.getDatesFromStrings(this._project['dateValue'], 'yy-mm-dd');
    };

    p.project = function(json) {
        var retVal = widget._sc.project.apply(this, arguments);
        retVal['dateValue'] = this.getStringsFromDates(this._currentDateValue, 'yy-mm-dd');
        return retVal;
    };

    p.onContainerChangeLayout = function() {
        if (this.getContainerLayoutType() == AC.WidgetExt.Layout.LAYOUT_TYPES.Absolute) {
            this._input.width(this.width());
        } else {
            this._input.width("100%");
        }
    };

    p.draw = function() {
        var self = this;
        var input = $("<input class='input clear-input-border' style='width:100%; height:100%; border: 0; outline: none;'>");
        this.base().prepend(input);
        this._input = input;
        this._dateDiv = null;
        input.focus(function() {
            if (self._dateDiv == null) {
                self.showDatePicker();
            }
        });
        input.blur(function() {
            self.onFocusOut();
        });
        input.bind("keyup", function(ev) {
            if (ev.which == 13) {
                self.onFocusOut();
            }
            self._isTyped = true;
        });
        widget._sc.draw.apply(this, arguments);
    };

    p._updateLayout = function() {
        widget._sc._updateLayout.apply(this, arguments);
        this._input.height(this.height());

        if ($.browser.msie) {
            this._input.css("line-height", this.height() + "px"); // line-height - fix for IE =(
        }
    };

    p.isInterval = function() {
        return this.range();
    };

    p._setDateValue = function(value) {
        //setter
        var i,l;
        if (!jQuery.isArray(value)) {
            value = [value];
        }
        if ((value[0] && typeof value[0] == "string") || (value[1] && typeof value[1] == "string")) {
            //check for string values
            var ret = this.getDatesFromStrings(value, this.dateFormat()),

                check = false;
            for (i = 0,l = value.length; i < l; i++) {
                if (value[i] == ret[i] || (ret[i] == null && value[i] != null)) {
                    check = true;
                    break;
                }
            }
            if (!check) {
                value = ret;
            } else {
                //check for utc date string
                var utcDate = null;
                check = false;
                for (i = 0,l = value.length; i < l; i++) {
                    utcDate = new Date(value[i]);
                    if (!isNaN(utcDate.getDate())) {
                        value[i] = utcDate;
                    } else {
                        //stop setting value to datepicker
                        return;
                    }
                }
            }
        }

        //check for Date Object
        for (i = 0,l = value.length; i < l; i++) {
            if (value[i] && typeof value[i] == "object" && typeof value[i]["getTime"] != "function") {
                //stop setting value to datepicker
                return;
            }
        }

        this._currentDateValue = value;
        var obj = {};
        obj['dateValue'] = value;
        this.sendExecutor(obj);
        if (this._isDrawn) {
            this._dateValue(value);
        }
    };

    p.dateValue = function(value) {
        if (value !== undefined) {
            this._setDateValue(value);
        }
        //getter
        var cDate = this._currentDateValue;
        var nDate = null;
        if (cDate != null) {
            nDate = [];
            if (!jQuery.isArray(cDate)) {
                cDate = [cDate];
            }
            for (var i = 0, l = cDate.length; i < l; i++) {
                if (cDate[i] != undefined) {
                    var retDate = (typeof cDate[i] == "string") ? new Date(cDate[i]) : new Date(cDate[i].getTime());
                    nDate.push(retDate);
                }
            }
            nDate = (nDate.length == 0) ? null : nDate;
            if (!this.range() && nDate != null && nDate[0] != undefined) {
                nDate = nDate[0];
            }
        }
        return nDate;
    };

    p.initDomState = function() {
        widget._sc.initDomState.call(this);
        this.initDomStatePos();
        this._bg(this.bg());
        this._font(this.font());
        this._fontColor(this.fontColor());
        this._borderRadius(this.borderRadius());
        this._border(this.border());

        this._updateEnable();
        this._visible(this.visible());
        this._shadow(this.shadow());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());
        this._updateReadonly();
        this._dateValue(this.dateValue());
        this._dateFormat(this.dateFormat());
    };

    p.showDatePicker = function() {
        var self = this;
        if (this.readonly() === true) {
            return;
        }
        if (this._dateDiv != null) {
            this._dateDiv.remove();
            this._dateDiv = null;
        }

        var dateDiv = $("<div>");
        this._dateDiv = dateDiv;
        var params = {
            left: this._input.offset().left,
            top: this._input.offset().top - 0 + this._input.parent().height()
        };
        dateDiv.css({position: "absolute",
            left: parseFloat(params.left),
            top: parseFloat(params.top),
            height: "auto",
            width: "auto",
            "z-index": 10000});

        dateDiv.hide();
        $(document.body).append(dateDiv);
        var cal = $("<div>");
        dateDiv.append(cal);
        dateDiv.mousedown(function(ev) {
            self._canClose = false;
            //acDebugger.systemLog("dateDiv.click");
            ev.stopPropagation();
        });
        dateDiv.click(function(ev) {
            ev.stopPropagation();
        });
        self._canClose = true;
        var defaultDate = new Date();
        if (self.dateValue() != null) {
            if (!this.range()) {
                defaultDate = new Date(self.dateValue());
            } else {
                defaultDate = new Date(self.dateValue()[0]);
            }
        }
        var building = true,
            newParams = {
                onSelect: function(dateText, inst) {
                    if (!building)
                        self.onSelectDialogDate(inst);
                },
                onClose: function(dateText) {
                    //debuger.systemLog("onClose::dateText", dateText);
                    if (this._dateDiv != null && !building) {
                        self._input.val(dateText);
                    }
                },
                showButtonPanel: true,
                changeMonth: true,
                changeYear: true,
                showOtherMonths: true,
                selectOtherMonths: true,
                defaultDate: defaultDate
            },
            addParams = {};
        var mindate = this.dateMin();
        var maxdate = this.dateMax();
        var dateregexp = /([\d]+)\/([\d]+)\/([\d]+)/;
        if (mindate != null) {
            var mindateParams = mindate.match(dateregexp);
            mindate = new Date(mindateParams[3], mindateParams[1] - 1, mindateParams[2]);
            newParams.minDate = mindate;
        }
        if (maxdate != null) {
            var maxdateParams = maxdate.match(dateregexp);
            maxdate = new Date(maxdateParams[3], maxdateParams[1] - 1, maxdateParams[2]);
            newParams.maxDate = maxdate;
        }
        mindate = (mindate != null) ? mindate.getFullYear() + "" : "c-10";
        maxdate = (maxdate != null) ? maxdate.getFullYear() + "" : "c+10";
        newParams.yearRange = mindate + ":" + maxdate;

        if (this.range()) {
            addParams.numberOfMonths = 2;
        }

        jQuery.extend(newParams, addParams);
        cal.datepicker(newParams);
        $("#ui-datepicker-div").hide();

        self.callAppendCloseBtn(dateDiv);

        var ddW = parseInt(dateDiv.width());
        var winW = parseInt($(window).width());
        var divLeft = parseInt(params.left);
        divLeft = (ddW + divLeft > winW) ? winW - ddW - 20 : divLeft;
        dateDiv.css("left", divLeft);

        ddW = parseInt(dateDiv.height());
        winW = parseInt($(window).height());
        divLeft = parseInt(params.top);
        divLeft = (ddW + divLeft > winW) ? winW - ddW - 20 : divLeft;
        dateDiv.css("top", divLeft);

        dateDiv.fadeIn("slow");
        building = false;
    };

    p.onSelectDialogDate = function(inst) {
        var self = this;
        var tmc = this._tDefDates;

        if (tmc == null) {
            tmc = {cnt:0};
        }
        this._tDefDates = tmc;
        var fDate = new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay);
        var value = null;
        if (this.range()) {
            //two month
            tmc.cnt ++;
            if (tmc.cnt == 1) {
                tmc.f1 = fDate;
            }
            if (tmc.cnt == 2) {
                //end select
                tmc.f2 = fDate;

                var dates = [tmc.f2, tmc.f1];
                if (tmc.f2.getTime() > tmc.f1.getTime()) {
                    dates = [tmc.f1, tmc.f2];
                }
                value = dates;
            }
        } else {
            //one month
            value = fDate;
        }
        if (value != null) {
            //if value is null, this calls, that value is not sets, for example when range is TRUE
            self.destroyDatePickerDialog("slow", value);
        }
        self._canClose = true;
    };

    p.onFocusOut = function() {
        //acDebugger.systemLog("focus out!!!", this._canClose);
        if (this._canClose) {
            this.setTypedDateValue();
            this.destroyDatePickerDialog("slow");
        }
    };

    p.callAppendCloseBtn = function(dateDiv) {
        var self = this;
        var _updateOrigin = $.datepicker._updateDatepicker;
        // Replaces the function.
        $.datepicker._updateDatepicker = function(inst) {

            _updateOrigin.apply(this, [inst]);
            self.appendCloseBtn(dateDiv);
        };
        self.appendCloseBtn(dateDiv);
    };

    p.appendCloseBtn = function(dateDiv) {
        //append close btn
        var self = this;
        var btnPane = dateDiv.find(".ui-datepicker-buttonpane");
//        var closeText = AC.Core.lang().trText("dialog_button_close");
        var closeText = AC.Core.lang().trText("dialog_button_clear");
        if (btnPane.find("button").size() < 2) {
            var btnClose = $('<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all">' + closeText + '</button>');
            btnClose.css("float", "right");
            btnClose.hover(function() {
                $(this).addClass("ui-state-hover");
            }, function() {
                $(this).removeClass("ui-state-hover");
            });
            btnClose.click(function() {
                self.destroyDatePickerDialog(undefined, null);
            });
            btnPane.append(btnClose);
        }
    };

    p.destroyDatePickerDialog = function(fadeType, value) {
        acDebugger.systemLog("destroyDatePickerDialog");
        if (this._dateDiv != null) {
            this._dateDiv.fadeOut(fadeType);
            this._dateDiv.find("div").datepicker('hide');
            this._dateDiv.find("div").datepicker('destroy');
            this._dateDiv.remove();
            this._dateDiv = null;
            this.onClose(value);
        }
        this._tDefDates = {};
        this._tDefDates.cnt = 0;
    };

    p.remove = function() {
        this.destroyDatePickerDialog();
        if (this._checkRepeatBeforeRemove()){
            return;
        }
        widget._sc.remove.call(this);
    };

    p.setFocus = function() {
        if (this._input != null) {
            $(this._input).focus();
        }
    };

    p.selectContents = function() {
        if (this._isDrawn && this.mode() != AC.Visualizer.EDITOR_MODE) {
            this._input.select();
        }
    };

    p.getStringsFromDates = function(arr, df) {
        var ret = [];
        if (jQuery.isArray(arr)) {
            for (var i = 0; i < 2 && i < arr.length; ++i) {
                ret[i] = jQuery.datepicker.formatDate(df, arr[i]);
            }
        }
        return ret;
    };

    p.getDatesFromStrings = function(arr, df) {
        var ret = [];
        if (jQuery.isArray(arr)) {
            for (var i = 0; i < 2 && i < arr.length; ++i) {
                try {
                    ret[i] = jQuery.datepicker.parseDate(df, arr[i]);
                } catch(e) {
                    acDebugger.systemLog("datePicker parseDate ", e);
                    ret = (this.range()) ? [null, null] : [null];
                    break;
                }
            }
        }
        return ret;
    };

    p.onClose = function(date) {
        var self = this;

        try {
            var oldValue = self.dateValue(),
                triggerEvent = new jQuery.Event(widget.onClose);

            if (date != undefined){
                self.onSelectDate(date);
            }
            $(self).trigger(triggerEvent, [date, oldValue]);
        } catch(e) {
            acDebugger.systemLog1("onClose", e);
        }
    };

    p.onSelectDate = function(valueToShow) {
        this.dateValue(valueToShow);
        var triggerEvent = new jQuery.Event(widget.onSelectDate);
        $(this).trigger(triggerEvent, [valueToShow]);
        this.sendDrillDown();
    };

    p._bg = function(value) {
        widget._sc._bg.call(this, value);
        widget._sc._bg.call(this, value, this._input);
    };

    p._dateValue = function(val) {
        if (!jQuery.isArray(val)) {
            val = [val];
        }
        var df = this.dateFormat();
//        var tz = this.dateTimezone();
//        var isdatetime = this.datePickerType() == 'datetime';
        df = (typeof df == "object" && df.value != undefined) ? df.value : df;
        if (jQuery.isArray(val)) {
            var firstDate = val[0];
            if (typeof firstDate == "string") {
                //convert from utc string to Date object;
                firstDate = new Date(firstDate);
            }
            var idate = jQuery.datepicker.formatDate(df, firstDate);
            if (val[1] != undefined) {
                var secondDate = val[1];
                if (typeof secondDate == "string") {
                    //convert from utc to date
                    secondDate = new Date(secondDate);
                }
                idate += " - " + jQuery.datepicker.formatDate(df, secondDate);
            }
            this._input.val(idate);
        }
    };

    p.setTypedDateValue = function() {
        if (!this._isTyped) {
            return;
        }
        this._isTyped = false;
        var ret = [];
        var localStr = this._input.val();
        var df = this.dateFormat();
        df = (typeof df == "object" && df.value != undefined) ? df.value : df;
        if (this.range()) {
            var re = /([\w\W]+) - ([\w\W]+)/;
            var res;
            if ((res = re.exec(localStr)) != null) {
                ret = this.getDatesFromStrings([res[1], res[2]], df);
            }
        } else {
            ret = this.getDatesFromStrings([localStr], df);
        }
        this.onSelectDate(ret);
    };

    p._readonly = function(flag) {
        widget._sc._readonly.call(this, flag, this._input);
    };

    p._enable = function(flag) {
        widget._sc._enable.call(this, flag, this._input);
    };

    p._dateFormat = function() {
        this._dateValue(this.dateValue());
    };

    p.collectDataSchema = function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var range = this.range();
        if (range === true) {

            var partDescription = {
                label: null,
                type: AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                structure: AC.Widgets.WiziCore_Api_Form.Type.DATE
            };
            var description = {
                label: this.name(),
                type: AC.Widgets.WiziCore_Api_Form.Kind.OBJECT,
                structure: {
                    begin: partDescription,
                    end: partDescription
                },
                'unique': this.isUnique()
            };
            if (this.mandatory()) {
                description['mandatory'] = true;
            }
            dataSchema[this.id()] = description;
            return description;
        }
        else {
            return this._simpleConstDataSchema(AC.Widgets.WiziCore_Api_Form.Type.DATE, dataSchema);
        }
    };

    p.appendValueToDataObject = function(dataObject, invalidMandatoryWidgets, force) {
        var self = this;

        return this._simpleDataObjectValue(dataObject, force, function(value) {
            if (value == null || ($.isArray(value) && value.length == 0)) {
                if (self.mandatory()) {
                    invalidMandatoryWidgets[self.id()] = true;
                }
                return null;
            }
            var datePickerType = self.datePickerType();
            var tz = self.dateTimezone();
            var withTime = (datePickerType in {'datetime': 1});//, 'datetimeUtc': 1});
            var toUtc = (datePickerType == 'datetime');

            var dataObjectValue = null;
            if (self.range() && value != null) {
                dataObjectValue = {
                    begin: WiziCore_Helper.isoDateString(self.form(), value[0], withTime, toUtc, tz),
                    end: WiziCore_Helper.isoDateString(self.form(), value[1], withTime, toUtc, tz)
                }
            } else {
                var val = ($.isArray(value)) ? value[0] : value;
                dataObjectValue = WiziCore_Helper.isoDateString(self.form(), val, withTime, toUtc, tz);
            }
            return dataObjectValue;
        });
    };

    p.setValueFromDataObject = function(dataObject, force) {
        var self = this;
        this._setDataObjectValueSimple(dataObject, function(value) {
            var isValid = (value != undefined);
            if (isValid) {
                isValid = (self.range()) ? (typeof value.begin == 'string' && typeof value.end == 'string')
                    : (typeof value == 'string');
            }

            if (!isValid) {
                self.resetValue();
                return undefined;
            }
            var fromUtc = (self.datePickerType() == 'datetime');
            var tz = self.dateTimezone();
            return (self.range()) ? [WiziCore_Helper.parseUTCISO8601(self.form(), value.begin, fromUtc, tz), WiziCore_Helper.parseUTCISO8601(self.form(), value.end, fromUtc, tz)]
                : [WiziCore_Helper.parseUTCISO8601(self.form(), value, fromUtc, tz)];
        }, force);
    };

    p.getDataModel = function() {
        var values = [];
        if (this.range()) {
            values = [
                {name: "Value Left", value: "", uid: "valueuid"},
                {name: "Value Right", value: "", uid: "valueuid1"}
            ];
        } else {
            values = this._valueDataModel();
        }
        return values;
    };

    p.rdbValueDataModel = function() {
        if (this.range()) {
            return [
                {name: "Begin", value: "", uid: "begin"},
                {name: "End", value: "", uid: "end"}
            ];
        } else {
            return null; // simple value
        }
    };

    p.isBindableToData = function() {
        return true;
    };

    p._rdbValueToValue = function(value) {
        var isValid = (value != undefined), ret = null;
        if (isValid) {
            isValid = (this.range()) ? (((typeof value.begin == 'string') || this._isDateObject(value.begin))
                && ((typeof value.end == 'string') || this._isDateObject(value.end)))
                : (typeof value == 'string' || this._isDateObject(value));
        }

        if (!isValid) {
            return ret;
        }

        if (this.range()) {
            return [this._isDateObject(value.begin) ? value.begin : WiziCore_Helper.mysqlTimeStampToDate(value.begin),
                this._isDateObject(value.end) ? value.end : WiziCore_Helper.mysqlTimeStampToDate(value.end)];
        } else {
            return [this._isDateObject(value) ? value : WiziCore_Helper.mysqlTimeStampToDate(value)];
        }
//
//        return (this.range()) ? [this._isDateObject(value.begin) ? value.begin : WiziCore_Helper.mysqlTimeStampToDate(value.begin),
//            this._isDateObject(value.end) ? value.end : WiziCore_Helper.mysqlTimeStampToDate(value.end)]
//            : [this._isDateObject(value) ? value : WiziCore_Helper.mysqlTimeStampToDate(value)];
    };

    p._isDateObject = function(value) {
        return (typeof value == "object" && typeof value["getTime"] == "function");
    };

    p.rdbValue = function(val) {
        if (val !== undefined) {
            this.value(this._rdbValueToValue(val));
        }
    };

    p._tabindex = function(val) {
        widget._sc._tabindex.call(this, val, this._input);
    };

    p._tabStop = function(val) {
        widget._sc._tabStop.call(this, val, this._input);
    };

    // template properties
    p.isIncludedInSchema = AC.Property.normal('isIncludedInSchema', this._updateStorageFlag);
    p.isUnique = AC.Property.normal('isUnique');
    p.mandatory = AC.Property.normal('mandatory');

    p.font = AC.Property.theme('font', p._font);
    p.border = AC.Property.theme('border', p._border);
    p.borderRadius = AC.Property.theme('borderRadius', p._borderRadius);
    p.fontColor = AC.Property.theme('fontColor', p._fontColor);
    p.bg = AC.Property.theme('bgColor', p._bg);

    p.shadow = AC.Property.theme('shadow', p._shadow);
    p.opacity = AC.Property.theme('opacity', p._opacity);
    p.tabindex = AC.Property.html('tabindex', p._tabindex);
    p.readonly = AC.Property.html('readonly', p._readonly);
    p.range = AC.Property.normal('range');
    p.dateFormat = AC.Property.html('dateFormat', p._dateFormat);

    p.datePickerType = AC.Property.normal('datePickerType');
    p.dateTimezone = AC.Property.normal('dateTimezone');

    p.value = p.dateValue;
    p.dateMin = AC.Property.normal('dateMin');
    p.dateMax = AC.Property.normal('dateMax');

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


    //widgetEvent constants
    widget.onClose = "E#DatePickerWidget#onClose";
    widget.onSelectDate = "E#DatePickerWidget#onSelectDate";

    //static methods
    var inlineEditPropName = "dateValue";

    var actions = {
        onClose: {alias: "widget_event_onclose", funcview: "onClose", action: "AC.Widgets.DatePicker.onClose", params: "value", group: "widget_event_general"},
        onSelectDate: {alias: "widget_event_onselectdate", funcview: "onSelectDate", action: "AC.Widgets.DatePicker.onSelectDate", params: "value", group: "widget_event_general"},
        dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.DatePicker.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
        dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.DatePicker.onDataReset", params : "", group : "widget_event_data"}
    };
    actions = jQuery.extend({}, AC.Widgets.Base.actions(), actions);

    var props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name
        ]},
        { name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.isUnique,
            AC.Property.database.mandatory,
            AC.Property.database.mandatoryHighlight,
            AC.Property.database.datePickerType
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
            AC.Property.layout.tabindex,
            AC.Property.layout.tabStop,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer
        ]},
        { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable,
            AC.Property.behavior.readonly,
            AC.Property.behavior.range,
            AC.Property.behavior.dateMin,
            AC.Property.behavior.dateMax,
            AC.Property.behavior.dateValue,
            AC.Property.behavior.dateFormat,
            AC.Property.behavior.dateTimezone
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
            AC.Property.style.shadow,
            AC.Property.style.font,
            AC.Property.style.fontColor,
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.bgColor,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
    ];

    var emptyProps = {bgColor: "#f7f7f7", fontColor: "black", font:"normal 12px verdana", border:"1px solid gray"};

    var defaultProps = {valName: "currVal", dateValue: [], width: 140, height: 20, x: "100", y: "50", zindex: "auto",
        anchors: {left: true, top: true, bottom: false, right: false}, visible: true,
        range: false, opacity: 1, enable: true, readonly: false,
        widgetStyle: "default", name:"DatePicker1",
        pWidth: "", hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        margin: "", alignInContainer: 'left',
        dragAndDrop: false, resizing: false,
        dateFormat: "mm/dd/yy", dateTimezone: "local",
        dateMin: null, dateMax: null,
        shadow: ""
    };


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
        return emptyProps;
    };

    /**
     * Return default widget prop
     * @return {Object} default properties
     */
    widget.defaultProps = function() {
        return defaultProps;
    };

    widget.actions = function() {
        return actions;
    };
    widget.inlineEditPropName = function() {
        return inlineEditPropName;
    };

    widget.isField = function() {
        return true;
    };
})(jQuery,window,document);
