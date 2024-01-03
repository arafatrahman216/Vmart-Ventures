/*jshint node:true strict:false */

function ValueDependency(value) {
	this.value = value;
}

ValueDependency.prototype = {
	get: function(invocation, requestedDependencies, callback) {
		return callback(null, this.value);
	}
};

module.exports = ValueDependency;