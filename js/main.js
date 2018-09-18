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
	const settings = {
		"masterlist": {
				"0": "aaaaaa", 
				"1": "bbbbbb", 
				"2": "cccccc",
				"3": "dddddd", 
				"4": "eeeeee"
		},
		
		"itemList": {
		    "left": [
				{"masterkey": 0}, 
				{"masterkey": 1}, 
				{"masterkey": 2}
			],
		    "right": [
				{"masterkey": 3}, 
				{"masterkey": 4}
			]
		 }
	};

	//---------------------------------
	
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		
		page.body = document.getElementsByTagName('body')[0];
		page.notice = document.getElementById('notice');
		page.title = document.getElementById('title');
		page.contents = document.getElementById('contents');
						
		page.body.classList.add('cif-colorscheme');
		page.title.classList.add('cif-title');
		page.notice.classList.add('cif-notice');			
		
		page.title.innerHTML = PAGE_TITLE;
		
		if (!_initializeSettings()) {
			_setNotice('Failed to initialize - invalid parameters');
		} else {
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
		var elemRow = document.createElement('div');
		elemRow.classList.add('row');
		
		var elemLeft = document.createElement('div');
		elemLeft.id = 'left';
		elemLeft.classList.add('col');
		elemLeft.addEventListener('drop', function(ev) { dropHandler(ev); });
		elemLeft.addEventListener('dragover', function(ev) { dragoverHandler(ev); });

		page.contents.appendChild(elemRow);
		
		page.listRow = elemRow;		
		_renderItemLists();		
	}	
	
	function _renderItemLists() {
		var elemContainer = document.getElementById('left');
		if (elemContainer != null) elemContainer.parentNode.removeChild(elemContainer);
		var elemContainer = document.getElementById('right');
		if (elemContainer != null) elemContainer.parentNode.removeChild(elemContainer);
		
		page.listRow.appendChild(_renderItemList("left", 0, settings.itemList.left));
		page.listRow.appendChild(_renderItemList("right", settings.itemList.left.length, settings.itemList.right));

		_addDragAndDropListeners();
	}
	
	function _renderItemList(containerId, baseItemIdNum, itemList) {
		// build new list elements
		elemContainer = document.createElement('div');
		elemContainer.id = containerId;
		elemContainer.classList.add('col');
		elemContainer.addEventListener('drop', function(ev) { dropHandler(ev); });
		elemContainer.addEventListener('dragover', function(ev) { dragoverHandler(ev); });
		
		for (var i = 0; i < itemList.length; i++) {
			var masterkey = itemList[i].masterkey;
			elemContainer.appendChild(_renderItem(baseItemIdNum + i, masterkey));
		}

		return elemContainer;
	}
	
	function _renderItem(index, masterkey) {
		var idSuffix = index.toString().padStart(3, '0') + '_' + masterkey.toString().padStart(3, '0');
		var elemItem = document.createElement('div');
		elemItem.id = 'item' + idSuffix;
		elemItem.classList.add('item');
		
		var elemContents = document.createElement('div');
		elemContents.id = 'itemcontents' + idSuffix;
		
		var elemHandle = document.createElement('span');
		elemHandle.id = 'itemhandle' + idSuffix;
		elemHandle.classList.add('item-handle');
		elemHandle.innerHTML = '+';
		
		var elemInnerContents = document.createElement('span');
		elemInnerContents.id = 'iteminnercontents' + idSuffix;
		elemInnerContents.innerHTML = _getMasterItemContent(masterkey);
		
		var elemControls = document.createElement('div');
		elemControls.id = 'itemcontrols' + idSuffix;
		elemControls.classList.add('item-controls');
		elemControls.innerHTML = '[controls]';
		
		elemContents.appendChild(elemHandle);
		elemContents.appendChild(elemInnerContents);
		elemContents.appendChild(elemControls);
		
		elemItem.appendChild(elemContents);
		
		return elemItem;
	}
		
	//------------------------------------------------
	// item list management
	//------------------------------------------------
	function _moveListItem(idColSource, idItemSource, idColDest, idItemDest) {
		var masterkeySource  = parseInt(idItemSource.slice(-3));
		var positionDest = -1;
		if (idItemDest != null) positionDest = parseInt(idItemDest.slice(4,7));
		
		if (idColSource == 'right' && idColDest == 'right') {
			// do nothing - no reordering in right column
			
		} else if (idColSource == 'right' && idColDest == 'left') {
			_removeItemFromList('right', masterkeySource);
			_addItemToList('left', masterkeySource, positionDest);
			
		} else if (idColSource == 'left' && idColDest == 'right') {
			_removeItemFromList('left', masterkeySource);
			_addItemToList('right', masterkeySource, _findInsertPosition(masterkeySource));

		} else {
			_removeItemFromList('left', masterkeySource);
			_addItemToList('left', masterkeySource, positionDest);
		}
				
		_renderItemLists();
	}
	
	function _removeItemFromList(colname, masterkey) {
		var list = settings.itemList[colname];
		var newList = [];
		
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			if (item.masterkey != masterkey) {
				newList.push(item);
			}
		}

		settings.itemList[colname] = newList;
	}
	
	function _addItemToList(colname, masterkey, addAfterPosition) {
		var list = settings.itemList[colname];
		var newList = [];
    	var newItem = {"masterkey": masterkey};
		
		var added = false;
		if (addAfterPosition == -2) {
			newList.push(newItem);
			added = true;
		}
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			newList.push(item);
			if (addAfterPosition == i) {
				newList.push(newItem);
				added = true;
			}
		}
		if (!added) newList.push(newItem);

		settings.itemList[colname] = newList;
	}
	
	function _getMasterItemContent(masterkey) {
		return settings.masterlist[masterkey];
	}
	
	function _findInsertPosition(masterkey) {
		var list = settings.itemList.right;
		var done = false;
		var index = -2;
		for (var i = 0; i < list.length && !done; i++) {
			if (list[i].masterkey < masterkey) {
				index = i;
			} else {
				done = true;
			}
		}
		return index;
	}
	
	//------------------------------------------------
	// drag and drop handlers and listeners
	//------------------------------------------------
	function _addDragAndDropListeners() {
		var handleElements = document.getElementsByClassName('item-handle');
		for (var i = 0; i < handleElements.length; i++) {
			var elem = handleElements[i];
			elem.onmousedown = function(e) {
				e.target.parentNode.setAttribute('draggable', 'true')
			};
		}
	
		var itemElements = document.getElementsByClassName('item');
		for (var i = 0; i < itemElements.length; i++) {
			var elem = itemElements[i];
			addDragStartListener(elem, elem.id);
			addDragEndListener(elem);
		}		
	}
	
	function addDragStartListener(elem, id) {
		elem.addEventListener('dragstart', function(e) {
			e.dataTransfer.setData('text/plain', id);
			e.dataTransfer.dropEffect = "move";		
		});
	}
	
	function addDragEndListener(elem) {
		elem.addEventListener('dragend', function(e) {
  		  e.target.setAttribute('draggable', 'false');
		});
	}
	
	function dragoverHandler(ev) {
      ev.preventDefault();
	}

	function dropHandler(ev) {
		var elemSource = document.getElementById(ev.dataTransfer.getData("text"));
		var elemDroppedOn = ev.target;
				
		_moveListItem(_getColumnId(elemSource),  _getItemId(elemSource), _getColumnId(elemDroppedOn), _getItemId(elemDroppedOn));
	}
	
	function _getColumnId(elem) {
		var idColumn = null;
		var traversingElem = elem;
		
		for (var i = 0; i < 5 && idColumn == null; i++) {
			if (traversingElem.classList.contains('col')) {
				idColumn = traversingElem.id;
			} else {
				traversingElem = traversingElem.parentNode;
			}
		}
		
		return idColumn;
	}
	
	function _getItemId(elem) {
		var idItem = null;
		var traversingElem = elem;
		
		for (var i = 0; i < 5 && idItem == null; i++) {
			if (traversingElem.classList.contains('item')) {
				idItem = traversingElem.id;
			} else {
				traversingElem = traversingElem.parentNode;
			}
		}
		
		return idItem;
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
	
	return {
		init: init
 	};
}();