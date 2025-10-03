import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useNotification } from '../context/NotificationContext';
import { 
  DocumentArrowUpIcon, 
  DocumentArrowDownIcon,
  LinkIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getNodeApiUrl } from '../config/api';
import * as XLSX from 'xlsx';

const BulkSharePage = () => {
  const { company } = useCompany();
  const { showNotification } = useNotification();
  
  // Check if user has Enterprise subscription
  const subscriptionPlan = company?.subscription_plan || 'free';
  const subscriptionStatus = company?.subscription_status || 'active';
  const isEnterprise = subscriptionPlan === 'enterprise' && ['active', 'trialing'].includes(subscriptionStatus);
  const [selectedQuDemo, setSelectedQuDemo] = useState('');
  const [qudemos, setQudemos] = useState([]);
  const [file, setFile] = useState(null);
  const [clientData, setClientData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Load user's QuDemos
  useEffect(() => {
    const fetchQudemos = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(getNodeApiUrl(`/api/qudemos?companyId=${company.id}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setQudemos(data.data.filter(qudemo => qudemo.is_active));
          }
        }
      } catch (error) {
        console.error('Error fetching QuDemos:', error);
        showNotification('Failed to load QuDemos', 'error');
      }
    };

    if (company) {
      fetchQudemos();
    }
  }, [company, showNotification]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(uploadedFile.type)) {
      showNotification('Please upload an Excel (.xlsx, .xls) or CSV file', 'error');
      return;
    }

    setFile(uploadedFile);
    setValidationErrors([]);
    setClientData([]);
    setProcessedData(null);
    setDownloadReady(false);

    // Parse the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          showNotification('File must have at least a header row and one data row', 'error');
          return;
        }

        const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim());
        const requiredHeaders = ['sl no', 'client name', 'company name', 'email'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          showNotification(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
          return;
        }

        // Validate data rows
        const errors = [];
        const processedRows = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowData = {
            slNo: row[headers.indexOf('sl no')]?.toString().trim(),
            clientName: row[headers.indexOf('client name')]?.toString().trim(),
            companyName: row[headers.indexOf('company name')]?.toString().trim(),
            email: row[headers.indexOf('email')]?.toString().trim(),
            sharedQuDemo: '', // This will be filled by backend
            rowIndex: i + 1
          };

          // Validate required fields
          if (!rowData.slNo) errors.push(`Row ${i + 1}: SL No is required`);
          if (!rowData.clientName) errors.push(`Row ${i + 1}: Client Name is required`);
          if (!rowData.companyName) errors.push(`Row ${i + 1}: Company Name is required`);
          if (!rowData.email) errors.push(`Row ${i + 1}: Email is required`);
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email)) {
            errors.push(`Row ${i + 1}: Invalid email format`);
          }

          if (errors.length === 0 || errors[errors.length - 1]?.startsWith(`Row ${i + 1}`)) {
            processedRows.push(rowData);
          }
        }

        setValidationErrors(errors);
        setClientData(processedRows);

        if (errors.length > 0) {
          showNotification(`Found ${errors.length} validation errors. Please fix them before proceeding.`, 'warning');
        } else {
          showNotification(`Successfully loaded ${processedRows.length} client records`, 'success');
        }

      } catch (error) {
        console.error('Error parsing file:', error);
        showNotification('Error parsing file. Please check the format.', 'error');
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  // Process bulk share links
  const handleBulkShare = async () => {
    if (!selectedQuDemo) {
      showNotification('Please select a QuDemo to share', 'error');
      return;
    }

    if (clientData.length === 0) {
      showNotification('Please upload a file with client data first', 'error');
      return;
    }

    if (validationErrors.length > 0) {
      showNotification('Please fix validation errors before proceeding', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(getNodeApiUrl('/api/qudemos/bulk-share'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          qudemoId: selectedQuDemo,
          clientData: clientData
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProcessedData(result.data);
        setDownloadReady(true);
        showNotification(`Successfully generated ${result.data.length} share links!`, 'success');
      } else {
        if (result.requiresUpgrade) {
          showNotification('Bulk Share requires Enterprise plan. Please upgrade to continue.', 'error');
        } else {
          showNotification(result.error || 'Failed to generate share links', 'error');
        }
      }
    } catch (error) {
      console.error('Error generating bulk share links:', error);
      showNotification('Failed to generate share links', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download template file
  const handleDownloadTemplate = () => {
    // Create new workbook
    const wb = XLSX.utils.book_new();
    
    // Create template data with headers and one example row
    const wsData = [
      ['SL No', 'Client Name', 'Company Name', 'Email', 'Shared QuDemo'],
      ['001', 'John Doe', 'Acme Corporation', 'john.doe@acme.com', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 10 }, // SL No
      { width: 25 }, // Client Name
      { width: 25 }, // Company Name
      { width: 30 }, // Email
      { width: 20 }  // Shared QuDemo (will be filled automatically)
    ];

    // Style the header row
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" }
    };

    // Apply header styling
    for (let col = 0; col < wsData[0].length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { v: wsData[0][col] };
      ws[cellAddress].s = headerStyle;
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Share Template');
    
    const filename = `bulk_share_template.xlsx`;
    XLSX.writeFile(wb, filename);
    showNotification('Template downloaded successfully!', 'success');
  };

  // Download processed file
  const handleDownload = () => {
    if (!processedData) return;

    // Create new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet format
    const wsData = [
      ['SL No', 'Client Name', 'Company Name', 'Email', 'Shared QuDemo Link', 'Share Token']
    ];

    processedData.forEach(item => {
      wsData.push([
        item.slNo,
        item.clientName,
        item.companyName,
        item.email,
        item.shareUrl,
        item.shareToken
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { width: 10 }, // SL No
      { width: 25 }, // Client Name
      { width: 25 }, // Company Name
      { width: 30 }, // Email
      { width: 50 }, // Shared QuDemo Link
      { width: 40 }  // Share Token
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Bulk Share Links');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `bulk_share_links_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    showNotification('File downloaded successfully!', 'success');
  };

  // Show upgrade message for non-Enterprise users
  if (!isEnterprise) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="mb-8">
            <UserGroupIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Bulk Share Links</h1>
            <p className="text-lg text-gray-600 mb-8">
              Generate multiple share links for your QuDemo by uploading a client list from Google Sheets or Excel.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-purple-900">Enterprise Feature</h2>
            </div>
            <p className="text-purple-800 mb-6">
              Bulk Share Links is an Enterprise-only feature that allows you to generate hundreds of personalized share links in seconds.
            </p>
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What you get with Enterprise:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <strong>Bulk Share Links</strong> - Generate 100+ share links instantly
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <strong>Client Tracking</strong> - Track which client received which link
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <strong>Advanced Analytics</strong> - Detailed insights and reporting
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <strong>Excel Integration</strong> - Upload and download client lists
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <strong>Priority Support</strong> - Dedicated customer success team
                </li>
              </ul>
            </div>
            <div className="flex justify-center space-x-4">
              <a
                href="/pricing"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                View Pricing Plans
              </a>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <UserGroupIcon className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Bulk Share Links</h1>
          <span className="ml-3 bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            ENTERPRISE
          </span>
        </div>
        <p className="text-gray-600">
          Generate multiple share links for your QuDemo by uploading a client list from Google Sheets or Excel.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-900">📋 Instructions</h3>
          <button
            onClick={handleDownloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Download Template
          </button>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li><strong>Download the template</strong> using the button above (includes proper format and example)</li>
          <li><strong>Fill in your client data</strong> following the example row format</li>
          <li><strong>Upload your completed file</strong> and select the QuDemo to share</li>
          <li><strong>Generate share links</strong> and download the updated file with all links</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* QuDemo Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select QuDemo to Share</h3>
            <select
              value={selectedQuDemo}
              onChange={(e) => setSelectedQuDemo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a QuDemo...</option>
              {qudemos.map((qudemo) => (
                <option key={qudemo.id} value={qudemo.id}>
                  {qudemo.title}
                </option>
              ))}
            </select>
            {selectedQuDemo && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                  QuDemo selected: {qudemos.find(q => q.id === selectedQuDemo)?.title}
                </p>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Client List</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: Excel (.xlsx, .xls) or CSV
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  💡 Use the "Download Template" button above for the correct format
                </p>
              </div>

              {file && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                    File uploaded: {file.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          {selectedQuDemo && clientData.length > 0 && validationErrors.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleBulkShare}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating {clientData.length} Share Links...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Generate {clientData.length} Share Links
                  </>
                )}
              </button>
            </div>
          )}

          {/* Download Button */}
          {downloadReady && processedData && (
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Download File with Share Links
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Preview & Status */}
        <div className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <XCircleIcon className="h-5 w-5 mr-2" />
                Validation Errors
              </h3>
              <div className="max-h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Data Preview */}
          {clientData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">SL No</th>
                      <th className="text-left py-2">Client Name</th>
                      <th className="text-left py-2">Company</th>
                      <th className="text-left py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.slice(0, 5).map((client, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{client.slNo}</td>
                        <td className="py-2">{client.clientName}</td>
                        <td className="py-2">{client.companyName}</td>
                        <td className="py-2">{client.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {clientData.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ... and {clientData.length - 5} more records
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing...</h3>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Generating share links for {clientData.length} clients...</p>
              </div>
            </div>
          )}

          {/* Success Status */}
          {processedData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Share Links Generated
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Links:</span>
                  <span className="font-semibold">{processedData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">QuDemo:</span>
                  <span className="font-semibold">{qudemos.find(q => q.id === selectedQuDemo)?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Ready for Download</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkSharePage;
