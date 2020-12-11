const inspector = require('inspector');
const compact = require('./compact-format.js');

function post(session, method, params)
{
	return new Promise((resolve, reject) =>
		session.post(method, params, (err, result) => err ? reject(err) : resolve(result))
	);
}

function once(session, event)
{
	return new Promise(resolve => session.once(event, resolve));
}

async function runOnDebuggingSession(callback)
{
	const inspectorAlreadyOpen = !!inspector.url();

	inspectorAlreadyOpen || inspector.open();

	const session = new inspector.Session();

	// Debug log
	// session.on('inspectorNotification', msg => console.debug('Inspector Notification:', nativeInspect(msg)));

	session.connect();

	post(session, 'Debugger.enable');

	await callback(session);

	post(session, 'Debugger.disable');
	
	session.disconnect();

	inspectorAlreadyOpen || inspector.close();
}

async function __inspect(subject, options)
{
	let result;

	await runOnDebuggingSession(async session =>
	{
		subject; // Bring the subject to this scope for inspection

		const [{params: {callFrames}}] = await Promise.all(
		[
			once(session, 'Debugger.paused'),
			once(session, 'Debugger.resumed'),
			post(session, 'Debugger.pause'),
		]);
		const inspectFunctionScope = callFrames
			.flatMap(callFrame => callFrame.scopeChain)
			.find(scope => scope.type === 'closure' && scope.name === '__inspect')
			?? (() => { throw new Error('Cound not find the "__inspect" scope'); })(); // Should not happen
		const {result: inspectScopeProperties} =
			await post(session, 'Runtime.getProperties', {objectId: inspectFunctionScope.object.objectId});
		const subjectVar = inspectScopeProperties.find(prop => prop.name === 'subject');

		result = await compact(session, subjectVar.value, options);
	});

	return result;
}

module.exports = __inspect;
