/// <reference path="scrolldiv.ts" />
/// <reference path="treecontrol.ts" />

module uicrafter
{
	var SceneTree:treecontrol.TreeControl;
	
	var ContentArea:HTMLDivElement;
	
	var SelectRect:HTMLDivElement;
	var DragStartX:number;
	var DragStartY:number;

	function mouseEventStopper(e:MouseEvent):void
	{
		e.stopPropagation();
		e.preventDefault();
	}

	function blockMouse(t:HTMLElement):void
	{
		//t.addEventListener("mousedown", mouseEventStopper);
		//t.addEventListener("click", mouseEventStopper);
	}
	
	function onContentMouseDown(e:MouseEvent):void
	{

		e.preventDefault();

		window.addEventListener("mousemove", onContentMouseMove);
		window.addEventListener("mouseup", onContentMouseUp);

		clearSelectRect();

		SelectRect = document.createElement('div');
		SelectRect.id = "_uic_selectRect";
		ContentArea.appendChild(SelectRect);

		DragStartX = e.clientX-ContentArea.offsetLeft;
		DragStartY = e.clientY-ContentArea.offsetTop;

		SelectRect.style.left = DragStartX+"px";
		SelectRect.style.top = DragStartY+"px";
		SelectRect.style.width = "0px";
		SelectRect.style.height = "0px";
	}

	function clearSelectRect():void
	{
		if(SelectRect == null)
			return;

		SelectRect.parentElement.removeChild(SelectRect);
		SelectRect = null;
	}

	function onContentMouseMove(e:MouseEvent):void
	{
		var w:number = (e.clientX-ContentArea.offsetLeft) - DragStartX;
		var h:number = (e.clientY-ContentArea.offsetTop) - DragStartY;

		if(w < 0)
		{
			SelectRect.style.left = (DragStartX+w)+"px";
			SelectRect.style.width = (-w)+"px";
		}
		else
		{
			SelectRect.style.left = DragStartX+"px";
			SelectRect.style.width = w+"px";
		}
		
		if(h < 0)
		{
			SelectRect.style.top = (DragStartY+h)+"px";
			SelectRect.style.height = (-h)+"px";
		}
		else
		{
			SelectRect.style.top = DragStartY+"px";
			SelectRect.style.height = h+"px";
		}
	}

	function onContentMouseUp(e:MouseEvent):void
	{
		window.removeEventListener("mousemove", onContentMouseMove);
		window.removeEventListener("mouseup", onContentMouseUp);

		clearSelectRect();
	}

	function init():void
	{
		ContentArea = <HTMLDivElement>document.getElementById("_uic_content");
		ContentArea.addEventListener("mousedown", onContentMouseDown);
		
		
		var scenePanel:HTMLDivElement = <HTMLDivElement>document.getElementById("_uic_scene");
		blockMouse(scenePanel);

		var toolPanel:HTMLDivElement = <HTMLDivElement>document.getElementById("_uic_tools");
		blockMouse(toolPanel);
		
		var sceneTree:HTMLDivElement = <HTMLDivElement>document.getElementById("_uic_scene_tree");
		
		SceneTree = new treecontrol.TreeControl(sceneTree, {});
		SceneTree.addItem("thing1", "Thing 1");
		SceneTree.addItem("thing2", "Thing 2");
		var node:treecontrol.TreeNode = SceneTree.addItem("thing3", "Thing 3");
		node.addChild("thing4", "Child thing");
		var childNode:treecontrol.TreeNode = node.addChild("thing5", "Child thing 3");
		childNode.addChild("thing6", "grandkid");
		SceneTree.addItem("thing7", "After thing");
		
		node.setLabel("New thing!");
	}

	init();
}

