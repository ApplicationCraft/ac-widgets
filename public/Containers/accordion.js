/**
 * @lends       WiziCore_UI_AccordionWidget#
 */
(function($, window, document) {
var WiziCore_UI_AccordionWidget = AC.Widgets.WiziCore_UI_AccordionWidget =  AC.Widgets.WiziCore_Widget_Container.extend({
    _widgetClass : "WiziCore_UI_AccordionWidget",
    _div : null,
    _activeHeaderColor : null,
    _inactiveHeaderColor : null,

    /**
        * Description of constructor
        * @class      Accordion widget is a composite container
        * @author     Timofey Tatarinov, Yuri Podoplelov
        * @version     0.2
        *
        * @constructs
        */
    init: function() {
        this._super.apply(this, arguments);
        //this._sectionsBefore( this.sections() );
    },

    /**
     * @private
     * Update widget view mode
     */
    initEditorLayer : function() {
        this._super.apply(this, arguments);
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            if (this._modeObject != null){
                $(this._modeObject).hide();
            }
        }
    },

    draw : function() {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        this._div = this.createAccordionDiv();
        this.base().prepend(this._div);

        var sections = this._project['sections'];
        var children = this.children();
        if (sections.rows != undefined){
            if (sections.rows.length == 1 && children.length == 0){
                //fix for new sections, when accordion dropped to designer area
                this._sectionsBefore(sections );
            }

            for (var i = 0, l = sections.rows.length; i < l; ++i) {
                if (children[i] != undefined){
                    var row = sections.rows[i];
                    var container = children[i];
                    row.id = container.id(); // fix for old widgets. 'id' must be like 'id' of children
                    var id = row.id;
                    var title = row.data[1];
                    var height = row.data[2];
                    var isOpened = row.data[3];
                    var section = this.createSection(container, id, title, isOpened, height);
                }
            }
        }

        this._super.apply(this, arguments);
        jQuery.fn.__useTr = trState;
    },

    drawChildren: function(){
        var children = this.children();
        for (var i =0, l = children.length; i < l; i++){
            var child = children[i];
            var contentDiv = $(this._div.children("div[data-linkToWidget="+ child.htmlId() + "]"));
            if (contentDiv.length != 0 && contentDiv.is(":visible")){
                child.draw(contentDiv);
            }
        }
        //this._sectionsAfter(this.sections() );
    },

    onPageDrawn: function(){
        //this._super.apply(this, arguments);
        //this._sectionsAfter(this.sections() );

        var sections = this.sections();
        if (sections != undefined && sections.rows != undefined) {
            var valueRows = sections.rows;
            var newIds = [];
            for (var i = 0; i < valueRows.length; ++i) {
                var row = valueRows[i];
                var id = row.id;
                var isOpened = row.data[3];
                var child = this.findChildById(id);
                this.updateSectionOpeningMode(child, isOpened);
            }
        }
        this.applyAutoExpand(this.autoExpand() );
        this._updateEnable();
    },

    createChild: function(){
        var child = this._super.apply(this, arguments);
        child.isDraggable = this;
        child.isEditable = false;
        child.isResizable = false;
        child.pWidth("100");
        child._manualDrawPosition = false;
        return child;
    },

    _updateLayout: function(){
        this._super();
        var width = this.width();
/*        if (jQuery.browser.msie){
            this._div.width(width)
                     .height(this.height());
        } else {
        */
            this._div.css({"min-height": this.height(), "min-width": this.width()});
        /*}
          */
    },

    layoutEx: function(){
        return 'vertical';
    },

    currentContainer: function(){
        return this.children()[0];
    },

    initProps: function(){
        this._super();
        this.sections = this.htmlPropertyBeforeSetAfterGet('sections', this._sectionsBefore, this._sectionsAfter, this._sectionsAfterGet);
        this.autoExpand = this.htmlProperty('autoExpand', this.applyAutoExpand);

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.readonly = this.htmlProperty('readonly', this._updateReadonly);

        this.font = this.themeProperty('font', this._font);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.border = this.themeProperty('border', this._border);

        this.headerFontColor = this.themeProperty('headerFontColor', this._headerFontColor);
        this.headerBGColors = this.themeProperty('headerBGColors', this._headerBGColors);
        this.headerBorderRadius = this.themeProperty('headerBorderRadius', this._headerBorderRadius);
        this.contentBorderRadius = this.themeProperty('contentBorderRadius', this._contentBorderRadius);
        this.sectionBGColor = this.themeProperty('sectionBGColor', this._sectionBGColor);

    },

    initDomState : function (){
        this._super();
        //this.initDomStatePos();

        this._visible(this.visible() );
        this._opacity(this.opacity() );
        this._updateEnable();
        this._updateReadonly();

        this._bg(this.bg() );
        this._font(this.font() );
        this._border(this.border() );

        this._headerFontColor( this.headerFontColor() );
        this._headerBGColors(this.headerBGColors() );
        this._headerBorderRadius(this.headerBorderRadius() );
        this._contentBorderRadius(this.contentBorderRadius() );
        this._sectionBGColor(this.sectionBGColor() );
        this.applyAutoExpand(this.autoExpand());
    },

    applyAutoExpand : function(val){
        if (this.mode() == WiziCore_Visualizer.EDITOR_MODE) {
            return;
        }
        if (val === true){
            //get all headers and toggle them
            var headerDiv = $(this._div.children("h4"));
            
            headerDiv.each(function(index, el){
                if ($(el).hasClass("ui-accordion-header-active") != true){
                    $(el).click();
                }
            });
        }
    },

    createAccordionDiv : function(){
        var div = $("<div>");
        div.attr("id", "Accordion_" + this.htmlId());
        div.css({"width": "100%", "height": "100%"});

        div.addClass("ui-accordion ui-accordion-icons ui-widget ui-helper-reset");

        return div;
    },

    updateSectionHeaderBorderRadius : function(){
        var setVal = this.headerBorderRadius();
        this._borderRadius(setVal, this._div.children("h4"));
    },

    updateSectionContentBorderRadius : function(){
        var setVal = this.contentBorderRadius();
        this._borderRadius(setVal, this._div.children("div"));
    },

    updateSectionBGColor : function(){
        var val = this.sectionBGColor();
        if(val != null){
            this._bg(val, this._div.children("div"));
        }
    },

    updateSectionHeaderFontColor : function(){
        this._div.children("h4").children("a").css("color", this.headerFontColor());
    },

    setSectionStyleProperties : function(){
        this.updateSectionHeaderFontColor();
        this.updateSectionBGColor();
        this.updateSectionHeaderBorderRadius();
        this.updateSectionContentBorderRadius();
        this._font( this.font() );
    },

    updateSectionOpeningMode : function(container, newIsOpened){
        var headerDiv = $(this._div.children("h4[data-linktowidget=" + container.htmlId() + "]"));

        if (newIsOpened == true) {
            if (headerDiv.hasClass("ui-accordion-header-active") == false) {
                headerDiv.click();
            }
        } else {
            if (headerDiv.hasClass("ui-accordion-header-active") == true) {
                headerDiv.click();
            }
        }
    },

    updateSectionHeight : function(container, height){
        if (container != null){
            var cHeight = container.height();
            if (!isNaN(parseInt(height))){
                container.height(height);
                if (this._isDrawn){
                    this._div.children("div[data-linktowidget=" + container.htmlId() + "]").css("min-height", height);
                }
            }
        }
    },

    destroySection: function(container){
        var htmlId = container.htmlId();
        this.deleteItem(container.id() );

        if (this._isDrawn){
            this._div.find("[data-linkToWidget=" + htmlId + "]").remove();
        }
    },

    _onInitLanguage: function() {
        this._super();
        this.sections(this.sections());
    },

    _onSTUpdated: function() {
        this._super();
        var form = this.form(),
            data = form.stringTable();
        if (form.language() && data)
            AC.AppLng().trElement(this.base(), data[0], form.language(), form.languages().defaultLng);
    },

    _sectionsBefore : function(value){
        if (value != undefined) {
            //create before draw
            var valueRows = value.rows, i, l;
            var newIds = [];
            var oldData,
                form = this.form(),
                prevShowLng = form._showLngTokens,
                hasLanguage = form.language() != null;

            form._showLngTokens = true;
            oldData = this.sections();
            form._showLngTokens = prevShowLng;

            for (i = 0; i < valueRows.length; ++i) {
                var row = valueRows[i];
                var child = this.findChildById(row.id);
                if (child == null) {
                    //create new container child, if not in list
                    var propsDefault = AC.Core.Widgets().getDefaultWidgetProperties("WiziCore_Widget_Container");
                    child = this.addNewWidget({widgetClass: "WiziCore_Widget_Container", project: propsDefault});
                    row.id = child.id();
                }
                var height = parseInt(row.data[2]);
                if (!isNaN(height)){
                    child.height(height);
                }
                child.width(this.width() );
                newIds.push(child.id() );

                if (!form._skipTokenCreation && hasLanguage && oldData.rows) {
                    var id = (row.data.userData && row.data.userData.id != undefined) ? row.data.userData.id : null,
                        isValueToken = WiziCore_Helper.isLngToken(row.data[1]),
                        token, hasToken;
                    if (!isValueToken) {
                        hasToken = (id != null) && WiziCore_Helper.isLngToken(oldData.rows[id].data[1]);
                        if (hasToken)
                            token = oldData.rows[id].data[1];
                        else
                            token = WiziCore_Helper.generateId(10, 'ac-');

                        this.form().addTokenToStringTable(this.id(), this.name(), token, row.data[1]);
                        row.data[1] = token;
                    }
                }
                if (row.data.userData != undefined)
                    row.data.userData = undefined;
            }

            var children = this.children();

            //collect remove sections
            var dropChildren = [];
            for (i = 0, l = children.length; i < l; i++){
                if (WiziCore_Helper.indexOf(newIds, children[i].id(), 0) < 0){
                    dropChildren.push(children[i]);
                }
            }

            //drop children
            for (i =0, l = dropChildren.length; i < l; i++){
                this.destroySection(dropChildren[i]);
            }
        }
        return value;
    },

    _sectionsAfterGet: function(value) {
        var ret = WiziCore_Helper.clone(value),
            rows, i, l, row;

        if (ret && ret.rows) {
            rows = ret.rows;
            for (i = 0, l = rows.length; i < l; i++) {
                row = rows[i];
                row.data[1] = this._getTranslatedValue(row.data[1]);
                row.data.userData = {id: i};
            }
            return ret;
        } else
            return value;
    },

    _sectionsAfter : function(value){
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        //draw html sections and children
        if (value != undefined) {
            var valueRows = value.rows;
            var newIds = [];
            for (var i = 0; i < valueRows.length; ++i) {
                var row = valueRows[i];

                var id = row.id;
                var title = row.data[1];
                var height = row.data[2];
                var isOpened = row.data[3];
                var container = this.findChildById(id);
                var section = this.createSection(container, id, title, isOpened, height);
                if (container._isDrawn == false && isOpened == true){
                    //draw header
                    container.draw(section.contentDiv);
                    container.onPageDrawn();
                    container.base().width("100%");
                }

                this.updateSectionHeight(container, height);
            }
            this.setSectionStyleProperties();
        }
        jQuery.fn.__useTr = trState;
    },

    createSection: function(container, id, title, isOpened, height){
        var headerDiv = $(this._div.children("h4[data-linkToWidget="+ container.htmlId() + "]"));
        if (headerDiv.length == 0){
            headerDiv = this.createSectionHeaderDiv(id, title, isOpened)
                    .attr('data-linkToWidget', container.htmlId());

            this._div.append(headerDiv);
        } else {
            var trVal = this.getTrValueAddLngAttr(title, headerDiv.find('a'));
            headerDiv.find('a').html(trVal);
        }

        //draw container
        var contentDiv = $(this._div.children("div[data-linkToWidget="+ container.htmlId() + "]"));
        if (contentDiv.length == 0){
            contentDiv = this.createSectionContent(container, height)
                    .attr('data-linkToWidget', container.htmlId());

            this._div.append(contentDiv);
        }
        return {headerDiv: headerDiv, contentDiv: contentDiv};
    },

    createSectionHeaderDiv : function(id, text, isOpened){
        var headerDiv = $("<h4 />");
        var headerText = (text != undefined) ? text : "Section";
        headerDiv.append($("<a href=\"#\"></a>"));
//        headerDiv.append($("<a href=\"#\">" + headerText + "</a>"));
        var trVal = this.getTrValueAddLngAttr(text, headerDiv.find('a'));
        headerDiv.find('a').html(trVal);
        headerDiv.addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom");
        headerDiv.hover(function() {$(this).toggleClass("ui-state-hover");})
        headerDiv.append('<span class="ui-icon ui-icon-triangle-1-e"></span>');
        var self = this;

        headerDiv.css("background", self._inactiveHeaderColor);
        headerDiv.click(function() {
            var $this = $(this);
            if ($this.hasClass('ui-state-disabled')){
                //check for enable()
                return;
            }
            $this
                .toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
                .find("> .ui-icon").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s");

            var contDiv = $this.next();
            var height = contDiv.height();
            var minHeight = contDiv.css("min-height");
            if ($this.hasClass("ui-accordion-header-active")){
                $this.css("background", self._activeHeaderColor);
            } else {
                $this.css("background", self._inactiveHeaderColor);
            }

            contDiv.css({"height": (height == 0) ? contDiv.css("min-height") : height, "min-height" : ""});
            //var fadeFunc = (contDiv.is(":visible")) ? "fadeOut" : "fadeIn";

            contDiv.slideToggle(function(){
                contDiv.css({"height": "", "min-height": minHeight});

//                    //fix for webkit browsers
//                    var appDisplay = self.form().base().css("display");
//                    self.form().base().css("display", "");
//                    window.setTimeout(function(){
//                        self.form().base().css("display", appDisplay);
//                    },1);


                var isOpened = contDiv.is(":visible");
                var child = self.findChildById(id);
                child.onParentVisibleChanged(isOpened);

                var sectionsData = self.sections();
                    if (sectionsData.rows != undefined){
                        for (var i = 0, l = sectionsData.rows.length; i < l; i++){
                            var row = sectionsData.rows[i];
                            if (row.id == id){
                                row.data[3] = isOpened;
                                //self.sections(sectionsData);
                                break;
                            }
                        }
                    }
                }).toggleClass("ui-accordion-content-active");
            var child = self.findChildById(id);
            if (!child._isDrawn) {
                var contentDiv = $(self._div.children("div[data-linkToWidget="+ child.htmlId() + "]"));
                child.draw(contentDiv);
                child.onPageDrawn();
                child.base().width("100%");
            }

            return false;
        });

        return headerDiv;
    },

    createSectionContent : function(container){
        var contentDiv = $("<div />")
                .addClass("ui-accordion-content  ui-helper-reset ui-widget-content ui-corner-bottom")
                .css({width: "100%", "min-height": container.height()}); //, "background-color": "transparent"
        //container.draw(contentDiv);
        contentDiv.hide();
        return contentDiv;
    },

    _headerFontColor: function(color){
        this.updateSectionHeaderFontColor();
    },

    _headerBGColors : function(headerColorsData) {
        var useColors = (headerColorsData.useColors != undefined) ? headerColorsData.useColors : this._useColors;
        if (useColors) {
            var colors = headerColorsData.colors;
            if (colors != undefined) {
                if (colors.length == 2) {
                    this._activeHeaderColor = colors[0];
                    this._inactiveHeaderColor = colors[1];
                }
            }
        }
        else {
            this._activeHeaderColor = "#aaaaaa";
            this._inactiveHeaderColor = "#bbbbbb";
        }

        this.base().find(".ui-accordion-header").css("background", this._inactiveHeaderColor);
        this.base().find(".ui-accordion-header-active").css("background", this._activeHeaderColor);
    },

    _headerBorderRadius : function(val) {
        this.updateSectionHeaderBorderRadius();
    },

    _sectionBGColor : function(color) {
        this.updateSectionBGColor();
    },

    _contentBorderRadius : function(val) {
        this.updateSectionContentBorderRadius();
    },

    _font: function(val){
        this._super(val, this._div.children("h4"));
    },

    _enable: function(flag){
        if (this._div != null){
            if (flag === false){
                this._div.children("h4").addClass('ui-state-disabled');
            } else {
                this._div.children("h4").removeClass('ui-state-disabled');
            }
        }
    },

    sectionsOpeningModes : function(sectionsModes) {
        var openingModesValues = [];
        var sectionsData = this.sections();

        for (var i = 0; i < sectionsData.rows.length; ++i){
            var row = sectionsData.rows[i];
            if (sectionsModes == undefined){
                var isOpened = row.data[3];
                openingModesValues.push(isOpened);
            }
            else {
                if (sectionsModes[i] !== (undefined && null))
                row.data[3] = sectionsModes[i];
            }
        }

        if (sectionsModes != undefined){
            openingModesValues = sectionsModes;
            this.sections(sectionsData);
        }

        return openingModesValues;
    }
});
/**
 * Return empty widget prop
 * @return {Object} default properties
 */
WiziCore_UI_AccordionWidget.emptyProps = function() {
    var ret = {border : ""};
    return ret;
};

/**
 * Return available widget prop
 * @return {Object} available property
 */
var _props = [
    {
        name: AC.Property.group_names.general,
        props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.autoExpand,
            AC.Property.general.sections
        ]
    },
    {
        name: AC.Property.group_names.layout,
        props:[
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
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer
        ]
    },
    {
        name: AC.Property.group_names.behavior,
        props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.readonly,
            AC.Property.behavior.enable
        ]
    },
    {
        name: AC.Property.group_names.style,
        props:[
            AC.Property.behavior.opacity,
            AC.Property.style.font,
            AC.Property.style.margin,
            AC.Property.style.headerFontColor,
            AC.Property.style.bgColor,
            AC.Property.style.border,
            AC.Property.style.headerBGColors,
            AC.Property.style.headerBorderRadius,
            AC.Property.style.sectionBGColor,
            AC.Property.style.contentBorderRadius,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle
        ]
    }
];

WiziCore_UI_AccordionWidget.props = function() {
    return _props;
};

WiziCore_UI_AccordionWidget.capabilities = function() {
    return {
        defaultProps: {
            x : "0", y: "0", width: "200", height: "100",
            zindex : "auto", enable : true, readonly: false,
            anchors : {left: true, top: true, bottom: false, right: false}, visible : true, opacity : 1, data:'',
            sections: {rows : [
                {id: 1, data: ["1", "Section 1", 100, false], ind: 1}]
            },
            autoExpand : false,
            margin: "",
            hourglassImage: "Default",  displayHourglassOver: "inherit", customCssClasses: "",
            pWidth: "",
            widgetStyle: "default",
            font: "normal 13px Verdana",
            name: "accordion1",
            alignInContainer: 'left',
            dragAndDrop: false,
            resizing: false,
            headerBGColors : {
                useColors: true,
                colors: ["#aaaaaa", "bbbbbb"]
            }
        },

        props: WiziCore_UI_AccordionWidget.props(),
        emptyProps: WiziCore_UI_AccordionWidget.emptyProps(), 
        containerType: AC.Widgets.Base.CASE_TYPE_COMPOSITE_CONTAINER
    };
};
})(jQuery, window, document);