
// const defaultConsole = console;

const getMatches = require('./get-matches.js');
const ruleEvaluator = require('./rule-evaluator.js');
const resultInterpreter = require('./result-interpreter.js');

module.exports = function getRuleMatches(
	ruleDef = {},
	project,
	// {console = defaultConsole} = {},
) {
	try {
		const matchedNodes = getMatches(project, ruleDef)
		const evaluatedNodes = matchedNodes.map(ruleEvaluator(ruleDef,project))
		console.log(evaluatedNodes)
		const messages = evaluatedNodes.map(resultInterpreter(ruleDef)).reduce(flatten,[])
		const summaryMessage = {
			'level': 'info',
			'rule': ruleDef.$name,
			'description': `Rule ${ruleDef.$name} was matched ${matchedNodes.length} time(s)`,
		};
		return [
			summaryMessage,
			...messages
		];
	} catch (e) {
		console.error(e)
		return {
			level: 'error',
			rule: ruleDef.$name,
			location: `manifest/rule:${ruleDef.$name}`,
			path: `/projects/${project.name}/files/manifest.lkml`,
			...(typeof e == 'object' ? e : {e}),
			description: e && e.message || 'Error in custom rule definition',
		};
	}
}


function flatten(a,b){return a.concat(b)}