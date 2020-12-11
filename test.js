const inspect = require('./private-field-inspect.js');

class Subject
{
	publicField = 'public field value';
	#privateString = 'this is my secret text';
	#privateNumber = Number.NEGATIVE_INFINITY;
	#anotherNumber = 10;
	#privateObject = { a: 1, b: 2, c: { d: 3, e: 4}, f: null, g: 'NO LONGER SECRET'};
	#privateNull = null;
	#privateUndefined = undefined;
	#privateArray = [1, 2, 3];

	get publicGetter()
	{
		return 'public getter value';
	}

	get #privateGetter()
	{
		return 'private getter value';
	}

	publicMethod()
	{
		return 'public method value';
	}

	#privateMethod()
	{
		return 'private method value';
	}
}

const subject = new Subject();

inspect(subject, {colors: true})
	.then(console.log);
