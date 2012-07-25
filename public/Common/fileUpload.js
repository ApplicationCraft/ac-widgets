/**
 * @lends       WiziCore_UI_FileUploadWidget#
 */
(function($, windows, document, undefined){
var WiziCore_UI_FileUploadWidget = AC.Widgets.WiziCore_UI_FileUploadWidget =  AC.Widgets.Base.extend({
    _widgetClass: "WiziCore_UI_FileUploadWidget",
    _uploadBtn: null,
    _fileNameField: null,
    _uploadContent: null,
    _dataPropName: "fileName",
    _valueDefaultPropName: 'fileName',
    _fileNameForDel: null,
    _iframe: null,
    _submitForm: null,

    /**
     * Description of constructor
     * @class  Some words about label widget class
     * @author      Dmitry Souchkov, Yuri Podoplelov
     * @version     0.3
     *
     * @constructs
     */
    init: function() {
        this._super.apply(this, arguments);
    },

    draw: function() {
        var self = this;
        var htmlId = this.htmlId();

        var content = this._uploadContent = $('/*@include_tpl(fileUpload.tpl)*/');

        content.find(".waFileUploadBtnWidgetBtn").css({"z-index": 0, left: "0px", "text-align": "center", top:"0px"});

        var btn = this._uploadBtn = content.find(".waFileUploadBtnWidget");

        this._fileNameField = content.find(".waFileUploadFileNameWidget");
        var targetForm = "target_" + htmlId;
        if (jQuery.browser.msie){
            try{
                //fix for IE
                iframe = document.createElement('<iframe name="'+ targetForm +'"></iframe>');
            } catch(e){
                iframe = document.createElement('iframe');
            }
        } else {
            var iframe = document.createElement('iframe');
        }
        iframe.setAttribute("frameBorder", 0);
        iframe.setAttribute("name", targetForm);
        iframe = $(iframe).css({width: "0px", height: "0px", border: "0px"}).hide();
        this._iframe = iframe;
        var form = content.find("form");
        var iname = "frame_" + htmlId;
        form.parent().append(iframe);
        var requestId = "req_" + htmlId;
        iframe.attr({"id": targetForm})
            .load(function(ev) {
                //check errors when iframe loaded
                if (WiziOnFileUploadWidgetUploadObject != undefined) {
                    var gObject = WiziOnFileUploadWidgetUploadObject;
                    if (gObject[requestId] != undefined) {
                        if (gObject[requestId].loading) {
                            //send error trigger
                            self.onErrorUpload(AC.Core.lang().trText("widget_fileupload_error_uploading"));
                            gObject[requestId].loading = false;
                            self.showSubmitBtn();
                        }
                    }
                }
            });

        var action = "";
        try {
            action = this.context().config().uploadServerPath();
        } catch(e) {
            acDebugger.systemLog("uploadServerPath is undefined::", e);
            action = "";
        }

        form.attr({"target": targetForm, "action": action});

        btn.find(".waFileUploadBtnWidgetFile")
            .click(function(ev){
                if (self.enable() === false || self.readonly() === true){
                    ev.stopPropagation();
                    ev.originalEvent.preventDefault();
                }
            })
            .change(function() {
                var filename = $(this).val();
                if (filename == '' || self.enable() === false || self.readonly() === true) return;
                filename = filename.match(/[^\\]*$/)[0];
                if (self.checkByFileType(filename)) {
                    self.sendFile(filename , action, requestId);
                } else {
                    //generate error file type;
                    WiziCore_Helper.showValid(AC.Core.lang().tr("widget_fileupload_valid_filetype"));
                }
                $(this).val('');
            })
            .attr("name", "file_" + htmlId)
            .css("z-index", 2);

        content.find(".waFileUploadBtnWidgetDetach").click(function() {
            self.resetFile();
            $(this).hide();
        });

        btn.find(".waFileUploadBtnWidgetStop").click(function() {
            self.showSubmitBtn();
            self.stopUploading(requestId);
        });

        var desktopDiv = btn.find(".waFileUploadForDesktop"),
            nativeDiv = btn.find(".waFileUploadForNative");
        
        if (!this.form().isNativeApp()) {
            nativeDiv.hide();
            desktopDiv.show();
        } else {
            nativeDiv.show();
            desktopDiv.hide();

            var fileSources = this.fileSources();
            if (fileSources == undefined) {
                fileSources = {
                    library: true,
                    image: true,
                    video: true,
                    audio: true
                };
            }
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
            
            var onlyChoiceBtn = btn.find(".waFileUploadOnlyChoice");
            var nativeSelect = btn.find(".waFileUploadChoice");

            if (singleSource != undefined) {
                var func = ({
                    library: this._selectFromLibrary,
                    image: this._captureImage,
                    video: this._captureVideo,
                    audio: this._captureAudio
                })[singleSource];
                
                nativeSelect.hide();
                onlyChoiceBtn.text(AC.Core.lang().trText("fileupload_mobile_single_upload"));
                onlyChoiceBtn.mobileButton();
                onlyChoiceBtn.bind("click", function() {
                    func.apply(self, []);
                })
            } else {
                onlyChoiceBtn.hide();
                var options = [
                    {value: 'library', lng: 'fileupload_existing'},
                    {value: 'image', lng: 'fileupload_image'},
                    {value: 'video', lng: 'fileupload_video'},
                    {value: 'audio', lng: 'fileupload_audio'}
                ];
                nativeSelect.find('.waFileUploadBtnPlaceholder').text(AC.Core.lang().trText("fileupload_choose"));
                for (var i = 0, l = options.length; i < l; ++i) {
                    var option = options[i];
                    var value = option.value;
                    if (fileSources[value]) {
                        var optElem = $('<option value="' + value + '" data-lng="' + option.lng + '">' + AC.Core.lang().trText(option.lng) + '</option>');
                        nativeSelect.append(optElem);
                    }
                }
                nativeSelect.selectmenu();
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
            }
        }

        this.bindTriggerObject(requestId, action);
        this.fillFileNameField(AC.Core.lang().trText("widget_fileupload_select"));
        this._submitForm = form;
        this.base().append(content);
        this._displayOptions(this.displayOptions());

        this._super.apply(this, arguments);
    },

    onPageDrawn: function(){
        this._btnBorder(this.btnBorder());
    },

    initProps: function() {
        this._super();

        this.isIncludedInSchema = this.normalProperty('isIncludedInSchema', this._updateStorageFlag);
        this.isUnique = this.normalProperty('isUnique');
        this.mandatory = this.normalProperty('mandatory');
        this.isAttachment = this.normalProperty('isAttachment');

        this.fileSources = this.normalProperty('fileSources');

        this.fileName = this.normalProperty('fileName');
        this.value = this.fileName;
        this.fileSizeLimit = this.htmlProperty('fileSizeLimit', this._fileSizeLimit);
        this.displayOptions = this.themeProperty('displayOptions', this._displayOptions);
        this.attachText = this.htmlLngPropertyBeforeSet('attachText', this._beforeAttachText, this._attachText);
        this.deattachText = this.htmlLngPropertyBeforeSet('deattachText', this._beforeDeattachText, this._deattachText);
        this.stopText = this.htmlLngPropertyBeforeSet('stopText', this._beforeStopText, this._stopText);
        this.btnLocation = this.themeProperty('btnLocation', this._btnLocation);

        this.font = this.themeProperty('font', this._font);
        this.fontColor = this.themeProperty('fontColor', this._fontColor);
        this.border = this.themeProperty('border', this._border);
        this.borderRadius = this.themeProperty('borderRadius', this._borderRadius);
        this.bg = this.themeProperty('bgColor', this._bg);
        this.btnColor = this.themeProperty('btnColor', this._btnColor);
        this.btnFont = this.themeProperty('btnFont', this._btnFont);
        this.btnBgColor = this.themeProperty('btnBgColor', this._btnBgColor);
        this.btnBorder = this.themeProperty('btnBorder', this._btnBorder);
        this.btnBorderRadius = this.themeProperty('btnBorderRadius', this._btnBorderRadius);
        this.btnWidth = this.themeProperty('btnWidth', this._btnWidth);

        this.opacity = this.themeProperty('opacity', this._opacity);
        this.tabindex = this.htmlProperty('tabindex', this._tabindex);
        this.enable = this.htmlProperty('enable', this._enable);
        this.readonly = this.normalProperty('readonly', this._readonly);
    },

    initDomState: function() {
        this._super();
        this.initDomStatePos();

        this._fileSizeLimit(this.fileSizeLimit());
        this._displayOptions(this.displayOptions());
        this._attachText(this._project['attachText']);
        this._deattachText(this._project['deattachText']);
        this._stopText(this._project['stopText']);
        this._btnLocation(this.btnLocation());
        
        this._bg(this.bg());
        this._font(this.font());
        this._fontColor(this.fontColor());
        this._border(this.border());
        this._borderRadius(this.borderRadius());
        this._btnColor(this.btnColor());
        this._btnFont(this.btnFont());
        this._btnBgColor(this.btnBgColor());
        this._btnBorderRadius(this.btnBorderRadius());
        this._btnWidth(this.btnWidth());

        this._updateEnable();
        this._updateReadonly();
        this._visible(this.visible());
        this._opacity(this.opacity());
        this._tabindex(this.tabindex());
    },

    _updateLayout: function(){
        this._super();
        this._uploadContent.height(this.height());
        if (this._enableDiv != null){
            this._enableDiv.height(this.base().height())
                            .width(this.base().width());
        }
    },

    _enable: function(flag){
        //enable/disable buttons and text
        this.showEnableDiv(flag);
    },

    _readonly: function(flag){
        if (flag === true){
            this.base().find("input[type='button']").attr("disabled", "disabled");
        } else {
            this.base().find("input[type='button']").removeAttr("disabled");
        }
    },

    fillFileNameField: function() {
        var span = this._fileNameField.children("span").empty();
        for (var i = 0, l = arguments.length; i < l; i++){
            span.append(arguments[i]);
        }
    },

    checkByFileType: function(filename) {
        var types = this.fileTypes();
        var ret = false;
        var exts = filename.split(".");
        var ext = exts[exts.length - 1].toLowerCase();
        if ($.isArray(types)) {
            for (var i in types) {
                if (types[i].toLowerCase() == ext) {
                    ret = true;
                    break;
                }
            }
        } else {
            ret = true;
        }
        return ret;
    },

    _selectFromLibrary: function() {
        var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: Camera.MediaType.ALLMEDIA
        };
        var self = this;
        navigator.camera.getPicture(function(imageData) {
                acDebugger.log('getPicture success', imageData);
                self._uploadCapturedFile(imageData);
            }, function(errorMessage) {
                if (errorMessage != 'Selection cancelled.' && errorMessage != 'no image selected') {
                    WiziCore_Helper.showError(AC.Core.lang().trText("widget_fileupload_mobile_error_selecting_library"));
                }
                acDebugger.log('getPicture fail', errorMessage);
            }, options);
    },
    
    _captureImage: function() {
        var self = this;
        navigator.device.capture.captureImage(function() {
            self._onCaptureSuccess.apply(self, arguments);
        }, function() {
            self._onCaptureError.apply(self, arguments);
        });
    },
    
    _captureVideo: function() {
        var self = this;
        navigator.device.capture.captureVideo(function() {
            self._onCaptureSuccess.apply(self, arguments);
        }, function() {
            self._onCaptureError.apply(self, arguments);
        });
    },
    
    _captureAudio: function() {
        var self = this;
        navigator.device.capture.captureAudio(function() {
            self._onCaptureSuccess.apply(self, arguments);
        }, function() {
            self._onCaptureError.apply(self, arguments);
        });
    },

    _onCaptureSuccess: function(mediaFiles) {
        acDebugger.log('capture success', mediaFiles);
        if (mediaFiles.length == 0) {
            return;
        }
        var mediaFile = mediaFiles[0];
        this._uploadCapturedFile(mediaFile.fullPath, mediaFile.name, mediaFile.type);
    },
    
    _onCaptureError: function(error) {
        acDebugger.log('capture fail', error);
        var isCanceled = (error == 'Canceled.') || (typeof error == 'object' && error != null && error.code == 3);
        if (isCanceled) {
            return;
        }
        
        WiziCore_Helper.showError(AC.Core.lang().trText("widget_fileupload_mobile_error_capturing"));
    },

    _uploadCapturedFile: function(path, name, mimeType) {
        if (name == null) {
            name = path.substr(path.lastIndexOf('/') + 1);
        }
        var uploadServerPath = this.context().config().uploadServerDirectPath(),
            sessionId = this.context().getSession().getToken(),
            formId = this.form().id(),
            ft = new FileTransfer(),
            options = {
                fileName: name,
                params: {
                    sessionId: sessionId,
                    formId: formId
                }
            };
        if (mimeType != null) {
            options.mimeType = mimeType;
        }
        
        WiziCore_Helper.disableInterface();
        
        var self = this;
        
        acDebugger.log('before uploading, uploadServerPath: ', uploadServerPath);
        ft.upload(path, uploadServerPath, function(result) {
            acDebugger.log('upload success', result);
            WiziCore_Helper.enableInterface();
            var data = JSON.parse(result.response);
            if (data.error) {
                WiziCore_Helper.showError(AC.Core.lang().trText("widget_fileupload_error_uploading"));
            } else {
                self.onFileUploaded(data, true);

                var detachBtn = self.base().find(".waFileUploadBtnWidgetDetach");
                var dopt = self.displayOptions();
                if (dopt != "Filename") {
                    detachBtn.show();
                } else {
                    detachBtn.hide();
                }
            }
        }, function(error) {
            acDebugger.log('upload fail', error);
            WiziCore_Helper.enableInterface();
            WiziCore_Helper.showError(AC.Core.lang().trText("widget_fileupload_error_uploading"));
        }, options);
    },

    bindTriggerObject: function(requestId, action) {
        var self = this;
        $(AC.Core.UploadEvents).bind(AC.Core.UploadEvents.onUploaded, function(ev, id, data) {
            //file uploaded
            if (id == requestId) {
                if (data.error) {
                    var msg = (data.msg != undefined) ? data.msg : AC.Core.lang().trText("widget_fileupload_error_uploading");
                    self.onErrorUpload(msg);
                    self.showSubmitBtn();
                } else {
                    self.onFileUploaded(data, action);
                    self.showSubmitBtn();
                    var dopt = self.displayOptions();
                    if (dopt != "Filename") {
                        self.base().find(".waFileUploadBtnWidgetDetach").show();
                    }
                }
                
            }
        });

        $(AC.Core.UploadEvents).bind(AC.Core.UploadEvents.onError, function(ev, id, data) {
            if (id == requestId) {
                var msg = AC.Core.lang().trText("widget_fileupload_error_uploading");
                self.onErrorUpload(msg);
                self.showSubmitBtn();
            }
        });
    },

    showSubmitBtn: function() {
        var btn = this._uploadBtn;
        var dopt = this.displayOptions();
        btn.find(".waFileUploadBtnWidgetBtn").hide();
        this.base().find(".waFileUploadBtnWidgetDetach").hide();
        if (dopt != "Filename") {
            btn.find(".waFileUploadBtnWidgetSubmit").show();
            btn.find(".waFileUploadBtnWidgetFile").show();
        }
        this._updateEnable();
    },

    onFileUploaded: function(data, action, msg) {
        var sendObj = {};
        var error = data.error;
            sendObj.msg = msg;

        if (data.url != undefined && error != true && action != undefined) {
            var value = data.url;
            this.fileName(value);
            this._fileNameForDel = value;
            var showName = data.srcName || data.fileName;
            showName = this.getShortName(showName);
            var aTag = $("<a>").attr({"href": value, "target": "_blank", "title": value}).append(showName);

            this.fillFileNameField(aTag, " " + AC.Core.lang().trText("widget_fileupload_uploaded"));

            sendObj.filePath = value;
        } else {
            this.fileName("");
            this.fillFileNameField(AC.Core.lang().trText(msg));
        }
        //send trigger
        var triggerEvent = new jQuery.Event(WiziCore_UI_FileUploadWidget.onFileUploaded);
        $(this).trigger(triggerEvent, [error, sendObj]);
        return !triggerEvent.isPropagationStopped();
    },

    getShortName: function(text) {
        if (text.length > 15) {
            text = text.substr(0, 12) + "...";
        }
        return text;
    },

    onErrorUpload: function(msg) {
        this.onFileUploaded({error: true}, undefined, msg);
    },
    
    onDeleteFile: function(msg) {
        this.fileName("");
        this.fillFileNameField(AC.Core.lang().trText(msg));
        this.showSubmitBtn();
        this._fileNameForDel = null;
        var triggerEvent = new jQuery.Event(WiziCore_UI_FileUploadWidget.onDeleteFile);
        $(this).trigger(triggerEvent, [msg]);
        return !triggerEvent.isPropagationStopped();
    },


    /**
     * Stop uploading file
     * @param {String} requestId requestId
     */
    stopUploading: function(requestId) {
        if (WiziOnFileUploadWidgetUploadObject != undefined) {
            var gObject = WiziOnFileUploadWidgetUploadObject;
            if (gObject[requestId] != undefined) {
                if (gObject[requestId].loading) {
                    //send error trigger
                    gObject[requestId].loading = false;
                }
            }
        }
        var iframe = this._iframe;
        iframe.attr("src", "");
        this.onFileUploaded({error: false}, undefined, AC.Core.lang().trText("widget_fileupload_error_interrupt"));
    },

    /**
     * Send file to upload server
     */
    sendFile: function(filename, action, requestId) {
        var iframe = this._iframe;
        var btn = this._uploadBtn;
        if (iframe.length == 0) {
            btn.append(iframe);
        }
        WiziOnFileUploadWidgetUploadObject[requestId] = {loading: true};
        
        btn.find(".waFileUploadBtnWidgetBtn").hide();
        btn.find(".waFileUploadBtnWidgetStop").show();
        
        var form = this._submitForm,
            symb = (action.indexOf("?") == -1) ? "?" : "&",
            sessionId = this.context().getSession().getToken(),
            formId = this.form().id(),
            parameters = [
                "requestId=" + requestId,
                "sessionId=" + sessionId,
                "formId=" + formId
            ],
            newAction = action + symb + parameters.join("&");
            
        form.attr("action", newAction);
        this._submitForm.submit();
        filename = this.getShortName(filename);
        this.fillFileNameField(filename + " " + AC.Core.lang().trText("widget_fileupload_uploading"));
    },

    resetFile: function(){
        this.fillFileNameField(AC.Core.lang().trText("widget_fileupload_reseted"));
        this.fileName('');
    },

    deleteFile: function(action, requestId) {
        var fileId = this._fileNameForDel;
        if (fileId != null) {
            var symb = (action.indexOf("?") == -1) ? "?" : "&";
            var newAction = action + symb +"deleteFile=" + fileId + "&requestId=" + requestId;
            var form = this._submitForm;
            form.attr("action", newAction);
            this._submitForm.submit();
        }
    },

    /**
     * Set/Get File size limit
     *
     * @param {String} val size limit
     * @return {String} val size limit
     */
    _fileSizeLimit: function(val) {
        if (val != undefined) {
            var form = this._submitForm;
            if (form != undefined) {
                var input = form.find("input[name=MAX_FILE_SIZE]");
                if (input.length == 0 && val != 0) {
                    input = $("<input type='hidden' name='MAX_FILE_SIZE'>");
                    form.prepend(input);
                }
                input.val(val * 1000);
                if (val == 0) {
                    input.remove();
                }
            }
        }
	},

    _onInitLanguage: function() {
        this.attachText(this.attachText());
        this.deattachText(this.deattachText());
        this.stopText(this.stopText());
    },

    _onSTUpdated: function() {
        this._onLanguageChanged();
    },

    _onLanguageChanged: function() {
        this._attachText(this._project['attachText']);
        this._deattachText(this._project['deattachText']);
        this._stopText(this._project['stopText']);
    },

    _beforeAttachText: function(val) {
        return this._beforeText(val, 'attach');
    },

    _attachText: function(val) {
        var trVal = WiziCore_Helper.isLngToken(val) ? this._getTranslatedValue(val) : val;

        if (trVal != undefined) {
            var submit = this._uploadBtn.find(".waFileUploadBtnWidgetSubmit");
            submit.val(trVal);
        }
	},

    _beforeDeattachText: function(val) {
        return this._beforeText(val, 'deattach');
    },

    _deattachText: function(val) {
        var text = WiziCore_Helper.isLngToken(val) ? this._getTranslatedValue(val) : val;

        if (text != undefined) {
            this.base().find(".waFileUploadBtnWidgetDetach").attr("title", text);
        }
	},

    _beforeStopText: function(val) {
        return this._beforeText(val, 'stop');
    },

    _stopText: function(val) {
        var text = WiziCore_Helper.isLngToken(val) ? this._getTranslatedValue(val) : val;

        if (text != undefined) {
            this._uploadBtn.find(".waFileUploadBtnWidgetStop").val(text);
        }
	},

    _beforeText : function(text, suffix) {
        if (this.form().language() != null && !this.form()._skipTokenCreation) {
            var isToken = WiziCore_Helper.isLngToken(text),
                token = isToken ? text : ('ac-' + this.id() + '_' + suffix);

            if (!isToken)
                this.form().addTokenToStringTable(this.id(), this.name(), token, text);

            return token;
        } else
            return text;
    },

    /**
     * Set/Get file Types
     *
     * @param {String} val text
     * @return {String} val text
     */
    fileTypes: function(val) {
        if (val != undefined) {
            this._project['fileTypes'] = (val == "") ? null : val.split("|");
            var obj = {"fileTypes": this._project['fileTypes']};
            this.sendExecutor(obj);
        }
        return this._project['fileTypes'];
    },

    /**
     * Set/Get Display options
     *
     * @param {String} val display option
     * @return {String} val display option
     */
    _displayOptions: function(val) {
        if (val != undefined) {
            switch (val) {
                case 'Filename':
                case 'OpenFilename':
                    this.btnLocation(this.btnLocation());
                    this.base().find(".waFileUploadBtnWidget").parent().show();
                    break;
                case 'Open':
                    this.base().find(".waFileUploadBtnWidget").parent().show();
                    this._fileNameField.hide();
                    break;
                default:
                    break;
            }
        }
	},

    _btnLocation: function(val) {
        if (val != undefined) {
            var div = this._fileNameField;
            switch (val) {
                case "left":
                    div.parent().prepend(div);
                    break;
                case "right":
                    div.parent().append(div);
                default:
                    break;
            }
        }
    },

    _btnColor: function(val) {
        if (val != undefined) {
            this.base().find("input").css("color", val);
        }
    },

    _btnFont: function(val) {
        if (val != undefined) {
            this._font(val, this.base().find("input"));
        }
    },

    _btnBgColor: function(val){
        if (val != undefined) {
            this._bg(val, this.base().find("input"));
        }
    },

    _btnBorder: function(val){
        if (val != undefined) {
            this._border(val, this.base().find("input"));
            var fileInput = this._uploadBtn.find(".waFileUploadBtnWidgetFile"),
                submitInput = this._uploadBtn.find(".waFileUploadBtnWidgetSubmit"),
                border = parseInt(val);
            border = (isNaN(border)) ? 0 : border * 2;
            if (submitInput.height() != 0){
                fileInput.height(submitInput.height() + border);
            }
        }
    },

    _btnBorderRadius: function(val){
        if (val != undefined) {
            this._borderRadius(val, this.base().find("input"));
        }
    },

    _btnWidth: function(val){
        if (val != undefined){
            if (val == 0 || val == ""){
                this._uploadBtn.parent().css("width", "30%");
            } else {
                this._uploadBtn.parent().width(val);
            }
        }
    },

    collectDataSchema: function(dataSchema) {
        var dataType = (this.isAttachment()) ? AC.Widgets.WiziCore_Api_Form.Type.ATTACHMENT : AC.Widgets.WiziCore_Api_Form.Type.STRING;
        this._simpleConstDataSchema(dataType, dataSchema);
    },

    onContainerChangeLayout: function(layout) {
        //calls from _updateLayout or when parent change layout property
        this._setPosEnableDiv();
    }
});

/* Lang constants */
/**
 * Return available widget langs
 * @return {Object} available actions
 */
WiziCore_UI_FileUploadWidget.langs = function() {
    var ret = {"en": {
        widget_fileupload_uploading: "Uploading",
        widget_fileupload_select: "Select File",
        widget_fileupload_uploaded: "Uploaded",
        widget_fileupload_event_uploaded: "Uploaded",
        widget_fileupload_event_delfile: "Delete File",
        widget_fileupload_error_uploading: "Uploading error",
        widget_fileupload_error_interrupt: "Upload interrupted",
        widget_fileupload_error_cantdelfile: "Can't delete file",
        widget_fileupload_filedeleted: "File deleted successfully",
        widget_fileupload_reseted: "File reseted",

        widget_fileupload_mobile_error_selecting_library: "Could not select from library",
        widget_fileupload_mobile_error_capturing: "Could not capture media",
        widget_fileupload_valid_filetype: "Wrong file type"
    }};
    /* Lang constants */

    return ret;
};
AC.Core.lang().registerWidgetLang(WiziCore_UI_FileUploadWidget.langs());

WiziCore_UI_FileUploadWidget.onFileUploaded = "E#FileUpload#onFileUploaded";
WiziCore_UI_FileUploadWidget.onDeleteFile = "E#FileUpload#onDeleteFile";

/**
 * Return widget actions
 * @return {Object} available property
 */
WiziCore_UI_FileUploadWidget.actions = function() {
    var ret = {
                uploaded: {alias: "widget_fileupload_event_uploaded", funcview: "onFileUploaded", action: "AC.Widgets.WiziCore_UI_FileUploadWidget.onFileUploaded", params: "error, data", group: "widget_event_general"}
                //delete_file: {alias: "widget_fileupload_event_delfile", funcview: "onDeleteFile", action: "WiziCore_UI_FileUploadWidget.onDeleteFile", params: "msg", group: "widget_event_general"}
               };
    ret = $.extend(AC.Widgets.Base.actions(), ret);
    WiziCore_UI_FileUploadWidget.actions = function(){return ret};
    return ret;
};

var _props = [{name: AC.Property.group_names.general, props:[
            AC.Property.general.widgetClass,
            AC.Property.general.name,
            AC.Property.general.fileName,
            AC.Property.general.fileSizeLimit,
            AC.Property.general.displayOptions,
            AC.Property.general.attachText,
            AC.Property.general.deattachText,
            AC.Property.general.stopText,
            AC.Property.general.btnLocation,
            AC.Property.general.fileTypes,
            AC.Property.general.fileSources
        ]},
    {name: AC.Property.group_names.database, props:[
            AC.Property.database.isIncludedInSchema,
            AC.Property.database.isUnique,
            AC.Property.database.mandatory,
            AC.Property.database.mandatoryHighlight,
            AC.Property.database.isAttachment
        ]},        
    {name: AC.Property.group_names.layout, props:[
            AC.Property.layout.x,
            AC.Property.layout.y,
            AC.Property.layout.pWidthHidden,
            AC.Property.layout.widthHidden,
            AC.Property.layout.heightHidden,
            AC.Property.layout.sizes,
            AC.Property.layout.minWidth,
            AC.Property.layout.maxWidth,
            AC.Property.layout.maxHeight,
            AC.Property.layout.repeat,
            AC.Property.layout.zindex,
            AC.Property.layout.anchors,
            AC.Property.layout.alignInContainer
        ]},
    {name: AC.Property.group_names.behavior, props:[
            AC.Property.behavior.dragAndDrop,
            AC.Property.behavior.resizing,
            AC.Property.behavior.visible,
            AC.Property.behavior.enable,
            AC.Property.behavior.readonly
        ]},
    {name: AC.Property.group_names.style, props:[
            AC.Property.behavior.opacity,
            AC.Property.style.font,
            AC.Property.style.fontColor,
            AC.Property.style.margin,
            AC.Property.style.border,
            AC.Property.style.borderRadius,
            AC.Property.style.bgColor,
            AC.Property.general.btnWidth,
            AC.Property.style.btnBgColor,
            AC.Property.style.btnBorder,
            AC.Property.style.btnBorderRadius,
            AC.Property.style.customCssClasses,
			AC.Property.style.widgetStyle,
            AC.Property.style.btnColor,
            AC.Property.style.btnFont,
            AC.Property.general.displayHourglassOver,
            AC.Property.general.hourglassImage
        ]}
];
/**
 * Return available widget prop
 * @return {Object} available property
 */
WiziCore_UI_FileUploadWidget.props = function() {
    return _props;
 
};
    var capabilities = {
        actions: WiziCore_UI_FileUploadWidget.actions(),

        defaultProps: {
            width: 200,
            height: 25,
            pWidth: "",
            btnWidth: "",
            margin: "", alignInContainer: 'left',
            x: "100",
            y: "50",
            zindex: "auto",
            anchors: {left: true, top: true, bottom: false, right: false},
            visible: true,
            widgetStyle: "default",
            opacity: 1,
            name: "fileUpload1",
            attachText: "File",
            deattachText: "Reset",
            stopText: "Stop",
            btnLocation: "right",
            displayOptions: "OpenFilename",
            hourglassImage: "Default",
            displayHourglassOver: "inherit", customCssClasses: "",
            fileName: '',
            enable: true,
            dragAndDrop: false, resizing: false,
            readonly: false
        },

        emptyProps: {bgColor: "", fontColor: "", font:"", border:"", borderRadius:"0", btnFont: "", btnColor: "", btnBgColor: "", btnBorder: "", btnBorderRadius: ""},

        props: WiziCore_UI_FileUploadWidget.props(),
        isField: false,
        containerType: AC.Widgets.Base.CASE_TYPE_ITEM
    };

WiziCore_UI_FileUploadWidget.capabilities = function() {

    return capabilities;
};

WiziCore_UI_FileUploadWidget.isField = function() {return true};
})(jQuery,window,document);