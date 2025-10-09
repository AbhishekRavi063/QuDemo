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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  useEffect(() => {
    fetchBulkUploads();
  }, []);
  const fetchBulkUploads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const apiUrl = getNodeApiUrl('/api/qudemos/bulk-uploads');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBulkUploads(data.data || []);
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch bulk uploads (${response.status}): ${errorText}`);
      }
    } catch (error) {
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
        // Always use .csv extension for download
        let downloadFileName = fileName || 'bulk-links.csv';
        if (downloadFileName) {
          // Remove existing extension and add .csv
          downloadFileName = downloadFileName.replace(/\.[^/.]+$/, '') + '.csv';
        }
        a.download = downloadFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
      }
    } catch (error) {
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
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUploads = bulkUploads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bulkUploads.length / itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left">Bulk Uploads</h1>
        <p className="text-gray-600 text-left">View all your customer bulk uploads and their details.</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          {bulkUploads.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Upload name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Upload date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Customers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUploads.map((upload) => (
                    <tr key={upload.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            {(() => {
                              const filename = upload.original_filename || upload.file_name || 'bulk-links.csv';
                              // Always show .csv extension
                              return filename.replace(/\.[^/.]+$/, '') + '.csv';
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          upload.operation_type === 'few_links' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {upload.operation_type === 'few_links' ? 'Few Links' : 'Bulk Upload'}
                        </span>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(upload.id, upload.original_filename || 'bulk-links.xlsx')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600 text-left">
                  Total uploads: {bulkUploads.length} batches • Total customers: {totalCustomers}
                </p>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                currentPage === pageNumber
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <span key={pageNumber} className="text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
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
