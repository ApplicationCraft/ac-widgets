/**
 * @lends       WiziCore_UI_GridWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_GridWidget = AC.Widgets.WiziCore_UI_GridWidget =  AC.Widgets.Base.extend($.extend({}, WiziCore_WidgetAbstract_DataIntegrationGrid, WiziCore_Source_Widget_PagingAPI, {
    _widgetClass: "WiziCore_UI_GridWidget",
    _table: null,
    _dataPropName: "data",
    _reloadData: false,
    _userData: null,

    /**
     * Description of constructor
     * @class  Some words about grid widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.3
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
        this._userData = new WiziCore_RowUserData();
    },

    project: function(json) {
        var retVal = this._super(json);
        if (json === undefined && this._isDrawn) {
            retVal['data'] = this._getData();
        }
        return retVal;
    },

    draw: function() {
        if (this._table){
            this._table.destroy();
        }
        var self = this,
            mygrid = this._table = new jqSimpleGrid(this.base(), [], {
                model: [],
                widthType: this.colwidthtype(),
                multiSelect: true,
                readOnly: this.readonly(),
                touchScroll: true,
                twoClickEdit: !this.lightNavigation()
            }),
            hasScroll = !!(mygrid.plugins().scroll);

        if (hasScroll){
            var scPlug = mygrid.plugins().scroll;
            mygrid.base().resize(function(){
                scPlug.refresh();
            });
        }
        this._colmodel(this.colmodel());
        this._updateEnable();
        this._updateReadonly();

        $(mygrid).bind(jqSimpleGrid.onCellSelect, function(ev, id, ind){
            self.onRowSelect(id, ind);
        });
        var eventHandles = this.eventsHandles();
        for (var i in eventHandles) {
            //bind events
            this.bindGridEvent(i);
        }
        this.importFunction = {};
        this.importFunction.addRow = function(data) {
            self.addRow(data);
        };

        this._setData(this._project['data']);
        this._project['data'] = null;

        this._super.apply(this, arguments);
    },

    onPageDrawn: function() {
        this.initDomStatePos();
        var sc = this._table.plugins().scroll;
        if (sc) {
            sc.refresh();
        }
    },

    initProps: function() {
        this._super();
        this.colwidthtype = this.htmlProperty('colwidthtype', this._colWidthType);

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.foreignAppWriting = this.normalProperty('foreignAppWriting');
        this.autoRelationships = this.normalProperty('autoRelationships');
        this.keyFields = this.normalProperty('keyFields');
        this.lightNavigation = this.htmlProperty('lightnavigation', this._lightNavigation);

        this.currPage = this.normalPropBeforeSet('currPage', this._currPage);
        this.elementsPerPage = this.normalPropBeforeSet('elementsPerPage', this._elementsPerPage);

        this.shadow = this.themeProperty('shadow', this._shadow);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._readonly);

        this.colmodel = this.htmlProperty('colmodel', this._colmodel);

        this.border = this.themeProperty('border', this._border);
        this.defaultHeaderFont = this.themeProperty('defaultHeaderFont', this._defaultHeaderFont);
        this.defaultHeaderColor = this.themeProperty('defaultHeaderColor', this._defaultHeaderColor);
        this.bgColorHeader = this.themeProperty('bgColorHeader', this._bgColorHeader);
        this.defaultDataColor = this.themeProperty('defaultDataColor', this._defaultDataColor);
        this.defaultDataFont = this.themeProperty("defaultDataFont", this._defaultDataFont);
        this.alternativeRowBgColor = this.themeProperty('alternativeRowBgColor', this._alternativeRowBgColor);

        // data
        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.resetfilter = this.normalProperty('resetfilter');
        this.listenview = this.normalProperty('listenview');
        this.applyview = this.normalProperty('applyview');
        this.onview = this.normalProperty('onview');
    },

    initDomState: function() {
        this._super();
        this._border(this.border());
        this._defaultHeaderFont(this.defaultHeaderFont());
        this._defaultHeaderColor(this.defaultHeaderColor());
        this._bgColorHeader(this.bgColorHeader());
        
        this._defaultDataColor(this.defaultDataColor());
        this._defaultDataFont(this.defaultDataFont());
        
        this._alternativeRowBgColor(this.alternativeRowBgColor());
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._shadow(this.shadow());
    },

    _updateLayout: function(){
        this._super();
        if (this._table){
            this._table.height(this.height());
        }
    },

    remove: function() {
        if (this._checkRepeatBeforeRemove()){
            return;
        }
        if (this._table != null) {
            this._project['data'] = this._getData();
            if (this._table) {
                $(this._table).unbind(jqSimpleGrid.onCellSelect);
                this._table.destroy();
            }
            this._table = undefined;
        }
        this._super();
    },

    enableAutoWidth: function(mode) {
        //:todo deprecated
    },

    _defaultHeaderFont: function(font) {
        this._table.headerFont(font);
    },

    _defaultHeaderColor: function(color) {
        this._table.headerColor(color);
    },

    _defaultDataColor: function(color) {
        this._fontColor(color, this.base());
    },

    _defaultDataFont: function(val) {
        this._font(val, this.base());
    },

    _alternativeRowBgColor: function(color) {
        this._table.altBgColor(color);
    },

    setSelectedRowById: function(rowId) {
        this._table.selectRow(rowId, false);
    },

    setSelectedRow: function(index){
        var data = this._table.getDataLink();
        if (data && index != undefined && data[index]){
            this._table.selectRow(data[index].id);
        }
    },

    /**
     * Function call, then to elements bind event
     * @param {String} event type of event
     * @private
     */

    bindEvent: function(event) {
        this._super(event);
        if (this._bindingEvents[event] > 1) {
            return;
        }

        if (this._table != null){
            this.bindGridEvent(event);
        }
    },

    bindGridEvent: function(event) {
        if (!this._checkBindEvent(event)){
            //drop binded event
            return;
        }
        var self = this,
            table = this._table;

        switch (event) {
            case WiziCore_UI_GridWidget.onKeyPress:
                $(table).bind(jqSimpleGrid.onKeyPress, function(ev, oEv) {
                    self.onKeyPress(oEv);
                });
                break;

            case WiziCore_UI_GridWidget.onEditCell:
                $(table).bind(jqSimpleGrid.onEditCell, function(ev, id, colPos, cell) {
                    self.onEditCell(ev, 0, id, colPos, cell.getValue(), cell.getValue());
                });
                break;

            case WiziCore_UI_GridWidget.onCellChanged:
                $(table).bind(jqSimpleGrid.onCellChanged, function(ev, rId, colPos, nValue, oValue, row) {
                    self.onEditCell(ev, 1, rId, colPos, nValue, oValue);
                    return self.onCellChanged(ev, rId, colPos, nValue, oValue, row);
                });
                break;


            case WiziCore_UI_GridWidget.onSelectStateChanged:
                $(table).bind(jqSimpleGrid.onRowSelect, function(ev, rid, cellPos) {
                    self.onSelectStateChanged(rid);
                });
                break;

            case WiziCore_UI_GridWidget.onGridReconstructed:
                $(table).bind(jqSimpleGrid.onGridChanged, function() {
                    self.onGridReconstructed();
                });
                break;

            case WiziCore_UI_GridWidget.onOpenEnd:
                $(table).bind(jqSimpleGrid.onRowOpen, function(ev, rowId, colPos) {
                    self.onOpenEnd(rowId, 1);
                });
                $(table).bind(jqSimpleGrid.onRowClosed, function(ev, rowId, colPos) {
                    self.onOpenEnd(rowId, -1);
                });
                break;


            case WiziCore_UI_GridWidget.onBeforeDrag:
//                self._onBeforeDragId = self._table.attachEvent("onBeforeDrag", function(sId) {
//                    return self.onBeforeDrag(sId);
//                });
                break;

            case WiziCore_UI_GridWidget.onDrag:
//                self._onDragId = self._table.attachEvent("onDrag", function(sId, tId, sObj, tObj, sInd, tInd) {
//                    return self.onDrag(sId, tId, sObj, tObj, sInd, tInd);
//                });
                break;

            case WiziCore_UI_GridWidget.onDragIn:
//                self._onDragInId = self._table.attachEvent("onDragIn", function(dId, tId, sObj, tObj) {
//                    return self.onDragIn(dId, tId, sObj, tObj);
//                });
                break;

            case WiziCore_UI_GridWidget.onScroll:
                $(table).bind(jqSimpleGrid.onScroll, function(ev, sTop, sLeft) {
                    self.onScroll(sLeft, sTop);
                });
                break;

            case WiziCore_UI_GridWidget.onDrop:
//                self._onDropId = self._table.attachEvent("onDrop", function(sId, tId, dId, sObj, tObj, sCol, tCol) {
//                    self.onDrop(sId, tId, dId, sObj, tObj, sCol, tCol);
//                });
                break;

            case WiziCore_UI_GridWidget.onBeforeContextMenu:
//                self._onBeforeContextMenuId = self._table.attachEvent("onBeforeContextMenu", function(id, ind, obj) {
//                    return self.onBeforeContextMenu(id, ind, obj);
//                });
                break;

            case WiziCore_UI_GridWidget.onRowCreated:
//                $(table).bind(jqSimpleGrid.onRowCreated, function(ev, rId) {
//                    self.onRowCreated(rId);
//                });
                break;

            case WiziCore_UI_GridWidget.onRowAdded:
//                self._onRowAddedId = self._table.attachEvent("onRowAdded", function(rId) {
//                    return self.onRowAdded(rId);
//                });
                break;

            case WiziCore_UI_GridWidget.onRowLoaded:
                $(table).bind(jqSimpleGrid.onRowCreated, function(ev, rId, rowPos, row) {
                    self.onRowLoaded(ev, rId, rowPos, row);
                });
                break;

            case WiziCore_UI_GridWidget.onRowDblClicked:
                $(table).bind(jqSimpleGrid.onDblClick, function(ev, rId, cInd) {
                    return self.onRowDblClicked(rId, cInd);
                });
                break;
            default:
                break;
        }

    },

    /**
     * Function call, then to elements unbind event
     * @param {String} event type of event
     * @private
     */
    unbindEvent: function(event) {
        if (this._bindingEvents[event] > 0) {
            return;
        }

        var self = this,
            table = $(this._table);

        switch (event) {
            case WiziCore_UI_GridWidget.onKeyPress:
                table.unbind(jqSimpleGrid.onKeyPress);
                break;
            
            case WiziCore_UI_GridWidget.onEditCell:
                table.unbind(jqSimpleGrid.onEditCell);
                break;

            case WiziCore_UI_GridWidget.onCellChanged:
                table.unbind(jqSimpleGrid.onCellChanged);
                break;

            case WiziCore_UI_GridWidget.onSelectStateChanged:
                table.unbind(jqSimpleGrid.onRowSelect);
                break;

            case WiziCore_UI_GridWidget.onGridReconstructed:
                table.unbind(jqSimpleGrid.onGridChanged);
                break;

            case WiziCore_UI_GridWidget.onOpenEnd:
                table.unbind(jqSimpleGrid.onRowOpen);
                table.unbind(jqSimpleGrid.onRowClosed);
                break;


            case WiziCore_UI_GridWidget.onBeforeDrag:
//                if (self._onBeforeDragId != undefined) {
//                    table.unbind(self._onBeforeDragId);
//                }
                break;

            case WiziCore_UI_GridWidget.onDrag:
//                if (self._onDragId != undefined) {
//                    table.unbind(self._onDragId);
//                }
                break;

            case WiziCore_UI_GridWidget.onDragIn:
//                if (self._onDragInId != undefined) {
//                    table.unbind(self._onDragInId);
//                }
                break;

            case WiziCore_UI_GridWidget.onScroll:
                table.unbind(jqSimpleGrid.onScroll);
                break;

            case WiziCore_UI_GridWidget.onDrop:
//                if (self._onDropId != undefined) {
//                    table.unbind(self._onDropId);
//                }
                break;

            case WiziCore_UI_GridWidget.onBeforeContextMenu:
//                if (self._onBeforeContextMenuId != undefined) {
//                    table.attaunbindchEvent(self._onBeforeContextMenuId);
//                }
                break;

            case WiziCore_UI_GridWidget.onRowCreated:
//                if (self._onRowCreatedId != undefined) {
//                    table.unbind(self._onRowCreatedId);
//                }
                break;
            case WiziCore_UI_GridWidget.onRowAdded:
//                if (self._onRowAddedId != undefined) {
//                    table.unbind(self._onRowAddedId);
//                }
                break;
            case WiziCore_UI_GridWidget.onRowLoaded:
                table.unbind(jqSimpleGrid.onRowCreated);
                break;
            case WiziCore_UI_GridWidget.onRowDblClicked:
                table.unbind(jqSimpleGrid.onDblClick);
                break;
            default:
                break;
        }
    },

    onKeyPress: function(oEv) {
        var code = oEv.keyCode,
            cFlag = oEv.ctrlKey,
            sFlag = oEv.shiftKey;
        $(this).trigger(WiziCore_UI_GridWidget.onKeyPress, [code, cFlag, sFlag]);
    },

    onRowCreated: function(rId, rObj, rXml) {
//        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onRowCreated);
//        $(this).trigger(triggerEvent, [rId, rObj, rXml]);
//        return !triggerEvent.isPropagationStopped();
    },

    onRowAdded: function(rId) {
//        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onRowAdded);
//        $(this).trigger(triggerEvent, [rId]);
//        return !triggerEvent.isPropagationStopped();
    },

    onBeforeContextMenu: function(id, ind, obj) {
//        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onBeforeContextMenu);
//        $(this).trigger(triggerEvent, [id,ind,obj]);
//        return !triggerEvent.isPropagationStopped();
    },

    onCellChanged: function(ev, rId, cInd, nValue, oValue, row) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onCellChanged);
        $(this).trigger(triggerEvent, [rId, cInd, nValue, oValue]);
        return !triggerEvent.isPropagationStopped();
    },

    onSelectStateChanged: function(id) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onSelectStateChanged);
        $(this).trigger(triggerEvent, [id]);
        return !triggerEvent.isPropagationStopped();
    },

    onGridReconstructed: function() {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onGridReconstructed);
        $(this).trigger(triggerEvent, [this._table]);
        return !triggerEvent.isPropagationStopped();
    },

    onOpenEnd: function(id, state) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onOpenEnd);
        $(this).trigger(triggerEvent, [id, state]);
        return !triggerEvent.isPropagationStopped();
    },


    /**
     * This event occurs 1-3 times depending on cell's editability. onEditCell event passes the following parameters:
     * @param {Number} stage stage of editing (0-before start[can be canceled if returns false],1- the editor is opened,2- the editor is closed);
     * @param {String} rId id of the row;
     * @param {String} cInd index of the cell;
     * @param {String} nValue new value (only for the stage 2);
     * @param {String} oValue old value (only for the stage 2).
     * @return {String/Number/Boolean} true - confirm edit operation , false - deny edit operation ( previous cell value will be restored) , string or number - false - deny edit operation ( previous cell value will be restored). Allow on stage 3rd
     */
    onEditCell: function(ev, state, rId, cInd, nValue, oValue) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onEditCell);
        $(this).trigger(WiziCore_UI_GridWidget.onEditCell, [state, rId, cInd, nValue, oValue]);
        return !triggerEvent.isPropagationStopped();
    },

    onRowLoaded: function(ev, rid, rowPos, row) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onRowLoaded);
        $(this).trigger(triggerEvent, [rid, rowPos, row]);
        return !triggerEvent.isPropagationStopped();
    },

    /**
     * This event occurs immediately after a row in the grid was clicked. onRowSelect event passes the following parameters:
     * @param {String} id id of the clicked row;
     * @param {String} ind index of the clicked cell.
     */
    onRowSelect: function(id, oldId) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onRowSelect),
            selRows = this._table.getSelectedRows(),
            ind = this._table.getRowPos(id);
        this.value(selRows);
        this.sendDrillDown();
        $(this).trigger(triggerEvent, [id, ind]);
        return !triggerEvent.isPropagationStopped();
    },

    onRowDblClicked: function(rId, cInd) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onRowDblClicked);
        $(this).trigger(triggerEvent, [rId, cInd]);
        return !triggerEvent.isPropagationStopped();
    },

    /**
     * This event calls user-defined handlers (if there are any) and passes the following parameter:
     * @param {Number} sId id of the source item.
     */
    onBeforeDrag: function(sId) {
//        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onBeforeDrag);
//        $(this).trigger(triggerEvent, [sId]);
//        return !triggerEvent.isPropagationStopped();
    },

    /**
     * This event calls user-defined handlers (if there are any) and passes the following parameters:
     * @param {Number} dId - id of the dragged item
     * @param {Number} lId - id of the potential drop landing;
     * @param {Number} id - if the node is dropped as a sibling, id of the item before which the source node will be inserted;
     * @param {Object} sObject - source object;
     * @param {Object} tObject - target object.
     */
    onDrop: function(sId, tId, dId, sObj, tObj, sCol, tCol) {
//        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onDrop);
//        $(this).trigger(triggerEvent, [sId,tId,dId,sObj,tObj,sCol,tCol]);
//        return !triggerEvent.isPropagationStopped();
    },

    /**
     * This event calls user-defined handlers (if there are any) and passes the following parameters:
     * @param {Object} ret object for allow {allow: true|false}
     * @param {Number} dId - id of the dragged item
     * @param {Number} lId - id of the potential drop landing;
     * @param {Number} id - if the node is dropped as a sibling, id of the item before which the source node will be inserted;
     * @param {Object} sObject - source object;
     * @param {Object} tObject - target object.
     */
    onDrag: function(sId, tId, sObj, tObj, sInd, tInd) {
//        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onDrag);
//        $(this).trigger(triggerEvent, [sId,tId,sObj,tObj,sInd,tInd]);
//        return !triggerEvent.isPropagationStopped();
    },

    /**
     * This event calls user-defined handlers (if there are any) and passes the following parameters:
     * @param {Number} dId - id of the dragged item
     * @param {Number} lId - id of the potential drop landing;
     * @param {Object} sObject - source object;
     * @param {Object} tObject - target object.
     */
    onDragIn: function(dId, tId, sObj, tObj) {
//        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onDragIn);
//        $(this).trigger(triggerEvent, [dId, tId, sObj, tObj]);
//        return !triggerEvent.isPropagationStopped();
    },

    /**
     * This event calls user-defined handlers (if there are any) and passes the following parameters:
     * @param {Number} sLeft - sLeft left position
     * @param {Number} sTop - sTop top position
     */
    onScroll: function(sLeft, sTop) {
        var triggerEvent = new jQuery.Event(WiziCore_UI_GridWidget.onScroll);
        $(this).trigger(triggerEvent, [sLeft, sTop]);
        return !triggerEvent.isPropagationStopped();
    },

    data: function(data) {
        var ret = undefined;
        if (data !== undefined) {
            //setter
//            data = this._beforeData(data);
            if (this._isDrawn) {
                this._setData(data);
            } else {
                this._project['data'] = data;
            }

            var obj = {
                'data': data
            };
            this.sendExecutor(obj);
        }
        else {
            if (this._isDrawn) {
                ret = this._getData();
            } else {
                ret = this._project['data'];
            }
//            ret = this._dataAfterGet(ret);
        }
        return ret;
    },

    _beforeData: function(data) {
        if (data != undefined && $.isArray(data.rows)) {
            var rows = data.rows, row, i, l, j, k, oldData, id, isValueToken, token, hasToken,
                form = this.form(),
                hasLanguage = form.language() != null;

            oldData = this._project['data'];

            for (i = 0, l = rows.length; i < l; i++) {
                row = rows[i];
                if (hasLanguage) {
                    id = (row.data.userData && row.data.userData.id != undefined) ? row.data.userData.id : null;
                    for (j = 0, k = row.data.length; j < k; j++) {
                        isValueToken = WiziCore_Helper.isLngToken(row.data[j]);
                        if (!isValueToken) {
                            hasToken = (id != null) && WiziCore_Helper.isLngToken(oldData.rows[id]['data'][j]);
                            if (hasToken)
                                token = oldData.rows[id]['data'][j];
                            else
                                token = WiziCore_Helper.generateId(10, 'ac-');

                            this.form().addTokenToStringTable(this.id(), this.name(), token, row.data[j]);
                            row.data[j] = token;
                        }
                    }
                }
                if (row.data.userData != undefined && row.data.userData.id != undefined)
                    row.data.userData.id = undefined;
            }
        }
        return data;
    },

    _dataAfterGet: function(data) {
        var ret, i, l, j, k, rows, row;

        if (data != undefined && $.isArray(data.rows)) {
            ret = WiziCore_Helper.clone(data);
            rows = ret.rows;
            for (i = 0, l = rows.length; i < l; i++) {
                row = rows[i];

                if (row.data.userData)
                    row.data.userData.id = i;
                else
                    row.data.userData = {id:i};

                for (j = 0, k = row.data.length; j < k; j++) {
                    row.data[j] = this._getTranslatedValue(row.data[j]);
                }
            }
            return ret;
        }
        return data;
    },

