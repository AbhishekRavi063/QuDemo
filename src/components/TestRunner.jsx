import React, { useState } from 'react';
import { useBackend } from '../context/BackendContext';
import { getNodeApiUrl } from '../config/api';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const TestRunner = () => {
  const { currentBackend, pythonApiUrl, switchBackend, getAvailableBackends } = useBackend();
  const [csvFile, setCsvFile] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setError('');
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const runTests = async () => {
    if (!csvFile) {
      setError('Please upload a CSV file first');
      return;
    }

    setIsRunning(true);
    setError('');
    setTestResults(null);

    try {
      const text = await csvFile.text();
      const testCases = parseCSV(text);
      const results = [];
      let totalError = 0;
      let passedTests = 0;

      for (const testCase of testCases) {
        try {
          // Call the QA API
          const response = await fetch(getNodeApiUrl('/api/qa/test'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
              question: testCase.question,
              video_url: testCase.video_url,
              backend_url: pythonApiUrl // Pass the selected backend URL
            })
          });

          const data = await response.json();
          
          if (data.success) {
            const actualTimestamp = data.start || 0;
            const expectedTimestamp = parseFloat(testCase.expected_timestamp) || 0;
            const error = Math.abs(actualTimestamp - expectedTimestamp);
            
            totalError += error;
            
            const passed = error <= 10; // 10 second tolerance
            if (passed) passedTests++;
            
            results.push({
              question: testCase.question,
              video_url: testCase.video_url,
              expected: expectedTimestamp,
              actual: actualTimestamp,
              error: error,
              passed: passed,
              answer: data.answer || 'No answer'
            });
          } else {
            results.push({
              question: testCase.question,
              video_url: testCase.video_url,
              expected: parseFloat(testCase.expected_timestamp) || 0,
              actual: 0,
              error: 999,
              passed: false,
              answer: 'API Error',
              error_message: data.error
            });
          }
        } catch (err) {
          results.push({
            question: testCase.question,
            video_url: testCase.video_url,
            expected: parseFloat(testCase.expected_timestamp) || 0,
            actual: 0,
            error: 999,
            passed: false,
            answer: 'Request Failed',
            error_message: err.message
          });
        }
      }

      const avgError = totalError / testCases.length;
      const passRate = (passedTests / testCases.length) * 100;
      setTestResults({
        backend: currentBackend.name,
        totalTests: testCases.length,
        passedTests,
        passRate,
        avgError,
        results
      });

    } catch (err) {
      setError(`Failed to run tests: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runOnAllBackends = async () => {
    if (!csvFile) {
      setError('Please upload a CSV file first');
      return;
    }

    setIsRunning(true);
    setError('');
    setTestResults(null);

    const allBackends = getAvailableBackends();
    const allResults = [];
    for (const backend of allBackends) {
      // Switch to this backend
      switchBackend(backend.id);
      
      // Wait a moment for context to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Run tests on this backend
      const text = await csvFile.text();
      const testCases = parseCSV(text);
      const results = [];
      let totalError = 0;
      let passedTests = 0;

      for (const testCase of testCases) {
        try {
          const response = await fetch(getNodeApiUrl('/api/qa/test'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
              question: testCase.question,
              video_url: testCase.video_url,
              backend_url: backend.pythonUrl || backend.prodPythonUrl
            })
          });

          const data = await response.json();
          
          if (data.success) {
            const actualTimestamp = data.start || 0;
            const expectedTimestamp = parseFloat(testCase.expected_timestamp) || 0;
            const error = Math.abs(actualTimestamp - expectedTimestamp);
            
            totalError += error;
            if (error <= 10) passedTests++;
            
            results.push({
              question: testCase.question,
              video_url: testCase.video_url,
              expected: expectedTimestamp,
              actual: actualTimestamp,
              error: error,
              passed: error <= 10,
              answer: data.answer || 'No answer'
            });
          }
        } catch (err) {
          results.push({
            question: testCase.question,
            video_url: testCase.video_url,
            expected: parseFloat(testCase.expected_timestamp) || 0,
            actual: 0,
            error: 999,
            passed: false,
            answer: 'Request Failed',
            error_message: err.message
          });
        }
      }

      const avgError = totalError / testCases.length;
      const passRate = (passedTests / testCases.length) * 100;
      allResults.push({
        backend: backend.name,
        totalTests: testCases.length,
        passedTests,
        passRate,
        avgError,
        results
      });
    }
    setTestResults({
      backend: 'All Backends',
      totalTests: allResults[0]?.totalTests || 0,
      passedTests: allResults.reduce((sum, r) => sum + r.passedTests, 0),
      passRate: allResults.reduce((sum, r) => sum + r.passRate, 0) / allResults.length,
      avgError: allResults.reduce((sum, r) => sum + r.avgError, 0) / allResults.length,
      results: allResults
    });

    setIsRunning(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          Timestamp Test Runner
        </h1>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Test CSV File
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {csvFile && (
              <span className="text-sm text-green-600 flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                {csvFile.name}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              CSV format: video_url,question,expected_timestamp,expected_answer_snippet
            </p>
            <a
              href="/test_template.csv"
              download
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Download Template
            </a>
          </div>
        </div>

        {/* Backend Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Backend
          </label>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {currentBackend.name}
            </span>
            <span className="text-sm text-gray-500">
              {pythonApiUrl}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={runTests}
            disabled={!csvFile || isRunning}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            Test Current Backend
          </button>
          
          <button
            onClick={runOnAllBackends}
            disabled={!csvFile || isRunning}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Test All Backends
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isRunning && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <div>
                <div>Running tests...</div>
                <div className="text-sm text-blue-600 mt-1">
                  Current backend: {currentBackend.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {testResults && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Test Results Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{testResults.totalTests}</div>
                  <div className="text-sm text-gray-600">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.passedTests}</div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{testResults.passRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{testResults.avgError.toFixed(1)}s</div>
                  <div className="text-sm text-gray-600">Avg Error</div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testResults.results.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {result.question}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {result.expected}s
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {result.actual}s
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {result.error.toFixed(1)}s
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {result.passed ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              Fail
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRunner;
