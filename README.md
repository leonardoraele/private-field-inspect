# private-field-inspect

This function inspects the contents of a given object and returns a string representation of it's value,
including it's private class fields.
This is intended to be used for debugging purposes.

### Usage

```js
const inspect = require('./relative/path/to/private-field-inspect');

class Subject
{
	publicValue = 'not so secret';
	#secretValue = 'my secret';
}

const subject = new Subject();

inspect(subject)
	.then(console.debug);
```

Output:

```js
{ publicValue: 'not so secret', '#secretValue': 'my secret' }
```

**Alternativelly,** import it only once like below to setup `inspect` as a global function.

```js
require('./relative/path/to/private-field-inspect/global');
```

### Options

You can pass an object with options as a second argument.

Optios:

- `output`: Determines what should be returned.
	- If `'inspect'` (default): Uses [util.inspect](https://nodejs.org/api/util.html#util_util_inspect_object_options)
	to generate a string representation of the object.
	In this case, additional options present in the options object are passed to the `util.inspect` function so that you
	can customize the output.
	- If `'json'`: Outputs a JSON representation of the object.
	- If `'object'`: It returns a javascript object you can read programatically, rather than a string.
	You can access the private fields by their name, using braces.

		Example:

		```js
		const secretValue = await inspect(subject, {output: 'object'})
			.then(fields => fields['#secretValue']);
		```
- `depth` (default 2): Determines how deep in the object hierarchy the function should go.
	Don't use `Infinity` if your object might have circular references because the function does't treat it.

### Caveats

- Reading private class fields was supposed to not be possible except using Node debugger.
	The way we work around it is by using Node's [inspector](https://nodejs.org/api/inspector.html) API to dynamically open
	a debugger session and use it to read the object's private fields.

	This approach causes the following side effects:

	1. A "Debugger listening on \<url>" warning will be printed in the console even if you are not running node with
		`--inspect`;
	1. If you already happen to have a debugger session open when the `inspect` function is called,
		the runtime will pause inside of it as if there were a breakpoint there
		(just ignore it and continue the execution); and
	1. It doesn't work in the browser.
		(use Chrome DevTools to debug private class fields in the browser)

	This is also why the function is asynchronous.

### Compatibility

- Node 14.5+
- Doesn't work in the browser

### Why Use This?

As of now, VS Code's built-in debugger (up to 1.51.1) doesn't support private class fields yet, and Node (up to 15.4)
doesn't allow you to cheat encapsulation to inspect private fields, so if you want to see the value of your private
variables you have to resort to this.
