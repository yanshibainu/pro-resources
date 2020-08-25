/*
* 1.不要用Range.insertNode(部分開放使用)
* 2.Internet Explorer only supports contains() for elements.
* 3.String.fromCharCode(8203) 為控制focus重要因素
* 4.大改版 用MutationObserver處理 undo redo,所有功能皆要測試
* 5.closest ie不支援
* 6.deleteSelectedContents 改寫,要測試
*/


(function () {

    //base
    var EditorHTMLElement = (function () {

        var EditorHTMLElement = function (htmlElement /** HTMLElement **/) {

            this._invalidateDisplayListFlag = false;
            this._invalidatePropertiesFlag = false;

            this._uid;
            this._uidChangedFlag = false;
            this._textContent;
            this._textContentChangedFlag = false;
            this._addChildAtByTextNodeIndex;
            this._addChildAtByTextNodeChangedFlag = false;

            this._htmlElement;
            this._childNodes = [];//all
            this._children = [];//Node.ELEMENT_NODE
            this._focusSetFlag = false;
            this._focusOffset;
            this._childrenChangedFlag = false;
            this._contentEditable = false;
            this._contentEditableChangedFlag = false;
            this._mode;
            this._modeChangedFlag = false;
            this._title = "";
            this._titleChangedFlag = false;
            this._contextMenuOwner = false;
            this._isPageBreak = true;//物件是否切頁
            this._range;
            this._rangeChangedFlag = false;
            this._startEndOffset;
            this._startEndOffsetChangedFlag = false;

            this.htmlElement = htmlElement;
            this.parent;

            if (!this.htmlElement) {
                this._createChildren();
                this._childrenMapping();
            }
            else {
                this._childrenMapping();
            }
            this._creationCompleteFlag = false;
            this._creationComplete();


            if (this.htmlElement && this.htmlElement.getAttribute)
                this._contentEditable = this.htmlElement.getAttribute("contentEditable") != "false";
        };

        EditorHTMLElement.prototype = {
            _createChildren: function () {
            },
            _childrenMapping: function () {

                if (this.htmlElement) {

                    if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {
                        var isPageBreak = this.htmlElement.getAttribute("data-page-break")

                        if (isPageBreak != undefined)
                            this._isPageBreak = JSON.parse(isPageBreak);
                    }

                    if (this.htmlElement.childNodes) {
                        var childNodes = this.htmlElement.childNodes;

                        for (var i = 0; i < childNodes.length; i++) {
                            var childNode = childNodes[i];

                            InstanceManager.parse(childNode);
                            var childItemEditor;

                            //if (childNode.nodeType == Node.ELEMENT_NODE) {
                            //    childItemEditor = InstanceManager.getInstance(childNode);
                            //    this.addChild(childItemEditor);
                            //}
                            //else if (childNode.nodeType == Node.TEXT_NODE) {
                            //    childItemEditor = InstanceManager.getInstance(childNode);
                            //    this.addChildAtByTextNode(childItemEditor);
                            //}

                            childItemEditor = InstanceManager.getInstance(childNode);
                            this.addChild(childItemEditor);
                        }
                        this._invalidateDisplayList();
                    }
                }
            },
            _creationComplete: function () {
                this._creationCompleteFlag = true;
            },
            _invalidateProperties: function () {
                if (!this._invalidatePropertiesFlag) {

                    this._invalidatePropertiesFlag = true;

                    var self = this;

                    setTimeout(function () {
                        //self._commitProperties.call(self);

                        //self._invalidatePropertiesFlag = false;
                        if (self._invalidatePropertiesFlag)
                            self.validateProperties();

                        //self._invalidatePropertiesFlag = false;
                    });
                }
            },
            _commitProperties: function () {

                if (this._uidChangedFlag) {
                    this._uidChangedFlag = false;

                    this.htmlElement.uid = this._uid;

                    if (!this.htmlElement.id)
                        this.htmlElement.id = this.name + "_" + new Date().getTime() + "_" + this._uid;

                }

                if (this._textContentChangedFlag) {//多子結點要處理
                    this._textContentChangedFlag = false;

                    //if (this.htmlElement.firstChild)
                    //this.htmlElement.firstChild.textContent = this._textContent;
                    // else

                    //debugger

                    //this.htmlElement.textContent = this._textContent;
                    if (this.htmlElement.nodeType == Node.TEXT_NODE)
                        this.htmlElement.textContent = this._textContent;
                    else {

                        //for (var i = this.htmlElement.childNodes.length - 1; i >= 0; i--) {
                        //    var node = this.htmlElement.childNodes[i];

                        //    if (node.nodeType == Node.TEXT_NODE) {
                        //        this.htmlElement.removeChild(node);
                        //    }
                        //}

                        //if (this.htmlElement.childNodes.length > 0)
                        //    this.htmlElement.insertBefore(document.createTextNode(this._textContent), this.htmlElement.children[0]);
                        //else
                        //    this.htmlElement.appendChild(document.createTextNode(this._textContent));

                        //new

                        /*
                        for (var i = this.htmlElement.childNodes.length - 1; i >= 0; i--) {
                            var node = this.htmlElement.childNodes[i];

                            if (node.nodeType == Node.TEXT_NODE) {
                                node.textContent = "";
                            }
                        }

                        if (this.htmlElement.childNodes.length > 0) {

                            if(this.htmlElement.childNodes[this.htmlElement.childNodes.length - 1].nodeType == Node.TEXT_NODE)
                                this.htmlElement.appendChild(document.createTextNode(this._textContent));
                            else
                                this.htmlElement.insertBefore(document.createTextNode(this._textContent), this.htmlElement.childNodes[this.htmlElement.childNodes.length - 1]);
                        }
                        else
                            this.htmlElement.appendChild(document.createTextNode(this._textContent));*/

                        if (this.childNodes.length > 0) {

                            this.htmlElement.normalize();
                            this._validateChildNodes();

                            var lastInstance = this.childNodes[this.childNodes.length - 1];

                            if (lastInstance) {

                                if (lastInstance.htmlElement.nodeType == Node.TEXT_NODE) {
                                    lastInstance.textContent = this._textContent;
                                    lastInstance.validateProperties();
                                }
                                else {
                                    this.addChildAt(InstanceManager.getInstance(document.createTextNode(this._textContent), text), lastInstance.childNodeIndex);
                                    this.validateNow();
                                }
                            }
                            else {//一個textNode都沒有
                                this.addChild(InstanceManager.getInstance(document.createTextNode(this._textContent), text));
                                this.validateNow();
                            }


                        }
                        else {
                            this.addChild(InstanceManager.getInstance(document.createTextNode(this._textContent), text));
                            this.validateNow();
                        }




                    }
                }

                if (this._titleChangedFlag) {
                    this._titleChangedFlag = false;

                    this.htmlElement.title = this._title;
                }

                if (this._focusSetFlag) {
                    this._focusSetFlag = false;

                    if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {
                        var selection = window.getSelection();
                        this.htmlElement.focus();
                        var treeWalker = document.createTreeWalker(
                            this.htmlElement,
                            NodeFilter.SHOW_TEXT,
                            function (node) {
                                return NodeFilter.FILTER_ACCEPT;
                            },
                            false);

                        var cursor = 0;
                        var node = null;

                        while (node = treeWalker.nextNode()) {
                            var text = node.textContent;

                            if (cursor + text.length >= this._focusOffset) {
                                selection.collapse(node, this._focusOffset - cursor);
                                break;
                            }

                            cursor += text.length;
                        }


                        this.htmlElement.dispatchEvent(new CustomEvent("htmlElementFocus", {
                            bubbles: true,
                            detail: {
                                editor: this
                            },
                        }));
                    }
                    else if (this.htmlElement.nodeType == Node.TEXT_NODE) {//尚未測試
                        var selection = window.getSelection();
                        selection.collapse(this.htmlElement, this._focusOffset);

                        this.htmlElement.dispatchEvent(new CustomEvent("htmlElementFocus", {
                            bubbles: true,
                            detail: {
                                editor: this
                            },
                        }));
                    }
                }

                if (this._startEndOffsetChangedFlag) {
                    this._startEndOffsetChangedFlag = false;

                    var selection = window.getSelection();
                    var range = document.createRange();
                    range.selectNodeContents(this.htmlElement);

                    if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {

                        this.htmlElement.focus();
                        var treeWalker = document.createTreeWalker(
                            this.htmlElement,
                            NodeFilter.SHOW_TEXT,
                            function (node) {
                                return NodeFilter.FILTER_ACCEPT;
                            },
                            false);

                        var cursor = 0;
                        var node = null;
                        var setStartFlag = false;

                        while (node = treeWalker.nextNode()) {
                            var text = node.textContent;

                            if (!setStartFlag && cursor + text.length >= this._startEndOffset.startOffset) {
                                range.setStart(node, this._startEndOffset.startOffset - cursor);

                                setStartFlag = true;
                            }

                            if (cursor + text.length >= this._startEndOffset.endOffset) {
                                range.setEnd(node, this._startEndOffset.endOffset - cursor);
                                break;
                            }

                            cursor += text.length;
                        }

                        if (selection.rangeCount > 0)
                            selection.removeAllRanges();

                        selection.addRange(range);

                        this.htmlElement.dispatchEvent(new CustomEvent("htmlElementFocus", {
                            bubbles: true,
                            detail: {
                                editor: this
                            },
                        }));
                    }
                    else if (this.htmlElement.nodeType == Node.TEXT_NODE) {

                        range.setStart(this.htmlElement, this._startEndOffset.startOffset);
                        range.setEnd(this.htmlElement, this._startEndOffset.endOffset);

                        this.htmlElement.dispatchEvent(new CustomEvent("htmlElementFocus", {
                            bubbles: true,
                            detail: {
                                editor: this
                            },
                        }));
                    }

                }

                if (this._contentEditableChangedFlag) {
                    this._contentEditableChangedFlag = false;

                    this.htmlElement.contentEditable = this._contentEditable;

                    //支援度低
                    //var self = this;
                    //var onSelectionchange = function (event) {
                    //    console.log(event)
                    //    self.htmlElement.dispatchEvent(new CustomEvent("htmlElementSelectChange", {
                    //        bubbles: true,
                    //        detail: {
                    //            editor: self
                    //        },
                    //    }));
                    //}

                    //if (this.htmlElement.contentEditable)
                    //    this.htmlElement.addEventListener("selectionchange", onSelectionchange, false);
                    //else
                    //    this.htmlElement.removeEventListener("selectionchange", onSelectionchange, false);

                    var self = this;
                    var onFocus = function (event) {

                        self.htmlElement.dispatchEvent(new CustomEvent("htmlElementFocus", {
                            bubbles: true,
                            detail: {
                                editor: self
                            },
                        }));
                    }

                    if (this.htmlElement.contentEditable)
                        this.htmlElement.addEventListener("click", onFocus, false);
                    else
                        this.htmlElement.removeEventListener("click", onFocus, false);
                }

                // console.debug("uid: " + this.uid + " _commitProperties");
            },
            _invalidateDisplayList: function () {

                if (!this._invalidateDisplayListFlag) {

                    this._invalidateDisplayListFlag = true;

                    if (this.htmlElement) {
                        var self = this;

                        setTimeout(function () {
                            if (self._invalidateDisplayListFlag)
                                self.validateNow();
                        });
                    }
                }
            },
            _updateDisplayList: function () {
            },
            validateProperties: function () {

                if (this._invalidatePropertiesFlag) {
                    //for (var i = 0; i < this._children.length; i++) {
                    //    this.getChildAt(i).validateProperties();
                    //}

                    //子結點跟TextNode要先更新

                    if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {
                        for (var i = 0; i < this.htmlElement.childNodes.length; i++) {
                            InstanceManager.getInstance(this.htmlElement.childNodes[i]).validateProperties();
                        }
                    }

                    this._commitProperties();

                    this._invalidatePropertiesFlag = false;
                }
            },
            validateNow: function () {

                if (this._invalidateDisplayListFlag) {
                    //for (var i = 0; i < this._children.length; i++) {
                    //    this.getChildAt(i).validateNow();
                    //}
                    //子結點跟TextNode要先更新
                    for (var i = 0; i < this.htmlElement.childNodes.length; i++) {
                        InstanceManager.getInstance(this.htmlElement.childNodes[i]).validateNow();
                    }

                    this._updateDisplayList();

                    this._invalidateDisplayListFlag = false;
                }
            },
            get htmlElement() {
                return this._htmlElement;
            },
            set htmlElement(value) {

                if (value != undefined) {

                    this._htmlElement = value;

                    var self = this;
                    var onDOMNodeInserted = function (event) {
                        value.removeEventListener("DOMNodeInsertedIntoDocument", onDOMNodeInserted, false);

                        self._invalidateDisplayList.call(self);
                    };

                    value.addEventListener("DOMNodeInsertedIntoDocument", onDOMNodeInserted, false);

                    if (!getConfig("undoRedoEnable"))
                        return;

                    var observer = new MutationObserver(function (mutations, observer) {

                        //self._childNodes = [];

                        //mutations.forEach(function (mutation) {
                        //    for (var i = 0; i < value.childNodes.length; i++) {
                        //        var instance = InstanceManager.getInstance(value.childNodes[i]);
                        //        instance.parent = self;
                        //        self._childNodes.push(instance);
                        //    }

                        //});

                        self._validateChildNodes();
                    });

                    observer.observe(value, {
                        childList: true
                    });

                }
            },
            _validateChildNodes: function () {

                this._childNodes = [];

                for (var i = 0; i < this.htmlElement.childNodes.length; i++) {
                    var instance = InstanceManager.getInstance(this.htmlElement.childNodes[i]);
                    instance.parent = this;
                    this._childNodes.push(instance);
                }
            },
            getPagingEditorHTMLElement: function () {

                var cloneHTMLElement = InstanceManager.clone(this.htmlElement, true);
                var dataClass = eval(cloneHTMLElement.getAttribute("data-class"));
                var pagingEditor = InstanceManager.getInstance(cloneHTMLElement, dataClass);

                return pagingEditor;
            },
            get uid() {
                return this._uid;
            },
            set uid(value) {

                if (value != undefined && value != this._uid) {
                    this._uid = value;
                    this._uidChangedFlag = true;
                    this._invalidateProperties();
                    this.validateProperties();
                }

            },
            get name() {
                return "EditorHTMLElement";
            },
            get textContent() {

                if (this._textContentChangedFlag)
                    return this._textContent;
                //else if (this.htmlElement.firstChild)
                //    return this.htmlElement.firstChild.textContent;
                else {

                    if (this.htmlElement.nodeType == Node.TEXT_NODE)
                        return this.htmlElement.textContent
                    else {
                        var text = "";

                        for (var i = 0; i < this.htmlElement.childNodes.length; i++) {
                            var node = this.htmlElement.childNodes[i];

                            if (node.nodeType == Node.TEXT_NODE) {
                                text += node.textContent;
                            }
                        }

                        return text;
                    }



                    //return this.htmlElement.textContent;
                }

            },
            set textContent(value) {

                if (value != undefined && value != this.textContent) {

                    //value = value.trim();

                    this._textContent = value;
                    this._textContentChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get title() {
                return this._title;
            },
            set title(value) {

                if (value != undefined && value != this.title) {

                    this._title = value;
                    this._titleChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get contenteditable() {
                return this._contentEditable;
            },
            set contenteditable(value) {

                if (value != undefined && value != this.contenteditable) {

                    this._contentEditable = value;
                    this._contentEditableChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            setStyle: function (styleProp, newValue) {
                this.htmlElement.style[styleProp] = newValue;
            },
            getStyle: function (styleProp) {
                return this.htmlElement.style[styleProp];
            },
            insertNode: function (editorHTMLElement /** EditorHTMLElement **/, index) {
                debugger
                var newEditorHTMLElement;

                if (this.childNodes.indexOf(editorHTMLElement) == -1) {

                    this.validateProperties();
                    var newFocusOffset;

                    /*if (this.isEmpty()) {//這邊還有問題

                        for (var i = this.htmlElement.childNodes.length - 1; i >= 0; i--) {
                            if (this.htmlElement.childNodes[i].nodeType == Node.TEXT_NODE) {
                                var instance = InstanceManager.getInstance(this.htmlElement.childNodes[i]);
                                instance.textContent = String.fromCharCode(8203);
                                //instance.textContent = "";
                            }
                        }
                    }*/

                    if (this.htmlElement.childNodes.length == 0) {

                        var nodeRange = document.createRange();
                        nodeRange.selectNode(this.htmlElement);

                        newFocusOffset = editorHTMLElement.textContent.length;
                        this.focusOffset = newFocusOffset;

                        if (this.htmlElement.childNodes.length == 0)
                            this.htmlElement.appendChild(editorHTMLElement.htmlElement);
                        else
                            this.htmlElement.insertBefore(editorHTMLElement.htmlElement, this.htmlElement.childNodes[0]);

                        newEditorHTMLElement = editorHTMLElement;
                        newEditorHTMLElement.parent = this;

                    }
                    else {

                        var treeWalker = document.createTreeWalker(
                            this.htmlElement,
                            NodeFilter.SHOW_TEXT,
                            function (node) {
                                return NodeFilter.FILTER_ACCEPT;
                            },
                            false);

                        var cursor = 0;
                        var node = null;
                        var startFlag = false;

                        while (node = treeWalker.nextNode()) {
                            var text = node.textContent;

                            if (cursor + text.length >= index)
                                break;

                            cursor += text.length;
                        }

                        var startOffset = index - cursor;
                        var endOffset = index - cursor;
                        var nodeRange = document.createRange();
                        nodeRange.selectNodeContents(this.htmlElement);
                        nodeRange.setStart(node, startOffset);
                        nodeRange.setEnd(node, endOffset);

                        debugger
                        ///

                        var nodeEditor = InstanceManager.getInstance(node);
                        var cloneNodeEditor;


                        if (this.htmlElement != node.parentNode)
                            cloneNodeEditor = InstanceManager.getInstance(node.parentNode).clone();
                        else
                            cloneNodeEditor = nodeEditor.clone();

                        cloneNodeEditor.htmlElement.textContent = "";


                        //ie 有問題
                        newFocusOffset = index + editorHTMLElement.textContent.length;
                        this.focusOffset = newFocusOffset;

                        var textContent = node.textContent;

                        if (startOffset < textContent.length) { //切割

                            nodeEditor.textContent = textContent.substring(0, startOffset);
                            nodeEditor.validateProperties();
                            cloneNodeEditor.textContent = textContent.substring(startOffset, textContent.length);
                            cloneNodeEditor.validateProperties();

                            var nextSiblingNode = getNextSiblingNode(node, this.htmlElement);

                            if (nextSiblingNode) {
                                this.htmlElement.insertBefore(editorHTMLElement.htmlElement, nextSiblingNode);
                                this.htmlElement.insertBefore(cloneNodeEditor.htmlElement, nextSiblingNode);
                            }
                            else {
                                this.htmlElement.appendChild(editorHTMLElement.htmlElement);
                                this.htmlElement.appendChild(cloneNodeEditor.htmlElement);
                            }


                            //var nextSibling;

                            //if (node.nextSibling)
                            //    nextSibling = node.nextSibling;
                            //else if (this != InstanceManager.getInstance(node.parentNode) && node.parentNode && node.parentNode.nextSibling)
                            //    nextSibling = node.parentNode.nextSibling;

                            //if (nextSibling) {
                            //    this.htmlElement.insertBefore(editorHTMLElement.htmlElement, nextSibling);
                            //    this.htmlElement.insertBefore(cloneNodeEditor.htmlElement, nextSibling);
                            //}                               
                            //else {
                            //    this.htmlElement.appendChild(editorHTMLElement.htmlElement);
                            //    this.htmlElement.appendChild(cloneNodeEditor.htmlElement);
                            //}
                        }
                        else {

                            var nextSiblingNode = getNextSiblingNode(node, this.htmlElement);

                            if (nextSiblingNode)
                                this.htmlElement.insertBefore(editorHTMLElement.htmlElement, nextSiblingNode);
                            else
                                this.htmlElement.appendChild(editorHTMLElement.htmlElement);

                            //if (node.nextSibling)
                            //    this.htmlElement.insertBefore(editorHTMLElement.htmlElement, node.nextSibling);
                            //else if (this != InstanceManager.getInstance(node.parentNode) && node.parentNode && node.parentNode.nextSibling)
                            //    this.htmlElement.insertBefore(editorHTMLElement.htmlElement, node.parentNode.nextSibling);
                            //else
                            //    this.htmlElement.appendChild(editorHTMLElement.htmlElement);
                        }


                        newEditorHTMLElement = editorHTMLElement;
                        newEditorHTMLElement.parent = this;

                        //
                        //editorHTMLElement.focusOffset = editorHTMLElement.getStartEndOffset().localStartOffset;

                        ///

                        // editorHTMLElement.parent = this;
                        //this._children.splice(Array.prototype.slice.call(this.htmlElement.children).indexOf(editorHTMLElement.htmlElement), 0, editorHTMLElement);

                    }

                    function getNextSiblingNode(node, htmlElement) {
                        debugger
                        var siblingNode = node;

                        while (siblingNode.parentNode != htmlElement) {

                            siblingNode = siblingNode.parentNode;
                        }

                        if (siblingNode.nextSibling)
                            return siblingNode.nextSibling

                        return null;
                    }

                    return newEditorHTMLElement;
                }
            },
            addChildAtByTextNode: function (editorHTMLElement/** TextNode **/, index) { //準備來停用

                if (this._childNodes.indexOf(editorHTMLElement) == -1) {

                    if (index != undefined) {
                        if (Array.prototype.slice.call(this.htmlElement.childNodes).indexOf(editorHTMLElement.htmlElement) == -1)
                            this.htmlElement.insertBefore(editorHTMLElement.htmlElement, this.htmlElement.childNodes[index]);

                        this._childNodes.splice(index, 0, editorHTMLElement);
                    }
                    else {
                        if (Array.prototype.slice.call(this.htmlElement.childNodes).indexOf(editorHTMLElement.htmlElement) == -1)
                            this.htmlElement.appendChild(editorHTMLElement.htmlElement);

                        this._childNodes.push(editorHTMLElement);
                    }

                    editorHTMLElement.parent = this;
                }

                return editorHTMLElement;
            },
            addChildAt: function (editorHTMLElement /** EditorHTMLElement **/, index) {

                if (this._childNodes.indexOf(editorHTMLElement) == -1) {

                    if (index != undefined && index < this.htmlElement.childNodes.length) {
                        if (Array.prototype.slice.call(this.htmlElement.childNodes).indexOf(editorHTMLElement.htmlElement) == -1)
                            this.htmlElement.insertBefore(editorHTMLElement.htmlElement, this.htmlElement.childNodes[index]);

                        this._childNodes.splice(index, 0, editorHTMLElement);

                        editorHTMLElement.parent = this;

                        this._childrenChangedFlag = true;
                        this._invalidateDisplayList();

                        return editorHTMLElement;
                    }
                    else
                        return this.addChild(editorHTMLElement);

                    //if (this.htmlElement.children.length > 0 && this.children.length > 0) {

                    //    //this._children.splice(index, 0, editorHTMLElement);

                    //    //if (Array.prototype.slice.call(this.htmlElement.childNodes).indexOf(editorHTMLElement.htmlElement) == -1)
                    //    //    this.htmlElement.insertBefore(editorHTMLElement.htmlElement, this.htmlElement.children[index]);

                    //    if (Array.prototype.slice.call(this.htmlElement.childNodes).indexOf(editorHTMLElement.htmlElement) == -1)
                    //        this.htmlElement.insertBefore(editorHTMLElement.htmlElement, this.htmlElement.childNodes[index]);

                    //    this._childNodes.splice(index, 0, editorHTMLElement);

                    //    editorHTMLElement.parent = this;

                    //    this._childrenChangedFlag = true;
                    //    this._invalidateDisplayList();

                    //    return editorHTMLElement;
                    //}
                    //else
                    //    return this.addChild(editorHTMLElement);
                }
            },
            addChild: function (editorHTMLElement /** EditorHTMLElement **/) {

                if (this._childNodes.indexOf(editorHTMLElement) == -1) {
                    if (Array.prototype.slice.call(this.htmlElement.childNodes).indexOf(editorHTMLElement.htmlElement) == -1)
                        this.htmlElement.appendChild(editorHTMLElement.htmlElement);

                    this._childNodes.push(editorHTMLElement);

                    editorHTMLElement.parent = this;

                    this._childrenChangedFlag = true;
                    this._invalidateDisplayList();

                    return editorHTMLElement;
                }
            },
            getChildAt: function (index) {

                if (index >= 0 && index < this.children.length)
                    return this.children[index];

                //if (index >= 0 && index < this.childNodes.length)
                //    return this.childNodes[index];

                return null;
            },
            remove: function () {
                this.removeChildAll();
                this.parent.removeChild(this);
            },
            removeChild: function (editorHTMLElement) {

                //if (editorHTMLElement.htmlElement.nodeType == Node.ELEMENT_NODE) {
                //    var index = this._childNodes.indexOf(editorHTMLElement);

                //    if (editorHTMLElement.parent == this)
                //        this.htmlElement.removeChild(editorHTMLElement.htmlElement);

                //    editorHTMLElement.parent = undefined;

                //    if (index >= 0) {
                //        //this.children.splice(index, 1);
                //        this._childNodes.splice(index, 1);
                //        this._childrenChangedFlag = true;
                //        this._invalidateDisplayList();
                //    }
                //}
                //else if (editorHTMLElement.htmlElement.nodeType == Node.TEXT_NODE) {

                //    if (editorHTMLElement.parent == this)
                //        this.htmlElement.removeChild(editorHTMLElement.htmlElement);

                //    editorHTMLElement.parent = undefined;
                //    this._childNodes.splice(index, 1);
                //}

                var index = this._childNodes.indexOf(editorHTMLElement);

                if (editorHTMLElement.parent == this && editorHTMLElement.htmlElement.parentNode == this.htmlElement)
                    this.htmlElement.removeChild(editorHTMLElement.htmlElement);

                editorHTMLElement.parent = undefined;

                if (index >= 0) {
                    //this.children.splice(index, 1);
                    this._childNodes.splice(index, 1);

                    this._childrenChangedFlag = true;
                    this._invalidateDisplayList();

                }
            },
            removeChildAll: function () {
                for (var i = this.childNodes.length - 1; i >= 0; i--) {
                    this.removeChild(this.childNodes[i]);
                }
            },
            //不含textNode
            get children() {
                return this._childNodes.filter(function (editorHTMLElement) {
                    return editorHTMLElement.htmlElement.nodeType == Node.ELEMENT_NODE;
                });
            },
            //含textNode
            get childNodes() {
                return this._childNodes;
            },
            get otherChildren() {
                return this.children;
            },
            //含textNode
            get childNodeIndex() {
                //return this.parent.childNodes.indexOf(this);
                return this.parent.childNodes.indexOf(this)
            },
            //不含textNode
            get childIndex() {
                return this.parent.children.indexOf(this);
            },
            contains: function (editorHTMLElement) {
                return this.children.indexOf(editorHTMLElement) >= 0;
            },
            set range(value) {

                if (value != undefined) {
                    this._range = value;
                    this._rangeChangedFlag = true;

                    this._invalidateProperties();
                }
            },
            //get focusOffset() {
            //    var selection = window.getSelection();

            //    if (selection.rangeCount == 0)
            //        return -1;

            //    var range = selection.getRangeAt(0);
            //    var focusOffset = 0;    

            //    if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {
            //        var treeWalker = document.createTreeWalker(this.htmlElement, NodeFilter.SHOW_TEXT, nodeFunc, false);
            //        while (treeWalker.nextNode()) {
            //            focusOffset += treeWalker.currentNode.length;
            //        };

            //        var startContainerElement;
            //        var startContainerIsTextNode = false;
            //        //[1] Internet Explorer only supports contains() for elements.
            //        if (range.startContainer.nodeType == Node.TEXT_NODE) {
            //            startContainerElement = range.startContainer.parentNode;
            //            startContainerIsTextNode = true;
            //        }          

            //        if (startContainerIsTextNode && this.htmlElement.contains(startContainerElement)) 
            //            focusOffset += range.startOffset;

            //    }
            //    else if (this.htmlElement.nodeType == Node.TEXT_NODE) {
            //        if (this.htmlElement == range.startContainer) 
            //            focusOffset += range.startOffset;
            //    }

            //    function nodeFunc(node) {
            //        var nodeRange = document.createRange();
            //        nodeRange.selectNode(node);

            //        return nodeRange.compareBoundaryPoints(Range.START_TO_END, range) < 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            //    };

            //    return focusOffset;
            //},
            get focusOffset() {
                var selection = window.getSelection();

                if (selection.rangeCount == 0)
                    return -1;

                var range = selection.getRangeAt(0);
                var focusOffset = 0;

                if (this.htmlElement == range.startContainer)
                    focusOffset = 1;
                else if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {

                    var treeWalker = document.createTreeWalker(this.htmlElement, NodeFilter.SHOW_TEXT, nodeFunc, false);

                    while (treeWalker.nextNode()) {

                        if (treeWalker.currentNode == range.startContainer) {
                            focusOffset += range.startOffset;
                            break;
                        }
                        else
                            focusOffset += treeWalker.currentNode.length;
                    };
                }
                else if (this.htmlElement.nodeType == Node.TEXT_NODE) {

                    if (this.htmlElement == range.startContainer)
                        focusOffset += range.startOffset;
                }

                function nodeFunc(node) {
                    return NodeFilter.FILTER_ACCEPT;
                };

                return focusOffset;
            },
            set focusOffset(value) {

                if (value != undefined && value != -1) {
                    this._focusOffset = value;
                    this._focusSetFlag = true;
                    this._invalidateProperties();
                }
            },
            get endFocusOffset() {

                var endOffset = 0;

                if (this.name == "text")
                    endOffset = this.textContent.length;
                else {
                    var treeWalker = document.createTreeWalker(
                        this.htmlElement,
                        NodeFilter.SHOW_TEXT,
                        function (node) {
                            return NodeFilter.FILTER_ACCEPT;
                        },
                        false);

                    var node = null;

                    while (node = treeWalker.nextNode()) {
                        endOffset += node.textContent.length;
                    }
                }

                return endOffset;
            },
            focusToEnd: function () {
                this.focusOffset = this.endFocusOffset;
            },
            setStartEndOffset: function (value /** startOffset, endOffset **/) {

                if (value != undefined) {
                    this._startEndOffset = value;
                    this._startEndOffsetChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            getStartEndOffset: function () {
                var selection = window.getSelection();
                var range = selection.getRangeAt(0);

                var startOffset;
                var endOffset;
                var rangeNodes = [];

                if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {

                    var treeWalker = document.createTreeWalker(
                        this.htmlElement,
                        NodeFilter.SHOW_TEXT,
                        function (node) {
                            return NodeFilter.FILTER_ACCEPT;
                        },
                        false);

                    var cursor = 0;
                    var node = null;
                    var startFlag = false;

                    while (node = treeWalker.nextNode()) {
                        var text = node.textContent;

                        if (startFlag)
                            rangeNodes.push(node);

                        if (range.startContainer.nodeType == Node.TEXT_NODE && node == range.startContainer) {
                            startFlag = true;

                            startOffset = cursor + range.startOffset;
                            rangeNodes.push(node);
                        }
                        else if (range.startContainer.nodeType == Node.ELEMENT_NODE && node.parentNode == range.startContainer) {
                            startFlag = true;

                            startOffset = range.startOffset;
                            rangeNodes.push(node);
                        }

                        if (range.endContainer.nodeType == Node.TEXT_NODE && node == range.endContainer) {
                            endOffset = cursor + range.endOffset;

                            if (rangeNodes.indexOf(node) == -1)
                                rangeNodes.push(node);

                            break;
                        }
                        else if (range.endContainer.nodeType == Node.ELEMENT_NODE && node.parentNode == range.endContainer) {

                            if (range.startContainer.parentNode != range.endContainer) //ie endContainer 可能是 startContainer parent
                                endOffset = range.endOffset;
                            else
                                endOffset = cursor + range.endOffset;

                            if (rangeNodes.indexOf(node) == -1)
                                rangeNodes.push(node);

                            break;
                        }

                        cursor += text.length;
                    }
                }
                else if (this.htmlElement.nodeType == Node.TEXT_NODE) {

                    if (range.commonAncestorContainer == this.htmlElement) {
                        startOffset = range.startOffset
                        endOffset = range.endOffset
                        rangeNodes.push(this.htmlElement);
                    } else {
                        if (this.htmlElement == range.startContainer)
                            startOffset = range.startOffset;

                        if (this.htmlElement == range.endContainer)
                            endOffset = range.endOffset;

                        rangeNodes.push(this.htmlElement);
                    }
                }

                return {
                    startOffset: startOffset,
                    endOffset: endOffset,
                    rangeNodes: rangeNodes
                }
            },
            getChildEditorByFocusOffset: function () {

                var node = null;

                if (this.htmlElement.nodeType == Node.TEXT_NODE)
                    node = this.htmlElement
                else if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {
                    var focusOffset = this.focusOffset;

                    var treeWalker = document.createTreeWalker(
                        this.htmlElement,
                        NodeFilter.SHOW_TEXT,
                        function (node) {
                            return NodeFilter.FILTER_ACCEPT;
                        },
                        false);

                    var cursor = 0;

                    var startFlag = false;

                    while (node = treeWalker.nextNode()) {
                        var text = node.textContent;

                        if (cursor + text.length >= focusOffset)
                            break;

                        cursor += text.length;
                    }

                    if (node.nodeType == Node.TEXT_NODE)
                        node = node.parentNode;
                }

                return InstanceManager.getInstance(node);
            },
            getChildEditorList: function (startOffset, endOffset, filterFunction) {

                var list = [];
                var treeWalker = document.createTreeWalker(
                    this.htmlElement,
                    NodeFilter.SHOW_TEXT, (filterFunction ||
                        function (node) {
                            return NodeFilter.FILTER_ACCEPT;
                        }),
                    false);

                var cursor = 0;
                var node = null;
                var startFlag = false;

                while (node = treeWalker.nextNode()) {
                    var text = node.textContent;

                    // if ((cursor <= endOffset && cursor + text.length <= endOffset) || (cursor <= endOffset && cursor + text.length > endOffset)) {
                    if (text.length > 0 && cursor < endOffset && ((cursor >= startOffset && cursor <= endOffset) || (cursor < startOffset && cursor + text.length > startOffset))) {
                        //if (node.nodeType == Node.TEXT_NODE)
                        //    node = node.parentNode;

                        var instance = InstanceManager.getInstance(node);
                        var s, e;

                        //if (instance == this)
                        //s = startOffset;
                        if (cursor < startOffset)
                            s = startOffset - cursor;
                        else
                            s = 0;


                        // if (instance == this)
                        //e = endOffset;
                        if (cursor + text.length >= endOffset)
                            e = endOffset - cursor;
                        else
                            e = text.length;

                        //if (focusOffset == undefined)
                        //focusOffset = s + e;


                        list.push({
                            instance: instance,
                            focusOffset: (function () {

                                var offset = 0;

                                if (node.parentNode)
                                    offset = InstanceManager.getInstance(node.parentNode).focusOffset;

                                return offset;
                            })(),
                            endOffset: startOffset + text.length,
                            localStartOffset: s,
                            localEndOffset: e,
                            parentFocusOffset: (function () {

                                var offset = 0;

                                if (node.parentNode)
                                    offset = InstanceManager.getInstance(node.parentNode).focusOffset;

                                return offset;
                            })()
                        });
                    }

                    cursor += text.length;
                }

                return list;
            },
            insertContents: function (value /* string or editorHTMLElement */, color, offset) {

                if (this.htmlElement.getAttribute("contentEditable") != "false") {

                    //var range = window.getSelection().getRangeAt(0);

                    if (offset == undefined)
                        offset = this.focusOffset;

                    //var startContainerInstance;

                    //this._validateChildNodes();

                    //startContainerInstance = InstanceManager.getInstance(range.startContainer);

                    if (typeof (value) == "string") {

                        debugger
                        var instance;

                        if (color != "inherit" && this.getStyle("color") != color) {
                            instance = InstanceManager.getInstance(undefined, span);
                            instance.setStyle("color", color);
                        }
                        else
                            instance = InstanceManager.getInstance(undefined, text);

                        instance.textContent = value;
                        instance.validateProperties();

                        this.insertNode(instance, offset);

                        //range.startContainer.insertData(range.startOffset, value);

                        //var collapsedOffset = range.startOffset + value.length;

                        //range.setStart(range.startContainer, collapsedOffset)
                        //range.setEnd(range.startContainer, collapsedOffset)
                    }
                    else {

                        //this.addChildAt(value, startContainerInstance.childNodeIndex + 1);
                        //value.focusToEnd();

                        this.insertNode(value, offset);
                    }

                    this.validateProperties();
                }




                //return textContent;
            },
            deleteContents: function (startOffset, endOffset) {//本身物件刪除

                if (this.htmlElement.nodeType == Node.TEXT_NODE) {

                    var deleteTextContent = this.htmlElement.textContent.substring(startOffset, endOffset);

                    this.htmlElement.deleteData(startOffset, endOffset - startOffset);

                    return deleteTextContent;
                }
                else {


                    var treeWalker = document.createTreeWalker(
                        this.htmlElement,
                        NodeFilter.SHOW_TEXT,
                        function (node) {
                            return NodeFilter.FILTER_ACCEPT;
                        },
                        false);

                    var cursor = 0;
                    var node = null;
                    var deleteTextContent = this.htmlElement.textContent.substring(startOffset, endOffset);
                    var isStartFlag = false;

                    while (node = treeWalker.nextNode()) {
                        var text = node.textContent;

                        if (text.length == 0)
                            continue;

                        var textContent;

                        if (isStartFlag)
                            textContent = "";

                        if (cursor + text.length > startOffset) {
                            isStartFlag = true;
                            textContent = text.substring(0, startOffset - cursor);
                        }
                        if (cursor + text.length >= endOffset)
                            textContent += text.substring(endOffset - cursor, text.length);

                        if (textContent != undefined) {
                            //old
                            //var instance = InstanceManager.getInstance(node);
                            //instance.textContent = textContent;

                            //改了undo 做法 即時刪除可

                            node.textContent = textContent;

                        }
                        cursor += text.length;

                    }

                    this.validateProperties();

                    return deleteTextContent;
                }
            },
            deleteSelectedContents_bak: function () {//跨物件選取刪除(range範圍刪除)
                var selection = window.getSelection();

                if (selection.rangeCount > 0) {

                    var range = selection.getRangeAt(0);
                    var commonAncestorContainer = range.commonAncestorContainer;

                    if (commonAncestorContainer.nodeType == commonAncestorContainer.ELEMENT_NODE) {
                        var ancestorEditor = InstanceManager.getInstance(commonAncestorContainer);
                        var startContainerChildIndex;
                        var endContainerChildIndex;
                        var startContainer = range.startContainer;
                        var endContainer = range.endContainer;

                        //[1] Internet Explorer only supports contains() for elements.
                        if (startContainer.nodeType == Node.TEXT_NODE)
                            startContainer = startContainer.parentNode;

                        if (endContainer.nodeType == Node.TEXT_NODE)
                            endContainer = endContainer.parentNode;

                        for (var i = 0; i < ancestorEditor.children.length; i++) {

                            var childItem = ancestorEditor.getChildAt(i);

                            if (startContainerChildIndex == undefined && childItem.htmlElement.contains(startContainer))
                                startContainerChildIndex = i;

                            if (endContainerChildIndex == undefined && childItem.htmlElement.contains(endContainer))
                                endContainerChildIndex = i;
                        }

                        var deleteContents = function (containerEditor, startOffset, endOffset) {

                            var isRemoveContainer = false;

                            //if (containerEditor.textContent.length == startOffset + endOffset)

                            //if (containerEditor.textContent.length == startOffset + endOffset && containerEditor.parent.canRemoveChild(containerEditor))

                            if (containerEditor.textContent.length == startOffset + endOffset)
                                isRemoveContainer = true;

                            if (startOffset != endOffset)
                                containerEditor.deleteContents(startOffset, endOffset);

                            return isRemoveContainer;
                        }

                        var getInstanceEditor = function (container) {

                            var containerEditor;

                            if (container.nodeType == commonAncestorContainer.ELEMENT_NODE)
                                containerEditor = InstanceManager.getInstance(container);
                            else
                                containerEditor = InstanceManager.getInstance(container.parentNode);

                            return containerEditor
                        }

                        var focusEditor;
                        var startContainerEditor = focusEditor = getInstanceEditor(startContainer);
                        var endContainerEditor = getInstanceEditor(endContainer);

                        var removeContainer = function (editor) {

                            if (editor == ancestorEditor)
                                return

                            var editorChildIndex = editor.childNodeIndex;
                            var parentEditor = editor.parent;

                            //if ((editor.children.length == 0 || !editor.startUndoRecord) && editor.parent.startUndoRecord)
                            //    editor.parent.removeChild(editor);

                            if ((editor.otherChildren.length == 0 || !editor.startUndoRecord) && editor.parent.startUndoRecord)
                                parentEditor.removeChild(editor);

                            //editor.parent.removeChild(editor);

                            if (parentEditor.startUndoRecord) {

                                var minIndex = 0;

                                if (parentEditor == ancestorEditor) {
                                    minIndex = startContainerChildIndex + 1;
                                }

                                for (var i = editorChildIndex - 1; i >= minIndex; i--) {
                                    var itemEditor = parentEditor.getChildAt(i);
                                    itemEditor.parent.removeChild(itemEditor);
                                }
                            }

                            //editor.parent.textContent = "";
                            removeContainer(parentEditor);
                            //var editorChildIndex = editor.childNodeIndex;
                            //if (editor.isEmpty())
                            //    editor.removeChild(editor);

                            //if (editorChildIndex > 0) {
                            //    var prevEditor = editor.parent.getChildAt(editorChildIndex - 1);
                            //    removeContainer(prevEditor);
                            //}
                        }

                        //if (startContainerChildIndex == undefined) {//commonAncestorContainer 本身, (說明文字...)
                        var startContainer_startEndOffset = startContainerEditor.getStartEndOffset();
                        var endContainer_startEndOffset = endContainerEditor.getStartEndOffset();

                        var startOffset = startContainer_startEndOffset.startOffset || 0;
                        //var endOffset = startContainerEditor.textContent.length;
                        var endOffset = startContainer_startEndOffset.endOffset || startContainerEditor.textContent.length;
                        var isRemoveStartContainer = false;

                        if (deleteContents(startContainerEditor, startOffset, endOffset)) {

                            //                            switch (startContainerEditor.name) {
                            //                                case "ListItem":

                            //                                    if (startContainerEditor.childNodeIndex < startContainerEditor.parent.children.length){

                            //}

                            //                                    if (startContainerEditor.childNodeIndex < startContainerEditor.parent.children.length)
                            //                                        focusEditor = startContainerEditor.parent.getChildAt(startContainerEditor.childNodeIndex + 1)
                            //                                    break;
                            //                            }
                            //未完成
                            if (startContainerEditor.childNodeIndex > 0) {


                                //focusEditor = startContainerEditor.parent.getChildAt(startContainerEditor.childNodeIndex - 1);

                                focusEditor = startContainerEditor.parent.childNodes[startContainerEditor.childNodeIndex - 1];
                            }
                            else if (ancestorEditor.name == "ParagraphTextBlock")
                                focusEditor = ancestorEditor;
                            else
                                focusEditor = ancestorEditor.parent;
                        }



                        //var startEndOffset = endContainerEditor.getStartEndOffset();
                        endOffset = endContainer_startEndOffset.endOffset;
                        debugger
                        if (startContainerEditor.contains(endContainerEditor)) {
                            if (0 != endOffset)
                                endContainerEditor.deleteContents(startOffset, endOffset);
                        }
                        else if (deleteContents(endContainerEditor, 0, endOffset))
                            removeContainer(endContainerEditor); //沒剩字
                        else {//有剩字 找上一個物件

                            //if (deleteContents(endContainerEditor, 0, endOffset))
                            //    removeContainer(endContainerEditor);

                            var currentEditor = endContainerEditor;
                            var prevEditor;

                            while (prevEditor == undefined) {

                                if (!currentEditor.parent.startUndoRecord || currentEditor.parent.otherChildren.length == 0)
                                    currentEditor = currentEditor.parent;
                                else if (currentEditor.childNodeIndex > 0) {
                                    currentEditor = currentEditor.parent.getChildAt(currentEditor.childNodeIndex - 1);

                                    //if (currentEditor == startContainerEditor || currentEditor.contains(startContainerEditor))

                                    if (currentEditor == startContainerEditor || currentEditor.htmlElement.contains(startContainerEditor.htmlElement))
                                        break;
                                    else {
                                        prevEditor = currentEditor;
                                        prevEditor.removeChildAll();
                                    }

                                }
                                else
                                    currentEditor = currentEditor.parent;

                                if (currentEditor == ancestorEditor)
                                    break;
                            }

                            if (prevEditor)
                                removeContainer(prevEditor);
                        }

                        if (isRemoveStartContainer)
                            removeContainer(startContainerEditor);

                        ancestorEditor._invalidateDisplayList();
                        ancestorEditor.validateNow();
                        debugger
                        selection.removeAllRanges();
                        // var startContainerEditor = InstanceManager.getInstance(startContainer);


                        if (focusEditor) {
                            debugger
                            if (focusEditor.name != "text" && focusEditor.autoList == undefined) {

                                var textBlockNode = focusEditor.htmlElement.querySelector("[data-class='ListItemTextBlock']");

                                if (textBlockNode)
                                    focusEditor = InstanceManager.getInstance(textBlockNode);
                            }

                            //focusToEnd
                            if (focusEditor == startContainerEditor)
                                focusEditor.focusOffset = startOffset;
                            else
                                focusEditor.focusToEnd();

                            focusEditor.validateProperties();
                        }

                        /*
                        if (startContainerEditor.autoList != undefined) {//判斷是否繼承TextBlock物件
                            startContainerEditor.focusOffset = startOffset;
                            startContainerEditor.validateProperties();
                        }
                        else{
                            var targetEditor;

                            if (document.body.contains(startContainerEditor.htmlElement)) 
                                targetEditor = startContainerEditor;
                            else
                                targetEditor = ancestorEditor;

                            if(targetEditor){
                                var textBlockNode = targetEditor.htmlElement.querySelector("[data-class='ListItemTextBlock']");
                                if (textBlockNode) {
                                    var textBlockEditor = InstanceManager.getInstance(textBlockNode);
                                    textBlockEditor.focusOffset = 0;//這邊還要調
                                    textBlockEditor.validateProperties();
                                }
                            }                            
                        }*/
                    }


                }
            },
            deleteSelectedContents_bak2: function () {//跨物件選取刪除(range範圍刪除)
                var selection = window.getSelection();
                debugger
                if (selection.rangeCount > 0) {

                    var range = selection.getRangeAt(0);
                    var commonAncestorContainer = range.commonAncestorContainer;

                    if (commonAncestorContainer.nodeType == commonAncestorContainer.ELEMENT_NODE) {
                        var ancestorEditor = InstanceManager.getInstance(commonAncestorContainer);
                        var startContainerChildIndex;
                        var endContainerChildIndex;
                        var startContainer = range.startContainer;
                        var endContainer = range.endContainer;

                        //[1] Internet Explorer only supports contains() for elements.
                        if (startContainer.nodeType == Node.TEXT_NODE)
                            startContainer = startContainer.parentNode;

                        if (endContainer.nodeType == Node.TEXT_NODE)
                            endContainer = endContainer.parentNode;

                        for (var i = 0; i < ancestorEditor.children.length; i++) {

                            var childItem = ancestorEditor.getChildAt(i);

                            if (startContainerChildIndex == undefined && childItem.htmlElement.contains(startContainer))
                                startContainerChildIndex = i;

                            if (endContainerChildIndex == undefined && childItem.htmlElement.contains(endContainer))
                                endContainerChildIndex = i;
                        }

                        var deleteContents = function (containerEditor, startOffset, endOffset) {

                            var isRemoveContainer = false;

                            //if (containerEditor.textContent.length == startOffset + endOffset)

                            //if (containerEditor.textContent.length == startOffset + endOffset && containerEditor.parent.canRemoveChild(containerEditor))

                            if (containerEditor.textContent.length == startOffset + endOffset)
                                isRemoveContainer = true;

                            if (startOffset != endOffset)
                                containerEditor.deleteContents(startOffset, endOffset);

                            return isRemoveContainer;
                        }

                        //var getInstanceEditor = function (container) {

                        //    var containerEditor;

                        //    if (container.nodeType == commonAncestorContainer.ELEMENT_NODE)
                        //        containerEditor = InstanceManager.getInstance(container);
                        //    else
                        //        containerEditor = InstanceManager.getInstance(container.parentNode);

                        //    return containerEditor
                        //}

                        var focusEditor;
                        var startContainerEditor = focusEditor = InstanceManager.getInstance(range.startContainer);
                        var endContainerEditor = InstanceManager.getInstance(range.endContainer)

                        var removeContainer = function (editor) {

                            if (editor == ancestorEditor)
                                return

                            var editorChildIndex = editor.childNodeIndex;
                            var parentEditor = editor.parent;

                            if ((editor.otherChildren.length == 0 || !editor.startUndoRecord) && editor.parent.startUndoRecord)
                                parentEditor.removeChild(editor);

                            /*if (parentEditor.startUndoRecord) {

                                var minIndex = 0;

                                if (parentEditor == ancestorEditor) {
                                    minIndex = startContainerChildIndex + 1;
                                }

                                for (var i = editorChildIndex - 1; i >= minIndex; i--) {
                                    var itemEditor = parentEditor.getChildAt(i);
                                    itemEditor.parent.removeChild(itemEditor);
                                }
                            }*/

                            removeContainer(parentEditor);
                        }




                        //if (startContainerChildIndex == undefined) {//commonAncestorContainer 本身, (說明文字...)
                        //var startContainer_startEndOffset = range.startOffset;
                        //var endContainer_startEndOffset = range.endOffset;

                        var startOffset = range.startOffset || 0;
                        //var endOffset = startContainerEditor.textContent.length;
                        var endOffset = startContainerEditor.textContent.length;
                        var isRemoveStartContainer = false;
                        debugger
                        if (deleteContents(startContainerEditor, startOffset, endOffset)) {

                            //                            switch (startContainerEditor.name) {
                            //                                case "ListItem":

                            //                                    if (startContainerEditor.childNodeIndex < startContainerEditor.parent.children.length){

                            //}

                            //                                    if (startContainerEditor.childNodeIndex < startContainerEditor.parent.children.length)
                            //                                        focusEditor = startContainerEditor.parent.getChildAt(startContainerEditor.childNodeIndex + 1)
                            //                                    break;
                            //                            }
                            //未完成
                            if (startContainerEditor.childNodeIndex > 0) {


                                //focusEditor = startContainerEditor.parent.getChildAt(startContainerEditor.childNodeIndex - 1);

                                focusEditor = startContainerEditor.parent.childNodes[startContainerEditor.childNodeIndex - 1];
                            }
                            else if (ancestorEditor.name == "ParagraphTextBlock")
                                focusEditor = ancestorEditor;
                            else
                                focusEditor = ancestorEditor.parent;
                            debugger
                            removeContainer(startContainerEditor);
                        }



                        //var startEndOffset = endContainerEditor.getStartEndOffset();
                        endOffset = range.endOffset;

                        //重抓
                        startContainerEditor = focusEditor = InstanceManager.getInstance(range.startContainer);
                        endContainerEditor = InstanceManager.getInstance(range.endContainer)

                        debugger

                        startContainerEditor.htmlElement.normalize();
                        startContainerEditor._validateChildNodes();
                        endContainerEditor.htmlElement.normalize();
                        endContainerEditor._validateChildNodes();

                        //while (startContainerEditor != endContainerEditor) {


                        //}

                        // deleteContents(endContainerEditor, range.startOffset, range.endOffset)

                        return;



                        if (startContainerEditor.contains(endContainerEditor)) {
                            if (0 != endOffset)
                                endContainerEditor.deleteContents(startOffset, endOffset);
                        }
                        else if (deleteContents(endContainerEditor, 0, endOffset))
                            removeContainer(endContainerEditor); //沒剩字
                        else {//有剩字 找上一個物件


                            return;
                            //if (deleteContents(endContainerEditor, 0, endOffset))
                            //    removeContainer(endContainerEditor);

                            var currentEditor = endContainerEditor;
                            var prevEditor;

                            while (prevEditor == undefined) {

                                if (!currentEditor.parent.startUndoRecord || currentEditor.parent.otherChildren.length == 0)
                                    currentEditor = currentEditor.parent;
                                else if (currentEditor.childNodeIndex > 0) {
                                    currentEditor = currentEditor.parent.getChildAt(currentEditor.childNodeIndex - 1);

                                    //if (currentEditor == startContainerEditor || currentEditor.contains(startContainerEditor))

                                    if (currentEditor == startContainerEditor || currentEditor.htmlElement.contains(startContainerEditor.htmlElement))
                                        break;
                                    else {
                                        prevEditor = currentEditor;
                                        prevEditor.removeChildAll();
                                    }

                                }
                                else
                                    currentEditor = currentEditor.parent;

                                if (currentEditor == ancestorEditor)
                                    break;
                            }

                            if (prevEditor)
                                removeContainer(prevEditor);
                        }

                        if (isRemoveStartContainer)
                            removeContainer(startContainerEditor);

                        ancestorEditor._invalidateDisplayList();
                        ancestorEditor.validateNow();
                        debugger
                        selection.removeAllRanges();
                        // var startContainerEditor = InstanceManager.getInstance(startContainer);


                        if (focusEditor) {
                            debugger
                            if (focusEditor.name != "text" && focusEditor.autoList == undefined) {

                                var textBlockNode = focusEditor.htmlElement.querySelector("[data-class='ListItemTextBlock']");

                                if (textBlockNode)
                                    focusEditor = InstanceManager.getInstance(textBlockNode);
                            }

                            //focusToEnd
                            if (focusEditor == startContainerEditor)
                                focusEditor.focusOffset = startOffset;
                            else
                                focusEditor.focusToEnd();

                            focusEditor.validateProperties();
                        }

                        /*
                        if (startContainerEditor.autoList != undefined) {//判斷是否繼承TextBlock物件
                            startContainerEditor.focusOffset = startOffset;
                            startContainerEditor.validateProperties();
                        }
                        else{
                            var targetEditor;

                            if (document.body.contains(startContainerEditor.htmlElement)) 
                                targetEditor = startContainerEditor;
                            else
                                targetEditor = ancestorEditor;

                            if(targetEditor){
                                var textBlockNode = targetEditor.htmlElement.querySelector("[data-class='ListItemTextBlock']");
                                if (textBlockNode) {
                                    var textBlockEditor = InstanceManager.getInstance(textBlockNode);
                                    textBlockEditor.focusOffset = 0;//這邊還要調
                                    textBlockEditor.validateProperties();
                                }
                            }                            
                        }*/
                    }


                }
            },
            deleteSelectedContents: function () {//跨物件選取刪除(range範圍刪除)
                var selection = window.getSelection();

                if (selection.rangeCount == 0)
                    return;

                var range = selection.getRangeAt(0);
                var commonAncestorContainer = range.commonAncestorContainer;
                var ancestorEditor = InstanceManager.getInstance(commonAncestorContainer);
                var startEndOffsetInfo = ancestorEditor.getStartEndOffset();

                debugger

                var removeContainer = function (editor) {

                    if (editor == ancestorEditor)
                        return;

                    var parentEditor = editor.parent;

                    if (parentEditor) {
                        if (editor.otherChildren.length == 0 && editor.isEmpty()) {
                            parentEditor.removeChild(editor);
                            removeContainer(parentEditor);
                        }
                    }
                }

                for (var i = startEndOffsetInfo.rangeNodes.length - 1; i >= 0; i--) {

                    var selectEditor = InstanceManager.getInstance(startEndOffsetInfo.rangeNodes[i]);
                    var contenteditable = (function () {

                        if (selectEditor.name == "text")
                            return selectEditor.parent.contenteditable;
                        else
                            return selectEditor.contenteditable;
                    })();

                    if (contenteditable) {
                        var selectOffsetInfo = selectEditor.getStartEndOffset();
                        var startOffset = selectOffsetInfo.startOffset || 0;
                        var endOffset = selectOffsetInfo.endOffset || selectEditor.textContent.length;

                        selectEditor.deleteContents(startOffset, endOffset);

                        if (selectEditor.isEmpty())
                            removeContainer(selectEditor);
                    }
                }

                if (range.startContainer) {
                    var focusEditor = InstanceManager.getInstance(range.startContainer);
                    focusEditor.focusToEnd();
                    focusEditor.validateProperties();
                }
            },
            clone: function () {
                var cloneHTMLElement = InstanceManager.clone(this.htmlElement, false);
                var dataClass;

                if (cloneHTMLElement.nodeType == Node.ELEMENT_NODE)
                    dataClass = eval(cloneHTMLElement.getAttribute("data-class"));

                var cloneEditor = InstanceManager.getInstance(cloneHTMLElement, dataClass);

                return cloneEditor;
            },
            parseFromString: function (str) {
                return InstanceManager.getInstance(
                    new DOMParser().parseFromString(str, "text/html").
                        body.children[0]);
            },
            get childrenByPageBreak() {
                return [];
            },
            get isPageBreak() {
                return this._isPageBreak;
            },
            set mode(value) {
                if (value != undefined) {
                    this._mode = value;
                    this._modeChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get mode() {
                return this._mode;
            },
            get contextMenuOwner() {
                return this._contextMenuOwner;
            },
            isEmpty: function () {

                return this.textContent.replace(new RegExp(String.fromCharCode(8203), "g"), "").length == 0;
            },
            get keyinWordAvoid() {
                return false;
            }
        };

        return EditorHTMLElement
    }());
    var UndoRedoEditor = (function () {

        var UndoRedoEditor = function (htmlElement /** HTMLElement **/) {
            //this.state = StateManager.getState(getConfig("stateName"));

            EditorHTMLElement.call(this, htmlElement);
        };

        UndoRedoEditor.prototype = {
            get state() {
                return StateManager.currentState || StateManager.getState(getConfig("stateName"));
            },
            addChildAtByTextNode: function (editorHTMLElement /** EditorHTMLElement **/, index) {
                EditorHTMLElement.prototype.addChildAtByTextNode.call(this, editorHTMLElement, index);

                if (this.state.enabled && this._creationCompleteFlag) {

                    var addChild = new AddChild(this, editorHTMLElement, "insertNode", index);
                    this.state.addOverride(addChild);
                }
            },
            addChildAt: function (editorHTMLElement /** EditorHTMLElement **/, index) {

                /*var addedEditorHTMLElement = EditorHTMLElement.prototype.addChildAt.call(this, editorHTMLElement, index);

                if (this.state.enabled && addedEditorHTMLElement) {

                    var addChild;

                    //if (addedEditorHTMLElement.childNodeIndex > 0)
                    //    addChild = new AddChild(this.getChildAt(addedEditorHTMLElement.childNodeIndex - 1), addedEditorHTMLElement, "after");
                    //else 
                    //    addChild = new AddChild(this, addedEditorHTMLElement, "firstChild");
     
                    if (addedEditorHTMLElement.childNodeIndex > 0)
                        addChild = new AddChild(this.childNodes[addedEditorHTMLElement.childNodeIndex - 1], addedEditorHTMLElement, "after");
                    else
                        addChild = new AddChild(this, addedEditorHTMLElement, "firstChild");

                    this.state.addOverride(addChild);
                }*/

                EditorHTMLElement.prototype.addChildAt.call(this, editorHTMLElement, index);

                if (this.state.enabled && this._creationCompleteFlag) {

                    var addChild;

                    if (editorHTMLElement.childNodeIndex > 0)
                        addChild = new AddChild(this.childNodes[editorHTMLElement.childNodeIndex - 1], editorHTMLElement, "after");
                    else
                        addChild = new AddChild(this, editorHTMLElement, "firstChild");

                    this.state.addOverride(addChild);
                }
            },
            addChild: function (editorHTMLElement /** EditorHTMLElement **/) {

                //var addedEditorHTMLElement = EditorHTMLElement.prototype.addChild.call(this, editorHTMLElement);

                //if (this.state.enabled && addedEditorHTMLElement) {
                //    var addChild = new AddChild(this, addedEditorHTMLElement);
                //    this.state.addOverride(addChild);
                //}

                EditorHTMLElement.prototype.addChild.call(this, editorHTMLElement);

                if (this.state.enabled && this._creationCompleteFlag) {
                    var addChild = new AddChild(this, editorHTMLElement);
                    this.state.addOverride(addChild);
                }
            },
            setStyle: function (styleProp, newValue) {

                if (this.state.enabled && this._creationCompleteFlag) {
                    var setStyle = new SetStyle(this, styleProp, newValue);
                    this.state.addOverride(setStyle);
                }

                EditorHTMLElement.prototype.setStyle.call(this, styleProp, newValue);
            },/*
            get focusOffset() {
                return EditorHTMLElement.prototype.__lookupGetter__('focusOffset').call(this);
            },
            set focusOffset(value) {

                if (this.state.enabled) {

                    var focusNode = window.getSelection().focusNode;

                    if (focusNode) {

                        if (focusNode.nodeType == Node.TEXT_NODE)
                            focusNode = focusNode.parentNode;
                       
                        var focusInstance = InstanceManager.getInstance(focusNode);

                        var offsetInfo = focusInstance.getStartEndOffset();

                        var setProperty = new SetProperty(focusInstance, "focusOffset", offsetInfo.endOffset);
                        this.state.addOverride(setProperty);
                    }
                    
                    var setProperty = new SetProperty(this, "focusOffset", value);
                    EditorHTMLElement.prototype.__lookupSetter__('focusOffset').call(this, value);
                    this.state.addOverride(setProperty);
                }
                else
                    EditorHTMLElement.prototype.__lookupSetter__('focusOffset').call(this, value);

            },
            get textContent() {

                return EditorHTMLElement.prototype.__lookupGetter__('textContent').call(this);
            },
            set textContent(value) {
                
                if (this.state.enabled) {
                    var setProperty = new SetProperty(this, "textContent", value);
                    EditorHTMLElement.prototype.__lookupSetter__('textContent').call(this, value);
                    this.state.addOverride(setProperty);
                }
                else
                    EditorHTMLElement.prototype.__lookupSetter__('textContent').call(this, value);

            },
            deleteContents: function (startOffset, endOffset) {

                if (this.state.enabled){

                    if (this.htmlElement.nodeType == Node.ELEMENT_NODE) {
                        if (this.htmlElement.contains(window.getSelection().focusNode)) {
                            var setProperty = new SetProperty(this, "focusOffset");
                            this.state.addOverride(setProperty);
                        }
                    }
                    else if (this.htmlElement.nodeType == Node.TEXT_NODE) {//未完成

                        var parentNode = this.htmlElement.parentNode;

                        while (parentNode && parentNode.contains(window.getSelection().focusNode) == false) {
                            parentNode = this.parentNode;
                        }

                        if (parentNode) {
                            var setProperty = new SetProperty(InstanceManager.getInstance(parentNode), "focusOffset");
                            this.state.addOverride(setProperty);
                        }
                    }
                }

                //var setProperty = new SetProperty(this, "innerHTML");
                //var deleteTextContent = EditorHTMLElement.prototype.deleteContents.call(this, startOffset, endOffset);
                // setProperty.value = this.innerHTML;
                //有問題要處理 先mark
                //this.state.addOverride(setProperty);

                var deleteTextContent;
                
                if (this.state.enabled) {//這邊要改 可能有包含子結點要處理

                    //var setProperty = new SetProperty(this, "textContent");
                    //deleteTextContent = EditorHTMLElement.prototype.deleteContents.call(this, startOffset, endOffset);
                    //setProperty.value = this.textContent;
                    //this.state.addOverride(setProperty);


                    
                    //new
                    deleteTextContent = EditorHTMLElement.prototype.deleteContents.call(this, startOffset, endOffset);
                }
                else
                    deleteTextContent = EditorHTMLElement.prototype.deleteContents.call(this, startOffset, endOffset);

                return deleteTextContent;
            },
            removeChild: function (editorHTMLElement) {

                if (this.state.enabled) {
                    var removeChild = new RemoveChild(editorHTMLElement);

                    if (editorHTMLElement.htmlElement.contains && editorHTMLElement.htmlElement.contains(window.getSelection().focusNode)) {
                        var setProperty = new SetProperty(InstanceManager.getInstance(window.getSelection().focusNode.parentNode), "focusOffset");
                        this.state.addOverride(setProperty);
                    }

                    EditorHTMLElement.prototype.removeChild.call(this, editorHTMLElement);

                    this.state.addOverride(removeChild);
                }           
                else
                    EditorHTMLElement.prototype.removeChild.call(this, editorHTMLElement);

            },*/
            startUndoRecord: function () {
                if (this.state.enabled)
                    this.state.startBatchMode();
            },
            endUndoRecord: function () {
                if (this.state.enabled)
                    this.state.endBatchMode();
            }
        }

        UndoRedoEditor.prototype.__proto__ = EditorHTMLElement.prototype;

        return UndoRedoEditor;
    }());

    //HTML tag
    var article = (function () {

        var article = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        article.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);

                this.htmlElement = document.createElement("article");

            },
            get name() {
                return "article";
            }
        }

        article.prototype.__proto__ = UndoRedoEditor.prototype;

        return article;

    }());
    var section = (function () {

        var section = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        section.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("section");
            },
            get name() {
                return "section"
            }
        }

        section.prototype.__proto__ = UndoRedoEditor.prototype;

        return section;

    }());
    var div = (function () {

        var div = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        div.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("div");

            }
        }

        div.prototype.__proto__ = UndoRedoEditor.prototype;

        return div;

    }());
    var p = (function () {

        var p = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        return p;

    }());
    var span = (function () {

        var span = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        span.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("span");

            }
        }

        span.prototype.__proto__ = UndoRedoEditor.prototype;

        return span;
    }());
    var ol = (function () {

        var ol = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        ol.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("ol");
            }
        }

        ol.prototype.__proto__ = UndoRedoEditor.prototype;

        return ol;
    }());
    var li = (function () {

        var li = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        li.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("li");

                this.htmlElement.style.listStyleType = "none";
            }
        }

        li.prototype.__proto__ = UndoRedoEditor.prototype;

        return li;
    }());
    var ul = (function () {

        var ul = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        ul.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("ul");
            }
        }

        ul.prototype.__proto__ = UndoRedoEditor.prototype;

        return ul;
    }());
    var strong = (function () {

        var strong = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        strong.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("strong");
            },
            get name() {
                return "strong";
            },
            get keyinWordAvoid() {
                return true;
            }
        }

        strong.prototype.__proto__ = UndoRedoEditor.prototype;

        return strong;
    }());
    var svg = (function () {

        var svg = function (htmlElement /** HTMLElement **/) {
            EditorHTMLElement.call(this, htmlElement);
        };

        svg.prototype = {
            _createChildren: function () {

                EditorHTMLElement.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("svg");
            },
            get name() {
                return "svg";
            },
            get childrenByPageBreak() {
                return this.children;
            }
        }

        svg.prototype.__proto__ = EditorHTMLElement.prototype;

        return svg;
    }());
    var select = (function () {

        var select = function (htmlElement /** HTMLElement **/) {

            this._labelField = "html";
            this._dataField = "value";
            this.autoResize = true;
            this._dataProvider = [];
            this._dataProviderChangedFlag = false;

            UndoRedoEditor.call(this, htmlElement);
        };

        select.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("select");
            },
            _creationComplete: function () {

                UndoRedoEditor.prototype._creationComplete.call(this);

                var self = this;

                this.htmlElement.addEventListener("change", function (event) {

                    self._changeHandler.call(self, event);

                }, false);

                this.htmlElement.addEventListener("dataProviderChange", function (event) {

                    self._changeHandler.call(self, event);

                }, false);
                //debugger
                for (var i = 0; i < this.htmlElement.options.length; i++) {
                    var option = this.htmlElement.options[i];
                    this._dataProvider.push({
                        value: option.value,
                        text: option.text
                    });
                }
            },
            _changeHandler: function (event) {

                if (this.autoResize) {

                    if (this.htmlElement.parentNode && this.selectedLabel != "") {

                        var cloneSelect = this.htmlElement.cloneNode(false);
                        //cloneSelect.style.display = "none";
                        var option = document.createElement("option");
                        cloneSelect.appendChild(option);
                        cloneSelect.style.width = "";
                        option.textContent = this.selectedLabel;

                        this.htmlElement.parentNode.appendChild(cloneSelect);

                        if (cloneSelect.getBoundingClientRect().width > 0)
                            this.htmlElement.style.width = cloneSelect.getBoundingClientRect().width + "px";

                        this.htmlElement.parentNode.removeChild(cloneSelect);
                    }
                }
            },
            get name() {
                return "select";
            },
            get dataProvider() {
                return this._dataProvider;
            },
            set dataProvider(value) {

                if (value != undefined && value != this._dataProvider) {
                    this._dataProvider = value;
                    this._dataProviderChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            _commitProperties: function () {

                div.prototype._commitProperties.call(this);

                var dispatchDataProviderChangeEventFlag = false;

                if (this._dataProviderChangedFlag) {
                    this._dataProviderChangedFlag = false;

                    for (var i = this.htmlElement.options.length - 1; i >= 0; i--) {
                        this.htmlElement.options.remove(i)
                    }

                    for (var i = 0; i < this._dataProvider.length; i++) {
                        var data = this._dataProvider[i];
                        var option = new Option(data[this._labelField], data[this._dataField], data.selected);

                        this.htmlElement.options.add(option);
                    }

                    dispatchDataProviderChangeEventFlag = true;
                }

                if (this._selectedValueChangedFlag) {
                    this._selectedValueChangedFlag = false;

                    if (this.htmlElement.options.length > 0) {

                        if (this._value != undefined) {

                            for (var i = 0; i < this.htmlElement.options.length; i++) {
                                var option = this.htmlElement.options[i]

                                if (option.value == this._value)
                                    option.selected = true;
                                else
                                    option.selected = false;
                            }
                        }
                    }
                }

                if (dispatchDataProviderChangeEventFlag) {
                    //this.htmlElement.dispatchEvent(new Event("dataProviderChange", {
                    //    bubbles: true
                    //}));

                    this.htmlElement.dispatchEvent(new CustomEvent("dataProviderChange", {
                        bubbles: true
                    }));

                }
            },
            get selectedItem() {

                for (var i = 0; i < this._dataProvider.length; i++) {
                    var data = this._dataProvider[i];

                    if (this.htmlElement.value == data[this._dataField])
                        return data;
                }

                return undefined;
            },
            get selectedValue() {
                return this.htmlElement.value;
            },
            set selectedValue(value) {

                if (this._value != value) {
                    this._value = value;
                    this._selectedValueChangedFlag = true;

                    this._invalidateProperties();
                }
            },
            get selectedLabel() {
                return this.selectedItem[this.labelField];
            },
            get labelField() {
                return this._labelField;
            },
            set labelField(value) {
                this._labelField = value;
            },
            get dataField() {
                return this._dataField;
            },
            set dataField(value) {
                this._dataField = value;
            }
        }

        select.prototype.__proto__ = UndoRedoEditor.prototype;

        return select;
    }());

    var input = (function () {

        var input = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        input.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("input");
            },
            get name() {
                return "input";
            },
            get selectedValue() {
                return this.value;
            },
            set selectedValue(value) {
                this.value = value;
            },
            get value() {
                return this.htmlElement.value;
            },
            set value(value) {
                if (this.type != "file")
                    this.htmlElement.value = value;
                else
                    this.htmlElement.value = "";
            },
            get min() {
                return this.htmlElement.getAttribute("min");
            },
            set min(value) {
                this.htmlElement.setAttribute("min", value);
            },
            get checked() {
                return this.htmlElement.checked;
            },
            set checked(value) {
                this.htmlElement.checked = value;
            },
            get type() {
                return this.htmlElement.type;
            },
            getBase64File: function () {
                var self = this;

                var promise = new Promise(function (resolve, reject) {

                    var reader = new FileReader();
                    reader.readAsDataURL(self.htmlElement.files[0]);
                    reader.onload = function () {
                        resolve(reader.result);
                        console.log(reader.result);
                    };
                    reader.onerror = function (error) {
                        reject(error)
                        console.log('Error: ', error);
                    };
                });

                return promise;
            },
            get disabled() {
                return this.htmlElement.getAttribute("disabled");
            },
            set disabled(value) {
                if (value == "disabled")
                    this.htmlElement.setAttribute("disabled", value);
                else
                    this.htmlElement.removeAttribute("disabled");
            },

        }

        input.prototype.__proto__ = UndoRedoEditor.prototype;

        return input;
    }());

    var textarea = (function () {

        var textarea = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        textarea.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("textarea");
            },
            get name() {
                return "textarea";
            },
            get selectedValue() {
                return this.value;
            },
            set selectedValue(value) {
                this.value = value;
            },
            get value() {
                return this.htmlElement.value;
            },
            set value(value) {
                this.htmlElement.value = value;
            },
        }

        input.prototype.__proto__ = UndoRedoEditor.prototype;

        return input;
    }());
    var a = (function () {

        var a = function (htmlElement /** HTMLElement **/) {

            this._url = "";
            this._urlChangedFlag = false;
            this._fileName;
            this._fileNameChangedFlag = false;
            this._value;

            UndoRedoEditor.call(this, htmlElement);
        };

        a.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("a");
                this.htmlElement.title = this.title;
                this.htmlElement.href = this.url;
                this.htmlElement.target = "_blank";
            },
            get name() {
                return "a";
            },
            get url() {
                return this._url;
            },
            set url(value) {

                if (value != undefined && value != this._url) {
                    this._url = value;
                    this._urlChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get fileName() {
                return this._fileName;
            },
            set fileName(value) {

                if (value != undefined && value != this._fileName) {
                    this._fileName = value;
                    this._fileNameChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get value() {
                return this._value;
            },
            set value(value) {

                if (value != undefined && value != this._value) {
                    this._value = value;
                }
            },
            _commitProperties: function () {
                UndoRedoEditor.prototype._commitProperties.call(this);

                if (this._urlChangedFlag) {
                    this._urlChangedFlag = false;

                    this.htmlElement.href = this.url;
                }

                if (this._fileNameChangedFlag) {
                    this._fileNameChangedFlag = false;

                    this.htmlElement.setAttribute("download", this._fileName);
                    this.htmlElement.textContent = this._fileName;
                }
            }
        }

        a.prototype.__proto__ = UndoRedoEditor.prototype;

        return a;
    }());
    var sup = (function () {

        var sup = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        sup.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("sup");
                this.htmlElement.style.verticalAlign = "baseline";
                this.htmlElement.style.top = "-8px";
                this.htmlElement.style.position = "relative";
            },
            get name() {
                return "sup";
            },
            get keyinWordAvoid() {
                return true;
            }
        }

        sup.prototype.__proto__ = UndoRedoEditor.prototype;

        return sup;
    }());
    var sub = (function () {

        var sub = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        sub.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("sub");
                this.htmlElement.style.verticalAlign = "baseline";
                this.htmlElement.style.top = "8px";
                this.htmlElement.style.position = "relative";
            },
            get name() {
                return "sub";
            },
            get keyinWordAvoid() {
                return true;
            }
        }

        sub.prototype.__proto__ = UndoRedoEditor.prototype;

        return sub;
    }());
    var table = (function () {

        var table = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        table.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("table");
            },
            _updateDisplayList: function () {
                UndoRedoEditor.prototype._updateDisplayList.call(this);
                
                if (this._childrenChangedFlag) {
                    this._childrenChangedFlag = false;

                    for (var i = 0; i < this.children.length; i++) {
                        if(this.children[i].name == "tr")
                            this.children[i].refreshRowId();
                    }

                    // if(this.children.length <= 1)
                    //     this.setStyle("display", "none");
                    // else
                    //     this.htmlElement.style.display = null;
                }
            },   
            get name() {
                return "table";
            },
            set value(val){
                var self = this;
                val.forEach(function (v) { 
                    var newTr = new tr();
                    self.addChild(newTr);
                    newTr.value = v;
                });             
            },
            get value(){
                var v = [];

                this.htmlElement.querySelectorAll("table > tr").forEach(function (tr) { 
                    v.push(InstanceManager.getInstance(tr).value);
                });

                return v;
            }
        }

        table.prototype.__proto__ = UndoRedoEditor.prototype;

        return table;
    }());
    var tr = (function () {

        var tr = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        tr.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("tr");
            },
            get name() {
                return "tr";
            },
            get rowIndex(){
                return this.childIndex;
            },            
            refreshRowId: function(){
                if(!this.children)
                    return;

                var self = this;
                this.htmlElement.querySelectorAll("tr > td[data-key=rowId]").forEach(function (td) {
                    InstanceManager.getInstance(td).textContent = self.rowIndex;
                });             
            },
            set value(val){
                var self = this;
                
                for(var key in val){
                    newTd = new td();
                    self.addChild(newTd);  
                    newTd.htmlElement.setAttribute("data-key", key)
                    
                    newTd.textContent = val[key];
                    if(key == "remove"){
                        var link = new a();
                        link.addChild(self.parseFromString('<i class="fa fa-trash"></i>'))
                        newTd.addChild(link);
                        link.htmlElement.addEventListener("click", function (event) {
                            self.parent.removeChild(self);    
                                                  
                            event.preventDefault();
                        }, false);
                    }
                }
            },
            get value(){
                var v = {};

                this.htmlElement.querySelectorAll("tr > td").forEach(function (td) {
                    var key = td.getAttribute("data-key");
                    if(key)
                        v[key] = InstanceManager.getInstance(td).textContent;
                });

                return v;
            }
        }

        tr.prototype.__proto__ = UndoRedoEditor.prototype;

        return tr;
    }());
    var td = (function () {

        var td = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        td.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("td");
            },
            get name() {
                return "td";
            }
        }

        td.prototype.__proto__ = UndoRedoEditor.prototype;

        return td;
    }());
    var col = (function () {

        var col = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        col.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("col");
            },
            get name() {
                return "col";
            }
        }

        col.prototype.__proto__ = UndoRedoEditor.prototype;

        return col;
    }());
    var text = (function () { //textNode

        var text = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        text.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createTextNode("");
            },
            get name() {
                return "text";
            }
        }

        text.prototype.__proto__ = UndoRedoEditor.prototype;

        return text;
    }());

    //data

    var Data = (function () {

        var Data = function (htmlElement /** HTMLElement **/) {
            EditorHTMLElement.call(this, htmlElement);
        };

        Data.prototype = {
            _createChildren: function () {

                EditorHTMLElement.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("div");
                this.htmlElement.setAttribute("data-class", "Data");
            }
        }

        Data.prototype.__proto__ = EditorHTMLElement.prototype;

        return Data;

    }());

    //base Editor

    var Underline = (function () {

        var Underline = function (htmlElement /** HTMLElement **/) {
            span.call(this, htmlElement);
        };

        Underline.prototype = {
            _createChildren: function () {
                debugger
                span.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "Underline");
                this.htmlElement.style.textDecoration = "underline"
            },
            get name() {
                return "Underline";
            },
            get keyinWordAvoid() {
                return true;
            }
        }

        Underline.prototype.__proto__ = span.prototype;

        return Underline;
    }());

    var colgroup = (function () {

        var colgroup = function (htmlElement /** HTMLElement **/) {
            UndoRedoEditor.call(this, htmlElement);
        };

        colgroup.prototype = {
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this.htmlElement = document.createElement("colgroup");
            },
            get name() {
                return "colgroup";
            }
        }

        colgroup.prototype.__proto__ = UndoRedoEditor.prototype;

        return colgroup;
    }());

    var FileBlock = (function () {
        var FileBlock = function (htmlElement /** HTMLElement **/) {

            this._fileInput;
            this._filesProps = [];

            EditorHTMLElement.call(this, htmlElement);
        };

        FileBlock.prototype = {
            _createChildren: function () {
                EditorHTMLElement.prototype._createChildren.call(this);
            },
            _childrenMapping: function () {
                EditorHTMLElement.prototype._childrenMapping.call(this);                 
            },
            _creationComplete: function () {
                UndoRedoEditor.prototype._creationComplete.call(this);

            },
            _updateDisplayList: function () {

                EditorHTMLElement.prototype._updateDisplayList.call(this);
                var self = this;

                if (this._childrenChangedFlag) {

                    this._childrenChangedFlag = false;

                    if (!this._fileInput) {

                        var fileInputHtmlElement = this.htmlElement.querySelector("input[type=file]")

                        if (fileInputHtmlElement) {
                            this._fileInput = InstanceManager.getInstance(fileInputHtmlElement);

                            if (this._fileInput) {

                                this._fileInput.htmlElement.addEventListener("change", function () {
                                    if(!self._fileInput.htmlElement.getAttribute("multiple"))
                                        self.removeFileAll();
                                        
                                    var files = self._fileInput.htmlElement.files;

                                    if (files && files.length > 0) {
                                        Array.prototype.slice.call(files).forEach(function (f) {
                                            var url = window.URL.createObjectURL(f);

                                            self.createNewFile(url, f.name);
                                        });
                                    }

                                }, false);
                            }
                        }
                    }
                }
            },
            _commitProperties: function () {

                EditorHTMLElement.prototype._commitProperties.call(this);

                // if(this._base64ChangedFlag){
                //     this._base64ChangedFlag = false;

                //     var blob = base64toBlob(this._base64);
                //     self._a.htmlElement.href = window.URL.createObjectURL(blob);   
                // }

                // if(this._urlChangedFlag){
                //     this._urlChangedFlag = false;

                //     this._a.url = this._url;    
                // }

                // if(this._fileNameChangedFlag){
                //     this._fileNameChangedFlag = false;

                //     this._a.fileName = this._fileName;                    
                // }

                
                var changeEditMode = function () {
                    this._fileInput = null;

                    if (this.contains(this._fileInput))
                        this.removeChild(this._fileInput);

                    this.htmlElement.querySelectorAll("i").forEach(function (i) {
                        InstanceManager.getInstance(i).setStyle("display", "inline-block");
                    });      
                }

                if (this._modeChangedFlag) {
                    this._modeChangedFlag = false;


                    switch (this._mode.name) {
                        case "編輯":
                            changeEditMode.apply(this);
                            break;
                        case "追蹤修訂":
                        case "唯讀":
                            this.htmlElement.querySelectorAll("i").forEach(function (i) {
                                InstanceManager.getInstance(i).setStyle("display", "none");
                            });
                            break;
                        default: 
                            if(StateManager.hasOwnBaseOn(this._mode.name, "Base-編輯"))
                                changeEditMode.apply(this);

                        break;                            
                    }
                }
            },      
            dataURItoBase64: function (dataURI) {
                return dataURI.split(',')[1];
            },
            base64toBlob: function (dataURI) {

                var byteString = atob(dataURItoBase64(dataURI));
                var type = dataURI.split(";")[0].split(":")[1];
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);

                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ab], { type: type });
            },
            removeFileAll: function () {

                Array.prototype.slice.call(this._filesProps).forEach(function (itemProp) {
                    window.URL.revokeObjectURL(itemProp.a.url);
                });

                this._filesProps = [];

                var fileBlockList = this.htmlElement.querySelectorAll("[class=file-div]");

                for (var i = 0; i < fileBlockList.length; i++) {
                    InstanceManager.getInstance(fileBlockList[i]).remove();
                }
            },
            removeFile: function (fileProp) {

                window.URL.revokeObjectURL(fileProp.a.url);
                //const dt = new DataTransfer()

                // Array.prototype.slice.call(this._fileInput.htmlElement.files).forEach(function (f) {

                //     if (f !== fileProp.f)
                //         dt.items.add(f)
                // });

                // this._fileInput.htmlElement.files = dt.files;
                fileProp.a.parent.remove();

                this._filesProps = this._filesProps.splice(this._filesProps.indexOf(fileProp), 1);
            },
            createNewFile: function (url, name, id) {

                var self = this;
                var div = self.parseFromString('<div class="file-div"></div>');
                var a;

                if (self.htmlElement.querySelector("a") != null) {
                    var aHtmlElement = self.htmlElement.querySelector("a[data-id-attribute]");
                    a = InstanceManager.getInstance(aHtmlElement).clone();
                    a.setStyle("display", "inline-block");
                    a.htmlElement.removeAttribute("data-id-attribute");

                    var idAttribute = aHtmlElement.getAttribute("data-id-attribute");
                    var idAttributeValue = id ? id : a.htmlElement.getAttribute(idAttribute).replace("${id}", new Date().getTime());

                    a.htmlElement.setAttribute(idAttribute, idAttributeValue);
                    a.url = url;
                    a.textContent = name;
                }
                else
                    a = self.parseFromString('<a href="' + url + '" target="_blank">' + name + '</a>');

                if(self._fileInput){
                    self._fileInput.getBase64File().done(function (dataURI) {
                        a.value = self.dataURItoBase64(dataURI);
                    });
                }

                a.fileName = name;

                var i = self.parseFromString('<i class="fa fa-trash"></i>');

                div.addChild(a);
                div.addChild(i);
                self.addChildAt(div, self.children.length - 1);

                var fileProp = {
                    a: a,
                    i: i
                }

                i.htmlElement.addEventListener("click", function () {
                    self.removeFile(fileProp);
                }, false);

                self._filesProps.push(fileProp);

                return fileProp;
            },
        };

        FileBlock.prototype.__proto__ = EditorHTMLElement.prototype;

        return FileBlock;
    }());

    var InputSelectBlock = (function () {

        var InputSelectBlock = function (htmlElement /** HTMLElement **/) {

            this._labelField = "html";
            this._dataField = "value";

            this._dataProvider = [];
            this._dataProviderChangedFlag = false;

            this._value;

            this._selectedValueChangedFlag = false;

            this._inputSelect;

            EditorHTMLElement.call(this, htmlElement);
        };

        InputSelectBlock.prototype = {
            _createChildren: function () {
                EditorHTMLElement.prototype._createChildren.call(this);
            },
            _childrenMapping: function () {
                EditorHTMLElement.prototype._childrenMapping.call(this);

                if (this.htmlElement.getAttribute("data-label-field"))
                    this._labelField = this.htmlElement.getAttribute("data-label-field");

                if (this.htmlElement.getAttribute("data-data-field"))
                    this._dataField = this.htmlElement.getAttribute("data-data-field");

                this._value = this.textContent;
            },
            _setSelected: function () {

                if (this.inputSelect) {

                    if (this._value != undefined)
                        this.inputSelect.selectedValue = this._value;

                }
            },
            _updateDisplayList: function () {

                EditorHTMLElement.prototype._updateDisplayList.call(this);

                if (this._childrenChangedFlag) {

                    this._childrenChangedFlag = false;
                    //debugger
                    if (this.htmlElement.querySelector("[data-class=InputSelect]"))
                        this._inputSelect = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=InputSelect]"));
                    else if (this.htmlElement.querySelector("select"))
                        this._inputSelect = InstanceManager.getInstance(this.htmlElement.querySelector("select"));
                    else if (this.htmlElement.querySelector("input"))
                        this._inputSelect = InstanceManager.getInstance(this.htmlElement.querySelector("input"));
                    else if (this.htmlElement.querySelector("[data-class=SpanSelect]"))
                        this._inputSelect = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=SpanSelect]"));
                    else if (this.htmlElement.querySelector("textarea"))
                        this._inputSelect = InstanceManager.getInstance(this.htmlElement.querySelector("textarea"));

                    if (this._inputSelect) {

                        this._inputSelect.labelField = this._labelField;
                        this._inputSelect.dataField = this._dataField;

                        this._setSelected();
                    }

                }

                if (this._dataProviderChangedFlag) {
                    this._dataProviderChangedFlag = false;
                    //debugger
                    if (this._inputSelect) {
                        this._inputSelect.dataProvider = this._dataProvider;
                        this._inputSelect.validateProperties();
                        this._setSelected();
                    }
                }


            },
            _commitProperties: function () {

                EditorHTMLElement.prototype._commitProperties.call(this);

                if (this._selectedValueChangedFlag) {
                    this._selectedValueChangedFlag = false;

                    this._setSelected();
                }

                var changeEditMode = function () {
                    this._value = this.textContent;

                    for (var i = this.htmlElement.childNodes.length - 1; i >= 0; i--) {
                        this.htmlElement.removeChild(this.htmlElement.childNodes[i]);
                    }        
                }

                if (this._modeChangedFlag) {
                    this._modeChangedFlag = false;

                    switch (this._mode.name) {
                        case "編輯":
                            changeEditMode.apply(this);
                            break;
                        case "追蹤修訂":
                        case "唯讀":
                            debugger
                            if (this.children.length > 0) {

                                this.textContent = this._value = this.selectedValue;

                                this.validateProperties();
                            }

                            break;
                        default: 

                            if(StateManager.hasOwnBaseOn(this._mode.name, "Base-編輯"))
                                changeEditMode.apply(this);

                            break;
                    }
                }
            },
            get selectedItem() {
                return this._inputSelect ? this._inputSelect.selectedItem : undefined;
            },
            get selectedValue() {
                return this._inputSelect ? this._inputSelect.selectedValue : undefined;
            },
            set selectedValue(value) {

                //if (this._value != value) {
                this._value = value;
                this._selectedValueChangedFlag = true;

                this._invalidateProperties();
                // }
            },
            get inputSelect() {
                return this._inputSelect;
            },
            get dataProvider() {
                return this._dataProvider;
            },
            set dataProvider(value) {

                if (value != undefined && value != this._dataProvider) {
                    this._dataProvider = value;
                    this._dataProviderChangedFlag = true;
                    this._invalidateDisplayList();
                }
            }
        }

        InputSelectBlock.prototype.__proto__ = EditorHTMLElement.prototype;

        return InputSelectBlock;
    }());

    var InputSelect = (function () {

        var InputSelect = function (htmlElement /** HTMLElement **/) {
            this._labelField = "html";
            this._labelFieldChangedFlag = false;
            this._dataField = "value";
            this._dataFieldChangedFlag = false;
            this._dataProvider = [];
            this._dataProviderChangedFlag = false;
            this._input;
            this._value;
            //this._dropdownDiv;
            this._dropDown;
            this.autoResize = true;

            div.call(this, htmlElement);
        };

        InputSelect.prototype = {
            _createChildren: function () {

                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "InputSelect");

            },
            _childrenMapping: function () {
                div.prototype._childrenMapping.call(this);
                //debugger
                this.htmlElement.style.position = "relative";
                this.htmlElement.style.display = "inline-block";
                this.htmlElement.style.borderRadius = "2px";
                this.htmlElement.style.border = "solid #a79d9d 1px";
                this.htmlElement.style.top = "4px";

                this._input = InstanceManager.getInstance(this.htmlElement.querySelector("input"), input);
                this._input.htmlElement.style.fontFamily = this.htmlElement.style.fontFamily;
                this._input.htmlElement.style.fontSize = this.htmlElement.style.fontSize;
                //this._input.htmlElement.style.cursor = "pointer";
                this._input.htmlElement.style.height = "100%";
                this._input.htmlElement.style.width = (parseInt(this.htmlElement.style.width, 10) - 20) + "px";
                this._input.htmlElement.style.position = "absolute";
                this._input.htmlElement.style.top = "0px";
                this._input.htmlElement.style.left = "0px";
                this._input.htmlElement.style.padding = "1px";
                this._input.htmlElement.style.border = "none";

                this._dropDown = InstanceManager.getInstance(this.htmlElement.querySelector("select"), select);
                this._dropDown.autoResize = false;
                this._dropDown.htmlElement.style.fontFamily = this.htmlElement.style.fontFamily;
                this._dropDown.htmlElement.style.fontSize = this.htmlElement.style.fontSize;
                this._dropDown.htmlElement.style.cursor = "pointer";
                this._dropDown.htmlElement.style.height = "100%";
                this._dropDown.htmlElement.style.width = "100%"
                this._dropDown.htmlElement.style.position = "absolute";
                this._dropDown.htmlElement.style.top = "0px";
                this._dropDown.htmlElement.style.left = "0px";
                this._dropDown.htmlElement.style.border = "none";
                this._dropDown.htmlElement.style.margin = 0;

                var self = this;

                this._dropDown.htmlElement.addEventListener("change", function (event) {

                    if (this.nextElementSibling && this.value) {
                        this.nextElementSibling.value = self._value = this.value;
                    }

                }, false);

                this._dropDown.htmlElement.addEventListener("dataProviderChange", function (event) {

                    if (this.nextElementSibling && this.value) {
                        this.nextElementSibling.value = self._value = this.value;
                    }

                }, false);

            },
            _updateDisplayList: function () {

                div.prototype._updateDisplayList.call(this);
            },
            _commitProperties: function () {

                div.prototype._commitProperties.call(this);

                if (this._dataProviderChangedFlag) {
                    this._dataProviderChangedFlag = false;

                    this._dropDown.dataProvider = this._dataProvider;
                    //  this._dropDown.validateProperties();
                }

                if (this._labelFieldChangedFlag) {
                    this._labelFieldChangedFlag = false;

                    this._dropDown._labelField = this._labelField;
                    // this._dropDown.validateProperties();
                }

                if (this._dataFieldChangedFlag) {
                    this._dataFieldChangedFlag = false;

                    this._dropDown._dataField = this._dataField;
                    //this._dropDown.validateProperties();
                }

                if (this._selectedValueChangedFlag) {
                    this._selectedValueChangedFlag = false;

                    this._dropDown.selectedValue = this._value;
                    this._input.htmlElement.value = this._value;
                    //this._dropDown.validateProperties();
                }

                this._dropDown.validateProperties();
            },
            get name() {
                return "InputSelect";
            },
            get dataProvider() {
                return this._dataProvider;
            },
            set dataProvider(value) {

                if (value != undefined && value != this._dataProvider) {
                    this._dataProvider = value;
                    this._dataProviderChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get labelField() {
                return this._labelField;
            },
            set labelField(value) {

                if (value != undefined && value != this._labelField) {
                    this._labelField = value;
                    this._labelFieldChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get dataField() {
                return this._dataField;
            },
            set dataField(value) {

                if (value != undefined && value != this._dataField) {
                    this._dataField = value;
                    this._dataFieldChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get selectedValue() {
                return this._input.htmlElement.value;
            },
            set selectedValue(value) {

                if (this._value != value) {
                    this._value = value;
                    this._selectedValueChangedFlag = true;

                    this._invalidateProperties();
                }
            }
        }

        InputSelect.prototype.__proto__ = div.prototype;

        return InputSelect;
    }());

    var TextBlock = (function () {

        var TextBlock = function (htmlElement /** HTMLElement **/) {

            this.isPagingFlag = false;
            this.maxLength = undefined;
            //this.rects = {};
            this.autoList = "None";//Numbered Bullet, None, Free 未完成
            this.childNodesModifiedFlag = false;

            UndoRedoEditor.call(this, htmlElement);
        };

        TextBlock.prototype = {
            _createElement: function () {
                this.htmlElement = document.createElement("span");
            },
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);

                this._createElement();
                this.htmlElement.setAttribute("data-class", "TextBlock");


                //data-class="TextBlock"

                //this.htmlElement.setAttribute("draggable", "false");

                //this.htmlElement.contentEditable = true;
                //this.htmlElement.textContent = String.fromCharCode(8203);
                //this.htmlElement.textContent = String.fromCharCode(8203);
            },
            _childrenMapping: function () {
                UndoRedoEditor.prototype._childrenMapping.call(this);

                if (this.htmlElement.textContent.length == 0)
                    this.htmlElement.textContent = String.fromCharCode(8203);

                var autoList = this.htmlElement.getAttribute("data-auto-list");
                if (autoList)
                    this.autoList = autoList;

                //this.htmlElement.addEventListener("dragstart", function (event) {
                //    event.preventDefault();
                //});
            },
            _creationComplete: function () {

                UndoRedoEditor.prototype._creationComplete.call(this);

                var self = this;

                var onDOMSubtreeModified = function (event) {
                    self.childNodesModifiedFlag = true;

                    if (self.maxLength != undefined) {

                        if (self.textContent.length > self.maxLength) {

                            self.htmlElement.dispatchEvent(new CustomEvent("editOverMaxLength", {
                                bubbles: true,
                                detail: {
                                    editor: self
                                },
                            }));
                        }
                    }

                    self.htmlElement.dispatchEvent(new CustomEvent("edit", {
                        bubbles: true,
                        detail: {
                            editor: self
                        },
                    }));
                };

                this.htmlElement.style.wordBreak = "break-word";
                this.htmlElement.addEventListener("DOMSubtreeModified", onDOMSubtreeModified, false);

                if (this.isAddEmptyChar && this.textContent.length == 0) {
                    this.textContent = String.fromCharCode(8203);
                    this.validateProperties();
                }
            },
            _commitProperties: function () {


                if (this.childNodesModifiedFlag) {

                    this.childNodesModifiedFlag = false;

                    if (this.isEmpty() && this.children.length == 0) {

                        var stateEnabled = this.state.enabled;

                        if (stateEnabled)
                            this.state.enabled = false;

                        this.textContent = String.fromCharCode(8203);

                        this.state.enabled = stateEnabled;
                    }

                }

                UndoRedoEditor.prototype._commitProperties.call(this);
            },
            get name() {
                return "TextBlock";
            },
            get isAddEmptyChar() {
                return true;
            },
            set textContent(value) {
                UndoRedoEditor.prototype.__lookupSetter__('textContent').call(this, value);
            },
            get textContent() {
                return UndoRedoEditor.prototype.__lookupGetter__('textContent').call(this);
            },
            //需實做
            validateRects: function () {
                var clientRects = this.htmlElement.getClientRects();
                //this.rects = {};
                debugger
                //for (var i = 0; i < clientRects.length; i++) {

                //    var r = clientRects[i];

                //    if (this.rects[r.bottom] != undefined) {
                //        this.rects[r.bottom]
                //    }                            
                //}
            },
            //需實做
            getPagingStartIndex: function () {

                /*
                var el = document.elementFromPoint(x, y);
                var nodes = el.childNodes;
                for (var i = 0, n; n = nodes[i++];) {
                    if (n.nodeType === 3) {
                        var r = document.createRange();
                        r.selectNode(n);
                        var rects = r.getClientRects();
                        for (var j = 0, rect; rect = rects[j++];) {
                            if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
                                return n;
                            }
                        }
                    }
                }*/

                return el;
            },
            _binarySearch: function (node, nodeRange, low, heigh, targetBottom) {
                var mid = Math.ceil((low + heigh) / 2);

                nodeRange.setStart(node, mid);
                nodeRange.setEnd(node, mid + 1);

                var bottom = nodeRange.getBoundingClientRect().bottom;

                console.log("_binarySearch")

                if (bottom == targetBottom) {

                    var index = mid;
                    var flag = false;

                    index--;

                    nodeRange.setStart(node, index);
                    nodeRange.setEnd(node, index + 1);

                    while (nodeRange.getBoundingClientRect().bottom == targetBottom) {

                        nodeRange.setStart(node, index);
                        nodeRange.setEnd(node, index + 1);


                        flag = true;

                        index--;

                        if (index == -1)
                            break;
                    }

                    if (flag)
                        mid = index + 1;

                    return mid;
                }
                else if (bottom < targetBottom)
                    return this._binarySearch(node, nodeRange, mid, heigh, targetBottom);
                else if (bottom > targetBottom)
                    return this._binarySearch(node, nodeRange, 0, mid, targetBottom);
                else
                    return -1;
            },
            //文字切頁
            getPagingEditorHTMLElement: function (offset) {
                debugger
                var start = new Date().getTime();

                var pagingEditorHTMLElement = UndoRedoEditor.prototype.getPagingEditorHTMLElement.call(this);

                var startIndex;

                if (this.htmlElement.getBoundingClientRect().bottom > offset) {

                    var self = this;
                    var text = "";
                    var treeWalker = document.createTreeWalker(
                        this.htmlElement,
                        NodeFilter.SHOW_TEXT,
                        function (node) {
                            if (self.htmlElement == node.parentNode)
                                return NodeFilter.FILTER_ACCEPT;
                            else
                                return NodeFilter.FILTER_REJECT;
                        },
                        false);

                    var node = null;
                    var cursor = 0;

                    while (node = treeWalker.nextNode()) {

                        var nodeRange = document.createRange();
                        nodeRange.selectNodeContents(node);
                        //nodeRange.selectNode(node);
                        debugger
                        var clientRects = nodeRange.getClientRects();

                        for (var i = 0; i < clientRects.length; i++) {
                            console.log("clientRects")
                            var rect = clientRects[i];

                            if (rect.bottom > offset) {

                                var endOffset = nodeRange.endOffset;

                                var targetOffset = this._binarySearch(node, nodeRange, 0, endOffset - 1, rect.bottom);

                                if (targetOffset != -1) {
                                    startIndex = cursor + targetOffset;

                                    nodeRange.detach();

                                    if (node.parentNode.parentNode) {
                                        var parentInstance = InstanceManager.getInstance(node.parentNode.parentNode);
                                        if (parentInstance.name == "ParagraphTextBlock" || parentInstance.name == "ListItem")
                                            parentInstance.setStyle("textAlignLast", "justify");
                                    }

                                    break;
                                }

                                //for (var j = 0; j < endOffset; j++) {
                                //    nodeRange.setStart(node, j);
                                //    nodeRange.setEnd(node, j + 1);
                                //    console.log("nodeRange");

                                //    if (nodeRange.getBoundingClientRect().bottom == rect.bottom) {
                                //        debugger
                                //        startIndex = cursor + j;

                                //        nodeRange.detach();

                                //        if (node.parentNode.parentNode) {
                                //            var parentInstance = InstanceManager.getInstance(node.parentNode.parentNode);
                                //            if (parentInstance.name == "ParagraphTextBlock" || parentInstance.name == "ListItem")
                                //                parentInstance.setStyle("textAlignLast", "justify");
                                //        }

                                //        break;
                                //    }
                                //}

                                break;
                            }
                        }

                        if (startIndex != undefined)
                            break;

                        cursor += node.textContent.length;
                    }
                }


                if (startIndex != undefined) {
                    pagingEditorHTMLElement.textContent = this.deleteContents(startIndex, this.textContent.length);

                    if (!this.isEmpty())
                        pagingEditorHTMLElement.isPagingFlag = true;

                    pagingEditorHTMLElement.validateProperties()
                }
                else {
                    //pagingEditorHTMLElement.isPagingFlag = true;
                    pagingEditorHTMLElement.textContent = String.fromCharCode(8203);
                    pagingEditorHTMLElement.validateProperties()
                }

                //pagingEditorHTMLElement.removeChildAll();

                //for (var i = pagingEditorHTMLElement.children.length - 1; i >= 0; i--) {
                //    pagingEditorHTMLElement.removeChild(pagingEditorHTMLElement.children[i]);
                //}

                //for (var i = 0; i < this.children.length; i++) {
                //    pagingEditorHTMLElement.addChild(PageBreakManager.break(this.children[0], offset));
                //}

                //for (var i = 0; i < this.children.length; i++) {
                //    pagingEditorHTMLElement.addChild(PageBreakManager.break(this.childNodes[0], offset));
                //}

                var end = new Date().getTime();
                console.debug((end - start) / 1000 + "sec");

                return pagingEditorHTMLElement;
            },
            deleteContents: function (startOffset, endOffset) {
                var deleteTextContent = UndoRedoEditor.prototype.deleteContents.call(this, startOffset, endOffset);

                if (this.isAddEmptyChar && this.textContent.length == 0) {
                    this.textContent = String.fromCharCode(8203);
                    this.validateProperties();
                }

                return deleteTextContent;
            }
        }

        TextBlock.prototype.__proto__ = UndoRedoEditor.prototype;

        return TextBlock;
    }());

    var SpanSelect = (function () {

        var SpanSelect = function (htmlElement /** HTMLElement **/) {
            this._labelField = "html";
            this._dataField = "value";

            this._dataProvider = [];
            this._dataProviderChangedFlag = false;
            this._dropDown;
            this._displayText;

            this._value;
            this._selectedValueChangedFlag = false;

            span.call(this, htmlElement);
        };

        SpanSelect.prototype = {
            get name() {
                return "SpanSelect";
            },
            _createChildren: function () {
                debugger
                span.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "SpanSelect");

                var displayHtmlElement = document.createElement("span");
                displayHtmlElement.className = "spanSelect_display";

                this._displayText = InstanceManager.getInstance(displayHtmlElement);

                var dropDownHtmlElement = document.createElement("span");
                dropDownHtmlElement.className = "spanSelect_dropDown";
                dropDownHtmlElement.style.display = "none";
                dropDownHtmlElement.style.position = "absolute";
                dropDownHtmlElement.style.zIndex = 1;

                this._dropDown = InstanceManager.getInstance(dropDownHtmlElement);

                this.AddChild(this._displayText);
                this.AddChild(this._dropDown);
            },
            _childrenMapping: function () {

                span.prototype._childrenMapping.call(this);

                this._displayText = InstanceManager.getInstance(this.htmlElement.querySelector(".spanSelect_display"));
                this._dropDown = InstanceManager.getInstance(this.htmlElement.querySelector(".spanSelect_dropDown"));

                //var dropDownHtmlElement = document.createElement("div");
                //dropDownHtmlElement.style.display = "none";

                //this._dropDown = InstanceManager.getInstance(dropDownHtmlElement);

            },
            _creationComplete: function () {

                span.prototype._creationComplete.call(this);

                var self = this;

                this.htmlElement.addEventListener("click", function (event) {

                    self._displayDropDown.call(self);

                }, false);

                this._dropDown.htmlElement.addEventListener("blur", function (event) {
                    debugger
                    if (event.relatedTarget == self._displayText.htmlElement)
                        return false;
                    else if (event.relatedTarget && self._dropDown.htmlElement.contains(event.relatedTarget))
                        return false;
                    else if (self._dropDown.htmlElement.contains(document.activeElement))//ie
                        return false;

                    self._displayDropDown.call(self, false);

                }, false);




                //this.htmlElement.addEventListener("dataProviderChange", function (event) {

                //    self._changeHandler.call(self, event);

                //}, false);
            },
            _displayDropDown: function (display) {

                if (display == undefined)
                    display = this._dropDown.getStyle("display") == "none"

                if (display) {
                    this._dropDown.setStyle("display", "block");

                    var centerX = this.htmlElement.offsetLeft + (this.htmlElement.offsetWidth / 2);
                    var left = centerX - (this._dropDown.htmlElement.offsetWidth / 2);

                    if (left < 0)
                        left = 0;

                    this._dropDown.setStyle("left", left)

                    this._dropDown.htmlElement.focus();
                }
                else
                    this._dropDown.setStyle("display", "none");
            },
            _commitProperties: function () {
                //debugger
                span.prototype._commitProperties.call(this);

                var self = this;

                if (this._dataProviderChangedFlag) {
                    this._dataProviderChangedFlag = false;

                    this._dropDown.removeChildAll();

                    var selectedValue;

                    for (var i = 0; i < this._dataProvider.length; i++) {
                        var data = this._dataProvider[i];
                        var optionHtmlElement = document.createElement("span");
                        optionHtmlElement.className = "spanSelect_dropDownItem"
                        optionHtmlElement.style.display = "block";
                        optionHtmlElement.tabIndex = -1;
                        optionHtmlElement.textContent = data[this._labelField];
                        optionHtmlElement.setAttribute("data-value", data[this._dataField]);
                        //optionHtmlElement.setAttribute("data-selected", data.selected);
                        if (data.selected)
                            selectedValue = data[this._dataField];

                        optionHtmlElement.addEventListener("click", function (event) {

                            //for (var i = 0; i < self._dropDown.children.length; i++) {

                            //    var option = self._dropDown.getChildAt(i);
                            //    option.htmlElement.setAttribute("data-selected", false);
                            //}

                            //this.setAttribute("data-selected", true);
                            self.selectedValue = this.getAttribute("data-value");

                        }, false);
                        //border - top: dashed;
                        //border - width: 1;


                        //var option = new Option(data[this._labelField], data[this._dataField], data.selected);
                        var option = InstanceManager.getInstance(optionHtmlElement);
                        this._dropDown.addChild(option);
                    }

                    this._selectedValueChangedFlag = true;

                    if (selectedValue == undefined) {
                        //debugger
                        if (this._dataProvider.length > 0)
                            selectedValue = this._dataProvider[0][this._dataField]
                    }


                    this._value = selectedValue;
                    //this._dropDown.validateProperties();
                    //this._dropDown.validateNow();

                }

                if (this._selectedValueChangedFlag) {
                    this._selectedValueChangedFlag = false;
                    if (this.selectedItem) {
                        this._displayText.textContent = this.selectedItem[this._labelField];
                        // this._dropDown.htmlElement.left = this._displayText.htmlElement.getBoundingClientRect().
                    }

                }

                //if (dispatchDataProviderChangeEventFlag) {
                //    this.htmlElement.dispatchEvent(new CustomEvent("dataProviderChange", {
                //        bubbles: true
                //    }));

                //}
            },
            get dataProvider() {
                return this._dataProvider;
            },
            set dataProvider(value) {
                //debugger
                if (value != undefined && value != this._dataProvider) {
                    this._dataProvider = value;
                    this._dataProviderChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get selectedItem() {

                for (var i = 0; i < this._dataProvider.length; i++) {
                    var data = this._dataProvider[i];

                    if (this._value == data[this._dataField])
                        return data;
                }

                return undefined;
            },
            get selectedValue() {

                return this._value;
            },
            set selectedValue(value) {

                var isExist = false;

                for (var i = 0; i < this._dataProvider.length; i++) {
                    var data = this._dataProvider[i];

                    if (value == data[this._dataField]) {
                        isExist = true;
                        break;
                    }
                }

                if (isExist && this._value != value) {
                    this._value = value;
                    this._selectedValueChangedFlag = true;

                    this._invalidateProperties();
                }
            },
            get selectedLabel() {
                return this.selectedItem[this.labelField];
            },
            get labelField() {
                return this._labelField;
            },
            set labelField(value) {
                this._labelField = value;
            },
            get dataField() {
                return this._dataField;
            },
            set dataField(value) {
                this._dataField = value;
            }
        }

        SpanSelect.prototype.__proto__ = span.prototype;

        return SpanSelect;
    }());

    var PagingSpan = (function () {

        var PagingSpan = function (htmlElement /** HTMLElement **/) {
            span.call(this, htmlElement);

            this._textBlock;
        };

        PagingSpan.prototype = {
            _childrenMapping: function () {

                span.prototype._childrenMapping.call(this);

                this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);

            },
            get childrenByPageBreak() {
                return [this._textBlock];
            }
        }

        PagingSpan.prototype.__proto__ = span.prototype;

        return PagingSpan;
    }());

    var PagingDiv = (function () {

        var PagingDiv = function (htmlElement /** HTMLElement **/) {
            this._textBlock;

            div.call(this, htmlElement);
        };

        PagingDiv.prototype = {
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);

            },
            get childrenByPageBreak() {
                return [this._textBlock];
            }
        }

        PagingDiv.prototype.__proto__ = div.prototype;

        return PagingDiv;
    }());

    var ContextMenu = (function () {

        var ContextMenu = function (htmlElement /** HTMLElement **/) {
            this._dataProvider = [];
            this._dataProviderChangedFlag = false;
            this._labelField = "html";
            this._callbackField = "callback";
            //this._dataField = "value";

            ul.call(this, htmlElement);
        };

        ContextMenu.prototype = {
            _createChildren: function () {
                ul.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ContextMenu");
                this.htmlElement.style.position = "absolute";
                this.htmlElement.style.boxShadow = "rgba(0, 0, 0, 1) 2px 2px 10px";
                this.htmlElement.style.backgroundColor = "white";
                this.htmlElement.style.minHeight = "100px";
                this.htmlElement.style.minWidth = "150px";
                this.htmlElement.style.fontFamily = "新細明體";
                this.htmlElement.style.fontSize = "12pt";
            },
            get dataProvider() {
                return this._dataProvider;
            },
            set dataProvider(value) {

                if (value != undefined && value != this._dataProvider) {
                    this._dataProvider = value;
                    this._dataProviderChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            _commitProperties: function () {

                ul.prototype._commitProperties.call(this);

                if (this._dataProviderChangedFlag) {
                    this._dataProviderChangedFlag = false;

                    this.removeChildAll();

                    for (var i = 0; i < this._dataProvider.length; i++) {
                        var data = this._dataProvider[i];
                        var liInstance = InstanceManager.getInstance(undefined, li);
                        liInstance.textContent = data[this._labelField];
                        liInstance.htmlElement.addEventListener("click", data[this._callbackField]);
                        this.addChild(liInstance)
                    }
                }
            }
        }

        ContextMenu.prototype.__proto__ = ul.prototype;

        return ContextMenu;
    }());

    //Editor

    var ResizeTableRowDraggerDiv = (function () {

        var ResizeTableRowDraggerDiv = function (htmlElement /** HTMLElement **/) {

            this._resizeChangedFlag = false;
            this._borderDragger;
            this._borderGuide;

            div.call(this, htmlElement);
        };

        ResizeTableRowDraggerDiv.prototype = {
            _createChildren: function () {
                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTableRowDraggerDiv");
                this.htmlElement.contentEditable = false;
                //this.htmlElement.style.position = "relative";

                this._borderDragger = InstanceManager.getInstance(undefined, ResizeTableRowBorderDragger);
                this._borderGuide = InstanceManager.getInstance(undefined, ResizeTableRowBorderGuide);

                this.addChild(this._borderDragger);
                this.addChild(this._borderGuide);
                //    <div><div class="kix-table-row-border-dragger" style="left: 0px; top: 313px;"></div><div class="kix-table-row-border-guide" style="top: 85px; left: 0px;"></div></div>


            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                this._borderDragger = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ResizeTableRowBorderDragger]"), ResizeTableRowBorderDragger);
                this._borderGuide = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ResizeTableRowBorderGuide]"), ResizeTableRowBorderGuide);


            },
            get borderDragger() {
                return this._borderDragger;
            },
            get borderGuide() {
                return this._borderGuide;
            },
            resize: function () {
                this._resizeChangedFlag = true;
                this._invalidateDisplayList();
            },
            _updateDisplayList: function () {
                div.prototype._updateDisplayList.call(this);

                if (this._resizeChangedFlag) {
                    this._resizeChangedFlag = false;

                    //this._borderDragger.htmlElement.style.width = this._borderGuide.htmlElement.style.width = this.parent.htmlElement.getBoundingClientRect().width + "px";

                    this._borderDragger.htmlElement.style.width = this._borderGuide.htmlElement.style.width = this.parent.resizeTable.htmlElement.getBoundingClientRect().width + "px";
                }
            },
        }

        ResizeTableRowDraggerDiv.prototype.__proto__ = div.prototype;

        return ResizeTableRowDraggerDiv;
    }());

    var ResizeTableRowBorderDragger = (function () {

        var ResizeTableRowBorderDragger = function (htmlElement /** HTMLElement **/) {

            div.call(this, htmlElement);
        };

        ResizeTableRowBorderDragger.prototype = {
            _createChildren: function () {
                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTableRowBorderDragger");
                this.htmlElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
                this.htmlElement.style.cursor = "row-resize";
                this.htmlElement.style.height = "7px";
                this.htmlElement.style.position = "absolute";
                this.htmlElement.style.width = "100%";
                this.htmlElement.style.zIndex = "13";
                this.htmlElement.contentEditable = false;


                //    <div><div class="kix-table-row-border-dragger" style="left: 0px; top: 313px;"></div><div class="kix-table-row-border-guide" style="top: 85px; left: 0px;"></div></div>


            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                //  this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);

            },
            get name() {
                return "ResizeTableRowBorderDragger";
            }
        }

        ResizeTableRowBorderDragger.prototype.__proto__ = div.prototype;

        return ResizeTableRowBorderDragger;
    }());

    var ResizeTableRowBorderGuide = (function () {

        var ResizeTableRowBorderGuide = function (htmlElement /** HTMLElement **/) {

            div.call(this, htmlElement);
        };

        ResizeTableRowBorderGuide.prototype = {
            _createChildren: function () {
                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTableRowBorderGuide");
                this.htmlElement.style.background = "#68e none repeat scroll 0 0";
                this.htmlElement.style.height = "1px";
                this.htmlElement.style.position = "absolute";
                this.htmlElement.style.width = "100%";
                this.htmlElement.style.display = "none";
                this.htmlElement.contentEditable = false;
                //    <div><div class="kix-table-row-border-dragger" style="left: 0px; top: 313px;"></div><div class="kix-table-row-border-guide" style="top: 85px; left: 0px;"></div></div>


            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                //  this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);

            }
        }

        ResizeTableRowBorderGuide.prototype.__proto__ = div.prototype;

        return ResizeTableRowBorderGuide;
    }());

    var ResizeTableColumnDraggerDiv = (function () {

        var ResizeTableColumnDraggerDiv = function (htmlElement /** HTMLElement **/) {

            this._resizeChangedFlag = false;
            this._borderDragger;
            this._borderGuide;

            div.call(this, htmlElement);
        };

        ResizeTableColumnDraggerDiv.prototype = {
            _createChildren: function () {
                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTableColumnDraggerDiv");
                this.htmlElement.contentEditable = false;
                //this.htmlElement.style.position = "relative";

                this._borderDragger = InstanceManager.getInstance(undefined, ResizeTableColumnBorderDragger);
                this._borderGuide = InstanceManager.getInstance(undefined, ResizeTableColumnBorderGuide);

                this.addChild(this.borderDragger);
                this.addChild(this._borderGuide);
                //    <div><div class="kix-table-row-border-dragger" style="left: 0px; top: 313px;"></div><div class="kix-table-row-border-guide" style="top: 85px; left: 0px;"></div></div>


            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                this._borderDragger = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ResizeTableColumnBorderDragger]"), ResizeTableColumnBorderDragger);
                this._borderGuide = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ResizeTableColumnBorderGuide]"), ResizeTableColumnBorderGuide);
            },
            get borderDragger() {
                return this._borderDragger;
            },
            get borderGuide() {
                return this._borderGuide;
            },
            resize: function () {
                this._resizeChangedFlag = true;
                this._invalidateDisplayList();
            },
            _updateDisplayList: function () {
                div.prototype._updateDisplayList.call(this);

                if (this._resizeChangedFlag) {
                    this._resizeChangedFlag = false;

                    this.borderDragger.htmlElement.style.height = this._borderGuide.htmlElement.style.height = this.parent.htmlElement.getBoundingClientRect().height + "px";

                    this.borderDragger.htmlElement.style.top = this._borderGuide.htmlElement.style.top = this.parent.htmlElement.offsetTop + "px";

                }


            },
        }

        ResizeTableColumnDraggerDiv.prototype.__proto__ = div.prototype;

        return ResizeTableColumnDraggerDiv;
    }());

    var ResizeTableColumnBorderDragger = (function () {

        var ResizeTableColumnBorderDragger = function (htmlElement /** HTMLElement **/) {

            div.call(this, htmlElement);
        };

        ResizeTableColumnBorderDragger.prototype = {
            _createChildren: function () {
                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTableColumnBorderDragger");
                this.htmlElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
                this.htmlElement.style.cursor = "col-resize";
                this.htmlElement.style.height = "100%";
                this.htmlElement.style.position = "absolute";
                this.htmlElement.style.width = "7px";
                this.htmlElement.style.zIndex = "13";
                this.htmlElement.contentEditable = false;

                //    <div><div class="kix-table-row-border-dragger" style="left: 0px; top: 313px;"></div><div class="kix-table-row-border-guide" style="top: 85px; left: 0px;"></div></div>


            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                //  this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);

            },
            get name() {
                return "ResizeTableColumnBorderDragger";
            }
        }

        ResizeTableColumnBorderDragger.prototype.__proto__ = div.prototype;

        return ResizeTableColumnBorderDragger;
    }());

    var ResizeTableColumnBorderGuide = (function () {

        var ResizeTableColumnBorderGuide = function (htmlElement /** HTMLElement **/) {

            div.call(this, htmlElement);
        };

        ResizeTableColumnBorderGuide.prototype = {
            _createChildren: function () {
                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTableColumnBorderGuide");
                this.htmlElement.style.background = "#68e none repeat scroll 0 0";
                this.htmlElement.style.height = "100%";
                this.htmlElement.style.position = "absolute";
                this.htmlElement.style.width = "1px";
                this.htmlElement.style.display = "none";
                this.htmlElement.contentEditable = false;
                //    <div><div class="kix-table-row-border-dragger" style="left: 0px; top: 313px;"></div><div class="kix-table-row-border-guide" style="top: 85px; left: 0px;"></div></div>


            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                //  this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);

            }
        }

        ResizeTableColumnBorderGuide.prototype.__proto__ = div.prototype;

        return ResizeTableColumnBorderGuide;
    }());

    var ResizeTableBlock = (function () {
        var ResizeTableBlock = function (htmlElement /** HTMLElement **/) {

            this._resizeTable;
            this._draggerRow;
            this._draggerColumn;
            this._resizeChangedFlag = false;
            this._draggingFlag = false;
            this._currentDragger;

            self = this;

            span.call(this, htmlElement);
        },
            self;

        ResizeTableBlock.prototype = {
            _createChildren: function () {
                span.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTableBlock");

                this._resizeTable = InstanceManager.getInstance(undefined, ResizeTable);
                this.addChild(this._resizeTable);

                this._draggerRow = InstanceManager.getInstance(undefined, ResizeTableRowDraggerDiv);
                this.addChild(this._draggerRow);

                this._draggerColumn = InstanceManager.getInstance(undefined, ResizeTableColumnDraggerDiv);
                this.addChild(this._draggerColumn);
                //    <div><div class="kix-table-row-border-dragger" style="left: 0px; top: 313px;"></div><div class="kix-table-row-border-guide" style="top: 85px; left: 0px;"></div></div>


            },
            _childrenMapping: function () {
                span.prototype._childrenMapping.call(this);

                this._resizeTable = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ResizeTable]"), ResizeTable);
                this._draggerRow = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ResizeTableRowDraggerDiv]"), ResizeTableRowDraggerDiv);
                this._draggerColumn = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ResizeTableColumnDraggerDiv]"), ResizeTableColumnDraggerDiv);
            },
            _commitProperties: function () {
                span.prototype._commitProperties.call(this);
            },
            _updateDisplayList: function () {
                span.prototype._updateDisplayList.call(this);

                if (this._resizeChangedFlag) {
                    this._resizeChangedFlag = false;

                    //var boundingClientRect = this._resizeTable.htmlElement.getBoundingClientRect();

                    //this._draggerRow.htmlElement.style.width = boundingClientRect.width + "px";
                    this._draggerRow.resize();

                    //this._draggerColumn.htmlElement.style.height = boundingClientRect.height + "px";
                    //this._draggerColumn.htmlElement.style.top = boundingClientRect.offsetTop + "px";
                    this._draggerColumn.resize();

                    var resizeTrList = this._resizeTable.htmlElement.querySelectorAll("[data-class=ResizeTr]");

                    for (var i = 0; i < resizeTrList.length; i++) {

                        var resizeTrHtmlElement = resizeTrList[i];

                        this._trBindEvent(resizeTrHtmlElement);
                    }

                    var resizeTdList = this._resizeTable.htmlElement.querySelectorAll("[data-class=ResizeTd]");

                    for (var i = 0; i < resizeTdList.length; i++) {

                        var resizeTdHtmlElement = resizeTdList[i];

                        this._tdBindEvent(resizeTdHtmlElement);
                    }

                    this._draggerRow.borderDragger.htmlElement.removeEventListener("mousedown", this._onDragStart);
                    this._draggerRow.borderDragger.htmlElement.addEventListener("mousedown", this._onDragStart);
                    this._draggerColumn.borderDragger.htmlElement.removeEventListener("mousedown", this._onDragStart);
                    this._draggerColumn.borderDragger.htmlElement.addEventListener("mousedown", this._onDragStart);

                }
            },
            _trBindEvent: function (resizeTrHtmlElement) {
                resizeTrHtmlElement.removeEventListener("mousemove", this._onMouseMove);
                resizeTrHtmlElement.addEventListener("mousemove", this._onMouseMove);
            },
            _tdBindEvent: function (resizeTdHtmlElement) {
                resizeTdHtmlElement.removeEventListener("mousemove", this._onMouseMove);
                resizeTdHtmlElement.addEventListener("mousemove", this._onMouseMove);
                resizeTdHtmlElement.removeEventListener("mousedown", this._onMouseDown);
                resizeTdHtmlElement.addEventListener("mousedown", this._onMouseDown);
            },
            _onDragStart: function (event) {

                if ((event.which && event.which != 1) || (event.button && event.button != 1))
                    return; //only allow mouse left key

                var instance = InstanceManager.getInstance(this);
                instance.parent.borderGuide.htmlElement.style.display = "block";

                self._currentDragger = instance;
                self._draggingFlag = true;

                document.addEventListener("mousemove", self._onDrag);
                document.addEventListener("mouseup", self._onDragStop);

            },
            _onDrag: function (event) {

                if (self._draggingFlag) {

                    var boundingClientRect = self._currentDragger.htmlElement.offsetParent.getBoundingClientRect();

                    if (self._currentDragger.name == "ResizeTableColumnBorderDragger") {

                        self._currentDragger.parent.borderGuide.htmlElement.style.left = (event.clientX - boundingClientRect.left) + "px";
                        self._currentDragger.parent.borderDragger.htmlElement.style.left = (event.clientX - boundingClientRect.left) + "px";
                    }
                    else {
                        // debugger
                        //self._currentDragger.parent.borderGuide.htmlElement.style.top = event.clientY - 11 + "px";
                        //self._currentDragger.parent.borderDragger.htmlElement.style.top = event.clientY - 11 + "px";

                        self._currentDragger.parent.borderGuide.htmlElement.style.top = (event.clientY - boundingClientRect.top) + "px";
                        self._currentDragger.parent.borderDragger.htmlElement.style.top = (event.clientY - boundingClientRect.top) + "px";
                    }


                    //document.style.cursor = "row-resize";

                    console.log(event.target)
                    event.preventDefault();
                }

            },
            _onDragStop: function (event) {

                if (self._draggingFlag) {
                    self._draggingFlag = false;

                    self._currentDragger.parent.borderGuide.htmlElement.style.display = "none";

                    var target;
                    debugger
                    var boundingClientRect;

                    if (self._currentDragger.name == "ResizeTableColumnBorderDragger") {
                        target = self._draggerColumn.borderDragger.target;

                        if (target) {
                            boundingClientRect = target.htmlElement.getBoundingClientRect();
                            var x = boundingClientRect.left

                            var tdIndex = target.childNodeIndex;

                            if (event.clientX > x) {
                                var width = event.clientX - x;

                                for (var i = 0; i < self._resizeTable.trCount; i++) {
                                    self._resizeTable.getTrAt(i).getChildAt(tdIndex).setStyle("width", width + "px")
                                }
                                //target.setStyle("width", width + "px")
                            }

                            self._draggerRow.resize();
                            self._draggerColumn.resize();
                        }


                    }
                    else {//tr
                        var target = self._draggerRow.borderDragger.target;

                        if (target) {
                            boundingClientRect = target.htmlElement.getBoundingClientRect();
                            var y = boundingClientRect.top;

                            if (event.clientY > y) {
                                var height = event.clientY - y;
                                target.setStyle("height", height + "px")
                            }

                            self._draggerRow.resize();
                            self._draggerColumn.resize();
                        }


                    }


                    document.removeEventListener("mousemove", self._onDrag);
                    document.removeEventListener("mouseup", self._onDragStop);
                }

                //self.htmlElement.addEventListener("mousemove", self._onDrag, false);
            },
            //_onDrag: function (event) {

            //    //setTop = setTop - 3;

            //   // self._draggerRow.rowBorderDragger.htmlElement.style.top = setTop - 3 + "px";
            //    self._draggerRow.rowBorderGuide.htmlElement.style.top = event.screenY + "px";


            //},
            _onMouseMove: function (event) {

                if (self._draggingFlag) {
                    self.draggingHtmlElement = this;
                    return;
                }

                var boundingClientRect = this.getBoundingClientRect();
                var instance = InstanceManager.getInstance(this);
                var setTop,
                    setLeft,
                    targetInstance;

                if (instance.name == "ResizeTd") {

                    if (event.clientX < boundingClientRect.left + (boundingClientRect.width / 2)) {
                        setLeft = this.offsetParent.offsetLeft + this.offsetLeft;
                        targetInstance = instance.parent.getChildAt(instance.childNodeIndex - 1);
                    }

                    else {
                        setLeft = this.offsetParent.offsetLeft + this.offsetLeft + boundingClientRect.width;
                        targetInstance = instance;
                    }

                    self._draggerColumn.borderDragger.htmlElement.style.left = setLeft - 3 + "px";
                    self._draggerColumn.borderDragger.target = targetInstance;
                    self._draggerColumn.borderGuide.htmlElement.style.left = setLeft + "px";
                }
                else {

                    if (event.clientY < boundingClientRect.top + (boundingClientRect.height / 2)) {
                        setTop = this.offsetParent.offsetTop + this.offsetTop;
                        targetInstance = instance.parent.getChildAt(instance.childNodeIndex - 1);
                    }
                    else {
                        setTop = this.offsetParent.offsetTop + this.offsetTop + boundingClientRect.height;
                        targetInstance = instance;

                    }

                    self._draggerRow.borderDragger.htmlElement.style.top = setTop - 3 + "px";
                    self._draggerRow.borderDragger.target = targetInstance;
                    self._draggerRow.borderGuide.htmlElement.style.top = setTop + "px";
                }

                //未完成
                /* 


                var selection = window.getSelection();

                if (selection.rangeCount > 0) {

                    var range = selection.getRangeAt(0);
                    var commonAncestorContainerInstance = InstanceManager.getInstance(range.commonAncestorContainer);
                    console.log(range)
                    if (commonAncestorContainerInstance.name == "ResizeTr") {
                        console.log(range)

                        var startContainer = range.startContainer;
                        var endContainer = range.endContainer;

                        if (startContainer.nodeType == Node.TEXT_NODE)
                            startContainer = range.startContainer.parentNode;

                        if (endContainer.nodeType == Node.TEXT_NODE)
                            endContainer = range.endContainer.parentNode;

                       // InstanceManager.getInstance(startContainer.parentNode).setStyle("backgroundColor", "red")
                      //  InstanceManager.getInstance(endContainer.parentNode).setStyle("backgroundColor", "red")

                        selection.removeAllRanges();

                        var nodeRange = document.createRange();
                      //  nodeRange.selectNode(startContainer.parentNode);
                        nodeRange.selectNode(commonAncestorContainerInstance.htmlElement);
                        //nodeRange.selectNode(endContainer);
                        //console.log(endContainer)
                       

                        //nodeRange.setStart(startContainer, 0);
                        //nodeRange.setEnd(endContainer, 1);

                        selection.addRange(nodeRange);
                        window.getSelection().selectAllChildren(commonAncestorContainerInstance.htmlElement);

                        //newFocusOffset = editorHTMLElement.textContent.length;
                        //this.focusOffset = newFocusOffset;

                        //for (var i = this.htmlElement.childNodes.length - 1; i >= 0; i--) {
                        //    if (this.htmlElement.childNodes[i].nodeType == Node.TEXT_NODE)
                        //        this.htmlElement.removeChild(this.htmlElement.childNodes[i]);
                        //}

                        //this.htmlElement.appendChild(editorHTMLElement.htmlElement);
                        //nodeRange.setStart(editorHTMLElement.htmlElement, 0);
                        //nodeRange.setEnd(editorHTMLElement.htmlElement, 0);
                        //newEditorHTMLElement = editorHTMLElement;
                        //newEditorHTMLElement.parent = this;
                    }
                    else if(commonAncestorContainerInstance.name == "ResizeTable"){
                        selection.removeAllRanges();

                        var startContainer = range.startContainer;
                        var endContainer = range.endContainer;

                        if (startContainer.nodeType == Node.TEXT_NODE)
                            startContainer = range.startContainer.parentNode;

                        if (endContainer.nodeType == Node.TEXT_NODE)
                            endContainer = range.endContainer.parentNode;

                        var nodeRange = document.createRange();
                        nodeRange.selectNode(startContainer.parentNode);
                        //nodeRange.selectNode(commonAncestorContainerInstance.htmlElement);
                        //console.log(commonAncestorContainerInstance.htmlElement)
                        selection.addRange(nodeRange);
                    }

                }
                */

            },
            _onMouseDown: function (event) {

                var instance = InstanceManager.getInstance(this);

                if ((event.which && event.which != 3) || (event.button && event.button != 2))
                    return; //only allow mouse right key

                function insetRow(insertIndex) {
                    debugger

                    var tr = instance.parent;
                    var tdChildIndex = instance.childNodeIndex;

                    var newTr = InstanceManager.getInstance(undefined, ResizeTr);
                    self._trBindEvent(newTr.htmlElement);

                    for (var i = 0; i < tr.children.length; i++) {

                        var newTd = InstanceManager.getInstance(undefined, ResizeTd);
                        self._tdBindEvent(newTd.htmlElement);
                        newTr.addChild(newTd);
                    }

                    self._resizeTable.addChildAt(newTr, insertIndex);

                    newTr.getChildAt(tdChildIndex).textBlock.focusOffset = 0;
                }

                function insetCol(insertIndex) {
                    var tr = instance.parent;
                    debugger
                    for (var i = 0; i < self._resizeTable.trCount; i++) {

                        var targetTr = self._resizeTable.getTrAt(i);
                        var newTd = InstanceManager.getInstance(undefined, ResizeTd);
                        self._tdBindEvent(newTd.htmlElement);
                        targetTr.addChildAt(newTd, insertIndex);
                    }

                    tr.getChildAt(insertIndex).textBlock.focusOffset = 0;
                }

                var dataProvider = [{
                    html: "向上插入一列",
                    callback: function (event) {
                        var tr = instance.parent;
                        var insertIndex = tr.childNodeIndex;
                        insetRow(insertIndex);
                    }
                }, {
                    html: "向下插入一列",
                    callback: function (event) {
                        var tr = instance.parent;
                        var insertIndex = tr.childNodeIndex + 1;
                        insetRow(insertIndex);
                    }
                }, {
                    html: "向左插入一攔",
                    callback: function (event) {
                        var insertIndex = instance.childNodeIndex;
                        insetCol(insertIndex);
                    }
                }, {
                    html: "向右插入一攔",
                    callback: function (event) {
                        var insertIndex = instance.childNodeIndex + 1;
                        insetCol(insertIndex);
                    }
                }]

                var selection = window.getSelection();

                if (selection.rangeCount > 0) {

                    var range = selection.getRangeAt(0);
                    var commonAncestorContainerInstance = InstanceManager.getInstance(range.commonAncestorContainer);

                    //未完成
                    /*
                    if (commonAncestorContainerInstance.name == "ResizeTr") {

                        dataProvider.push({

                            html: "合併儲存格",
                            callback: function (event) {

                            }
                        })

                        //var startContainer = range.startContainer;
                        //var endContainer = range.endContainer;

                        //if (startContainer.nodeType == Node.TEXT_NODE)
                        //    startContainer = range.startContainer.parentNode;

                        //if (endContainer.nodeType == Node.TEXT_NODE)
                        //    endContainer = range.endContainer.parentNode;

                        //InstanceManager.getInstance(startContainer.parentNode).setStyle("backgroundColor", "red")
                        //InstanceManager.getInstance(endContainer.parentNode).setStyle("backgroundColor", "red")
                    }
                    */
                }

                ContextMenuManager.dataProvider = dataProvider;
            },
            get resizeTable() {
                return this._resizeTable;
            },
            resize: function () {
                this._resizeChangedFlag = true;
                this._invalidateDisplayList();
            }
        }

        ResizeTableBlock.prototype.__proto__ = span.prototype;

        return ResizeTableBlock;
    }());

    var ResizeTable = (function () {

        var ResizeTable = function (htmlElement /** HTMLElement **/) {

            this._tr = [];

            table.call(this, htmlElement);
        };

        ResizeTable.prototype = {
            _createChildren: function () {

                table.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTable");
                this.htmlElement.style.border = "1px solid black";
                //this.htmlElement.style.width = "100%";
                this.htmlElement.style.borderCollapse = "collapse";
            },
            _childrenMapping: function () {
                table.prototype._childrenMapping.call(this);
            },
            _commitProperties: function () {

                table.prototype._commitProperties.call(this);
            },
            _updateDisplayList: function () {

                table.prototype._updateDisplayList.call(this);

                if (this._childrenChangedFlag) {
                    this._childrenChangedFlag = false;

                    var trHtmlElementList = this.htmlElement.querySelectorAll("[data-class=ResizeTr]");

                    this._tr = [];

                    for (var i = 0; i < trHtmlElementList.length; i++) {
                        this._tr.push(InstanceManager.getInstance(trHtmlElementList[i], ResizeTr));
                    }

                    this.parent.resize();
                }
            },
            get trCount() {
                return this._tr.length
            },
            getTrAt: function (index) {
                if (index >= 0 && index < this.trCount)
                    return this._tr[index];

                return null;
            },
            get name() {

                return "ResizeTable";
            },
            get childrenByPageBreak() {
                return this.children;
            },
        }

        ResizeTable.prototype.__proto__ = table.prototype;

        return ResizeTable;
    }());

    var ResizeTr = (function () {

        var ResizeTr = function (htmlElement /** HTMLElement **/) {
            tr.call(this, htmlElement);
        };

        ResizeTr.prototype = {
            _createChildren: function () {

                tr.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTr");


                //this.htmlElement.style.border = "1px solid black";

                //this.htmlElement.contentEditable = true;
                //this.htmlElement.textContent = String.fromCharCode(8203);
            },
            _commitProperties: function () {

                tr.prototype._commitProperties.call(this);
            },
            _updateDisplayList: function () {

                tr.prototype._updateDisplayList.call(this);

                if (this._childrenChangedFlag) {

                    this._childrenChangedFlag = false;

                    var resizeTdList = this.htmlElement.querySelectorAll("[data-class=ResizeTd]");
                    var tdWidth = this.htmlElement.getBoundingClientRect().width / resizeTdList.length;

                    for (var i = 0; i < resizeTdList.length; i++) {
                        if (!resizeTdList[i].style.width)
                            resizeTdList[i].style.width = tdWidth + "px";
                    }

                }


            },
            get name() {
                return "ResizeTr";
            }

        }

        ResizeTr.prototype.__proto__ = tr.prototype;

        return ResizeTr;
    }());

    var ResizeTd = (function () {

        var ResizeTd = function (htmlElement /** HTMLElement **/) {

            this._textBlock;

            td.call(this, htmlElement);

            this._contextMenuOwner = true;
        };

        ResizeTd.prototype = {
            _createChildren: function () {

                td.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ResizeTd");
                this.htmlElement.style.border = "1px solid black";
                this.htmlElement.style.wordBreak = "break-word";
                this.htmlElement.style.verticalAlign = "text-top";
                this.htmlElement.style.width = "100px";

                this._textBlock = InstanceManager.getInstance(undefined, TextBlock);

                this.addChild(this._textBlock);
                //this.htmlElement.contentEditable = true;
                //this.htmlElement.textContent = String.fromCharCode(8203);
            },
            _childrenMapping: function () {

                td.prototype._childrenMapping.call(this);

                this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);
            },
            _commitProperties: function () {

                td.prototype._commitProperties.call(this);

            },
            get textBlock() {
                return this._textBlock;
            },
            get name() {
                return "ResizeTd";
            }

        }

        ResizeTd.prototype.__proto__ = td.prototype;

        return ResizeTd;
    }());

    var OrderedList = (function () {

        var OrderedList = function (htmlElement /** HTMLElement **/) {
            this._numberedFormat = [{
                style: "#、",
                format: "ToNumericChineseCharFormat1ForDocument"
            }, {
                style: "(#)",
                format: "ToNumericChineseCharFormat1ForDocument"
            }, {
                style: "#、",
                format: "ToNumeric2BitCharFormat"
            }, {
                style: "(#)",
                format: "ToNumeric2BitCharFormat"
            }, {
                style: "#、",
                format: "ToNumericHeavenlyFormat"
            }, {
                style: "(#)",
                format: "ToNumericHeavenlyFormat"
            }, {
                style: "#、",
                format: "ToNumericEarthlyFormat"
            }, {
                style: "(#)",
                format: "ToNumericEarthlyFormat"
            }];
            this._numberedFormatChangedFlag = false;
            this._levelChangedFlag = false;
            this._level = 1;
            this._reloadSerialNumberFlag = false;
            this._serialNumberStartIndex = 1;
            this._isNumberedFormatEnd = false;
            this._deleteEnabled = true;

            ol.call(this, htmlElement);
        };

        OrderedList.prototype = {
            get name() {
                return "OrderedList";
            },
            get isNumberedFormatEnd() {
                return this.level == this._numberedFormat.length;
            },
            get deleteEnabled() {
                return this._deleteEnabled;
            },
            _createChildren: function () {

                ol.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "OrderedList");
                this.htmlElement.style.margin = "0px";
                this.htmlElement.style.padding = "0px";
                //this.htmlElement.contentEditable = false;

                this.addChild(InstanceManager.getInstance(undefined, ListItem));

                this._levelChangedFlag = true;
            },
            _childrenMapping: function () {

                if (this.htmlElement.getAttribute("data-delete-enabled"))
                    this._deleteEnabled = this.htmlElement.getAttribute("data-delete-enabled") == "true";

                if (this.children.length == 0) {

                    var numberedFormatBase64 = this.htmlElement.getAttribute("data-numberedFormat");

                    if (numberedFormatBase64) {
                        var numberedFormat = JSON.parse(decodeURIComponent(window.atob(numberedFormatBase64)));

                        this.numberedFormat = numberedFormat;
                        this._levelChangedFlag = true
                        this.validateProperties();
                    }

                    ol.prototype._childrenMapping.call(this);
                }
            },
            get numberedFormat() {
                return this._numberedFormat;
            },
            set numberedFormat(value) {

                if (value != undefined && value != this.__numberedFormat) {
                    this._numberedFormatChangedFlag = true;
                    this._numberedFormat = value;

                    this._invalidateDisplayList();
                }
            },
            _commitProperties: function () {

                ol.prototype._commitProperties.call(this);
            },
            _updateDisplayList: function () {

                ol.prototype._updateDisplayList.call(this);

                if (this._childrenChangedFlag) {
                    var prevOrderedList;
                    var prevIsOrderedList = false;
                    var removeItems = [];

                    for (var i = 0; i < this.children.length; i++) {

                        var childItem = this.getChildAt(i); //OrderedList or  ListItem

                        if (childItem.name == "OrderedList") {

                            if (this.children.length == 1) {
                                prevIsOrderedList = true;
                                prevOrderedList = this;
                            }

                            if (prevIsOrderedList && StateManager.currentState.name != "分頁") {

                                var children = childItem.children.slice(0);

                                for (var j = 0; j < children.length; j++) {

                                    var mergeItem = children[j];//OrderedList addChild OrderedList
                                    mergeItem.parent.removeChild(mergeItem);
                                    prevOrderedList.addChild(mergeItem);
                                }

                                removeItems.push(childItem);
                                //childItem.parent.removeChild(childItem);
                            }
                            else
                                prevOrderedList = childItem;

                            prevIsOrderedList = true;
                        }
                        else
                            prevIsOrderedList = false;
                    }

                    for (var i = 0; i < removeItems.length; i++) {
                        var removeItem = removeItems[i];
                        removeItem.parent.removeChild(removeItem);
                    }

                    if (prevOrderedList)
                        prevOrderedList.validateNow();

                    this._reloadSerialNumberFlag = true;
                }

                if (this._numberedFormatChangedFlag) {

                    this._numberedFormatChangedFlag = false;
                    this.htmlElement.setAttribute("data-numberedFormat", window.btoa(encodeURIComponent(JSON.stringify(this._numberedFormat))));
                }

                if (this._reloadSerialNumberFlag) {
                    this._reloadSerialNumberFlag = false;

                    var breakParent = PageBreakManager.getPagingParent(this);

                    if (breakParent)
                        this._serialNumberStartIndex = breakParent.children.length + 1

                    var serialNumberIndex = this._serialNumberStartIndex;

                    for (var i = 0; i < this.children.length; i++) {
                        var childItem = this.getChildAt(i);

                        if (childItem.name == "ListItem") {
                            var listItem = childItem;

                            if (!childItem.isJumpSN()) {
                                //var serialNumberIndex = index + 1;

                                if (this.level > 0) {
                                    var formatIndex = (this.level - 1) % this._numberedFormat.length;
                                    var formatConfig = this._numberedFormat[formatIndex];
                                    var numFormat = NumericFormatTranslation.NumberChangeFormat(serialNumberIndex);
                                    var SN = formatConfig.style.replace("#", numFormat[formatConfig.format]())

                                    listItem.SN = SN;

                                    serialNumberIndex++;
                                }
                            }
                            else if (listItem.serialNumberEnabled)
                                listItem.SN = "";

                        }
                    }
                }

                this._level = this.level;

                if (this._level > 1)
                    this.htmlElement.style.marginLeft = "16pt";
                else if (this.parent && this.parent.autoList != "Free")
                    this.htmlElement.style.marginLeft = "0pt";
            },
            reloadSerialNumber: function () {
                this._reloadSerialNumberFlag = true;
                this._invalidateDisplayList();
            },
            get level() {

                if (this._levelChangedFlag) {

                    this._levelChangedFlag = false;

                    var level = 0;
                    var current = this;

                    while (current.parent && current.name == this.name) {
                        level++;
                        current = current.parent;
                    }

                    this._level = level;
                }

                return this._level;
            },
            isEmpty: function () {

                return this.childNodes.length == 0;
            }
        }

        OrderedList.prototype.__proto__ = span.prototype;

        return OrderedList;
    }());

    var ListItem = (function () {

        var ListItem = function (htmlElement, numberedFormat /** HTMLElement **/) {

            this._numberedFormat = numberedFormat;
            this._serialNumber;
            this._textBlock;
            this._SN;
            this._SNChangedFlag = false;
            this._serialNumberEnabled = true;
            this._serialNumberEnabledChangedFlag = false;

            li.call(this, htmlElement);
        };

        ListItem.prototype = {
            get name() {
                return "ListItem";
            },
            _createChildren: function () {

                li.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ListItem");
                this.htmlElement.style.listStyleType = "none";

                //this.htmlElement.contentEditable = false;
                //this.htmlElement.setAttribute("unselectable", "on");

                this._serialNumber = InstanceManager.getInstance(undefined, ListItemSerialNumber);
                this.addChild(this._serialNumber);

                this._textBlock = InstanceManager.getInstance(undefined, ListItemTextBlock);
                this.addChild(this._textBlock);
            },
            _childrenMapping: function () {

                if (this.htmlElement.querySelector("[data-class=ListItemSerialNumber]"))
                    this._serialNumber = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ListItemSerialNumber]"), ListItemSerialNumber);

                if (this.htmlElement.querySelector("[data-class=ListItemTextBlock]"))
                    this._textBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ListItemTextBlock]"), ListItemTextBlock);

                if (this.htmlElement.getAttribute("data-serial-number-enabled") != undefined)
                    this._serialNumberEnabled = this.htmlElement.getAttribute("data-serial-number-enabled") == "true";

                if (this.children.length == 0) {

                    if (this._serialNumber)
                        this.addChild(this._serialNumber);

                    if (this._textBlock)
                        this.addChild(this._textBlock);
                }


            },
            _creationComplete: function () {
                li.prototype._creationComplete.call(this);

                //this.htmlElement.style.display = "initial";

                //this.htmlElement.addEventListener("selectstart", function (event) {
                //    debugger
                //    //event.preventDefault();
                //});
                //this.htmlElement.addEventListener("mousedown", function (event) {
                //    event.preventDefault();
                //});
            },
            get SN() {
                return this._SN;
            },
            set SN(value) {

                if (this.isJumpSN())
                    this._serialNumber.htmlElement.style.marginLeft = "0pt";
                else
                    this._serialNumber.htmlElement.style.marginLeft = this._serialNumber.marginLeft;

                if (value != undefined && value != this._SN) {
                    this._SNChangedFlag = true;
                    this._SN = value;

                    this._invalidateProperties();

                    this.validateProperties();
                }
            },
            isJumpSN: function () {//是否跳號
                return (this.textBlock && this.textBlock.isPagingFlag) || !this.serialNumberEnabled;
                //return this.textBlock && this.textBlock.isPagingFlag
            },
            _commitProperties: function () {

                li.prototype._commitProperties.call(this);

                if (this._SNChangedFlag && this._serialNumber) {
                    this._SNChangedFlag = false;

                    this._serialNumber.textContent = this._SN
                    this._serialNumber.validateProperties();
                }

                if (this._serialNumberEnabledChangedFlag) {
                    this._serialNumberEnabledChangedFlag = false;

                    this.parent.reloadSerialNumber();

                    if (this.serialNumberEnabled) {
                        this._serialNumber.htmlElement.style.display = "inline-block";
                        this.htmlElement.removeAttribute("data-serial-number-enabled");

                        //this._serialNumber.setStyle("display", "inline-block");
                        //this.setStyle("data-serial-number-enabled", true);    
                    }
                    else {
                        this._serialNumber.htmlElement.style.display = "none";
                        this.htmlElement.setAttribute("data-serial-number-enabled", "false");

                        //this._serialNumber.setStyle("display", "none");
                        //this.setStyle("data-serial-number-enabled", false);    

                    }
                }
            },
            get textBlock() {
                return this._textBlock;
            },
            get childrenByPageBreak() {
                return [this._serialNumber, this._textBlock];
            },
            get otherChildren() {
                return this._children.filter(function (item) {
                    return [this._serialNumber, this._textBlock].indexOf(item) >= 0;
                });
            },
            get serialNumberEnabled() {
                return this._serialNumberEnabled;
            },
            set serialNumberEnabled(value) {

                if (value != undefined && value != this._serialNumberEnabled) {
                    this._serialNumberEnabledChangedFlag = true;
                    this._serialNumberEnabled = value;

                    if (this.state.enabled) {

                        var override = new SetProperty(this, "serialNumberEnabled", this._serialNumberEnabled);
                        override._oldValue = !this._serialNumberEnabled
                        this.state.addOverride(override);
                    }

                    this._invalidateProperties();

                    //this.validateProperties();
                }
            }
        }

        ListItem.prototype.__proto__ = li.prototype;

        return ListItem;
    }());

    var ListItemSerialNumber = (function () {

        var ListItemSerialNumber = function (htmlElement /** HTMLElement **/) {
            EditorHTMLElement.call(this, htmlElement);

            this.marginLeft = "-32.5pt";
        };

        ListItemSerialNumber.prototype = {
            _createChildren: function () {

                EditorHTMLElement.prototype._createChildren.call(this);

                this.htmlElement = document.createElement("span");
                this.htmlElement.setAttribute("data-class", "ListItemSerialNumber");

                this.htmlElement.contentEditable = false;
                this.htmlElement.style.marginLeft = this.marginLeft;
                this.htmlElement.style.display = "inline-block";
                //this.htmlElement.style.fontFamily = "標楷體";
                this.htmlElement.style.float = "left";
            },
            //getPagingEditorHTMLElement: function () {

            //    var pagingEditorHTMLElement = EditorHTMLElement.prototype.getPagingEditorHTMLElement.call(this);
            //    pagingEditorHTMLElement.htmlElement.style.marginLeft = "0pt";

            //    return pagingEditorHTMLElement;
            //},
        }

        ListItemSerialNumber.prototype.__proto__ = EditorHTMLElement.prototype;

        return ListItemSerialNumber;
    }());
    var ListItemTextBlock = (function () {

        var ListItemTextBlock = function (htmlElement /** HTMLElement **/) {

            TextBlock.call(this, htmlElement);
        };

        ListItemTextBlock.prototype = {
            get name() {
                return "ListItemTextBlock";
            },
            _createChildren: function () {

                TextBlock.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "ListItemTextBlock");

            },
            _creationComplete: function () {
                TextBlock.prototype._creationComplete.call(this);

                //this.htmlElement.style.display = "inherit";
            },

        }

        ListItemTextBlock.prototype.__proto__ = TextBlock.prototype;

        return ListItemTextBlock;
    }());

    var Paragraph = (function () {

        var Paragraph = function (htmlElement /** HTMLElement **/) {
            //this._rootDiv;

            //this._paragraphName;
            //this._paragraphSuffix;

            section.call(this, htmlElement);
        };

        Paragraph.prototype = {
            _createChildren: function () {

                section.prototype._createChildren.call(this);

                //<div data-class="ParagraphDiv" contenteditable="false">

                this.htmlElement.setAttribute("data-class", "Paragraph");

                var paragraphDiv = InstanceManager.getInstance(undefined, ParagraphDiv);
                this.addChild(paragraphDiv);

                //this._paragraphName = InstanceManager.getInstance(undefined, ParagraphName);
                //this.addChild(this._paragraphName);

                //this._paragraphSuffix = InstanceManager.getInstance(undefined, ParagraphSuffix);
                //this.addChild(this._paragraphSuffix);
            },
            get name() {
                return "Paragraph";
            },

        }

        Paragraph.prototype.__proto__ = section.prototype;

        return Paragraph;
    }());

    var ParagraphName = (function () {

        var ParagraphName = function (htmlElement /** HTMLElement **/) {
            span.call(this, htmlElement);
        };

        ParagraphName.prototype = {
            _createChildren: function () {

                span.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ParagraphName");

                //<span data-twedr="段名" style="display:inline-block; font-size: 16pt;line-height: 20pt; vertical-align: top; margin-top: 3pt;" contenteditable="false">擬辦</span>
            },
            getPagingEditorHTMLElement: function () {

                var pagingEditorHTMLElement = section.prototype.getPagingEditorHTMLElement.call(this);
                //pagingEditorHTMLElement.textContent = "";
                pagingEditorHTMLElement.htmlElement.style.visibility = "hidden";
                pagingEditorHTMLElement.htmlElement.style.width = this.htmlElement.getBoundingClientRect().width + "px";

                return pagingEditorHTMLElement;
            },
        }

        ParagraphName.prototype.__proto__ = span.prototype;

        return ParagraphName;
    }());

    var ParagraphSuffix = (function () {

        var ParagraphSuffix = function (htmlElement /** HTMLElement **/) {
            span.call(this, htmlElement);
        };

        ParagraphSuffix.prototype = {
            _createChildren: function () {

                span.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ParagraphSuffix");
                this.htmlElement.textContent = "：";

                // <span style="display:inline-block; font-size: 16pt; line-height: 20pt; vertical-align: top; margin-top: 3pt;" contenteditable="false">：</span>
            },
            getPagingEditorHTMLElement: function () {

                var pagingEditorHTMLElement = section.prototype.getPagingEditorHTMLElement.call(this);
                //pagingEditorHTMLElement.textContent = "";
                pagingEditorHTMLElement.htmlElement.style.visibility = "hidden";
                pagingEditorHTMLElement.htmlElement.style.width = this.htmlElement.getBoundingClientRect().width + "px";

                return pagingEditorHTMLElement;
            },
        }

        ParagraphSuffix.prototype.__proto__ = span.prototype;

        return ParagraphSuffix;
    }());

    var ParagraphTextBlock = (function () {

        var ParagraphTextBlock = function (htmlElement /** HTMLElement **/) {

            this._textNodeBlock;

            TextBlock.call(this, htmlElement);
        };

        ParagraphTextBlock.prototype = {
            _createElement: function () {
                this.htmlElement = document.createElement("div");
            },
            get name() {
                return "ParagraphTextBlock";
            },
            get isAddEmptyChar() {
                return false;
            },
            get textNodeBlock() {
                return this._textNodeBlock;
            },
            _createChildren: function () {

                TextBlock.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "ParagraphTextBlock");
                //this.htmlElement.textContent = String.fromCharCode(8203);
            },
            _childrenMapping: function () {
                TextBlock.prototype._childrenMapping.call(this);

                this._textNodeBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=TextBlock]"), TextBlock);
            },
            get childrenByPageBreak() {
                return [this._textNodeBlock];
            },
            getPagingEditorHTMLElement: function (offset) { //這裡還要處理表格分頁

                return TextBlock.prototype.getPagingEditorHTMLElement.call(this, offset);
            },
            _commitProperties: function () {

                TextBlock.prototype._commitProperties.call(this);

                //if (this.isPagingFlag) {
                //  debugger
                // }

                //if (this.isEmpty()) {
                //    debugger
                //    this.textContent = String.fromCharCode(8203);
                //}         
            },
            _invalidateDisplayList: function () {

                TextBlock.prototype._invalidateDisplayList.call(this);
            },
            get endFocusOffset() {
                var treeWalker = document.createTreeWalker(
                    this.htmlElement,
                    NodeFilter.SHOW_TEXT,
                    function (node) {
                        node = node.parentNode;

                        while (node) {

                            if (node.getAttribute("data-class") == "ParagraphTextBlock")
                                return NodeFilter.FILTER_ACCEPT;
                            else if (node.getAttribute("data-class") == "OrderedList")
                                return NodeFilter.FILTER_REJECT;
                            else
                                node = node.parentNode;
                        }
                    },
                    false);

                var node = null;
                var endOffset = 0;

                while (node = treeWalker.nextNode()) {
                    endOffset += node.textContent.length;
                }

                return endOffset;
            },

        }

        ParagraphTextBlock.prototype.__proto__ = TextBlock.prototype;

        return ParagraphTextBlock;
    }());

    var ParagraphDiv = (function () {

        var ParagraphDiv = function (htmlElement /** HTMLElement **/) {

            this._paragraphName;
            this._paragraphSuffix;

            div.call(this, htmlElement);
        };

        ParagraphDiv.prototype = {
            _createChildren: function () {

                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ParagraphDiv");

                this._paragraphName = InstanceManager.getInstance(undefined, ParagraphName);
                this.addChild(this._paragraphName);

                this._paragraphSuffix = InstanceManager.getInstance(undefined, ParagraphSuffix);
                this._paragraphSuffix.textContent = "：";
                this.addChild(this._paragraphSuffix);

                this._paragraphTextBlock = InstanceManager.getInstance(undefined, ParagraphTextBlock);
                this.addChild(this._paragraphTextBlock);
                // <span style="display:inline-block; font-size: 16pt; line-height: 20pt; vertical-align: top; margin-top: 3pt;" contenteditable="false">：</span>
            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                //this._rootDiv = this.getChildAt(0);
                this._paragraphName = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ParagraphName]"), ParagraphName);
                this._paragraphSuffix = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ParagraphSuffix]"), ParagraphSuffix);
                this._paragraphTextBlock = InstanceManager.getInstance(this.htmlElement.querySelector("[data-class=ParagraphTextBlock]"), ParagraphTextBlock);

            },
            get childrenByPageBreak() {
                //return [this._paragraphName, this._paragraphSuffix, this._paragraphTextBlock];
                return [this._paragraphName, this._paragraphSuffix];
            },
            get paragraphName() {
                return this._paragraphName;
            },
            get paragraphSuffix() {
                return this._paragraphSuffix;
            },
            get paragraphTextBlock() {
                return this._paragraphTextBlock;
            },
            _updateDisplayList: function () {
                div.prototype._updateDisplayList.call(this);

                if (this._childrenChangedFlag) {
                    this._childrenChangedFlag = false;


                    //停用 改用 display: table-cell;
                    //if (this.htmlElement.getBoundingClientRect().width) {
                    //    this.paragraphTextBlock.htmlElement.style.width =
                    //        (this.htmlElement.getBoundingClientRect().width -
                    //        this.paragraphName.htmlElement.getBoundingClientRect().width -
                    //        this.paragraphSuffix.htmlElement.getBoundingClientRect().width) + "px";
                    //}
                }
            },
        }

        ParagraphDiv.prototype.__proto__ = div.prototype;

        return ParagraphDiv;
    }());

    //分頁頁面
    var Page = (function () {

        var Page = function (htmlElement /** HTMLElement **/) {
            div.call(this, htmlElement);

            this._autoPageBreak = false;
            this._header;
            this._footer;
            this._articleBlock;
            this._overFlowFlag = false;
            this._pageCount = -1;
            this._pageCountChangedFlag = false;

            this.disableDoublePagePrint = false;
        };

        Page.prototype = {
            _createChildren: function () {

                div.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "Page");
            },
            _creationComplete: function () {

                div.prototype._creationComplete.call(this);

                if (this._autoPageBreak && this.htmlElement) {

                    var self = this;
                    var prevHeight;
                    var onDOMSubtreeModified = function (event) {

                        var articleBlock = self.articleBlock;
                        var height = articleBlock.htmlElement.scrollHeight + articleBlock.htmlElement.offsetTop;

                        if (prevHeight != height) {

                            prevHeight = height;

                            if (height > self.footer.htmlElement.offsetTop) {

                                var rootOverFlowEditorList = [];
                                var footerTop = self.footer.htmlElement.getBoundingClientRect().top;
                                self._overFlowFlag = true;

                                for (var i = articleBlock.children.length - 1; i >= 0; i--) {
                                    var childEditor = articleBlock.getChildAt(i);
                                    if (childEditor.htmlElement.getBoundingClientRect().bottom > footerTop) {
                                        rootOverFlowEditorList.push(childEditor);
                                    }
                                }

                                var event = new CustomEvent(
                                    "pageOverFlow",
                                    {
                                        detail: {
                                            break: function () {

                                                var breakEditorList = [];

                                                for (var i = rootOverFlowEditorList.length - 1; i >= 0; i--) {
                                                    debugger
                                                    breakEditorList.push(PageBreakManager.break(rootOverFlowEditorList[i], footerTop));
                                                }

                                                return breakEditorList;
                                            }
                                        },
                                        bubbles: false,
                                        cancelable: true
                                    }
                                );

                                self.htmlElement.dispatchEvent(event);
                                self.htmlElement.removeEventListener("DOMSubtreeModified", onDOMSubtreeModified, false);
                            }
                        }
                    };

                    this.htmlElement.addEventListener("DOMSubtreeModified", onDOMSubtreeModified, false);
                }
            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

                /*if (this.children.length > 0) {
                    this._footer = this.getChildAt(this.children.length - 1);
                    this._header = this.getChildAt(0);

                    for (var i = 0; i < this.children.length; i++) {
                        var childEditor = this.getChildAt(i);

                        if (childEditor.name == "ArticleBlock") {
                            this._articleBlock = childEditor;
                            break;
                        }
                            
                    }
                }*/

                if (this.children.length > 0) {

                    for (var i = 0; i < this.children.length; i++) {
                        var childEditor = this.getChildAt(i);

                        if (childEditor.name == "ArticleBlock") {
                            this._articleBlock = childEditor;
                        }
                        else if (childEditor.name == "PageHeader") {
                            this._footer = childEditor;
                        }
                        else if (childEditor.name == "PageFooter") {
                            this._header = childEditor;
                        }
                    }
                }

            },
            _commitProperties: function () {

                div.prototype._commitProperties.call(this);

                if (this._modeChangedFlag) {
                    this._modeChangedFlag = false;

                    var pageNoHtmlElement = this.htmlElement.querySelector("[data-twedr='頁碼']");

                    if (!pageNoHtmlElement)
                        return;
                    switch (this._mode.name) {
                        case "分頁":
                            pageNoHtmlElement.style.display = "block";
                            break;
                        default:
                            pageNoHtmlElement.style.display = "none";
                            break;

                    }
                }
            },
            _updateDisplayList: function () {
                div.prototype._updateDisplayList.call(this);

                //if (this._childrenChangedFlag) {
                //    this._childrenChangedFlag = false;

                //    this._pageCountChangedFlag = true;
                //}

                if (this._pageCountChangedFlag) {
                    this._pageCountChangedFlag = false;

                    this._updatePageNoHtmlElement();
                }
            },
            _updatePageNoHtmlElement: function () {

                var pageNoHtmlElement = this.htmlElement.querySelector("[data-twedr='頁碼']");

                if (pageNoHtmlElement) {
                    var num = NumericFormatTranslation.NumberChangeFormat((this.childIndex + 1).toString());
                    var sum = NumericFormatTranslation.NumberChangeFormat((this.parent.children.length).toString());
                    var text = "第" + num.ToNumericSplitFormat() + "頁、共" + sum.ToNumericSplitFormat() + "頁";
                    pageNoHtmlElement.textContent = text;
                }
            },
            removeOverFlowEditor: function () {

                if (this._overFlowFlag) {
                    var self = this;
                    var overFlowEditorList = [];

                    var treeWalker = document.createTreeWalker(
                        this.articleBlock.htmlElement,
                        NodeFilter.SHOW_ELEMENT,
                        function (node) {

                            if (node.children.length > 0)
                                return NodeFilter.FILTER_SKIP;

                            if (node.offsetTop != undefined) {

                                if (node.offsetHeight + node.offsetTop > self.footer.htmlElement.offsetTop) {

                                    return NodeFilter.FILTER_ACCEPT;
                                }
                            }

                            //if (node.getAttribute("data-class") != undefined)
                            //   return NodeFilter.FILTER_ACCEPT;
                            //else
                            return NodeFilter.FILTER_SKIP;
                        },
                        false);

                    var node = null;

                    while (node = treeWalker.nextNode()) {


                        //overFlowEditorList.push(InstanceManager.getInstance(node))

                        var overFlowEditor = InstanceManager.getInstance(node);
                        var levalOneEditor = overFlowEditor;
                        var currentEditor = overFlowEditor;

                        while (currentEditor.parent.name != "article") {
                            //levalOneEditor = levalOneEditor.parent;
                            var cloneParentHtmlElement = InstanceManager.clone(currentEditor.parent.htmlElement);
                            cloneParentHtmlElement.innerHTML = "";
                            var parentEditor = InstanceManager.getInstance(cloneParentHtmlElement);

                            parentEditor.addChild(currentEditor);

                            currentEditor = currentEditor.parent;
                            //currentEditor = 
                        }






                        if (overFlowEditorList.indexOf(levalOneEditor) == -1) {
                            var cloneHtmlElement = InstanceManager.clone(levalOneEditor.htmlElement);
                            var newLevalOneEditor = InstanceManager.getInstance(cloneHtmlElement);

                            overFlowEditorList.push(levalOneEditor);
                        }
                    }

                    debugger
                    return overFlowEditorList;
                }
            },
            get pagingOffsetTop() {

                return this.articleBlock.htmlElement.getBoundingClientRect().top + this.parent.pagePixelContentHeight;
            },
            getRootOverFlowEditorList: function () {

                var rootOverFlowEditorList = [];
                var articleBlock = this.articleBlock;
                var height = articleBlock.htmlElement.scrollHeight;
                //var height = articleBlock.htmlElement.getBoundingClientRect().height
                var pagingOffsetTop = this.pagingOffsetTop;

                if (height > this.parent.pagePixelContentHeight) {

                    for (var i = articleBlock.children.length - 1; i >= 0; i--) {
                        var childEditor = articleBlock.getChildAt(i);

                        if (childEditor.htmlElement.getBoundingClientRect().bottom - 4 > pagingOffsetTop) {
                            rootOverFlowEditorList.push(childEditor);
                        }
                    }
                }

                return rootOverFlowEditorList;
            },
            getPagingEditorList: function () {
                var pagingEditorList = [];
                var rootOverFlowEditorList = this.getRootOverFlowEditorList();
                var list = [];
                var pagingOffsetTop = this.pagingOffsetTop;

                for (var i = rootOverFlowEditorList.length - 1; i >= 0; i--) {
                    //breakEditorList.push(PageBreakManager.break(rootOverFlowEditorList[i], this.footer.htmlElement.getBoundingClientRect().top));
                    //breakEditorList.push(PageBreakManager.break(rootOverFlowEditorList[i], this.articleBlock.htmlElement.getBoundingClientRect().top + this.parent.pagePixelContentHeight));



                    list.push({
                        editorHTMLElement: rootOverFlowEditorList[i],
                        offset: pagingOffsetTop,
                        boundingClientRect: rootOverFlowEditorList[i].htmlElement.getBoundingClientRect()
                    });
                }

                for (var i = 0; i < list.length; i++) {

                    var pagingEditor = PageBreakManager.break(list[i].editorHTMLElement, list[i].offset, list[i].boundingClientRect);

                    pagingEditorList.push(pagingEditor);
                }

                return pagingEditorList;
            },
            get header() {
                return this._header;
            },
            get footer() {
                return this._footer;
            },
            get articleBlock() {
                return this._articleBlock;
            },
            get pageCount() {
                return this._pageCount;
            },
            set pageCount(value) {

                if (value != this._pageCount) {
                    value = this._pageCount;
                    this._pageCountChangedFlag = true;
                    this._invalidateDisplayList();
                }
            }
        }

        Page.prototype.__proto__ = div.prototype;

        return Page;
    }());

    var PageHeader = (function () {

        var PageHeader = function (htmlElement /** HTMLElement **/) {

            div.call(this, htmlElement);
        };

        PageHeader.prototype = {
            get name() {
                return "PageHeader";
            },
            _createChildren: function () {

                div.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "PageHeader");
            },
        }

        PageHeader.prototype.__proto__ = div.prototype;

        return PageHeader;
    }());

    var PageFooter = (function () {

        var PageFooter = function (htmlElement /** HTMLElement **/) {

            div.call(this, htmlElement);
        };

        PageFooter.prototype = {
            get name() {
                return "PageFooter";
            },
            _createChildren: function () {

                div.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "PageFooter");
            },
        }

        PageFooter.prototype.__proto__ = div.prototype;

        return PageFooter;
    }());

    //分頁頁面Article
    var ArticleBlock = (function () {

        var ArticleBlock = function (htmlElement /** HTMLElement **/) {

            article.call(this, htmlElement);

        };

        ArticleBlock.prototype = {
            get name() {
                return "ArticleBlock";
            },
            _createChildren: function () {

                article.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "ArticleBlock");
            },
            addChild: function (editorHTMLElement /** EditorHTMLElement **/) {
                article.prototype.addChild.call(this, editorHTMLElement);

                //var breakParent = PageBreakManager.getPagingParent(editorHTMLElement);

                //if (breakParent) {



                //}
            },
            addChildAt: function (editorHTMLElement /** EditorHTMLElement **/, index) {
                article.prototype.addChildAt.call(this, editorHTMLElement, index);
            },

        }

        ArticleBlock.prototype.__proto__ = article.prototype;

        return ArticleBlock;
    }());

    //文稿頁面
    var Document = (function () {

        var Document = function (htmlElement /** HTMLElement **/) {

            this._pagingFlag = false;
            this._pagingStartPageIndex = -1;
            this._breakEditorList = [];

            this.pageWidth = "210mm";
            this.pageContentHeight = "247mm";
            this.pageHeadWidth = "25mm";
            this.pageFooterHeight = "25mm";

            //this.pagePixelWidth;
            this._pagePixelContentHeight;
            //this.pagePixelHeadWidth;
            //this.pagePixelFooterHeight;

            this.pageMode = "single";//single, paging
            this.singleState;
            this.pagingState;
            this.currentState;

            //騎縫章
            //this.tallyImpressionPath = "/Bunban/Project/OD/ViceProject/GOV/ViceProject/EY/tally_impression/96dpi.png";
            this.tallyImpressionPath;
            this.tallyImpressionImageWidth;
            this.tallyImpressionImage;
            //雙面列印
            this.doublePagePrint = true;

            div.call(this, htmlElement);
        };

        Document.prototype = {
            _createChildren: function () {

                //if (!this.htmlElement) {
                //    div.prototype._createChildren.call(this);

                //    this.htmlElement.setAttribute("data-class", "Document");
                //}

                div.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "Document");

                debugger
            },
            _creationComplete: function () {

                div.prototype._creationComplete.call(this);
                /* 邊打邊分頁 先不做
                if (this.children.length > 0) {

                    var self = this;

                    for (var i = 0; i < this.children.length; i++) {

                        var pageEditor = this.getChildAt(i);
                        pageEditor.htmlElement.addEventListener("pageOverFlow", onPageOverFlow);
                    }

                    function onPageOverFlow(event) {
          
                        var targetEditor = InstanceManager.getInstance(event.currentTarget);

                        if (self._pagingStartPageIndex < targetEditor.childNodeIndex) {

                            self._pagingStartPageIndex = targetEditor.childNodeIndex;
                            self._breakEditorList = event.detail.break();
                            self._pagingFlag = true;
                            self._invalidateDisplayList.call(self);
                        }
                    }
                }
                */

                if (this.htmlElement.getAttribute("data-page-width"))
                    this.pageWidth = this.htmlElement.getAttribute("data-page-width");

                if (this.htmlElement.getAttribute("data-page-content-height"))
                    this.pageContentHeight = this.htmlElement.getAttribute("data-page-content-height");

                if (this.htmlElement.getAttribute("data-page-head-height"))
                    this.pageHeadWidth = this.htmlElement.getAttribute("data-page-head-height");

                if (this.htmlElement.getAttribute("data-page-footer-height"))
                    this.pageFooterHeight = this.htmlElement.getAttribute("data-page-footer-height");

                var self = this;

                //(function getPagePixelContentHeight() {
                //    var divPixel = document.createElement("div");
                //    divPixel.style.height = self.pageContentHeight;
                //    divPixel.style.width = self.pageWidth;

                //    document.body.appendChild(divPixel);
                //    debugger
                //    self.pagePixelContentHeight = divPixel.getBoundingClientRect().height;

                //    document.body.removeChild(divPixel);
                //})();

                (function getTallyImpression() {
                    if (self.tallyImpressionPath) {

                        var img = new Image();

                        img.onload = function () {

                            self.tallyImpressionImageWidth = this.width;
                            self.tallyImpressionImage = img;
                            self.tallyImpressionImage.classList.add("docTallyImpression");
                            self.tallyImpressionImage.style.position = "absolute";
                        }

                        img.src = self.tallyImpressionPath;
                    }
                })();

                var draggedEditor;

                this.htmlElement.addEventListener("dragstart", function (event) {
                    console.log("dragstart")
                    var dragged = InstanceManager.getInstance(event.target);

                    if (dragged.name == "SignDraggableEditor") {
                        draggedEditor = dragged;
                        event.dropEffect = "move";

                        var boundingClientRect = draggedEditor.htmlElement.getBoundingClientRect();
                        var offsetX = event.clientX - boundingClientRect.left;
                        var offsetY = event.clientY - boundingClientRect.top;

                        draggedEditor.dragOverOffsetX = offsetX;
                        draggedEditor.dragOveroffsetY = offsetY;

                        console.log("offsetX = " + offsetX)
                        console.log("offsetY = " + offsetY)

                        event.stopPropagation();
                    }
                });

                this.htmlElement.addEventListener("dragover", function (event) {
                    console.log("dragover")
                    event.dataTransfer.dropEffect = "move";
                    event.preventDefault();
                });

                this.htmlElement.addEventListener("drop", function (event) {
                    console.log("drop")
                    if (draggedEditor.name == "SignDraggableEditor") {

                        var boundingClientRect = draggedEditor.htmlElement.offsetParent.getBoundingClientRect();
                        draggedEditor.setStyle("left", (event.clientX - boundingClientRect.left - draggedEditor.dragOverOffsetX) + "px");
                        draggedEditor.setStyle("top", (event.clientY - boundingClientRect.top - draggedEditor.dragOveroffsetY) + "px");
                    }
                });
            },
            get pagePixelContentHeight() {
                if (this._pagePixelContentHeight == undefined) {

                    var divPixel = document.createElement("div");
                    divPixel.style.height = this.pageContentHeight;
                    divPixel.style.width = this.pageWidth;

                    document.body.appendChild(divPixel);

                    if (divPixel.getBoundingClientRect().height > 0)
                        this._pagePixelContentHeight = divPixel.getBoundingClientRect().height;

                    document.body.removeChild(divPixel);
                }

                return this._pagePixelContentHeight;
            },
            _addNewPage: function () {

                var clonePageHtmlElement = InstanceManager.clone(this.getChildAt(0).htmlElement, true);
                clonePageHtmlElement.querySelector("[data-class=ArticleBlock]").innerHTML = "";

                var dataFirstPageList = clonePageHtmlElement.querySelectorAll("[data-first-page=true]");

                if (dataFirstPageList) {
                    for (var i = 0; i < dataFirstPageList.length; i++) {
                        dataFirstPageList[i].innerHTML = "";
                    }
                }

                var newPage = InstanceManager.getInstance(clonePageHtmlElement, Page);
                this.addChild(newPage);

                return newPage;
            },
            _updateDisplayList: function () {

                div.prototype._updateDisplayList.call(this);

                if (this._childrenChangedFlag) {
                    this._childrenChangedFlag = false;

                    for (var i = 0; i < this.children.length; i++) {

                        var pageEditor = this.getChildAt(i);
                        pageEditor.pageCount = this.children.length;


                    }
                }


                /* 邊打邊分頁 先不做
                if (this._pagingFlag) {                  
                    this._pagingFlag = false;
                    
                    for (var i = 0; i <= this._pagingStartPageIndex; i++) {
                        var pageEditor = this.getChildAt(i);

                        if (i + 1 == this.children.length) {
                            var newPage = this._addNewPage();

                            newPage.articleBlock.addChild(this._breakEditorList[1]);
                            this._breakEditorList[1].validateNow();
                        }
                    }
                }*/
            },
            _childrenMapping: function () {

                div.prototype._childrenMapping.call(this);

            },
            get selectedPage() {
                var selection = window.getSelection();
                var page;

                if (selection.rangeCount > 0) {

                    var range = selection.getRangeAt(0);

                    for (var i = 0; i < this.children.length; i++) {
                        var pageEditor = this.getChildAt(i);

                        if (pageEditor.htmlElement.contains(range.commonAncestorContainer)) {
                            page = pageEditor;
                            break;
                        }

                    }
                }

                return page;
            },
            paging: function () {//開始分頁
                debugger
                var self = this;
                var promise = new Promise(function (resolve, reject) {

                    if (self.pageMode != "paging") {

                        self.singleState = StateManager.currentState;
                        debugger
                        var s = new State();
                        s.name = "分頁";
                        self.pagingState = s;
                        self.pagingState.enabled = true;

                        StateManager.addState(self.pagingState);
                        StateManager.currentState = self.pagingState;

                        var pageIndex = 0;
                        var pageCount = self.children.length;

                        var pageEditor = self.getChildAt(pageIndex);
                        var pagingEditorList = pageEditor.getPagingEditorList();

                        doPaging(pageEditor, pagingEditorList);

                        self.pageMode = "paging";

                        function doPaging(pageEditor, pagingEditorList) {

                            var pageIndex = pageEditor.childIndex;

                            if (pagingEditorList.length > 0) {

                                var nextPage;

                                if (pageIndex + 1 == self.children.length) {
                                    nextPage = self._addNewPage();
                                    //pageCount++;
                                }
                                else
                                    nextPage = self.getChildAt(pageIndex + 1);

                                while (pagingEditorList.length > 0) {
                                    var breakEditor = pagingEditorList.shift();

                                    nextPage.articleBlock.addChild(breakEditor);
                                }

                                breakEditor.validateNow();

                                var nextPagingEditorList = nextPage.getPagingEditorList();
                                if (nextPagingEditorList.length > 0) {

                                    pagingEditorList = nextPagingEditorList.concat(pagingEditorList)

                                    setTimeout(function () {
                                        doPaging(nextPage, pagingEditorList);
                                        console.log("doPaging" + nextPage.childNodeIndex)
                                    })
                                }
                                else
                                    resolve();
                            }
                            else
                                resolve();
                        }
                    }


                });

                return promise;
            },
            single: function () {//單頁模式
                debugger
                if (this.pageMode != "single") {

                    for (var i = 0, l = this.pagingState.overrides.length; i < l; i++) {
                        this.pagingState.undo();
                    }

                    StateManager.currentState = this.singleState;

                    this.pageMode = "single";
                }
            },
            //顯示騎縫章 未完成
            displayTallyImpression: function (doublePagePrint) {

                if (doublePagePrint != undefined)
                    this.doublePagePrint = doublePagePrint;

                var tallyImpressionImage = this.tallyImpressionImage;

                var partHeight,
                    top,
                    ang,
                    index = 0;

                for (var i = 0; i < this.children.length - 1; i++) {

                    var pageEditor = this.getChildAt(i);
                    //var value = self.docArr[d].pageCount + self.docArr[d].blankPageCount;
                    //var value = i;

                    if (this.doublePagePrint) {

                        if (pageEditor.disableDoublePagePrint) {//未完成

                            if (value <= 2)
                                break;

                            if ((i % 2) == 1)
                                continue;
                        }
                        else
                            if ((i % 2) == 0)
                                continue;
                    }

                    partHeight = pageEditor.htmlElement.getBoundingClientRect().height / 5;
                    top = partHeight * (Math.floor((Math.random() * 3) + 1));
                    ang = Math.floor((Math.random() * 120)) - 60;

                    //var $cImg = ODEinit.session.$tallyImpressionImage.clone();

                    tallyImpressionImage.style.top = top;
                    tallyImpressionImage.style.transform = "rotate(" + ang + "deg)";

                    var x = (tallyImpressionImage.naturalWidth / 2) + Math.floor((Math.random() * 40)) - 20;

                    if (this.doublePagePrint && pageEditor.disableDoublePagePrint) {//未完成

                        if ((i + 2) < value) {

                            var cloneImage = tallyImpressionImage.cloneNode(true);
                            cloneImage.style.right = 0 - x;
                            pageEditor.addChild(InstanceManager.getInstance(cloneImage));

                            cloneImage = tallyImpressionImage.cloneNode(true);
                            cloneImage.style.left = 0 - (tallyImpressionImage.naturalWidth - x);
                            this.getChildAt(i + 2).addChild(InstanceManager.getInstance(cloneImage));


                            // tallyImpressionImage.cloneNode(true).css("right", 0 - x).appendTo(pageList[index + i]);
                            // $cImg.clone().css("left", 0 - (ODEinit.session.tallyImpressionImageWidth - x)).appendTo(pageList[index + i + 2]);
                        }
                    }
                    else if ((i + 1) < this.children.length) {
                        var cloneImage = tallyImpressionImage.cloneNode(true);
                        cloneImage.style.right = 0 - x;
                        pageEditor.addChild(InstanceManager.getInstance(cloneImage));

                        cloneImage = tallyImpressionImage.cloneNode(true);
                        cloneImage.style.left = 0 - (tallyImpressionImage.naturalWidth - x);
                        this.getChildAt(i + 1).addChild(InstanceManager.getInstance(cloneImage));


                        // $cImg.clone().css("right", 0 - x).appendTo(pageList[index + i]);
                        //  $cImg.clone().css("left", 0 - (ODEinit.session.tallyImpressionImageWidth - x)).appendTo(pageList[index + i + 1]);
                    }
                }
            },
            //移除騎縫章 未完成
            removeTallyImpression: function () {

                var htmlElementList = this.htmlElement.querySelectorAll(".docTallyImpression");

                for (var i = 0; i < htmlElementList.length; i++) {
                    var instance = InstanceManager.getInstance(htmlElementList[i]);
                    instance.parent.removeChild(instance);
                }

            },
            //自動插入分隔頁 未完成
            autoInsertBlankPage: function () {



                for (var i = 0; i < this.children.length; i++) {

                    var pageEditor = this.getChildAt(i);

                }



                var self = this;

                if (self.$pageContainer) {
                    var $pageList = self.$pageContainer.find("div[class='page-break']");
                    var cusor = 0;

                    $.each(self.docArr, function (index, value) {

                        var blankPageCount = 0;

                        if (value.disableDoublePagePrint) {
                            for (var i = 0; i < (value.pageCount - 1); i++) {
                                var $blankPage = self.blankPage();
                                $blankPage.attr("data-ifd-blank-page", "true");
                                $blankPage = $blankPage.insertAfter($($pageList[(cusor + i)]));
                                blankPageCount++;
                            }
                        }
                        else if (value.autoInsertBlankPage && value.pageCount > 1 && value.pageCount % 2 == 0) {
                            var $blankPage = self.blankPage();
                            $blankPage.attr("data-ifd-blank-page", "true");
                            $blankPage = $blankPage.insertBefore($($pageList[(cusor + (value.pageCount - 1))]));
                            blankPageCount++;
                        }

                        if ((index < self.docArr.length - 1) && ((value.pageCount + blankPageCount) % 2 == 1)) {
                            var $blankPage = self.blankPage();
                            $blankPage.attr("data-ifd-blank-page", "true");
                            $blankPage = $blankPage.insertAfter($($pageList[(cusor + (value.pageCount - 1))]));
                            blankPageCount++;
                        }

                        value.blankPageCount = blankPageCount;
                        cusor += value.pageCount;
                    });
                }
            },
            print: function () {
                debugger

                var ie = window.hasOwnProperty("ActiveXObject")

                if (ie) {
                    var w, wdoc;

                    w = window.open("", "", "location=1,status=1,scrollbars=1,fullscreen=yes");
                    wdoc = w.document;
                    var objectElement = new DOMParser().parseFromString('<OBJECT classid="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2" height="0" id="WebBrowser" width="0"></OBJECT>', "text/html").body.children[0];
                    var printDocument = new DOMParser().parseFromString(window.document.firstChild.outerHTML, "text/html");
                    printDocument.body.setAttribute("onload", "window.document.WebBrowser.ExecWB(6, 6); setTimeout(function (){window.close();}, 100);");
                    printDocument.body.appendChild(objectElement);
                    wdoc.write(printDocument.firstChild.outerHTML);
                    wdoc.close();
                }
                else {
                    window.print();
                }


                //alert(window.document.WebBrowser)
                //alert(window.document.WebBrowser.ExecWB)
                //if (window.document.WebBrowser && window.document.WebBrowser.ExecWB) {

                //    window.document.WebBrowser.ExecWB(6, 6);
                //}                              
                //else
                //    window.print();
            }
        }

        Document.prototype.__proto__ = div.prototype;

        return Document;
    }());

    var SignEditor = (function () {

        var SignEditor = function (htmlElement /** HTMLElement **/) {

            this.titleFormat = "{unitName} {positionName} {empName},{nowDateTimeString},{signName}";

            this._exectime;
            this._isStack = true;

            UndoRedoEditor.call(this, htmlElement);
        };

        SignEditor.prototype = {
            _createElement: function () {
                this.htmlElement = document.createElement("span");
            },
            _createChildren: function () {

                UndoRedoEditor.prototype._createChildren.call(this);
                this._createElement();
                this.htmlElement.style.color = "red";
            },
            get name() {
                return "SignEditor";
            },
            get signName() {
                return "";
            },
            get textContent() {

                return UndoRedoEditor.prototype.__lookupGetter__('textContent').call(this);
            },
            set textContent(value) {

                if (value != undefined && value != this.textContent) {

                    UndoRedoEditor.prototype.__lookupSetter__('textContent').call(this, value);

                    var self = this;

                    this.getSignTitle().then(function (title) {
                        debugger
                        self.title = title;
                    });
                }
            },
            getSignTitle: function () {

                var infoObject = getConfig("infoObject");
                var title = this.titleFormat;
                var regExp = new RegExp(/{\w+}/g);
                var titleFormat = this.titleFormat;
                var self = this

                var promise = new Promise(function (resolve, reject) {
                    debugger
                    (function queue() {
                        var result = regExp.exec(titleFormat);

                        if (result) {
                            var key = result[0].replace("{", "").replace("}", "");

                            if (self[key] != undefined) {
                                title = title.replace("{" + key + "}", self[key]);
                                queue();
                            }
                            else if (typeof infoObject[key] == "function") {

                                infoObject[key]().done(function (value) {
                                    title = title.replace("{" + key + "}", value);

                                    if (key == "nowDateTimeString")
                                        self.exectime = value;

                                    queue();
                                })
                            }
                            else if (infoObject[key] != undefined) {
                                title = title.replace("{" + key + "}", infoObject[key]);
                                queue();
                            }
                            else
                                queue();

                        }
                        else
                            resolve(title);

                    })();

                })

                return promise;
            },
            get exectime() {
                return this._exectime;
            },
            set exectime(value) {
                this._exectime = value;
            },
            get isStack() {
                return this._isStack;
            },
            clone: function () {
                var cloneHTMLElement = InstanceManager.clone(this.htmlElement, true);
                var dataClass;
                if (cloneHTMLElement.nodeType == Node.ELEMENT_NODE) {
                    dataClass = eval(cloneHTMLElement.getAttribute("data-class"));
                }

                var cloneEditor = InstanceManager.getInstance(cloneHTMLElement, dataClass);

                return cloneEditor;
            },
            finalVersion: function () {

            }
        }

        SignEditor.prototype.__proto__ = UndoRedoEditor.prototype;

        return SignEditor;
    }());

    var SignFixedEditor = (function () {

        var SignFixedEditor = function (htmlElement /** HTMLElement **/) {
            SignEditor.call(this, htmlElement);
        };

        SignFixedEditor.prototype = {
            _createElement: function () {
                this.htmlElement = document.createElement("div");
            },
            _createChildren: function () {

                SignEditor.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "SignFixedEditor");
                this.htmlElement.setAttribute("data-page-break", false);
            },
            _childrenMapping: function () {
                SignEditor.prototype._childrenMapping.call(this);
            },
            get name() {
                return "SignFixedEditor";
            },
            get signName() {
                return this.htmlElement.getAttribute("data-sign-object");
            },
        }

        SignFixedEditor.prototype.__proto__ = SignEditor.prototype;

        return SignFixedEditor;
    }());

    var SignDraggableEditor = (function () {

        var SignDraggableEditor = function (htmlElement /** HTMLElement **/) {

            this.dragOverOffsetX = 0;
            this.dragOveroffsetY = 0;

            SignEditor.call(this, htmlElement);
        };

        SignDraggableEditor.prototype = {
            _createElement: function () {
                this.htmlElement = document.createElement("div");
            },
            _createChildren: function () {

                SignEditor.prototype._createChildren.call(this);
                this.htmlElement.setAttribute("data-class", "SignDraggableEditor");
            },
            _childrenMapping: function () {
                SignEditor.prototype._childrenMapping.call(this);
            },
            get name() {
                return "SignDraggableEditor";
            },
            get signName() {
                return "加入簽核物件";
            },
        }

        SignDraggableEditor.prototype.__proto__ = SignEditor.prototype;

        return SignDraggableEditor;
    }());

    //插入文字
    var InsertText = (function () {

        var InsertText = function (htmlElement /** HTMLElement **/) {

            SignEditor.call(this, htmlElement);
        };

        InsertText.prototype = {
            _createChildren: function () {

                SignEditor.prototype._createChildren.call(this);
                //this.htmlElement = document.createElement("span");
                //this.htmlElement.contentEditable = false;
                //this.htmlElement.style.color = "red";
                this.htmlElement.setAttribute("data-class", "InsertText");
            },
            get name() {
                return "InsertText";
            },
            get signName() {
                return "插入文字";
            },
        }

        InsertText.prototype.__proto__ = SignEditor.prototype;

        return InsertText;
    }());

    //刪除文字
    var DelText = (function () {

        var DelText = function (htmlElement /** HTMLElement **/) {
            SignEditor.call(this, htmlElement);
        };

        DelText.prototype = {
            _createChildren: function () {

                SignEditor.prototype._createChildren.call(this);
                //this.htmlElement = document.createElement("span");
                //this.htmlElement.contentEditable = false;
                //this.htmlElement.style.color = "red";
                this.htmlElement.style.textDecoration = "line-through";
                this.htmlElement.setAttribute("data-class", "DelText");
                //'<span signobject="刪除文字" signflowid="SignStep_1060000046_7_0" signobjectrid="node_c564e9b865fd30ea3aeda8bd0457691f71741487559537760" data-odeditor-signdata="red" contenteditable="false" style=" color: red!important; text-decoration:line-through;" signtime="106/02/20 10:58:57" title="秘書處 副處長 林○棟, 106/02/20 10:58:57, 刪除文字" data-odeditor-signinfo="秘書處 副處長 林○棟, 106/02/20 10:58:57, 刪除文字">fffffffffffttttttttt</span>'
            },
            get name() {
                return "delText";
            },
            get signName() {
                return "刪除文字";
            },
            finalVersion: function () {
                this.htmlElement.style.color = "inherit";
                this.htmlElement.style.textDecoration = "inherit";
            }
        }

        DelText.prototype.__proto__ = SignEditor.prototype;

        return DelText;
    }());

    //畫線
    var MarkText = (function () {

        var MarkText = function (htmlElement /** HTMLElement **/) {

            SignEditor.call(this, htmlElement);
        };

        MarkText.prototype = {
            _createChildren: function () {

                //<span signobject="畫線" signflowid="SignStep_1060160369_1_0" signobjectrid="node_117d64fd40e40376d3ea5cb93516a5a498361503390619377" style="background: linear-gradient( white 0%, #FFFF00 1%, #FFFF00 100%);" signtime="106/08/22 16:25:24" title="秘書處 處長 謝○銘, 106/08/22 16:25:24, 畫線" data-odeditor-signinfo="秘書處 處長 謝○銘, 106/08/22 16:25:24, 畫線" id="node_117d64fd40e40376d3ea5cb93516a5a498361503390619377" data-ifd-exectime="106/08/22 16:25:24">tttttttttttt</span>


                SignEditor.prototype._createChildren.call(this);

                this.htmlElement.setAttribute("data-class", "MarkText");
                this.htmlElement.style.color = "inherit";
                this.htmlElement.style.background = "linear-gradient( white 0%, #FFFF00 1%, #FFFF00 100%)";
            },
            get name() {
                return "MarkText";
            },
            get signName() {
                return "畫線";
            },
            get keyinWordAvoid() {
                return true;
            }
        }

        MarkText.prototype.__proto__ = SignEditor.prototype;

        return MarkText;
    }());

    //HoverBlock
    var HoverBlock = (function () {

        var HoverBlock = function (htmlElement /** HTMLElement **/) {

            this._enabled = false;
            this._enabledChangedFlag = false;
            this._data;

            div.call(this, htmlElement);
        };

        HoverBlock.prototype = {
            get name() {
                return "HoverBlock";
            },
            set enabled(value) {

                if (value != undefined && value != this.enabled) {

                    this._enabled = value;
                    this._enabledChangedFlag = true;
                    this._invalidateProperties();
                }
            },
            get enabled() {
                return this._enabled;
            },
            set data(value) {

                if (value != undefined && value != this.data) {

                    this._data = value;
                    //this._dataChangedFlag = true;
                    //this._invalidateProperties();
                }
            },
            get data() {
                return this._data;
            },
            _creationComplete: function () {
                div.prototype._creationComplete.call(this);
            },
            _commitProperties: function () {
                div.prototype._commitProperties.call(this);

                if (this._enabledChangedFlag) {
                    this._enabledChangedFlag = false;

                    if (this.enabled) {

                        var styleNode = this.htmlElement.querySelector("style");
                        if (styleNode)
                            this.htmlElement.removeChild(styleNode);

                        var css = "#" + this.htmlElement.id + ":hover{ border:outset; border-width:1px;  width:200px; }";
                        var style = document.createElement('style');

                        if (style.styleSheet)
                            style.styleSheet.cssText = css;
                        else
                            style.appendChild(document.createTextNode(css));

                        this.htmlElement.appendChild(style);
                        this.htmlElement.style.cursor = "pointer";
                    }
                    else {
                        var styleNode = this.htmlElement.querySelector("style");
                        if (styleNode)
                            this.htmlElement.removeChild(styleNode);

                        this.htmlElement.style.cursor = "inherit";
                    }
                }



                //if (this._modeChangedFlag) {
                //    this._modeChangedFlag = false;

                //    switch (this._mode.name) {
                //        case "唯讀":
                //            var styleNode = this.htmlElement.querySelector("style");
                //            if (styleNode)
                //                this.htmlElement.removeChild(styleNode);

                //            this.htmlElement.style.cursor = "inherit";

                //            break;
                //        default:
                //            break;

                //    }
                //}
            },
        }

        HoverBlock.prototype.__proto__ = div.prototype;

        return HoverBlock;
    }());

    // State

    var State = (function () {

        var State = function () {
            this.name;
            this.overrides = []; /* of IOverride */
            this.removeds = []; /* of IOverride */

            this._startBatchModeFlag = false;
            this._batchOverride; /** BatchOverride **/
            this._undoingFlag = false;
            this.enabled = false;
        };

        State.prototype = {
            addOverride: function (override /** IOverride **/) {
                //debugger
                if (!this.enabled)
                    return;

                if (this._undoingFlag)
                    return;

                if (this._startBatchModeFlag)
                    this._batchOverride.addOverride(override);
                else
                    this.overrides.push(override);

                if (this.removeds.length > 0)
                    this.removeds = [];
            },
            startBatchMode: function () {
                if (!this.enabled)
                    return;

                this._startBatchModeFlag = true;
                this._batchOverride = new BatchOverride();
            },
            endBatchMode: function () {
                if (!this.enabled || !this._startBatchModeFlag)
                    return;

                if (this._batchOverride.overrides.length == 0)
                    return;

                this._startBatchModeFlag = false;
                this.overrides.push(this._batchOverride);
                this._batchOverride = null;
            },
            undo: function () {
                if (!this.enabled)
                    return;
                debugger
                if (this.overrides.length > 0) {

                    this._undoingFlag = true;
                    this.enabled = false;
                    MutationObserverManager.disconnect();

                    var o = this.overrides.pop();

                    o.remove();

                    this._undoingFlag = false;
                    this.enabled = true;
                    MutationObserverManager.observe();
                    this.removeds.push(o);
                }

            },
            redo: function () {

                if (!this.enabled)
                    return;

                if (this.removeds.length > 0) {
                    var o = this.removeds.pop();

                    this._undoingFlag = true;
                    this.enabled = false;
                    MutationObserverManager.disconnect();

                    o.apply();

                    this._undoingFlag = false;
                    this.enabled = true;
                    MutationObserverManager.observe();
                    this.overrides.push(o);
                }

            }
        }

        return State;
    }());

    var IOverride = (function () {

        var IOverride = function () {

            this.initialize();
        };

        IOverride.prototype = {
            initialize: function () { },
            apply: function () { },
            remove: function () { }
        }

        return IOverride;
    }());

    var SetProperty = (function () {

        var SetProperty = function (target, name, value) {

            this.target = target;
            this.name = name;
            this.value = value;

            this._oldValue;

            IOverride.call(this);
        };

        SetProperty.prototype = {
            initialize: function () {
                this._oldValue = this.target[this.name];
            },
            apply: function () {

                var newValue = this.value;
                this.target[this.name] = newValue;
            },
            remove: function () {
                this.target[this.name] = this._oldValue;
            }
        }

        SetProperty.prototype.__proto__ = IOverride.prototype;

        return SetProperty;
    }());

    var SetStyle = (function () {

        var SetStyle = function (target, name, value) {

            this.target = target;
            this.name = name;
            this.value = value;

            this._oldValue;

            IOverride.call(this);
        };

        SetStyle.prototype = {
            initialize: function () {
                var t = this.target;
                this._oldValue = t.getStyle(this.name);
            },
            apply: function () {
                var newValue = this.value;
                this.target.setStyle(this.name, newValue);
            },
            remove: function () {
                this.target.setStyle(this.name, this._oldValue);
            }
        }

        SetStyle.prototype.__proto__ = IOverride.prototype;

        return SetStyle;
    }());

    var RemoveClass = (function () {

        var RemoveClass = function (target, name) {

            this.target = target;
            this.name = name;

            IOverride.call(this);
        };

        RemoveClass.prototype = {
            initialize: function () {
            },
            apply: function () {
                this.target.htmlElement.class.remove(this.name);
            },
            remove: function () {
                this.target.htmlElement.class.add(this.name);
            }
        }

        RemoveClass.prototype.__proto__ = IOverride.prototype;

        return RemoveClass;
    }());

    var SetController = (function () {

        var SetController = function (controller, arg) {

            this.arg = arg;
            this.arg.splice(0, 0, null);

            this.controller = new (Function.prototype.bind.apply(controller, this.arg))


            IOverride.call(this);
        };

        SetController.prototype = {
            initialize: function () {
            },
            apply: function () {


            },
            remove: function () {
            }
        }

        SetController.prototype.__proto__ = IOverride.prototype;

        return SetController;
    }());

    var BatchOverride = (function () {

        var BatchOverride = function (overrides) {

            this.overrides = overrides || [];

            IOverride.call(this);
        };

        BatchOverride.prototype = {
            get name() {
                return "BatchOverride";
            },
            initialize: function () {

            },
            addOverride: function (override /** IOverride **/) {
                this.overrides.push(override);
            },
            apply: function () {

                var validateEditorList = [];

                for (var i = 0; i < this.overrides.length; i++) {
                    this.overrides[i].apply();

                    if (this.overrides[i].target && validateEditorList.indexOf(this.overrides[i].target) == -1)
                        validateEditorList.push(this.overrides[i].target);
                }

                for (var i = 0; i < validateEditorList.length; i++) {
                    validateEditorList[i].validateProperties();
                    validateEditorList[i].validateNow();
                }
            },
            remove: function () {

                var validateEditorList = [];

                for (var i = this.overrides.length - 1; i >= 0; i--) {
                    this.overrides[i].remove();
                    if (this.overrides[i].target && validateEditorList.indexOf(this.overrides[i].target) == -1)
                        validateEditorList.push(this.overrides[i].target);
                }

                for (var i = 0; i < validateEditorList.length; i++) {
                    validateEditorList[i].validateProperties();
                    validateEditorList[i].validateNow();
                }
            }
        }

        BatchOverride.prototype.__proto__ = IOverride.prototype;

        return BatchOverride;
    }());

    var AddChild = (function () {

        var AddChild = function (relativeTo, target, position, index, recoveryTextNode) {
            this.relativeTo = relativeTo;
            this.target = target;
            this.position = position;

            this.index = index;//"insertNode"
            this.recoveryTextNode = recoveryTextNode;//"insertNode";
            this.textInstance;//"insertNode";

            IOverride.call(this);
        };

        AddChild.prototype = {
            initialize: function () {
            },
            apply: function () {
                switch (this.position) {
                    case "before":
                        this.relativeTo.parent.addChildAt(this.target, this.relativeTo.childNodeIndex - 1);
                        this.relativeTo.parent.validateNow();
                        break;
                    case "after":
                        this.relativeTo.parent.addChildAt(this.target, this.relativeTo.childNodeIndex + 1);
                        this.relativeTo.parent.validateNow();
                        break;
                    case "firstChild":
                        this.relativeTo.addChildAt(this.target, 0);
                        break;
                    case "insertContents"://未完成
                        this.relativeTo.insertContents(this.target, undefined, this.index);
                        break;
                    case "insertNode"://要來停用
                        debugger
                        this.relativeTo.addChildAtByTextNode(this.target, this.index);

                        if (this.recoveryTextNode && this.textInstance) {
                            this.textInstance.textContent = "";
                        }

                        break;
                    case "lastChild":
                    default:
                        this.relativeTo.addChild(this.target);
                        break;
                }

            },
            remove: function () {
                switch (this.position) {
                    case "before":
                    case "after":
                        this.relativeTo.parent.removeChild(this.target);
                        this.relativeTo.parent.validateNow();
                        break;
                    case "insertContents"://未完成
                        this.relativeTo.removeChild(this.target);
                        break;
                    case "insertNode":
                        this.relativeTo.removeChild(this.target);

                        if (this.recoveryTextNode) {
                            this.textInstance = InstanceManager.getInstance(undefined, text);
                            this.textInstance.textContent = this.target.textContent;
                            this.relativeTo.addChildAtByTextNode(this.textInstance, this.index);
                        }
                        break;

                    case "firstChild":
                    case "lastChild":
                    default:
                        this.relativeTo.removeChild(this.target);
                        break;
                }


            }
        }

        AddChild.prototype.__proto__ = IOverride.prototype;

        return AddChild;
    }());

    var RemoveChild = (function () {

        var RemoveChild = function (target, parent /**非必要**/) {

            this.target = target;
            this._parent = parent;
            this._oldParent
            this._oldIndex;


            IOverride.call(this);
        };

        RemoveChild.prototype = {
            initialize: function () {

                if (this._parent)
                    this._oldParent = this._parent;
                else {
                    this._oldParent = this.target.parent;
                    this._oldIndex = this.target.childNodeIndex;
                }
            },
            apply: function () {
                if (this._parent)
                    this._oldParent = this._parent;
                else {
                    this._oldParent = this.target.parent;
                    this._oldIndex = this.target.childNodeIndex;
                }

                this._oldParent.removeChild(this.target);
            },
            remove: function () {
                if (this._oldIndex >= 0)
                    this._oldParent.addChildAt(this.target, this._oldIndex);
                else
                    this._oldParent.addChild(this.target);
            }
        }

        RemoveChild.prototype.__proto__ = IOverride.prototype;

        return RemoveChild;
    }());

    var SetEventHandler = (function () {

        var SetEventHandler = function (target, name, handler) {

            this.target = target;
            this.name = name;
            this.handler = function (event) {

                var targetEditor = InstanceManager.getInstance(event.currentTarget);
                var getEditorByIdFunction = function (id) {
                    return InstanceManager.getInstance(targetEditor.htmlElement.ownerDocument.querySelector("#" + id));
                }
                handler(name, targetEditor, getEditorByIdFunction);
            };

            IOverride.call(this);
        };

        SetEventHandler.prototype = {
            initialize: function () {

            },
            apply: function () {

                this.target.htmlElement.addEventListener(this.name, this.handler, false);
            },
            remove: function () {
                this.target.htmlElement.removeEventListener(this.name, this.handler, false);
            }
        }

        SetEventHandler.prototype.__proto__ = IOverride.prototype;

        return SetEventHandler;
    }());

    var SetRange = (function () {

        var SetRange = function (target) {

            this.target = target;
            this.startOffset;
            this.endOffset;

            this.oldTarget;
            this.oldStartOffset;
            this.oldEndOffset;

            IOverride.call(this);
        };

        SetRange.prototype = {
            initialize: function () {

                var startEndOffset = this.target.getStartEndOffset();

                this.startOffset = startEndOffset.startOffset;
                this.endOffset = startEndOffset.endOffset;
            },
            apply: function () {
                this.oldTarget.setStartEndOffset({
                    startOffset: this.oldStartOffset,
                    endOffset: this.oldEndOffset
                });
            },
            remove: function () {
                this.target.setStartEndOffset({
                    startOffset: this.startOffset,
                    endOffset: this.endOffset
                });
            },
            saveStartEndOffset: function () {
                //var selection = window.getSelection();
                //var range = selection.getRangeAt(0);
                //this.oldTarget = InstanceManager.getInstance(range.commonAncestorContainer.parentNode);

                var selection = window.getSelection();
                var focusNode

                if (selection.rangeCount > 0)
                    focusNode = window.getSelection().getRangeAt(0).commonAncestorContainer;
                else
                    focusNode = window.getSelection().focusNode;

                if (focusNode && focusNode.nodeType == Node.TEXT_NODE)
                    focusNode = focusNode.parentNode;

                if (!focusNode)
                    throw new Error("not find focusNode")

                this.oldTarget = InstanceManager.getInstance(focusNode);

                var startEndOffset = this.oldTarget.getStartEndOffset();

                this.oldStartOffset = startEndOffset.startOffset;
                this.oldEndOffset = startEndOffset.endOffset;

                StateManager.currentState.addOverride(this);
            }
        }

        SetRange.prototype.__proto__ = IOverride.prototype;

        return SetRange;
    }());

    var StateManager = (function () {
        var dictionary = {};
        var _container;
        var _states;
        var _currentState;

        var StateManager = {
            set states(value) {
                _states = value;
            },
            get states() {
                return _states;
            },
            set container(value) {
                _container = value;
            },
            getState: function (name) {
                var s = dictionary[name];

                if (s == undefined)
                    return undefined;

                return s.state;
            },
            addState: function (state /** State **/) {
                dictionary[state.name] = {
                    state: state,
                    initOverrides: []
                }
            },
            get currentState() {
                return _currentState;
            },
            set currentState(state) {

                if (this.currentState && this.currentState.name == state.name)
                    return;

                var validateEditorList = [];
                var dataClassList = _container.querySelectorAll("[data-class]");
                for (var i = 0; i < dataClassList.length; i++) {

                    var editor = InstanceManager.getInstance(dataClassList[i]);
                    editor.mode = state;
                    editor.validateProperties();
                }

                this.addState(state);

                if (this.currentState && this.currentState.name != state.name && state.name != "分頁") {

                    for (var i = 0, l = dictionary[this.currentState.name].initOverrides.length; i < l; i++) {
                        var o = dictionary[this.currentState.name].initOverrides.pop();
                        if (o.target && validateEditorList.indexOf(o.target) == -1)
                            validateEditorList.push(o.target);

                        o.remove();
                    }
                }

                _currentState = state;

                var stateInfo = _states[state.name];

                (function (s) {

                    var basedStateArray = [];

                    while (s.basedOn) {
                        var basedStateInfo = _states[s.basedOn];
                        basedStateArray.push(basedStateInfo);
                        s = basedStateInfo;
                    }

                    while (basedStateArray.length > 0) {

                        var basedStateInfo = basedStateArray.pop();

                        addOverride(basedStateInfo.iOverrides, dictionary[state.name].initOverrides);
                    }

                }(stateInfo));

                addOverride(stateInfo.iOverrides, dictionary[state.name].initOverrides);

                function getElementByIdOrSelectorAll(selector){
                    var htmlElement = document.getElementById(selector);

                    if (!htmlElement)
                        htmlElement = document.querySelectorAll(selector);
                    else
                        return [htmlElement];

                    if (!htmlElement)
                        throw new Error("not querySelector =" + selector);         
                        
                    return htmlElement;
                }

                function addOverride(IOverrides, initOverrides) {

                    for (var i = 0; i < IOverrides.length; i++) {
                        var IOverrideInfo = IOverrides[i];

                        if (IOverrideInfo.destroy)
                            continue;

                        var type = IOverrideInfo.iOverride;
                        var IOverrideClassName = eval(type);

                        var IOverride;

                        switch (type) {
                            case "AddChild":

                                var htmlElement = document.getElementById(IOverrideInfo.relativeTo);

                                if (!htmlElement)
                                    htmlElement = document.querySelector(IOverrideInfo.relativeTo);

                                if (!htmlElement)
                                    throw new Error("not querySelector =" + IOverrideInfo.relativeTo);

                                var relativeTo = InstanceManager.getInstance(htmlElement);
                                var targetHtmlElement = new DOMParser().parseFromString(IOverrideInfo.target, "text/html").body.children[0];

                                if (targetHtmlElement.getAttribute("id") && document.getElementById(targetHtmlElement.getAttribute("id")))
                                    continue;

                                var targetClass = undefined;
                                if (targetHtmlElement.getAttribute("data-class"))
                                    targetClass = eval(targetHtmlElement.getAttribute("data-class"))

                                var verifyHandler = IOverrideInfo.verifyHandler;

                                if (verifyHandler != undefined && !verifyHandler(targetHtmlElement, relativeTo))
                                    continue;

                                var target = InstanceManager.getInstance(targetHtmlElement, targetClass);
                                IOverride = new (IOverrideClassName)(relativeTo, target, IOverrideInfo.position, IOverrideInfo.index);
                                break;
                            case "SetBehavior":
                                IOverride = new (IOverrideClassName)(IOverrideInfo.name, IOverrideInfo.value);
                                break;
                            case "SetController":

                                var arg = [];

                                IOverrideInfo.arguments.forEach(function (item) {
                                    var htmlElement = document.getElementById(item);
                                    if (!htmlElement)
                                        throw new Error("not querySelector id=" + item);

                                    arg.push(InstanceManager.getInstance(htmlElement));
                                });

                                //for (var i = 0; i < IOverrideInfo.arguments.length; i++) {
                                //    var htmlElement = document.getElementById(IOverrideInfo.arguments[i]);
                                //    if (!htmlElement)
                                //        throw new Error("not querySelector id=" + IOverrideInfo.arguments[i]);

                                //    arg.push(InstanceManager.getInstance(htmlElement));
                                //}

                                IOverride = new (IOverrideClassName)(eval(IOverrideInfo.controller), arg);
                                break;
                            case "SetStyle":
                            case "SetProperty":
                            case "SetEventHandler":
                                var htmlElement = document.getElementById(IOverrideInfo.target);

                                if (!htmlElement)
                                    htmlElement = document.querySelector(IOverrideInfo.target);

                                if (!htmlElement)
                                    throw new Error("not querySelector =" + IOverrideInfo.target);

                                var undoRedoEditor = InstanceManager.getInstance(htmlElement);

                                if (type == "SetEventHandler") {
                                    var infoObject = getConfig("infoObject");
                                    IOverride = new (IOverrideClassName)(undoRedoEditor, IOverrideInfo.name, IOverrideInfo.handler);
                                }
                                else if (type == "SetProperty") {

                                    if (IOverrideInfo.onlyFirst && undoRedoEditor[IOverrideInfo.name].replace(new RegExp(String.fromCharCode(8203), "g"), "").length > 0)
                                        continue;

                                    IOverride = new (IOverrideClassName)(undoRedoEditor, IOverrideInfo.name, IOverrideInfo.value, IOverrideInfo.onlyFirst);
                                }
                                else if (type == "SetStyle")
                                    IOverride = new (IOverrideClassName)(undoRedoEditor, IOverrideInfo.name, IOverrideInfo.value);

                                break;
                            case "RemoveChild":
                                var htmlElement = document.getElementById(IOverrideInfo.target);

                                if (!htmlElement)
                                    htmlElement = document.querySelector(IOverrideInfo.target);

                                if (!htmlElement)
                                    throw new Error("not querySelector =" + IOverrideInfo.target);

                                var undoRedoEditor = InstanceManager.getInstance(htmlElement);
                                IOverride = new (IOverrideClassName)(undoRedoEditor);

                                break;
                            case "RemoveClass":

                                getElementByIdOrSelectorAll(IOverrideInfo.target).forEach(function (i) {
                                    IOverride = new (IOverrideClassName)(InstanceManager.getInstance(i), IOverrideInfo.name);                                   
                                });                                 

                                break;                                  
                            default:

                                break;
                        }

                        IOverride.apply();

                        if (IOverrideInfo.onlyFirst)
                            IOverrideInfo.destroy = true;
                        else
                            initOverrides.push(IOverride);

                        if (IOverride.target && validateEditorList.indexOf(IOverride.target) == -1)
                            validateEditorList.push(IOverride.target);
                    }
                }


                (function validate() {
                    for (var i = 0; i < validateEditorList.length; i++) {
                        validateEditorList[i].validateProperties();
                        validateEditorList[i].validateNow();
                    }
                })();
            },
            hasOwnBaseOn(stateName, compareBaseOn){
                var state = StateManager.states[stateName];

                while(state.basedOn != compareBaseOn){

                    if(!state.basedOn)
                        return false;

                    state = StateManager.states[state.basedOn];
                }

                return true;      
            }

        }

        return StateManager;
    }());

    var MutationObserverManager = (function () {

        var observer;
        var compositionstartFlag = false;
        var compositionRange;

        var MutationObserverManager = {
            init: function () {
                observer = new MutationObserver(function (mutations, observer) {
                    //debugger
                    var state = StateManager.currentState;

                    if (!state.enabled)
                        return;

                    console.log("MutationObserver start");

                    mutations.forEach(function (mutation) {
                        console.log(mutation);

                        var override;

                        switch (mutation.type) {

                            case "characterData":
                                var override = new SetProperty(InstanceManager.getInstance(mutation.target), "textContent", mutation.target.textContent);
                                override._oldValue = mutation.oldValue
                                state.addOverride(override);

                                break;
                            case "childList":

                                if (mutation.addedNodes.length > 0) {

                                    Array.prototype.slice.call(mutation.addedNodes).forEach(function (addedNode) {

                                        var addedNodeInstance = InstanceManager.getInstance(addedNode);
                                        var parentInstance = InstanceManager.getInstance(mutation.target);
                                        var childIndex = -1;

                                        parentInstance._validateChildNodes();

                                        if (addedNode.parentNode)
                                            childIndex = addedNodeInstance.childNodeIndex;
                                        else {
                                            if (mutation.nextSibling && mutation.nextSibling.parentNode)
                                                childIndex = InstanceManager.getInstance(mutation.nextSibling).childNodeIndex - 1;
                                            else if (mutation.previousSibling && mutation.previousSibling.parentNode)
                                                childIndex = InstanceManager.getInstance(mutation.previousSibling).childNodeIndex + 1;
                                        }

                                        if (childIndex >= 0 && addedNode.parentNode) {

                                            var parentInstance = InstanceManager.getInstance(addedNode.parentNode)
                                            parentInstance.addChildAt(addedNodeInstance, childIndex);
                                        }
                                    });
                                }
                                else if (mutation.removedNodes.length > 0) {

                                    Array.prototype.slice.call(mutation.removedNodes).forEach(function (removedNode) {

                                        //if (removedNode.nodeType == Node.ELEMENT_NODE) {

                                        var removedNodeInstance = InstanceManager.getInstance(removedNode);
                                        var parentInstance = InstanceManager.getInstance(mutation.target);

                                        if (parentInstance && parentInstance.htmlElement.localName == "html")
                                            return;

                                        var childIndex = -1;

                                        parentInstance._validateChildNodes();

                                        if (mutation.nextSibling && mutation.nextSibling.parentNode)
                                            childIndex = InstanceManager.getInstance(mutation.nextSibling).childNodeIndex;
                                        else if (mutation.previousSibling && mutation.previousSibling.parentNode)
                                            childIndex = InstanceManager.getInstance(mutation.previousSibling).childNodeIndex + 1;
                                        else
                                            parentInstance.childNodes.length - 1;
                                        //else
                                        //    childIndex = 0;

                                        //if (childIndex >= 0) {
                                        override = new RemoveChild(removedNodeInstance, parentInstance);
                                        override._oldIndex = childIndex;
                                        state.addOverride(override);
                                        //}


                                        //}

                                    });
                                }

                                break;
                            case "attributes":
                                break;

                            default:
                                return;
                        }

                    });

                    console.log("MutationObserver end");
                });

                this.observe();
            },
            observe: function () {

                if (!observer)
                    return;

                observer.observe(document.documentElement, {
                    attributes: false,
                    characterData: true,
                    childList: true,
                    subtree: true,
                    attributeOldValue: false,
                    characterDataOldValue: true
                });

                document.documentElement.addEventListener("compositionstart", function (event) {
                    compositionstartFlag = true;

                    var selection = window.getSelection();
                    var focusNode

                    if (selection.rangeCount > 0)
                        focusNode = window.getSelection().getRangeAt(0).commonAncestorContainer;
                    else
                        focusNode = window.getSelection().focusNode;


                    if (focusNode && focusNode.nodeType == Node.TEXT_NODE)
                        focusNode = focusNode.parentNode;

                    StateManager.currentState.startBatchMode();

                    compositionRange = new SetRange(InstanceManager.getInstance(focusNode));

                    console.log("startBatchMode");


                }, false);

                document.documentElement.addEventListener("compositionend", function (event) {
                    compositionstartFlag = false;

                    if (compositionRange) {
                        compositionRange.saveStartEndOffset();
                        compositionRange = undefined;
                    }

                    StateManager.currentState.endBatchMode();
                    console.log("endBatchMode");
                }, false);


            },
            disconnect: function () {
                if (!observer)
                    return;

                observer.disconnect();
            }
        }

        return MutationObserverManager;
    }());


    //Controller

    var DateTimeController = (function () {

        var DateTimeController = function (year /** EditorHTMLElement **/, month /** EditorHTMLElement **/, date /** EditorHTMLElement **/, day /** EditorHTMLElement **/, hours /** EditorHTMLElement **/, minutes /** EditorHTMLElement **/) {

            this.dateTime;

            this.year = year;
            this.month = month;
            this.date = date;
            this.day = day;
            this.hours = hours;
            this.minutes = minutes;

            this.initialize();
        };

        DateTimeController.prototype = {
            initialize: function () {
                //this.dateTime = new Date();

                //this.year.htmlElement.value = this.dateTime.getFullYear() - 1911;
                //this.month.htmlElement.value = this.dateTime.getMonth() + 1;
                //this.date.htmlElement.value = this.dateTime.getDate();
                //this.day.htmlElement.value = this.dateTime.getDay();
                //this.hours.htmlElement.value = this.dateTime.getHours();
                //this.minutes.htmlElement.value = this.dateTime.getMinutes();

                // min = "1" max= "5"
            }
        }

        return DateTimeController;

    }());

    //未完成
    var SignLog = (function () {

        var SignLog = function (signEditor /** SignEditor **/, signType, startOffset, endOffset, includeHtml) {

            this.objectId = signEditor.htmlElement.getAttribute("id");
            this.containerId = signEditor.parent.htmlElement.getAttribute("id");
            this.exectime = signEditor.exectime;
            this.signType = signType;//簽核類型
            this.signName = signEditor.signName;//物件類型
            this.startOffset = startOffset;
            this.endOffset = endOffset;

            if (includeHtml)
                this.objectHtml = new XMLSerializer().serializeToString(signEditor.htmlElement);
        };

        SignLog.prototype = {

        }

        return SignLog;
    }());

    //Behavior 

    var Behavior = (function () {

        var contentUneditableImpl = {
        }

        var Behavior = function () {
            //editor
            this.increaseIndent = EditorIncreaseIndentImpl;
            this.decreaseIndent = EditorDecreaseIndentImpl;
            this.addListItem = EditorAddListItemImpl;
            this.insertText = EditorInsertTextImpl;
            this.delete = EditorDeleteImpl;
            this.backspace = EditorBackspaceImpl;
            this.deleteSelectedContents = EditorDeleteSelectedContentsImpl;
            this.copy = EditorCopyImpl;
            this.cut = EditorCutImpl;
            this.paste = EditorPasteImpl;
            this.bold = EditorBoldImpl;
            this.link = EditorLinkImpl;
            this.color = EditorColorImpl;
            this.underline = EditorUnderlineImpl;
            this.sup = EditorSupImpl;
            this.sub = EditorSubImpl;
            this.insertTable = EditorInsertTableImpl;
            this.symbol = EditorSymbolImpl;

            //sign
            this.addChild = SignAddChildImpl;
            this.removeChild = SignRemoveChildImpl;
            contentUneditableImpl.mark = this.mark = SignMarkImpl;

            //this.keyInText = SignInsertTextImpl;
            //SignInsertTextImpl
            //SignAddListItemImpl
            //SignDeleteImpl
            //SignDeleteSelectedContentsImpl
        };

        Behavior.prototype = {
            isUneditable: function (name) {
                return contentUneditableImpl[name] != undefined;
            }
        }

        return Behavior;
    }());


    //EditorImpl
    var EditorIncreaseIndentImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        var autoList = InstanceManager.getInstance(document.querySelector("#" + contenteditable_id)).autoList;

        if (autoList != "Numbered")
            return false;

        switch (editorHTMLElement.name) {
            case "ListItemTextBlock":

                var listItem = InstanceManager.getInstance(editorHTMLElement.parent, ListItem);

                if (listItem.childNodeIndex > 0) {
                    var orderedList = listItem.parent;

                    if (!orderedList.isNumberedFormatEnd) {
                        var focusOffset = listItem.textBlock.focusOffset;
                        var listItemIndex = listItem.childNodeIndex;
                        var numberedFormat = getConfig("numberedFormat", contenteditable_id);
                        var prevItem = orderedList.getChildAt(listItemIndex - 1);
                        var focusEditor;

                        var newOrderedList = InstanceManager.getInstance(undefined, OrderedList);
                        newOrderedList.numberedFormat = numberedFormat;
                        var newOrderedListItem = newOrderedList.getChildAt(0);

                        orderedList.addChildAt(newOrderedList, listItemIndex);

                        orderedList.removeChild(listItem);

                        orderedList.validateNow();
                        focusEditor = newOrderedListItem.textBlock;
                        //focusEditor.textContent = editorHTMLElement.deleteContents(0); //old
                        //new
                        focusEditor.removeChildAll();
                        for (var i = editorHTMLElement.childNodes.length - 1; i >= 0; i--) {

                            focusEditor.addChildAt(editorHTMLElement.childNodes[i], 0);
                        }
                        //


                        focusEditor.focusOffset = focusOffset;
                        focusEditor.validateProperties();
                        focusEditor.validateNow();
                    }
                }

                break;
            case "Paragraph":
                break;
            default:
                return EditorIncreaseIndentImpl(contenteditable_id, editorHTMLElement.parent /** EditorHTMLElement **/);
        }

        return false;
    }

    var EditorDecreaseIndentImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        var autoList = InstanceManager.getInstance(document.querySelector("#" + contenteditable_id)).autoList;

        if (autoList != "Numbered" && autoList != "Free")
            return false;

        switch (editorHTMLElement.name) {
            case "ListItemTextBlock":

                var listItem = InstanceManager.getInstance(editorHTMLElement.parent, ListItem);
                var listItemChildIndex = listItem.childNodeIndex;
                var orderedList = listItem.parent;

                if (orderedList.level > 1 || autoList == "Free") {//未完成

                    var focusOffset = listItem.textBlock.focusOffset;

                    if (listItemChildIndex == orderedList.children.length - 1) {
                        orderedList.removeChild(listItem);
                        orderedList.parent.addChildAt(listItem, orderedList.childNodeIndex + 1);
                    }
                    else {
                        var numberedFormat = getConfig("numberedFormat", contenteditable_id);

                        var newOrderedList = InstanceManager.getInstance(undefined, OrderedList);
                        newOrderedList.numberedFormat = numberedFormat;
                        newOrderedList.removeChild(newOrderedList.getChildAt(0));

                        var items = [];

                        for (var i = orderedList.children.length - 1; i >= listItemChildIndex + 1; i--) {
                            items.splice(0, 0, orderedList.getChildAt(i));
                        }

                        for (var j = 0; j < items.length; j++) {

                            var item = items[j];

                            item.parent.removeChild(item);
                            newOrderedList.addChild(item);
                        }

                        orderedList.removeChild(listItem);
                        orderedList.parent.addChildAt(listItem, orderedList.childNodeIndex + 1);
                        orderedList.parent.addChildAt(newOrderedList, listItem.childNodeIndex + 1);

                    }

                    if (orderedList.children.length == 0)
                        orderedList.parent.removeChild(orderedList);

                    orderedList.validateNow();
                    listItem.textBlock.focusOffset = focusOffset;
                    listItem.textBlock.validateProperties();
                }

                break;
            case "Paragraph":
                break;
            default:
                return EditorDecreaseIndentImpl(contenteditable_id, editorHTMLElement.parent /** EditorHTMLElement **/);
        }

        return false;
    }

    //如果有子結點(如:粗體)這裡要調
    var EditorAddListItemImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, opt) {

        if (!window.getSelection().isCollapsed)
            BehaviorManager.getFunction("delete")(contenteditable_id, editorHTMLElement);

        var autoList = InstanceManager.getInstance(document.querySelector("#" + contenteditable_id)).autoList;

        if (autoList != "Numbered" && autoList != "Free")
            return false;

        var defaultOptions = {
            newInstanceFunction: undefined
        };

        var options = defaultOptions;

        for (var key in opt) {
            if (options.hasOwnProperty(key))
                options[key] = opt[key];
        }

        var numberedFormat = getConfig("numberedFormat", contenteditable_id);
        var orderedList;
        var addListItemIndex = 0;
        var listItem;
        var endOffset;

        while (editorHTMLElement.name != "ListItemTextBlock" && editorHTMLElement.name != "ParagraphTextBlock") {

            editorHTMLElement = editorHTMLElement.parent;
        }

        var startEndOffset = editorHTMLElement.getStartEndOffset();

        switch (editorHTMLElement.name) {
            case "ListItemTextBlock":
                orderedList = editorHTMLElement.parent.parent;
                addListItemIndex = InstanceManager.getInstance(editorHTMLElement.parent, ListItem).childNodeIndex + 1;
                listItem = InstanceManager.getInstance(undefined, ListItem);
                listItem.serialNumberEnabled = editorHTMLElement.parent.serialNumberEnabled;
                listItem.setStyle("marginLeft", editorHTMLElement.parent.getStyle("marginLeft"))

                orderedList.addChildAt(listItem, addListItemIndex);
                orderedList.validateNow();
                break;
            case "ParagraphTextBlock":

                var editorOrderedList = editorHTMLElement.htmlElement.querySelector("[data-class=OrderedList]");
                orderedList = InstanceManager.getInstance(editorOrderedList, OrderedList);

                if (editorOrderedList) {
                    listItem = InstanceManager.getInstance(undefined, ListItem);
                    orderedList.addChildAt(listItem, 0);
                    orderedList.validateNow();
                }
                else {
                    orderedList.numberedFormat = numberedFormat;
                    editorHTMLElement.addChild(orderedList);
                    editorHTMLElement.validateNow();
                    listItem = orderedList.getChildAt(0);
                }

                break;
        }

        endOffset = editorHTMLElement.endFocusOffset;

        if (listItem) {

            var startOffset = startEndOffset.startOffset;

            //if (autoList == "Numbered")
            //    startOffset = startEndOffset.startOffset;
            //else if (autoList == "Free" && orderedList.level == 1 && editorHTMLElement.name == "ParagraphTextBlock") 
            //    editorHTMLElement.parent.setStyle("marginLeft", "32.5pt");

            var childEditorList = editorHTMLElement.getChildEditorList(startOffset, endOffset, function filterNode(node) {

                var parentEditor = InstanceManager.getInstance(node.parentNode);

                if (parentEditor.htmlElement.getAttribute("contentEditable") != "false" && (editorHTMLElement.name != "ParagraphTextBlock" || parentEditor.name != "ListItemTextBlock"))
                    return NodeFilter.FILTER_ACCEPT;
                else
                    return NodeFilter.FILTER_REJECT;
            });

            if (childEditorList.length > 0) {

                if (startOffset >= 0) {
                    for (var i = 0; i < childEditorList.length; i++) {
                        var info = childEditorList[i];
                        var parentEditor = InstanceManager.getInstance(info.instance.htmlElement.parentNode);

                        if (parentEditor.isEmpty())
                            break;

                        var insertText = info.instance.deleteContents(info.localStartOffset, info.localEndOffset);

                        if (parentEditor.isEmpty()) {
                            parentEditor.textContent = String.fromCharCode(8203);
                            parentEditor.validateProperties();
                        }

                        var newEditor;

                        //測試中
                        if (editorHTMLElement.name == "ParagraphTextBlock" && parentEditor.name == "TextBlock")
                            newEditor = InstanceManager.getInstance(undefined, text);
                        else if (parentEditor == editorHTMLElement)
                            newEditor = InstanceManager.getInstance(undefined, text);
                        else
                            newEditor = InstanceManager.getInstance(InstanceManager.clone(parentEditor.htmlElement, true));

                        if (options.newInstanceFunction)
                            newEditor = options.newInstanceFunction(newEditor)

                        newEditor.textContent = insertText;
                        newEditor.validateProperties();


                        //避免insert到8203前面
                        if (listItem.textBlock.isEmpty()) {

                            listItem.textBlock.focusToEnd();
                            listItem.textBlock.validateProperties();
                        }



                        debugger
                        listItem.textBlock.insertContents(newEditor, getConfig("color"));

                        // listItem.textBlock.validateProperties();
                        //  listItem.textBlock.focusOffset = listItem.textBlock.textContent.length;
                        //listItem.textBlock.validateProperties();
                    }
                }
            }

            //if (listItem.textBlock.isEmpty())
            //    listItem.textBlock.focusOffset = 1;
            //else
            //    listItem.textBlock.focusOffset = 0;

            listItem.textBlock.focusOffset = 1;
            listItem.textBlock.validateProperties();

            editorHTMLElement._invalidatePropertiesFlag = true;
            editorHTMLElement.validateProperties();

            debugger
        }

        return false;
    }

    var EditorDeleteImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        if (!BehaviorManager.getFunction("deleteSelectedContents")()) {
            var startEndOffset = editorHTMLElement.getStartEndOffset();
            var startOffset = startEndOffset.startOffset;
            var endOffset = startEndOffset.endOffset;

            if (endOffset > 0) {

                var deleteOffset = endOffset - startOffset;

                // if (deleteOffset == 0 && startOffset < editorHTMLElement.textContent.length)
                //  deleteOffset = 1;

                if (deleteOffset > 0) {
                    editorHTMLElement.focusOffset = startOffset;
                    editorHTMLElement.deleteContents(editorHTMLElement.focusOffset, editorHTMLElement.focusOffset + deleteOffset)
                    editorHTMLElement.validateProperties();
                }
            }

        }

        return false;
    }

    var EditorBackspaceImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {
        debugger
        if (!BehaviorManager.getFunction("deleteSelectedContents")()) {

            var startEndOffset = editorHTMLElement.getStartEndOffset();
            var startOffset = startEndOffset.startOffset;
            var endOffset = startEndOffset.endOffset;


            //var range = window.getSelection().getRangeAt(0);
            //var startOffset = range.startOffset;
            //var endOffset = range.endOffset;
            //console.log(endOffset)

            //刪字
            //if ((endOffset > 0 && !editorHTMLElement.isEmpty()) &&
            //    (startOffset != 1 || editorHTMLElement.textContent.charAt(0) != String.fromCharCode(8203))) {

            //還有問題斜體或粗體的刪除(有style的刪除)
            if ((endOffset > 0 && !editorHTMLElement.isEmpty()) &&
                (endOffset > startOffset || startOffset != 1 || editorHTMLElement.textContent.charAt(0) != String.fromCharCode(8203))) {

                if (startOffset == endOffset)
                    startOffset = startOffset - 1;

                //if (startOffset == 0)
                //    startOffset = 1;

                editorHTMLElement.focusOffset = startOffset;
                editorHTMLElement.deleteContents(startOffset, endOffset)
                editorHTMLElement.validateProperties();
            }
            else if (editorHTMLElement.parent.name == "ListItem") {//往上移


                var listItem = editorHTMLElement.parent;

                if (listItem.childIndex == 0 && !listItem.parent.deleteEnabled)
                    return false;

                var prevChildIndex = listItem.childNodeIndex - 1;
                var listItemOwner = listItem.parent;
                var moveTextContent = editorHTMLElement.textContent;

                listItemOwner.removeChild(listItem);

                var focusEditor = (function removeEmptyOrderedListAndReturnFocusEditor(editorHTMLElement, index) {

                    var editor;
                    var parent = editorHTMLElement.parent;

                    if (editorHTMLElement.name == "OrderedList") {

                        if (editorHTMLElement.children.length > 0) {

                            if (index >= 0) {
                                var prevItem = editorHTMLElement.getChildAt(index);

                                if (prevItem.name == "ListItem")
                                    editor = prevItem.textBlock;
                                else {
                                    index = prevItem.children.length - 1;
                                    return removeEmptyOrderedListAndReturnFocusEditor(prevItem, index);
                                }
                            }
                            else {
                                index = editorHTMLElement.childNodeIndex - 1;
                                return removeEmptyOrderedListAndReturnFocusEditor(editorHTMLElement.parent, index);
                            }

                        }
                        else {
                            index = editorHTMLElement.childNodeIndex - 1;
                            editorHTMLElement.parent.removeChild(editorHTMLElement);
                            return removeEmptyOrderedListAndReturnFocusEditor(parent, index);
                        }

                    }
                    else if (editorHTMLElement.name == "ParagraphTextBlock")
                        editor = editorHTMLElement.textNodeBlock;
                    else
                        editor = editorHTMLElement;

                    return editor;

                })(listItemOwner, prevChildIndex);

                if (focusEditor) {

                    //var focusOffset = focusEditor.textContent.length;

                    //if (moveTextContent.replace(String.fromCharCode(8203), "").length > 0)
                    //    focusEditor.textContent = focusEditor.textContent + moveTextContent;

                    //focusEditor.focusOffset = focusOffset;
                    //focusEditor.validateProperties();

                    if (moveTextContent.replace(String.fromCharCode(8203), "").length > 0)
                        focusEditor.textContent = focusEditor.textContent + moveTextContent;

                    focusEditor.focusToEnd();
                    focusEditor.validateProperties();
                }
            }
        }

        return false;
    }

    var EditorDeleteSelectedContentsImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var isDelete = false;

        if (selection.rangeCount > 0) {
            var commonAncestorContainer = range.commonAncestorContainer;

            //if (commonAncestorContainer.nodeType == commonAncestorContainer.ELEMENT_NODE &&
            //    commonAncestorContainer.getAttribute("data-class") != undefined) {

            //if (commonAncestorContainer.nodeType == commonAncestorContainer.ELEMENT_NODE) {
            //    var editorHTMLElement = InstanceManager.getInstance(commonAncestorContainer);
            //    editorHTMLElement.deleteSelectedContents();
            //    isDelete = true;
            //}


            var startContainer = range.startContainer;
            var endContainer = range.endContainer;

            if (startContainer.nodeType == Node.TEXT_NODE)
                startContainer = range.startContainer.parentNode;

            if (endContainer.nodeType == Node.TEXT_NODE)
                endContainer = range.endContainer.parentNode;

            if (startContainer != endContainer) {

                var editorHTMLElement = InstanceManager.getInstance(commonAncestorContainer);
                editorHTMLElement.deleteSelectedContents();
                isDelete = true;
            }
        }

        return isDelete;
    }

    var EditorCopyImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, clipboardEvent) {

        if (clipboardEvent && clipboardEvent.clipboardData && clipboardEvent.clipboardData.setData)
            clipboardEvent.clipboardData.setData("text", window.getSelection().toString());
        else
            document.execCommand('Copy');
    }

    var EditorCutImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, clipboardEvent) {

        if (clipboardEvent && clipboardEvent.clipboardData && clipboardEvent.clipboardData.setData)
            clipboardEvent.clipboardData.setData("text", window.getSelection().toString());
        else
            document.execCommand('Copy');

        BehaviorManager.getFunction("delete")(contenteditable_id, editorHTMLElement);

        return false;
    }

    var EditorPasteImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, clipboardEvent) {

        /*var startEndOffset = editorHTMLElement.getStartEndOffset();
        var startOffset = startEndOffset.startOffset;
        var endOffset = startEndOffset.endOffset;

        if (startOffset != endOffset) {
            editorHTMLElement.focusOffset = startOffset;
            editorHTMLElement.deleteContents(startOffset, endOffset);
            editorHTMLElement.validateProperties();
        }*/
        debugger

        if (editorHTMLElement.htmlElement.getAttribute("contentEditable") != "false") {

            if (!window.getSelection().isCollapsed)
                BehaviorManager.getFunction("delete")(contenteditable_id, editorHTMLElement);

            var text = clipboardEvent.clipboardData ? clipboardEvent.clipboardData.getData("text") : window.clipboardData.getData("text");
            editorHTMLElement.insertContents(text, getConfig("color"));
        }


        return false;
    }

    var EditorInsertTextImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, value) {

        editorHTMLElement.insertContents(value, getConfig("color"))
        return false;
    }

    var EditorInsetHTMLElementBase = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, opt) {

        var defaultOptions = {
            editorClassName: undefined,
            newInstanceFunction: function newInstanceFunction(insertText) {

                var newEditor = InstanceManager.getInstance(undefined, text);

                newEditor.textContent = insertText;
                newEditor.validateProperties();

                return newEditor;
            },
            updateInstanceFunction: undefined,
            getStartEndOffsetFunction: undefined,
            getInsertTextFunction: undefined,
            refreshFocusOffsetFunction: function () {
                window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.nextSibling
            },
            textToDisplay: undefined,
            logHandler: undefined,
            undoMode: true
        };

        var options = defaultOptions;

        for (var key in opt) {
            if (options.hasOwnProperty(key))
                options[key] = opt[key];
        }

        var selection = window.getSelection();

        if (selection.rangeCount > 0) {

            var range = selection.getRangeAt(0)
            var commonAncestorContainer = range.commonAncestorContainer;
            var ancestorEditor = editorHTMLElement;

            if (commonAncestorContainer.nodeType == commonAncestorContainer.ELEMENT_NODE)
                ancestorEditor = InstanceManager.getInstance(range.commonAncestorContainer);

            var editorClassNameHTMLElement;
            var isUndo = (function () {

                var currentEditorHTMLElement = editorHTMLElement;

                if (options.editorClassName != undefined) {

                    while (currentEditorHTMLElement) {

                        if (currentEditorHTMLElement.name == options.editorClassName) {
                            editorClassNameHTMLElement = currentEditorHTMLElement;
                            return true;
                        }


                        currentEditorHTMLElement = currentEditorHTMLElement.parent;
                    }
                }

                return false;

            })();


            //node本身 無跨物件
            if (isUndo) {
                //if (options.editorClassName != undefined && editorHTMLElement.name == options.editorClassName) {//未完成 
                //if (ancestorEditor == editorHTMLElement) {//未完成 
                debugger
                if (options.updateInstanceFunction)
                    options.updateInstanceFunction(editorHTMLElement);
                else {

                    var startEndOffset = editorHTMLElement.getStartEndOffset();

                    if (startEndOffset.startOffset == startEndOffset.endOffset) {//insertText

                        if (options.getInsertTextFunction) {
                            var insertText = options.getInsertTextFunction();

                            //var newEditor = options.newInstanceFunction(insertText);
                            editorHTMLElement.insertContents(insertText, getConfig("color"));
                        }
                    }
                    else if (options.undoMode) {//undo 成text, 但要保留其他樣式 未完成

                        //if (editorHTMLElement.parent.name == "TextBlock")
                        opt.editorClassName = "text";
                        // else
                        //  opt.editorClassName = editorHTMLElement.parent.name;

                        delete opt.newInstanceFunction;
                        debugger
                        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorClassNameHTMLElement.parent, opt);
                    }

                    if (options.refreshFocusOffsetFunction)
                        editorHTMLElement.focusOffset = options.refreshFocusOffsetFunction(startEndOffset.startOffset, startEndOffset.endOffset);
                }
            }
            else {
                var originalStartEndOffset = ancestorEditor.getStartEndOffset();
                var changeStartEndOffset = options.getStartEndOffsetFunction ? options.getStartEndOffsetFunction(ancestorEditor) : originalStartEndOffset;

                var startOffset = changeStartEndOffset.startOffset;
                var endOffset = changeStartEndOffset.endOffset;

                if (range.startOffset == 0 && originalStartEndOffset.startOffset > startOffset) {
                    if (ancestorEditor.getChildEditorByFocusOffset().contenteditable == false)
                        return false;
                }
                debugger

                var childEditorList = ancestorEditor.getChildEditorList(startOffset, endOffset);
                //foucs還要處理 text 會被父結點 focus蓋掉
                if (childEditorList.length > 0) {
                    if (startOffset >= 0) {

                        var prevNewEditor;

                        for (var i = 0; i < childEditorList.length; i++) {
                            var info = childEditorList[i];

                            if (info.instance.name == "text" && info.instance.htmlElement.parentNode.getAttribute("contentEditable") != "false") {

                                var insertText = "";

                                if (info.localEndOffset > info.localStartOffset)
                                    insertText = info.instance.deleteContents(info.localStartOffset, info.localEndOffset);

                                if (options.getInsertTextFunction)
                                    insertText = options.getInsertTextFunction(info);

                                if (insertText.length > 0) {

                                    //if (i > 0 && childEditorList[i - 1].newEditor &&
                                    //    childEditorList[i].instance.htmlElement.previousSibling == childEditorList[i - 1].newEditor.htmlElement) {



                                    if (i > 0 && ((childEditorList[i - 1].newEditor &&
                                        info.instance.htmlElement.previousSibling == childEditorList[i - 1].newEditor.htmlElement) ||
                                        (!childEditorList[i - 1].newEditor &&
                                            info.instance.htmlElement.previousSibling == childEditorList[i - 1].instance.htmlElement))) {

                                        //var prevEditor = childEditorList[i - 1].newEditor;

                                        //if (options.textToDisplay)
                                        //    prevEditor.textContent = options.textToDisplay;
                                        //else
                                        //    prevEditor.textContent += insertText;

                                        //prevEditor.focusOffset = prevEditor.textContent.length;
                                        //prevEditor.validateProperties();

                                        if (options.textToDisplay)
                                            prevNewEditor.textContent = options.textToDisplay;
                                        else
                                            prevNewEditor.textContent += insertText;

                                        prevNewEditor.focusOffset = prevNewEditor.textContent.length;
                                        prevNewEditor.validateProperties();
                                    }
                                    else {
                                        var newEditor = options.newInstanceFunction(insertText, info);

                                        if (newEditor) {

                                            info.instance.focusOffset = info.localStartOffset;
                                            info.instance.validateProperties();

                                            if (options.textToDisplay)
                                                newEditor.textContent = options.textToDisplay;

                                            info.newEditor = newEditor;
                                            prevNewEditor = info.newEditor

                                            var insertContainerEditor = InstanceManager.getInstance(info.instance.htmlElement.parentNode);

                                            if (newEditor.isStack)
                                                insertContainerEditor = editorHTMLElement;
                                            else if (newEditor.name == "text") {

                                                //while (!insertContainerEditor.autoList) {
                                                //    insertContainerEditor = InstanceManager.getInstance(insertContainerEditor.htmlElement.parentNode);
                                                //}        

                                                insertContainerEditor = editorHTMLElement;
                                            }

                                            insertContainerEditor.insertContents(newEditor, getConfig("color"));
                                        }
                                    }
                                }
                            }
                        }

                        if (options.refreshFocusOffsetFunction)
                            ancestorEditor.focusOffset = options.refreshFocusOffsetFunction(startOffset, endOffset);
                    }
                }
                else if (startOffset == endOffset) {//focus在最後面
                    if (options.getInsertTextFunction) {
                        var insertText = options.getInsertTextFunction();

                        var newEditor = options.newInstanceFunction(insertText);

                        ancestorEditor.focusOffset = startOffset;
                        ancestorEditor.validateProperties();

                        ancestorEditor.insertContents(newEditor, getConfig("color"));

                        if (options.refreshFocusOffset)
                            ancestorEditor.focusOffset = startOffset;
                    }
                }
                if (options.logHandler)
                    options.logHandler(ancestorEditor, childEditorList, changeStartEndOffset);

                //old
                /*
                if (startOffset >= 0) {

                    var deleteText = ""
                    if (endOffset > startOffset)
                        deleteText = editorHTMLElement.deleteContents(startOffset, endOffset);

                    var newEditor = options.newInstanceFunction(deleteText);

                    editorHTMLElement.focusOffset = startOffset;
                    editorHTMLElement.validateProperties();

                    editorHTMLElement.insertContents(newEditor, getConfig("color"));

                    if (options.refreshFocusOffset)
                        editorHTMLElement.focusOffset = startOffset;
                }
               */
            }
        }



        return false;
    }

    var EditorBoldImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "strong",
            newInstanceFunction: function newInstanceFunction(deleteText) {

                var newEditor = InstanceManager.getInstance(undefined, strong);

                newEditor.textContent = deleteText;
                newEditor.validateProperties();

                return newEditor;
            }
        });

        //document.execCommand("Bold"); 

        return false;
    }

    var EditorSupImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "sup",
            newInstanceFunction: function newInstanceFunction(deleteText) {

                var newEditor = InstanceManager.getInstance(undefined, sup);

                newEditor.textContent = deleteText;
                newEditor.validateProperties();

                return newEditor;
            }
        });
    }

    var EditorSubImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "sub",
            newInstanceFunction: function newInstanceFunction(deleteText) {

                var newEditor = InstanceManager.getInstance(undefined, sub);

                newEditor.textContent = deleteText;
                newEditor.validateProperties();

                return newEditor;
            }
        });
    }

    var EditorLinkImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, url, textToDisplay, title) {

        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "a",
            newInstanceFunction: function (deleteText) {

                var newEditor = InstanceManager.getInstance(undefined, a);
                //newEditor.textContent = textToDisplay || deleteText;//未完成
                newEditor.textContent = deleteText;//未完成
                newEditor.url = url;
                newEditor.title = title || textToDisplay;
                newEditor.validateProperties();

                return newEditor;

            }, updateInstanceFunction: function (editorHTMLElement) {

                if (url == "" || url == undefined) {

                    var textNodeInstance = InstanceManager.getInstance(undefined, text);
                    textNodeInstance.textContent = editorHTMLElement.textContent;

                    editorHTMLElement.textContent = "";
                    editorHTMLElement.parent.focusOffset = editorHTMLElement.parent.getStartEndOffset().startOffset - editorHTMLElement.getStartEndOffset().startOffset;
                    editorHTMLElement.parent.validateProperties();
                    editorHTMLElement.parent.insertContents(textNodeInstance, getConfig("color"));
                }
                else {
                    editorHTMLElement.textContent = textToDisplay;
                    editorHTMLElement.url = url;
                    editorHTMLElement.title = title || textToDisplay;
                }

                editorHTMLElement.validateProperties();
            }, getInsertTextFunction: function () {

                return title || textToDisplay;
            },
            textToDisplay: textToDisplay
        });
    }

    var EditorUnderlineImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {
        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "Underline",
            newInstanceFunction: function (deleteText) {

                var newEditor = InstanceManager.getInstance(undefined, Underline);
                newEditor.textContent = deleteText;
                newEditor.validateProperties();

                return newEditor;
            }
        });
    }

    var EditorColorImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, color) {

        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            newInstanceFunction: function (deleteText) {
                var newEditor = InstanceManager.getInstance(undefined, span);
                newEditor.setStyle("color", color);
                newEditor.textContent = deleteText;
                newEditor.validateProperties();

                return newEditor;
            }
        });
    }

    var EditorInsertTableImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, maxRows, maxColumns) {

        if (maxRows > 0 && maxColumns > 0) {
            debugger
            var resizeTableBlock = InstanceManager.getInstance(undefined, ResizeTableBlock);
            var resizeTable = resizeTableBlock.resizeTable;

            for (var i = 0; i < maxRows; i++) {

                var resizeTr = InstanceManager.getInstance(undefined, ResizeTr);
                resizeTable.addChild(resizeTr);

                for (var j = 0; j < maxColumns; j++) {

                    var resizeTd = InstanceManager.getInstance(undefined, ResizeTd);
                    resizeTr.addChild(resizeTd);
                }
            }

            editorHTMLElement.insertContents(resizeTableBlock);

        }


        return false;
    }

    var EditorSymbolImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        debugger
        //BehaviorManager.getFunction("addListItem")(contenteditable_id, editorHTMLElement);

        //EditorDecreaseIndentImpl
        //var orderedList = editorHTMLElement.parent.parent;

        switch (editorHTMLElement.name) {
            case "ListItemTextBlock":
                var listItem = editorHTMLElement.parent;
                var orderedList = listItem.parent;

                if (orderedList.level == 1) {
                    if (orderedList.parent.parent.paragraphName.isEmpty() && !listItem.serialNumberEnabled)
                        listItem.setStyle("marginLeft", "32pt");
                    else
                        listItem.setStyle("marginLeft", "0pt");
                }

                //if (!listItem.serialNumberEnabled)
                //    listItem.setStyle("marginLeft", "32pt");
                //else
                //    listItem.setStyle("marginLeft", "0pt");

                listItem.serialNumberEnabled = !listItem.serialNumberEnabled;
                break;
            case "OrderedList":

                var listItems = [];
                debugger

                var startEndOffset = editorHTMLElement.getStartEndOffset();
                var childEditorList = editorHTMLElement.getChildEditorList(startEndOffset.startOffset, startEndOffset.endOffset);

                childEditorList.forEach(function (item) {

                    var instance = item.instance;
                    var iistItem;

                    while (instance.name != "ListItem") {

                        if (instance.name == "OrderedList")
                            return;

                        instance = InstanceManager.getInstance(instance.htmlElement.parentNode);
                    }

                    var iistItem = instance;

                    if (listItems.indexOf(iistItem) == -1)
                        listItems.push(iistItem);
                });

                listItems.forEach(function (item) {

                    if (editorHTMLElement.level == 1) {
                        if (editorHTMLElement.parent.parent.paragraphName.isEmpty() && !item.serialNumberEnabled)
                            item.setStyle("marginLeft", "32pt");
                        else
                            item.setStyle("marginLeft", "0pt");
                    }

                    //if (!item.serialNumberEnabled)
                    //    item.setStyle("marginLeft", "32pt");
                    //else
                    //    item.setStyle("marginLeft", "0pt");

                    item.serialNumberEnabled = !item.serialNumberEnabled;
                });

                debugger
        }



        return false;



    }

    //SignImpl

    //已實做SignLog
    var SignBackspaceImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "delText",
            undoMode: false,
            newInstanceFunction: function (deleteText, info) {

                if (InstanceManager.getInstance(info.instance.htmlElement.parentNode).name != "InsertText") {

                    var newEditor = InstanceManager.getInstance(undefined, DelText);

                    newEditor.textContent = deleteText;
                    newEditor.validateProperties();

                    return newEditor;
                }

            },
            getStartEndOffsetFunction: function (editorHTMLElement) {

                var startEndOffset = editorHTMLElement.getStartEndOffset();

                if (startEndOffset.startOffset == startEndOffset.endOffset)
                    startEndOffset.startOffset = startEndOffset.startOffset - 1;

                return startEndOffset;
            },
            refreshFocusOffsetFunction: function (startOffset, endOffset) {
                return startOffset;
            },
            logHandler: function (ancestorEditor, childEditorList, changeStartEndOffset) {
                debugger
                var signLogList = [];

                for (var i = 0; i < childEditorList.length; i++) {
                    var info = childEditorList[i];
                    var signLog;

                    if (info.newEditor) {

                        signLog = new SignLog(info.newEditor, info.newEditor.signName, info.localStartOffset, info.localEndOffset);
                        signLogList.push(signLog);
                    }
                }

                getConfig("logHandler")(signLogList);
            }
        });
    }

    //已實做SignLog
    var SignDeleteImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {
        debugger
        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "delText",
            undoMode: false,
            newInstanceFunction: function (deleteText) {

                var newEditor = InstanceManager.getInstance(undefined, DelText);

                newEditor.textContent = deleteText;
                newEditor.validateProperties();

                return newEditor;

            },
            /*updateInstanceFunction: function (editorHTMLElement) { //未完成
                debugger
                var startEndOffset = editorHTMLElement.getStartEndOffset();
                var parentStartEndOffset = editorHTMLElement.parent.getStartEndOffset()

                if (startEndOffset.startOffset == startEndOffset.endOffset) {
                    parentStartEndOffset.endOffset = parentStartEndOffset.endOffset + 1;
                }

                var deleteText = editorHTMLElement.parent.deleteContents(parentStartEndOffset.startOffset, parentStartEndOffset.endOffset);

                if (deleteText.length > 0)
                    editorHTMLElement.insertContents(deleteText, getConfig("color"));

            },*/
            getStartEndOffsetFunction: function (editorHTMLElement) {


                var startEndOffset = editorHTMLElement.getStartEndOffset();
                var startOffset = startEndOffset.startOffset;
                var endOffset = startEndOffset.endOffset;

                if (startOffset == endOffset)
                    startEndOffset.endOffset = startEndOffset.endOffset + 1;

                return startEndOffset;
            },
            refreshFocusOffsetFunction: function (startOffset, endOffset) {
                return endOffset;
            },
            logHandler: function (ancestorEditor, childEditorList, changeStartEndOffset) {
                debugger
                var signLogList = [];

                for (var i = 0; i < childEditorList.length; i++) {
                    var info = childEditorList[i];
                    var signLog;

                    if (info.newEditor) {

                        signLog = new SignLog(info.newEditor, info.newEditor.signName, info.localStartOffset, info.localEndOffset);
                        signLogList.push(signLog);
                    }
                }

                getConfig("logHandler")(signLogList);
            }
        });
    }

    var SignAddChildImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, childEditorHTMLElement /** EditorHTMLElement **/) {
        debugger

        editorHTMLElement.startUndoRecord();

        editorHTMLElement.addChild(childEditorHTMLElement);

        editorHTMLElement.endUndoRecord();

        if (editorHTMLElement.state.enabled && editorHTMLElement.state.overrides.length > 0)
            return editorHTMLElement.state.overrides[editorHTMLElement.state.overrides.length - 1];
    }

    //已實做SignLog
    var SignRemoveChildImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {
        debugger

        var signLogList = [];

        var signLog = new SignLog(editorHTMLElement, "刪除簽核物件", undefined, undefined, true);
        signLogList.push(signLog);

        editorHTMLElement.startUndoRecord();

        editorHTMLElement.parent.removeChild(editorHTMLElement);

        editorHTMLElement.endUndoRecord();

        //if (editorHTMLElement.state.enabled && editorHTMLElement.state.overrides.length > 0)
        //    return editorHTMLElement.state.overrides[editorHTMLElement.state.overrides.length - 1];



        return signLogList;
    }

    var SignInsertTextImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/, value) {

        //editorHTMLElement.insertContents(value, getConfig("color"))
        debugger
        while (editorHTMLElement.autoList == undefined && editorHTMLElement.name != "InsertText") {

            editorHTMLElement = editorHTMLElement.parent;
        }

        debugger
        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "InsertText",
            newInstanceFunction: function (text) {

                var newEditor = InstanceManager.getInstance(undefined, InsertText);

                newEditor.textContent = text;
                newEditor.validateProperties();

                return newEditor;
            }, getInsertTextFunction: function (info) {

                return value;
            },
            //refreshFocusOffsetFunction: function (startOffset, endOffset) {

            //    return startOffset + value.length;
            //},


            /*, getStartEndOffsetFunction: function (editorHTMLElement) {

                var startEndOffset = editorHTMLElement.getStartEndOffset();

                if (startEndOffset.startOffset == startEndOffset.endOffset)
                    startEndOffset.startOffset = startEndOffset.startOffset - 1;

                return startEndOffset;
            }*/
        });

        //return false;
    }
    //未完成
    var SignAddListItemImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {

        return EditorAddListItemImpl.call(this, contenteditable_id, editorHTMLElement, {
            newInstanceFunction: function (cloneEditor) {

                var newEditor = InstanceManager.getInstance(undefined, InsertText);

                newEditor.addChild(cloneEditor);
                newEditor.validateNow();

                return newEditor;
            },
        });
    }

    var SignMarkImpl = function (contenteditable_id, editorHTMLElement /** EditorHTMLElement **/) {
        return EditorInsetHTMLElementBase.call(this, contenteditable_id, editorHTMLElement, {
            editorClassName: "MarkText",
            newInstanceFunction: function (deleteText) {

                var newEditor = InstanceManager.getInstance(undefined, MarkText);
                newEditor.textContent = deleteText;
                newEditor.validateProperties();

                return newEditor;
            }
        });
    }

    var SetBehavior = (function () {

        var SetBehavior = function (name, value) {

            this.name = name;
            this.value = value;

            this._oldValue;

            IOverride.call(this);
        };

        SetBehavior.prototype = {
            initialize: function () {
                this._oldValue = BehaviorManager.getFunction(this.name);
            },
            apply: function () {

                var newValue = this.value;
                BehaviorManager.setFunction(this.name, eval(newValue));
            },
            remove: function () {
                BehaviorManager.setFunction(this.name, this._oldValue);
            }
        }

        SetBehavior.prototype.__proto__ = IOverride.prototype;

        return SetBehavior;
    }());

    var BehaviorManager = (function () {

        var behavior;

        var BehaviorManager = {
            getFunction: function (name) {
                if (!behavior)
                    behavior = new Behavior();

                return behavior[name];
            },
            setFunction: function (name, fun /** function **/) {

                if (!behavior)
                    behavior = new Behavior();

                behavior[name] = fun;
            },
            isUneditableFunction: function (name) {

                if (!behavior)
                    behavior = new Behavior();

                return behavior.isUneditable(name);
            },
        }

        return BehaviorManager;
    }());

    var ContextMenuManager = (function () {

        var contextMenu;
        var _dataProvider = [];

        var ContextMenuManager = {
            show: function (x, y) {

                if (_dataProvider.length == 0)
                    return;

                if (!contextMenu)
                    contextMenu = InstanceManager.getInstance(undefined, ContextMenu);

                contextMenu.dataProvider = _dataProvider;
                contextMenu.setStyle("left", x);
                contextMenu.setStyle("top", y);
                contextMenu.htmlElement.style.display = "block";

                InstanceManager.getInstance(document.body).addChild(contextMenu);
            },
            hide: function () {
                if (contextMenu) {
                    contextMenu.dataProvider = _dataProvider = [];
                    contextMenu.htmlElement.style.display = "none";
                }
            },
            set dataProvider(value) {

                if (_dataProvider != value)
                    _dataProvider = value;
            },

        }

        return ContextMenuManager;
    }());


    //var OrderedListBehaviorBase = (function () {

    //    var OrderedListBehaviorBase = function () {
    //    };

    //    OrderedListBehaviorBase.prototype = {
    //        insertContents: function () {

    //        },


    //    }

    //    return OrderedListBehaviorBase;
    //}());

    //var OrderedListEditorBehavior = (function () {

    //    var OrderedListEditorBehavior = function (target, name, value) {
    //    };

    //    OrderedListEditorBehavior.prototype = {

    //    }



    //    OrderedListEditorBehavior.prototype.__proto__ = IOverride.prototype;

    //    return OrderedListEditorBehavior;
    //}());



    var InstanceManager = (function (EditorHTMLElement, section, p, span, UndoRedoEditor) {
        var dictionary = {};
        var id = 0;

        var InstanceManager = {
            getInstance: function (htmlElement, className) {
                if (htmlElement && dictionary[htmlElement.uid])
                    return dictionary[htmlElement.uid];
                else {

                    if (className == undefined) {

                        if (htmlElement) {
                            try {
                                var nodeName;
                                if (htmlElement.nodeType == Node.TEXT_NODE)
                                    nodeName = "text";
                                else {
                                    var dataClass = htmlElement.getAttribute("data-class");

                                    if (dataClass)
                                        nodeName = dataClass;
                                    else
                                        nodeName = htmlElement.localName;
                                }

                                className = eval(nodeName);
                            }
                            catch (e) {
                                className = UndoRedoEditor;

                                console.debug(e.message);
                            }
                        }
                        else
                            className = EditorHTMLElement;
                    }

                    var uid = id++;
                    var obj = new (className)(htmlElement);
                    obj.uid = uid;
                    dictionary[uid] = obj;

                    return obj
                }
            },
            hasInstance: function (htmlElement) {
                return dictionary[htmlElement.uid] != undefined;
            },
            parse: function (htmlElement) {

                /*
                if (htmlElement.getAttribute("data-class") == undefined) {
                    
                    var children = htmlElement.children;

                    for (var i = 0; i < children.length; i++) {
                        InstanceManager.parse(children[i]);
                    }
                }
                else {
                    var instance = this.getInstance(htmlElement, eval(htmlElement.getAttribute("data-class")));
                    //var parentInstance = this.getInstance(htmlElement.parentNode);

                    //parentInstance.addChild(instance);
                }
                */

                if (htmlElement.nodeType == Node.ELEMENT_NODE) {
                    if (this.hasInstance(htmlElement.parentNode))
                        var parentInstance = this.getInstance(htmlElement.parentNode);

                    var instance = this.getInstance(htmlElement, eval(htmlElement.getAttribute("data-class")));
                }
                else if (htmlElement.nodeType == Node.TEXT_NODE) {

                    var instance = this.getInstance(htmlElement);
                }

            },
            clone: function (htmlElement, deep) {

                var cloneHtmlElement = htmlElement.cloneNode(deep);
                if (cloneHtmlElement.nodeType == Node.ELEMENT_NODE) {
                    cloneHtmlElement.removeAttribute("id");

                    if (deep) {
                        var idNodeList = cloneHtmlElement.querySelectorAll("[id]");

                        for (var i = idNodeList.length - 1; i >= 0; i--) {
                            var node = idNodeList[i];
                            node.removeAttribute("id");
                        }
                    }
                }

                return cloneHtmlElement;
            },
            release: function () {
                id = 0;
                dictionary = {};
            }
        }

        return InstanceManager;
    }(EditorHTMLElement, section, p, span, UndoRedoEditor));

    var PageBreakManager = (function () {

        var dictionary = {};

        var PageBreakManager = {
            break: function (editorHTMLElement, offset, boundingClientRect) {
                //debugger
                if (boundingClientRect) {

                    if (boundingClientRect.top > offset) {
                        editorHTMLElement.parent.removeChild(editorHTMLElement);
                        return editorHTMLElement;
                    }
                }

                var fragmentEditor = editorHTMLElement.clone();
                var removeEditors = [];
                var fragmentChildEditor;

                dictionary[fragmentEditor.uid] = editorHTMLElement;

                if (editorHTMLElement.isPageBreak) {
                    for (var i = 0; i < editorHTMLElement.children.length; i++) {

                        var childEditor = editorHTMLElement.getChildAt(i);
                        var childEditorClientRect = childEditor.htmlElement.getBoundingClientRect();

                        if (editorHTMLElement.childrenByPageBreak.indexOf(childEditor) >= 0) {
                            fragmentChildEditor = childEditor.getPagingEditorHTMLElement(offset);
                            fragmentEditor.addChild(fragmentChildEditor);
                        }
                        else {
                            fragmentChildEditor = PageBreakManager.break(childEditor, offset);

                            if (childEditorClientRect.bottom > offset) {

                                fragmentEditor.addChild(fragmentChildEditor);

                                var lineHeight = window.getComputedStyle(childEditor.htmlElement)["line-height"];

                                if (childEditorClientRect.top > offset) {
                                    removeEditors.push(childEditor);
                                }
                                else if (lineHeight != "normal" && childEditorClientRect.top + parseInt(lineHeight) > offset)
                                    removeEditors.push(childEditor);
                            }
                            else {
                                delete dictionary[fragmentChildEditor.uid];
                            }
                        }
                    }
                }


                if (editorHTMLElement.childrenByPageBreak.length > 0) {
                    fragmentEditor._childrenMapping();
                    //fragmentEditor._invalidateProperties();
                }

                for (var j = 0; j < removeEditors.length; j++) {
                    removeEditors[j].parent.removeChild(removeEditors[j]);
                }

                return fragmentEditor;
            },
            getPagingParent: function (editorHTMLElement) {
                return dictionary[editorHTMLElement.uid];
            }
        }

        return PageBreakManager;
    }());

    var self;
    var weditor = window.weditor = function (opt) {

        self = this;

        self.signEditorSelectorList = ["[data-class=DelText]"];

        self.currentState;

        self.optioins = ((function () {

            var o = {
                html: null,
                container: document.body,
                defaultConfig: {
                    undoRedoEnable: true,
                    wrap: true,
                    autoList: "None", //Numbered, Bullet(未完成), None, Free(未完成)         
                    numberedFormat: [{
                        style: "#、",
                        format: "ToNumericChineseCharFormat1ForDocument"
                    }, {
                        style: "(#)",
                        format: "ToNumericChineseCharFormat1ForDocument"
                    }, {
                        style: "#、",
                        format: "ToNumeric2BitCharFormat"
                    }, {
                        style: "(#)",
                        format: "ToNumeric2BitCharFormat"
                    }, {
                        style: "#、",
                        format: "ToNumericHeavenlyFormat"
                    }, {
                        style: "(#)",
                        format: "ToNumericHeavenlyFormat"
                    }, {
                        style: "#、",
                        format: "ToNumericEarthlyFormat"
                    }, {
                        style: "(#)",
                        format: "ToNumericEarthlyFormat"
                    }],
                    stateName: "default",
                    color: "inherit",
                    infoObject: {},
                    logHandler: function () {

                    }
                },
                config: {

                }
            }

            if (opt) {
                for (var key in opt) {
                    if (o.hasOwnProperty(key))
                        o[key] = opt[key];
                }
            }

            return o;

        }))();

        self.build(getConfig("html"));
    };

    function getConfig(key, id) {

        if (id) {
            //if (self.optioins.config.Selector[id])
            //    if (self.optioins.config.Selector[id].hasOwnProperty(key))
            //        return self.optioins.config.Selector[id][key];
        }
        else if (self.optioins.config[key] != undefined)
            return self.optioins.config[key];

        return self.optioins.defaultConfig[key];
    }

    weditor.prototype = {

        build: function (html) {

            if (html)
                this.html(html);
            else
                $('[data-toggle="tooltip"]').tooltip()

            self.currentState = new State();
            self.currentState.name = getConfig("stateName");

            StateManager.container = self.optioins.container;
            StateManager.states = self.optioins.config.States;
            StateManager.addState(self.currentState);

            InstanceManager.parse(self.optioins.container);

            this.changeSatae(self.currentState);

            self.bind();

            setTimeout(function () {

                var instance;
                var focusNode = self.optioins.container.querySelector('[data-focus=true]');
                if (focusNode) {
                    instance = InstanceManager.getInstance(focusNode);
                    instance.focusOffset = instance.textContent.length;
                }
                else {
                    var firstCntenteditableNode = self.optioins.container.querySelector('[contenteditable=true]');
                    if (firstCntenteditableNode) {
                        instance = InstanceManager.getInstance(firstCntenteditableNode);
                        instance.focusOffset = instance.textContent.length;
                    }
                }

                if (getConfig("undoRedoEnable"))
                    MutationObserverManager.init();
            })
        },
        bind: function () {

            //ie
            document.body.addEventListener("mscontrolselect", function (event) {
                event.preventDefault();
            });

            document.body.addEventListener("resizestart", function (event) {

                event.preventDefault();
            });

            //document.addEventListener("keydown", function (event) {

            //    if (event.ctrlKey) {

            //        switch (event.keyCode) {
            //            case 90: //z
            //                self.undo();
            //                event.preventDefault();
            //                break;
            //            case 89: //y
            //                self.redo();
            //                event.preventDefault();
            //                break;
            //        }
            //    }
            //});

            document.addEventListener("contextmenu", function (event) {

                var editorHTMLElement = InstanceManager.getInstance(document.elementFromPoint(event.clientX, event.clientY));

                if (editorHTMLElement.contextMenuOwner) {
                    ContextMenuManager.show(event.clientX, event.clientY);
                    event.preventDefault();
                }
            });

            document.addEventListener("click", function (event) {
                ContextMenuManager.hide();
            });

            var contenteditableNodes = self.optioins.container.querySelectorAll('[contenteditable]');

            this.addEventListener(contenteditableNodes);

            var state = StateManager.getState(getConfig("stateName"));
            state.enabled = true;

        },
        addEventListener: function (contenteditableNodes) {

            var keyCodeMappingFunction = {
                //13: BehaviorManager.getFunction("addListItem"),//enter
                //9: BehaviorManager.getFunction("increaseIndent"), //tab
                //8: BehaviorManager.getFunction("backspace"),
                //46: BehaviorManager.getFunction("delete")
                13: "addListItem",//enter
                9: "increaseIndent", //tab
                8: "backspace",
                46: "delete"
            }

            var keyCodeCtrlKeyPreventDefault = {
                //67: self.copy,//C
                //86: self.addListItem,//keyCodeCtrlKeyPreventDefault
                //90: self.addListItem,//Z
            }

            //var keyCode_A_Z = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 90]
            var keyCodeNotInsertContents = [12, 13, 16, 17, 18, 19, 20, 27, 33, 34,
                35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
                96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 112, 113, 114, 115, 116, 117, 118, 119,
                120, 121, 122, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137,
                187, 188, 189, 190, 192, 210, 212, 213, 214, 215, 216, 217, 218, 221, 227, 228, 229, 230, 231, 232, 233, 234,
                235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254];

            //var keyCodeCtrlKeyNotInsertContents = [
            //    65, //A
            //    67, //C
            //    86, //V
            //    88, //X
            //    89, //Y
            //    90];//Z

            var keyCodeCtrlKeyCodeMappingFunction = {
                89: self.redo,
                90: self.undo
            }

            function keydownHandler(event) {

                if (this.contentEditable != "true")
                    return;

                //var selection = window.getSelection();
                var focusElement = self.getFocusElement();
                //var range = selection.getRangeAt(0);
                //var commonAncestorContainer = range.commonAncestorContainer;

                if (focusElement) {
                    var editorHTMLElement = InstanceManager.getInstance(focusElement);

                    if (editorHTMLElement.startUndoRecord == undefined) {
                        event.preventDefault();
                        return;
                    }

                    if (keyCodeMappingFunction[event.keyCode]) {

                        editorHTMLElement.startUndoRecord();
                        console.log("startUndoRecord")

                        var setRange = new SetRange(editorHTMLElement);
                        //StateManager.currentState.enabled = false;

                        var isPreventDefault = BehaviorManager.getFunction(keyCodeMappingFunction[event.keyCode]).call(self, this.id, editorHTMLElement) == false;

                        if (isPreventDefault)
                            event.preventDefault();


                        //StateManager.currentState.enabled = true;
                        setRange.saveStartEndOffset();

                        setTimeout(function () {

                            editorHTMLElement.endUndoRecord();
                            console.log("endUndoRecord")

                        }, 50);


                    }
                    else if (event.ctrlKey) {


                        if (keyCodeCtrlKeyCodeMappingFunction[event.keyCode]) {
                            keyCodeCtrlKeyCodeMappingFunction[event.keyCode].call(self, this.id, editorHTMLElement);
                            event.preventDefault();
                        }

                        // if (isPreventDefault)


                        console.log("keyCodeCtrlKeyCodeMappingFunction")
                    }
                    //else if (keyCodeNotInsertContents.indexOf(event.keyCode) == -1 &&
                    //    (!event.ctrlKey || keyCodeCtrlKeyNotInsertContents.indexOf(event.keyCode) == -1)) {
                    else {

                        editorHTMLElement.startUndoRecord();
                        console.log("startUndoRecord")

                        var setRange = new SetRange(editorHTMLElement);
                        //StateManager.currentState.enabled = false;

                        //StateManager.currentState.enabled = true;


                        var startEndOffset = editorHTMLElement.getStartEndOffset();
                        var startOffset = startEndOffset.startOffset;
                        var endOffset = startEndOffset.endOffset;

                        //

                        //var keyInTextFunction = BehaviorManager.getFunction("keyInText");


                        //if (keyInTextFunction) {

                        //    keyInTextFunction.call(self, this.id, editorHTMLElement, event.key);

                        //    event.preventDefault();
                        //}

                        if (startOffset != endOffset) {
                            //原本1 跟 2對調, 但ie會有問題

                            editorHTMLElement.focusOffset = startOffset;//1
                            //editorHTMLElement.deleteContents(startOffset, endOffset);//2
                            BehaviorManager.getFunction("delete").call(self, this.id, editorHTMLElement);
                            editorHTMLElement.validateProperties();
                        }

                        setTimeout(function () {
                            setRange.saveStartEndOffset();
                            editorHTMLElement.endUndoRecord();
                            console.log("endUndoRecord")

                        }, 50);

                        if (editorHTMLElement.keyinWordAvoid) {

                            var range = document.createRange();
                            //newNode = document.createTextNode(event.key);
                            newNode = document.createTextNode(String.fromCharCode(8203));

                            range.selectNode(window.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.nextSibling);
                            range.insertNode(newNode);

                            InstanceManager.getInstance(newNode).focusToEnd();
                            InstanceManager.getInstance(newNode).validateProperties();
                            //event.preventDefault();

                            //window.getSelection().getRangeAt(0).selectNode(newNode);
                            //window.getSelection().getRangeAt(0).setStart(newNode,1);
                        }

                        /*

                        var startEndOffset = editorHTMLElement.getStartEndOffset();
                        var startOffset = startEndOffset.startOffset;
                        var endOffset = startEndOffset.endOffset;

                        if (startOffset != endOffset) {
                            //原本1 跟 2對調, 但ie會有問題

                            editorHTMLElement.focusOffset = startOffset;//1
                            //editorHTMLElement.deleteContents(startOffset, endOffset);//2
                            BehaviorManager.getFunction("delete").call(self, this.id, editorHTMLElement);
                            editorHTMLElement.validateProperties();
                        }

                        BehaviorManager.getFunction("insertText").call(self, this.id, editorHTMLElement, event.key) 


                        // editorHTMLElement.focusOffset = editorHTMLElement.focusOffset + event.key.length;
                        event.preventDefault();

                        */
                    }

                    //else
                    //event.preventDefault();

                }
            }

            function clipboard(clipboardEvent) {

                var focusElement = self.getFocusElement();
                var editorHTMLElement = InstanceManager.getInstance(focusElement);
                //var selection = window.getSelection();
                //var range = selection.getRangeAt(0);
                //var commonAncestorContainer = range.commonAncestorContainer;

                editorHTMLElement.startUndoRecord();
                console.log("editorHTMLElement.startUndoRecord")

                var setRange = new SetRange(editorHTMLElement);

                StateManager.currentState.enabled = false;
                var isPreventDefault = BehaviorManager.getFunction(clipboardEvent.type).call(self, this.id, editorHTMLElement, clipboardEvent) == false;

                if (isPreventDefault)
                    clipboardEvent.preventDefault();

                StateManager.currentState.enabled = true;
                setRange.saveStartEndOffset();

                setTimeout(function () {

                    editorHTMLElement.endUndoRecord();
                    console.log("editorHTMLElement.endUndoRecord")

                }, 50);
            }

            for (var i = 0; i < contenteditableNodes.length; i++) {

                ["keydown"].forEach(function (event) {
                    contenteditableNodes[i].addEventListener(event, keydownHandler, false);
                });

                ["cut", "copy", "paste"].forEach(function (event) {
                    contenteditableNodes[i].addEventListener(event, function (e) {

                        if (this.contentEditable != "true")
                            return;

                        clipboard(e);
                    });
                });
            }
        },
        getFocusElement: function () {

            var selection = window.getSelection();
            var focusNode

            if (selection.rangeCount > 0)
                focusNode = window.getSelection().getRangeAt(0).commonAncestorContainer;
            else
                focusNode = window.getSelection().focusNode;


            if (focusNode && focusNode.nodeType == Node.TEXT_NODE)
                focusNode = focusNode.parentNode;

            return focusNode;
        },
        getFocusElementEditor: function () {
            return InstanceManager.getInstance(this.getFocusElement());
        },
        selectionIsCross: function () {
            var selection = window.getSelection();

            if (selection.rangeCount > 0) {

                var range = selection.getRangeAt(0);

                return range.commonAncestorContainer.nodeType == Node.ELEMENT_NODE && range.startContainer.parentNode != range.commonAncestorContainer;
            }

            return false;
        },
        getHtmlElementEditor: function (htmlElement) {
            return InstanceManager.getInstance(htmlElement);
        },
        addChild: function (containerEditorHTMLElement /** EditorHTMLElement **/, childEditorHTMLElement /** EditorHTMLElement **/) {
            return BehaviorManager.getFunction("addChild").apply(self, [undefined, containerEditorHTMLElement, childEditorHTMLElement]);
        },
        removeChild: function (editorHTMLElement) {
            return BehaviorManager.getFunction("removeChild").apply(self, [undefined, editorHTMLElement]);
        },
        undo: function () {
            debugger
            var state = StateManager.currentState || StateManager.getState(getConfig("stateName"))
            state.undo();
        },
        redo: function () {

            var state = StateManager.currentState || StateManager.getState(getConfig("stateName"))
            state.redo();
        },
        getState: function () {
            return StateManager.currentState || StateManager.getState(getConfig("stateName"))
        },
        getIOverrides: function (signLog) {
            var overrides = [];
            var override;
            debugger

            switch (signLog.signType) {
                case "刪除文字":
                    var relativeTo = InstanceManager.getInstance(document.getElementById(signLog.containerId));
                    var target = InstanceManager.getInstance(document.getElementById(signLog.objectId));
                    var position = "insertNode";
                    var index = signLog.startOffset;

                    override = new AddChild(relativeTo, target, position, index, true);
                    overrides.push(override);
                    break;
                case "加入簽核物件":
                    var relativeTo = InstanceManager.getInstance(document.getElementById(signLog.containerId));
                    var target = InstanceManager.getInstance(document.getElementById(signLog.objectId));
                    var position = "lastChild";

                    override = new AddChild(relativeTo, target, position);
                    overrides.push(override);
                    break;
                case "刪除簽核物件":
                    var relativeTo = InstanceManager.getInstance(document.getElementById(signLog.containerId));
                    var targetHtmlElement = new DOMParser().parseFromString(signLog.objectHtml, "text/html").body.children[0];
                    var target = InstanceManager.getInstance(targetHtmlElement);

                    override = new RemoveChild(target, relativeTo);
                    overrides.push(override);
                    break;
            }

            return overrides;
        },
        paging: function () {
            debugger
            var promise = new Promise(function (resolve, reject) {
                var documentNodeList = self.optioins.container.querySelectorAll("[data-class=Document]");
                var documentNodeArray = Array.prototype.slice.call(documentNodeList);

                (function queue() {
                    var documentNode = documentNodeArray.shift();
                    var documentEditor = InstanceManager.getInstance(documentNode);

                    documentEditor.paging().then(function () {

                        if (documentNodeArray.length > 0)
                            queue()
                        else
                            resolve();

                    }, reject)
                })();
            });




            //var documentNode = self.optioins.container.querySelector("[data-class=Document]");
            //var documentEditor = InstanceManager.getInstance(documentNode);

            //return documentEditor.paging();

            return promise;
        },
        single: function () {

            var documentNode = self.optioins.container.querySelector("[data-class=Document]");
            var documentEditor = InstanceManager.getInstance(documentNode);

            documentEditor.single();
        },
        print: function () {
            var documentNode = self.optioins.container.querySelector("[data-class=Document]");
            var documentEditor = InstanceManager.getInstance(documentNode);

            documentEditor.print();
        },
        displayTallyImpression: function (doublePagePrint) {

            var documentNode = self.optioins.container.querySelector("[data-class=Document]");
            var documentEditor = InstanceManager.getInstance(documentNode);

            documentEditor.displayTallyImpression(doublePagePrint);
        },
        removeTallyImpression: function () {

            var documentNode = self.optioins.container.querySelector("[data-class=Document]");
            var documentEditor = InstanceManager.getInstance(documentNode);

            documentEditor.removeTallyImpression();
        },
        queryEditorSelector: function (selectors) {

            var htmlElement;

            if (selectors)
                htmlElement = self.optioins.container.querySelector(selectors);
            else
                htmlElement = self.optioins.container.firstElementChild;

            if (htmlElement)
                return InstanceManager.getInstance(htmlElement);

            return undefined;
        },
        queryEditorSelectorAll: function (selectors) {
            
            var htmlElementList;
            var editorList = [];

            htmlElementList = self.optioins.container.querySelectorAll(selectors);

            htmlElementList.forEach(function (item) {
                editorList.push(InstanceManager.getInstance(item));
            });

            return editorList;
        },
        pageCount: function () {

            var documentNode = self.optioins.container.querySelector("[data-class=Document]");
            var documentEditor = InstanceManager.getInstance(documentNode);

            return documentEditor.children.length;
        },
        update: function (name, value, type) {//textContent, addChild
            debugger
            type = type || "textContent";

            var documentNode = self.optioins.container.querySelector("[data-class=Document]");
            var documentEditor = InstanceManager.getInstance(documentNode);
            documentEditor.startUndoRecord();

            var attrName = "data-twedr";

            if (Array.isArray(name)) {

                var arr = name;

                for (var i = 0; i < arr.length; i++) {
                    updateTextContent(arr[i].name, arr[i].value);
                }
            }
            else
                updateTextContent(name, value);

            function updateTextContent(name, value) {
                var node = self.optioins.container.querySelector("[" + attrName + "=" + name + "]");

                if (node) {
                    var nodeEditor = InstanceManager.getInstance(node);
                    if (type == "textContent")
                        nodeEditor.textContent = value;
                    else if (type == "removeChildAll")
                        nodeEditor.removeChildAll();
                    else {
                        var newEditor = InstanceManager.getInstance(new DOMParser().parseFromString(value, "text/html").body.children[0]);
                        nodeEditor.addChild(newEditor)
                    }
                }
                else
                    console.error("[" + attrName + "=" + name + "] not find");
            }

            documentEditor.endUndoRecord();

        },
        config: function () {
            return self.optioins.config;
        },
        addParagraph: function (paragraphName) {

            debugger
            //undo redo 還沒好 要加event, 段名重複要檔
            var paragraphs = self.optioins.container.querySelectorAll("[data-twedr=段落]");

            if (paragraphs.length > 0) {

                var lastParagraph = paragraphs[paragraphs.length - 1];
                var newParagraphEditor = InstanceManager.getInstance(InstanceManager.clone(lastParagraph, true), Paragraph);
                var paragraphNameEditor = newParagraphEditor.getChildAt(0).paragraphName;
                var paragraphTextBlockEditor = newParagraphEditor.getChildAt(0).paragraphTextBlock;
                paragraphNameEditor.textContent = paragraphName;
                paragraphTextBlockEditor.removeChildAll();
                paragraphTextBlockEditor.textContent = "";
                paragraphTextBlockEditor.autoList = "Numbered"

                var lastParagraphEditor = InstanceManager.getInstance(lastParagraph, Paragraph);
                lastParagraphEditor.parent.addChildAt(newParagraphEditor, lastParagraphEditor.childNodeIndex + 1);

                this.addEventListener(newParagraphEditor.htmlElement.querySelectorAll('[contenteditable]'));
                newParagraphEditor.getChildAt(0).paragraphTextBlock.focusOffset = 0;
            }
        },
        hideEmplyParagraph: function (hidden) {

            var paragraphTextBlocks = self.optioins.container.querySelectorAll("[data-class=ParagraphTextBlock][data-required=false]");

            if (paragraphTextBlocks.length > 0) {

                for (var i = 0; i < paragraphTextBlocks.length; i++) {
                    var paragraphTextBlockEditor = InstanceManager.getInstance(paragraphTextBlocks[i], ParagraphTextBlock);
                    var currentHidden = true;

                    for (var j = 0; j < paragraphTextBlockEditor.childNodes.length; j++) {
                        if (!paragraphTextBlockEditor.childNodes[j].isEmpty())
                            currentHidden = false;
                    }

                    if (currentHidden) {
                        if (hidden)
                            paragraphTextBlockEditor.parent.parent.setStyle("display", "none");
                        else
                            paragraphTextBlockEditor.parent.parent.setStyle("display", "block");
                    }
                }
            }
        },
        html: function (value, isChangeSatae) {

            if (value == undefined) { //get

                if (isChangeSatae == undefined)
                    isChangeSatae = true;

                var templatenameNode;
                var xml;

                function getTemplatenameNode() {
                    return self.optioins.container.querySelector("[templatename]") || self.optioins.container.querySelector("[data-class='TextBlock']") || self.optioins.container.firstElementChild;
                }

                if (isChangeSatae) {
                    var prevState = this.currentState;
                    this.changeSatae("唯讀");

                    templatenameNode = getTemplatenameNode();
                    xml = new XMLSerializer().serializeToString(templatenameNode);
                    this.changeSatae(prevState.name);

                    var state = StateManager.currentState;
                    state.overrides = [];
                    state.removeds = [];
                }
                else {
                    templatenameNode = getTemplatenameNode();
                    xml = new XMLSerializer().serializeToString(templatenameNode);
                }

                return xml;
            }
            else if (typeof (value) == "string") {
                var htmlElement = new DOMParser().parseFromString(value, "text/html").body.children[0];

                for (var i = self.optioins.container.children.length - 1; i >= 0; i--) {
                    self.optioins.container.removeChild(self.optioins.container.children[i]);
                }

                InstanceManager.release();
                self.optioins.container.uid = undefined;
                self.optioins.container.appendChild(htmlElement);
                $('[data-toggle="tooltip"]').tooltip()
            }
            else {

                for (var i = self.optioins.container.children.length - 1; i >= 0; i--) {
                    self.optioins.container.removeChild(self.optioins.container.children[i]);
                }

                InstanceManager.release();

                self.optioins.container.appendChild(value);
                $('[data-toggle="tooltip"]').tooltip()
            }
        },
        revised: function (name) {
            debugger
            var state = StateManager.getState(name);

            if (state)
                return state.overrides.length > 0;
            else
                return false;
        },
        getPrintStyle: function () {

            return "@page {" +
                "size: A4;" +
                "margin: 0;" +
                "padding: 0;" +
                "border - width: 0px;" +
                "}" +

                "@media print {" +

                "div[data-class='Page'] {" +
                "margin: 0!important;" +
                "padding: 0!important;" +
                "border - width: 0px;" +
                "page -break-after: always;" +
                "background - color: #FFFFFF;" +
                "width: 210mm;" +
                "height: 296.8mm;" +
                "overflow: hidden;" +
                "position: relative;" +
                "font-family: standard, kaiu, 標楷體;" +
                "}" +

                "body {" +
                "margin: 0!important;" +
                "-webkit - print - color - adjust: exact;" +
                "}" +

                "body > div {" +
                "margin: 0!important;" +
                "}" +

                "html {" +
                "margin: 0!important;" +
                "}" +
                "}";
        },
        finalVersionMode: function (final) {

            if (final) {
                debugger
                var signEditorList = document.querySelectorAll(self.signEditorSelectorList.join(","));

                for (var i = 0; i < signEditorList.length; i++) {
                    var instance = InstanceManager.getInstance(signEditorList[i]);
                    instance.finalVersion();

                }
            }
            else {
            }
        },
        changeSatae: function (state, undoAll, redoAll) {

            if (typeof (state) == "string") {
                var s = StateManager.getState(state);

                if (!s) {
                    s = new State();
                    s.name = state;
                }

                this.currentState = s;
            }
            else
                this.currentState = state;

            if (StateManager.currentState && StateManager.currentState.name == this.currentState.name)
                return;

            this.currentState.enabled = false;
            MutationObserverManager.disconnect();

            StateManager.addState(this.currentState);

            if (undoAll) {
                for (var i = 0, l = StateManager.currentState.overrides.length; i < l; i++) {
                    StateManager.currentState.undo();
                }
            }

            if (redoAll) {
                for (var i = 0, l = StateManager.currentState.removeds.length; i < l; i++) {
                    StateManager.currentState.redo();
                }
            }

            StateManager.currentState = this.currentState;
            self.optioins.config.stateName = this.currentState.name;

            $('.datepicker, .input-daterange input').datepicker({
                language: "zh-TW",
                format: "yyyy-mm-dd",
                autoclose: true,
                clearBtn: true
            });

            this.currentState.enabled = true;

            MutationObserverManager.observe();

        },
        action: function (name, arg) {
            debugger
            var argArray = Array.prototype.slice.call(arguments);
            argArray.shift();

            if (self[name])
                return self[name].apply(this, argArray);

            var focusElement = self.getFocusElement();

            if (focusElement) {
                this._focusElement = focusElement;

                var contentEditableHtmlElement = (function () {
                    var node = focusElement;

                    if (BehaviorManager.isUneditableFunction(name)) {

                        while (node && (node.contentEditable != "true" && node.contentEditable != "false")) {

                            node = node.parentNode;
                        }
                    }
                    else {
                        while (node && node.contentEditable != "true") {

                            node = node.parentNode;
                        }

                    }

                    return node;

                })();

                if (contentEditableHtmlElement) {
                    var id = contentEditableHtmlElement.id;
                    //var autoList = getConfig("autoList", id);

                    //if (autoList == "Numbered") {

                    var editorHTMLElement = InstanceManager.getInstance(focusElement);

                    if (editorHTMLElement.startUndoRecord == undefined)
                        return;

                    argArray.splice(0, 0, id);
                    argArray.splice(1, 0, editorHTMLElement);

                    editorHTMLElement.startUndoRecord();
                    BehaviorManager.getFunction(name).apply(contentEditableHtmlElement, argArray);

                    setTimeout(function () {
                        editorHTMLElement.endUndoRecord();
                    }, 50);


                    //}
                }
            }
        },
        states: function (value) {
            if (value == undefined) { //get

            } else {
                StateManager.states = value;
            }
        }
    }

}());

