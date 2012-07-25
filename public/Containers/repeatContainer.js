/**
 * @lends       RepeatContainer#
 */
(function($, windows, document, undefined){
    var w = WiziCore_UI_RepeatContainerWidget = AC.Widgets.WiziCore_UI_RepeatContainerWidget = AC.Widgets.RepeatContainer = function() {
        this.init.apply(this, arguments)
    };


    AC.extend(w, WiziCore_Widget_Container);
    var proto = w.prototype;
    AC.copyExtension(proto, WiziCore_WidgetAbstract_DataIntegrationContainer);
    AC.copyExtension(proto, WiziCore_Source_Widget_PagingAPI);

    proto._widgetClass = "RepeatContainer";
    proto._container = null;
    proto._prevPage = 0;
    proto._clonedDiv = null;
    proto._clonedChildren = null;
    proto._singleData = false;
    proto._dataPropName = "data";
    proto._separatorParams = null;
    proto._clonesLen = null;
    proto._clonesView = null;

    /**
     * Description of constructor
     * @class  Repeat container
     * @author      Timofey Tatarinov, Yuri Podoplelov
     * @version     0.2
     *
     * @constructs
     */
    proto.init = function() {
        this._clonedChildren = [];
        this._clonesLen = 0;
        this._clonesView = 0;
        w._sc.init.apply(this, arguments);
        this.initializeContainer();
        if (this.verticalSpacing() == undefined) {
            this.verticalSpacing(0);
        }
        if (this.horizontalSpacing() == undefined) {
            this.horizontalSpacing(0);
        }

        this._setData(this._project['data']);
        this._project['data'] = null;
    };
    proto.project = function(json) {
        var retVal = w._sc.project.apply(this, arguments);
        if (json === undefined && this._isDrawn) {
            retVal['data'] = this._getData();
        }
        return retVal;
    };
    
    proto.initDomState = function() {
        w._sc.initDomState.apply(this, arguments);
        //this.initDomStatePos();

        this._opacity(this.opacity());

        this._bg(this.bg());
        this._border(this.border());
        this._borderRadius(this.borderRadius());
        this._scrolling(this.scrolling());
        this._visible(this.visible());
        this._updateBackgroundImage();
        this._updateEnable();
        this._updateReadonly();
    };

    proto.draw = function() {
        this._clonedDiv = $("<div>").width(this.width()).height(this.height());
        if (WiziCore_Helper.checkForIE7) {
            this._clonedDiv.css("position", "relative");
        }
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._container.base().hide();
        } else {
            this._clonedDiv.hide();
        }
        this.base().append(this._clonedDiv);
        //this.cloneDataWidgets({columnNames : this.getWidgetsNames(), rows : []});


        //init Pos of container
        var self = this;
        //this._container.initDomStatePos();

        w._sc.draw.apply(this, arguments);
    };

    proto.drawChildren = function() {
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            w._sc.drawChildren.apply(this, arguments);
        }
    };

    proto.onPageDrawn = function() {
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._drawClonedContainers();
        } else {
            w._sc.onPageDrawn.apply(this, arguments);
            this._blockBgColor(this.blockBgColor());
            this._blockBorder(this.blockBorder());
            this._blockBorderRadius(this.blockBorderRadius());
        }
    };

    proto.currentContainer = function() {
        return this._container;
    };

    proto.initEditorLayer = function() {
        w._sc.initEditorLayer.apply(this, arguments);
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            //WiziCore_Helper.setIfNeedDefaultContainerBorder(this.base(), this.border());
            $(this._modeObject).hide();
        }
    };

    proto._updateLayout = function() {
        w._sc._updateLayout.apply(this, arguments);
        this.checkScroll();
    };

    proto.layoutEx = function() {
        return 'vertical';
    };

    proto.initializeContainer = function() {
        var children = this.children();
        var containerObj = null;
        if (children.length != 0) {
            containerObj = children[0];
        } else {
            var propsDefault = AC.Core.Widgets().getDefaultWidgetProperties("WiziCore_Widget_Container");
            containerObj = this.addNewWidget({widgetClass: "WiziCore_Widget_Container", project: propsDefault});
            containerObj.prop({width: this.width(), height: this.height(), x: 0, y: 0});
        }
        containerObj.isDraggable = this;
        containerObj.isEditable = false;
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            var oldUpdateLayoutProcess = containerObj._updateLayoutProcess;
            var self = this;
            containerObj._updateLayoutProcess = function() {
                if (typeof oldUpdateLayoutProcess == "function") {
                    oldUpdateLayoutProcess.call(containerObj);
                }
                self._updateContainerLayout(containerObj.width(), containerObj.height());
            }
        }
        this._container = containerObj;
    };

    proto._updateContainerLayout = function(containerWidth, containerHeight) {
        var baseWidth = parseInt(this.width());
        var baseHeight = parseInt(this.height());
        var hSpace = parseInt(this.horizontalSpacing());
        var vSpace = parseInt(this.verticalSpacing());

        // for auto resizing of max width/height bounds
        // (this.maxWidth() != 0) for first initialization maxWidth
        if (containerWidth != 0 && baseWidth < (containerWidth + vSpace)) {
            this.width(containerWidth);
        }

        if (containerHeight != 0 && baseHeight < (containerHeight + hSpace)) {
            this.height(containerHeight);
        }
    };

    proto.onSelManagerSelected = function(flag) {

    };

    proto._stretching = function(val) {
        var ret = this._setBoolean(val);
        if (ret && this._container != null) {
            this.width(this._container.width());
            this.height(this._container.height());
        }
    };

    proto._repeatMode = function(val) {
        var children = (this.mode() == WiziCore_Visualizer.EDITOR_MODE) ? [this._container] : this._clonedChildren,
            cssProp = this.getRepeatModeFloat(),
            child;
        for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            child.tableBase().css(cssProp);
            if (child._separatorLine) {
                child._separatorLine.css(cssProp);
            }
        }
    };

    proto._blockBorderRadius = function(val) {
        this._setElementBorderRadius(val, this._container.base());
    };

    /**
     * Set widget border
     * @param {String} value border
     */
    proto._border = function(val) {
        w._sc._border.apply(this, arguments);

        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            //WiziCore_Helper.setIfNeedDefaultContainerBorder(this.base(), val);
        }
    };

    /**
     * Set block background color
     * @param {String} block background color(rgb or transparent)
     */
    proto._blockBgColor = function(val) {
        this._setElementBg(val, this._container.base());
    };

    /**
     * Set block border
     * @param {String}  border
     */
    proto._blockBorder = function(val) {
        this._container.base().css("border", val);
    };

    proto._setNumber = function(value) {
        if (isNaN(parseInt(value))) {
            return 0;   // to fix if not set int value
        } else {
            return parseInt(value);
        }
    };

    /**
     * Set scrolling mode
     * @param {Boolean} value
     */
    proto._scrolling = function(value) {
        this.checkScroll();
    };

    proto.checkScroll = function() {
        var scrolling = this.scrolling(),
            isMobile = WiziCore_Helper.isMobile();
        scrolling = (scrolling == w.MODE_SCROLL && isMobile) ? w.MODE_AUTORESIZE : scrolling; //fix for mobile devices, set autoScroll instead scroll mode #4774
        if (this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            var overflowMode = (scrolling == w.MODE_SCROLL) ? "auto" : "hidden";
            //this.base().css("overflow", overflowMode);
            this._clonedDiv.css("overflow", overflowMode)
        }
        if (scrolling != w.MODE_AUTORESIZE) {
            this._clonedDiv.width('100%')
                .height(this.height());
        } else {
            this._clonedDiv.css({width: "", height: ""});
        }
    };

    proto._setBoolean = function(value) {
        return Boolean(value);
    };

    /**
     * @private
     * @param {Array} response data
     * @return {Object} {schema, widgetsData}
     */
    proto.extractSchemaAndWidgetsDataFromResponse = function(data) {
        if ((data == undefined) || (data.length == undefined)) {
            return null;
        }

        var len = data.length;
        if (len == 0) {
            return null;
        }

        // create widgets data array
        var schema = data[0];
        var widgetsData = {};
        for (var j = 1; j < len; j++) {
            for (var i = 0; i < schema.length; ++i) {
                var currId = schema[i];
                if (widgetsData[currId] == undefined) {
                    widgetsData[currId] = [];
                }
                widgetsData[currId].push(data[j][i]);
            }
        }

        if (len == 1) {
            widgetsData = null;
        }

        return {schema : schema, widgetsData : widgetsData};
    };

    proto.dataWidgetsIds = function() {
        //collect line structure like {"widgetId1": {name: "widgetName1", value: "someValue"}, "widgetId2": {name: "widgetName2", value: "someValue"}, etc...}
        var childrenIds = this.collectChildrenNames();
        var fields = this.fields();
        var ret = {};

        for (var i in childrenIds) {
            var child = childrenIds[i];
            if (child.id == this._container.id()) {
                //don't collect this._container for fields
                continue;
            }
            ret[child.id] = {name: child.name, value: ""};
            for (var fPos in fields) {
                //fields[fPos];
                if (fields[fPos].name == child.id) {
                    ret[child.id].value = fields[fPos].value;
                }
            }
        }
        return ret;
    };

        /*
         proto.loadDataFromRequest = function() {
         if (this.currPage() < 1) {
         return null;
         }
         // clear cloneDataWidgets div

         // load new data
         var currPageIndex = (this.currPage() - 1);
         var start = (currPageIndex * this.elementsPerPage());

         var requestStructure = jQuery.extend(true, {}, this.getRequestStructByView(this.view()));
         this._request.json(requestStructure);
         this._request.interval({start: start, count: this.elementsPerPage()});
         this._request.loadData(true);
         },

         */

    /**
     * Create container clone
     * @private
     * @return {Object} clone container
     */
    proto._createContainerClone = function() {
        var containerClonedProject = this._container.clone();
        var container = this.addNewWidget({project: containerClonedProject, widgetClass: this._container.widgetClass(), shouldToChildren: false, checkName: false});

        var self = this;

        container._hideByRepeatContainer = function(){
            this.tableBase().hide();
            if (this._separatorLine){
                this._separatorLine.hide();
            }
        };

        container._showByRepeatContainer = function(){
            this.tableBase().show();
            if (this._separatorLine){
                this._separatorLine.show();
            }
        };

        var oldVis = container._visible;
        container._visible = function(val){
            if (val === false){
                this._hideByRepeatContainer();
            } else {
                this._showByRepeatContainer();
            }
            oldVis.apply(this, arguments);
        };

        var oldBg = container.bg;
        container.bg = function(){
            oldBg.apply(this, arguments);
            this.__repeat_callBGPropChange && (this.__repeat_bgSetManual = true);
        };

        var oldRemove = container.remove;
        container.remove = function(){
            if (this._separatorLine) {
                this._separatorLine.remove();
            }
            oldRemove.apply(this, arguments);
        };

        container.rowIndex = function() {
            var children = self._clonedChildren;
            for (var i = 0, l = children.length; i < l; ++i) {
                if (children[i] == this) {
                    return i;
                }
            }
            return null;
        };

        return container;
    };

    proto._appendContainerClone = function(pos) {
        var container, ch = this._clonedChildren;
        if (ch[pos]){
            container = ch[pos];
        } else {
            container = this._createContainerClone();
            ch.push(container);
        }
        return container;
    };

    proto._insertContainerClone = function(index) {
        var container = this._createContainerClone();
        this._clonedChildren.splice(index, 0, container);
        this._clonesLen++;
        return container;
    };

    proto.createAllWidgets = function(val){
        if (val != undefined){
            this._createAllWidgets = val;
        }
        return this._createAllWidgets;
    };

    proto.getClonedLength = function(){
        var ret = this._clonedChildren.length;
        ret = Math.min(this._clonesView, ret);
        if (this.createAllWidgets()){
            ret = Math.min(this._clonesView, ret);
        }
        return ret;
    };

    proto.clonedChildren = function() {
        return this._clonedChildren;
    };

    /**
     * Create container clone, apply properties and after append it to cloneDataWidgets div
     * @param {Boolean} blockIsAlternative
     */
    proto._applyAlternativeBlockStyle = function(containerClone, blockIsAlternative) {
        if (this._isDrawn) {
            var point = (blockIsAlternative) ? 1 : 0;
            var cssProps = this._cloneBlockAlternative[point];
            if (cssProps == null) {
                cssProps = {};
                this._cloneBlockAlternative[point] = cssProps;
                cssProps['border'] = blockIsAlternative ? this.blockAlternativeBorder() : this.blockBorder();
                if (!containerClone.__repeat_bgSetManual){
                    cssProps['background-color'] = blockIsAlternative ? this.blockAlternativeBgColor() : this.blockBgColor();
                }
                cssProps['-moz-border-radius']
                    = cssProps['-webkit-border-radius']
                    = cssProps['border-radius']
                    = blockIsAlternative ? this.blockAlternativeBorderRadius() : this.blockBorderRadius();
            }
            containerClone.base().css(cssProps)
        }
    };

    proto.value = function(val) {
        if (val != undefined) {
            this.setData(val);
        }
        return this.getData();
    };

    proto.data = function(data) {
        var ret = undefined;
        if (data !== undefined) {
            var dataWithoutKeys = (data && '__ac_data' in data) ? data.__ac_data : data;
            if (this._container == null) {
                this._project['data'] = dataWithoutKeys;
            } else {
                this._setData(data);
            }
            var obj = {
                'data': dataWithoutKeys
            };
            this.sendExecutor(obj);
        }
        else {
            if (this._container == null) {
                ret = this._project['data'];
            } else {
                ret = this._getData();
            }
        }
        return ret;
    };

    proto._clearClones = function() {
        var ch = this._clonedChildren;
        for (var i = 0, l = ch.length; i < l; i++) {
            ch[i].destroy();
        }
        this._clonedChildren.length = 0;
    };

    proto._getDataMinLength = function(data) {
        data = (data && '__ac_data' in data) ? data.__ac_data : data;
        var minLen = Infinity;
        for (var field in data) {
            minLen = Math.min(minLen, data[field].length);
        }
        return (minLen == Infinity) ? 0 : minLen;
    };

    proto._setDataToCloneContainer = function(container, widgetsData, rowIndex) {
        var form = this.form();
        form._skipTokenCreation = true;

        var keys = (widgetsData && '__ac_keys' in widgetsData) ? widgetsData.__ac_keys : null;
        widgetsData = (widgetsData && '__ac_data' in widgetsData) ? widgetsData.__ac_data : widgetsData;
        for (var i in widgetsData) {
            var child = container.find(i);
            if (!child) {
                continue;
            }
            var childData = widgetsData[i][rowIndex];
            child.rdbValue(childData);
        }
        if (keys != null && rowIndex < keys.length) {
            var key = {};
            for (var keyField in keys.data) {
                key[keyField] = keys.data[keyField][rowIndex];
            }
            container._userData['data_key'] = key;
        }

        form._skipTokenCreation = false;
    };

    proto._hideAllClones = function(){
        var clonedCh = this._clonedChildren;
            for (var i = 0, l = clonedCh.length; i < l; i++){
                clonedCh[i]._hideByRepeatContainer();
            }
    };

    proto._setData = function(data) {

        this._hideAllClones();

        if (this.createAllWidgets()){
            this._clearClones();
        }

        var minLen = this._getDataMinLength(data),
            clonedCh = this._clonedChildren,
            child,
            clonedLen = clonedCh.length,
            i;

        for (i = 0; i < minLen; ++i) {
            var newContainerClone = this._appendContainerClone(i);
            this._setDataToCloneContainer(newContainerClone, data, i);
            this.onRowLoaded(i, newContainerClone);
        }

        this._clonesView = minLen;

        if (typeof this['updatePagingByWidget'] == 'function' && this._isDataManual != undefined) {
            this.updatePagingByWidget(minLen);
        }

        if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
            this._drawClonedContainers();
        }

