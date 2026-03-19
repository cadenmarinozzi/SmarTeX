import { preserveExistingDoubleDollar, restorePreserved } from './preserver';
import {
	replaceBracketDelimiters,
	replaceParenDelimiters,
	replaceSingleDollar,
} from './replacers';

/**
 * Preprocess LaTeX input by converting all delimiters to single and double dollars while preserving existing double dollars. This allows for consistent parsing of LaTeX expressions in the SmarTeX library.
 *
 * @param input - The raw LaTeX input string to preprocess.
 * @returns A preprocessed LaTeX string with standardized delimiters.
 */
export function preprocessLatex(input: string): string {
	// First pass to protect existing double dollars
	let { text, preserved } = preserveExistingDoubleDollar(input);

	// Second pass to replace unprotected delimiters
	text = replaceParenDelimiters(text);
	text = replaceBracketDelimiters(text);

	// Third pass to restore preserved double dollars before final processing
	({ text, preserved } = preserveExistingDoubleDollar(
		restorePreserved(text, preserved),
	));

	// Final pass to replace single dollars, ensuring that preserved double dollars are not affected.
	text = replaceSingleDollar(text);

	// Restore preserved double dollars in the final output
	return restorePreserved(text, preserved);
}