(function () {
    "use strict";

    var NumericFormatTranslation = window.NumericFormatTranslation || (window.NumericFormatTranslation = { session: {} });

    NumericFormatTranslation.session.Numeric2BitCars = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
    NumericFormatTranslation.session.NumericChineseCars1 = ["○", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    NumericFormatTranslation.session.NumericChineseCars1ForDocument = ["十", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    NumericFormatTranslation.session.NumericChineseCars2 = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    NumericFormatTranslation.session.NumericChineseWords = ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];
    NumericFormatTranslation.session.NumericHeavenly = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    NumericFormatTranslation.session.NumericEarthly = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",];
    NumericFormatTranslation.session.Unit = ["萬", "億", "兆", "京"];
    NumericFormatTranslation.session.UnitPart1 = ["", "十", "百", "千"];
    NumericFormatTranslation.session.UnitPart2 = ["", "拾", "佰", "仟"];

    NumericFormatTranslation.NumberChangeFormat = function (str) {
        var Num = str.toString();

        return {
            NumericFormatTranslation: this,
            ToNumericSplitFormat: ToNumericSplitFormat,
            ToNumeric2BitCharFormat: ToNumeric2BitCharFormat,
            ToNumericChineseCharFormat1: ToNumericChineseCharFormat1,
            //ToNumericChineseCharFormat1ForDocument:ToNumericChineseCharFormat1ForDocument,
            ToNumericChineseCharFormat1ForDocument: ToNumericChineseSentence1,
            ToNumericChineseCharFormat2: ToNumericChineseCharFormat2,
            ToNumericChineseWordFormat: ToNumericChineseWordFormat,
            ToNumericChineseSentence1: ToNumericChineseSentence1,
            ToNumericChineseSentence2: ToNumericChineseSentence2,
            ToNumericHeavenlyFormat: ToNumericHeavenlyFormat,
            ToNumericEarthlyFormat: ToNumericEarthlyFormat
        }

        //數字 加上逗點 EX:012345 => 12,345
        function ToNumericSplitFormat() {
            var tmpStr = "";

            for (var i = (Num.length - 1); i >= 0; i--) {
                tmpStr = Num.substr(i, 1) + tmpStr;

                if (((Num.length - i - 1) % 3 == 2) && (Num.length - i - 1) > 0 && i > 0) {
                    tmpStr = "," + tmpStr;
                }
            }
            return tmpStr;
        }


        //轉換 全型數字 EX:012345 => １２３４５
        function ToNumeric2BitCharFormat() {
            var tmpStr = "";
            for (var i = 0; i < Num.length; i++) {
                if (IsNumeric(Num.substr(i, 1)))
                    tmpStr += NumericFormatTranslation.session.Numeric2BitCars[parseInt(Num.substr(i, 1))];
            }
            return tmpStr;
        }

        //轉換 大寫數字1 EX:012345 => ○一二三四五
        function ToNumericChineseCharFormat1() {
            var tmpStr = "";

            for (var i = 0; i < Num.length; i++) {
                if (IsNumeric(Num.substr(i, 1)))
                    tmpStr += NumericFormatTranslation.session.NumericChineseCars1[parseInt(Num.substr(i, 1))];
            }
            return tmpStr;
        }

        //公文用 轉換 大寫數字1 EX:012345 => 一二三四五 ( 0 => 十)
        function ToNumericChineseCharFormat1ForDocument() {
            var tmpStr = "";

            //小於10的處理
            if (IsNumeric(Num) && parseInt(Num) < 10)
                return NumericFormatTranslation.session.NumericChineseCars1ForDocument[parseInt(Num.substr(0, 1))];

            //等於10的處理
            if (IsNumeric(Num) && parseInt(Num) == 10)
                return "十";

            //大於10 小於 20的處理
            if (IsNumeric(Num) && parseInt(Num) > 10 && parseInt(Num) < 20)
                return "十" + NumericFormatTranslation.session.NumericChineseCars1ForDocument[parseInt(Num.substr(1, 1))];

            //大於20 以後的處理(尾數為0) 
            if (IsNumeric(Num) && parseInt(Num.substr(1, 1)) == 0)
                return NumericFormatTranslation.session.NumericChineseCars1ForDocument[parseInt(Num.substr(0, 1))] + "十";

            //大於20 以後的處理(尾數非0)
            if (IsNumeric(Num) && parseInt(Num) > 20 && parseInt(Num) < 100)
                return NumericFormatTranslation.session.NumericChineseCars1ForDocument[parseInt(Num.substr(0, 1))] + "十" + NumericFormatTranslation.session.NumericChineseCars1ForDocument[parseInt(Num.substr(1, 1))];;


            return tmpStr;
        }

        //轉換 大寫數字2 EX:012345 => 零一二三四五
        function ToNumericChineseCharFormat2() {
            var tmpStr = "";

            for (var i = 0; i < Num.length; i++) {
                if (IsNumeric(Num.substr(i, 1)))
                    tmpStr += NumericFormatTranslation.session.NumericChineseCars2[parseInt(Num.substr(i, 1))];
            }
            return tmpStr;
        }

        //轉換 國字數字 EX:012345 => 零壹貳參肆伍
        function ToNumericChineseWordFormat() {
            var tmpStr = "";

            for (var i = 0; i < Num.length; i++) {
                if (IsNumeric(Num.substr(i, 1)))
                    tmpStr += NumericFormatTranslation.session.NumericChineseWords[parseInt(Num.substr(i, 1))];
            }
            return tmpStr;
        }

        //轉換 天干
        function ToNumericHeavenlyFormat() {

            if (IsNumeric(Num) && (parseInt(Num) == 0 || parseInt(Num) > NumericFormatTranslation.session.NumericHeavenly.length))
                return Num;

            if (IsNumeric(Num))
                return NumericFormatTranslation.session.NumericHeavenly[parseInt(Num) - 1];

        }

        //轉換 地支
        function ToNumericEarthlyFormat() {

            if (IsNumeric(Num) && (parseInt(Num) == 0 || parseInt(Num) > NumericFormatTranslation.session.NumericEarthly.length))
                return Num;

            if (IsNumeric(Num))
                return NumericFormatTranslation.session.NumericEarthly[parseInt(Num) - 1];

        }

        //轉換 大寫數字(含單位) EX:123456789 => 一億二千三百四十五萬六千七百八十九
        function ToNumericChineseSentence1() {
            //var tmpStr = "";
            //var tempUnit1 = 0;
            //for(var i = (Num.length - 1); i >= 0; i--)
            //{

            //	(tempUnit1 >= 4) ? tmpStr = NumericFormatTranslation.session.UnitPart1[getUnit1Num(tempUnit1)] + tmpStr : tmpStr = NumericFormatTranslation.session.UnitPart1[tempUnit1] + tmpStr;

            //	if(tempUnit1 != 0 && tempUnit1 % 4 == 0)
            //		tmpStr = NumericFormatTranslation.session.Unit[Math.floor(tempUnit1 / 4) -1] + tmpStr ;

            //	if(IsNumeric(Num.substr(i, 1)))
            //		if(tempUnit1 != 0 || Num.substr(i, 1) != "0")
            //			tmpStr = NumericFormatTranslation.session.NumericChineseCars1[parseInt(Num.substr(i, 1))] + tmpStr;

            //	tempUnit1++ ;
            //}
            //return tmpStr;

            var tmpStr = "";
            var tempChar;
            var sourceText = Num;

            for (var i = (sourceText.length - 1); i >= 0; i--) {
                tempChar = sourceText.substr(i, 1);

                if (IsNumeric(tempChar)) {
                    tempChar = NumericFormatTranslation.session.NumericChineseCars2[parseInt(tempChar)];

                    //if ((tempChar == "零" || tempChar == "○") && i != (sourceText.length - 1))
                    if ((tempChar == "零" || tempChar == "○")) {
                        if ((sourceText.substr((i + 1), 1) == "0") || (((sourceText.length - i - 1) % 4) == 0))
                            tempChar = "";
                    }
                    else if ((tempChar == "一") && i == 0 && sourceText.length == 2) {
                        tempChar = "";
                        tmpStr = NumericFormatTranslation.session.UnitPart1[((sourceText.length - i - 1) % 4)] + tmpStr;
                    }
                    else
                        tmpStr = NumericFormatTranslation.session.UnitPart1[((sourceText.length - i - 1) % 4)] + tmpStr;

                    //if(((sourceText.length - i - 1) % 4) == 0)
                    //{
                    //    var AllZero = true;
                    //    var tchar;

                    //    for(var j = i; j >= (i - 3); j--)
                    //    {
                    //        tchar = sourceText.substr(j, 1);

                    //        if(tchar != "0")
                    //        {
                    //            AllZero = false;
                    //            break;
                    //        }
                    //    }

                    //    if(!AllZero)
                    //    {
                    //        tmpStr = Unit[(((sourceText.length - i - 1) / 4) % 4)] + tmpStr;
                    //    }
                    //    else
                    //        i = (j + 1);
                    //}

                    tmpStr = tempChar + tmpStr;
                }
                else
                    return sourceText;
            }
            return tmpStr;
        }

        //轉換 國字數字(含單位) EX:1234567890 => 壹拾貳億參仟肆佰伍拾陸萬柒仟捌佰玖拾
        function ToNumericChineseSentence2() {
            var tmpStr = "";
            var tempUnit1 = 0;
            for (var i = (Num.length - 1); i >= 0; i--) {

                (tempUnit1 >= 4) ? tmpStr = NumericFormatTranslation.session.UnitPart2[getUnit1Num(tempUnit1)] + tmpStr : tmpStr = NumericFormatTranslation.session.UnitPart2[tempUnit1] + tmpStr;

                if (tempUnit1 != 0 && tempUnit1 % 4 == 0)
                    tmpStr = NumericFormatTranslation.session.Unit[Math.floor(tempUnit1 / 4) - 1] + tmpStr;

                if (IsNumeric(Num.substr(i, 1)))
                    if (tempUnit1 != 0 || Num.substr(i, 1) != "0")
                        tmpStr = NumericFormatTranslation.session.NumericChineseWords[parseInt(Num.substr(i, 1))] + tmpStr;

                tempUnit1++;
            }
            return tmpStr;
        }

        //單位計算
        function getUnit1Num(unitPartNum) {
            var returnNum = unitPartNum;
            while (returnNum >= 4)
                returnNum -= 4;

            return returnNum;
        }

        //判斷是否為數字
        function IsNumeric(val) {
            if (isNaN(parseInt(val)))
                return false;
            else
                return true;
        }
    }
}());

//ie supported
(function () {

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();