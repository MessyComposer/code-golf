// Challenge registry - only contains metadata, actual challenges are lazy-loaded
export const challengeRegistry = [
    {
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        difficulty: 'easy',
        importPath: () => import('./fizzbuzz.js')
    },
    {
        id: 'fibonacci',
        title: 'Fibonacci Sequence',
        difficulty: 'medium',
        importPath: () => import('./fibonacci.js')
    },
    {
        id: 'prime',
        title: 'Prime Numbers',
        difficulty: 'medium',
        importPath: () => import('./prime.js')
    },
    {
        id: 'palindrome',
        title: 'Palindrome Check',
        difficulty: 'easy',
        importPath: () => import('./palindrome.js')
    },
    {
        id: 'factorial',
        title: 'Factorial',
        difficulty: 'easy',
        importPath: () => import('./factorial.js')
    },
    {
        id: 'countVowels',
        title: 'Count Vowels',
        difficulty: 'easy',
        importPath: () => import('./countVowels.js')
    },
    {
        id: 'reverseString',
        title: 'Reverse String',
        difficulty: 'easy',
        importPath: () => import('./reverseString.js')
    },
    {
        id: 'sumArray',
        title: 'Sum Array',
        difficulty: 'easy',
        importPath: () => import('./sumArray.js')
    }
];

// Cache for loaded challenges
const challengeCache = new Map();

// Lazy load a challenge
export async function loadChallenge(challengeId) {
    if (challengeCache.has(challengeId)) {
        return challengeCache.get(challengeId);
    }
    
    const challengeInfo = challengeRegistry.find(c => c.id === challengeId);
    if (!challengeInfo) {
        throw new Error(`Challenge ${challengeId} not found`);
    }
    
    try {
        const module = await challengeInfo.importPath();
        const challenge = module.default;
        
        // Process the challenge to resolve lazy-loaded expected outputs
        if (challenge.performanceTestConfig?.getExpectedOutput) {
            challenge.performanceTestConfig.expectedOutput = challenge.performanceTestConfig.getExpectedOutput();
            delete challenge.performanceTestConfig.getExpectedOutput;
        }
        
        challengeCache.set(challengeId, challenge);
        return challenge;
    } catch (error) {
        console.error(`Failed to load challenge ${challengeId}:`, error);
        throw error;
    }
}

// Get challenge metadata without loading the full challenge
export function getChallengeMetadata(challengeId) {
    return challengeRegistry.find(c => c.id === challengeId);
}

// Get all challenge metadata for the dropdown
export function getAllChallengeMetadata() {
    return challengeRegistry;
}
