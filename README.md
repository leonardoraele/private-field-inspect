# private-field-inspect

This function inspects the contents of a given variable and returns a string representation of it's value.
It behaves just like [util.inspect](https://nodejs.org/api/util.html#util_util_inspect_object_options)
and accepts the same options,
with the only exception that it also shows private class fields.

### Example
```js
import inspect from 'private-field-inspect';

class Subject
{
	#secretValue = 'my secret';
}

const subject = new Subject();

inspect(subject)
	.then(console.debug);
```

Output:

```js
{ '#secretValue': 'my secret' }
```

### Caveats

- Only works on Node 14.5+

- Reading private class fields was supposed to not be possible except using Node debugger.
The way we work around it is by using Node's [inspector](https://nodejs.org/api/inspector.html) API to dynamically open
a debugger session and use it to read the object's private fields.
This means a warning will be printed to the console each time the function is called.

- Just like `util.inspect`, this function is intended for debugging; it's output should not be relied upon.

- It currently doesn't handle circular references.
