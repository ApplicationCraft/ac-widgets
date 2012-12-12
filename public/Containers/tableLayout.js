/**
 * @lends       WiziCore_UI_TableLayoutWidget#
 */
(function($, window, document, undefined){
var WiziCore_UI_TableLayoutWidget = AC.Widgets.WiziCore_UI_TableLayoutWidget =  AC.Widgets.WiziCore_Widget_Container.extend($.extend({}, WiziCore_ContainerDataBind, WiziCore_WidgetAbstract_DataIntegrationContainer, {
    _widgetClass : "WiziCore_UI_TableLayoutWidget",
    _table: null,
    _cells: null,
    isDraggable: true,
    /**
     * Description of constructor
     * @class  Container widget
     * @author      Timofey Tatarinov
     * @version     0.2
     *
     * @constructs
     */
    init: function() {
        this._allowChange = true;
        this._cells = [];
        this._super.apply(this, arguments);
    },

    draw : function() {
        this._redrawTable();

        this._super.apply(this, arguments);
    },

    getWidgetColumnRow: function(w){
        var res = {row: null, column: null};
        var rows = this.rows();
        var columns = this.columns();

        for (var i = 0; i < this._children.length; i++){
            if (w._htmlId == this._children[i]._htmlId){
                res.row = Math.ceil((i + 1) / columns);
                res.column = (i + 1) - ((res.row - 1) * columns);
                break;
            }
        }
        return res;
    },

    columns: function(val, column) {
        if (val !== undefined) {

            if (val < 1) {
                return this._project['columns'];
            }
            var res = this._applyColumnChange(val, column); //column to operate with
            if (res) {
                this._project['columns'] = val;
                this._redrawTable();
            }
        }
        return this._project['columns'];
    },

    rows: function(val, row) {
        if (val !== undefined) {
            if (val < 1) {
                return this._project['rows'];
            }
            var res = this._applyRowsChange(val, row); //row to operate with
            if (res) {
                this._project['rows'] = val;
                this._redrawTable();
            }

        }
        return this._project['rows'];
    },

    _applyRowsChange: function(val, row) {
        var rows = this._project['rows'];
        var columns = this._project['columns'];
        if (val < rows) { // remove rows
            if (row != undefined){
                return this._processRowRemove(row);
            } else {
                return this._processRowsRemove(val);
            }
        }
        else { // add Rows
            for (var j = rows * columns, l = val * columns; j < l; ++j) {
                if (row != undefined){
                    this._addContainerToChildren(columns*(row));
                } else {
                    this._addContainerToChildren();
                }
            }
        }
        return true;
    },

    _applyColumnChange: function(val, column) { //check is it possible to remove or add columns
//        var children = this.children();
        var columns = this._project['columns'];
        if (this._project['columns'] > val) { //removing
            if (column != undefined){
                return this._processColumnRemove(column);
            } else {
                return this._processColumnsRemove(val);
            }
        }
        else { //add
            for (var rowIndex = this.rows() - 1; rowIndex > -1; --rowIndex) { // for each row
                for (var colIndex = columns; colIndex < val; ++colIndex) {
                    var itemPos = (rowIndex * columns) + ((column != undefined) ? column : colIndex);
                    this._addContainerToChildren(itemPos);
                }
            }
        }
        return true;
    },

    _processRowRemove: function(row){
        var isWidgetsInCell = false;
        var rows = this._project['rows'];
        var columns = this._project['columns'];
        var children = this.children();
        var deleteArray = [];
        for (var pos = (row - 1) * columns; pos < row*columns; ++pos){
            if (children[pos] && children[pos].children().length > 0){
                isWidgetsInCell = true;
                break;
            }
            deleteArray.push(pos);
        }
        if (isWidgetsInCell){
            return false;
        } else {
            for (var x = 0; x < deleteArray.length; ++x){
                this._children[deleteArray[x]].remove();
            }
            this._children.splice(deleteArray[0], deleteArray.length);
        }
        return true;
    },

    _processColumnRemove: function(column){
        var children = this.children();
        var columns = this._project['columns'];
        var rows = this._project['rows'];
        var isWidgetsInCell = false;
        var deleteArray = [];
        for (var item = (column - 1); item < children.length; item += columns){
            if (children[item] && children[item].children().length > 0){
                isWidgetsInCell = true;
                break;
            }
            deleteArray.push(item);
        }
        if (isWidgetsInCell){
            return false;
        } else {
            for (var i = deleteArray.length - 1; i > -1; --i){
                this._children[deleteArray[i]].remove();
                this._children.splice(deleteArray[i], 1);
            }
        }
        return true;
    },

    _processRowsRemove: function(val) {
        var isWidgetsInCell = false;
        var rows = this._project['rows'];
        var columns = this._project['columns'];
        var children = this.children();
        for (var rowIndex = val; rowIndex < rows; ++rowIndex) {
            for (var i = 0; i < columns; ++i) {
                var pos = (rowIndex * columns) + i;
                if (children[pos] && children[pos].children().length > 0) {
                    isWidgetsInCell = true;
                    break;
                }
                if (isWidgetsInCell) {
                    break;
                }

            }
        }
        if (isWidgetsInCell) { // widget exists cant remove
            return false;
        }
        else { // clean cells
            for (var j = val * columns, l = rows * columns; j < l; j++) {
                this._children[i].remove();
            }
            this._children.splice(val * columns, (rows * columns - val * columns));
        }
        return true;
    },

    _processColumnsRemove: function(val) {
        var children = this.children();
        var columns = this._project['columns'];
        var isWidgetsInCell = false;
        var posForRemove = [];
        for (var rowIndex = 0, rowLength = this.rows(); rowIndex < rowLength; ++rowIndex) { // check each row
            for (var colIndex = val; colIndex < columns; ++colIndex) {
                var itemPos = (rowIndex * columns) + colIndex;
                if (children[itemPos] && children[itemPos].children().length > 0) {
                    isWidgetsInCell = true;
                    break;
                }
                posForRemove.push(itemPos);
            }
            if (isWidgetsInCell) {
                break;
            }
        }

        if (isWidgetsInCell) {
            return false;
        }
        else { // clean cells
            for (var i = posForRemove.length - 1; i > -1; --i) {
                this._children[posForRemove[i]].remove();
                this._children.splice(posForRemove[i], 1);
            }
        }
        return true;
    },

    _addContainerToChildren: function(pos) {
        var propsDefault = AC.Core.Widgets().getDefaultWidgetProperties("ContainerForTable");
        var child = this.addNewWidget({widgetClass: "ContainerForTable", project: propsDefault, posInChildren: pos});
        this._setContainerProps(child);
        this._setWidgetPosition(child);
        //to update tablecellstyle property
        child._pos = pos;
        var self = this;
        $(child).bind(AC.Widgets.ContainerForTable.onChangeProperty, function(ev, prop, val){
            self._onChildChangeProp(this._pos, prop, val);
            return false;
        });
        return child;
    },

    getContainerCoordsByPos: function(pos){
        var coords = {row: null, col: null};
        var rows = this._project['rows'];
        var columns = this._project['columns'];
        /*coords.col = pos - (Math.round((pos / rows) - 0.5) * columns);
        coords.row = Math.round((pos - coords.col) / columns - 0.5);*/
        coords.row = Math.round(pos / columns - 0.5);
        coords.col = pos - coords.row * columns;
        return coords;
    },

    _appendChildren: function() {
        var self = this, child, mode = this.mode();
        for (var i = 0, l = this._cells.length; i < l; ++i) {
            child = this._children[i];
            if (child) {
                $(child).bind(AC.Widgets.ContainerForTable.onChangeProperty, function(ev, prop, val){
                    self._onChildChangeProp(this._pos, prop, val);
                    return false;
                });

                child._pos = i;
                if (!child._isDrawn) {
                    this._drawChild(child, i);
                    if (this._isDrawn) {
                        child.onPageDrawn();
                    }
                } else {
                    child.base().appendTo(this._cells[i]);

                }

            }
        }
    },

    _onChildChangeProp: function(pos, prop, val){
        if (!this._allowChange){
            return;
        }
        var coords = this.getContainerCoordsByPos(pos);
        var cells = this.cellsStyle();
        cells[coords.row] = cells[coords.row] || [];
        cells[coords.row][coords.col] = cells[coords.row][coords.col] || {};
        cells[coords.row][coords.col][prop] = val;
        this.cellsStyle(cells);
    },

//    onPageDrawn: function() {
//
//    },

    _setContainerProps: function(item) {
        item.parent(this);
        item.isDraggable = this;
        item.isEditable = false;
        item.isResizable = false;
//        item.wrapSelect = true;
        item._manualDrawPosition = false;
    },

    _redrawTable: function() {
        this._cells.length = 0;
        var table = $("<table></table>").css({width: '100%', height: '100%'});
        for (var i = 0, l = this.rows(); i < l; ++i) {
            var tr = $('<tr></tr>');
            for (var j = 0, lj = this.columns(); j < lj; ++j) {
                var td = $('<td class="waTableLayoutWidgetTd"></td>');
                if (WiziCore_Helper.checkForIE8()) {
                    td.css('padding', '1');
                }
                tr.append(td);
                this._cells.push(td);


            }
            if ($.browser.mozilla)    // fix for firefox, div 100% height in the cell
                tr.append('<td style="width:0px"><div style="position:relative;height:100%;display:table; width:0px"></div></td>');
            table.append(tr);
        }

        this._appendChildren();
        this._applyCellSize(this.cellsSize());
        if (this._table) {
            this._table.empty().remove();
        }

        this._table = table;
        this._setChildrenInTable();
        this.base().append(table);
        this._applyCellStyle(this.cellsStyle());
        this._updateLayout();
    },

    _setWidgetPosition: function(w) { // do not use layouting
        var base = w.base();
//        var isPixelHeight = (w.tableBase().parent()[0] && w.tableBase().parent()[0]['rowHeight']) ? (w.tableBase().parent()[0]['rowHeight'].indexOf('%') == -1) : false;
//        var heightProp = (isPixelHeight && w.getLayoutType() != 'absolute')? 'min-height' : 'height';
//        w._tableBase.css({height:'', 'min-height':'', 'width': '100%', position: 'relative', 'float': 'left', overflow: 'hidden', outline: "none"});
        w._tableBase.css({position: "relative", height: '100%', 'width': '100%', 'float': 'left'});
        w.padding && base.css('padding', w.padding());
        base.css({"-ms-box-sizing": 'border-box', "-webkit-box-sizing": 'border-box',
                         "-moz-box-sizing": 'border-box', "box-sizing": 'border-box'});
//        if ($.browser.webkit || $.browser.mozilla) {
//            w._tableBase.css({'display': 'table-cell', height: '100%'});
//        }
//        if ($.browser.mozilla && isPixelHeight) {
//            w._tableBase.css({'display': '', height: '' });
//        }
    },

    _updateLayout: function() {
        var self = this;
        this._super();
        this._table.width('100%');
        setTimeout(function(){
            //fix for Chrome browser, does not set actual height (0 by default)
            if (self._project){
                self._table.height(self.height());
            }
        }, 0);
    },

    _drawChild: function(child, index) {
        if (child._isDrawn) {
            this._cells[index].append(child.tableBase());
        }
        else {
            child.draw(this._cells[index]);
        }

    },

    _setChildrenInTable: function() {
        var children = this.children();
        for (var i = 0, l = this._cells.length; i < l; ++i) {
            var child = children[i];
            if (!children[i]) {
                child = this._addContainerToChildren(i);
            }
            this._setContainerProps(child);
        }
    },

    _setColumnWidth: function(col, val){
        if (col == undefined || val == undefined){
            return;
        }
        var cells = this.cellsSize();
        var val = (val.toString().match(/px|\%/)) ? val : val + "px";
        cells['w'][col - 1] = val;
        this.cellsSize(cells);
        this._applyCellSize(this.cellsSize());
    },

    _setRowHeight: function(row, val){
        if (row == undefined || val == undefined){
            return;
        }
        var cells = this.cellsSize();
        var val = (val == "") ? val : (val.toString().match(/px|\%/)) ? val : val + "px";
        cells['h'][row - 1] = val;
        this.cellsSize(cells);
        this._applyCellSize(this.cellsSize());
    },

    _applyCellStyle: function(value){
        if (value == undefined || value.length == 0){
            return;
        }
        this._allowChange = false;
        var col = this.columns();
        var rows = this.rows();
        for (var i = 0; i < rows; ++i) {
            if (!value[i]) {
                continue;
            }
            for (var j = 0; j < col; ++j) {
                var item = value[i][j];
                if (item == undefined) {
                    continue;
                }
                var cell = i * col + j,
                    props = this._backgroundImageProps(item['backgroundimage'], item['backgroundrepeat']);
                props['background-color']  = item['bgcolor'];
                props['opacity']  = item['opacity'];
                //this._cells[cell].css("border", styleCell['border']);//set border
                //set other props for widget in cell
                this._cells[cell].css(props);
            }
        }
        this._allowChange = true;
    },

    _applyCellSize: function(value) {
        value = this._fixCellSize(value);
        var col = this.columns(),
            rows = this.rows(),
            emptyHeight = (($.browser.ie) ? "" : "100%"),
                i,j,rowHeight, cellWidth, cell;
        for (i = 0; i < rows; ++i) {
//            value['h'][i] = value['h'][i].replace("%","");
            rowHeight = (value['h'][i] == "" ) ? emptyHeight : value['h'][i];
            for (j = 0; j < col; ++j) {
                cellWidth = value['w'][j];
                cell = i * col + j;
                this._cells[cell].css({width :cellWidth});
                this._cells[cell].parent().css({height: rowHeight});
//                this._cells[cell][0].rowHeight = rowHeight;
                if (this._children[cell]) {
                    this._setWidgetPosition(this._children[cell]);
                }
            }
        }
    },

    _fixCellSize: function(value) {
        var col = this.columns();
        var rows = this.rows();
        var modified = false;
        if (value == undefined) {
            value = {h: [], w: []};
            modified = true;
        }

        if (value['w'].length < col) {
            modified = true;
            for (var i = value['w'].length; i < col; ++i) {
                value['w'].push((Math.ceil(100 / col)) + '%');
            }
        } else if (value['w'].length > col) {
            modified = true;
            value['w'].splice(col, value['w'].length - col);
        }

        if (value['h'].length < rows) {
            modified = true;
            for (var j = value['h'].length; j < rows; ++j) {
                value['h'].push('40px');
            }
        } else if (value['h'].length > rows) {
            modified = true;
            value['h'].splice(rows, value['h'].length - rows);
        }

        if (modified) {
            this._project['cellsSize'] = value;
        }

        return value;
    },

    currentContainer: function(){
        return this.children()[0];
    },

    initProps: function() {
        this._super();
        this.name = this.normalProperty('name');

        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.bg = this.themeProperty('bgColor', this._bg);

        this.enable = this.htmlProperty('enable', this._updateEnable);
        this.visible = this.htmlProperty('visible', this._visible);
        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._updateReadonly);
        this.cellsSize = this.htmlProperty('cellsSize', this._applyCellSize);
        this.cellsStyle = this.cellsStyleFunc();
        this.backgroundImage = this.themeProperty("backgroundImage", this._updateBackgroundImage);
        this.backgroundRepeat = this.themeProperty("backgroundRepeat", this._updateBackgroundImage);

        this.foreignAppWriting = this.normalProperty('foreignAppWriting');
        this.autoRelationships = this.normalProperty('autoRelationships');

        //data section
        this.view = this.normalProperty('view');
        this.fields = this.normalProperty('fields');
        this.groupby = this.normalProperty('groupby');
        this.orderby = this.normalProperty('orderby');
        this.filter = this.normalPropBeforeSet('filter', this._filterBefore);
        this.listenview = this.normalProperty('listenview');
        this.keyFields = this.normalProperty('keyFields');
    },

    cellsStyleFunc: function() {
        var func = this.htmlProperty('cellsStyle', this._applyCellStyle);
        return function() {
            var res = func.apply(this, arguments);
            res = res || [];
            return res;
        }
    },

    initDomState : function () {
        this._super();
        //this.initDomStatePos();
        this._bg(this.bg());
        this._borderRadius(this.borderRadius());
        this._border(this.border());

        this._updateReadonly();
        this._updateEnable();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._updateBackgroundImage();
        //this._tabindex(this.tabindex() );
    },

    tableAddRowBefore: function(child){
        var pos = this.getWidgetColumnRow(child);
        var newRows = this.rows(this.rows() + 1, pos.row - 1);
        this.sendTableLayoutProperty({"rows" : this.rows()});
    },

    tableAddRowAfter: function(child){
        var pos = this.getWidgetColumnRow(child);
        this.rows(this.rows() + 1, pos.row);
        this.sendTableLayoutProperty({"rows" : this.rows()});
    },

    tableDeleteRow: function(child){
        var pos = this.getWidgetColumnRow(child);
        this.rows(this.rows() - 1, pos.row);
        this.sendTableLayoutProperty({"rows" : this.rows()});
    },

    tableAddColumnBefore: function(child){
        var pos = this.getWidgetColumnRow(child);
        this.columns(this.columns() + 1, pos.column - 1);
        this.sendTableLayoutProperty({"columns" : this.columns()});
    },

    tableAddColumnAfter: function(child){
        var pos = this.getWidgetColumnRow(child);
        this.columns(this.columns() + 1, pos.column);
        this.sendTableLayoutProperty({"columns" : this.columns()});
    },

    tableDeleteColumn: function(child){
        var pos = this.getWidgetColumnRow(child);
        this.columns(this.columns() - 1, pos.column);
        this.sendTableLayoutProperty({"columns" : this.columns()});
    },

    tableSetRowHeight: function(child, executor){
        var self = this;
        var pos = this.getWidgetColumnRow(child);
        //dialog
        var cells = this.cellsSize();
        var title =  AC.Core.lang().trText("widget_height");
        this.showEditDialog(title, cells['h'][pos.row - 1], function(val){
                self._setRowHeight(pos.row, val)
            });
    },

    tableSetColumnWidth: function(child){
        var self = this;
        var pos = this.getWidgetColumnRow(child);
        //dialog
        var cells = this.cellsSize();
        var title =  AC.Core.lang().trText("widget_width");
        this.showEditDialog(title, cells['w'][pos.column - 1], function(val){
                self._setColumnWidth(pos.column, val)
            });
    },

    showEditDialog: function(title, onOpenVal, onSaveFunc){
        var Percenttxt =  AC.Core.lang().trText( "widget_percent" );
        var Pixeltxt =  AC.Core.lang().trText( "widget_pixel" );
        var div = "<div><table align='center' valign='middle' style='height: 100%'><tr><td style='align: center'><input type='text' style='align: right'></td></tr><tr><td><table align='center' valign='top'><tr><td><form><input type='radio' value='pixel' name='wiziSelect'> " + Pixeltxt + " <input type='radio' value='percent' name='wiziSelect'> " + Percenttxt + " </form></td></tr></table></td></tr></table><div>";
        var dlg = $(div);
        var save =  AC.Core.lang().trText( "dialog_button_save" );
        var cancel =  AC.Core.lang().trText( "dialog_button_cancel" );
        var btn = {};
        btn[save] = function() {
            var type = $(this).find("input:checked").val();
            var addon = '';
            var val = $(this).find("input:text").val();
            if (type == "pixel"){
                addon = 'px';
            } else if (type == "percent"){
                addon = '%';
            }
            if (addon != ''){
                val = parseInt(val);
            }
            onSaveFunc(val + addon);
            //self.sendTableLayoutProperty({"columns" : this.columns()});
            $(this).dialog('close');
        };
        btn[cancel] = function() {
            $(this).dialog('close');
        };
        var props = jQuery.extend({
                                modal : true,
                                height: 180,
                                width: 200,
                                resizable : false,
                                title : title,
                                buttons: btn,
                                close: function(event, ui) {
                                    $(this).dialog('destroy').remove();
                                },
                                dialogClass: "wa-system-dialog wa-system-style"
        }, {});
        dlg.dialog(props);
        dlg.find('input:text').val(onOpenVal);
        dlg.find('input:radio').click(function(){
            var x = parseInt(dlg.find('input:text').val());
            if (this.value == 'pixel'){
                dlg.find('input:text').val(x + 'px');
            } else {
                dlg.find('input:text').val(x + '%');
            }
        });
        dlg.parent().click(function(ev){
            ev.stopPropagation();
        });
    },
    
    sendTableLayoutProperty: function(wProp){
        var sets = {};
        sets[this.id()] = wProp;
        var cmd = new WiziCore_Api_FormDesignerApplyPropItemCommand(sets);
        var editor = this.managerContext().editor;
        editor.executor().execute(cmd);
        $(editor).trigger(WiziCore_UI_FormDesigner.onModelStateChanged,[WiziCore_UI_FormDesigner.onItemCreate]);
    },

    _getDesignerRightMenuSub : function(child){
        if (child == undefined){
            return;
        }
        var self = this;
        var tableAddRowBeforetxt =  AC.Core.lang().trText("editor_rclick_table_AddRowBefore");//"Add row";
        var tableAddRowAftertxt =  AC.Core.lang().trText("editor_rclick_table_AddRowAfter");//"Add row";
        var tableDeleteRowtxt =  AC.Core.lang().trText("editor_rclick_table_DeleteRow");//"Delete row";
        var tableAddColumnBeforetxt =  AC.Core.lang().trText("editor_rclick_table_AddColumnBefore");//"Add column";
        var tableAddColumnAftertxt =  AC.Core.lang().trText("editor_rclick_table_AddColumnAfter");//"Add column";
        var tableDeleteColumntxt =  AC.Core.lang().trText("editor_rclick_table_DeleteColumn");//"Delete column";
        var tableSetRowHeighttxt =  AC.Core.lang().trText("editor_rclick_table_SetRowHeight");
        var tableSetColumnWidthtxt =  AC.Core.lang().trText("editor_rclick_table_SetColumnWidth");
        
        var menu = [
                {title: tableAddRowBeforetxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableAddRowBefore(child);
                    }
                },
                {title: tableAddRowAftertxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableAddRowAfter(child);
                    }
                },
                {title: tableDeleteRowtxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableDeleteRow(child);
                    }
                },
                {title: tableAddColumnBeforetxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableAddColumnBefore(child);
                    }
                },
                {title: tableAddColumnAftertxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableAddColumnAfter(child);
                    }
                },
                {title: tableDeleteColumntxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableDeleteColumn(child);
                    }
                },
                {title: tableSetRowHeighttxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableSetRowHeight(child);
                    }
                },
                {title: tableSetColumnWidthtxt,
                    userData : {exclude : null, include : "all"},
                    func : function(){
                        self.tableSetColumnWidth(child);
                    }
                }
            ];

        return menu;
    },

    hideRow: function(rowIndex) {
        if (this._table != undefined) {
            var row = this._table.find('tr').eq(rowIndex);
            (row != undefined) ? row.hide() : null;
        }
    }
}));

