/**
 * Standalone test for demo video triggering system
 * Run this in browser console to test without backend
 */

import { checkForDemoTrigger } from './utils/videoTriggerMatcher';
import videoTriggersConfig from './config/video-triggers.json';

// Mock logger
const mockLog = (category, message, data) => {
  console.log(`[${category}] ${message}`, data || '');
};

console.log('=== Testing Demo Video Trigger System ===\n');

// Test 1: Company-specific demo (Nvidia)
console.log('Test 1: Company-specific (Nvidia)');
const test1 = checkForDemoTrigger(
  "Show me a rendering demo for Nvidia",
  videoTriggersConfig,
  mockLog
);
console.log('Result:', test1, '\n');

// Test 2: Company-specific demo (Microsoft)
console.log('Test 2: Company-specific (Microsoft)');
const test2 = checkForDemoTrigger(
  "Can you render a demo for Microsoft?",
  videoTriggersConfig,
  mockLog
);
console.log('Result:', test2, '\n');

// Test 3: Generic demo (no company)
console.log('Test 3: Generic demo');
const test3 = checkForDemoTrigger(
  "Show me a rendering demo",
  videoTriggersConfig,
  mockLog
);
console.log('Result:', test3, '\n');

// Test 4: No match
console.log('Test 4: No match (missing keywords)');
const test4 = checkForDemoTrigger(
  "Hello, how are you?",
  videoTriggersConfig,
  mockLog
);
console.log('Result:', test4, '\n');

// Test 5: With punctuation
console.log('Test 5: With punctuation');
const test5 = checkForDemoTrigger(
  "Can you show me a rendering demo for Apple, please?",
  videoTriggersConfig,
  mockLog
);
console.log('Result:', test5, '\n');

console.log('=== All Tests Complete ===');
