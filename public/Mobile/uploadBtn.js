(function($, windows, document, undefined){
    var widget = AC.Widgets.MobileUploadButton = function() {
        this.init.apply(this, arguments);
    };
    
    AC.extend(widget, AC.Widgets.WiziCore_UI_BaseMobileWidget);
    var p = widget.prototype;
    
    AC.copyExtension(p, AC.WidgetExt.Upload);

    p._widgetClass = "MobileUploadButton";

    function defaultFileSources(){
        return {
            library: true,
            image: true,
            video: true,
            audio: true
        }
    }

    p.init = function() {
        widget._sc.init.apply(this, arguments);
        this._fileName = null;
        this._state = AC.WidgetExt.UPLOAD_STATE.SELECT;
        this._requestId = "req_" + WiziCore_Helper.generateId();
        var action = "";
        try {
            action = this.context().config().uploadServerPath();
        } catch(e) {
            action = "";
        }        
        this._desktopFormAction = action;
        this._isNative = WiziCore_Helper.isNative();
        if (!this.fileSources()){
            this.fileSources(defaultFileSources());
        }
    };

    p.draw = function() {
        var self = this;
        this._container = $('<div>');
        if (self._isNative) {
            this.base().append(self._container);
        } else {
            this._drawForDesktop(self._container);
        }

        widget._sc.draw.apply(self, arguments);
    };

    p.onPageDrawn = function() {
        widget._sc.onPageDrawn.apply(this, arguments);
        var base = this.base();
        base.css({
            'overflow': 'hidden'
        });
    };

    p._drawForDesktop = function(buttonContainer) {
        var self = this;
        var htmlId = self.htmlId(),
            targetForm = "target_" + htmlId,
            requestId = self._requestId;
            
        buttonContainer.css({
            "z-index": 0
        });
            
        var div = '<form method="post" enctype="multipart/form-data" action="" target="_self">';
        if ($.browser.msie){
            div += '</form>';
        }
        var form = $(div);
        form.attr({
            target: targetForm,
            action: self._desktopFormAction
        });
        self._htmlForm = form;
        
        var fileInput = self._drawFileInput(htmlId);
        self._fileInput = fileInput;

        var iframe = self._createIframe(targetForm, requestId);
        self._iframe = iframe;
        
        var base = self.base();
        
        form.append(fileInput);
        base.append(buttonContainer, form, iframe);
        
        base.resize(function() {
            self._fileInput.css({
                'font-size': Math.max(base.width(), base.height())
            });            
        });
        
        self._bindGlobalUploadEvents(requestId, self._desktopFormAction);
    };
    
    p.initDomState = function() {
        var self = this;
        widget._sc.initDomState.apply(self);
        
        self.initDomStatePos();

        self._fileSizeLimit(self.fileSizeLimit());
        
        self._tabindex(self.tabindex());
        
        self._redraw();
        
        self._visible(self.visible());
        self._opacity(self.opacity());
        self._updateEnable();
    };

    p._onInitLanguage = function() {
        this.selectFileText(this.selectFileText());
        this.startUploadText(this.startUploadText());
        this.stopUploadText(this.stopUploadText());
    };

    p._onSTUpdated = function() {
        this._redraw();
    };

    p._onLanguageChanged = function() {
        this._redraw();
    };

    p._beforeText = function(text, suffix) {
        if (this.form().language() != null && this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(text),
                token = isToken ? text : ('ac-' + this.id() + '_' + suffix);

            if (!isToken) {
                this.form().addTokenToStringTable(this.id(), this.name(), token, text);
            } else {
                //remove prev
                //add new??
            }

            return token;
        } else
            return text;
    };

    p._beforeSelectFileText = function(text) {
        return this._beforeText(text, 'select');
    };

    p._beforestartUploadText = function(text) {
        return this._beforeText(text, 'start');
    };

    p._beforestopUploadText = function(text) {
        return this._beforeText(text, 'stop');
    };

    p._changeState = function(newState) {
        this._state = newState;
        this._redraw();
    };

    p._redraw = function() {
        var trState = jQuery.fn.__useTr ;
        jQuery.fn.__useTr = false;

        var self = this;
        
        self._input = null;
        self._nativeSelect = null;
        self._singleSource = null;
        
        widget._sc._redraw.apply(self);
        self._container.empty();

        var onClickCallback = function() {},
            needButton = true;

        if (self._isNative) {
            if (self._state == AC.WidgetExt.UPLOAD_STATE.SELECT) {
                var fileSources = self.fileSources();
                var singleSource = isSingleSource(fileSources);

                if (singleSource != null) {
                    var func = ({
                        library: self._selectFromLibrary,
                        image: self._captureImage,
                        video: self._captureVideo,
                        audio: self._captureAudio
                    })[singleSource];
                    self._singleSource = singleSource;
                    onClickCallback = function() {
                        func.apply(self, []);
                    };
                } else {
                    needButton = false;
                    self._drawDropdownForNative(fileSources);
                }
            } else {
                if (self._state == AC.WidgetExt.UPLOAD_STATE.START) {
                    onClickCallback = function(ev) {
                        self._uploadCapturedFile();
                    };
                }
            }
        } else {
            switch (self._state) {
                case AC.WidgetExt.UPLOAD_STATE.START:
                    onClickCallback = function(ev) {
                        self.sendFile();
                        ev.stopPropagation();
                    };
                    break;
                case AC.WidgetExt.UPLOAD_STATE.STOP:
                    onClickCallback = function(ev) {
                        self.stopUploading();
                        ev.stopPropagation();
                    };
                    break;
            }
            
            if (self._state != AC.WidgetExt.UPLOAD_STATE.SELECT) {
                self._fileInput.hide();
            } else {
                self._fileInput.show();
            }
        }

        self.onClick = onClickCallback;
        if (needButton) {
            self._drawMobileButton(onClickCallback);
            if (self._isNative && self._state == AC.WidgetExt.UPLOAD_STATE.STOP) {
               self._input.mobileButton('disable');
            }
        }
        self._updateButtonStyle(self.height());
        self._updateEnable();
        jQuery.fn.__useTr = trState;
    };
    
    p._drawDropdownForNative = function(fileSources) {
        var self = this;
        var nativeSelect = $('<select data-native-menu="true">');
        var placeholderOption = $('<option value="choose">');
        placeholderOption.text(self.selectFileText());
        nativeSelect.append(placeholderOption);
        nativeSelect.css({
            width: "100%",
            height: "100%"
        });
        var options = [
            {value: 'library', lng: 'widget_upload_existing'},
            {value: 'image', lng: 'widget_upload_image'},
            {value: 'video', lng: 'widget_upload_video'},
            {value: 'audio', lng: 'widget_upload_audio'}
        ];
        for (var i = 0, l = options.length; i < l; ++i) {
            var option = options[i];
            var value = option.value;
            if (fileSources[value]) {
                var optElem = $('<option value="' + value + '" data-lng="' + option.lng + '">' + AC.Core.lang().trText(option.lng) + '</option>');
                nativeSelect.append(optElem);
            }
        }

        self._tabindex(self.tabindex(), nativeSelect);
        self._container.append(nativeSelect);
        
        nativeSelect.selectmenu(self._getJQMOptions());
        nativeSelect.bind("change", function() {
            switch (nativeSelect.val()) {
                case "library":
                    self._selectFromLibrary();
                    break;
                case "image":
                    self._captureImage();
                    break;
                case "video":
                    self._captureVideo();
                    break;
                case "audio":
                    self._captureAudio();
                    break;
            }

            nativeSelect.val("choose");
            nativeSelect.selectmenu("refresh");
        });
        self._nativeSelect = nativeSelect;
    };
    
    p._drawMobileButton = function() {
        var self = this;
        var input = $('<button value=""/>');
        input.val(self._getCurrentText());
        input.css({
            width: "100%",
            height: "100%"
        });
        var icon = self.icon();
        if (typeof icon == 'string' && icon != 'none' ) {
            input.data({
                icon: icon,
                iconpos: self.iconPosition()
            });
        }
        /*if (typeof onClick == 'function') {
            input.bind("click.custom", onClick);
        } */
        self._tabindex(self.tabindex(), input);
        self._container.prepend(input);

        self._input = input;

        input.mobileButton(self._getJQMOptions());
    };
    
    p._enable = function(val) {
        if (this._input) {
            val = (val === true) ? "enable" : "disable";
            this._input.mobileButton(val);
        }
    };

    p.onClick = function(){
        //to stop base
    };

    p._updateLayout = function(){
        widget._sc._updateLayout.apply(this);
        /*
        this.base().css({
            width: this.width(),
            height: this.height(),
            overflow: 'hidden'
        });
        */
        this._updateButtonStyle(this.height());
    };

    p.onResize = function() {
        this._updateButtonStyle(this.base().height());
    };
    
    p._updateButtonStyle = function(height) {
        //called more than once
        var btn = this._container.find(".m-ui-btn"),
            footerClass = 'm-ui-footer';
        if (btn.length == 0) {
            return;
        }
        if (height < 47) {
            this._container.addClass(footerClass);
            this._container.css('padding', 3);
            btn.css({
                width: '100%'
            });
//            this.base().css('padding-right', 3);
            this._container.css("box-sizing", "border-box");

        } else if (height >= 47 && this._container.hasClass(footerClass)) {
            this._container.removeClass(footerClass);
            btn.css({
                width: ''
            });
            this._container.css('padding', '');
//            this.base().css('padding-right', '');
        }        
    };
    
    p.fileSources = function(value) {
        if (value !== undefined) {
            //setter
            this._project.fileSources = value;
            var obj = {
                fileSources: value
            };
            this.sendExecutor(obj);
            if (this._isDrawn) {
                this._redraw();
            }
        }
        //getter
        var res = this._project.fileSources;
        if (res == undefined) {
            res = defaultFileSources();
        }
        return res;
    };
    
    function isSingleSource(fileSources) {
        var singleSource;
        for (var k in fileSources) {
            if (fileSources[k]) {
                if (singleSource == null) {
                    singleSource = k;
                } else {
                    singleSource = undefined;
                    break;
                }
            }
        }
        return singleSource;
    }
    
    p._afterSelectedOnNative = function() {
        var self = this;
        if (self.autoStart()) {
            self._uploadCapturedFile();
        } else {
            self._changeState(AC.WidgetExt.UPLOAD_STATE.START);
        }
    };
    
    p._selectFromLibrary = function() {
        var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: Camera.MediaType.ALLMEDIA
        };
        var self = this;
        navigator.camera.getPicture(function(imageData) {
                $(self).trigger(new $.Event(widget.onSelected), [false, {path: imageData}]);
                self._nativeFileInfo = {
                    path: imageData
                };
                self._afterSelectedOnNative();
            }, function(errorMessage) {
                if (errorMessage != 'Selection cancelled.' && errorMessage != 'no image selected') {
                    $(self).trigger(new $.Event(widget.onSelected), [true]);
                    WiziCore_Helper.showError(AC.Core.lang().trText("widget_upload_mobile_error_selecting_library"));
                } else {
                    $(self).trigger(new $.Event(widget.onSelected), [false]);
                }
            }, options);
    };
    
    p._captureImage = function() {
        var self = this;
        navigator.device.capture.captureImage(function() {
            self._onCaptureSuccess.apply(self, arguments);
        }, function() {
            self._onCaptureError.apply(self, arguments);
        });
    };
    
    p._captureVideo = function() {
        var self = this;
        navigator.device.capture.captureVideo(function() {
            self._onCaptureSuccess.apply(self, arguments);
        }, function() {
            self._onCaptureError.apply(self, arguments);
        });
    };
    
    p._captureAudio = function() {
        var self = this;
        navigator.device.capture.captureAudio(function() {
            self._onCaptureSuccess.apply(self, arguments);
        }, function() {
            self._onCaptureError.apply(self, arguments);
        });
    };

    p._onCaptureSuccess = function(mediaFiles) {
        if (mediaFiles.length == 0) {
            $(this).trigger(new $.Event(widget.onSelected), [false]);
            return;
        }
        var mediaFile = mediaFiles[0];
        this._nativeFileInfo = {
            path: mediaFile.fullPath,
            name: mediaFile.name,
            type: mediaFile.type
        };
        $(this).trigger(new $.Event(widget.onSelected), [false, this._nativeFileInfo]);
        this._afterSelectedOnNative();
    };
    
    p._onCaptureError = function(error) {
        var isCanceled = (error == 'Canceled.') || (typeof error == 'object' && error != null && error.code == 3);
        if (isCanceled) {
            $(this).trigger(new $.Event(widget.onSelected), [false]);
            return;
        }
        
        $(this).trigger(new $.Event(widget.onSelected), [true]);
        WiziCore_Helper.showError(AC.Core.lang().trText("widget_upload_mobile_error_capturing"));
    };


    p.onUploadFail = function() {
        $(this).trigger(new $.Event(widget.onUploaded), [true]);
        WiziCore_Helper.showError(AC.Core.lang().trText("widget_upload_error_uploading"));
        this._changeState(AC.WidgetExt.UPLOAD_STATE.SELECT);
    };

    p.offlineUpload = function(inputFilePath, mimeType, name) {
        var self = this,
            onUploadFailCallback = function(e) {
                self.onUploadFail();
            };

        var lHost = 'file://localhost';
        if (inputFilePath.search(lHost) < 0) { //fix for image from iOS camera
            inputFilePath = lHost + inputFilePath;
        }

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
            fs.root.getDirectory(widget.PERSISTENT_FS_DIRECTORY_NAME, {create: true}, function(acFilesDir) {
                window.resolveLocalFileSystemURI(inputFilePath, function(fileEntry) {
                    var newFileName = WiziCore_Helper.generateId(),
                        inputFilePathParts = inputFilePath.split('.'),
                        partsLen = inputFilePathParts.length;

                    if (partsLen > 1) {
                        newFileName += '.' + inputFilePathParts[partsLen - 1];
                    }

                    fileEntry.copyTo(acFilesDir, newFileName, function(copyFileEntry) {
                        self.form().addLocalUploadFileInfo(copyFileEntry.fullPath, mimeType, name, function(error) {
                            if (error) {
                                onUploadFailCallback();
                            } else {
                                self._fileName = copyFileEntry.fullPath;
                                $(self).trigger(new $.Event(widget.onUploaded), [false, self._fileName]);
                                self._changeState(AC.WidgetExt.UPLOAD_STATE.SELECT);
                            }
                        });
                    }, onUploadFailCallback);
                }, onUploadFailCallback);
            }, onUploadFailCallback);
        }, onUploadFailCallback);
    };

    p._uploadCapturedFile = function() {
        var fileInfo = this._nativeFileInfo;
        if (fileInfo == null) {
            return;
        }
        var name = fileInfo.name,
            path = fileInfo.path,
            mimeType = fileInfo.type;

        if (name == null) {
            name = path.substr(path.lastIndexOf('/') + 1);
        }
        if (mimeType == null) {
            // XXX: temporary fix
            mimeType = 'image/jpeg';
        }

        var uploadServerPath = this.context().config().uploadServerDirectPath(),
            formId = this.form().id(),
            params = {
                formId: formId
            };

        var self = this;

        self._changeState(AC.WidgetExt.UPLOAD_STATE.STOP);
        $(self).trigger(new $.Event(widget.onStarted), []);

        if (self.context().offlineMode()) {
            self.offlineUpload(path, mimeType, name);
        } else {
            var accountsRequester = this.context().accounts();
            accountsRequester.uploadForNative(path, uploadServerPath, name, params, mimeType, function(result) {
                var data = JSON.parse(decodeURIComponent(result.response));
                if (data.error) {
                    $(self).trigger(new $.Event(widget.onUploaded), [true]);
                    WiziCore_Helper.showError(AC.Core.lang().trText("widget_upload_error_uploading"));
                } else {
                    self._fileName = data.url;
                    $(self).trigger(new $.Event(widget.onUploaded), [false, data.url]);
                }
                self._changeState(AC.WidgetExt.UPLOAD_STATE.SELECT);
            }, function(error) {
                self.onUploadFail();
            });
        }
    };
    
    p.collectDataSchema = function(dataSchema) {
        var dataType = (this.isAttachment()) ? AC.Widgets.WiziCore_Api_Form.Type.ATTACHMENT : AC.Widgets.WiziCore_Api_Form.Type.STRING;
        this._simpleConstDataSchema(dataType, dataSchema);
    };
    
    p.value = function(val) {
        if (val !== undefined) {
            this._fileName = val;
        }
        return this._fileName;
    };
    
    p.reset = function() {
        var self = this,
            states = AC.WidgetExt.UPLOAD_STATE;
        
        if (self._state == states.SELECT) {
            self._fileName = null;
        } else if (self._state == states.START) {
            self._fileName = null;
            self._changeState(AC.WidgetExt.UPLOAD_STATE.SELECT);
        } else if (self._state == states.STOP) {
            if (!self._isNative) {
                self.stopUploading();
                self._fileName = null;
                self._changeState(AC.WidgetExt.UPLOAD_STATE.SELECT);
            }
        }
    };
    
    p.startUpload = function() {
        var self = this;
        if (self._state != AC.WidgetExt.UPLOAD_STATE.START) {
            return;
        }
        
        if (self._isNative) {
            self._uploadCapturedFile();
        } else {
            self.sendFile();
        }
    };
    
    p.stopUpload = function() {
        var self = this;
        if (self._state != AC.WidgetExt.UPLOAD_STATE.STOP) {
            return;
        }
        if (!self._isNative) {
            self.stopUploading();
        }
    };
    
    p.select = function(source) {
        var self = this;
        if (self._state != AC.WidgetExt.UPLOAD_STATE.SELECT) {
            return;
        }
        if (self._isNative) {
            if (!source) {
                source = self._singleSource;
            }
            if (source) {
                var func = ({
                    library: self._selectFromLibrary,
                    image: self._captureImage,
                    video: self._captureVideo,
                    audio: self._captureAudio
                })[source];
                if (typeof func == 'function') {
                    func.apply(self, []);                
                }
            }
        }
    };

    var acProps = AC.Property,
        groupNames = acProps.group_names,
        generalGroup = acProps.general,
        databaseGroup = acProps.database,
        layoutGroup = acProps.layout,
        behaviorGroup = acProps.behavior,
        styleGroup = acProps.style;
        
    p.name = acProps.normal('name');
    p.fileSizeLimit = acProps.html('fileSizeLimit', p._fileSizeLimit);
    p.selectFileText = acProps.htmlLngPropBeforeSet('selectFileText', p._beforeSelectFileText, p._redraw);
    p.startUploadText = acProps.htmlLngPropBeforeSet('startUploadText', p._beforestartUploadText, p._redraw);
    p.stopUploadText = acProps.htmlLngPropBeforeSet('stopUploadText', p._beforestopUploadText, p._redraw);
    p.fileTypes = acProps.normal('fileTypes');
    p.autoStart = acProps.normal('autoStart');
    
    p.isIncludedInSchema = acProps.normal('isIncludedInSchema', p._updateStorageFlag);
    p.isUnique = acProps.normal('isUnique');
    p.mandatory = acProps.normal('mandatory');
    p.isAttachment = acProps.normal('isAttachment');
    
    p.tabindex = acProps.html('tabindex', p._redraw);
    
    p.icon = acProps.html('icon', p._redraw);
    p.iconPosition = acProps.html('iconPosition', p._redraw);

    p.opacity = acProps.theme('opacity', p._opacity);


    var props = [{
            name: groupNames.general, 
            props: [
                generalGroup.widgetClass,
                generalGroup.name,
                generalGroup.fileSizeLimit,
                generalGroup.selectFileText,
                generalGroup.startUploadText,
                generalGroup.stopUploadText,
                generalGroup.fileTypes,
                generalGroup.fileSources,
                generalGroup.autoStart
        ]}, {
            name: groupNames.database, 
            props: [
                databaseGroup.isIncludedInSchema,
                databaseGroup.isUnique,
                databaseGroup.mandatory,
                databaseGroup.mandatoryHighlight,
                databaseGroup.isAttachment
        ]}, {
            name: groupNames.layout, 
            props:[
                layoutGroup.x,
                layoutGroup.y,
                layoutGroup.pWidthHidden,
                layoutGroup.widthHidden,
                layoutGroup.heightHidden,
                layoutGroup.sizes,
                layoutGroup.minWidth,
                layoutGroup.maxWidth,
                layoutGroup.repeat,
                layoutGroup.zindex,
                layoutGroup.tabindex,
                layoutGroup.tabStop,
                layoutGroup.anchors,
                layoutGroup.alignInContainer
        ]}, {
            name: groupNames.behavior,
            props:[
                behaviorGroup.dragAndDrop,
                behaviorGroup.resizing,
                behaviorGroup.visible,
                behaviorGroup.enable
        ]}, {
            name: groupNames.style,
            props:[
                behaviorGroup.opacity,
                styleGroup.margin,
                styleGroup.mobileTheme,
                styleGroup.mobileButtonIcon,
                styleGroup.mobileButtonIconPos,
                styleGroup.widgetStyle
        ]}];
    
    widget.props = function() {
        return props;
    };

    var defaultProps = {
        name: 'fileUpload1',
        selectFileText: 'Select File',
        startUploadText: 'Start Upload',
        stopUploadText: 'Stop Upload',
        
        x: "0",
        y: "0",
        width: "200",
        height: "55",
        zindex: "auto",
        anchors: {
            left: true, 
            top: true, 
            bottom: false, 
            right: false
        },
        alignInContainer: 'left',
        fileSources : defaultFileSources(),

        dragAndDrop: false,
        resizing: false,
        visible: true,
        enable: true,
        
        opacity: 1,
        margin: '',
        mobileTheme: "c",
        icon: 'none',
        iconPosition: 'left',
        widgetStyle: 'default'
    };
    
    widget.defaultProps = function() {
        return defaultProps;
    };

    p.newOnSelectedEvent = function() {
        return new $.Event(widget.onSelected);
    };

    p.newOnStartedEvent = function() {
        return new $.Event(widget.onStarted);
    };

    p.newOnStoppedEvent = function() {
        return new $.Event(widget.onStopped);
    };

    p.newOnUploadedEvent = function() {
        return new $.Event(widget.onUploaded);
    };

    widget.onSelected = "E#MobileUploadButton#onSelected";
    widget.onStarted = "E#MobileUploadButton#onStarted";
    widget.onStopped = "E#MobileUploadButton#onStopped";
    widget.onUploaded = "E#MobileUploadButton#onUploaded";
    widget.PERSISTENT_FS_DIRECTORY_NAME = 'acDev_AttachmentCache';

    var actions = {
        onSelected: {alias: "widget_event_onselected", funcview: "onSelected", action: "AC.Widgets.MobileUploadButton.onSelected", params: "error, fileInfo", group: "widget_event_general"},
        onStarted: {alias: "widget_event_onstarted", funcview: "onStarted", action: "AC.Widgets.MobileUploadButton.onStarted", params: "", group: "widget_event_general"},
        onStopped: {alias: "widget_event_onstopped", funcview: "onStopped", action: "AC.Widgets.MobileUploadButton.onStopped", params: "", group: "widget_event_general"},
        onUploaded: {alias: "widget_event_onuploaded", funcview: "onUploaded", action: "AC.Widgets.MobileUploadButton.onUploaded", params: "error, url", group: "widget_event_general"}
    };
    actions = $.extend({}, AC.Widgets.Base.actions(), actions);
    
    widget.actions = function() {
        return actions;
    };
    
    widget.isField = function() {
        return true;
    };

    // TODO: alignInContainer problem
    // TODO: change font size on resize in live

})(jQuery,window,document);