//
// TODO: move some more CSS to common?
// TODO: consider way to reorder list and have it preserved between tree selections
//
const app = function () {
	const PAGE_TITLE = 'Course info mapper'
	const NO_COURSE = 'NO_COURSE';
		
	const page = {
		body: null,
		header: null,
		notice: null,
		title: null,
		itemtree: null,
		mapspace: null
	};
	
	const settings = {
		"coursekey": NO_COURSE,
		"dirtybit": false
	};
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];

		page.header = document.getElementById('header');
		page.header.toolname = document.getElementById('toolname');
		page.header.courses = document.getElementById('courses');
		page.header.controls = document.getElementById('controls');

		page.notice = document.getElementById('notice');
		page.title = document.getElementById('title');

		page.itemtree = $('#tree1');
		page.mapspace = document.getElementById('mapspace');
				
		settings.selectedItems = [];
		
		_setNotice('initializing...');
		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
			_setNotice('');
            _getCourseList(_setNotice, _initHeader);
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
	function _initHeader(courselist) {
		page.header.toolname.innerHTML = PAGE_TITLE;

		page.body.classList.add('cif-colorscheme');
		page.header.classList.add('cif-title');
		page.notice.classList.add('cif-notice');			

		var elemCourseSelect = _createCourseSelect(courselist);
		page.header.courses.appendChild(elemCourseSelect);
		_enableCourseSelect(false);

		var elemSave= _makeButton('btnSave', 'cif-control', '💾', 'save', _saveButtonClicked);
		var elemReload = _makeButton('btnReload', 'cif-control', '🔄', 'reload', _reloadButtonClicked);
		page.savebutton = elemSave;
		page.reloadbutton = elemReload;
		_enableButtons(false);
		
		page.header.controls.appendChild(elemSave);
		page.header.controls.appendChild(elemReload);

		_renderPage();
	}
	
	function _renderPage() {
		_getItemTree(_setNotice, _setupTree);
	}	
	
	function _createCourseSelect(courseList) {
		var elemCourseSelect = document.createElement('select');
		elemCourseSelect.id = 'selectCourse';
		elemCourseSelect.classList.add('cif-control');
		elemCourseSelect.addEventListener('change',  _courseSelectChanged, false);
		
		var elemNoCourseOption = document.createElement('option');
		elemNoCourseOption.value = NO_COURSE;
		elemNoCourseOption.text = '<select a course>';
		elemCourseSelect.appendChild(elemNoCourseOption);
		
		for (var i = 0; i <  courseList.length; i++) {
			var elemOption = document.createElement('option');
			elemOption.value = courseList[i].coursekey;
			elemOption.text = courseList[i].fullname;
			elemCourseSelect.appendChild(elemOption);
		}

		page.courseselect = elemCourseSelect;
		
		return elemCourseSelect;
	}
	
	function _setupTree(jsonTree) {
		page.itemtree.tree({
			data: JSON.parse(jsonTree.tree),
			slide: false
		});
		
		page.itemtree.on('tree.click', function(e) { _treeClickHandler(e);} );
		
		_enableCourseSelect(true);
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
		var treelist = _getSelectedNodes(root, true);	
		
		list = treelist;  // make deltas to list based on treelist first?
		
		settings.selectedItems = list;
	}
		
	function _enableButtons(enable) {
		page.savebutton.disabled = !enable;
		page.reloadbutton.disabled = !enable;
	}
	
	function _enableCourseSelect(enable) {
		page.courseselect.disabled = !enable;
	}
	
	//------------------------------------------------------------------
	// handlers
	//------------------------------------------------------------------
	function _courseSelectChanged(evt) {
		settings.coursekey = evt.target.value;
		_enableButtons(false);

		if (settings.coursekey == NO_COURSE) {
			_clearTreeSelections();
			settings.selectedItems = [];
			_renderSelectedItems();
			
		} else {
			_getItemList(settings.coursekey, _setNotice, _loadMapping);
		}
	}
		
	function _saveButtonClicked() {
		var nodelist = _getSelectedNodes(page.itemtree.tree('getTree'), false);
		var itemlist = [];
		for (var i = 0; i < nodelist.length; i++) {
			itemlist.push(nodelist[i].id);
		}
		
		var data = {"courseindex": page.courseselect.selectedIndex - 1, "itemlist": JSON.stringify(itemlist)};
		_putItemList(data, _setNotice, function() {})
	}
	
	function _reloadButtonClicked() {
		if (settings.coursekey == NO_COURSE) return;
		
		var confirmed = true;
		if (settings.dirtybit) {
			confirmed = confirm('Any changes will be lost.  Are you sure you want to reload?\n\nPress OK to reload.');
		}
		if (confirmed) {
			_enableButtons(false);
			_getItemList(settings.coursekey, _setNotice, _loadMapping);
		}
	}
	
	function _treeClickHandler(e) {
		if (e.node == null) return;

		if (page.courseselect.value == NO_COURSE) {
			e.preventDefault(); 
			return;
		};

        e.preventDefault(); // prevent single selection
        var selectedNode = e.node;

		var makeSelected = !page.itemtree.tree('isNodeSelected', selectedNode);
		_propagateSelection(selectedNode, makeSelected);
		_renderSelectedItems();
		_setDirtyBit(true);
	}
	
	function _loadMapping(data) {
		var idlist = JSON.parse(data);
		_setTreeSelection(page.itemtree.tree('getTree'), idlist);
		_renderSelectedItems();	
		_enableButtons(true);
		_setDirtyBit(false);
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
	
	function _setDirtyBit(isDirty) {
		settings.dirtybit = isDirty;
		var msg = PAGE_TITLE;
		if (settings.dirtybit) msg = "*" + msg;
		page.header.toolname.innerHTML = msg;
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
		
	function valIsInArray(val, arr) {
		var found = false;
		
		for (var i = 0; i < arr.length && !found; i++) {
			if (val == arr[i]) found = true;
		}
		return found;
	}
	
	return {
		init: init
 	};
}();