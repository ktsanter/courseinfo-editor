function formatTextFromMarkup(text, forBlackBoard) {
	var codeblockspan = "<span style="
	codeblockspan += "\"font-family: 'courier new', courier; ";
	if (forBlackBoard) {
		codeblockspan += "line-height: 0.6; ";
	}
	codeblockspan += "background: #F1F1F1;";
	codeblockspan += "border: 1px solid #E1E1E1;";
    codeblockspan += "border-radius: 4px;";
    codeblockspan += "display:inline-block;";
	codeblockspan += "\">";
	var codeblockendspan = '</span>';
	var highlightspan = "<span style=\"background-color: #FFFF00\">";
	var highlightendspan = '</span>';
	var lineBreak = "|";
	
	var reader = new commonmark.Parser();
	var writer = new commonmark.HtmlRenderer();

	text = text.replaceAll(lineBreak, "\n");

	var parsed = reader.parse(text);  // tree now available for walking

	var result = writer.render(parsed);
	result = emojifyString(result, forBlackBoard);
	result = formatIframeStrings(result, forBlackBoard);

	result = result.replaceAll('<code>', codeblockspan);
	result = result.replaceAll('<code class="language-function">', codeblockspan);
	result = result.replaceAll('</code>', codeblockendspan);

	result = extraMarkdownReplaceAll(result, /\^\^\^[^^]*\^\^\^/g, 3, '<sub>', '</sub>'); 
	result = extraMarkdownReplaceAll(result, /\^\^[^^]*\^\^/g, 2, '<sup>', '</sup>'); 
	result = extraMarkdownReplaceAll(result, /\~\~[^~]*\~\~/g, 2, '<s>', '</s>'); 
	result = extraMarkdownReplaceAll(result, /\%\%[^%]*\%\%/g, 2, highlightspan, highlightendspan);
	result = result.replaceAll('<a href=', '<a target="_blank" href=');

	var firstThree = result.substring(0,3);
	var lastFive = result.substring(result.length-5, result.length);
	if (firstThree == '<p>' && lastFive == '</p>\n') {
		result = result.substring(3);
		result = result.substring(0, result.length-5);
	}
	
	result = result.replaceAll('&amp;amp;', '&');

	return result;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function extraMarkdownReplaceAll(originalString, pattern, patternlength, opentoken, closetoken)
{
	var s = originalString;

	var result = s.match(pattern);
	if (result !== null) {
		for (var i = 0; i < result.length; i++) {
			s = s.replace(result[i], opentoken + result[i].slice(patternlength, -patternlength) + closetoken);
		}
	}

	return s;
}

function formatIframeStrings(originalString, forBlackBoard) {
	var regex = /\?\?\[([0-9]*) ([0-9]*) \&quot\;(.*)\&quot\;]/i;
	
	const bailoutLimit = 100;
	var s = originalString;
	var parsed = regex.exec(s);
	var count = 0;
	while (parsed != null && count < bailoutLimit) {
		var iframeString = makeIframeCode(parsed[1], parsed[2], parsed[3]);
		s = s.replace(parsed[0], iframeString);
		parsed = regex.exec(s);
		count++;
	}
	
	return s;
}

function makeIframeCode(width, height, url) {
	var iframeString = '<iframe ';
	iframeString += 'width="' + width + '" height="' + height + '" src="' + url + '">';
	iframeString += '</iframe>';
	
	return iframeString;
}
