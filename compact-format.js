const util = require('util');

const FORMAT_BY_TYPE =
{
	// value.value will be available if the property is null
	object: value => value.value !== undefined ? value.value : value.description,
	undefined: () => undefined,
	string: value => value.value,
	// Fallback necessary because the property won't have a value in case of NaN or Infinity
	number: value => value.value ?? Number(value.description),
	boolean: value => value.value,
	symbol: value => value.value ?? value.description,
	bigint: value => BigInt(value.value ?? value.description),
	wasm: value => `(wasm ${value.subtype}) ${value.description}`,
};

module.exports = async function(session, value, options)
{
	const subject = await formatValue(session, value, options?.depth ?? 2);

	return {
		object: () => subject,
		json: () => JSON.stringify(subject, undefined, options?.space ?? optios?.spaces),
		inspect: () => util.inspect(subject, options),
	}[options?.output ?? 'inspect']();
}

async function formatValue(session, value, depth)
{
	if (value.objectId)
	{
		if (depth > 0)
		{
			return await formatObject(session, value, depth);
		}
		else
		{
			return value.description ?? objectId;
		}
	}
	else
	{
		return FORMAT_BY_TYPE[value.type](value);
	}
}

async function formatObject(session, value, depth)
{
	const object = {};
	const properties = await getProperties(session, value);

	// The property doesn't have a `value` if it's a getter or setter
	const fields = properties.filter(({value = null}) => value && value.type !== 'function');

	for (let {name, value} of fields)
	{
		object[name] = await formatValue(session, value, depth - 1);
	}

	return object;
}

function getProperties(session, {objectId})
{
	return new Promise((resolve, reject) =>
		session.post(
			'Runtime.getProperties',
			{objectId},
			(err, {result: publicProperties = [], privateProperties = []}) => err
				? reject(err)
				: resolve([...publicProperties, ...privateProperties]),
		)
	);
}
