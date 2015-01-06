// Copyright 2014 Amirreza Ghaderi. All rights reserved.
// Use of this source code is governed by BSD license
// that can be found in the LICENSE file.



//
//    WARNING:
//
// THE FOLLOWING SOURCE CODE IS WRITTEN BY SOMEONE WHO IS
// *NOT* A JS-NINJA. IT MAY CONTAIN NON-IDIOMATIC
// JS CODES.
//
//    VIEWER DISCRETION IS ADVISED!
//


// Setup marked.js. These are defaults in BidiDown, change them if you like.
marked.setOptions({renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
});


// bddn
//-----------------------------------------------------------------------------
(function(window) {

'use strict';

var body = document.body;
var html = document.documentElement;

// newEditor returns a new editor object. Its just a simple data structure that
// holds editor data. we send it to functions.
var newEditor = function() {
  var editor = {
    'wrapper': '',
    'direction': 'rtl',

    // lastActiveBlock is a special variable. it keeps track of current active block.
    'lastActiveBlock': null,

    // The editor.ui object, holds all the ui elements of the editor. you can change
    // them, or add some new elements to the editor.
    'ui': {},

    // The editor.msg object, holds all the messages that bidiDown may show to you.
    // you can change them if you like (translate them...)
    'msg' : {}
  };



/*
  editor.ui.fields
    = '<div class="bddn-fields bddn-ltr" id="bddn-fields">'
    + '  <input class="bddn-fields-text" id="bddn-text-title"  type="text" placeholder="title...">'
    + '  <input class="bddn-fields-text" id="bddn-text-author" type="text" placeholder="author...">'
    + '  <input class="bddn-fields-text" id="bddn-text-tags"   type="text" placeholder="tags...">'
    + '</div>';
*/

  editor.ui.toolbar 
    = '<div class="bddn-toolbar" id="bddn-toolbar">'
    + '  <a class="bddn-toolbar-btn" id="bddn-btn-ltr"    href="#bddn-void">L</a>'
    + '  <a class="bddn-toolbar-btn" id="bddn-btn-rtl"    href="#bddn-void">R</a>'
    + '  <a class="bddn-toolbar-btn" id="bddn-btn-toggle" href="#bddn-void">T</a>'
    + '  <a class="bddn-toolbar-btn" id="bddn-btn-delete" href="#bddn-void">D</a>'
    + '  <a class="bddn-toolbar-btn" id="bddn-btn-save"   href="#bddn-void">S</a>'
    + '  <a class="bddn-toolbar-btn" id="bddn-btn-open"   href="#bddn-void">O</a>'
    + '  <a class="bddn-toolbar-btn" id="bddn-btn-html"   href="#bddn-void">H</a>'
    + '</div>';


  editor.ui.editor 
    = '<div class="bddn-editor">'
    + '  <textarea class="bddn-editor-block bddn-rtl-block" rows="1"></textarea>'
    + '  <div class="bddn-pad100"></div>'
    + '</div>';
  

  editor.msg.selectBlock
    = "Please select a block first. (simply click in one of them)";

  editor.msg.sameDir 
    = "You are already in a block with same direction.";

  editor.msg.sameDirAfter 
    = "There is already a block with same direction after this one!";

  editor.msg.lastBlock 
    = "You cant delete this block. its the last block in editor.";

  editor.msg.confirmDel
    = 'Are you sure that you want to delete this block? \n'
    + 'YOU CANT UNDO THIS OPERATION!';

  editor.msg.confirmSave
    = 'BidiDown is configured to save this document locally! However, '
    + 'its **not** the preferred way to store documents '
    + '(use remote server).\nNot all browsers supports this '
    + 'behavior! want to proceed?';


  // Option: Set up basic style for output layer.
  editor.outputLayerStyle 
    = "font-family:sans-serif;"
    + "font-size:1.1em;"
    + "max-width:800px;"
    + "margin:0 auto;"
    + "margin-top:50px";

  
  return editor;
}; // BidiDown Ends.


// $ works as a basic slector, which operates on editor tags:
// $("#id")    finds elements by thier id.
// $(".class") finds the first element that has the matched class name.
// $("*class") finds all the elements that have the matched class name.
var $ = function(ed, el) {
  if ((typeof(el) !== "string") && (el.length >= 2)) {
    console.log("error: not a valid argument for selector function.");
    return false;
  }

  if (!ed.wrapper) {
    console.log("error: the editor tag is not defined in DOM.")
    return false;
  }

  // element name, minus the first character (# . *)
  var _el = el.slice(1);

  if (el[0] === "#") {
    if (!document.getElementById(_el)) {
      return false;
    }
    return document.getElementById(_el);
  }

  if (el[0] === ".") {
    if (!ed.wrapper.getElementsByClassName(_el)) {
      return false;
    }
    return ed.wrapper.getElementsByClassName(_el)[0];
  }

  if (el[0] === "*") {
    if (!ed.wrapper.getElementsByClassName(_el)) {
      return false;
    }
    return ed.wrapper.getElementsByClassName(_el);
  }

  return false;
};


var setupGUI = function(ed) {
  // This is the final list of ui elements that we will use to create editors
  // GUI. you can change it, rearrange it, or add some new things. currently, it
  // only shows a toolbar and the editor area.
  return ('<div id="bddn">'
         +   ed.ui.toolbar
         +   ed.ui.editor
         + '</div>');
};


var init = function(ed, wrapper, direction) {
  ed.wrapper = document.getElementById(wrapper);
  ed.direction = direction;
  ed.wrapper.innerHTML = setupGUI(ed);

  // Attach events.
  $(ed, '#bddn-btn-ltr').addEventListener('click', function(e) {btnLTRClick(e, ed)});
  $(ed, '#bddn-btn-rtl').addEventListener('click', function(e) {btnRTLClick(e, ed)});
  $(ed, '#bddn-btn-toggle').addEventListener('click', function(e) {btnToggleClick(e, ed)});
  $(ed, '#bddn-btn-delete').addEventListener('click', function(e) {btnDeleteClick(e, ed)});
  $(ed, '#bddn-btn-save').addEventListener('click', function(e) {btnSaveClick(e, ed)});
  $(ed, '#bddn-btn-open').addEventListener('click', function(e) {btnLoadClick(e, ed)});
  $(ed, '#bddn-btn-html').addEventListener('click', function(e) {btnHTMLClick(e, ed)});
  
  refreshBlocks(ed);
  
};


// blockCount could tell how many blocks are in editor.
var blockCount = function(ed) {
  var blocks = $(ed, '*bddn-editor-block');
  return blocks.length
}


var newBlock = function(ed, direction) {
  var dirClass = "bddn-" + direction + "-block";

  if (!ed.lastActiveBlock) {
    alert(ed.msg.selectBlock);
    return false;
  }

  if (ed.lastActiveBlock.classList.contains(dirClass)) {
    alert(ed.msg.sameDir);
    ed.lastActiveBlock.focus();
    return false;
  }

  if (ed.lastActiveBlock.nextElementSibling.classList.contains(dirClass)) {
    alert(ed.msg.sameDirAfter);
    ed.lastActiveBlock.focus();
    return false;
  }

  ed.lastActiveBlock.insertAdjacentHTML(
    'afterend', '<textarea class="bddn-editor-block '+ dirClass +'" rows="1"></textarea>'
  );
  //ed.setupInputBlocks();
  refreshBlocks(ed);

  if (ed.lastActiveBlock.nextElementSibling.type == 'textarea') {
    ed.lastActiveBlock.nextElementSibling.focus();
  }
}


// escapeHTML
var escapeHTML = function(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// unescapeHTML 
var unescapeHTML = function(text){
  var e = document.createElement('div');
  e.innerHTML = text;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
};


// editorToMarkj returns a markj document based on editor blocks. Markj is
// basically a json document with special format that you can use for
// save/load/ajax... 
// This is a sample markj document generated by this function:
// {
//   'content': [
//      {'text': 'Some text here...', 'dir': 'rtl'},
//      {'text': 'Some text there...', 'dir': 'ltr'},
//      ...
//   ]
// }
var editorToMarkj = function(ed) {
  var blocks = $(ed, '*bddn-editor-block');
  var output = {};

  output['content'] = [];

  for(var i=0, len=blocks.length; i<len; i=i+1) {
    var block = blocks[i];
    var blockText = escapeHTML(block.value);

    var row = {'text' : blockText};

    if (block.classList.contains("bddn-ltr-block")) {
      row['dir'] = 'ltr';
    } else {
      row['dir'] = 'rtl';
    }
    output['content'].push(row);
  }
  return JSON.stringify(output);
};


// markjToHTML converts a markj document to HTML.
var markjToHTML = function(j) {
  var rows = JSON.parse(j);
  var output = '';

  for(var i=0, len=rows['content'].length; i<len; i=i+1) {
    var text = rows['content'][i]['text'];
    var markedText = marked(text);

    var layeredText = '<div dir="ltr">'+ markedText +'</div>';
    if (rows['content'][i]['dir'] === 'rtl') {
      layeredText = '<div dir="rtl">'+ markedText +'</div>';
    }
    output += layeredText;
  }
  return output;
};


// editorFromMarkj setup editor from json document.
var editorFromMarkj = function(ed, j) {
  if (!j) {
    console.log("Error: no data to parse.");
    return false;
  }
  var rows = JSON.parse(j);
  var blocks = '';
  var elem = '';

  for(var i=0, len=rows['content'].length; i<len; i=i+1) {
    var row = rows['content'][i];

    if (row['dir'] === 'ltr') {
      elem
        = "<textarea class='bddn-editor-block bddn-ltr-block' rows='1'>"
        + unescapeHTML(row['text'])
        + "</textarea>";
    } else {
      elem
        = "<textarea class='bddn-editor-block bddn-rtl-block' rows='1'>"
        + unescapeHTML(row['text'])
        + "</textarea>";
    }
    blocks = blocks + elem;
  }

  $(ed, ".bddn-editor").innerHTML = blocks + '<div class="bddn-pad100"></div>';
  refreshBlocks(ed);
};


var btnRTLClick = function(e, ed) {
  e.preventDefault();
  newBlock(ed, "rtl");
};


var btnLTRClick = function(e, ed) {
  e.preventDefault();
  newBlock(ed, "ltr");
};


var btnToggleClick = function(e, ed) {
  e.preventDefault();

  if (!ed.lastActiveBlock) {
    alert(ed.msg.selectBlock);
    return false;
  }

  if (ed.lastActiveBlock.classList.contains("bddn-rtl-block")) {
    ed.lastActiveBlock.classList.remove("bddn-rtl-block");
    ed.lastActiveBlock.classList.add("bddn-ltr-block");
    ed.lastActiveBlock.focus();
    return false;
  }

  ed.lastActiveBlock.classList.remove("bddn-ltr-block");
  ed.lastActiveBlock.classList.add("bddn-rtl-block");
  ed.lastActiveBlock.focus();
};


var btnDeleteClick = function(e, ed) {
  e.preventDefault();

  if (!ed.lastActiveBlock) {
    alert(ed.msg.selectBlock);
    return false;
  }

  // editor should have at least one block.
  if (blockCount(ed) === 1) {
    alert(ed.msg.lastBlock);
    ed.lastActiveBlock.focus();
    return false;
  }

  var ok = confirm(ed.msg.confirmDel);
  if (ok) {
    ed.lastActiveBlock.parentNode.removeChild(ed.lastActiveBlock);
    ed.lastActiveBlock = null;
    return false;
  }

  return false;
};


var btnSaveClick = function(e, ed) {
  e.preventDefault();

  var ok = confirm(ed.msg.confirmSave);
  if (ok) {
    var w = window.open('data:application/octet-stream;charset=utf-8,'
      + encodeURIComponent(editorToMarkj(ed))
    );
  }

  return false;
};


var btnLoadClick = function(e, ed) {
  e.preventDefault();

  var j = prompt("Copy/Paste your markj string here:");
  if (j != null) {
    editorFromMarkj(ed, j)
  }
};


var btnHTMLClick = function(e, ed) {
  e.preventDefault();

  var j = editorToMarkj(ed);
  var content = markjToHTML(j);

  var w = window.open();
  w.document.body.innerHTML = '<div id="bddn-doc"><div>'+ content +'</div></div>'; 
  w.document
    .getElementById("bddn-doc")
    .setAttribute("style", ed.outputLayerStyle);
};


var refreshBlocks = function(ed) {
  var blocks = $(ed, '*bddn-editor-block');

  for(var i=0, len=blocks.length; i<len; i=i+1) {
    var block = blocks[i];

    // Initial size for each textarea.
    block.style.height = (5+block.scrollHeight)+"px";

    block.addEventListener('keyup', function(e) {
      // Resize textarea based on content.
      this.style.height = "1px";
      this.style.height = (5+this.scrollHeight)+"px";

      body.style.height = ($(ed, '.bddn-editor').offsetHeight+400)+"px";
    });

    block.addEventListener('blur', function(e) {
      ed.lastActiveBlock = this;
    });
  }
  
};


var BidiDown = {
  'newEditor': newEditor,
  'init': init,
  '$': $,
  'editorToMarkj': editorToMarkj,
  'markjToHTML': markjToHTML,
  'editorFromMarkj': editorFromMarkj
};

if (typeof define === 'function' && define.amd) {
  define(BidiDown);
} else {
  window.BidiDown = BidiDown;
}
})(window);
