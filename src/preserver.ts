/** Placeholder that will never collide with real content. */
const PLACEHOLDER_PREFIX = '\0LATEX_PRESERVED_';

type Preserved = {
	placeholder: string;
	original: string;
};

// Remove already existing double dollars and replace them with placeholders to preserve them during further processing.
export function preserveExistingDoubleDollar(input: string): {
	text: string;
	preserved: Preserved[];
} {
	const preserved: Preserved[] = [];

	// Lazy (non-greedy) match of double dollars, ensuring that we capture the content between the nearest pairs, even if it contains nested single dollars.
	const text = input.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
		const placeholder = `${PLACEHOLDER_PREFIX}${preserved.length}\0`;
		preserved.push({ placeholder, original: match });

		return placeholder;
	});

	return { text, preserved };
}

// Restore preserved content by replacing placeholders with their original values.
export function restorePreserved(
	input: string,
	preserved: Preserved[],
): string {
	let result = input;

	// Restore in reverse so indices stay stable if placeholders overlap in length.
	for (let i = preserved.length - 1; i >= 0; i--) {
		result = result
			.split(preserved[i]!.placeholder)
			.join(preserved[i]!.original);
	}

	return result;
}
