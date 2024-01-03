/*jshint node:true strict:false */

var EventEmitter = require('events').EventEmitter;
var async = require('async');
var assert = require('assert');
var AsyncDependency = require('./async-dep');
var SyncDependency = require('./sync-dep');
var ValueDependency = require('./value-dep');
var Invocation = require('./invocation');

function actionForObjectKeys(obj, mapFn, callback) {
	var names = Object.keys(obj);
	var results = {};

	async.forEach(names, function(name, done) {
		var value = obj[name];
		mapFn(value, function(err, value) {
			if(err) {
				return done(err);
			}
			results[name] = value;
			return done();
		});
	}, function(err) {
		if(err) {
			return callback(err);
		}
		return callback(null, results);
	});
}

function wrapCallbackToEmitError(di, callback) {
	assert.strictEqual(typeof callback, 'function', 'invoke or get in Container needs a callback');
	return function(err, value) {
		if(err) {
			var errorListeners = di.listeners('error');
			if(errorListeners && errorListeners.length !== 0) {
				di.emit('error', err);
			}
		}
		return callback(err, value);
	};
}

function Container(requireFn) {
	EventEmitter.call(this);
	this.requireFn = requireFn || require;
	this.dependencies = {};
	this.invocationTree = {};
}

Container.prototype = Object.create(EventEmitter.prototype);

Container.prototype.invoke = function(fn, extraArguments, callback, thisArg) {
	extraArguments = extraArguments || {};
	if(typeof extraArguments === 'function') {
		thisArg = callback;
		callback = extraArguments;
		extraArguments = {};
	}
	var invocation = new Invocation(this);
	return invocation.invoke(fn, null, extraArguments, wrapCallbackToEmitError(this, callback), thisArg);
};

Container.prototype.invokeAll = function(fns, extraArguments, callback, thisArg) {
	var self = this;

	if(typeof extraArguments === 'function') {
		callback = extraArguments;
		extraArguments = {};
	}

	function map(fn, callback) {
		return self.invoke(fn, extraArguments, callback, thisArg);
	}

	actionForObjectKeys(fns, map, callback);
};

Container.prototype.bind = function(fn, extraArguments, callback, thisArg) {
	extraArguments = extraArguments || {};
	if(typeof extraArguments === 'function') {
		thisArg = callback;
		callback = extraArguments;
		extraArguments = {};
	}
	var invocation = new Invocation(this);
	return invocation.bind(fn, null, extraArguments, wrapCallbackToEmitError(this, callback), thisArg);
};

Container.prototype.bindAll = function(fns, extraArguments, callback, thisArg) {
	var self = this;

	if(typeof extraArguments === 'function') {
		callback = extraArguments;
		extraArguments = {};
	}

	function map(fn, callback) {
		return self.bind(fn, extraArguments, callback, thisArg);
	}

	actionForObjectKeys(fns, map, callback);
};

Container.prototype._resolveModuleCreator = function(path) {
	var moduleContent = this.requireFn(path);
	var fn, thisArg;
	if(typeof moduleContent === 'object') {
		fn = moduleContent.create;
		thisArg = moduleContent;
		if(!fn) {
			throw new Error('exported value of module ' + path + ' is an object but it does not have a create function');
		}
	}
	else if(typeof moduleContent === 'function') {
		fn = moduleContent;
	}
	else {
		throw new Error('module ' + path + ' is not a function or an object');
	}
	return {
		fn: fn,
		thisArg: thisArg
	};
};

Container.prototype.create = function(path, extraArguments, callback) {
	var moduleCreator = this._resolveModuleCreator(path);
	return this.invoke(moduleCreator.fn, extraArguments, function(err, returnValue) {
		if(!err) {
			assert.notStrictEqual(typeof returnValue, 'undefined', 'creator function for path ' + path +' did not return a value');
		}
		return callback(err, returnValue);
	}, moduleCreator.thisArg);
};

Container.prototype.createAll = function(paths, extraArguments, callback) {
	var self = this;

	if(typeof extraArguments === 'function') {
		callback = extraArguments;
		extraArguments = {};
	}

	function map(path, callback) {
		return self.create(path, extraArguments, callback);
	}

	actionForObjectKeys(paths, map, callback);
};

Container.prototype.get = function(name, callback) {
	var invocation = new Invocation(this);
	return invocation.get(name, {}, wrapCallbackToEmitError(this, callback));
};

Container.prototype.addPath = function(name, path) {
	var moduleCreator = this._resolveModuleCreator(path);
	this.add(name, new SyncDependency(moduleCreator.fn, moduleCreator.thisArg));
};

Container.prototype.addCreator = function(name, creator) {
	this.add(name, new SyncDependency(creator, null));
};

Container.prototype.add = function(name, value) {
	var dep;
	if(typeof value === 'object' && typeof value.get === 'function') {
		dep = value;
	} else if(typeof value === 'function') {
		dep = new AsyncDependency(value);
	} else {
		dep = new ValueDependency(value);
	}
	this.dependencies[name] = dep;
};

Container.prototype.addAll = function(values) {
	Object.keys(values).forEach(function(name) {
		var value = values[name];
		this.add(name, value);
	}, this);
}

module.exports = Container;