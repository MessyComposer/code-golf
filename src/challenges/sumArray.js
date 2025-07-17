export default {
    id: 'sumArray',
    title: 'Sum Array',
    description: 'Write a function that calculates the sum of numbers in an array.',
    exampleTestCases: [
        { input: [1, 2, 3, 4, 5], expected: '15' },
        { input: [10, 20, 30], expected: '60' },
        { input: [-1, 1, -2, 2], expected: '0' },
        { input: [100], expected: '100' }
    ],
    performanceTestConfig: { 
        input: Array.from({length: 10000}, (_, i) => i + 1), 
        description: 'Sum array of 10000 numbers',
        expectedType: 'number',
        getExpectedOutput: () => {
            // Sum of 1 to n = n * (n + 1) / 2
            const n = 10000;
            return ((n * (n + 1)) / 2).toString();
        }
    },
    difficulty: 'easy',
    sampleCode: {
        javascript: `// Write your array sum solution here
function solve(arr) {
    return arr.reduce((sum, num) => sum + num, 0);
}`
    }
};
