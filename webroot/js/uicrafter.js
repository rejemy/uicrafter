var uicrafter;
(function (uicrafter) {
    var ContentArea;
    var SelectRect;
    var DragStartX;
    var DragStartY;
    function mouseEventStopper(e) {
        e.stopPropagation();
    }
    function blockMouse(t) {
        t.addEventListener("mousedown", mouseEventStopper);
        t.addEventListener("click", mouseEventStopper);
    }
    function onContentMouseDown(e) {
        e.preventDefault();
        window.addEventListener("mousemove", onContentMouseMove);
        window.addEventListener("mouseup", onContentMouseUp);
        clearSelectRect();
        SelectRect = document.createElement('div');
        SelectRect.id = "_uic_selectRect";
        document.body.appendChild(SelectRect);
        SelectRect.style.left = e.clientX + "px";
        SelectRect.style.top = e.clientY + "px";
        SelectRect.style.width = "0px";
        SelectRect.style.height = "0px";
        DragStartX = e.clientX;
        DragStartY = e.clientY;
    }
    function clearSelectRect() {
        if (SelectRect == null)
            return;
        SelectRect.parentElement.removeChild(SelectRect);
        SelectRect = null;
    }
    function onContentMouseMove(e) {
        var w = e.clientX - DragStartX;
        var h = e.clientY - DragStartY;
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
        window.addEventListener("mousedown", onContentMouseDown);
        var scenePanel = document.getElementById("_uic_scene");
        blockMouse(scenePanel);
        var toolPanel = document.getElementById("_uic_tools");
        blockMouse(toolPanel);
    }
    init();
})(uicrafter || (uicrafter = {}));
