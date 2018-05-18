var target;
var continueBtn;
var usableWidth;
var usableHeight;
var numAllowedLines;
var font = '40px monospace';
var scriptString = '???: Are you awake? /n Girl: I found you unconscious on the plains. /n Lyn: I am Lyn, of the Lorca tribe. You’re safe now. Who are you? Can you remember your name? /n Lyn: Your name is Mark? What an odd-sounding name… But pay me no mind. It is a good name. I see by your attire that you are a traveller. What brings you to the Sacae plains? Would you share your story with me? Hm? What was that noise? I’ll go see what’s happening. Mark, wait here for me.';
var writingTextBool;
var scriptJSON;
var speakerIndex = 0;
var textIndex = 0;
var currSpeakerAndText;

window.onload = function() {
    target = $("#dialogueBox");
    speakerName = $('#speakerNameBox');''
    continueBtn = $('#continueBtn');
    usableWidth = getUsableWidth(target);
    usableHeight = getUsableHeight(target);
    lineHeight = parseFloat($(target).css('line-height').replace('px', ''));
    numAllowedLines = Math.floor(usableHeight / lineHeight);
    //console.log(getCharacterWidth(font));
    //console.log(getTextWidthDOM('about the magical toilet paper you ', font));
    //console.log('usable width: ' + usableWidth);
    //console.log('usable height: ' + usableHeight);
    //console.log('line height: ' + $(target).css('line-height'));
    //console.log('num allowed lines: ' + numAllowedLines);
    scriptJSON = processScript(scriptString);  //must run to set up JSON script
    console.log(scriptJSON);
    currSpeakerAndText = scriptJSON[speakerIndex];
    var currString = currSpeakerAndText.text[textIndex];
    textIndex++;
    var currSpeaker = currSpeakerAndText.speakerName;
    printDialogue(currSpeaker, currString);
    //console.log(detectOverflow(target));
    
    continueBtn.click(function(event) {
        if (writingTextBool) {
            clearInterval(textWriteInterval);
            $(target).text(currString);
            writingTextBool = false;
        } else {
            if (speakerIndex < scriptJSON.length) {
                if (textIndex < currSpeakerAndText.text.length) {
                        currString = currSpeakerAndText.text[textIndex];
                        printDialogue(currSpeaker, currString);
                        textIndex++;

                } else {
                    textIndex = 0;
                    speakerIndex++;
                    if (speakerIndex < scriptJSON.length) {
                        currSpeakerAndText = scriptJSON[speakerIndex];
                        currSpeaker = currSpeakerAndText.speakerName;
                        currString = currSpeakerAndText.text[textIndex];
                        printDialogue(currSpeaker, currString);
                        textIndex++;
                    }
                }
            }
        }
        
    });
}

function getUsableWidth (element) {
    width = $(element).innerWidth();
    padding = parseInt($(element).css('padding-left').replace('px', '')) + parseInt($(element).css('padding-right').replace('px', ''));
    usable = width - padding;
    return usable;
}

function getUsableHeight (element) {
    height = $(element).innerHeight();
    padding = parseInt($(element).css('padding-top').replace('px', '')) + parseInt($(element).css('padding-bottom').replace('px', ''));
    usable = height - padding;
    return usable;
}

function getTextWidthDOM(text, font) {
  var f = font || '12px arial',
      o = $('<span>' + text + '</span>')
            .css({'font': f, 'float': 'left', 'white-space': 'nowrap'})
            .css({'visibility': 'hidden'})
            .appendTo($('body')),
      w = o.width();
  o.remove();
  return w;
}

function getCharacterWidth(font) {
    return getTextWidthDOM('a', font);
}

function detectOverflow(object) {
    if ($(object)[0].scrollHeight >  $(object).innerHeight()) {
        return "Overflow!";
    } else {
        return "No overflow";
    }
    //console.log($(object)[0].scrollHeight);
    //console.log($(object).innerHeight())
}

function segmentDialogue(textString, font) {
    outputString = '';
    leftoverString = '';
    curString = '';
    wordArray = textString.toString().split(' ');
    totalLineWidth = 0;
    numLines = 1;
    for (i = 0; i < wordArray.length; i++) {
        element = wordArray[i].trim();
        wordWidth = getTextWidthDOM(element, font);
        totalLineWidth = getTextWidthDOM(curString, font) + wordWidth + getCharacterWidth(font);
        //console.log(totalLineWidth + ' : ' + curString);
        if (totalLineWidth > usableWidth) {
            //console.log('num lines: ' + numLines);
            //console.log('current string: ' + curString);
            curString = '';
            numLines += 1;
        }
        if (numLines > numAllowedLines) {
            leftoverString += element + ' ';
        } else {
            outputString += ' ' + element;
            curString += ' ' + element;
        }
    };
    return {
        displayString: outputString.trim(),
        remaining: leftoverString.trim()
    };
}

function populateStringQueue(textString) {
    var currString = textString;
    stringQueue = [];
    while (currString.trim() != '') {
        returnVals = segmentDialogue(currString, font);
        stringQueue.push(returnVals.displayString);
        //console.log(stringQueue[stringQueue.length-1]);
        currString = returnVals.remaining;
    }
    return stringQueue;
}

function printDialogue(speaker, text) {
    $(speakerName).text(speaker);
    $(target).text('');
    showText(target, text, 0, 15);
}

function showText (target, message, index, interval) {
    writingTextBool = true;
    promise = new Promise(function(resolve, reject) {
       textWriteInterval = setInterval(function() {
            if (index < message.length) {
                $(target).append(message[index++]);
                //$(target).append('<br/>')
            } else {
                resolve('resolved promise');
                clearInterval(textWriteInterval);
            }
        }, interval); 
    });
    promise.then(function(value) {
        console.log(value)
        writingTextBool = false;
    }, function() {
        console.error('promise rejected')
    });
}

function processScript(script) {
    jsonArray = [];
    scriptArray = script.toString().split('/n');
    //script is now split by speaker
    scriptArray.forEach(function(element) {
        jsonArray.push({
            speakerName: element.substring(0, element.indexOf(':')),
            text: populateStringQueue(element.substr(element.indexOf(':') + 1).trim())
        })
    });
    return jsonArray;
}