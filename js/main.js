//
// TODO: add itemData entry when leaf is edited
// TODO; add save and load controls
// TODO: add API for storage
// TODO: incorporate standard CSS into MD display
// TODO: scheme for truncating node names in tree but keeping full elsewhere
//
const app = function () {
	const PAGE_TITLE = 'Course info editor'
		
	const page = {
		body: null,
		notice: null,
		title: null,
		itemtree: null,
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

	var treeLayout = [
		{
			id: 0,
			name: 'node1',
				children: [
					{ id: 1, name: 'child1', content: {label: "my first set of markdown", markdown:"# This is a big header"} },
					{ id: 2, name: 'child2', content: {label: "my second set of markdown", markdown: "***bold italic***"} }
				]
		},
		{
			id: 3,
			name: 'node2',
				children: [
					{ id: 4, name: 'child3', content:{label: "label for grinning face", markdown:"## ::grinning face::"} }
				]
		}
	];
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		
		page.body = document.getElementsByTagName('body')[0];
		page.notice = document.getElementById('notice');
		page.title = document.getElementById('title');
		page.itemtree = $('#tree1');
		page.edittitle = $("#edit-title");
		page.editarea = $("#markdown-edit");
		page.previewtitle = $("#preview-title");
		page.previewarea = $("#preview");
		page.menu = document.getElementById('contextmenu');
		page.menuitem = document.getElementById('contextmenu-item');
						
		page.body.classList.add('cif-colorscheme');
		page.title.classList.add('cif-title');
		page.notice.classList.add('cif-notice');			
		
		page.title.innerHTML = PAGE_TITLE;
		
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
		$(function() {
			page.itemtree.tree({
				data: treeLayout,
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
		
		page.editarea.bind('input change', function() {
			handleTestInputChange();
		});
		
		$(".menu-option").on('click', function(e) {_contextMenuHandler(e);}); 
		window.addEventListener('keyup', function(e) {
			if (e.which == 27) displayMenu('hide');
		});

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
	function _treeSelectHandler(e) {
		if (e.node == null) return;

		console.log('sekect');
		var oldNode = settings.currentnode;
		var newNode = page.itemtree.tree('getNodeById', e.node.id);
		console.log(e.node.id);
		
		displayMenu('hide');

		// save editing work 
		if (oldNode != null && _isLeaf(oldNode)) {
			var content = {label: oldNode.content.label, markdown: page.editarea.val()};
			page.itemtree.tree('updateNode', oldNode, {content: content} );
		}
		
		_loadNodeContent(newNode);

		settings.currentnode = newNode;
		
		handleTestInputChange();
	}
	
	function _treeRightClickHandler(e) {
		settings.contextmenuitem = page.itemtree.tree('getNodeById', e.node.id);;
		setMenuPosition(e.click_event.pageX, e.click_event.pageY);
	}
	
	function _contextMenuHandler(e) {
		if (e.currentTarget.id == 'rename') {
			_renameNode(settings.contextmenuitem);
		} else if (e.currentTarget.id == 'add') {
			_addNodeAfter(settings.contextmenuitem);
		} else if (e.currentTarget.id == 'delete') {
			_removeNode(settings.contextmenuitem);
		}
		
		displayMenu('hide');
	}
	
	function _renameNode(node) {
		var newName = prompt("New name for:", node.name);
		var currentId = node.id;
		
		if (!(newName == null || newName == '')) {
			page.itemtree.tree('updateNode', node, { name: newName });
		}
	}
	
	function _addNodeAfter(node) {
		var newId = _getUniqueTreeId();  // get id for new node

		page.itemtree.tree('selectNode', null);  // deselect any selected nodes
		page.itemtree.tree(   // append new node
		    'addNodeAfter', {
				name: 'new_node', 
				id: newId,
				content: {label: '', markdown: ''}
			}, 
		node);  
		
		page.itemtree.tree('selectNode', page.itemtree.tree('getNodeById', newId));  // select new node
	}
	
	function _removeNode(node) {
		if (confirm('The item named ' + node.name + ' will be permanently removed along with any children.\nPress OK to delete the item.')) {
			page.itemtree.tree('removeNode', node);
		}
	}
	
	function handleTestInputChange() {
		var orig = page.editarea.val();
		var formatted = formatTextFromMarkup(orig, false);
		page.previewarea.html(formatted);
	}

	function _loadNodeContent(node) {
		if (node.hasOwnProperty('content')){
			page.edittitle.html('Label: ' + node.content.label);
			page.previewtitle.html('Preview: ' + node.content.label);
			page.editarea.val(node.content.markdown);
		} else {
			page.edittitle.html('Label:');
			page.previewtitle.html('Preview:');
			page.editarea.val('');
		}
		
		if (_isLeaf(node)) {
			page.editarea.attr("disabled",false);
		} else {
			page.editarea.attr("disabled","disabled");
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
		console.log('newId=' + newId);
		return newId;
	}
	
	return {
		init: init
 	};
}();