//
// TODO: rework class and id naming conventions
// TODO: build out controls 
// TODO: build API to source
// TODO: add accordion item contents
// TODO: transition to MD
// TODO: add edit and preview for MD
//
const app = function () {
	const PAGE_TITLE = 'Course info editor'
		
	const page = {};
	const settings = {};

	var treeLayout = [
		{
			name: 'node1',
				children: [
					{ name: 'child1' },
					{ name: 'child2' }
				]
		},
		{
			name: 'node2',
				children: [
					{ name: 'child3' }
				]
		}
	];
	
	var itemData = {
		child1: "# This is a big header",
		child2: "***bold italic***",
		child3: "## ::grinning face::"
	}
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		
		page.body = document.getElementsByTagName('body')[0];
		page.notice = document.getElementById('notice');
		page.title = document.getElementById('title');
		page.contents = document.getElementById('contents');
		page.editarea = $("#testInput");
		page.previewarea = $("#testOutput");
		page.menu = document.getElementById('contextmenu');
						
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
			$('#tree1').tree({
				data: treeLayout,
				dragAndDrop: true
			});
		});
		
		$('#tree1').on('tree.click', function(e) {_treeClickHandler(e);} );
		$('#tree1').on('tree.contextmenu', function(e) {_treeRightClickHandler(e);} );
		
		page.editarea.bind('input change', function() {
			handleTestInputChange();
		});
		
		$(".menu-option").on('click', function(e) {_contextMenuHandler(e);}); 
		window.addEventListener('keyup', function(e) {
			if (e.which == 27) displayMenu('hide');
		});
	}	
	
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
	function _treeClickHandler(e) {
		console.log(e);
		var name = e.node.name;
		var isLeaf = (e.node.children.length == 0);
		
		if (isLeaf) {
			page.editarea.val(itemData[name]);
			handleTestInputChange();
		}
	}
	
	function _treeRightClickHandler(e) {
		var name = e.node.name;
		var isLeaf = (e.node.children.length == 0);

		setMenuPosition(e.click_event.pageX, e.click_event.pageY);
	}
	
	function _contextMenuHandler(e) {
		console.log('contextMenuHandler: e=' + e.currentTarget.id);
		displayMenu('hide');
	}
	
	function handleTestInputChange() {
		var orig = page.editarea.val();
		var formatted = formatTextFromMarkup(orig, false);
		page.previewarea.html(formatted);
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
	};

	function setMenuPosition(left, top) {
		page.menu.style.left = left.toString() + 'px';
		page.menu.style.top = top.toString() + 'px';
		displayMenu('show');
	};		
	
	return {
		init: init
 	};
}();