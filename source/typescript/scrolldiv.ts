/// <reference path="uilib.ts" />

module scrolldiv
{
	class ScrollController
	{
		WheelVelocity:number = 30;
		MinThumbHeight:number = 20;
		MaxThumbHeight:number = 0;
		
		Container:HTMLDivElement;
		Content:HTMLDivElement;
		TopShadow:HTMLDivElement;
		BottomShadow:HTMLDivElement;
		ScrollThumb:HTMLDivElement;
		
		ContainerHeight:number;
		ContentHeight:number;
		ScrollPos:number = 0;
		MinPos:number = 0;
		ThumbHeight:number = 0;
		ThumbScale:number = 0;
		
		constructor(container:HTMLDivElement, opts:any)
		{
			this.WheelVelocity = opts.wheelVelocity != null ? opts.wheelVelocity : this.WheelVelocity;
			this.MinThumbHeight = opts.minThumbHeight != null ? opts.minThumbHeight : this.MinThumbHeight;
			this.MaxThumbHeight = opts.maxThumbHeight != null ? opts.maxThumbHeight : this.MaxThumbHeight;
			
			this.Container = container;
			this.Content = <HTMLDivElement>container.children[0];
			
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
		
		redraw():void
		{
			var topOpacity:number = this.ScrollPos / -100.0;
			if(topOpacity < 0) topOpacity = 0;
			else if(topOpacity > 1.0) topOpacity = 1.0;
			this.TopShadow.style.opacity = String(topOpacity);
			
			var bottomOpacity:number = (this.ScrollPos - this.MinPos) / 100.0;
			if(bottomOpacity < 0) bottomOpacity = 0;
			else if(bottomOpacity > 1.0) bottomOpacity = 1.0;
			this.BottomShadow.style.opacity = String(bottomOpacity);
			
			if(this.ThumbScale != 0)
			{
				var thumbPos:number = this.ScrollPos*this.ThumbScale;
				this.ScrollThumb.style.top = Math.round(thumbPos)+"px";
			}
		}
		
		calcDimensions():void
		{
			this.ContainerHeight = this.Container.offsetHeight;
			this.ContentHeight = this.Content.offsetHeight;
			this.MinPos = this.ContainerHeight - this.ContentHeight;
			if(this.MinPos > 0)
				this.MinPos = 0;
				
			this.ThumbHeight = this.ContainerHeight * this.ContainerHeight / this.ContentHeight;
			if(this.ThumbHeight < this.MinThumbHeight)
				this.ThumbHeight = this.MinThumbHeight;
			else if(this.MaxThumbHeight > 0 && this.ThumbHeight > this.MaxThumbHeight)
				this.ThumbHeight = this.MaxThumbHeight;
						
			if(this.ContentHeight == 0 || this.ContainerHeight > this.ContentHeight)
			{
				this.ScrollThumb.style.display = "none";
				this.ThumbScale = 0;
			}
			else
			{
				this.ScrollThumb.style.display = "block";
				this.ScrollThumb.style.height = this.ThumbHeight+"px";
				this.ThumbScale = (this.ContainerHeight - this.ThumbHeight) / this.MinPos;
			}
			
			this.setScroll(this.ScrollPos);
		}
		
		setScroll(pos:number):void
		{
			if(pos > 0) pos = 0;
			else if(pos < this.MinPos) pos = this.MinPos;
			this.ScrollPos = Math.round(pos);
			this.Content.style.top = this.ScrollPos+"px";
			
			this.redraw();
		}
		
		scroll(delta:number):void
		{
			this.setScroll(this.ScrollPos - delta);
		}
		
		setupEvents():void
		{
			var inst:ScrollController = this;
			this.Container.addEventListener("wheel", onWheel);
			this.ScrollThumb.addEventListener("mousedown", onThumbMouseDown );	
			uilib.addElementResizeListener(this.Container, onContainerResized);
			uilib.addElementResizeListener(this.Content, onContentResized);
			
			var startMouseY:number = 0;
			var startScrollPos:number = 0;
			
			function onWheel(ev:WheelEvent):void
			{
				var delta:number = ev.deltaY > 0 ? inst.WheelVelocity : -inst.WheelVelocity;
				inst.scroll(delta);
				
				ev.preventDefault();
			}
			
			function onContainerResized(ev:UIEvent):void
			{
				inst.calcDimensions();
			}
			
			function onContentResized(ev:UIEvent):void
			{
				inst.calcDimensions();
			}
			
			function onThumbMouseMove(ev:MouseEvent):void
			{
				var offset:number = ev.clientY - startMouseY;
				
				if(inst.ThumbScale != 0)
				{
					var scrollOffset:number = offset / inst.ThumbScale;
					inst.setScroll(startScrollPos + scrollOffset);
				}
				
				ev.preventDefault();
			}
			
			function onThumbMouseUp(ev:MouseEvent):void
			{
				document.removeEventListener("mousemove", onThumbMouseMove );
				document.removeEventListener("mouseup", onThumbMouseUp );	
			}
			
			function onThumbMouseDown(ev:MouseEvent):void
			{
				startMouseY = ev.clientY;
				startScrollPos = inst.ScrollPos;
				
				document.addEventListener("mousemove", onThumbMouseMove );
				document.addEventListener("mouseup", onThumbMouseUp );
				
				ev.preventDefault();
			}
			
		}
		
		
		
	}
	
	export function makeScrollPanel(container:HTMLDivElement, opts:any):ScrollController
	{
		if(!opts) opts = {};

		container.style.overflow = "hidden";
		
		return new ScrollController(container, opts);
		
	}
}