//        //fix bug with chrome/ios web-kit browsers (no scroll bug)
//        var old = this.form().tableBase().css("display"),
//            self = this;
//        this.form().tableBase().css("display", "block");
//        setTimeout(function(){
//            //alert(self.form().tableBase().css("overflow") + "|" + old);
//            self.form().tableBase().css("display", old);
//        }, 50);
    };

    proto.clear = function(){
        this._clonesView = 0;
        this._hideAllClones();
    };

    /**
     * Create div for separating lines
     * @return {Object} separator div
     */
    proto.getRepeatModeFloat = function() {
        return (this.repeatMode() == w.MODE_VERTICAL) ?
        {"float": "left", clear:"left"} :
        {"float": "left", clear: "none"};
    };

    proto.createSeparatorDiv = function() {
        var separatorDiv = $("<div class='_separatorDiv'>");

        var params = this._separatorParams;
        if (params == null) {
            this._separatorParams = {};
            params = this._separatorParams;
            params.borderWidth = this.separatingLineWidth();
            params.width = parseInt(this._container.width());
            params.height = parseInt(this._container.height());
            params.cssProp = this.getRepeatModeFloat();
            params.cssProp["background-color"] = this.separatingLineColor();
            params.vSpacing = this.verticalSpacing() + "px 0";
            params.hSpacing = "0 " + this.horizontalSpacing() + "px";
        }
        var width = params.width,
            height = params.height;

        // calculate separator position

        switch (this.repeatMode()) {
            case w.MODE_VERTICAL:
            {
                height = params.borderWidth;
                width = "100%";
                params.cssProp["margin"] = params.vSpacing;
                break;
            }

            case w.MODE_HORIZONTAL:
            {
                width = params.borderWidth;
                params.cssProp["margin"] = params.hSpacing;
                break;
            }

            default:
                break;
        }

        params.cssProp["width"] = width;
        params.cssProp["height"] = height;

        separatorDiv.css(params.cssProp);
        return separatorDiv;
    };

    proto.drawNextPage = function() {
        this.fetchDataPage("next");
        var ret = !(this.pageCount() <= this.currPage());
        //false - no more data
        //true - can use more
        return ret;
    };

    proto.isAllDataDrawn = function() {
        var ret = true,
            l = this.getClonedLength(),
            children = this._clonedChildren;
        for (var i = 0; i < l; i++) {
            if (children[i]._isDrawn == false) {
                ret = false;
                break;
            }
        }
        return ret;
    };

    proto._redrawElements = function() {
        this._drawClonedContainers();
    };

    proto._drawClonedContainers = function(index) {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        this._separatorParams = null;
        this._cloneBlockAlternative = {1: null, 0: null};
        if (this._isDrawn) {
            var i,
                needSeparator = this.separatingLines(),
                clonedContainers = this._clonedChildren,
                containersCount = this.getClonedLength(),
                floatMode = this.getRepeatModeFloat(),
                drawDiv = this._clonedDiv,
                self = this,
                buff = $("<div/>"),
                callF = function(start, stop) {
                    var container, currBlockIsAlternative,
                        separatorDiv = needSeparator ? self.createSeparatorDiv() : null;

                    for (i = start; i <= stop; ++i) {
                        currBlockIsAlternative = ((i % 2) != 0);
                        container = clonedContainers[i];
                        if (!container){
                            continue;
                        }
                        container._manualDrawPosition = false;
                        container.__repeat_callOnPageDraw = false;
                        if (!container.isDrawn()){
                            container.draw(buff);
                            container.__repeat_callOnPageDraw = true;
                            container.__repeat_callBGPropChange = true;
                        }
                        //if container was hidden, show him
                        container._visible(container.visible());
                        if (needSeparator) {
                            if (!container._separatorLine){
                                container._separatorLine = separatorDiv.clone();
                                container._separatorLine.insertAfter(container.tableBase());
                            }

                            if ((containersCount - 1 != i) || (containersCount - 1 == i && !self.hideLastLine())) {
                                //check for last line
                                container._separatorLine.show();
                            } else {
                                container._separatorLine.hide();
                            }
                        }
                        container.tableBase().css(floatMode);
                        self._applyAlternativeBlockStyle(container, currBlockIsAlternative);

                    }
                    if (index != undefined){
                        //fix for insertRow
                        var items = drawDiv.children(".ac-widget-item");
                        if (items.length <= index){
                            drawDiv.append(buff.children());
                        } else {
                            $(items[index]).before(buff.children());
                        }
                    } else {
                        drawDiv.append(buff.children());
                    }
                    

                    for (i = start; i <= stop; ++i) {
                        container = clonedContainers[i];
                        if (container && container.__repeat_callOnPageDraw){
                            container.onPageDrawn();
                        }
                    }
                },
                start = 0,
                stop = containersCount - 1;

            if (this._isDataManual != undefined) {
                //sets by populate widget
                var perPage = this.elementsPerPage();
                start = this.startPosition();
                stop = start + perPage - 1;
                stop = (stop >= containersCount) ? containersCount - 1 : stop;
                start = (start > stop) ? stop : start;

                //hide unused containers, don't destroy, just hide
                var prevClear = Math.max((start - perPage), 0),
                    nextClear = Math.min((stop + perPage), clonedContainers.length - 1);
//                for (i = prevClear; i < start; i++){
//                    clonedContainers[i]._hideByRepeatContainer();
//                }
//
//                for (i = stop + 1; i <= nextClear; i++){
//                    clonedContainers[i]._hideByRepeatContainer();
//                }
            }
            callF(start, stop);

//            clearTimeout(this._timerDraw);
//            var diff = Math.round(this.height() / this._children[0].height() + 5),
//                dStart = start,
//                dStop = dStart + diff;
//
//            function timerCall(time){
//                time = (time == undefined) ? 200 : time;
//                self._timerDraw = setTimeout(function(){
//                    dStart += diff;
//                    dStop += diff;
//                    if (dStop < stop){
//                        timerCall();
//                    } else {
//                        dStop = stop;
//                    }
//                    callF(dStart, dStop);
//                }, time);
//            }
//
//            timerCall(0);

        }

        jQuery.fn.__useTr = trState;
    };

    proto._getData = function() {
        var containerChildren = this._container.children();

        var result = {}, i, l, field;

        for (i = 0, l = containerChildren.length; i < l; ++i) {
            result[containerChildren[i].id()] = [];
        }
        if (this._extDataFields != null) {
            for (field in this._extDataFields) {
                result[field] = [];
            }
        }

        var clonedContainers = this.clonedChildren();
        l = this.getClonedLength();
        for (i = 0; i < l; ++i) {
            var container = clonedContainers[i];
            for (field in result) {
                var column = result[field];
                var value = null;
                if (this._extDataFields != null && field in this._extDataFields) {
                    if (container._userData != null) {
                        value = container._userData[field];
                    }
                } else {
                    var widget = container.find(field);
                    if (widget != null) {
                        value = widget.getData();
                    }
                }
                column.push(value);
            }
        }
        return result;
    };

    proto._getDataKey = function(rowIndex) {
        var clonedContainers = this.clonedChildren();
        var container = clonedContainers[rowIndex];
        if (container != undefined) {
            if (container._userData != null) {
                return container._userData['data_key'];
            }
        }
        return undefined;
    };

    proto._getExtData = function(rowIndex, name) {
        var clonedContainers = this.clonedChildren();
        var container = clonedContainers[rowIndex];
        if (container != undefined) {
            if (container._userData != null) {
                return container._userData[name];
            }
        }
        return undefined;
    };

    proto._setExtData = function(rowIndex, name, value) {
        var clonedContainers = this.clonedChildren();
        var container = clonedContainers[rowIndex];
        if (container != undefined && this._extDataFields != null && name in this._extDataFields) {
            if (container._userData != null) {
                container._userData[name] = value;
            }
        }
    };

    proto._getRowAppChange = function(rowIndex, fieldsMap) {
        var rowDataKey = this._getDataKey(rowIndex);
        var res = {
            key: rowDataKey,
            data: {}
        };
        var row = null;
        var clonedContainers = this.clonedChildren();
        var container = clonedContainers[rowIndex];
        if (container != undefined) {
            var tempRowData = {};
            container.appendValueToDataObject(tempRowData, {}, true);
            for (var field in fieldsMap) {
                var widgetPath = fieldsMap[field];
                var value;
                if ($.isArray(widgetPath)) {
                    var widgetValue = tempRowData[widgetPath[0]];
                    if (widgetValue && typeof widgetValue == 'object' && widgetPath[1] in widgetValue) {
                        value = widgetValue[widgetPath[1]];
                    }
                } else {
                    if (widgetPath in tempRowData) {
                        value = tempRowData[widgetPath];
                    }
                }
                res.data[field] = value;
            }
            /*
             for (var id in tempRowData) {
             if (id in fieldsMap) {
             res.data[fieldsMap[id]] = tempRowData[id];
             }
             }
             */
        }
        return res;
    };

    proto._getRowsCount = function() {
        return this.getClonedLength();

    };

    proto._findField = function(field) {
        return field;
    };

    proto.getWidgetsNames = function() {
        var children = this._container.children();
        var names = [];
        for (var i = 0; i < children.length; ++i) {
            var widget = children[i];
            if (widget != null) {
                names.push(widget.name());
            }
        }

        return names;
    };

    proto.onRowLoaded = function(ind, row) {
        var triggerEvent = new jQuery.Event(w.onRowLoaded);
        $(this).trigger(triggerEvent, [ind, row]);
        return !triggerEvent.isPropagationStopped();
    };

    proto.resetValue = function() {
        var containers = this._clonedChildren,
            child;
        for (var i = 0, l = containers.length; i < l; ++i) {
            child = containers[i];
            child.hide();
            if (child._separatorLine){
                child._separatorLine.hide();
            }
        }
        this._clonesView = 0;
        w._sc.resetValue.apply(this, arguments);
    };

    proto.reset = function(useDefault, restoreContent) {
        if (restoreContent) {
            this.setData(this.getDefaultData());
        }
    };

    proto.empty = function() {
        this.reset(undefined, true); //used to reset widget before refactor
        var children = this._clonedChildren;
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].empty();
        }
    };

    proto.collectDataSchema = function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var columns = {};

        var container = this._container;
        var children = container.children();
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            child.collectDataSchema(columns);
        }

        var description = {
            'label': this.name(),
            'type': WiziCore_Api_ClientForm.Kind.OBJECT_LIST,
            'structure': columns
        };

        dataSchema[this.id()] = description;
        return description;
    };

    proto.appendValueToDataObject = function(dataObject, invalidMandatoryWidgets, force) {
        if (!force && !this.isIncludedInSchema()) {
            return undefined;
        }

        var clonedContainers = this._clonedChildren;

        var rows = [],
            columns = null,
            len = this.getClonedLength();

        for (var i = 0; i < len; ++i) {
            var rowDataObject = {};
            var containerChildren = clonedContainers[i].children();
            for (var j = 0, containerChildrenLength = containerChildren.length; j < containerChildrenLength; ++j) {
                var subWidget = containerChildren[j];
                subWidget.appendValueToDataObject(rowDataObject);
            }

            if (columns == null) {
                columns = [];
                for (var widgetId in rowDataObject) {
                    columns.push(widgetId);
                }
            }

            var newRow = [];
            for (var columnIndex = 0; columnIndex < columns.length; ++columnIndex) {
                newRow[columnIndex] = rowDataObject[columns[columnIndex]];
            }
            rows.push({data: newRow});
        }

        var data = null;
        if (columns != null && rows.length != 0) {
            data = {
                columns: columns,
                rows: rows
            };
        }

        dataObject[this.id()] = data;

        return true;
    };

    proto.setValueFromDataObject = function(dataObject, force) {
        if (!force && !this.isIncludedInSchema()) {
            return undefined;
        }

        var value = this._getValueFromDataObject(dataObject);

        this.resetValue();

        if (value != null && value.columns != undefined && value.rows != undefined) {
            var columns = value.columns;

            var rows = value.rows;
            var rowsCount = rows.length;

            for (var i = 0; i < rowsCount; ++i) {
                var newContainer = this._appendContainerClone(i);
                var row = (rows[i].data != undefined) ? rows[i].data : null;
                if (row != null) {
                    var rowDataObject = {};
                    for (var j = 0; j < row.length; ++j) {
                        rowDataObject[columns[j]] = row[j];
                    }
                    newContainer.setValueFromDataObject(rowDataObject);
                }
            }
            this._clonesView = rowsCount;

            (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) ? this._drawClonedContainers() : null;
        }

        return true;
    };

    proto.syncForeignAppData = function(callback, reportingStatusesCallback) {
        this._syncViewData(callback, reportingStatusesCallback);
    };

    proto.getDataFromMap = function(dataArray, map) {
        var res = {};
        var ids = {};
        var length = dataArray.length;
        for (var i = 0; i < length; i++) {
            var row = {};
            for (var j in map) {
                var mapValue = map[j];
                if (!ids[j]) {
                    ids[j] = this._getWidgetIdByName(j);
                    res[ids[j]] = [];
                }
                if (mapValue != undefined) {
                    res[ids[j]].push(AC.Widgets.Base.getDataItemWithMap(dataArray[i], mapValue));
                }
            }
//            res.push(row);
        }
        return res;
    };

    proto._getWidgetIdByName = function(name) {
        return this.w(name).id();
    };

    proto.rowCount = function() {
        return this.getClonedLength();
    };

    proto.getRow = function(index) {
        return this._clonedChildren[index];
    };

    proto.deleteRow = function(ind) {
        var container = this._clonedChildren[ind];
        if (container != undefined) {
            container.destroy();
            this._clonedChildren.splice(ind, 1);
            this._clonesLen--;
            this._clonesView--;
        }
        this._drawClonedContainers();
    };

    proto.insertRow = function(pos, rowData) {
        // create container, insert it
        rowData = (rowData == undefined) ? {} : rowData;
        var index = null;

        //for collected data
        var minLen = this.getClonedLength();

        if (typeof pos == 'number') {
            index = Math.max(0, Math.min(minLen, pos));
        }
        else {
            if (pos == 'top') {
                index = 0;
            } else if (pos == 'bottom') {
                index = minLen;
            }
        }

        if (index != null) {
            var newContainer = this._insertContainerClone(index);
            this._clonesView++;
            for (var id in rowData) {
                try {
                    newContainer.w(id).rdbValue(rowData[id]);
                }
                catch(e) {
                }
            }

//            var newContainerChildren = newContainer.children();
//            for (var i = 0, l = newContainerChildren.length; i < l; ++i) {
//                var child = newContainerChildren[i];
//                var name = child.name();
//                if (name in rowData) {
//                    child.setData(rowData[name]);
//                }
//            }
            if (this._isDrawn && this.mode() != WiziCore_Visualizer.EDITOR_MODE) {
                this._drawClonedContainers(index);
            }
        }

        return index;
    };

    proto.sum = function(widget) {
        var wName = (typeof widget == "object") ? widget.name() : widget,
            clonedContainers = this._clonedChildren,
            sumValue = 0,
            len = this.getClonedLength();
        for (var i = 0; i < len; i++) {
            var child = clonedContainers[i].w(wName);
            if (child != null) {
                var cVal = child.value();
                if (!isNaN(parseFloat(cVal))) {
                    sumValue += (parseFloat(cVal) - 0);
                }
            }
        }
        return sumValue;
    };

    proto.search = function(what, keyList, start, caseSens, equal) {
        equal = (equal == undefined) ? false : equal;
        start = (start == undefined) ? 0 : start;
        keyList = (keyList == undefined) ? [] : keyList;
        caseSens = (caseSens == undefined) ? false : caseSens;
        what = (!caseSens) ? (what + "").toLowerCase() : what;

        var ret = [];
        var parentCont = this.children()[0];
        if (parentCont != undefined) {
            var data = this.getData();
            var map = {};
            for (var wId in data) {
                var widget = parentCont.find(wId);
                if (widget == null) {
                    continue;
                }
                var wName = widget.name();
                if (keyList.length == 0 || WiziCore_Helper.inArray(wName, keyList)) {
                    map [wId] = wName;
                }
            }
            var checkItem = function(item) {
                item = (caseSens == false) ? (item + "").toLowerCase() : item;
                var ret = (equal) ? (item == what) : ((item + "").indexOf(what) != -1);
                return ret;
            };
            for (var wId in map) {
                if (data[wId] != undefined) {
                    var item = data[wId];
                    for (var i = start, l = item.length; i < l; i++) {
                        if (checkItem(item[i])) {
                            ret.push({widgetName: map[wId], index: i});
                        }
                    }
                }
            }
        }
        return ret;
    };

    proto.getDataModel = function() {
        return this._getContainerDataModel(this._container.children());
    };

