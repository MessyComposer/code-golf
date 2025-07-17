export default {
    id: 'prime',
    title: 'Prime Numbers',
    description: 'Write a function that takes a number n and returns all prime numbers less than n.',
    exampleTestCases: [
        { input: 30, expected: '2, 3, 5, 7, 11, 13, 17, 19, 23, 29' },
        { input: 10, expected: '2, 3, 5, 7' },
        { input: 20, expected: '2, 3, 5, 7, 11, 13, 17, 19' }
    ],
    performanceTestConfig: { 
        input: 1000, 
        description: 'Find all primes less than 1000',
        expectedType: 'array',
        // Lazy-loaded expected output using sieve of eratosthenes
        getExpectedOutput: () => {
            const n = 1000;
            const sieve = new Array(n).fill(true);
            sieve[0] = sieve[1] = false;
            
            for (let i = 2; i * i < n; i++) {
                if (sieve[i]) {
                    for (let j = i * i; j < n; j += i) {
                        sieve[j] = false;
                    }
                }
            }
            
            const primes = [];
            for (let i = 2; i < n; i++) {
                if (sieve[i]) primes.push(i);
            }
            return primes.join(", ");
        }
    },
    difficulty: 'medium',
    sampleCode: {
        javascript: `// Write your prime numbers solution here
function solve(n) {
    function isPrime(num) {
        if (num < 2) return false;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
        }
        return true;
    }
    
    let primes = [];
    for (let i = 2; i < n; i++) {
        if (isPrime(i)) primes.push(i);
    }
    return primes.join(", ");
}`
    }
};
