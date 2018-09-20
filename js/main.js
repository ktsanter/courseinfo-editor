//
// TODO: incorporate standard CSS into MD display
// TODO: add flattened node list to save data
//
const app = function () {
	const PAGE_TITLE = 'Course info editor'
		
	const page = {
		body: null,
		notice: null,
		title: null,
		itemtree: null,
		editspace: null,
		edittitle: null,
		editarea: null,
		previewtitle: null,
		previewarea: null,
		menu: null,
		menuitem: null
	};
	
	const settings = {
		currentnode: null,
		contextmenuitem: ''
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
		page.editspace	 = $("#editspace");
		page.edittitle = $("#edit-title");
		page.editarea = $("#markdown-edit");
		page.previewtitle = $("#preview-title");
		page.previewarea = $("#preview");
		page.menu = document.getElementById('contextmenu');
		page.menuitem = document.getElementById('contextmenu-item');
						
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

		page.edittitle.on('input', function () {
			handleEditChanges();
		});
		page.editarea.bind('input change', function() {
			handleEditChanges();
		});
		page.editspace.on('focusout', function() {
			handleEditspaceLostFocus();
		});
		
		$(".menu-option").on('click', function(e) {_contextMenuHandler(e);}); 
		window.addEventListener('keyup', function(e) {
			if (e.which == 27) displayMenu('hide');
		});
		window.addEventListener('click', function(e) {
			displayMenu('hide');
		});
		
		_getItemTree(_setNotice, _setupTree);
	}	
	
	function _setupTree(jsonTree) {
		$(function() {
			page.itemtree.tree({
				data: JSON.parse(jsonTree.tree),
				dragAndDrop: true,
				slide: false
			});
		});
		
		page.itemtree.on('tree.select', function(e) {_treeSelectHandler(e);} );
		page.itemtree.on('tree.contextmenu', function(e) {_treeRightClickHandler(e);} );
		page.itemtree.on('tree.click', function(e) {displayMenu('hide');} );
		page.itemtree.on('tree.open', function(e) {displayMenu('hide');} );
		page.itemtree.on('tree.close', function(e) {displayMenu('hide');} );
		page.itemtree.on('tree.move', function(e) {displayMenu('hide');} );
		
		// after tree loads, auto select first item if it exists
		page.itemtree.on(
			'tree.init',
			function() {
				var root = page.itemtree.tree('getTree');
				if (root.children.length > 0) {
					page.itemtree.tree('selectNode', root.children[0]);
				}
			}
		);
	}
	
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
	function _saveButtonClicked() {
		var jsonTree = page.itemtree.tree('toJson');
		_putItemTree(jsonTree, _setNotice, function() {});
	}
	
	function _reloadButtonClicked() {
		if (confirm('Any changes will be lost.  Are you sure you want to reload?\n\nPress OK to reload.')) {
			_getItemTree(_setNotice, _reloadTree);
		}
	}
	
	function _reloadTree(jsonTree) {
		page.itemtree.tree('loadData', JSON.parse(jsonTree.tree));
		var root = page.itemtree.tree('getTree');
		if (root.children.length > 0) {
			page.itemtree.tree('selectNode', root.children[0]);
		}
	}
	
	function _treeSelectHandler(e) {
		if (e.node == null) return;

		var newNode = page.itemtree.tree('getNodeById', e.node.id);
		
		displayMenu('hide');

		_storeCurrentNodeEditwork();
		
		_loadNodeContent(newNode);
		settings.currentnode = newNode;
		
		handleEditChanges();
	}
	
	function _treeRightClickHandler(e) {
		settings.contextmenuitem = page.itemtree.tree('getNodeById', e.node.id);;
		setMenuPosition(e.click_event.pageX, e.click_event.pageY);
	}
	
	function _contextMenuHandler(e) {
		if (e.currentTarget.id == 'add') {
			_addNodeAfter(settings.contextmenuitem);
		} else if (e.currentTarget.id == 'delete') {
			_removeNode(settings.contextmenuitem);
		}
		
		displayMenu('hide');
	}
	
	function _addNodeAfter(node) {
		var newId = _getUniqueTreeId();  // get id for new node

		page.itemtree.tree('selectNode', null);  // deselect any selected nodes
		page.itemtree.tree(   // append new node
		    'addNodeAfter', {
				name: 'new_node', 
				id: newId,
				content: {label: 'new_node', markdown: ''}
			}, 
		node);  
		
		page.itemtree.tree('selectNode', page.itemtree.tree('getNodeById', newId));  // select new node
	}
	
	function _removeNode(node) {
		if (confirm('The item named \n"' + node.content.label + '"\nwill be permanently removed along with any children.\n\nPress OK to delete the item.')) {
			page.itemtree.tree('removeNode', node);
		}
	}
	
	function handleEditChanges() {
		page.previewtitle.html('Preview: ' + page.edittitle.val());
		var orig = page.editarea.val();
		var formatted = formatTextFromMarkup(orig, false);
		page.previewarea.html(formatted);
	}
	
	function handleEditspaceLostFocus() {
		_storeCurrentNodeEditwork();
	}

	function _storeCurrentNodeEditwork() {
		var node = settings.currentnode;
				
		if (node != null) {
			var name = page.edittitle.val();
			if (name.length > 40) name = name.substring(0,40) + '...';
			var content = {label: page.edittitle.val(), markdown: page.editarea.val()};
			page.itemtree.tree('updateNode', node, {name: name, content: content} );
		}
	}
	
	function _loadNodeContent(node) {
		if (node.hasOwnProperty('content')){
			page.edittitle.val(node.content.label);
			page.previewtitle.html('Preview: ' + node.content.label);
			page.editarea.val(node.content.markdown);
		} else {
			page.edittitle.val('');
			page.previewtitle.html('Preview:');
			page.editarea.val('');
		}
		
		if (_isLeaf(node)) {
			page.editarea.prop("disabled", false);
		} else {
			page.editarea.prop("disabled", true);
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
	
	function displayMenu(command) {
		page.menu.style.display = (command == "show" ? "block" : "none");
		page.menuitem.innerHTML = settings.contextmenuitem.name;
	};

	function setMenuPosition(left, top) {
		page.menu.style.left = left.toString() + 'px';
		page.menu.style.top = top.toString() + 'px';
		displayMenu('show');
	};		
	
	function _isLeaf(node) {
		return (node.children.length == 0);
	}
	
	function _getUniqueTreeId() {
		var idmap = page.itemtree.tree('getTree').id_mapping;
		var newId = -1;
		for (var id in idmap) {
			var idval = parseInt(id);
			if (idval >= newId) newId = idval + 1;
		}

		return newId;
	}
	
	return {
		init: init
 	};
}();