// properties
    proto.isIncludedInSchema = AC.Property.normal('isIncludedInSchema', proto._updateStorageFlag);
    proto.foreignAppWriting = AC.Property.normal('foreignAppWriting');
    proto.autoRelationships = AC.Property.normal('autoRelationships');

    proto.repeatMode = AC.Property.html('repeatMode', proto._repeatMode);
    proto.stretching = AC.Property.normal('stretching', proto._stretching);
    proto.separatingLines = AC.Property.normalPropBeforeSet('separatingLines', proto._setBoolean);
    proto.hideLastLine = AC.Property.normalPropBeforeSet('hideLastLine', proto._setBoolean);
    proto.separatingLineWidth = AC.Property.theme('separatingLineWidth', proto._setNumber);

    proto.currPage = AC.Property.normalPropBeforeSet('currPage', proto._currPage);
    proto.elementsPerPage = AC.Property.normalPropBeforeSet('elementsPerPage', proto._elementsPerPage);

    proto.verticalSpacing = AC.Property.normalPropBeforeSet('verticalSpacing', proto._setNumber);
    proto.horizontalSpacing = AC.Property.normalPropBeforeSet('horizontalSpacing', proto._setNumber);

    proto.opacity = AC.Property.theme('opacity', proto._opacity);
    proto.readonly = AC.Property.html('readonly', proto._updateReadonly);
    proto.scrolling = AC.Property.html('scrolling', proto._scrolling);
    proto.separatingLineColor = AC.Property.theme('separatingLineColor');

    proto.bg = AC.Property.theme('bgColor', proto._bg);
    proto.border = AC.Property.theme('border', proto._border);
    proto.borderRadius = AC.Property.theme('borderRadius', proto._borderRadius);

    proto.blockBgColor = AC.Property.theme('blockBgColor', proto._blockBgColor);
    proto.blockAlternativeBgColor = AC.Property.theme('blockAlternativeBgColor');
    proto.blockBorder = AC.Property.theme('blockBorder', proto._blockBorder);
    proto.blockAlternativeBorder = AC.Property.theme('blockAlternativeBorder');
    proto.blockBorderRadius = AC.Property.theme('blockBorderRadius', proto._blockBorderRadius);
    proto.blockAlternativeBorderRadius = AC.Property.theme('blockAlternativeBorderRadius');

    proto.view = AC.Property.normal('view');
    proto.fields = AC.Property.normal('fields');
    proto.groupby = AC.Property.normal('groupby');
    proto.orderby = AC.Property.normal('orderby');
    proto.filter = AC.Property.normalPropBeforeSet('filter', proto._filterBefore);
