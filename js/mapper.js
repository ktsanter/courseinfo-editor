//
// TODO: add retrieval and dropdown for course list
// TODO: initialize settings.selectedItems based on course selection
// TODO: add save for mappings per course
// TODO: move some more CSS to common?
// TODO: consider way to reorder list and have it preserved between tree selections
//
const app = function () {
	const PAGE_TITLE = 'Course info mapper'
		
	const page = {
		body: null,
		notice: null,
		title: null,
		itemtree: null,
		mapspace: null
	};
	
	const settings = {
	};
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];

		page.header = document.getElementById('header');
		page.header.toolname = document.getElementById('toolname');
		page.header.controls = document.getElementById('controls');

		page.notice = document.getElementById('notice');
		page.title = document.getElementById('title');

		page.itemtree = $('#tree1');
		page.mapspace = document.getElementById('mapspace');
		
		page.body.classList.add('cif-colorscheme');
		page.header.classList.add('cif-title');
		page.notice.classList.add('cif-notice');			
		
		page.header.toolname.innerHTML = PAGE_TITLE;
		
		settings.selectedItems = [];
		
		_setNotice('initializing...');
		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
            _renderPage();
		}
	}
	
	//-------------------------------------------------------------------------------------
	// query params:
	//-------------------------------------------------------------------------------------
	function _initializeSettings() {
		var result = false;
/*
		var params = {};
		var urlParams = new URLSearchParams(window.location.search);
		params.navmode = urlParams.has('navmode');
		params.coursekey = urlParams.has('coursekey') ? urlParams.get('coursekey') : null;

		settings.navmode = params.navmode;
		settings.coursekey = params.coursekey;
		
		if (params.navmode || params.coursekey != null) {
			result = true;
		}
*/
result = true;	
		return result;
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
	function _renderPage() {
		var elemSave= _makeButton('btnSave', 'cif-control', '💾', 'save', _saveButtonClicked);
		var elemReload = _makeButton('btnReload', 'cif-control', '🔄', 'reload', _reloadButtonClicked);
		page.savebutton = elemSave;
		page.reloadbutton = elemReload;

		page.header.controls.appendChild(elemSave);
		page.header.controls.appendChild(elemReload);
		
		_getItemTree(_setNotice, _setupTree);
	}	
	
	function _setupTree(jsonTree) {
		page.itemtree.tree({
			data: JSON.parse(jsonTree.tree),
			slide: false
		});
		
		page.itemtree.on('tree.click', function(e) { _treeClickHandler(e);} );
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
				});
			}
		}
	}

	function _updateSelectedItemList() {
		var list = settings.selectedItems;
		
		var root = page.itemtree.tree('getTree');
		var treelist = _getSelectedNodes(root);	
		
		list = treelist;  // make deltas to list based on treelist first?
		
		settings.selectedItems = list;
	}
	
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
	function _saveButtonClicked() {
		console.log('save');
	}
	
	function _reloadButtonClicked() {
		console.log('reload');
	}
	
	function _treeClickHandler(e) {
		if (e.node == null) return;

        e.preventDefault(); // prevent single selection
        var selectedNode = e.node;

		var makeSelected = !page.itemtree.tree('isNodeSelected', selectedNode);
		_propagateSelection(selectedNode, makeSelected);
		_renderSelectedItems();
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
	
	function _getSelectedNodes(basenode) {
		var list = [];
		
		if (basenode.hasOwnProperty('content')) {
			if (_isLeaf(basenode) && page.itemtree.tree('isNodeSelected', basenode)) {
				list.push(basenode);
			}
		}
		
		var children = basenode.children;
		for (var i = 0; i < children.length; i++) {
			 list = list.concat(_getSelectedNodes(children[i]));
		}
			
		return list;
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
	
	function _isLeaf(node) {
		return (node.children.length == 0);
	}
	
	return {
		init: init
 	};
}();