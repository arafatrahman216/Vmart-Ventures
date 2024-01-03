/*jshint node:true strict:false */

var async = require('async');

function getFunctionArgumentNames(func) {
    var funStr = func.toString();
    return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}

function parseArgument(name) {
	var flags = {
		optional: false
	};
	var optionalPostfix = '_optional';
	if(name.length > optionalPostfix.length && name.substr(-optionalPostfix.length) === optionalPostfix) {
		name = name.substr(0, name.length - optionalPostfix.length);
		flags.optional = true;
	}
	return {
		name: name,
		flags: flags
	};
}

/** To be able to detect circular dependencies,
	we create a seperate invocation object each time di.invoke or di.get is called.
	That way we can mark inside this object what dependencies have already been loaded
	and fail when we double load one which means a circular dependency
 */
function Invocation(di) {
	this.di = di;
}

Invocation.prototype.invoke = function(fn, requestedDependencies, extraArguments, callback, thisArg) {
	this.bind(fn, requestedDependencies, extraArguments, function(err, boundFn) {
		if(err) {
			return callback(err);
		}
		var retVal;
		try {
			retVal = boundFn();
		} catch(caughtError) {
			err = caughtError;
		} finally {
			return callback(err, retVal);
		}
	}, thisArg);
};

Invocation.prototype.bind = function(fn, requestedDependencies, extraArguments, callback, thisArg) {
	var argumentNames = fn.argumentNames || getFunctionArgumentNames(fn) || [];
	fn.argumentNames = argumentNames;
	var self = this;

	async.map(argumentNames, function(argumentName, next) {
		if(extraArguments.hasOwnProperty(argumentName)) {
			return next(null, extraArguments[argumentName]);
		}
		//create a new object inheriting from from the parent loaded dependencies
		//so that sibling depedencies don't interfere with each other to detect circular references
		var reqDeps = Object.create(requestedDependencies);
		self.get(argumentName, reqDeps, function(err, value) {
			if(err) {
				err.message = err.message + ' at ' + argumentName;
			}
			return next(err, value);
		});
	}, function(err, argumentValues) {
		if(err) {
			return callback(err);
		}
		var boundFn = fn.bind.apply(fn, [thisArg].concat(argumentValues));
		callback(null, boundFn);
	});
};

Invocation.prototype.get = function(name, requestedDependencies, callback) {
	if(requestedDependencies[name]) {
		return callback(new Error('circular dependency: trying to load ' + name +
				' again when ' + Object.keys(requestedDependencies).join(' > ') +
				' have been loaded already.'));
	}
	//we keep track what modules have been loaded in this invocation ...
	requestedDependencies[name] = true;
	//allow absent values if the name starts with optional
	var arg = parseArgument(name);
	//... but we still get our dependencies from the container
	var dep = this.di.dependencies[arg.name];
	if(!dep) {
		if(arg.flags.optional) {
			return callback(null, null);
		} else {
			return callback(new Error('no value with name ' + name + ' found in this DI container'));
		}
	}

	dep.get(this, requestedDependencies, callback);
};

module.exports = Invocation;