//        proto.resetfilter = AC.Property.normal('resetfilter');
    proto.listenview = AC.Property.normal('listenview');
//        proto.applyview = AC.Property.normal('applyview');
    proto.backgroundImage = AC.Property.theme("backgroundImage", proto._updateBackgroundImage);
    proto.backgroundRepeat = AC.Property.theme("backgroundRepeat", proto._updateBackgroundImage);
    proto.keyFields = AC.Property.normal('keyFields');
    
    /**
     * Return available widget actions
     * @return {Object} available actions
     */
    w.actions = function() {
        return {
            onRowLoaded : {alias : "widget_event_onrowloaded", funcview : "onRowLoaded", action : "AC.Widgets.RepeatContainer.onRowLoaded", params : "index, createdRow", group : "widget_event_general"},
            dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data"},
            dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
        };
    };

    var _props = [
        { name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.elementsPerPage,
            AC.Property.general.currPage,
            AC.Property.general.hiddenData
        ]},
        { name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.foreignAppWriting,
            AC.Property.database.autoRelationships
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
            AC.Property.layout.zindex,
            AC.Property.layout.verticalSpacing,
            AC.Property.layout.horizontalSpacing,
            AC.Property.layout.repeatMode,
            AC.Property.layout.scrolling,
            AC.Property.layout.stretching,
            AC.Property.layout.separatingLines,
            AC.Property.layout.hideLastLine,
            AC.Property.layout.alignInContainer
        ]},
        { name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.readonly,
            AC.Property.behavior.enable
        ]},
        { name: AC.Property.group_names.data, props:[
            AC.Property.data.view,
            AC.Property.data.fields,
            AC.Property.data.groupby,
            AC.Property.data.orderby,
            AC.Property.data.filter,
            AC.Property.data.listenview,
            AC.Property.data.autoLoad,
            AC.Property.data.keyFields
        ]},
        { name: AC.Property.group_names.style, props:[
            AC.Property.style.border,
            AC.Property.style.borderRadius,
            AC.Property.style.margin,
            AC.Property.style.bgColor,
            AC.Property.style.blockBgColor,
            AC.Property.style.blockAlternativeBgColor,
            AC.Property.style.blockBorder,
            AC.Property.style.blockAlternativeBorder,
            AC.Property.style.blockBorderRadius,
            AC.Property.style.blockAlternativeBorderRadius,
            AC.Property.style.separatingLineWidth,
            AC.Property.style.separatingLineColor,
            AC.Property.general.backgroundImage,
            AC.Property.general.backgroundRepeat,
            AC.Property.behavior.opacity,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]}
    ];
    /**
     * Return available widget prop
     * @return {Object} available property
     */
    w.props = function() {
        return _props;
    };

    w.onPageBtnClick = "E#RepeatContainer#onPageBtnClick";
    w.onRowLoaded = 'E#RepeatContainer#onRowLoaded';

    w.MODE_VERTICAL = "vertical";
    w.MODE_HORIZONTAL = "horizontal";

    w.MODE_SCROLL = "scroll";
    w.MODE_NOSCROLL = "noscroll";
    w.MODE_AUTORESIZE = "autoresize";

    w.DEFAULT_ELEMENTS_PER_PAGE = 10;


    w.capabilities = function() {
        return {
            defaultProps: {
                width: 200,
                height: 100,
                x : 0,
                y: 0,
                zindex : "auto",
                repeatMode : w.MODE_VERTICAL,
                widgetClass : "RepeatContainer",
                name : "repeatContainer1",
                elementsPerPage : w.DEFAULT_ELEMENTS_PER_PAGE,
                currPage : 1,
                scrolling : w.MODE_NOSCROLL,
                stretching : false,
                separatingLines : false,
                separatingLineColor : "#000000",
                visible : true,
                enable: true,
                readonly: false,
                opacity : 1,
                margin: "", alignInContainer: 'left',
                hourglassImage: "Default",
                displayHourglassOver: "inherit", customCssClasses: "",
                border:"1px solid gray",
                blockBgColor : "",
                blockAlternativeBgColor : "",
                blockBorder : "",
                blockAlternativeBorder : "",
                blockBorderRadius : "",
                blockAlternativeBorderRadius : "",
                dragAndDrop: false, resizing: false,
                verticalSpacing : 0,
                horizontalSpacing : 0,
                pWidth: ""
            },
            emptyProps: {border:"1px solid gray"},
            isField: false,
            props: _props,
            actions: w.actions(),
            containerType: AC.Widgets.Base.CASE_TYPE_COMPOSITE_CONTAINER
        };
    };

})(jQuery,window,document);