import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';

const CompanyManagement = () => {
  const { refreshCompany } = useCompany();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    bucketName: '',
    website: '',
    logo: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bucketCheckResult, setBucketCheckResult] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      } else {
        setError(data.error || 'Failed to fetch companies');
      }
    } catch (error) {
      console.error('Fetch companies error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Company name can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (!formData.bucketName.trim()) {
      newErrors.bucketName = 'Bucket name is required';
    } else if (formData.bucketName.length < 3) {
      newErrors.bucketName = 'Bucket name must be at least 3 characters';
    } else if (!/^[a-z0-9-]+$/.test(formData.bucketName)) {
      newErrors.bucketName = 'Bucket name can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must be a valid URL';
    }

    if (formData.logo && !/^https?:\/\/.+/.test(formData.logo)) {
      newErrors.logo = 'Logo must be a valid URL';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear bucket check result when bucket name changes
    if (name === 'bucketName' && bucketCheckResult) {
      setBucketCheckResult(null);
    }
  };

  const checkBucketAvailability = async (bucketName) => {
    if (!bucketName || bucketName.length < 3) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/bucket/${bucketName}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setBucketCheckResult({
          available: data.data.available,
          message: data.data.message
        });
      }
    } catch (error) {
      console.error('Bucket check error:', error);
    }
  };

  const handleBucketNameBlur = () => {
    if (formData.bucketName) {
      checkBucketAvailability(formData.bucketName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form and close modal
        setFormData({
          name: '',
          displayName: '',
          description: '',
          bucketName: '',
          website: '',
          logo: ''
        });
        setShowCreateForm(false);
        setBucketCheckResult(null);
        
        // Refresh companies list
        fetchCompanies();
        // Refresh company context
        refreshCompany();
      } else {
        setError(data.error || 'Failed to create company');
      }
    } catch (error) {
      console.error('Create company error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchCompanies();
      } else {
        setError(data.error || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Delete company error:', error);
      setError('Network error. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create Company
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{company.display_name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                company.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {company.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Name:</strong> {company.name}</p>
              <p><strong>Bucket:</strong> {company.bucket_name}</p>
              {company.description && (
                <p><strong>Description:</strong> {company.description}</p>
              )}
              {company.website && (
                <p><strong>Website:</strong> 
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 ml-1">
                    {company.website}
                  </a>
                </p>
              )}
              <p><strong>Created:</strong> {new Date(company.created_at).toLocaleDateString()}</p>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => window.open(`/api/video/${company.name}/process`, '_blank')}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Video API
              </button>
              <button
                onClick={() => handleDeleteCompany(company.id)}
                className="text-red-600 hover:text-red-500 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new company.</p>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Company</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="my-company"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formErrors.displayName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="My Company"
                  />
                  {formErrors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.displayName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Company description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bucket Name</label>
                  <input
                    type="text"
                    name="bucketName"
                    value={formData.bucketName}
                    onChange={handleInputChange}
                    onBlur={handleBucketNameBlur}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formErrors.bucketName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="my-company-bucket"
                  />
                  {formErrors.bucketName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.bucketName}</p>
                  )}
                  {bucketCheckResult && (
                    <p className={`mt-1 text-sm ${bucketCheckResult.available ? 'text-green-600' : 'text-yellow-600'}`}>
                      {bucketCheckResult.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formErrors.website ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="https://example.com"
                  />
                  {formErrors.website && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.website}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo URL (optional)</label>
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formErrors.logo ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="https://example.com/logo.png"
                  />
                  {formErrors.logo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.logo}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Company'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement; 