export default {
    id: 'reverseString',
    title: 'Reverse String',
    description: 'Write a function that reverses a string.',
    exampleTestCases: [
        { input: 'JavaScript', expected: 'tpircSavaJ' },
        { input: 'hello', expected: 'olleh' },
        { input: 'world', expected: 'dlrow' },
        { input: 'a', expected: 'a' }
    ],
    performanceTestConfig: { 
        input: 'A'.repeat(25000) + 'B'.repeat(25000), 
        description: 'Reverse string of 50000 characters',
        expectedType: 'string',
        getExpectedOutput: () => 'B'.repeat(25000) + 'A'.repeat(25000)
    },
    difficulty: 'easy',
    sampleCode: {
        javascript: `// Write your string reversal solution here
function solve(str) {
    return str.split('').reverse().join('');
}`
    }
};
