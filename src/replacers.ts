// Replace \( ... \) paren delimiters with $$ ... $$.
export function replaceParenDelimiters(input: string): string {
	// \( ... \)  the content is captured non‑greedily.
	return input.replace(
		/\\\(([\s\S]*?)\\\)/g,
		(_match, inner: string) => `$$${inner}$$`,
	);
}

// \[ ... \]  the content is captured non‑greedily.
export function replaceBracketDelimiters(input: string): string {
	return input.replace(
		/\\\[([\s\S]*?)\\\]/g,
		(_match, inner: string) => `$$${inner}$$`,
	);
}

// Replace single dollars with double dollars, but only if they are not already part of a preserved double dollar.
// This is done in two phases to handle block and inline forms separately.
export function replaceSingleDollar(input: string): string {
	// Phase A: block form
	let result = input.replace(
		/(?:^|(?<=\n))([ \t]*)\$([ \t]*)\n([\s\S]*?)\n([ \t]*)\$([ \t]*)(?:$|(?=\n))/g,
		(_m, _w1, _w2, inner) => `$$\n${inner}\n$$`,
	);

	// Phase B: inline form, allowing optional spaces inside delimiters.
	result = result.replace(
		/(?<!\\)\$([^\n$]*?\S[^\n$]*?)(?<!\\)\$(?!\$)/g,
		(_m, inner) => `$$${inner.trim()}$$`,
	);

	return result;
}
