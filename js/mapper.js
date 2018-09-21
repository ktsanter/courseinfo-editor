//
//
const app = function () {
	const PAGE_TITLE = 'Course info mapper'
		
	const page = {
		body: null,
		notice: null,
		title: null,
		itemtree: null
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
						
		page.body.classList.add('cif-colorscheme');
		page.header.classList.add('cif-title');
		page.notice.classList.add('cif-notice');			
		
		page.header.toolname.innerHTML = PAGE_TITLE;
		
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
		
//		page.itemtree.on('tree.select', function(e) {_treeSelectHandler(e);} );
		page.itemtree.on('tree.click', function(e) { _treeClickHandler(e);} );
	}
	
	function _renderSelectedItems() {
		console.log('render items');
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