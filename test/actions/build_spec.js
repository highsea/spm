var path = require('path');
var fsExt = require('../../lib/utils/fs_ext.js');

var buildAction = require('../../lib/actions/build.js');
var depsPlugin = require('../../lib/plugins/dependencies.js');

var action = 'build';

var moduleAdir = path.join(path.dirname(module.filename), "../data/modules/moduleA/");
var invalidNameModuleDir = path.join(path.dirname(module.filename), "../data/modules/invalidName/");
var noDepsConfigModuleDir = path.join(path.dirname(module.filename), "../data/modules/noDepsConfig/");
var relativeModuleDir = path.join(path.dirname(module.filename), "../data/modules/relativeModule/");

describe('spm build test', function() {

  it('module model create test', function() {
    getProjectModel(action, moduleAdir, function(moduleA) {
      expect(moduleA).not.toBe(null);
      expect(moduleA.name).toEqual('moduleA');
      expect(moduleA.version).toEqual('0.9.17');
    });
  });

  it('test unDepsConfig module build', function() {
    var buildOver = false;
    runs(function() {
      executeBuildAction(noDepsConfigModuleDir, function(model) {
        var distCodePath = path.join(model.distDirectory, 'module-debug.js');
        var moduleDebugCode = fsExt.readFileSync(distCodePath);

        expect(moduleDebugCode).toBeDefined();

        var deps = depsPlugin.parseDependencies(moduleDebugCode);
        deps.forEach(function(dep) {
          expect(/undefined/.test(dep)).toBeFalsy();
        });
        buildOver = true;
      });
    });

    waitsFor(function() {
      return buildOver;
    });
  
  });

  it('test invalidName module build ', function() {
    var buildOver = false;
    runs(function() {
      executeBuildAction(invalidNameModuleDir, function(model) {
        var distCodePath = path.join(model.distDirectory, 'jquery.json-2.s-debug.js');
        var moduleDebugCode = fsExt.readFileSync(distCodePath);
        expect(moduleDebugCode).toBeDefined();
        expect(model.getModuleId('jquery.json-2.s.js')).toEqual('invalidNameModule/0.0.1/jquery.json-2.s');
        var defineReg = /define\("invalidNameModule\/0\.0\.1\/jquery\.json-2\.s-debug/;
        expect(defineReg.test(moduleDebugCode)).toBeTruthy();
        buildOver = true;
      });
    });

    waitsFor(function() {
      return buildOver;
    });
  });

  it('test relative module build ', function() {
    var buildOver = false;
    runs(function() {
      executeBuildAction(relativeModuleDir, function(model) {
        buildOver = true;
        expect(model.name).toEqual('relativeModule');
        var moduleCPath = path.join(relativeModuleDir, 'dist', 'lib', 'c-debug.js');
        expect(fsExt.existsSync(moduleCPath)).toBeTruthy();
        
        var code = fsExt.readFileSync(moduleCPath);

        var cDefReg = /define\("relativeModule\/0.9.1\/lib\/c-debug", \["..\/core\/b-debug", "..\/core\/a-debug"\]/;
        expect(code).toMatch(cDefReg);
      });
    });

    waitsFor(function() {
      return buildOver;
    });
  
  });
});

function executeBuildAction(moduleDir, callback) {
  getProjectModel(action, moduleDir, function(model) {
    buildAction.execute(action, model, function(err) {
      expect(err).toBeFalsy();
      callback(model);
    });
  });
}
