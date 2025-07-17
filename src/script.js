// Code Golf Visualizer JavaScript
import { getAllChallengeMetadata, loadChallenge } from './challenges/index.js';

class CodeGolfVisualizer {
    constructor() {
        // Store only challenge metadata initially - challenges are loaded lazily
        this.challengeMetadata = getAllChallengeMetadata();
        this.loadedChallenges = new Map(); // Cache for loaded challenges
        
        this.currentChallenge = null; // Will be loaded lazily
        this.currentChallengeId = 'fizzbuzz'; // Default challenge ID
        this.submissions = JSON.parse(localStorage.getItem('codeGolfSubmissions') || '[]');
        this.currentCode = '';
        this.currentLanguage = 'javascript';
        this.monacoEditor = null;
        this.performanceHistory = JSON.parse(localStorage.getItem('performanceHistory') || '[]');
        this.currentMetrics = {
            chars: 0,
            execTime: 0,
            efficiency: 0
        };
        this.hasRunCode = false; // Track if code has been executed
        this.monacoLoaded = false; // Track if Monaco Editor is loaded
        this.monacoLoadPromise = null; // Track loading promise
        
        this.setupFallbackEditor(); // Start with fallback editor
        
        // Load the default challenge and initialize
        this.initializeWithChallenge();
        
        // Start loading Monaco in the background after a short delay
        setTimeout(() => {
            this.initMonaco();
        }, 300);
    }
    
    async initializeWithChallenge() {
        try {
            await this.loadChallenge(this.currentChallengeId);
            this.init();
        } catch (error) {
            console.error('Failed to load initial challenge:', error);
            // Fallback to a minimal state
            this.currentChallenge = {
                id: 'loading',
                title: 'Loading...',
                description: 'Loading challenge...',
                exampleTestCases: [],
                difficulty: 'easy'
            };
            this.init();
        }
    }
    
    async loadChallenge(challengeId) {
        if (this.loadedChallenges.has(challengeId)) {
            this.currentChallenge = this.loadedChallenges.get(challengeId);
            this.currentChallengeId = challengeId;
            return this.currentChallenge;
        }
        
        try {
            const challenge = await loadChallenge(challengeId);
            this.loadedChallenges.set(challengeId, challenge);
            this.currentChallenge = challenge;
            this.currentChallengeId = challengeId;
            return challenge;
        } catch (error) {
            console.error(`Failed to load challenge ${challengeId}:`, error);
            throw error;
        }
    }
    
    async initMonaco() {
        if (this.monacoLoaded || this.monacoLoadPromise) {
            return this.monacoLoadPromise;
        }

        this.monacoLoadPromise = new Promise((resolve, reject) => {
            // Load Monaco Editor script dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
            script.onload = () => {
                // Configure Monaco Editor
                window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
                
                window.require(['vs/editor/editor.main'], () => {
                    this.monacoLoaded = true;
                    this.setupMonacoEditor();
                    resolve();
                });
            };
            script.onerror = (error) => {
                console.warn('Monaco Editor failed to load, will continue with fallback:', error);
                reject(error);
            };
            document.head.appendChild(script);
        });

        return this.monacoLoadPromise;
    }
    
    setupMonacoEditor() {
        // Get current code from fallback editor if it exists
        const fallbackEditor = document.getElementById('fallback-editor');
        const currentCode = fallbackEditor ? fallbackEditor.value : this.getSampleCode('javascript');
        
        // Remove loading indicator
        const loadingIndicator = document.getElementById('monaco-loading');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        // Clear the container and setup Monaco
        const editorContainer = document.getElementById('monaco-editor');
        editorContainer.innerHTML = '';
        
        this.monacoEditor = monaco.editor.create(editorContainer, {
            value: currentCode,
            language: 'javascript',
            theme: 'vs-dark',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            autoIndent: 'full',
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true
        });
        
        // Listen for content changes
        this.monacoEditor.onDidChangeModelContent(() => {
            this.currentCode = this.monacoEditor.getValue();
            this.updateCharacterCount();
        });
        
        // Update current code
        this.currentCode = currentCode;
        this.updateCharacterCount();
        
        // Add a subtle visual indicator that Monaco is now active
        editorContainer.style.transition = 'border-color 0.3s ease';
        editorContainer.style.borderColor = '#667eea';
        setTimeout(() => {
            editorContainer.style.borderColor = '#e2e8f0';
        }, 1000);
    }
    
    setupFallbackEditor() {
        // Create a textarea fallback if Monaco Editor fails to load
        const editorContainer = document.getElementById('monaco-editor');
        editorContainer.innerHTML = `
            <textarea id="fallback-editor" style="width: 100%; height: 300px; font-family: monospace; background: #1e1e1e; color: #d4d4d4; border: none; padding: 10px;"></textarea>
            <div id="monaco-loading" style="position: absolute; top: 10px; right: 10px; font-size: 0.8em; color: #888; opacity: 0.7;">
                Loading enhanced editor...
            </div>
        `;
        
        const textarea = document.getElementById('fallback-editor');
        textarea.value = this.getSampleCode('javascript');
        
        textarea.addEventListener('input', () => {
            this.currentCode = textarea.value;
            this.updateCharacterCount();
        });
        
        // Initialize after fallback editor is ready
        this.init();
    }

