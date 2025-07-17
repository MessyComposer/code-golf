export default {
    id: 'fibonacci',
    title: 'Fibonacci Sequence',
    description: 'Write a function that returns the nth Fibonacci number (0-indexed).',
    exampleTestCases: [
        { input: 5, expected: '5' },
        { input: 8, expected: '21' },
        { input: 12, expected: '144' },
        { input: 0, expected: '0' }
    ],
    performanceTestConfig: { 
        input: 100,
        description: 'Calculate the 100th Fibonacci number',
        expectedType: 'number',
        // Lazy-loaded expected output using BigInt for large numbers
        getExpectedOutput: () => {
            const n = 100;
            return (a=0n,b=n<2?0n:1n,Array.from({length:n-1},()=>[a,b]=[b,a+b]),b.toString());
        }
    },
    difficulty: 'medium',
    sampleCode: {
        javascript: `// Write your Fibonacci solution here
function solve(n) {
    if (n <= 1) return n.toString();
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b.toString();
}
// solve=n=>(a=0n,b=n<2?0n:1n,Array.from({length:n-1},()=>[a,b]=[b,a+b]),b.toString());
`
    }
};
