/// <reference path="uilib.ts" />

module treecontrol
{
	export class TreeControl
	{
		Container:HTMLDivElement;
		Root:TreeNode;
		Items:{[id:string]:TreeNode};
		Renameable:Boolean;
		Reorderable:Boolean;
		
		constructor(container:HTMLDivElement, opts:any)
		{
			this.Container = container;
			this.Items = {};
			
			this.Renameable = opts.renameable != null ? opts.renameable : true;
			this.Reorderable = opts.reorderable != null ? opts.reorderable : true;
			
			this.Root = new TreeNode("_root", null, this);
			this.Root.setupChildren();
			this.Container.appendChild(this.Root.ChildrenElement);
		}
		
		getNode(id:string):TreeNode
		{
			return this.Items[id];
		}
		
		addItem(id:string, text:string):TreeNode
		{
			return this.Root.addChild(id, text);
		}

		
	}
	
	export class TreeNode
	{
		ID:string;
		Tree:TreeControl;
		Parent:TreeNode;
		Children:TreeNode[];
		Label:Text;
		Collapsed:boolean;
		Element:HTMLLIElement;
		ChildrenElement:HTMLUListElement;
		Editing:boolean;
		
		constructor(id:string, text:string, tree:TreeControl)
		{
			this.ID = id;
			this.Tree = tree;
			this.Element = document.createElement("li");
			this.Element.classList.add("uic_nodeEmpty");
			this.Collapsed = false;
			
			var node:TreeNode = this;
			
			if(text != null)
			{
				//var labelContainer:HTMLSpanElement = document.createElement("span");
				var labelContainer:HTMLDivElement = document.createElement("div");
				labelContainer.classList.add("uic_treeLabel");
				this.Element.appendChild(labelContainer);
				labelContainer.innerHTML = text;
				this.Label = <Text>labelContainer.firstChild;
				
				if(this.Tree.Renameable)
				{

					uilib.addClickAndHoverListener(labelContainer, function(e:MouseEvent):void
					{
						var endEdit:()=>any = function():void
						{
							node.Editing = false;
							labelContainer.style.display = "inline";
							node.Label.data = labelEdit.value;
							document.removeEventListener("mousedown", clickCatcher);
							labelEdit.removeEventListener("keypress", onEnter);
							node.Element.removeChild(labelEdit);
						};
					
						labelContainer.style.display = "none";
						
						var labelEdit:HTMLInputElement = document.createElement("input");
						labelEdit.type = "text";
						labelEdit.value = node.Label.data;
						
						node.Editing = true;
						node.Element.insertBefore(labelEdit, labelContainer);
						labelEdit.focus();
						
						var clickCatcher:MouseEventListener = function(md:MouseEvent):void
						{
							window.removeEventListener("mousedown", clickCatcher);
							endEdit();
							e.stopPropagation();
						};
						
						var onEnter:(kd:KeyboardEvent)=>any = function(kd:KeyboardEvent):void
						{
							if(kd.keyCode == 13)
								endEdit();
						};
						
						labelEdit.addEventListener("keypress", onEnter);
						
						window.addEventListener("mousedown", clickCatcher);
					});
				}
				
				if(this.Tree.Reorderable)
				{
					labelContainer.draggable = true;
					labelContainer.addEventListener("dragstart", function(ev:DragEvent):void
					{
						ev.dataTransfer.setData('Text', id);	
					});
				}
				
				this.Element.addEventListener("click", function(e:MouseEvent):void
				{
					console.log("Clicked on: "+e.target);
					node.toggleExpanded();
					e.stopPropagation();
				});
			}

			
		}
		
		expand():void
		{
			if(this.Collapsed == false || !this.Children || this.Editing)
				return;
				
			this.Element.classList.remove("uic_nodeCollapsed");
			this.Element.classList.add("uic_nodeExpanded");
			
			this.Collapsed = false;
			
			this.ChildrenElement.style.display = "block";
		}
		
		collapse():void
		{
			if(this.Collapsed || !this.Children || this.Editing)
				return;
			
			this.Element.classList.remove("uic_nodeExpanded");
			this.Element.classList.add("uic_nodeCollapsed");
			
			this.Collapsed = true;
			
			this.ChildrenElement.style.display = "none";
		}
		
		toggleExpanded():void
		{
			if(this.Collapsed)
				this.expand();
			else
				this.collapse();
		}
		
		addChild(id:string, text:string):TreeNode
		{
			if(this.Tree.Items[id])
				throw "Item "+id+" already exists in tree";
				
			var item:TreeNode = new TreeNode(id, text, this.Tree);
			item.Parent = this;
			this.Tree.Items[id] = item;
			
			if(this.Children == null)
			{
				this.Element.classList.remove("uic_nodeEmpty");
				this.Element.classList.add("uic_nodeExpanded");
				this.setupChildren();
			}
			
			this.Children.push(item);
			this.ChildrenElement.appendChild(item.Element);
			
			return item;
		}
		
		addChildAfter(node:TreeNode, after:TreeNode):void
		{
			
		}
		
		remove():void
		{
			var node:TreeNode = this;
			
			var deleteFunc = function(n:TreeNode):void
			{
				delete node.Tree.Items[n.ID];
				if(n.Children != null)
				{
					for(var i:number=0; i<node.Children.length; i++)
					{
						var child:TreeNode = node.Children[i];
						deleteFunc(child);
					}
				}
			}
			deleteFunc(this);
			
			var parent:TreeNode = this.Parent;
			parent.ChildrenElement.removeChild(this.Element);
			parent.Children.splice(parent.Children.indexOf(this), 1);
			if(parent.Children.length == 0)
			{
				parent.Children = null;
				parent.Element.removeChild(parent.ChildrenElement);	
				parent.ChildrenElement = null;
				
				parent.Element.classList.remove("uic_nodeExpanded");
				parent.Element.classList.remove("uic_nodeCollapsed");
				parent.Element.classList.add("uic_nodeEmpty");
				
				parent.Collapsed = false;
			}
		}
		
		setupChildren():void
		{
			this.Children = [];
			this.ChildrenElement = document.createElement("ul");
			this.Element.appendChild(this.ChildrenElement);			
		}
		
		setLabel(str:string):void
		{
			if(!this.Label)
				return;
				
			this.Label.data = str;
		}
		
	}
}