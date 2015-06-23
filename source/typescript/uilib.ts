type UIEventListener = (ev:UIEvent)=>any;
type MouseEventListener = (ev:MouseEvent)=>any;

// Terrible type extensions for terrible resize event hack

interface HTMLElement
{
	__resizeListeners__:UIEventListener[];
	__resizeTrigger__:HTMLObjectElement;
}

interface EventTarget
{
	__resizeOwner__:HTMLElement;
}

module uilib
{
	// Terrible element resize hack methods
	function resizeTriggerListener(e:UIEvent):void
	{
		var win:EventTarget = e.target;
		var trigger:HTMLElement = win.__resizeOwner__;
		trigger.__resizeListeners__.forEach(function(fn:UIEventListener)
		{
			fn.call(trigger, e);
		});
	}
	
	export function addElementResizeListener(element:HTMLElement, listener:UIEventListener):void
	{
		function onLoad(e:Event):void
		{
			obj.onload = null;
			obj.contentDocument.defaultView.__resizeOwner__ = element;
			obj.contentDocument.defaultView.addEventListener('resize', resizeTriggerListener);
		}
		
		if (!element.__resizeListeners__)
		{
			element.__resizeListeners__ = [];
			if (getComputedStyle(element).position == 'static')
				element.style.position = 'relative';
			var obj:HTMLObjectElement = element.__resizeTrigger__ = document.createElement('object'); 
			obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
			obj.onload = onLoad;
			obj.type = 'text/html';
			obj.data = 'about:blank';
			element.appendChild(obj);
		}
		element.__resizeListeners__.push(listener);
	}

	export function removeElementResizeListener(element:HTMLElement, listener:UIEventListener):void
	{
		element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(listener), 1);
		if (!element.__resizeListeners__.length)
		{
			element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeTriggerListener);
			element.removeChild(element.__resizeTrigger__);
			element.__resizeTrigger__ = null;
			element.__resizeListeners__ = null;
		}
	}
	// end horrible hack stuff
	
	export function addClickAndHoverListener(element:HTMLElement, listener:MouseEventListener):void
	{
		element.addEventListener("click", function(e:MouseEvent):void
		{
			var timer:number = setTimeout(function():void
			{
				window.removeEventListener("mousemove", onMouseMove);
				listener(e);
			}, 800);
			
			var onMouseMove:MouseEventListener = function(e:MouseEvent):void
			{
				clearTimeout(timer);
				window.removeEventListener("mousemove", onMouseMove);
			};
			window.addEventListener("mousemove", onMouseMove);
		});
	}
}


