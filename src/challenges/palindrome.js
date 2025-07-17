export default {
    id: 'palindrome',
    title: 'Palindrome Check',
    description: 'Write a function that checks if a string is a palindrome.',
    exampleTestCases: [
        { input: 'racecar', expected: 'true' },
        { input: 'hello', expected: 'false' },
        { input: 'A man a plan a canal Panama', expected: 'true' },
        { input: 'race a car', expected: 'false' }
    ],
    performanceTestConfig: { 
        input: 'A'.repeat(5000) + 'B' + 'A'.repeat(5000), 
        description: 'Check palindrome of 10001 character string',
        expectedType: 'boolean',
        getExpectedOutput: () => 'false' // This specific pattern is not a palindrome
    },
    difficulty: 'easy',
    sampleCode: {
        javascript: `// Write your palindrome solution here
function solve(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`
    }
};
