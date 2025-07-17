export default {
    id: 'countVowels',
    title: 'Count Vowels',
    description: 'Write a function that counts the number of vowels in a string.',
    exampleTestCases: [
        { input: 'Hello World', expected: '3' },
        { input: 'JavaScript', expected: '3' },
        { input: 'bcdfg', expected: '0' },
        { input: 'aeiou', expected: '5' }
    ],
    performanceTestConfig: { 
        input: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100), 
        description: 'Count vowels in 5500 character string',
        expectedType: 'number',
        getExpectedOutput: () => {
            const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100);
            const vowels = 'aeiouAEIOU';
            let count = 0;
            for (let char of text) {
                if (vowels.includes(char)) count++;
            }
            return count.toString();
        }
    },
    difficulty: 'easy',
    sampleCode: {
        javascript: `// Write your vowel counting solution here
function solve(str) {
    const vowels = 'aeiouAEIOU';
    let count = 0;
    for (let char of str) {
        if (vowels.includes(char)) count++;
    }
    return count;
}`
    }
};
