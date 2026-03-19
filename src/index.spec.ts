import { preprocessLatex } from './preprocessor';

// Inline \(...\)
describe('\\(…\\) paren delimiters', () => {
	test('inline simple expression', () => {
		expect(preprocessLatex('Euler: \\(e^{i\\pi}+1=0\\)')).toBe(
			'Euler: $$e^{i\\pi}+1=0$$',
		);
	});

	test('inline with surrounding text', () => {
		expect(preprocessLatex('The value \\(x^2\\) is positive.')).toBe(
			'The value $$x^2$$ is positive.',
		);
	});

	test('multiple inline on one line', () => {
		expect(preprocessLatex('\\(a\\) and \\(b\\)')).toBe('$$a$$ and $$b$$');
	});

	test('block (multiline) paren', () => {
		const input = 'Before:\n\\(\nx^2 + y^2\n\\)\nAfter';
		const expected = 'Before:\n$$\nx^2 + y^2\n$$\nAfter';
		expect(preprocessLatex(input)).toBe(expected);
	});

	test('inline with spaces inside', () => {
		expect(preprocessLatex('\\( P \\)')).toBe('$$ P $$');
	});
});

// Inline \[...\]
describe('\\[…\\] bracket delimiters', () => {
	test('inline simple expression', () => {
		expect(preprocessLatex('Result: \\[x^2\\]')).toBe('Result: $$x^2$$');
	});

	test('block (multiline) bracket', () => {
		const input = 'Formula:\n\\[\nP = \\frac{X}{N}\n\\]';
		const expected = 'Formula:\n$$\nP = \\frac{X}{N}\n$$';
		expect(preprocessLatex(input)).toBe(expected);
	});

	test('block bracket with leading whitespace', () => {
		const input = '   \\[\n   a + b\n   \\]';
		const expected = '   $$\n   a + b\n   $$';
		expect(preprocessLatex(input)).toBe(expected);
	});
});

// Single $...$
describe('single $…$ delimiters', () => {
	test('inline simple', () => {
		expect(preprocessLatex('The value $x^2$ is positive.')).toBe(
			'The value $$x^2$$ is positive.',
		);
	});

	test('inline space around', () => {
		expect(preprocessLatex('The value $ x^2 $ is positive.')).toBe(
			'The value $$x^2$$ is positive.',
		);
	});

	test('inline single character', () => {
		expect(preprocessLatex('$x$')).toBe('$$x$$');
	});

	test('multiple inline on one line', () => {
		expect(preprocessLatex('$a$ and $b$')).toBe('$$a$$ and $$b$$');
	});

	test('block (multiline) single dollar', () => {
		const input = 'Block:\n$\nx^2 + y^2\n$';
		const expected = 'Block:\n$$\nx^2 + y^2\n$$';
		expect(preprocessLatex(input)).toBe(expected);
	});

	test('currency $500 is NOT converted (no closing $ on same line)', () => {
		expect(preprocessLatex('The price is $500.')).toBe(
			'The price is $500.',
		);
	});

	test('currency $ 500 is NOT converted (no closing $ on same line)', () => {
		expect(preprocessLatex('The price is $ 500.')).toBe(
			'The price is $ 500.',
		);
	});

	test('two currency values on separate lines are NOT paired', () => {
		const input = 'Income: $500,000\nExpense: $200,000';
		expect(preprocessLatex(input)).toBe(
			'Income: $500,000\nExpense: $200,000',
		);
	});
});

// Preserved $$...$$
describe('existing $$…$$ passthrough', () => {
	test('inline $$ left alone', () => {
		expect(preprocessLatex('Already: $$x^2$$')).toBe('Already: $$x^2$$');
	});

	test('block $$ left alone', () => {
		const input = '$$\na + b\n$$';
		expect(preprocessLatex(input)).toBe(input);
	});

	test('multiple $$ regions left alone', () => {
		const input = '$$a$$ then $$b$$';
		expect(preprocessLatex(input)).toBe(input);
	});
});

