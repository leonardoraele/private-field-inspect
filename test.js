const inspect = require('./private-field-inspect.js');

class Subject
{
	publicValue = "abuilaec";
	#privateNumber = 0;
	#creature =
	{
		name: 'creature',
		head:
		{
			name: 'head',
			body:
			{
				name: 'body',
				tail:
				{
					name: 'tail',
					other: null,
				},
			},
		}
	};
	#privateArray = [1, 2, 3];

	constructor()
	{
		// Force circular reference
		this.#creature.head.body.tail.other = this.#creature;
	}
}

const subject = new Subject();

inspect(subject, {colors: true, depth: 12})
	.then(console.log);
