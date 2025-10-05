import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { getNodeApiUrl } from '../config/api';
import { 
  DocumentArrowDownIcon, 
  DocumentIcon, 
  CalendarIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

const BulkUploadsPage = () => {
  const { company } = useCompany();
  const [bulkUploads, setBulkUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBulkUploads();
  }, []);

  const fetchBulkUploads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      console.log('📊 ===== FRONTEND BULK UPLOADS REQUEST =====');
      console.log('📊 Token exists:', !!token);
      console.log('📊 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const apiUrl = getNodeApiUrl('/api/qudemos/bulk-uploads');
      console.log('📊 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Response data:', data);
        setBulkUploads(data.data || []);
      } else {
        const errorText = await response.text();
        console.error('📊 Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        setError(`Failed to fetch bulk uploads (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('📊 Network error fetching bulk uploads:', error);
      setError(`Network error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (uploadId, fileName) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/qudemos/bulk-uploads/${uploadId}/download`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'bulk-links.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalCustomers = bulkUploads.reduce((sum, upload) => sum + (upload.customer_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchBulkUploads}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Uploads</h1>
        <p className="text-gray-600">View all your customer bulk uploads and their details.</p>
        
        {/* Debug buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await fetch(getNodeApiUrl('/api/qudemos/bulk-uploads-test'));
                const data = await response.json();
                console.log('📊 Test route response:', data);
                alert('Test route response: ' + JSON.stringify(data));
              } catch (error) {
                console.error('📊 Test route error:', error);
                alert('Test route error: ' + error.message);
              }
            }}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Test Route
          </button>
          <button
            onClick={() => {
              console.log('📊 Current company:', company);
              console.log('📊 Current user token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
            }}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Debug Info
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload History</h2>
          <p className="text-gray-600">Track all CSV uploads and manage customer batches.</p>
        </div>

        <div className="overflow-x-auto">
          {bulkUploads.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bulkUploads.map((upload) => (
                    <tr key={upload.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            {upload.original_filename || upload.file_name || 'bulk-links.csv'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900">
                            {formatDate(upload.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900">
                            {upload.customer_count || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDownload(upload.id, upload.original_filename || 'bulk-links.xlsx')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Total uploads: {bulkUploads.length} batches • Total customers: {totalCustomers}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bulk uploads</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't created any bulk uploads yet. Start by creating a QuDemo and using the bulk share feature.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadsPage;
