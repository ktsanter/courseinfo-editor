"use strict";

//https://unicode.org/emoji/charts/full-emoji-list.html#1f410
var emojifierData = {
	"smiling face": [0x1F642, 0xFE0F],
	"frowning face": [0x2639, 0xFE0F],
	"smiling face with sunglasses": [0x1F60E],
	"grinning face": [0x1F600],
	"winking face": [0x1F609],
	"thinking face": [0x1F914],
	"relieved face": [0x1F60C],
	"sad but relieved face": [0x1F625],
	"grimacing face": [0x1F62C],
	"smiling face with halo": [0x1F607],

	"info": [0x1f6C8, 0xFE0F],
	"warning": [0x26A0, 0xFE0F],
	"stop sign": [0x1F6D1],
	"prohibited": [0x1F6AB],
	"heavy check mark": [0x2714],
	"white heavy check mark": [0x2705],
	"cross mark": [0x274C],
	"cross mark button": [0x274E],
	"question mark": [0x2753],
	"exclamation mark": [0x2757],
	
	"thought balloon": [0x1F4AD],
	"speech balloon": [0x1F4AC],
	
	"calendar": [0x1F4C6],
	"pencil": [0x270F],
	"megaphone": [0x1F4E3],
	"stopwatch": [0x23F1],
	"trophy": [0x1F3C6],
	"rainbow": [0x1F308],
	"glasses": [0x1F453],
	"rocket": [0x1F680],
	"eye": [0x1F441],

	"thumbs up": [0x1F44D],
	"thumbs down": [0x1F44E],
	"backhand index pointing left": [0x1F448],
	"backhand index pointing right": [0x1F449],
	"backhand index pointing up": [0x1F446],
	"backhand index pointing down": [0x1F447],
	"crossed fingers": [0x1F91E],
	"OK hand": [0x1F44C],
	"flexed biceps": [0x1F4AA],
		
	"poop": [0x1F4A9],
	"alien": [0x1F47D],
	"ghost": [0x1F47B],
	"robot face": [0x1F916],
	"zombie": [0x1F9DF],
	"person running": [0x1F3C3],
	"person fencing": [0x1F93A],
	"person biking": [0x1F6B4],

	"zebra": [0x1F993],
	"pig": [0x1F437],
	"goat": [0x1F410],
	"camel": [0x1F42A],
	"elephant": [0x1F418],
	"dragon": [0x1F409]
};

function emojifyString(originalString, forBlackBoard)
{
	var s = originalString;
	
    var pattern = /::[0-9a-zA-Z ]*::/g;
	
	var result = s.match(pattern);
	if (result !== null) {
		for (var i = 0; i < result.length; i++) {
			s = s.replace(result[i], emojify(result[i], true, forBlackBoard));
		}
	}

	return s;
}

function emojify(source, stripColons, forBlackBoard)
{
	var ename = source;
	var result = source;
	
	if (stripColons) {
		ename = ename.replaceAll(":", "");
	}
	
	var lookup = emojifierData[ename];

	if (lookup != undefined) {
		if (lookup.length == 1) {
			result = String.fromCodePoint(lookup[0]);
		} else {
			result = String.fromCodePoint(lookup[0], lookup[1]);
		}
	}

	return result;	
}

function getEmojifierReferenceList() 
{
	var emojiArray = [];
	
	for (var key in emojifierData) {
		var code = emojifierData[key];
		
		emojiArray.push({"key": key, "code": code});
	}
	
	return emojiArray;
}