//
//
const app = function () {
  const baseURLCourseInfo = 'https://ktsanter.github.io/courseinfo-editor/presenter.html';
  const resizerScript = 'https://drive.google.com/uc?id=1lE_MPv0lYEX6mFaTPFmJ7S83YRRbLSQo';
  
	const page = {
		body: null,
    course: null,
    instance: null,
    linkbutton: null,
    embedbutton: null,
    embednotice: null
	};
	
	const settings = {
	};
	
  const courses = {
    "game_design": "Advanced Programming: Game Design & Animation",
    "javascript": "Advanced Web Design: JavaScript",
    "apcsp1": "AP Computer Science Principles (S1)",
    "apcsp2": "AP Computer Science Principles (S2)",
    "html_css": "Basic Web Design: HTML & CSS",
    "digital_literacy": "Digital Literacy & Programming",
    "fpb": "Foundations of Programming B",
    "java_a": "Java Programming A",
    "js_game_design": "JavaScript Game Design",
    "procprog": "Procedural Programming",
    "java_a_tips_ce1": "Java Programming A (tips for Unit 1 coding exercises)",
    "java_a_tips_ce2": "Java Programming A (tips for Unit 2 coding exercises)",
    "java_a_tips_ce3": "Java Programming A (tips for Unit 3 coding exercises)",
    "java_a_tips_ce4": "Java Programming A (tips for Unit 4 coding exercises)",
    "java_a_tips_ce5": "Java Programming A (tips for Unit 5 coding exercises)",
    "java_a_tips_ce6": "Java Programming A (tips for Unit 6 coding exercises)",
    "java_a_tips_ce7": "Java Programming A (tips for Unit 7 coding exercises)",
    "java_a_tips_ce8": "Java Programming A (tips for Unit 8 coding exercises)",
    "java_a_tips_apply1": "Java Programming A (tips for Unit 1 apply problems)",
    "java_a_tips_apply2": "Java Programming A (tips for Unit 2 apply problems)",
    "java_a_tips_apply3": "Java Programming A (tips for Unit 3 apply problems)",
    "java_a_tips_apply4": "Java Programming A (tips for Unit 4 apply problems)",
    "java_a_tips_apply5": "Java Programming A (tips for Unit 5 apply problems)",
    "java_a_tips_apply6": "Java Programming A (tips for Unit 6 apply problems)",
    "java_a_tips_apply7": "Java Programming A (tips for Unit 7 apply problems)",
    "java_a_tips_apply8": "Java Programming A (tips for Unit 8 apply problems)",
    "apcsp_myap": "AP CS Principles - myAP resources"
  }
  
  const terms = {
    "semester1": "semester 1",
    "semester2": "semester 2",
    "trimester1": "trimester 1",
    "trimester2": "trimester 2",
    "trimester3": "trimester 3",
    "summer": "summer"
  };
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];
    page.course = document.getElementById('selCourse');
    page.instance = document.getElementById('numInstance');
    page.linkbutton = document.getElementById('btnCreateLink');
    page.embedbutton = document.getElementById('btnCreateEmbed');
    page.embednotice = document.getElementById('embedNotice');
    
    _loadCourseSelections(page.course);
    _setEmbedNotice('');
    
    page.course.addEventListener('change', _specificationChangeHandler);
    page.instance.addEventListener('input', _specificationChangeHandler);
    page.linkbutton.addEventListener('click', _linkButtonHandler);
    page.embedbutton.addEventListener('click', _embedButtonHandler);
  }
  
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------
  function _loadCourseSelections(elemCourses) {
    for (var key in courses) {
      var elemOption = document.createElement('option');
      elemOption.id = key;
      elemOption.innerHTML = courses[key];
      elemCourses.appendChild(elemOption);
    }
  }
  
  function _setEmbedNotice(msg) {
    page.embednotice.innerHTML = msg;
    
    if (msg == '') {
      page.embednotice.style.display = 'none';
    } else {
      page.embednotice.style.display = 'block';
    }
  }
  
  function _makeLinkCode() {
    var coursekey = page.course.options[page.course.selectedIndex].id;
    var instance = page.instance.value;
    
    var linkCode = baseURLCourseInfo;
    linkCode += '?instance=' + instance;
    linkCode += '&coursekey=' + coursekey;
    
    return linkCode;
  }
  
  function _makeEmbedCode() {
    var linkCode = _makeLinkCode();
    var instance = page.instance.value;
    
    var embedCode = '<p>';
    embedCode += '<script type="text/javascript" src="' + resizerScript + '"></script>';
    embedCode += '</p>';
    
    embedCode += '<p>';
    embedCode += '<iframe id="coursegenerator' + instance + '"';
    embedCode += ' width="100%"';
    embedCode += ' height="100"';
    embedCode += ' src="' + linkCode + '"';
    embedCode += ' frameborder="0"';
    embedCode += ' allowfullscreen="true"';
    embedCode += ' mozallowfullscreen="true"';
    embedCode += ' webkitallowfullscreen="true"';
    embedCode += '>';
    embedCode += '</iframe>';
    embedCode += '</p>';

    return embedCode;
  }
  
  //--------------------------------------------------------------------------
  // handlers
	//--------------------------------------------------------------------------
  function _specificationChangeHandler() {
    _setEmbedNotice('');
  }
  
  function _linkButtonHandler() {
    _copyStringToClipboard(_makeLinkCode());
    _setEmbedNotice('link copied to clipboard');
  }  
  
  function _embedButtonHandler() {
    _copyStringToClipboard(_makeEmbedCode());
    _setEmbedNotice('embed code copied to clipboard');
  }
  
	//---------------------------------------
	// utility functions
	//----------------------------------------  
	function _copyStringToClipboard(string) {
    var idTextArea = 'temp_textarea_for_clipboard_copy';
    var elemTextArea = document.createElement('textarea');

    elemTextArea.id = idTextArea;
		elemTextArea.value = string;
		elemTextArea.style.display = 'block';
    page.body.appendChild(elemTextArea);
    
		elemTextArea.select();
		document.execCommand("Copy");
		elemTextArea.selectionEnd = elemTextArea.selectionStart;
		elemTextArea.style.display = 'none';
    
    elemTextArea.parentNode.removeChild(elemTextArea);
	}
  
	return {
		init: init
 	};
}();