var _props = [
    { name: AC.Property.group_names.general, props:[
        AC.Property.general.widgetClass,
        AC.Property.general.name
    ]},
    { name: AC.Property.group_names.database, props:[
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
        AC.Property.layout.anchors,
        AC.Property.layout.alignInContainer,
        AC.Property.layout.rows,
        AC.Property.layout.columns,
        AC.Property.layout.cellsSize,
        AC.Property.layout.cellsStyle,
        AC.Property.layout.repeat
        //AC.Property.layout.tabindex,
        //AC.Property.layout.centered
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
        AC.Property.behavior.opacity,
        AC.Property.style.margin,
        AC.Property.style.border,
        AC.Property.style.borderRadius,
        AC.Property.style.bgColor,
        AC.Property.general.backgroundImage,
        AC.Property.general.backgroundRepeat,
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
WiziCore_UI_TableLayoutWidget.props = function() {
    return _props;

};

WiziCore_UI_TableLayoutWidget.actions = AC.Widgets.WiziCore_Widget_Container.actions;


WiziCore_UI_TableLayoutWidget.capabilities = function() {
    return {
        defaultProps: {
            width: "200", height: "100", x : "0", y: "0",
            widgetClass : "WiziCore_UI_TableLayoutWidget",
            name: "tableLayout1", opacity : 1, zindex : "auto", enable : true, visible : true, widgetStyle: "default",
            anchors : {left: true, top: true, bottom: false, right: false},
            centered: false,
            columns: 3,
            rows: 1,
            readonly: false,
            cellsSize: {w: ['66','','66'], h: ['']},
            hourglassImage: "Default",
            displayHourglassOver: "inherit", customCssClasses: "",
            pWidth: "",
            dragAndDrop: false, resizing: false,
            margin: "", alignInContainer: 'left', cellsStyle: [],
            bgColor : "transparent", border : "none", borderRadius : "0"
        },
        emptyProps: {bgColor : "transparent", border : "none", borderRadius : "0"},
        props: WiziCore_UI_TableLayoutWidget.props(),
        isField: false,
        containerType: AC.Widgets.Base.CASE_TYPE_COMPOSITE_CONTAINER
    };
};
})(jQuery,window,document);