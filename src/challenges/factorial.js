export default {
    id: 'factorial',
    title: 'Factorial',
    description: 'Write a function that calculates the factorial of a number.',
    exampleTestCases: [
        { input: 5, expected: '120' },
        { input: 0, expected: '1' },
        { input: 7, expected: '5040' },
        { input: 3, expected: '6' }
    ],
    performanceTestConfig: { 
        input: 50, 
        description: 'Calculate factorial of 50',
        expectedType: 'number',
        getExpectedOutput: () => {
            // Calculate factorial using BigInt for large numbers
            const n = 50;
            if (n <= 1) return '1';
            let result = 1n;
            for (let i = 2; i <= n; i++) {
                result *= BigInt(i);
            }
            return result.toString();
        }
    },
    difficulty: 'easy',
    sampleCode: {
        javascript: `// Write your factorial solution here
function solve(n) {
    if (n <= 1) return 1;
    return n * solve(n - 1);
}`
    }
};