// Mixed in one string
describe('mixed delimiters', () => {
	test('all four styles in one string', () => {
		const input = '\\(a\\) and \\[b\\] and $c$ and $$d$$';
		const expected = '$$a$$ and $$b$$ and $$c$$ and $$d$$';
		expect(preprocessLatex(input)).toBe(expected);
	});

	test('block bracket + inline paren in one document', () => {
		const input = ['Given \\( x \\):', '\\[', 'x = 42', '\\]'].join('\n');
		const expected = ['Given $$ x $$:', '$$', 'x = 42', '$$'].join('\n');
		expect(preprocessLatex(input)).toBe(expected);
	});
});

// Edges
describe('edge cases', () => {
	test('empty string', () => {
		expect(preprocessLatex('')).toBe('');
	});

	test('no delimiters at all', () => {
		const plain = 'Just some regular text with no math.';
		expect(preprocessLatex(plain)).toBe(plain);
	});

	test('escaped dollar sign left alone', () => {
		expect(preprocessLatex('Price is \\$5.')).toBe('Price is \\$5.');
	});

	test('nested braces inside paren delimiter', () => {
		expect(preprocessLatex('\\(\\frac{a}{b}\\)')).toBe('$$\\frac{a}{b}$$');
	});

	test('consecutive blocks with no gap', () => {
		const input = '\\[a\\]\\[b\\]';
		const expected = '$$a$$$$b$$';
		expect(preprocessLatex(input)).toBe(expected);
	});
});

// Escaped dollar edge cases
describe('escaped dollar edge cases', () => {
	test('escaped dollar at closing position: $x\\$ should not match', () => {
		expect(preprocessLatex('$x\\$')).toBe('$x\\$');
	});

	test('multiple escaped dollars in sequence', () => {
		expect(preprocessLatex('\\$5 and \\$10')).toBe('\\$5 and \\$10');
	});

	test('escaped opening followed by real closing should not match', () => {
		expect(preprocessLatex('\\$x$')).toBe('\\$x$');
	});
});

// Whitespace/empty content
describe('whitespace and empty content', () => {
	test('single dollar with only whitespace should NOT convert', () => {
		expect(preprocessLatex('$ $')).toBe('$ $');
	});

	test('multiple spaces only should NOT convert', () => {
		expect(preprocessLatex('$   $')).toBe('$   $');
	});

	test('whitespace-only input string', () => {
		expect(preprocessLatex('   ')).toBe('   ');
	});
});

// Unmatched/unpaired delimiters
describe('unmatched delimiters', () => {
	test('unclosed paren delimiter passes through unchanged', () => {
		expect(preprocessLatex('\\(x')).toBe('\\(x');
	});

	test('unclosed single dollar passes through unchanged', () => {
		expect(preprocessLatex('$x')).toBe('$x');
	});

	test('unmatched closing bracket alone passes through unchanged', () => {
		expect(preprocessLatex('\\]')).toBe('\\]');
	});
});

// Platform edge cases
describe('platform edge cases', () => {
	test('Windows line endings in block delimiters', () => {
		const input = '\\[\r\na + b\r\n\\]';
		const result = preprocessLatex(input);
		expect(result).toContain('$$');
	});

	test('tab characters inside block form delimiters', () => {
		const input = '\\[\n\ta + b\n\\]';
		const expected = '$$\n\ta + b\n$$';
		expect(preprocessLatex(input)).toBe(expected);
	});
});

// Adversarial inputs
describe('adversarial inputs', () => {
	test('input containing literal placeholder prefix', () => {
		const input = 'Text with \\0LATEX_PRESERVED_0\\0 in it';
		expect(preprocessLatex(input)).toBe(input);
	});

	test('unicode content inside math delimiters', () => {
		expect(preprocessLatex('$\\alpha + \\beta$')).toBe(
			'$$\\alpha + \\beta$$',
		);
	});
});

// Delimiter interactions
describe('delimiter interactions', () => {
	test('adjacent paren + bracket with no separator', () => {
		expect(preprocessLatex('\\(a\\)\\[b\\]')).toBe('$$a$$$$b$$');
	});

	test('adjacent double-dollar blocks', () => {
		expect(preprocessLatex('$$a$$$$b$$')).toBe('$$a$$$$b$$');
	});

	test('dollar sign inside paren math', () => {
		expect(preprocessLatex('\\($5 + x\\)')).toBe('$$$5 + x$$');
	});

	test('nested-looking delimiters', () => {
		const result = preprocessLatex('\\(\\(x\\)\\)');
		// The inner \( should be consumed first by the non-greedy match
		expect(result).toContain('$$');
	});
});

