//
// TODO: move some more CSS to common?
// TODO: add iframe resizer code
//
const app = function () {
	const PAGE_TITLE = 'Course info presenter'
	const NO_COURSE = 'NO_COURSE';
		
	const page = {
		body: null,
		notice: null,
		title: null,
		itemtree: null,
		mapspace: null
	};
	
	const settings = {
		"coursekey": NO_COURSE
	};
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];

		page.notice = document.getElementById('notice');
		page.title = document.getElementById('title');

		page.itemtree = $('#infotree');
		page.mapspace = document.getElementById('contents');
				
		settings.selectedItems = [];
		
		_setNotice('initializing...');
		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
			_getItemTree(_setNotice, _setupTree);
		}
	}
	
	//-------------------------------------------------------------------------------------
	// query params:
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;

		var params = {};
		var urlParams = new URLSearchParams(window.location.search);
		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;

		settings.coursekey = params.coursekey;
		
		if (params.coursekey != null) {
			result = true;
		}
		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
	function _setupTree(jsonTree) {
		page.itemtree.tree({
			data: JSON.parse(jsonTree.tree)
		});
		
		_getItemList(settings.coursekey, _setNotice, _loadMapping);
	}
	
	function _renderSelectedItems() {
		_updateSelectedItemList();
		
		var elemWrapper = page.mapspace;
		while (elemWrapper.childNodes.length > 0) {
			elemWrapper.removeChild(elemWrapper.childNodes[0]);
		}

		for (var i = 0; i < settings.selectedItems.length; i++) {
			_renderItem(settings.selectedItems[i]);
		}
		
		_addAccordionHandlers();
	}
		
	function _renderItem(item) {
		var elemLabel = document.createElement('button');
		elemLabel.classList.add('ci-accordion');
		elemLabel.innerHTML = item.content.label;
		
		var elemInfo = document.createElement('div');
		elemInfo.classList.add('ci-panel');
		elemInfo.innerHTML = formatTextFromMarkup(item.content.markdown, false);
		
		page.mapspace.appendChild(elemLabel);
		page.mapspace.appendChild(elemInfo);
	}
	
	function _addAccordionHandlers() {
		var acc = document.getElementsByClassName("ci-accordion");
		var i;

		for (i = 0; i < acc.length; i++) {
			if (acc[i].id != 'has_handler') {
				acc[i].id = 'has_handler';  // avoid duplicate handlers

				acc[i].addEventListener("click", function(evt) {
					// toggle active state for this panel and set display accordingly
					this.classList.toggle("ci-active");
					
					panel = this.nextElementSibling;
					if (panel.style.display === "block") {
						panel.style.display = "none";
					} else {
						panel.style.display = "block";
					}

					// hide contents of any other open panels
					var activePanels = document.getElementsByClassName("ci-active");
					for (var j = 0; j < activePanels.length; j++) {
						var activePanel = activePanels[j];
						if (activePanel != this) {
							activePanel.classList.remove("ci-active");
							activePanel.nextElementSibling.style.display = "none";
						}
					}
					
					_postHeightChangeMessage();
				});
			}
		}
		
		_postHeightChangeMessage();				
	}

	function _updateSelectedItemList() {
		var list = settings.selectedItems;
		
		var root = page.itemtree.tree('getTree');
		var treelist = _getSelectedNodes(root, true);	
		
		list = treelist;
		
		settings.selectedItems = list;
	}
	
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------

	//------------------------------------------------------------------
	// tree support routines 
	//------------------------------------------------------------------
	function _loadMapping(data) {
		page.title.innerHTML = 'Expectations and FAQs for ' + data.coursefullname;
		var idlist = JSON.parse(data.itemlist);
		_setTreeSelection(page.itemtree.tree('getTree'), idlist);
		_renderSelectedItems();	
	}
	
	function _clearTreeSelections() {
		var root = page.itemtree.tree('getTree');
		_propagateSelection(root, false);
	}
	
	function _setTreeSelection(basenode, idlist) {
		if (valIsInArray(basenode.id, idlist)) {
			page.itemtree.tree('addToSelection', basenode);
		} else {
			page.itemtree.tree('removeFromSelection', basenode);
		}
		
		for (var i = 0; i < basenode.children.length; i++) {
			_setTreeSelection(basenode.children[i], idlist);
		}
	}

	function _propagateSelection(baseNode, makeSelected) {
		var action = 'removeFromSelection';
		if (makeSelected) action = 'addToSelection';

		page.itemtree.tree(action, baseNode);
		var children = baseNode.children;
		for (var i = 0; i < children.length; i++) {
			_propagateSelection(children[i], makeSelected);
		}
	}
	
	function _getSelectedNodes(basenode, leafonly) {
		var list = [];
		
		if (basenode.hasOwnProperty('content')) {
			if ((_isLeaf(basenode) || !leafonly) && page.itemtree.tree('isNodeSelected', basenode)) {
				list.push(basenode);
			}
		}
		
		var children = basenode.children;
		for (var i = 0; i < children.length; i++) {
			 list = list.concat(_getSelectedNodes(children[i], leafonly));
		}
			
		return list;
	}

	function _isLeaf(node) {
		return (node.children.length == 0);
	}	
		
	//---------------------------------------
	// utility functions
	//----------------------------------------
	function _setNotice (label) {
		page.notice.innerHTML = label;

		if (label == '') {
			page.notice.style.display = 'none'; 
			page.notice.style.visibility = 'hidden';
		} else {
			page.notice.style.display = 'block';
			page.notice.style.visibility = 'visible';
		}
	}
		
	function _makeButton(id, className, label, tooltip, listener) {
		var btn = document.createElement('button');
		btn.id = id;
		btn.classList.add(className);
		btn.innerHTML = label;
		btn.title = tooltip;
		btn.addEventListener('click', listener, false);
		return btn;
	}
	
	function valIsInArray(val, arr) {
		var found = false;
		
		for (var i = 0; i < arr.length && !found; i++) {
			if (val == arr[i]) found = true;
		}
		return found;
	}
	
	//-----------------------------------------------------------------------------------
	// iframe responsive height - post message to parent (if in an iframe) to resizeBy
	//-----------------------------------------------------------------------------------
	function _postHeightChangeMessage() {
		var msg = document.body.scrollHeight + '-' + 'CourseInfoGenerator';
		//console.log('posting to parent: ' + msg);
		window.parent.postMessage(msg, "*");
	}

	return {
		init: init
 	};
}();