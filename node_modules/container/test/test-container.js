/*jshint node:true strict:false */

var testCase = require('nodeunit').testCase;
var Container = require('../lib/container');
var _ = require('underscore');

module.exports = testCase({
    "adding and getting objects": function(test) {
        var di = new Container();
        var value = {foo:"bar"};
        di.add("a", value);
        di.get("a", function(err, a) {
            test.strictEqual(a, value);
            test.done();
        });
    },
    "adding and getting with creator functions": function(test) {
        var di = new Container();
        var value = {foo:"bar"};
        di.add("a", function(callback) {
            return callback(null, value);
        });
        di.get("a", function(err, a) {
            test.strictEqual(a, value);
            test.done();
        });
    },
    "interdependent creator functions": function(test) {
        var di = new Container();
        di.add("a", function(callback) {
            return callback(null, {foo:"bar"});
        });
        di.add("b", function(a, callback) {
            return callback(null, _.extend({lala: 5}, a));
        });
        di.get("b", function(err, someB) {
            test.strictEqual(someB.foo, "bar");
            test.strictEqual(someB.lala, 5);
            test.done();
        });
    },
    "invoke function with dependencies": function(test) {
        test.expect(5);
        var fn = function(a, b, c, d) {
            test.strictEqual(a, 1);
            test.strictEqual(b, 2);
            test.strictEqual(c, 3);
            test.strictEqual(d, 4);
            return 5;
        };
        var di = new Container();
        di.add("c", 3);
        di.add("a", 1);
        di.add("b", 2);
        di.invoke(fn, {d: 4}, function(err, retVal) {
            test.strictEqual(retVal, 5);
            test.done();
        });
    },
    "test container failing when var not found": function(test) {
        test.expect(2);
        var di = new Container();
        di.add("c", 3);
        di.add("b", 2);
        di.invoke(function(a, b, c, d) {}, {d: 4}, function(err) {
            test.ok(err instanceof Error);
        });
        di.invoke(function(b, c, d) {}, {d: 4}, function(err) {
            test.ok(!err);
        });
        test.done();
    },
    "test di.create with a module that is an object with a create function": function(test) {
        test.expect(6);
        var requireFn = function(path) {
            test.strictEqual(path, 'a/b');
            return {
                create: function(a, b, c, d) {
                    test.strictEqual(a, 1);
                    test.strictEqual(b, 2);
                    test.strictEqual(c, 3);
                    test.strictEqual(d, 4);
                    return 5;
                }
            };
        };

        var di = new Container(requireFn);
        di.add("c", 3);
        di.add("a", 1);
        di.add("b", 2);
        di.create('a/b', {d: 4}, function(err, val) {
            test.strictEqual(val, 5);
            test.done();
        });
    },
    "test di.create with a module that a function": function(test) {
        test.expect(6);
        var requireFn = function(path) {
            test.strictEqual(path, 'a/b');
            return function(a, b, c, d) {
                test.strictEqual(a, 1);
                test.strictEqual(b, 2);
                test.strictEqual(c, 3);
                test.strictEqual(d, 4);
                return 5;
            };
        };

        var di = new Container(requireFn);
        di.add("c", 3);
        di.add("a", 1);
        di.add("b", 2);
        di.create('a/b', {d: 4}, function(err, val) {
            test.strictEqual(val, 5);
            test.done();
        });
    },
    "test circular dependency detection": function(test) {
        var di = new Container();
        di.add("a", function(c, callback) {
            return callback(null, 1);
        });
        di.add("b", function(a, callback) {
            return callback(null, 2);
        });
        di.add("c", function(b, callback) {
            return callback(null, 3);
        });

        di.get("a", function(err, a) {
            test.ok(err instanceof Error);
            test.done();
        });
    },
    "test concurrent invocations": function(test) {
        test.expect(2);
        var di = new Container();
        var counter = 0;
        di.add("a", function(callback) {
            var a = ++counter;
            //return 3 in 100ms
            setTimeout(callback.bind(null, null, a), 100);
        });

        di.get("a", function(err, a) {
            test.strictEqual(a, 1);
        });

        setTimeout(function() {
            di.get("a", function(err, a) {
                test.strictEqual(a, 1);
                test.done();
            });
        }, 50);
    },
    "test missing extraArguments in invoke": function(test) {
        test.expect(3);
        var di = new Container();
        di.add("a", function(callback) {
            return callback(null, 1);
        });
        di.add("b", function(callback) {
            return callback(null, 2);
        });
        di.add("c", function(callback) {
            return callback(null, 3);
        });
        di.invoke(function(a,b,c) {
            test.strictEqual(a, 1);
            test.strictEqual(b, 2);
            test.strictEqual(c, 3);
        }, function() {
            test.done();
        });
    },
    "test nested invoke": function(test) {
        var di = new Container();
        di.add("a", function(callback) {
            return callback(null, 1);
        });
        di.add("b", function(callback) {
            return callback(null, 2);
        });
        di.add("c", function(callback) {
            return callback(null, 3);
        });
        di.invoke(function(a,b,c) {
            test.strictEqual(a, 1);
            test.strictEqual(b, 2);
            test.strictEqual(c, 3);
            di.invoke(function(a,b,c) {
                test.strictEqual(a, 1);
                test.strictEqual(b, 2);
                test.strictEqual(c, 3);
                test.done();
            }, function(err) {});
        }, function(err) {});
    },
    "test that the done callback is only called once": function(test) {
        test.expect(1);
        var di = new Container();
        di.add("a", function(callback) {
            return callback(null, 1);
        });
        di.add("b", function(callback) {
            return callback(null, 2);
        });
        di.add("c", function(callback) {
            return callback(null, 3);
        });
        di.invoke(function(a,b,c) {}, function() {
            test.ok(true);
            test.done();
        }, function(err) {});
    },
    "test error handling with callback": function(test) {
        test.expect(6);

        var di = new Container();
        di.add("a", function(callback) {
            return callback(null, 1);
        });
        di.add("b", function(callback) {
            return callback(null, 2);
        });
        di.add("c", function(callback) {
            return callback(new Error('dependency boom'));
        });

        var fnWithErrorInBody = function(a,b) {
            throw new Error('boom');
        };

        var fnWithErrorInDep = function(c) {
            return 5;
        };

        var fnWithNonExistentDep = function(d) {
            return 5;
        };

        di.invoke(fnWithErrorInBody, function(err, result) {
            test.strictEqual(typeof result, 'undefined');
            test.ok(err.message, 'boom');
        });

        di.invoke(fnWithErrorInDep, function(err, result) {
            test.strictEqual(typeof result, 'undefined');
            test.strictEqual(err.message, 'dependency boom at c');
        });

        di.invoke(fnWithNonExistentDep, function(err, result) {
            test.strictEqual(typeof result, 'undefined');
            test.ok(err instanceof Error);
        });

        test.done();
    },
    "test error after callback is passed to another tick": function(test) {
        function fnErrorAfterCallback (done) {
            process.nextTick(done);
            throw new Error("bad code!");
        }
        var di = new Container();
        var extraArguments = {
            "done": test.done.bind(test)
        };
        di.invoke(fnErrorAfterCallback, extraArguments, function(err, fnValue) {
            test.strictEqual(err.message, "bad code!");
            test.strictEqual(typeof fnValue, "undefined");
        });
    },
    "test createAll": function(test) {
        var modules = {
            'path/a': function() {return 4;},
            'path/b': function() {return 2;}
        };
        var requireFn = function(moduleName) {return modules[moduleName];};

        var di = new Container(requireFn);
        di.createAll({
            a: 'path/a',
            b: 'path/b'
        }, function(err, results) {
            test.strictEqual(results.a, 4);
            test.strictEqual(results.b, 2);
            test.ifError(err);
            test.done();
        });
    },
    "test invokeAll": function(test) {
        var di = new Container();
        di.add('a', 4);
        di.add('b', 5);
        
        di.invokeAll({
            fn1: function(a, b) {return a + b;},
            fn2: function(a) {return a * a;}
        }, function(err, results) {
            test.strictEqual(results.fn1, 9);
            test.strictEqual(results.fn2, 16);
            test.ifError(err);
            test.done();
        });
    },
    "test multiple injected values that depend on each other": function(test) {
        var di = new Container();
        di.add("a", function(callback) {
            return callback(null, 5);
        });
        di.add("b", function(a, callback) {
            return callback(null, 4 + a);
        });
        di.invoke(function(a, b) {
            test.strictEqual(a, 5);
            test.strictEqual(b, 9);
        }, function(err) {
            test.ifError(err);
            test.done();
        });
    },
    "test optional arguments": function(test) {
        test.expect(6);
        var di = new Container();
        di.invoke(function(arg_optional) {
            test.ok(!arg_optional);
        }, function(err) {
            test.ifError(err);
        });

        di.add("arg", 5);
        di.invoke(function(arg_optional) {
            test.strictEqual(arg_optional, 5);
        }, function(err) {
            test.ok(!err);
        });

        //try settings since it has the same length as _optional,
        //this is to test for a regression where any length with
        //the same length as _optional returned null
        di.add("settings", 5);
        di.invoke(function(settings) {
            test.strictEqual(settings, 5);
        }, function(err) {
            test.ok(!err);
            test.done();
        });
    },
    "test bind": function(test) {
        test.expect(5);
        var fn = function(a, b, c, d) {
            test.strictEqual(a, 1);
            test.strictEqual(b, 2);
            test.strictEqual(c, 3);
            test.strictEqual(d, 4);
            return 5;
        };
        var di = new Container();
        di.add("c", 3);
        di.add("a", 1);
        di.add("b", 2);
        di.bind(fn, {d: 4}, function(err, boundFn) {
            var returnValue = boundFn();
            test.strictEqual(returnValue, 5);
            test.done();
        });
    },
    "test bindAll": function(test) {
        var di = new Container();
        di.add('a', 4);
        di.add('b', 5);
        
        di.bindAll({
            fn1: function(a, b) {return a + b;},
            fn2: function(a) {return a * a;}
        }, function(err, results) {
            test.strictEqual(results.fn1(), 9);
            test.strictEqual(results.fn2(), 16);
            test.ifError(err);
            test.done();
        });
    },
    "test this scope parameter": function(test) {
        test.expect(3);
        var fn = function() {
            test.strictEqual(this.get(), "harhar");
            return "It's a pirate!";
        };
        var di = new Container();
        di.invoke(fn, function(err, fnValue) {
            test.ifError(err);
            test.strictEqual(fnValue, "It's a pirate!");
            test.done();
        }, {get:function(){return "harhar";}});
    },
    "test no circular reference with di.addPath": function(test) {
        var requireFn = function(path) {
            test.strictEqual(path, 'a/b');
            return {
                create: function(a) {
                    return 5;
                }
            };
        };

        var di = new Container(requireFn);
        di.add("a", function(b, callback) {
            return callback(null, b);
        });
        di.addPath("b", 'a/b');
        di.invoke(function(a) {
            test.ok(false,'should not be called with circular dependency');
        }, function(err) {
            test.ok(err instanceof Error);
            test.ok(err.message.indexOf('circular') !== -1);
            test.done();
        });
    },
    "test that dependency siblings don't create circular reference errors": function(test) {
        test.expect(2);
        var di = new Container();
        /*
                a
               / \
              b   c
               \ /
                d
        */
        di.add("a", function(b, c, callback) {return callback(null, b + c);});
        di.add("b", function(d, callback) {return callback(null, d * 10);});
        di.add("c", function(d, callback) {return callback(null, d * 100);});
        di.add("d", function(callback) {return callback(null, 3);});
        di.invoke(function(a) {
            test.strictEqual(a, 330);
        }, function(err, result) {
            test.ifError(err);
            test.done();
        });
    },
    "test addAll": function(test) {
        test.expect(3);
        var di = new Container();
        di.addAll({
            a: 5,
            b: 'hello'
        });
        di.invoke(function(a, b) {
            test.strictEqual(a, 5);
            test.strictEqual(b, 'hello');
        }, function(err) {
            test.ifError(err);
            test.done();
        });
    }
});