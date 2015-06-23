var uilib;
(function (uilib) {
    // Terrible element resize hack methods
    function resizeTriggerListener(e) {
        var win = e.target;
        var trigger = win.__resizeOwner__;
        trigger.__resizeListeners__.forEach(function (fn) {
            fn.call(trigger, e);
        });
    }
    function addElementResizeListener(element, listener) {
        function onLoad(e) {
            obj.onload = null;
            obj.contentDocument.defaultView.__resizeOwner__ = element;
            obj.contentDocument.defaultView.addEventListener('resize', resizeTriggerListener);
        }
        if (!element.__resizeListeners__) {
            element.__resizeListeners__ = [];
            if (getComputedStyle(element).position == 'static')
                element.style.position = 'relative';
            var obj = element.__resizeTrigger__ = document.createElement('object');
            obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
            obj.onload = onLoad;
            obj.type = 'text/html';
            obj.data = 'about:blank';
            element.appendChild(obj);
        }
        element.__resizeListeners__.push(listener);
    }
    uilib.addElementResizeListener = addElementResizeListener;
    function removeElementResizeListener(element, listener) {
        element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(listener), 1);
        if (!element.__resizeListeners__.length) {
            element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeTriggerListener);
            element.removeChild(element.__resizeTrigger__);
            element.__resizeTrigger__ = null;
            element.__resizeListeners__ = null;
        }
    }
    uilib.removeElementResizeListener = removeElementResizeListener;
    // end horrible hack stuff
    function addClickAndHoverListener(element, listener) {
        element.addEventListener("click", function (e) {
            var timer = setTimeout(function () {
                window.removeEventListener("mousemove", onMouseMove);
                listener(e);
            }, 800);
            var onMouseMove = function (e) {
                clearTimeout(timer);
                window.removeEventListener("mousemove", onMouseMove);
            };
            window.addEventListener("mousemove", onMouseMove);
        });
    }
    uilib.addClickAndHoverListener = addClickAndHoverListener;
})(uilib || (uilib = {}));
/// <reference path="uilib.ts" />
var scrolldiv;
(function (scrolldiv) {
    var ScrollController = (function () {
        function ScrollController(container, opts) {
            this.WheelVelocity = 30;
            this.MinThumbHeight = 20;
            this.MaxThumbHeight = 0;
            this.ScrollPos = 0;
            this.MinPos = 0;
            this.ThumbHeight = 0;
            this.ThumbScale = 0;
            this.WheelVelocity = opts.wheelVelocity != null ? opts.wheelVelocity : this.WheelVelocity;
            this.MinThumbHeight = opts.minThumbHeight != null ? opts.minThumbHeight : this.MinThumbHeight;
            this.MaxThumbHeight = opts.maxThumbHeight != null ? opts.maxThumbHeight : this.MaxThumbHeight;
            this.Container = container;
            this.Content = container.children[0];
            this.TopShadow = document.createElement('div');
            this.TopShadow.style.position = "absolute";
            this.TopShadow.style.width = "100%";
            this.TopShadow.style.top = "0px";
            this.TopShadow.classList.add("scrollTopShadow");
            this.Container.appendChild(this.TopShadow);
            this.BottomShadow = document.createElement('div');
            this.BottomShadow.style.position = "absolute";
            this.BottomShadow.style.width = "100%";
            this.BottomShadow.style.bottom = "0px";
            this.BottomShadow.classList.add("scrollBottomShadow");
            this.Container.appendChild(this.BottomShadow);
            this.ScrollThumb = document.createElement('div');
            this.ScrollThumb.style.position = "absolute";
            this.ScrollThumb.classList.add("scrollThumb");
            this.Container.appendChild(this.ScrollThumb);
            this.setupEvents();
            this.calcDimensions();
        }
        ScrollController.prototype.redraw = function () {
            var topOpacity = this.ScrollPos / -100.0;
            if (topOpacity < 0)
                topOpacity = 0;
            else if (topOpacity > 1.0)
                topOpacity = 1.0;
            this.TopShadow.style.opacity = String(topOpacity);
            var bottomOpacity = (this.ScrollPos - this.MinPos) / 100.0;
            if (bottomOpacity < 0)
                bottomOpacity = 0;
            else if (bottomOpacity > 1.0)
                bottomOpacity = 1.0;
            this.BottomShadow.style.opacity = String(bottomOpacity);
            if (this.ThumbScale != 0) {
                var thumbPos = this.ScrollPos * this.ThumbScale;
                this.ScrollThumb.style.top = Math.round(thumbPos) + "px";
            }
        };
        ScrollController.prototype.calcDimensions = function () {
            this.ContainerHeight = this.Container.offsetHeight;
            this.ContentHeight = this.Content.offsetHeight;
            this.MinPos = this.ContainerHeight - this.ContentHeight;
            if (this.MinPos > 0)
                this.MinPos = 0;
            this.ThumbHeight = this.ContainerHeight * this.ContainerHeight / this.ContentHeight;
            if (this.ThumbHeight < this.MinThumbHeight)
                this.ThumbHeight = this.MinThumbHeight;
            else if (this.MaxThumbHeight > 0 && this.ThumbHeight > this.MaxThumbHeight)
                this.ThumbHeight = this.MaxThumbHeight;
            if (this.ContentHeight == 0 || this.ContainerHeight > this.ContentHeight) {
                this.ScrollThumb.style.display = "none";
                this.ThumbScale = 0;
            }
            else {
                this.ScrollThumb.style.display = "block";
                this.ScrollThumb.style.height = this.ThumbHeight + "px";
                this.ThumbScale = (this.ContainerHeight - this.ThumbHeight) / this.MinPos;
            }
            this.setScroll(this.ScrollPos);
        };
        ScrollController.prototype.setScroll = function (pos) {
            if (pos > 0)
                pos = 0;
            else if (pos < this.MinPos)
                pos = this.MinPos;
            this.ScrollPos = Math.round(pos);
            this.Content.style.top = this.ScrollPos + "px";
            this.redraw();
        };
        ScrollController.prototype.scroll = function (delta) {
            this.setScroll(this.ScrollPos - delta);
        };
        ScrollController.prototype.setupEvents = function () {
            var inst = this;
            this.Container.addEventListener("wheel", onWheel);
            this.ScrollThumb.addEventListener("mousedown", onThumbMouseDown);
            uilib.addElementResizeListener(this.Container, onContainerResized);
            uilib.addElementResizeListener(this.Content, onContentResized);
            var startMouseY = 0;
            var startScrollPos = 0;
            function onWheel(ev) {
                var delta = ev.deltaY > 0 ? inst.WheelVelocity : -inst.WheelVelocity;
                inst.scroll(delta);
                ev.preventDefault();
            }
            function onContainerResized(ev) {
                inst.calcDimensions();
            }
            function onContentResized(ev) {
                inst.calcDimensions();
            }
            function onThumbMouseMove(ev) {
                var offset = ev.clientY - startMouseY;
                if (inst.ThumbScale != 0) {
                    var scrollOffset = offset / inst.ThumbScale;
                    inst.setScroll(startScrollPos + scrollOffset);
                }
                ev.preventDefault();
            }
            function onThumbMouseUp(ev) {
                document.removeEventListener("mousemove", onThumbMouseMove);
                document.removeEventListener("mouseup", onThumbMouseUp);
            }
            function onThumbMouseDown(ev) {
                startMouseY = ev.clientY;
                startScrollPos = inst.ScrollPos;
                document.addEventListener("mousemove", onThumbMouseMove);
                document.addEventListener("mouseup", onThumbMouseUp);
                ev.preventDefault();
            }
        };
        return ScrollController;
    })();
    function makeScrollPanel(container, opts) {
        if (!opts)
            opts = {};
        container.style.overflow = "hidden";
        return new ScrollController(container, opts);
    }
    scrolldiv.makeScrollPanel = makeScrollPanel;
})(scrolldiv || (scrolldiv = {}));
/// <reference path="uilib.ts" />
var treecontrol;
(function (treecontrol) {
    var TreeControl = (function () {
        function TreeControl(container, opts) {
            this.Container = container;
            this.Items = {};
            this.Renameable = opts.renameable != null ? opts.renameable : true;
            this.Reorderable = opts.reorderable != null ? opts.reorderable : true;
            this.Root = new TreeNode("_root", null, this);
            this.Root.setupChildren();
            this.Container.appendChild(this.Root.ChildrenElement);
        }
        TreeControl.prototype.getNode = function (id) {
            return this.Items[id];
        };
        TreeControl.prototype.addItem = function (id, text) {
            return this.Root.addChild(id, text);
        };
        return TreeControl;
    })();
    treecontrol.TreeControl = TreeControl;
    var TreeNode = (function () {
        function TreeNode(id, text, tree) {
            this.ID = id;
            this.Tree = tree;
            this.Element = document.createElement("li");
            this.Element.classList.add("uic_nodeEmpty");
            this.Collapsed = false;
            var node = this;
            if (text != null) {
                //var labelContainer:HTMLSpanElement = document.createElement("span");
                var labelContainer = document.createElement("div");
                labelContainer.classList.add("uic_treeLabel");
                this.Element.appendChild(labelContainer);
                labelContainer.innerHTML = text;
                this.Label = labelContainer.firstChild;
                if (this.Tree.Renameable) {
                    uilib.addClickAndHoverListener(labelContainer, function (e) {
                        var endEdit = function () {
                            node.Editing = false;
                            labelContainer.style.display = "inline";
                            node.Label.data = labelEdit.value;
                            document.removeEventListener("mousedown", clickCatcher);
                            labelEdit.removeEventListener("keypress", onEnter);
                            node.Element.removeChild(labelEdit);
                        };
                        labelContainer.style.display = "none";
                        var labelEdit = document.createElement("input");
                        labelEdit.type = "text";
                        labelEdit.value = node.Label.data;
                        node.Editing = true;
                        node.Element.insertBefore(labelEdit, labelContainer);
                        labelEdit.focus();
                        var clickCatcher = function (md) {
                            window.removeEventListener("mousedown", clickCatcher);
                            endEdit();
                            e.stopPropagation();
                        };
                        var onEnter = function (kd) {
                            if (kd.keyCode == 13)
                                endEdit();
                        };
                        labelEdit.addEventListener("keypress", onEnter);
                        window.addEventListener("mousedown", clickCatcher);
                    });
                }
                if (this.Tree.Reorderable) {
                    labelContainer.draggable = true;
                    labelContainer.addEventListener("dragstart", function (ev) {
                        ev.dataTransfer.setData('Text', id);
                    });
                }
                this.Element.addEventListener("click", function (e) {
                    console.log("Clicked on: " + e.target);
                    node.toggleExpanded();
                    e.stopPropagation();
                });
            }
        }
        TreeNode.prototype.expand = function () {
            if (this.Collapsed == false || !this.Children || this.Editing)
                return;
            this.Element.classList.remove("uic_nodeCollapsed");
            this.Element.classList.add("uic_nodeExpanded");
            this.Collapsed = false;
            this.ChildrenElement.style.display = "block";
        };
        TreeNode.prototype.collapse = function () {
            if (this.Collapsed || !this.Children || this.Editing)
                return;
            this.Element.classList.remove("uic_nodeExpanded");
            this.Element.classList.add("uic_nodeCollapsed");
            this.Collapsed = true;
            this.ChildrenElement.style.display = "none";
        };
        TreeNode.prototype.toggleExpanded = function () {
            if (this.Collapsed)
                this.expand();
            else
                this.collapse();
        };
        TreeNode.prototype.addChild = function (id, text) {
            if (this.Tree.Items[id])
                throw "Item " + id + " already exists in tree";
            var item = new TreeNode(id, text, this.Tree);
            item.Parent = this;
            this.Tree.Items[id] = item;
            if (this.Children == null) {
                this.Element.classList.remove("uic_nodeEmpty");
                this.Element.classList.add("uic_nodeExpanded");
                this.setupChildren();
            }
            this.Children.push(item);
            this.ChildrenElement.appendChild(item.Element);
            return item;
        };
        TreeNode.prototype.addChildAfter = function (node, after) {
        };
        TreeNode.prototype.remove = function () {
            var node = this;
            var deleteFunc = function (n) {
                delete node.Tree.Items[n.ID];
                if (n.Children != null) {
                    for (var i = 0; i < node.Children.length; i++) {
                        var child = node.Children[i];
                        deleteFunc(child);
                    }
                }
            };
            deleteFunc(this);
            var parent = this.Parent;
            parent.ChildrenElement.removeChild(this.Element);
            parent.Children.splice(parent.Children.indexOf(this), 1);
            if (parent.Children.length == 0) {
                parent.Children = null;
                parent.Element.removeChild(parent.ChildrenElement);
                parent.ChildrenElement = null;
                parent.Element.classList.remove("uic_nodeExpanded");
                parent.Element.classList.remove("uic_nodeCollapsed");
                parent.Element.classList.add("uic_nodeEmpty");
                parent.Collapsed = false;
            }
        };
        TreeNode.prototype.setupChildren = function () {
            this.Children = [];
            this.ChildrenElement = document.createElement("ul");
            this.Element.appendChild(this.ChildrenElement);
        };
        TreeNode.prototype.setLabel = function (str) {
            if (!this.Label)
                return;
            this.Label.data = str;
        };
        return TreeNode;
    })();
    treecontrol.TreeNode = TreeNode;
})(treecontrol || (treecontrol = {}));
/// <reference path="scrolldiv.ts" />
/// <reference path="treecontrol.ts" />
var uicrafter;
(function (uicrafter) {
    var SceneTree;
    var ContentArea;
    var SelectRect;
    var DragStartX;
    var DragStartY;
    function mouseEventStopper(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    function blockMouse(t) {
        //t.addEventListener("mousedown", mouseEventStopper);
        //t.addEventListener("click", mouseEventStopper);
    }
    function onContentMouseDown(e) {
        e.preventDefault();
        window.addEventListener("mousemove", onContentMouseMove);
        window.addEventListener("mouseup", onContentMouseUp);
        clearSelectRect();
        SelectRect = document.createElement('div');
        SelectRect.id = "_uic_selectRect";
        ContentArea.appendChild(SelectRect);
        DragStartX = e.clientX - ContentArea.offsetLeft;
        DragStartY = e.clientY - ContentArea.offsetTop;
        SelectRect.style.left = DragStartX + "px";
        SelectRect.style.top = DragStartY + "px";
        SelectRect.style.width = "0px";
        SelectRect.style.height = "0px";
    }
    function clearSelectRect() {
        if (SelectRect == null)
            return;
        SelectRect.parentElement.removeChild(SelectRect);
        SelectRect = null;
    }
    function onContentMouseMove(e) {
        var w = (e.clientX - ContentArea.offsetLeft) - DragStartX;
        var h = (e.clientY - ContentArea.offsetTop) - DragStartY;
        if (w < 0) {
            SelectRect.style.left = (DragStartX + w) + "px";
            SelectRect.style.width = (-w) + "px";
        }
        else {
            SelectRect.style.left = DragStartX + "px";
            SelectRect.style.width = w + "px";
        }
        if (h < 0) {
            SelectRect.style.top = (DragStartY + h) + "px";
            SelectRect.style.height = (-h) + "px";
        }
        else {
            SelectRect.style.top = DragStartY + "px";
            SelectRect.style.height = h + "px";
        }
    }
    function onContentMouseUp(e) {
        window.removeEventListener("mousemove", onContentMouseMove);
        window.removeEventListener("mouseup", onContentMouseUp);
        clearSelectRect();
    }
    function init() {
        ContentArea = document.getElementById("_uic_content");
        ContentArea.addEventListener("mousedown", onContentMouseDown);
        var scenePanel = document.getElementById("_uic_scene");
        blockMouse(scenePanel);
        var toolPanel = document.getElementById("_uic_tools");
        blockMouse(toolPanel);
        var sceneTree = document.getElementById("_uic_scene_tree");
        SceneTree = new treecontrol.TreeControl(sceneTree, {});
        SceneTree.addItem("thing1", "Thing 1");
        SceneTree.addItem("thing2", "Thing 2");
        var node = SceneTree.addItem("thing3", "Thing 3");
        node.addChild("thing4", "Child thing");
        var childNode = node.addChild("thing5", "Child thing 3");
        childNode.addChild("thing6", "grandkid");
        SceneTree.addItem("thing7", "After thing");
        node.setLabel("New thing!");
    }
    init();
})(uicrafter || (uicrafter = {}));
