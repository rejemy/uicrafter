module uicrafter
{
	var ContentArea:HTMLDivElement;
	
	var SelectRect:HTMLDivElement;
	var DragStartX:number;
	var DragStartY:number;

	function mouseEventStopper(e:MouseEvent):void
	{
		e.stopPropagation();
	}

	function blockMouse(t:HTMLElement):void
	{
		t.addEventListener("mousedown", mouseEventStopper);
		t.addEventListener("click", mouseEventStopper);
	}

	function onContentMouseDown(e:MouseEvent):void
	{
		e.preventDefault();

		window.addEventListener("mousemove", onContentMouseMove);
		window.addEventListener("mouseup", onContentMouseUp);

		clearSelectRect();

		SelectRect = document.createElement('div');
		SelectRect.id = "_uic_selectRect";
		document.body.appendChild(SelectRect);

		SelectRect.style.left = e.clientX+"px";
		SelectRect.style.top = e.clientY+"px";
		SelectRect.style.width = "0px";
		SelectRect.style.height = "0px";

		DragStartX = e.clientX;
		DragStartY = e.clientY;
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
		var w:number = e.clientX - DragStartX;
		var h:number = e.clientY - DragStartY;

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

		window.addEventListener("mousedown", onContentMouseDown);

		var scenePanel:HTMLDivElement = <HTMLDivElement>document.getElementById("_uic_scene");
		blockMouse(scenePanel);

		var toolPanel:HTMLDivElement = <HTMLDivElement>document.getElementById("_uic_tools");
		blockMouse(toolPanel);
	}

	init();
}

