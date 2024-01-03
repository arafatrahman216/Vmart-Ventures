/*jshint node:true strict:false */

function SyncDependency(creatorFn, thisArg) {
	this.creatorFn = creatorFn;
	this.thisArg = thisArg;
}

SyncDependency.prototype.get = function(invocation, requestedDependencies, callback) {
	var self = this;
	if(this.value) {
		return callback(null, this.value);
	}

	invocation.invoke(this.creatorFn, requestedDependencies, {}, function(err, value) {
		self.value = value;
		return callback(err, value);
	}, this.thisArg);
};

module.exports = SyncDependency;