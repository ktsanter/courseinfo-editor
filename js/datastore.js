const API_BASE = 'https://script.google.com/macros/s/AKfycbw0vPrgWJYrGoJ-Z7wAvbFeyD0Vtl6ko5l1J4BCszjXgAXk3iM/exec';
const API_KEY = 'MVcourseinfoeditorAPI';

//--------------------------------------------------------------
// build URL for use with Google sheet web API
//--------------------------------------------------------------
	function _buildApiUrl (datasetname) {
	let url = API_BASE;
	url += '?key=' + API_KEY;
	url += datasetname && datasetname !== null ? '&dataset=' + datasetname : '';
	//console.log('buildApiUrl: url=' + url);
	
	return url;
}

//--------------------------------------------------------------
// use Google Sheet web API to get item tree
//--------------------------------------------------------------
function _getItemTree (notice, callback) {
	notice('loading course info items...');

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
			notice('Unexpected error loading course info items');
			console.log(error);
		})
}

//--------------------------------------------------------------
// use Google Sheet web API to save item tree
//--------------------------------------------------------------
function _putItemTree (jsonTree, notice, callback) {
	notice('posting course info items...');

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
				//console.log('do callback');
				callback();
			}

		})
		.catch((error) => {
			notice('Unexpected error posting course item info');
			console.log(error);
		})
}