//    _onSTUpdated: function() {
//        //this._redraw();
//    },
//
//    _onLanguageChanged: function() {
//        //this._redraw();
//    },

    /**
     * Set row data
     * @param {Object} data json data
     */
    _setData: function(data) {
        if (data === null){
            this.clear();
        }
        if (data != undefined && data && $.isArray(data.rows)) {
//            var resData = WiziCore_Helper.clone(data),
            var resData = data,
                rows = resData.rows,
//                dataRows = data.rows,
                r, l, i , j, row, dataRow, rowId, rowKey;
            for (r = 0, l = rows.length; r < l; ++r) {
                row = rows[r];
//                dataRow = dataRows[r];
                rowId = row.id;
                rowKey = row.key;
//                if (dataRow.data.userData)
//                    dataRow.data.userData.data_key = rowKey;
//                else
//                    dataRow.data.userData = {data_key : rowKey};

                if (row.data.userData)
                    row.data.userData.data_key = rowKey;
                else
                    row.data.userData = {data_key : rowKey};


//                for (i = 0, j = row.data.length; i < j; i++) {
//                    row.data[i] = WiziCore_Helper.isLngToken(row.data[i]) ? this._getTranslatedValue(row.data[i]) : row.data[i];
//                }
            }
            this._table.clear();
            this._table.rowsToMatrix(resData, this._getTableOpt());
        }
    },

    _getTableOpt: function(val){
        val = (val == undefined) ? {groupBy: this._table.groupBy(), sortBy: this._table.sortBy()} : val;
        return (this.mode() == WiziCore_Visualizer.EDITOR_MODE) ? undefined : val;
    },

    /**
     * gets a list of all row ids in grid
     */
    _getData: function() {
        var ret = {rows: []},
            table = this._table,
            data = table.getData(),
            model = table.model(),
            colLen = model.length,
            row, subRow;

        for (var i = 0, l = data.length; i < l; i++){
            row = data[i];
            subRow = {id: row.id, data:[]};
            for (var j = 0; j < colLen; j++){
                subRow.data.push(row[j]);
            }
            subRow.key = row.userData['data_key'];
            ret.rows.push(subRow);
        }

        return ret;
    },

    _colWidthType: function(val){
        this._table.widthType(val);
        this._colmodel(this.colmodel());
    },

    _colmodel: function(model){
        if (model != undefined && $.isArray(model) && this._table){
            var table = this._table,
                colBg = [],
                headColColor = [],
                headColFont = [],
                hColAlign = [],
                colFont = [],
                colColor = [],
                colAlign = [],
                colVAlign = [],
                colSort = [],
                groupBy = [],
                sortBy = [],
                len = model.length;
            for (var i = 0, l = len; i < l; i++) {
                var item = model[i];
                if (item.colUid == undefined){
                    //colUid - stored from old structure of grid =(, needs "id", not "colUid"
                    item.colUid = (item.id == undefined) ? WiziCore_Helper.generateUniqueId(36, "c") : item.id;
                }
                item.id = item.colUid;

                hColAlign.push("center");
                colAlign.push((item.align || "center"));
                colFont.push(item.datafont || "");
                colColor.push(item.datacolor || "");
                colVAlign.push(item.valign || "middle");
                colBg.push(item.bg || "");
                headColColor.push(item.color || "");
                headColFont.push(item.font || "");
                if (item.groupby){
                    groupBy.push(i);
                }
                if (item.sort && item.sort !== 'na'){
                    sortBy.push(i);
                }
                if (item.total == true || item.total == "true"){
                    var t = [];
                    for (var j = 0; j < len; j++) {
                        if (j != i){
                            t.push(j);
                        }
                    }
                    item.type = "mathRow";
                    item.value = t;
                }
            }
            table.model(model);
            table.headerColumnAlign(hColAlign);
            table.columnFont(colFont);
            table.columnColor(colColor);
            table.columnBgColor(colBg);
            table.columnAlign(colAlign);
            table.columnVAlign(colVAlign);
            table.headColumnFont(headColFont);
            table.headColumnColor(headColColor);
            var opt = this._getTableOpt({groupBy:groupBy, sortBy: sortBy});
            table.setData(table.getDataLink(), opt);
        }
    },

    _readonly: function(flag){
        if (this._table != null){
            (flag === false) ? this._table.readOnly(false) : this._table.readOnly(true);
        }
    },

    _enable: function(flag){
        if (this._table != null){
            this._table.enable(flag);
        }
    },

    /**
     * filter grid by mask
     * @param {Number} column zero based index of column.
     * @param {String} value value by which the column will be filtered.
     * @param {Boolean} preserve filter current or initial state (false by default)
     */
    filterBy: function(column, value, preserve) {
        this._table.filterBy(column, value, preserve);
    },

    attachHeader: function(aHead) {
        //:todo deprecated
    },

    gridSplitBy: function() {
        //:todo deprecated
    },

    setColumnHidden: function(ind, mode){
        if (typeof ind == "object"){
            for (var i in ind){
                this._table.showColumnByPos(i, !ind[i]);
            }
        } else {
            this._table.showColumnByPos(ind, !mode);
        }
    },
    /**
     * Set show/hide row by id
     * @param {String} id row ID
     * @param {String} mode boolean value
     */
    setRowHidden: function(id, mode) {
        this._table.showRow(id, !mode);
    },

    setColumnFontColor: function(color) {
        this._table.columnColor(color);
    },

    setColumnFont: function(color) {
        this._table.columnFont(color);
    },

    /**
     * set excell type for cell in question
     * @param {String} rowId row ID
     * @param {String} cellIndex cell index
     * @param {String} type type of excell (code like “ed”, “txt”, “ch” etc.)
     */
    setCellExcellType: function(rowId, cellIndex, type) {
        this._table.setCellType(rowId, cellIndex, type);
    },

    /**
     * sets style to cell
     * @param {String} row_id row id
     * @param {String} ind cell index
     * @param {String} styleString style string in common format (ex: “color:red;border:1px solid gray;”)
     */
    setCellTextStyle: function(row_id, ind, styleString) {
        this._table.setCellStyle(row_id, ind, styleString);
    },

    /**
     * set align of values in columns
     * @param {String} alStr list of align values (possible values are: right,left,center,justify). Default delimiter is ”,”
     */
    setColAlign: function(alStr) {
        this._table.columnAlign(alStr);
    },

    /**
     * set vertical align of values in columns
     * @param {String} alStr vertical align values list for columns (possible values are: baseline,sub,super,top,text-top,middle,bottom,text-bottom) Default delimiter is ”,”
     */
    setColVAlign: function(alStr) {
        this._table.columnVAlign(alStr);
    },

    /**
     * set column types
     * @param {String} typeStr type codes list (default delimiter is ”,”)
     */
    setColTypes: function(typeStr) {
        //:todo deprecated
        this._table.setColTypes(typeStr);
    },

    /**
     * Return column type
     * @param {String} colIndex column Index
     * @return {String} column type
     */
    getColType: function(colIndex) {
        //:todo deprecated
        this._table.getColType(colIndex);
    },

    /**
     * set column sort types (avaialble: str, int, date, na or function object for custom sorting)
     * @param {String} sortStr sort codes list with default delimiter
     */
    setColSorting: function(sortStr) {
        //:todo deprecated
        this._table.setColSorting(sortStr);
    },

    /**
     * colorize columns background.
     * @param {String} clr comma delimited colors list
     */
    setColumnColor: function(clr) {
        //:todo deprecated
        this._table.setColumnColor(clr);
    },

    /**
     * set width of columns in percents
     * @param {String} wp list of column width in percents. Sum of the column widths must be equal to 100.
     */
    setInitWidthsP: function(wp) {
        //:todo deprecated
        this._table.setInitWidthsP(wp);
    },

    /**
     * set width of columns in pixels
     * @param {String} wp list of column width in percents. Sum of the column widths must be equal to 100.
     */
    setInitWidths: function(wp) {
        //:todo deprecated
        this._table.setInitWidths(wp);
    },

    /**
     * set header label and default params for new headers
     * @param {String} hdrStr header string with delimiters
     */
    setHeader: function(hdrStr) {
        //:todo deprecated
        this._table.columnTitle(hdrStr);
    },

    /**
     * enable/disable light mouse navigation mode (row selection with mouse over, editing with single click), mutual exclusive with enableEditEvents
     * @param {Boolean} mode - true/false
     */
    _lightNavigation: function(mode) {
        if (mode == "true") {
            mode = true;
        } else if (mode == "false") {
            mode = false;
        }
        if (mode != undefined)
            this._table.twoClickEdit(!mode);
    },

    /**
     * Add row to grid
     * @param {Object} data data for add to grid
     */
    addRow: function(data, pos) {
        if (this._isDrawn){
            //var ind = this._table.getRowsNum();s
            var rowData = (data && data.data) ? data.data : data; // fix for old data struct
            rowData.id = (data && data.data && data.data.id !== undefined) ? data.data.id : data.id;
            var row = this._table.addRow(rowData, pos);
            this._table.groupBy(this._table.groupBy());
        } else {
            var dataArr = this.data();
            if (dataArr.rows != undefined){
                var len = dataArr.rows.length;
                data.ind = (data.ind == undefined) ? len : data.ind;
                
                dataArr.rows.splice(data.ind, 0, data);
            }
        }
        return row;
    },

    addRowAfter: function(newId, text, siblId) {
        var row = ($.isArray(text)) ? text : [text],
            table = this._table,
            subPos = table.getRowPos(siblId);
        row.id = newId;

        row = table.addRow(row, siblId);
        return row;
    },

    copyRowContent: function(fromId, toId) {
        //:todo deprecated
        //this._table.copyRowContent(fromId, toId);
    },

    /**
     * Delete row from grid
     * @param {Number} ind index row for delete
     */
    deleteRow: function(ind) {
        if (this._isDrawn && this._table != null) {
            var row = (ind == undefined) ? this.getSelectedRow() : this._table.getRowByIndex(ind);
            if (row != undefined) {
                this._table.removeRow(row.id);
            }
        } else {
            if (ind != undefined) {
                var dataArr = this._project['data'];
                if (dataArr.rows != undefined){
                    dataArr.rows.splice(ind, 1);
                }
            }
        }
    },

    /**
     * Delete row from grid
     * @param {Number} id id row for delete
     */
    deleteRowById: function(id) {
        id = (id == undefined) ? this.getSelectedRowId() : id;
        if (id != undefined){
            this._table.removeRow(id);
        }
    },

    insertRow: function(pos, rowData) {
        var selInd = (this._table != null) ? this.getRowIndex(this.getSelectedRowId()) : null,
            index,
            rowsCount = this._getRowsCount();
        if (typeof pos == "number") {
            index = Math.max(0, Math.min(pos, rowsCount));
        } else {
            switch (pos){
                case "bottom":
                    index = rowsCount;
                break;
                case "top":
                    index = 0;
                break;
                case "above":
                    index = (selInd == null) ? 0 : selInd;
                break;
                case "beneath":
                    index = (selInd == null) ? rowsCount : (selInd + 1);
                break;
            }
        }

        if (index != undefined) {
            var row = (rowData == undefined) ? [] : rowData;
            this.addRow(row, index);
        }
        
        return index;
    },

    /**
     * set user data for target node
     * @param {String} itemId target node id
     * @param {String} name key for user data
     * @param {String} value user data value
     */
    setUserData: function(itemId, name, value) {
        this._table.setUserData(itemId, name, value);
    },

    /**
     * get user data for target node
     * @param {String} itemId target node id
     * @param {String} name key for user data
     */
    getUserData: function(itemId, name) {
        return this._table.getUserData(itemId, name);
    },


    /**
     * manage editibility of the grid
     * @param {Boolean} mode set not editable if FALSE, set editable otherwise
     */
    editable: function(mode) {
        //:todo deprecated
        this._table.readonly(mode);
    },

    /**
     * deletes selected row(s)
     */
    deleteSelectedRows: function() {
        this._table.removeRow(this._table.getSelectedRowsId());
    },

    /**
     * get selected row id
     * @return {String} selected row id
     */
    getSelectedRowId: function() {
        return this._table.getSelectedRowId();
    },

    getSelectedRow: function(){
        var ret = (this._table != null) ? this._table.getSelectedRow() : -1;
        return ret;
    },

    getSelectedRowsId: function() {
        return this._table.getSelectedRowsId();
    },

    selectRow: function(rIndex, call) {
        var row = this._table.getRowByIndex(rIndex);
        this._table.selectRow(row.id, call);
    },

    selectRowById: function(row_id, call) {
        this._table.selectRowById(row_id, call);
    },

    /**
     * moves row one position up if possible
     * @param {String} row_id row id
     */
    moveRowUp: function(row_id) {
        return this._table.moveRowUp(row_id);
    },

    /**
     * moves row one position down if possible
     * @param {String} row_id row id
     */
    moveRowDown: function(row_id) {
        return this._table.moveRowDown(row_id);
    },

    moveRow: function(rowId, way) {
        return this._table.moveRow(rowId, way);
    },

    getHtmlRowById: function(id) {
        //:todo deprecated
        return this._table.getRowById(id);
    },

    getRowIndex: function(id) {
        var ret = null;
        if (this._table == null){
            var data = this.getData();
            if (data.rows != undefined){
                for (var i =0, l = data.rows.length; i < l; i++){
                    if (data.rows[i].id == id){
                        ret = i;
                    }
                }
            }
        } else {
            ret = this._table.getRowPos(id);
        }
        return ret;
    },

    /**
     * gets a list of all row ids in grid
     */
    getAllRowId: function() {
        //:todo deprecated
        /*
        var ret = "";
        if (this._table != null){
            ret = this._table.getAllRowIds();
        } else {
            var data = this.data();
            if (data.rows != undefined){
                for (var i = 0, l = data.rows.length; i < l; i++){
                    ret += data.rows[i].id + ",";
                }
            }

        }
        return ret;
        */
    },

    getAllRowIdsArray: function() {
        //:todo deprecated
        /*
        var ret = [];
        if (this._table != null) {
            ret = this._table.getAllRowIds().split(',');
        } else {
            var data = this._project['data'];
            if (data.rows != undefined) {
                for (var i = 0, l = data.rows.length; i < l; i++) {
                    ret.push(data.rows[i].id);
                }
            }
        }
        return ret;
        */
    },


    rowCount: function(){
        return this._getRowsCount();
    },
    
    getRow: function(ind){
        var data = this.getData();
        if (data.rows != undefined){
            return data.rows[ind];
        }
    },

    getRowById: function(rid) {
        return this._table.getRow(rid);
    },

    getSubItems: function(rowId, colPos) {
        return this._table.getSubItems(rowId, colPos);
    },

    /**
     * Modify default style of grid and its elements. Call before or after Init
     * @param {String} ss_header style def. expression for header
     * @param {String} ss_grid style def. expression for grid cells
     * @param {String} ss_selCell style def. expression for selected cell
     * @param {String} ss_selRow style def. expression for selected Row
     */
    setStyle: function(ss_header, ss_grid, ss_selCell, ss_selRow) {
        //работает хорошо только в эксплорере
        //:todo deprecated
        //this._table.setStyle(ss_header, ss_grid, ss_selCell, ss_selRow);
    },

    enableAlterCss: function(cssE, cssU, perLevel, levelUnique) {
        //:todo deprecated
        this._table.enableAlterCss(cssE, cssU, perLevel, levelUnique);
    },

    _colorHeader: function(color) {
        this._table.headerColor(color);
    },

    _bgColorHeader: function(val){
        this._table.headerBgColor(val);
    },

    _applyUserData: function(data, userDataCols) {
        var len = data.length;
        var userData = this._userData;
        for (var j = 1; j < len; ++j) {
            for (var i in userDataCols) {
                var userDataValue = data[j][i];
                var userDataKey = userDataCols[i];
                var id = j;
                userData.rowData(id, userDataKey, userDataValue);
            }
        }
    },

    onRequestResetFilter: function() {
        this.clearSelection();
    },

    onRequestReloadData: function() {
        this._reloadData = this.getSelectedRowsId();
    },

    clearSelection: function() {
        if (this._isDrawn && this._table != null){
            this._table.clearSelection();
        }
    },

    treeToGridElement: function(newfunc) {
        //:todo deprecated
        //this._table.treeToGridElement = newfunc;
    },

    openItem: function(rowId) {
        this._table.openItem(rowId);
    },

    closeItem: function(rowId) {
        this._table.closeItem(rowId);
    },

    getOpenState: function(rowId) {
        return this._table.getOpenState(rowId);
    },

    gridToTreeElement: function(newfunc) {
        //:todo deprecated
        //this._table.gridToTreeElement = newfunc;
    },

    enableContextMenu: function(menu) {
        //:todo deprecated
        //if (menu != undefined)
        //    this._table.enableContextMenu(menu);
    },

    /**
     * gets cell object
     * @param {String} row_id row id
     * @param {String} col column index
     * @return {Object} cell object
     */
    cell: function(row_id, col) {
        //:todo deprecated
        //return this._table.cells(row_id, col);
    },

    setOption: function(prop, val) {
        //:todo deprecated
    },

    getOption: function(prop) {
        //:todo deprecated
    },

    /**
     * gets cell object
     * @param {String} row_id row id
     * @param {String} col column index
     * @return {Object} cell object
     */
    cell2: function(row_id, col) {
        //:todo deprecated
//        return this._table.cells2(row_id, col);
    },

    /**
     * Clear grid
     */
    clear: function() {
        if (this._isDrawn) {
            this._table.clear();
        }
    },

    /**
     * Return widget table
     * @return {Object} table
     */
    table: function() {
        return this._table;
    },

    editStop: function(mode) {
        this._table.editStop();
    },

    enableTreeCellEdit: function(mode) {
        //:todo deprecated
        //this._table.enableTreeCellEdit(mode);
    },

    enableMercyDrag: function(flag) {
        //:todo deprecated
//        if (flag != undefined) {
//            this._table.enableMercyDrag(flag);
//        }
    },

    hasChildren: function(rowId) {
        //:todo deprecated
//        return this._table.hasChildren(rowId);
    },

    gridToGrid: function(callback) {
        //:todo deprecated
//        return this._table.gridToGrid = callback;
    },

    expandAll: function() {
        this._table.expandAll();
    },

    collapseAll: function(rowId) {
        this._table.collapseAll(rowId);
    },

    getLevel: function(itemId) {
        //:todo deprecated
//        return this._table.getLevel(itemId);
    },

    /**
     * Return widget table
     * @return {String} Id node id
     */
    getItemText: function(id) {
        //:todo deprecated
//        return this._table.getItemText(id);
    },

    setItemText: function(rowId, newText) {
        //:todo deprecated
//        this._table.setItemText(rowId, newText);
    },

    doesRowExist: function(id) {
        //:todo deprecated
//        return this._table.doesRowExist(id);
    },

    setDragBehavior: function(mode) {
        //:todo deprecated
//        return this._table.setDragBehavior(mode);
    },

    setNoHeader: function(fl) {
        //:todo deprecated
//        return this._table.setNoHeader(fl);
    },

    setRowColor: function(rowId, color) {
        this._table.setRowColor(rowId, color);
    },

    /**
     * Return widget parent id
     * @return {String} Id node id
     */
    getParentId: function(id) {
        //:todo deprecated
//        return this._table.getParentId(id);
    },

    value: function(cords, val) {
        if (cords === null){
            this.clearSelection();            
        }
        if (cords != undefined) {
            var row = cords.row,
                rowId = (row == undefined) ? this.getSelectedRowId() : row,
                column = (cords.column == undefined) ? 0 : cords.column;
            if (row != undefined && !isNaN(row)){
                //table row starts from 1 not 0, if filled from view
                rowId++;
            }
            if (rowId != undefined && column != undefined && val != undefined) {
                if (this._table != null)
                    this._table.setCellValue(rowId, column, val);
            }
        }

        var data = null;
        if (this._table != null) {
            var ids = this._table.getSelectedRows();
            if (ids.length > 0){
                var model = this.colmodel();
                var columnName = [];
                for (var i = 0, l = model.length;  i < l; i++){
                    var ind = this._table.getColPosById(model[i].colUid);
                    ind = (ind == undefined) ? i : ind;
                    columnName[ind] = model[i].name;
                }

                    var rowData = ids[0];
                    for(var j = 0, k = rowData.length; j < k; j++) {
                        if (data === null) {data = {};}
                        data[j] = rowData[j];
                        data[columnName[j]] = rowData[j];
                    }
                data.length = ids.length;
            }
        }
        return data;
    },

    collectDataSchema: function(dataSchema) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var columns = {};

        var colModel = this.colmodel();

        for (var i = 0; i < colModel.length; ++i) {
            var column = colModel[i];
            var id = column['colUid'];
            var name = (column['name'] != undefined) ? column['name'] : id;
            var dataType = column['dataType'] || AC.Widgets.WiziCore_Api_Form.Type.STRING;

            columns[id] = {
                'label': name,
                'type': AC.Widgets.WiziCore_Api_Form.Kind.SIMPLE,
                'structure': dataType
            };
        }

        var description = {
            'label': this.name(),
            'type': AC.Widgets.WiziCore_Api_Form.Kind.OBJECT_LIST,
            'structure': columns
        };

        dataSchema[this.id()] = description;
        return description;
    },

    appendValueToDataObject: function(dataObject, invalidMandatoryWidgets, force) {
        if (!force && !this.isIncludedInSchema()) {
            return undefined;
        }

        var data = this.data();
        var colModel = this.colmodel();

        var columnIds = [];

        for (var i = 0; i < colModel.length; ++i) {
            var column = colModel[i];
            columnIds[i] = column['colUid'];
        }

        var rows = (data != undefined) ? data.rows : [];

        dataObject[this.id()] = {
            columns: columnIds,
            rows: rows
        };
        return true;
    },

    setValueFromDataObject: function(dataObject) {
        if (!this.isIncludedInSchema()) {
            return undefined;
        }

        var data = {
            rows: []
        };
        var value = this._getValueFromDataObject(dataObject);
        if (value !== null && value !== undefined) {
            var rows = value.rows;

            data = {
                rows: rows
            };

            // TODO: rearrange data if needed

            /*
             var colModel = widget.prop('colmodel');

             var columnIds = [];

             for (var i = 0; i < colModel.length; ++i) {
             var column = colModel[i];
             columnIds[i] = column['colUid'];
             }
             */

            this.data(data);
        }
        else {
            this.resetValue();
        }

        return true;
    },

    resetValue: function() {
        var value = this.getDefaultData();
        this.data(value);
    },

    _getDataKey: function(rowIndex) {
        if (this._isDrawn && this._table != null) {
            var row = this._table.getRowByIndex(rowIndex);
            return this.getUserData(row.id, 'data_key');
        } else {
            var data = this._project['data'];
            var res = undefined;
            if (data.rows != undefined) {
                var row = data.rows[rowIndex];
                res = row.key;
            }
            return res;
        }
    },

    _setDataKey: function(rowIndex, value) {
        if (this._isDrawn && this._table != null) {
            var row = this._table.getRowByIndex(rowIndex);
            this.setUserData(row.id, 'data_key', value);
        } else {
            var data = this._project['data'];
            if (data.rows != undefined) {
                var row = data.rows[rowIndex];
                row.key = value;
            }
        }
    },

    // TODO: deprecate
    _getExtData: function(rowIndex, name) {
        if (this._isDrawn && this._table != null) {
            var row = this._table.getRowByIndex(rowIndex);
            return this.getUserData(row.id, name);
        } else {
            var data = this._project['data'];
            var res = undefined;
            if (data.rows != undefined) {
                var row = data.rows[rowIndex];
                if (name in row) {
                    res = row[name];
                }
            }
            return res;
        }
    },

    // TODO: deprecate
    _setExtData: function(rowIndex, name, value) {
        if (this._isDrawn && this._table != null) {
            var row = this._table.getRowByIndex(rowIndex);
            this.setUserData(row.id, name, value);
        } else {
            var data = this._project['data'];
            if (data.rows != undefined) {
                var row = data.rows[rowIndex];
                row[name] = value;
            }
        }
    },

    _getRowAppChange: function(rowIndex, fieldsMap) {
        var rowDataKey = this._getDataKey(rowIndex);
        rowDataKey = (rowDataKey == '') ? null : rowDataKey;
        var res = {
            key: rowDataKey,
            data: {}
        };

        var row = null;
        if (this._isDrawn && this._table != null) {
            row = this.getRow(rowIndex);
        } else {
            var data = this._project['data'];
            if (data.rows != undefined) {
                row = data.rows[rowIndex];
            }
        }

        for (var i in fieldsMap) {
            res.data[i] = row.data[fieldsMap[i]];
        }

        return res;
    },

    _getRowsCount: function() {
        var count = 0;
        if (this._isDrawn && this._table != null) {
            count = this._table.getDataLink().length;
        } else {
            var dataArr = this._project['data'];
            if (dataArr.rows != undefined) {
                count = dataArr.rows.length;
            }
        }
        return count;
    },

    _findField: function(field) {
        var colModel = this.model();
        for (var j = 0, l = colModel.length; j < l; ++j) {
            var column = colModel[j];
            if (column['colUid'] == field) {
                return j;
            }
        }
        return undefined;
    },

    syncForeignAppData: function(callback, reportingStatusesCallback) {
        this._syncViewData(callback, reportingStatusesCallback);
    },

    getDataFromMap: function(dataArray, map) {
        var res = {rows: []};
        var length = dataArray.length;
        for (var i = 0; i < length; i++) {
            var row = {data: []};
            for (var j in map) {
                var mapValue = map[j];
                if (mapValue != undefined) {
                    row.data[j] = AC.Widgets.Base.getDataItemWithMap(dataArray[i], mapValue);
                }
            }
            row['id'] = i + 1;
            res.rows.push(row);
        }
        return res;
    },

    sum: function(colName){
        var data = this.getData();
        var colModel = this.colmodel();
        var pos = 0;
        for (var i = 0, l = colModel.length; i < l; i++){
            if (colModel[i].name == colName){
                pos = i;
                break;
            }
        }
        if (typeof(colName) == "string" && !isNaN(+colName)){
            pos = +colName;
        }
        var sumValue = 0;
        var cVal = 0;
        if (typeof data == "object" && data.rows != undefined){
            data = data.rows;
            for (var i = 0, l = data.length; i < l; i++){
                if (data[i].data != undefined && data[i].data[pos] != undefined){
                    cVal = data[i].data[pos];
                    if (!isNaN(parseFloat(cVal))){
                        sumValue += (parseFloat(cVal) - 0);
                    }
                }
            }
        }
        return sumValue;
    },

    search: function(what, colNames, start, caseSens, equal){
        equal = (equal == undefined) ? false : equal;
        start = (start == undefined) ? 0 : start;
        colNames = (colNames == undefined) ? [] : colNames;
        caseSens = (caseSens == undefined) ? false : caseSens;
        what = (caseSens == false) ? (what + "").toLowerCase() : what;
        var data = this.getData();
        var colModel = this.colmodel();
        var colPos = [];
        for (var i = 0, l = colModel.length; i < l; i++){
            //collect column position
            if (colNames.length == 0 || WiziCore_Helper.inArray(colModel[i].name, colNames)){
                colPos.push(i);
            }
        }

        var res = [];
        function checkItem (item){
            item = (caseSens == false) ? (item + "").toLowerCase() : item;
            var ret = (equal) ? (item == what) : ((item + "").indexOf(what) != -1);
            return ret;
        }
        if (data.rows != undefined){
            for (var i = start, l = data.rows.length; i < l; i++){
                var item = data.rows[i].data;
                for (var j = 0, k = colPos.length; j < k; j++){
                    if (item[colPos[j]] != undefined && checkItem(item[colPos[j]])){
                        res.push({columnName: colModel[colPos[j]].name, index: i});
                    }
                }
            }
        }
        return res;
    },

    getDataModel: function() {
        var values = [];
        var model = this.colmodel();
        for (var i in model) {
            values.push({name: model[i].title, value: "", uid: model[i].colUid});
        }
        return values;
    },

    setRowId: function(index, id) {
        //:todo deprecated
//        this._table.setRowId(index, id);
    },

    /**
     * Return array of sub items ids
     * @param id
     */
    getSubItemsArray: function(id) {
        //:todo deprecated
//        var subItems = this._table.getSubItems(id);
//        return (subItems.length != 0) ? subItems.split(',') : [];
    },

    moveRowTo: function (srowId, trowId, mode, dropmode, sourceGrid, targetGrid) {
        //:todo deprecated
//        return this._table.moveRowTo(srowId, trowId, mode, dropmode, sourceGrid, targetGrid);
    },

    changeRowId: function (oldRowId, newRowId) {
        //:todo deprecated
//        this._table.changeRowId(oldRowId, newRowId);
    }
}));

