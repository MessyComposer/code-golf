export default {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    description: 'Write a function that takes a number n and returns FizzBuzz output from 1 to n.',
    exampleTestCases: [
        { input: 15, expected: '1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz' },
        { input: 5, expected: '1, 2, Fizz, 4, Buzz' },
        { input: 3, expected: '1, 2, Fizz' }
    ],
    performanceTestConfig: { 
        input: 1000, 
        description: 'Generate FizzBuzz for 1000 numbers',
        expectedType: 'string',
        // Lazy-loaded expected output
        getExpectedOutput: () => {
            let result = [];
            for (let i = 1; i <= 1000; i++) {
                if (i % 15 === 0) result.push("FizzBuzz");
                else if (i % 3 === 0) result.push("Fizz");
                else if (i % 5 === 0) result.push("Buzz");
                else result.push(i);
            }
            return result.join(", ");
        }
    },
    difficulty: 'easy',
    sampleCode: {
        javascript: `// Write your FizzBuzz solution here
function solve(n) {
    let result = [];
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) result.push("FizzBuzz");
        else if (i % 3 === 0) result.push("Fizz");
        else if (i % 5 === 0) result.push("Buzz");
        else result.push(i);
    }
    return result.join(", ");
}`
    }
};
