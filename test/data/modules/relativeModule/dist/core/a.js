define("test/relativeModule/0.9.1/core/b",[],function(a,b){b.say=function(){console.log("say!")}}),define("test/relativeModule/0.9.1/core/a",["./b"],function(a,b){var c=a("./b");b.say=function(){c.say()}});