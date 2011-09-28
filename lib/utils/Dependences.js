/**
 * @fileoverview Extracts module dependencies.
 * @author lifesinger@gmail.com (Frank Wang)
 */

var fs = require('fs');
var astParser = require('uglify-js').parser;


var Dependences = exports;


function parse(inputFile, charset) {
  var ast = getAst(inputFile, charset);

  var deps = parseStatic(ast);
  if (deps === undefined) {
    deps = parseDynamic(ast);
  }
  return deps;
}


function parseStatic(inputFile, charset) {
  var ast = getAst(inputFile, charset);
  var deps;

  // only handle two cases:
  //  define(['b'], function(){}) ==>
  //     stat,call,name,define,array,string,b,function,,...
  //  define('a', ['b], function(){}) ==>
  //    stat,call,name,define,string,a,array,string,b,function,,...

  // NOTICE: the id and deps MUST be literal, the function can be a reference.
  //  define(['b'], xx) ==>
  //    stat,call,name,define,array,string,b,name,xx...

  var pattern = /,stat,call,name,define,(?:(?:[^,]+,){2})?array(,.*?,)(?:function|name),/;
  var match = ast.toString().match(pattern);

  if (match && match[1]) {
    deps = [];
    var t = match[1].match(/,string,[^,]+/g);

    if (t && t.length) {
      deps = t.map(function(s) {
        // s: ,string,xxx
        return s.slice(8);
      });
    }
  }

  return deps;
}


function parseDynamic(inputFile, charset) {
  var ast = getAst(inputFile, charset);
  var deps = [];

  // get dependencies
  // require('a') ==> call,name,require,string,a

  var pattern = /,call,name,require,string,([^,]+)(?:,|$)/g;
  var text = ast.toString();
  var match;
  while ((match = pattern.exec(text))) {
    if (deps.indexOf(match[1]) === -1) {
      deps.push(match[1]);
    }
  }

  return deps;
}


function getAst(inputFile, charset) {
  if (typeof inputFile !== 'string') {
    return inputFile;
  }
  return astParser.parse(fs.readFileSync(inputFile, charset || 'utf-8'));
}


Dependences.parse = parse;
Dependences.parseStatic_ = parseStatic;
Dependences.parseDynamic_ = parseDynamic;