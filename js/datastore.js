const API_BASE = 'https://script.google.com/macros/s/AKfycbw0vPrgWJYrGoJ-Z7wAvbFeyD0Vtl6ko5l1J4BCszjXgAXk3iM/exec';
const API_KEY = 'MVcourseinfoeditorAPI';

//--------------------------------------------------------------
// build URL for use with Google sheet web API
//--------------------------------------------------------------
	function _buildApiUrl (datasetname, coursekey) {
	let url = API_BASE;
	url += '?key=' + API_KEY;
	url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';
	url += coursekey && coursekey !== null ? '&coursekey=' + coursekey : '';
	//console.log('buildApiUrl: url=' + url);
	
	return url;
}

//--------------------------------------------------------------
// use Google Sheet web API to get item tree
//--------------------------------------------------------------
function _getItemTree (notice, callback) {
	notice('loading course info tree...');

	fetch(_buildApiUrl('itemtree'))
		.then((response) => response.json())
		.then((json) => {
			//console.log('json.status=' + json.status);
			//console.log('json.data: ' + JSON.stringify(json.data));
			if (json.status !== 'success') {
				notice(json.message);
			} else {
				notice('');
				callback(json.data);
			}
		})
		.catch((error) => {
			notice('Unexpected error loading course info tree');
			console.log(error);
		})
}

//--------------------------------------------------------------
// use Google Sheet web API to save item tree
//--------------------------------------------------------------
function _putItemTree (jsonTree, notice, callback) {
	notice('posting course info tree...');

	var postData = {
		"tree": jsonTree
	};
	
	fetch(_buildApiUrl('itemtree'), {
			method: 'post',
			contentType: 'application/x-www-form-urlencoded',
			body: JSON.stringify(postData)
		})
		.then((response) => response.json())
		.then((json) => {
			//console.log('json.status=' + json.status);
			//console.log('json.data: ' + JSON.stringify(json.data));
			if (json.status !== 'success') {
				notice(json.message);
			} else {
				notice('');
				callback();
			}

		})
		.catch((error) => {
			notice('Unexpected error posting course info tree');
			console.log(error);
		})
}

//--------------------------------------------------------------
// use Google Sheet web API to get course list
//--------------------------------------------------------------
function _getCourseList (notice, callback) {
	notice('loading course list...');

	fetch(_buildApiUrl('courselist'))
		.then((response) => response.json())
		.then((json) => {
			//console.log('json.status=' + json.status);
			if (json.status !== 'success') {
				notice(json.message);
			}
			notice('');
			callback(json.data.courselist);
		})
		.catch((error) => {
			notice('Unexpected error loading course list');
			console.log(error);
		})
}
		
//--------------------------------------------------------------
// use Google Sheet web API to get item list for course
//--------------------------------------------------------------
function _getItemList (coursekey, notice, callback) {
	notice('loading course info mapping...');

	fetch(_buildApiUrl('itemlist', coursekey))
		.then((response) => response.json())
		.then((json) => {
			//console.log('json.status=' + json.status);
			//console.log('json.data: ' + JSON.stringify(json.data));
			if (json.status !== 'success') {
				notice(json.message);
			} else {
				notice('');
				callback(json.data.itemlist);
			}
		})
		.catch((error) => {
			notice('Unexpected error loading course info mapping');
			console.log(error);
		})
}

//--------------------------------------------------------------
// use Google Sheet web API to save item list
//--------------------------------------------------------------
function _putItemList (itemdata, notice, callback) {
	notice('posting course info mapping...');

	var postData = itemdata;
	console.log('posting item data...');
	console.log(JSON.stringify(itemdata));
	
	fetch(_buildApiUrl('itemlist'), {
			method: 'post',
			contentType: 'application/x-www-form-urlencoded',
			body: JSON.stringify(postData)
		})
		.then((response) => response.json())
		.then((json) => {
			//console.log('json.status=' + json.status);
			//console.log('json.data: ' + JSON.stringify(json.data));
			if (json.status !== 'success') {
				notice(json.message);
			} else {
				notice('');
				callback();
			}

		})
		.catch((error) => {
			notice('Unexpected error posting course info mapping');
			console.log(error);
		})
}