    init() {
        this.populateChallengeDropdown(); // Populate dropdown with available challenges
        this.setupEventListeners();
        this.updateChallengeDisplay();
        this.updateCharacterCount();
        this.updateSubmissionCount();
        this.updatePerformanceMetrics();
        this.renderPerformanceCharts();
        
        // Get current code from appropriate editor
        if (this.monacoEditor) {
            this.currentCode = this.monacoEditor.getValue();
        } else {
            const textarea = document.getElementById('fallback-editor');
            if (textarea) {
                this.currentCode = textarea.value;
            }
        }
    }
    
    setupEventListeners() {
        // Problem selector
        const problemSelect = document.getElementById('problem-select');
        problemSelect.addEventListener('change', async (e) => {
            await this.switchProblem(e.target.value);
        });
        
        // Language selector
        const languageSelect = document.getElementById('language-select');
        languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.loadSampleCode();
        });
        
        // Run code button
        const runButton = document.getElementById('run-code');
        runButton.addEventListener('click', () => this.runCode());
        
        // Submit code button
        const submitButton = document.getElementById('submit-code');
        submitButton.addEventListener('click', () => this.submitCode());
        
        // Clear storage button
        const clearStorageButton = document.getElementById('clear-storage');
        clearStorageButton.addEventListener('click', () => this.clearStorage());
        
        // Add sample data button
        const addSampleDataButton = document.getElementById('add-sample-data');
        addSampleDataButton.addEventListener('click', () => this.addSampleData());
    }
    
    resetUIState() {
        // Reset current metrics
        this.currentMetrics = {
            chars: 0,
            execTime: 0,
            efficiency: 0
        };
        this.hasRunCode = false; // Reset execution state
        
        // Reset character count display
        document.getElementById('current-chars').textContent = '0';
        
        // Reset execution time display
        document.getElementById('current-time').textContent = '-';
        
        // Reset efficiency score display
        document.getElementById('efficiency-score').textContent = '-';
        
        // Clear code output area
        const output = document.getElementById('code-output');
        output.innerHTML = '';
        output.style.borderLeft = '';
        
        // Reset test badges to pending state (will be re-initialized)
        this.initializeTestBadges();
    }

    async switchProblem(problemId) {
        try {
            await this.loadChallenge(problemId);
            this.resetUIState(); // Reset all UI state first
            this.updateChallengeDisplay();
            this.loadSampleCode();
            this.renderPerformanceCharts();
        } catch (error) {
            console.error(`Failed to switch to challenge ${problemId}:`, error);
            // Show error to user
            document.getElementById('challenge-title').textContent = 'Error loading challenge';
            document.getElementById('challenge-desc').textContent = 'Failed to load challenge. Please try again.';
        }
    }
    
    updateChallengeDisplay() {
        if (!this.currentChallenge) {
            // Show loading state
            document.getElementById('challenge-title').textContent = 'Loading Challenge...';
            document.getElementById('challenge-desc').textContent = 'Please wait while the challenge loads.';
            return;
        }

        document.getElementById('challenge-title').textContent = `Challenge: ${this.currentChallenge.title}`;
        document.getElementById('challenge-desc').textContent = this.currentChallenge.description;
        
        // Update expected output to show example test cases
        this.updateExpectedOutputDisplay();
        
        // Initialize test badges display immediately
        this.initializeTestBadges();
        
        // Update difficulty badge
        const difficultyBadge = document.querySelector('.difficulty-badge');
        if (difficultyBadge) {
            difficultyBadge.className = `difficulty-badge ${this.currentChallenge.difficulty}`;
            difficultyBadge.textContent = this.currentChallenge.difficulty.charAt(0).toUpperCase() + this.currentChallenge.difficulty.slice(1);
        }
        
        // Update submissions count for this problem
        const problemSubmissions = this.submissions.filter(s => s.challengeId === this.currentChallenge.id);
        document.getElementById('submission-count').textContent = problemSubmissions.length;
    }

    getSampleCode(language) {
        // Use sample code from the loaded challenge if available
        if (this.currentChallenge && this.currentChallenge.sampleCode && this.currentChallenge.sampleCode[language]) {
            return this.currentChallenge.sampleCode[language];
        }
        
        // Fallback to built-in samples
        const sampleCode = {
            javascript: this.getJavaScriptSamples(),
        };
        
        return sampleCode[language][this.currentChallengeId] || sampleCode.javascript[this.currentChallengeId] || '// Challenge not loaded yet...';
    }
    
    getJavaScriptSamples() {
        return {
            fizzbuzz: `// Write your FizzBuzz solution here
function solve(n) {
    let result = [];
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) result.push("FizzBuzz");
        else if (i % 3 === 0) result.push("Fizz");
        else if (i % 5 === 0) result.push("Buzz");
        else result.push(i);
    }
    return result.join(", ");
}`,
            
            fibonacci: `// Write your Fibonacci solution here
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
`,
            
            prime: `// Write your prime numbers solution here
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
}`,
            
            palindrome: `// Write your palindrome solution here
function solve(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`,
            
            factorial: `// Write your factorial solution here
function solve(n) {
    if (n <= 1) return 1;
    return n * solve(n - 1);
}`,
            
            countVowels: `// Write your vowel counting solution here
function solve(str) {
    const vowels = 'aeiouAEIOU';
    let count = 0;
    for (let char of str) {
        if (vowels.includes(char)) count++;
    }
    return count;
}`,
            
            reverseString: `// Write your string reversal solution here
function solve(str) {
    return str.split('').reverse().join('');
}`,
            
            sumArray: `// Write your array sum solution here
function solve(arr) {
    return arr.reduce((sum, num) => sum + num, 0);
}`
        };
    }

    loadSampleCode() {
        const code = this.getSampleCode(this.currentLanguage);
        
        if (this.monacoEditor) {
            this.monacoEditor.setValue(code);
            
            // Update Monaco Editor language
            const model = this.monacoEditor.getModel();
            monaco.editor.setModelLanguage(model, this.currentLanguage);
        } else {
            // Update fallback editor
            const fallbackEditor = document.getElementById('fallback-editor');
            if (fallbackEditor) {
                fallbackEditor.value = code;
            }
        }
        
        this.currentCode = code;
        this.updateCharacterCount();
    }
    
    updateCharacterCount() {
        const charCount = this.currentCode.length;
        document.getElementById('char-count').textContent = charCount;
        
        // Update performance metrics
        this.currentMetrics.chars = charCount;
        document.getElementById('current-chars').textContent = charCount;
        this.updateEfficiencyScore();
    }
    
    updateSubmissionCount() {
        const count = this.submissions.length;
        document.getElementById('submission-count').textContent = count;
    }
    
    async runCode() {
        this.hasRunCode = true; // Mark that code execution has started
        const output = document.getElementById('code-output');
        const execTimeElement = document.getElementById('exec-time');
        
        // Get current code from appropriate editor
        if (this.monacoEditor) {
            this.currentCode = this.monacoEditor.getValue();
        } else {
            const fallbackEditor = document.getElementById('fallback-editor');
            if (fallbackEditor) {
                this.currentCode = fallbackEditor.value;
            }
        }
        
        try {
            // Reset test badges to pending state
            this.resetTestBadges();
            
            // Run example test cases one by one
            const testResults = await this.runExampleTestsSequentially();
            
            // Run performance test
            const performanceResult = await this.runPerformanceTest();
            
            // Check if all example tests and performance test passed
            const allPassed = testResults.every(result => result.passed);
            const performancePassed = performanceResult.success;
            
            // Remove any existing performance error messages
            const existingErrorMessages = output.querySelectorAll('.performance-error');
            existingErrorMessages.forEach(msg => msg.remove());
            
            if (performancePassed) {
                // Update performance metrics only if performance test passed
                this.currentMetrics.execTime = performanceResult.execTime;
                document.getElementById('current-time').textContent = performanceResult.formattedTime;
                execTimeElement.textContent = performanceResult.formattedTime;
                this.updateEfficiencyScore();
                
                // Add to performance history
                this.addToPerformanceHistory(this.currentCode.length, performanceResult.execTime, allPassed);
            } else {
                // Performance test failed - show failure feedback
                document.getElementById('current-time').textContent = 'Failed';
                execTimeElement.textContent = 'Failed';
                this.currentMetrics.execTime = 0;
                this.updateEfficiencyScore();
                
                // Add visual feedback for performance failure
                output.style.borderLeft = '4px solid #ef4444';
                const errorMessage = document.createElement('div');
                errorMessage.className = 'performance-error';
                errorMessage.innerHTML = '<strong>⚠️ Performance Test Failed:</strong> Code produces incorrect output for large inputs';
                errorMessage.style.cssText = 'background: #fef2f2; color: #dc2626; padding: 0.75rem; margin-top: 1rem; border-radius: 6px; border: 1px solid #fecaca;';
                output.appendChild(errorMessage);
            }
            
            // Show overall result notification
            if (allPassed && performancePassed) {
                this.showNotification('✅ All tests passed!', 'success');
            } else if (allPassed && !performancePassed) {
                this.showNotification('⚠️ Example tests passed but performance test failed', 'warning');
            } else {
                this.showNotification('❌ Some test cases failed', 'error');
            }
            
        } catch (error) {
            output.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            execTimeElement.textContent = '-';
            this.showNotification('❌ Code execution failed', 'error');
        }
    }
    
    initializeTestBadges() {
        if (!this.currentChallenge?.exampleTestCases) {
            console.warn('No challenge loaded or no test cases available');
            return;
        }
        
        const output = document.getElementById('code-output');
        const testCaseCount = this.currentChallenge.exampleTestCases.length;
        
        let outputHTML = '<div class="test-badges">';
        outputHTML += '<h4>Test Results:</h4>';
        outputHTML += '<div class="badge-container">';
        
        for (let i = 0; i < testCaseCount; i++) {
            outputHTML += `
                <div class="test-badge test-pending" id="test-badge-${i}">
                    <span class="badge-icon">⏳</span>
                    <span class="badge-label">Test Case ${i + 1}</span>
                </div>
            `;
        }
        
        outputHTML += '</div>';
        outputHTML += '</div>';
        
        output.innerHTML = outputHTML;
        output.style.borderLeft = '4px solid #6b7280';
    }

    resetTestBadges() {
        if (!this.currentChallenge?.exampleTestCases) {
            console.warn('No challenge loaded or no test cases available');
            return;
        }
        
        const testCaseCount = this.currentChallenge.exampleTestCases.length;
        
        for (let i = 0; i < testCaseCount; i++) {
            const badgeElement = document.getElementById(`test-badge-${i}`);
            if (badgeElement) {
                badgeElement.className = 'test-badge test-pending';
                badgeElement.querySelector('.badge-icon').textContent = '⏳';
            }
        }
        
        // Reset border color
        const output = document.getElementById('code-output');
        output.style.borderLeft = '4px solid #6b7280';
    }

    async runExampleTestsSequentially() {
        if (!this.currentChallenge?.exampleTestCases) {
            console.warn('No challenge loaded or no test cases available');
            return [];
        }
        
        const testResults = [];
        
        for (let i = 0; i < this.currentChallenge.exampleTestCases.length; i++) {
            const testCase = this.currentChallenge.exampleTestCases[i];
            const badgeElement = document.getElementById(`test-badge-${i}`);
            
            // Update badge to running state
            badgeElement.className = 'test-badge test-running';
            badgeElement.querySelector('.badge-icon').textContent = '⚡';
            
            // Small delay to show running state
            await new Promise(resolve => setTimeout(resolve, 200));
            
            try {
                const result = await this.executeCodeWithInput(this.currentCode, testCase.input);
                const passed = result.trim() === testCase.expected;
                
                // Update badge to final state
                badgeElement.className = `test-badge ${passed ? 'test-passed' : 'test-failed'}`;
                badgeElement.querySelector('.badge-icon').textContent = passed ? '✅' : '❌';
                
                testResults.push({
                    testCase: i + 1,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: result.trim(),
                    passed: passed
                });
                
            } catch (error) {
                // Update badge to error state
                badgeElement.className = 'test-badge test-failed';
                badgeElement.querySelector('.badge-icon').textContent = '❌';
                
                testResults.push({
                    testCase: i + 1,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: `Error: ${error.message}`,
                    passed: false
                });
            }
            
            // Small delay between tests for visual feedback
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Update overall border color
        const allPassed = testResults.every(result => result.passed);
        const output = document.getElementById('code-output');
        output.style.borderLeft = allPassed ? '4px solid #10b981' : '4px solid #ef4444';
        
        return testResults;
    }
    
    async runPerformanceTest() {
        if (!this.currentChallenge?.performanceTestConfig) {
            console.warn('No challenge loaded or no performance test config available');
            return { success: false, execTime: 0, result: '' };
        }
        
        const config = this.currentChallenge.performanceTestConfig;
        
        const startTime = performance.now();
        try {
            const result = await this.executeCodeWithInput(this.currentCode, config.input);
            const endTime = performance.now();
            const success = result === config.expectedOutput;
            const execTime = endTime - startTime;
            
            // Format execution time with higher precision
            let formattedTime;
            if (execTime < 1) {
                formattedTime = (execTime * 1000).toFixed(2) + 'μs';
            } else if (execTime < 1000) {
                formattedTime = execTime.toFixed(3) + 'ms';
            } else {
                formattedTime = (execTime / 1000).toFixed(3) + 's';
            }
            
            return {
                execTime: execTime,
                formattedTime: formattedTime,
                result: result,
                success: success
            };
        } catch (error) {
            return {
                execTime: 0,
                formattedTime: '-',
                result: `Error: ${error.message}`,
                success: false
            };
        }
    }
    async executeCodeWithInput(code, input) {
        // Only support JavaScript for now
        if (this.currentLanguage !== 'javascript') {
            throw new Error('Only JavaScript is currently supported');
        }
        return this.executeJavaScriptWithInput(code, input);
    }
    
    executeJavaScriptWithInput(code, input) {
                    try {
            // Create a safe execution environment with the input
            const func = new Function('input', code + '\n; return solve(input);');
            const result = func(input);
            return String(result);
        } catch (error) {
            throw new Error(`JavaScript execution error: ${error.message}`);
                    }
                }
    async submitCode() {
        try {
            // Get current code from appropriate editor
            if (this.monacoEditor) {
                this.currentCode = this.monacoEditor.getValue();
            } else {
                const fallbackEditor = document.getElementById('fallback-editor');
                if (fallbackEditor) {
                    this.currentCode = fallbackEditor.value;
                }
            }
            
            // Run all example tests to validate correctness
            const testResults = await this.runExampleTests();
            const allTestsPassed = testResults.every(result => result.passed);
            
            if (!allTestsPassed) {
                this.showNotification('❌ Code doesn\'t pass all test cases', 'error');
                return;
            }
            
            // Run performance test for timing
            const performanceResult = await this.runPerformanceTest();
            
            if (!performanceResult.success) {
                this.showNotification('❌ Code failed performance test', 'error');
                return;
            }
            
            const submission = {
                id: Date.now(),
                code: this.currentCode,
                language: this.currentLanguage,
                characterCount: this.currentCode.length,
                executionTime: performanceResult.execTime,
                timestamp: new Date().toISOString(),
                author: this.generateRandomName(),
                challengeId: this.currentChallenge.id
            };
            
            this.submissions.push(submission);
            localStorage.setItem('codeGolfSubmissions', JSON.stringify(this.submissions));
            
            this.updateSubmissionCount();
            this.addToPerformanceHistory(this.currentCode.length, performanceResult.execTime, true);
            
            this.showNotification('🎉 Code submitted successfully!', 'success');
            
        } catch (error) {
            this.showNotification('❌ Submission failed: ' + error.message, 'error');
        }
    }
    
    generateRandomName() {
        const adjectives = ['Quick', 'Smart', 'Fast', 'Clever', 'Swift', 'Bright', 'Sharp', 'Keen'];
        const nouns = ['Coder', 'Developer', 'Programmer', 'Hacker', 'Geek', 'Ninja', 'Wizard', 'Master'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 100);
        return `${adj}${noun}${num}`;
    }
    
    updateEfficiencyScore() {
        if (this.currentMetrics.chars === 0) {
            this.currentMetrics.efficiency = 0;
            document.getElementById('efficiency-score').textContent = '-';
            return;
        }
        
        // If execution time is 0 and code has been run, it means performance test failed
        if (this.currentMetrics.execTime === 0 && this.hasRunCode) {
            this.currentMetrics.efficiency = 0;
            document.getElementById('efficiency-score').textContent = 'Failed';
            return;
        }
        
        // If no code has been run yet, show initial state
        if (!this.hasRunCode) {
            this.currentMetrics.efficiency = 0;
            document.getElementById('efficiency-score').textContent = '-';
            return;
        }
        
        // Calculate efficiency score (lower is better for code golf)
        // Use a more balanced formula that considers both factors proportionally
        
        // Character score: excellent if under 50 chars, good if under 100, poor if over 200
        const charScore = Math.max(0, 100 - Math.pow(this.currentMetrics.chars / 50, 1.5) * 40);
        
        // Time score: excellent if under 10ms, good if under 100ms, poor if over 1000ms
        const timeScore = Math.max(0, 100 - Math.pow(this.currentMetrics.execTime / 100, 1.2) * 60);
        
        // Weighted average: favor character count more for code golf (70% chars, 30% time)
        const efficiency = Math.round(charScore * 0.7 + timeScore * 0.3);
        
        this.currentMetrics.efficiency = Math.max(1, efficiency); // Minimum score of 1
        document.getElementById('efficiency-score').textContent = this.currentMetrics.efficiency;
    }
    
    addToPerformanceHistory(chars, execTime, isCorrect) {
        const entry = {
            timestamp: Date.now(),
            chars: chars,
            execTime: execTime,
            isCorrect: isCorrect
        };
        
        this.performanceHistory.push(entry);
        
        // Keep only last 20 entries
        if (this.performanceHistory.length > 20) {
            this.performanceHistory.shift();
        }
        
        localStorage.setItem('performanceHistory', JSON.stringify(this.performanceHistory));
        this.renderPerformanceCharts();
    }
    
    updatePerformanceMetrics() {
        this.updateCharacterCount();
        this.updateEfficiencyScore();
    }
    
    renderPerformanceCharts() {
        this.renderCharsTimeline();
        this.renderTimeTimeline();
        this.renderComplexityChart();
        this.renderOptimizationChart();
    }
    
    renderCharsTimeline() {
        const canvas = document.getElementById('chars-timeline');
        const ctx = canvas.getContext('2d');
        this.setupHighDPICanvas(canvas, ctx);

        if (this.performanceHistory.length === 0) {
            this.renderEmptyChart(ctx, canvas, 'Run your code to see character count trends');
            return;
        }

        const data = this.performanceHistory.map(entry => entry.chars);
        const min = Math.min(...data);
        const max = Math.max(...data);
        const color = '#667eea';
        const gradientStops = [
            { stop: 0, color: 'rgba(102, 126, 234, 0.8)' },
            { stop: 1, color: 'rgba(102, 126, 234, 0.2)' }
        ];

        this.renderLineChart({
            ctx,
            canvas,
            data,
            min,
            max,
            color,
            gradientStops,
            yLabel: 'Characters',
            valueLabelFn: this.drawValueLabels.bind(this)
        });
    }

    renderTimeTimeline() {
        const canvas = document.getElementById('time-timeline');
        const ctx = canvas.getContext('2d');
        this.setupHighDPICanvas(canvas, ctx);

        if (this.performanceHistory.length === 0) {
            this.renderEmptyChart(ctx, canvas, 'Run your code to see execution time trends');
            return;
        }

        const data = this.performanceHistory.map(entry => entry.execTime);
        const min = Math.min(...data);
        const max = Math.max(...data);
        const color = '#764ba2';
        const gradientStops = [
            { stop: 0, color: 'rgba(118, 75, 162, 0.8)' },
            { stop: 1, color: 'rgba(118, 75, 162, 0.2)' }
        ];

        this.renderLineChart({
            ctx,
            canvas,
            data,
            min,
            max,
            color,
            gradientStops,
            yLabel: 'Execution Time',
            valueLabelFn: this.drawTimeValueLabels.bind(this)
        });
    }

    renderLineChart({ ctx, canvas, data, min, max, color, gradientStops, yLabel, valueLabelFn }) {
        const padding = 50;
        // Use CSS dimensions, not scaled canvas dimensions
        const canvasWidth = parseFloat(canvas.style.width);
        const canvasHeight = parseFloat(canvas.style.height);
        const chartWidth = canvasWidth - 2 * padding;
        const chartHeight = canvasHeight - 2 * padding;

        // Draw grid
        this.drawGrid(ctx, canvas, padding, chartWidth, chartHeight);

        // Draw area under curve with gradient
        const gradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding);
        gradientStops.forEach(stopObj => gradient.addColorStop(stopObj.stop, stopObj.color));

        ctx.beginPath();
        ctx.moveTo(padding, canvasHeight - padding);
        data.forEach((val, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((val - min) / (max - min || 1)) * chartHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(padding + chartWidth, canvasHeight - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw main line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        data.forEach((val, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((val - min) / (max - min || 1)) * chartHeight;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw enhanced points
        data.forEach((val, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((val - min) / (max - min || 1)) * chartHeight;
            const entry = this.performanceHistory[index];
            const pointColor = entry.isCorrect ? '#10b981' : '#ef4444';

            // Outer circle (shadow)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.arc(x + 1, y + 1, 6, 0, 2 * Math.PI);
            ctx.fill();

            // Main circle
            ctx.fillStyle = pointColor;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();

            // Inner highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(x - 1, y - 1, 2, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        this.drawAxisLabels(ctx, canvas, 'Time →', yLabel, padding);

        // Draw value labels
        valueLabelFn(ctx, min, max, padding, chartHeight);
    }
    
    renderComplexityChart() {
        const canvas = document.getElementById('complexity-chart');
        const ctx = canvas.getContext('2d');
        
        // Set up high DPI rendering
        this.setupHighDPICanvas(canvas, ctx);
        
        if (!this.currentCode) {
            this.renderEmptyChart(ctx, canvas, 'Write code to see complexity analysis');
            return;
        }
        
        // Analyze code complexity
        const analysis = this.analyzeCodeComplexity(this.currentCode);
        
        // Draw enhanced bar chart
        const categories = ['Loops', 'Conditionals', 'Functions', 'Variables'];
        const values = [analysis.loops, analysis.conditionals, analysis.functions, analysis.variables];
        const maxValue = Math.max(...values, 1);
        const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444'];
        
        // Use CSS dimensions, not scaled canvas dimensions
        const canvasWidth = parseFloat(canvas.style.width);
        const canvasHeight = parseFloat(canvas.style.height);
        
        const padding = 50;
        const barSpacing = 20;
        const availableWidth = canvasWidth - 2 * padding;
        const barWidth = (availableWidth - (categories.length - 1) * barSpacing) / categories.length;
        const barMaxHeight = canvasHeight - 100;
        
        // Draw grid lines
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * barMaxHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvasWidth - padding, y);
            ctx.stroke();
        }
        
        categories.forEach((category, index) => {
            const value = values[index];
            const barHeight = (value / maxValue) * barMaxHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = canvasHeight - 50 - barHeight;
            
            // Draw bar shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(x + 2, y + 2, barWidth, barHeight);
            
            // Draw gradient bar
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, colors[index]);
            gradient.addColorStop(1, colors[index] + '80');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw bar border
            ctx.strokeStyle = colors[index];
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Draw value on top of bar
            if (value > 0) {
                ctx.fillStyle = '#1a202c';
                ctx.font = 'bold 16px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(value.toString(), x + barWidth / 2, y - 10);
            }
            
            // Draw category label
            ctx.fillStyle = '#4a5568';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            const labelY = canvasHeight - 25;
            ctx.fillText(category, x + barWidth / 2, labelY);
        });
        
        // Draw y-axis labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        for (let i = 0; i <= maxValue; i++) {
            const y = canvasHeight - 50 - (i / maxValue) * barMaxHeight;
            ctx.fillText(i.toString(), padding - 10, y + 4);
        }
    }
    
    renderOptimizationChart() {
        const canvas = document.getElementById('optimization-chart');
        const ctx = canvas.getContext('2d');
        
        // Set up high DPI rendering
        this.setupHighDPICanvas(canvas, ctx);
        
        if (!this.currentCode) {
            this.renderEmptyChart(ctx, canvas, 'Write code to see optimization suggestions');
            return;
        }
        
        // Analyze optimization opportunities
        const suggestions = this.getOptimizationSuggestions(this.currentCode);
        
        // Use CSS dimensions, not scaled canvas dimensions
        const canvasWidth = parseFloat(canvas.style.width);
        const canvasHeight = parseFloat(canvas.style.height);
        
        // Draw enhanced optimization score gauge
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2 - 20;
        const radius = Math.min(centerX, centerY) - 30;
        
        // Draw background circle
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw score arc with gradient
        const score = suggestions.score;
        const scoreAngle = (score / 100) * 2 * Math.PI;
        const gradient = ctx.createConicGradient(0, centerX, centerY);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#10b981');
        
        ctx.strokeStyle = score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + scoreAngle);
        ctx.stroke();
        
        // Draw inner shadow circle
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 25, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw score text with shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.font = 'bold 48px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(score.toString(), centerX + 2, centerY + 2);
        
        ctx.fillStyle = '#1a202c';
        ctx.font = 'bold 48px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(score.toString(), centerX, centerY);
        
        // Draw label split into two lines with smaller text
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Optimization', centerX, centerY + 25);
        ctx.fillText('Score', centerX, centerY + 40);
        
        // Draw suggestions with better formatting
        const maxSuggestions = 4;
        const displaySuggestions = suggestions.tips.slice(0, maxSuggestions);
        const startY = centerY + radius + 40;
        
        ctx.fillStyle = '#374151';
        ctx.font = '14px Inter';
        ctx.textAlign = 'left';
        
        displaySuggestions.forEach((tip, index) => {
            const y = startY + index * 22;
            
            // Draw bullet point
            ctx.fillStyle = score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444';
            ctx.beginPath();
            ctx.arc(30, y - 5, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw suggestion text with proper wrapping
            ctx.fillStyle = '#374151';
            const maxWidth = canvasWidth - 60;
            this.wrapText(ctx, tip, 45, y, maxWidth, 18);
        });
    }
    
    analyzeCodeComplexity(code) {
        const loops = (code.match(/for\s*\(|while\s*\(|\.forEach|\.map|\.filter|\.reduce/g) || []).length;
        const conditionals = (code.match(/if\s*\(|else|switch|\?|&&|\|\|/g) || []).length;
        const functions = (code.match(/function\s+\w+|=>\s*{|=>\s*\w/g) || []).length;
        const variables = (code.match(/let\s+\w+|const\s+\w+|var\s+\w+/g) || []).length;
        
        return { loops, conditionals, functions, variables };
    }
    
    getOptimizationSuggestions(code) {
        let score = 100;
        const tips = [];
        
        // Check for common optimization opportunities
        if (code.length > 200) {
            score -= 10;
            tips.push('Consider using shorter variable names');
        }
        
        if (code.includes('console.log')) {
            score -= 5;
            tips.push('Remove console.log statements');
        }
        
        if (code.includes('function ')) {
            score -= 5;
            tips.push('Use arrow functions (=>) to save characters');
        }
        
        if (code.includes('let ') || code.includes('const ')) {
            score -= 5;
            tips.push('Consider using shorter variable declarations');
        }
        
        if (code.includes('return ')) {
            score -= 3;
            tips.push('Eliminate unnecessary return statements');
        }
        
        if (code.includes('  ')) {
            score -= 5;
            tips.push('Remove extra whitespace');
        }
        
        if (tips.length === 0) {
            tips.push('Great job! Your code looks optimized.');
        }
        
        return { score: Math.max(0, score), tips };
    }
    
    clearStorage() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.removeItem('codeGolfSubmissions');
            localStorage.removeItem('performanceHistory');
            this.submissions = [];
            this.performanceHistory = [];
            this.updateSubmissionCount();
            this.renderPerformanceCharts();
            this.showNotification('🗑️ All data cleared successfully', 'info');
        }
    }
    
    addSampleData() {
        const sampleHistory = [
            { timestamp: Date.now() - 60000, chars: 150, execTime: 0.45, isCorrect: false },
            { timestamp: Date.now() - 50000, chars: 120, execTime: 0.32, isCorrect: false },
            { timestamp: Date.now() - 40000, chars: 98, execTime: 0.28, isCorrect: true },
            { timestamp: Date.now() - 30000, chars: 87, execTime: 0.25, isCorrect: true },
            { timestamp: Date.now() - 20000, chars: 74, execTime: 0.23, isCorrect: true }
        ];
        
        this.performanceHistory.push(...sampleHistory);
        localStorage.setItem('performanceHistory', JSON.stringify(this.performanceHistory));
        this.renderPerformanceCharts();
        this.showNotification('➕ Sample performance data added', 'success');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        });
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    updateExpectedOutputDisplay() {
        if (!this.currentChallenge?.exampleTestCases) {
            const outputElement = document.getElementById('expected-output');
            outputElement.innerHTML = '<p>No test cases available</p>';
            return;
        }
        
        const outputElement = document.getElementById('expected-output');
        outputElement.innerHTML = '';
        // Create a formatted display of example test cases
        let outputHTML = '';
        this.currentChallenge.exampleTestCases.forEach((testCase, index) => {
            const inputDisplay = Array.isArray(testCase.input) 
                ? `[${testCase.input.join(', ')}]` 
                : typeof testCase.input === 'string' 
                    ? `"${testCase.input}"` 
                    : testCase.input;
            
            outputHTML += `
                <div class="test-case">
                    <div class="test-case-header">Test Case ${index + 1}:</div>
                    <div class="test-case-input">Input: ${inputDisplay}</div>
                    <div class="test-case-expected">Expected: ${testCase.expected}</div>
                </div>
            `;
        });
        
        outputHTML += '';
        
        outputElement.innerHTML = outputHTML;
    }
    
    populateChallengeDropdown() {
        const select = document.getElementById('problem-select');
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add options from challenge metadata
        this.challengeMetadata.forEach(challenge => {
            const option = document.createElement('option');
            option.value = challenge.id;
            option.textContent = challenge.title;
            if (challenge.id === this.currentChallengeId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    // Helper methods for enhanced chart rendering
    setupHighDPICanvas(canvas, ctx) {
        const dpr = window.devicePixelRatio || 1;
        
        // Force a reflow and recalculation by temporarily clearing styles
        const originalWidth = canvas.style.width;
        const originalHeight = canvas.style.height;
        canvas.style.width = '';
        canvas.style.height = '';
        
        // Remove any hardcoded width/height attributes
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        
        // Get the parent container to ensure proper sizing
        const parentContainer = canvas.parentElement;
        const parentRect = parentContainer.getBoundingClientRect();
        
        // Calculate available width considering padding and margins
        const computedStyle = window.getComputedStyle(parentContainer);
        const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
        const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        
        // Calculate the available canvas size
        const availableWidth = parentRect.width - paddingLeft - paddingRight;
        const availableHeight = window.innerWidth <= 640 ? 180 : 250; // Mobile vs desktop height
        
        // Set the CSS size explicitly to ensure responsive behavior
        canvas.style.width = Math.max(availableWidth, 200) + 'px';
        canvas.style.height = availableHeight + 'px';
        canvas.style.display = 'block'; // Ensure block display
        canvas.style.maxWidth = '100%'; // Prevent overflow
        
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = Math.max(availableWidth, 200) * dpr;
        canvas.height = availableHeight * dpr;
        
        // Scale the drawing context so everything draws at the correct size
        ctx.scale(dpr, dpr);
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Enable crisp rendering
        ctx.imageSmoothingEnabled = false;
    };
    
    renderEmptyChart(ctx, canvas, message) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        const canvasWidth = parseFloat(canvas.style.width);
        const canvasHeight = parseFloat(canvas.style.height);
        ctx.fillText(message, canvasWidth / 2, canvasHeight / 2);
    }
    
    drawGrid(ctx, canvas, padding, chartWidth, chartHeight) {
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i <= 5; i++) {
            const x = padding + (i / 5) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
        
        // Draw main axes
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.stroke();
    }
    
    drawAxisLabels(ctx, canvas, xLabel, yLabel, padding) {
        // Use CSS dimensions, not scaled canvas dimensions
        const canvasWidth = parseFloat(canvas.style.width);
        const canvasHeight = parseFloat(canvas.style.height);
        
        ctx.fillStyle = '#4a5568';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(xLabel, canvasWidth / 2, canvasHeight - 10);
        
        ctx.save();
        ctx.translate(15, canvasHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
    }
    
    drawValueLabels(ctx, minValue, maxValue, padding, chartHeight) {
        const dpr = window.devicePixelRatio || 1;
        const adjustedPadding = padding / dpr;
        const adjustedChartHeight = chartHeight / dpr;
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const value = minValue + (maxValue - minValue) * (i / steps);
            const y = adjustedPadding + adjustedChartHeight - (i / steps) * adjustedChartHeight;
            ctx.fillText(Math.round(value).toString(), adjustedPadding - 10, y + 4);
        }
    }
    
    drawTimeValueLabels(ctx, minTime, maxTime, padding, chartHeight) {
        const dpr = window.devicePixelRatio || 1;
        const adjustedPadding = padding / dpr;
        const adjustedChartHeight = chartHeight / dpr;
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const time = minTime + (maxTime - minTime) * (i / steps);
            const y = adjustedPadding + adjustedChartHeight - (i / steps) * adjustedChartHeight;
            
            let formattedTime;
            if (time < 1) {
                formattedTime = (time * 1000).toFixed(0) + 'μs';
            } else if (time < 1000) {
                formattedTime = time.toFixed(1) + 'ms';
            } else {
                formattedTime = (time / 1000).toFixed(1) + 's';
            }
            
            ctx.fillText(formattedTime, adjustedPadding - 10, y + 4);
        }
    }
    
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Code Golf Visualizer
    const codeGolf = new CodeGolfVisualizer();
    
    // Add a slight delay to ensure CSS is fully applied before initial chart render
    setTimeout(() => {
        codeGolf.renderPerformanceCharts();
    }, 100);
    
    // Handle window resize to redraw charts
    let resizeTimeout;
    window.addEventListener('resize', function() {
        // Debounce resize events to avoid excessive redraws
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            codeGolf.renderPerformanceCharts();
        }, 250);
    });
    
});