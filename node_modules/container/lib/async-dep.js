/*jshint node:true strict:false */

var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

function AsyncDependency(creatorFn) {
	this.creatorFn = creatorFn;
}

AsyncDependency.prototype = Object.create(EventEmitter.prototype);

AsyncDependency.prototype.get = function(invocation, requestedDependencies, callback) {
	var self = this;
	if(this.value) {
		return callback(null, this.value);
	}
	this.on('done', callback.bind(null, null));
	//since the error event can be emitted twice, only listen the first time
	this.once('error', callback);

	if(this.loading) {
		return;
	}
	this.loading = true;
	this.errorEmitted = false;

	var wrappedCallback = function(err, value) {
		//report errors back to all callbacks that are listening
		if(err) {
			self.errorEmitted = true;
			self.emit('error', err);
			return;
		}
		self.value = value;
		self.loading = false;
		if(!self.errorEmitted) {
			self.emit('done', value);
		}
	};

	invocation.invoke(this.creatorFn, requestedDependencies, {
		callback: wrappedCallback
	}, function(err, returnValue) {
		//catch uncaught errors here
		if(err) {
			self.errorEmitted = true;
			return self.emit('error', err);
		}
		//ask for the return value so we can be sure that we didn't return instead of calling the callback
		assert.ok(typeof returnValue === 'undefined', 'dependency creators should never return a value, use callback');
	});
};

module.exports = AsyncDependency;