/**
 * Return default inline edit prop
 * @return {Object} default inline edit prop
 */
WiziCore_UI_GridWidget.inlineEditPropName = function() {
    return "data";
};

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name,
        AC.Property.general.data,
        AC.Property.general.lightnavigation,
        AC.Property.general.colwidthtype,
        AC.Property.general.elementsPerPage,
        AC.Property.general.currPage
    ]},
    { name: AC.Property.group_names.database, props:[
        AC.Property.database.isIncludedInSchema,
        AC.Property.database.foreignAppWriting,
        AC.Property.database.autoRelationships
    ]},
    { name: AC.Property.group_names.layout, props:[
        AC.Property.layout.width,
        AC.Property.layout.height,
        AC.Property.layout.x,
        AC.Property.layout.y,
        AC.Property.layout.zindex,
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer,
        AC.Property.layout.repeat
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
        AC.Property.data.colmodel,
        AC.Property.data.autoLoad,
        AC.Property.data.keyFields
    ]},
    { name: AC.Property.group_names.style, props:[
        AC.Property.behavior.opacity,
        AC.Property.style.shadow,
        AC.Property.style.defaultHeaderFont,
        AC.Property.style.defaultHeaderColor,
        AC.Property.style.bgColorHeader,
        AC.Property.style.defaultDataFont,
        AC.Property.style.defaultDataColor,
        AC.Property.style.alternativeRowBgColor,
        AC.Property.style.margin,
        AC.Property.style.border,
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
WiziCore_UI_GridWidget.props = function() {
    return _props;

};


    WiziCore_UI_GridWidget.colmodel = function() {
        var colmodel = {
            title: {type: "text", value: "Title", group: AC.Property.group_names.data, alias: "proptype_dgcm_tp_title", sweight: 1, weight: 1},
            name: {type: "text", value: "name", group: AC.Property.group_names.data, alias: "proptype_dgcm_tp_name"},
            dataType: {type: "datatype", value: AC.Widgets.WiziCore_Api_Form.Type.STRING, group: AC.Property.group_names.data, alias: "proptype_dgcm_tp_datatype"},
            width: {type: "colwidth", value: "10", group: AC.Property.group_names.layout, alias: "proptype_dgcm_tp_width", sweight: 2, weight: 2},
            align: {type: "align", value: "left", group: AC.Property.group_names.layout, alias: "proptype_dgcm_tp_align", weight: 3},
            valign: {type: "valign", value: "bottom", group: AC.Property.group_names.layout, alias: "proptype_dgcm_tp_valign", weight: 4},
            visible: {type: "boolean", value: true, group: AC.Property.group_names.layout, alias: "proptype_dgcm_tp_visible", weight: 5},
            bg: {type: "color", value: "", group: AC.Property.group_names.style, alias: "proptype_dgcm_tp_bg",sweight: 3, weight: 5},
            sort: {type: "sort", value: "na", group: AC.Property.group_names.appearance, alias: "proptype_dgcm_tp_sort", sweight: 4, weight: 6},
            type: {type: "etypes", value: "ro", group: AC.Property.group_names.appearance, alias: "proptype_dgcm_tp_type", weight: 7},
            groupby: {type: "boolean", value: false, group: AC.Property.group_names.appearance, alias: "widget_groupby", weight: 8},
            font: {type: "tfont", value: "", group: AC.Property.group_names.style, alias: "widget_font", weight: 11},
            color: {type: "color", value: "", group: AC.Property.group_names.style, alias: "widget_color", weight: 12},
            datacolor: {type: "color", value: "", group: AC.Property.group_names.style, alias: "widget_datacolor", weight: 13},
            datafont: {type: "tfont", value: "", group: AC.Property.group_names.style, alias: "widget_datafont", weight: 14},
            total: {type: "boolean", value: false, group: AC.Property.group_names.appearance, alias: "widget_total", weight: 15}
            //,split: {type: "boolean", value: false, group: AC.Property.group_names.appearance, alias: "widget_split", weight: 13}
        };
    WiziCore_UI_GridWidget.colmodel = function(){return colmodel};
    return colmodel;
};

/**
 * Return default widget prop
 * @return {Object} default properties
 */

    var defProps = {
        valName: "selectedValue",
        width: 400,
        height: 200,
        x: 0,
        y: 0 ,
        zindex: "auto",
        colmodel: [
                {title: "Column1", name: 'column1', width: 100}
        ],
        lightnavigation: false,
        bgHeaderColor: "#c0c0c0",
        anchors: {left: true, top: true, bottom: false, right: false},
        visible: true,
        enable: true,
        readonly: false,
        widgetStyle: "default",
        colwidthtype: "%",
        enableDragAndDrop: false,
        dragAndDrop: false, resizing: false,
        margin: "", alignInContainer: 'left',
        hourglassImage: "Default",
        displayHourglassOver: "inherit", customCssClasses: "",
        name: "grid1",
        elementsPerPage : WiziCore_UI_GridWidget.DEFAULT_ELEMENTS_PER_PAGE,
        currPage : 1,
        currRowIndex: 0,
        shadow: "",
        opacity: 1
    };
WiziCore_UI_GridWidget.defaultProps = function() {
    return defProps;
};

WiziCore_UI_GridWidget.DEFAULT_ELEMENTS_PER_PAGE = 10;

/**
 * onRowSelect event
 */
WiziCore_UI_GridWidget.onRowSelect = "E#Grid#onRowSelect";
WiziCore_UI_GridWidget.onRowLoaded = "E#Grid#onRowLoaded";
/**
 * onRowSelect event
 */
WiziCore_UI_GridWidget.onEditCell = "E#Grid#onEditCell";
/**
 * occurs when item's dragging starts (the item is selected and the mouse is moving);
 */
WiziCore_UI_GridWidget.onBeforeDrag = "E#Grid#BeforeDrag";
/**
 * occurs when the item was dragged and dropped on some other item, but before item's moving is processed;
 */
WiziCore_UI_GridWidget.onDrag = "E#Grid#Drag";
/**
 * occurs when the item is dragged over some target the item can be dropped to;
 */
WiziCore_UI_GridWidget.onDragIn = "E#Grid#DragIn";
/**
 * occurs when the scrolling
 */
WiziCore_UI_GridWidget.onScroll = "E#Grid#Scroll";
/**
 * occurs when drag-and-drop had already been processed; also occurs when the nodes are moved programmatically;
 */
WiziCore_UI_GridWidget.onDrop = "E#Grid#Drop";
/**
 * occurs when drag-and-drop had already been processed; also occurs when the nodes are moved programmatically;
 */
WiziCore_UI_GridWidget.onCellChanged = "E#Grid#onCellChanged";
WiziCore_UI_GridWidget.onSelectStateChanged = "E#Grid#onSelectStateChanged";
WiziCore_UI_GridWidget.onGridReconstructed = "E#Grid#onGridReconstructed";
WiziCore_UI_GridWidget.onOpenEnd = "E#Grid#onOpenEnd";

WiziCore_UI_GridWidget.onBeforeContextMenu = "E#Grid#onBeforeContextMenu";
WiziCore_UI_GridWidget.onRowCreated = "E#Grid#onRowCreated";
WiziCore_UI_GridWidget.onRowAdded = "E#Grid#onRowAdded";
WiziCore_UI_GridWidget.onKeyPress = "E#Grid#onKeyPress";

WiziCore_UI_GridWidget.onRowDblClicked = "E#Grid#onRowDblClicked";

//"onRowAdded"

    var actions = {
            onRowSelect: {alias: "widget_event_onrowselect", funcview: "onRowSelect", action: "AC.Widgets.WiziCore_UI_GridWidget.onRowSelect", params: "id, index", group: "widget_event_mouse"},
            onRowLoaded : {alias : "widget_event_onrowloaded", funcview : "onRowLoaded", action : "AC.Widgets.WiziCore_UI_GridWidget.onRowLoaded", params : "id, index", group : "widget_event_general"},
            onEditCell: {alias: "widget_event_oneditcell", funcview: "onEditCell", action: "AC.Widgets.WiziCore_UI_GridWidget.onEditCell", params: "stage,rowId,columnIndex,value", group: "widget_event_mouse"},
            onScroll: {alias: "widget_event_onscroll", funcview: "onScroll", action: "AC.Widgets.WiziCore_UI_GridWidget.onScroll", params: "scrollLeft,scrollTop", group: "widget_event_mouse"},
            onCellChanged: {alias: "widget_event_oncellchanged", funcview: "onCellChanged", action: "AC.Widgets.WiziCore_UI_GridWidget.onCellChanged", params: "rowId,columnIndex,newValue,oldValue", group: "widget_event_general"},
            onSelectStateChanged: {alias: "widget_event_onselectstatechanged", funcview: "onSelectStateChanged", action: "AC.Widgets.WiziCore_UI_GridWidget.onSelectStateChanged", params: "id", group: "widget_event_general"},
            onGridReconstructed: {alias: "widget_event_ongridreconstructed", funcview: "onGridReconstructed", action: "AC.Widgets.WiziCore_UI_GridWidget.onGridReconstructed", params: "gridObj", group: "widget_event_general"},
            onOpenEnd: {alias: "widget_event_onopenend", funcview: "onOpenEnd", action: "AC.Widgets.WiziCore_UI_GridWidget.onOpenEnd", params: "id,state", group: "widget_event_general"},
            dataLoaded : {alias : "widget_event_ondataloaded", funcview : "onDataLoaded", action : "AC.Widgets.Base.onDataLoaded", params : "error, data", group : "widget_event_data", sweight : 5},
            dataReset : {alias : "widget_event_ondatareset", funcview : "onDataReset", action : "AC.Widgets.Base.onDataReset", params : "", group : "widget_event_data"}
        };
/**
 * Return available widget actions
 * @return {Object} available actions
 */
WiziCore_UI_GridWidget.actions = function() {
    return actions;
};

WiziCore_UI_GridWidget.isField = function() {
    return false
};
})(jQuery,window,document);