// Content in non-math contexts
describe('non-math dollar contexts', () => {
	test('dollar in URL should not convert', () => {
		const input = 'Visit http://example.com/$path';
		expect(preprocessLatex(input)).toBe(input);
	});
});

// Full test document with math and prose
describe('full document: Per Capita calculation', () => {
	const input = `### Calculation of Per Capita

**Per capita** is a common way to express an average per person in a population. Here's how to calculate it:

1. **Identify Total Quantity (X)**: This could be any measurable quantity, such as total income, total production, or total consumption within a population.

2. **Determine the Population Size (N)**: This is the total number of people in the population.

3. **Calculate Per Capita Value (P)**:
   \\[
   P = \\frac{X}{N}
   \\]
   Where:
   - \\( P \\) is the per capita value.
   - \\( X \\) is the total quantity.
   - \\( N \\) is the population size.

### Example Calculation:

- **Total Income (X)**: $500,000
- **Population (N)**: 250 people

Using the formula:
\\[
P = \\frac{500,000}{250} = 2000
\\]

This means that the average income per person in the population is $2000.

### Applications:

- **Economic Indicators**: Commonly used in economic analyses (e.g., GDP per capita).
- **Health Statistics**: Used to calculate health-related metrics (e.g., healthcare expenditure per capita).

If you need more specific context or examples, let me know!`;

	const expected = `### Calculation of Per Capita

**Per capita** is a common way to express an average per person in a population. Here's how to calculate it:

1. **Identify Total Quantity (X)**: This could be any measurable quantity, such as total income, total production, or total consumption within a population.

2. **Determine the Population Size (N)**: This is the total number of people in the population.

3. **Calculate Per Capita Value (P)**:
   $$
   P = \\frac{X}{N}
   $$
   Where:
   - $$ P $$ is the per capita value.
   - $$ X $$ is the total quantity.
   - $$ N $$ is the population size.

### Example Calculation:

- **Total Income (X)**: $500,000
- **Population (N)**: 250 people

Using the formula:
$$
P = \\frac{500,000}{250} = 2000
$$

This means that the average income per person in the population is $2000.

### Applications:

- **Economic Indicators**: Commonly used in economic analyses (e.g., GDP per capita).
- **Health Statistics**: Used to calculate health-related metrics (e.g., healthcare expenditure per capita).

If you need more specific context or examples, let me know!`;

	test('full document matches expected output exactly', () => {
		expect(preprocessLatex(input)).toBe(expected);
	});

	test('\\[…\\] blocks are converted to $$…$$', () => {
		const result = preprocessLatex(input);
		expect(result).not.toContain('\\[');
		expect(result).not.toContain('\\]');
		expect(result).toContain('$$\n   P = \\frac{X}{N}\n   $$');
		expect(result).toContain('$$\nP = \\frac{500,000}{250} = 2000\n$$');
	});

	test('\\(…\\) inline delimiters are converted to $$…$$', () => {
		const result = preprocessLatex(input);
		expect(result).not.toContain('\\(');
		expect(result).not.toContain('\\)');
		expect(result).toContain('$$ P $$');
		expect(result).toContain('$$ X $$');
		expect(result).toContain('$$ N $$');
	});

	test('currency $500,000 and $2000 are NOT converted', () => {
		const result = preprocessLatex(input);
		expect(result).toContain('$500,000');
		expect(result).toContain('$2000.');
		// They must NOT be wrapped in $$
		expect(result).not.toContain('$$500,000$$');
		expect(result).not.toContain('$$2000$$');
	});

	test('non‑math prose is completely unchanged', () => {
		const result = preprocessLatex(input);
		expect(result).toContain(
			'**Per capita** is a common way to express an average per person',
		);
		expect(result).toContain(
			'If you need more specific context or examples, let me know!',
		);
	});
});
