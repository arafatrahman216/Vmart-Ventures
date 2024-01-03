injectjs
========
Injectjs is a library that allows you to specify  dependencies, and then invoke functions that can use any of those previously specified dependencies. Dependencies are matched through the argument names of the function that is invoked. Dependencies can have dependencies of themselves, see the example below:

```
var Container = require('injectjs').Container;
var container = new Container();

container.add('settings', {
	logFile: '/var/log/mylog.log'
});
container.add('logger', function(settings, callback) {
	var Logger = require('logger');
	return callback(null, new Logger(settings.logFile));
});

container.invoke(function(logger) {
	logger.info('inside invoked function');
});
```

###creating a container
To start using dependency injection, the first thing to do is to create a container to add all your dependencies to.

```
var Container = require('injectjs').Container;
var container = new Container();
```

###adding dependencies

Once having a container, you can add dependencies using ```container.add(name, value)```.

###Invoking functions
order is not important, matching of arguments is done only by name, optional arguments have the postfix \_optional. This means no error will be thrown when the argument name without the _optional postfix is not present in the container.

###API reference

####Container.add(name, value)
Add a value to the container with ```name```. ```value``` can be a *creator function* that returns the dependency value through a callback. The argument has to be called callback, and the creator function can specify any number of other arguments that should match other dependencies in the container. In other words, creator functions are also dependency injected, with a special extra argument called callback.

The callback accepts two arguments, the first being an error if one occured or null if not, and the second one the value of the dependency if no error occurred.

```
container.add('a', function(anotherDependency, callback) {
	callback(null, 4);
});
```

If ```value``` is not a function, the given value will be returned when the dependency is requested.

```
container.add('port', 8080);
container.add('encryptionKey', 'asd8f9asf787s8dff9s8d');
container.add('today', new Date(1918, 10, 11));
```

####Container.addAll(obj)
Add multiple values to the container giving an object where each property is added to the container with the given name and value. Example:

```
container.addAll({
	a: 5,
	b: 3
});
```
####Container.addPath(name, path)
####Container.get(name, callback)
####Container.invoke(fn [, extraArguments], callback)
####Container.invokeAll(obj [, extraArguments], callback)
####Container.bind(fn [, extraArguments], callback)
####Container.bindAll(obj [, extraArguments], callback)
####Container.create(path, callback)
####Container.createAll(obj, callback)

####error event on container


###circular reference detection



###future plans
   * add way to obtain dependency graph so it can be drawn in a diagram.