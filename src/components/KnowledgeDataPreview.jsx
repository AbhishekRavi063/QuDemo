import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FilterIcon,
  SortAscendingIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { getNodeApiUrl } from '../config/api';

const KnowledgeDataPreview = ({ companyName, onDataUpdate }) => {
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingSource, setDeletingSource] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    // Fetch real knowledge sources from backend
    const fetchKnowledgeSources = async () => {
      if (!companyName) {
        setKnowledgeSources([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(getNodeApiUrl(`/api/knowledge/sources/${encodeURIComponent(companyName)}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Transform backend data to match frontend format
            const transformedSources = data.data.map(source => ({
              ...source,
              extracted_data: {
                total_items: 0, // Will be populated when preview is clicked
                enhanced_items: 0,
                by_content_type: {},
                by_difficulty: {},
                knowledge_items: []
              }
            }));
            setKnowledgeSources(transformedSources);
          } else {
            setKnowledgeSources([]);
          }
        } else {
          console.error('Failed to fetch knowledge sources:', response.status);
          setKnowledgeSources([]);
        }
      } catch (error) {
        console.error('Error fetching knowledge sources:', error);
        setKnowledgeSources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeSources();
  }, [companyName]);

  const handlePreviewKnowledgeSource = async (source) => {
    setSelectedSource(source);
    setShowPreview(true);
    setPreviewLoading(true);
    
    // Fetch the actual extracted data for this source
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(getNodeApiUrl(`/api/knowledge/source/${source.id}/content`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('📄 Received content data:', data.data);
          console.log('📄 Data structure:', JSON.stringify(data.data, null, 2));
          
          // Extract content chunks from the response (handle both new and old formats)
          const content_chunks = data.data.chunks || [];
          const qa_pairs = data.data.qa_pairs || []; // Handle old format
          const stats = data.data.stats || {};
          
          // Convert old Q&A pairs to new format if they exist
          if (qa_pairs && qa_pairs.length > 0) {
            qa_pairs.forEach(qa => {
              content_chunks.push({
                title: qa.question || 'Q&A Pair',
                content: `Question: ${qa.question}\n\nAnswer: ${qa.answer}`,
                chunk_type: 'faq_complete',
                difficulty_level: qa.difficulty || 'beginner',
                tags: qa.metadata?.tags || [],
                url: qa.metadata?.url || '',
                last_updated: qa.metadata?.timestamp ? new Date(qa.metadata.timestamp * 1000).toISOString() : new Date().toISOString(),
                metadata: {
                  enhanced: qa.metadata?.enhanced || false,
                  extraction_method: qa.metadata?.extraction_method || 'AI-assisted parsing',
                  enhancement_method: qa.metadata?.enhancement_method || 'OpenAI GPT-4',
                  source: qa.metadata?.source || 'Unknown',
                  related_links: qa.metadata?.related_links || []
                }
              });
            });
          }
          
          console.log('📄 Content chunks:', content_chunks);
          console.log('📄 Stats:', stats);
            
            // Process content chunks into knowledge items
            let knowledge_items = [];
            
            if (content_chunks && content_chunks.length > 0) {
              // Process actual content chunks
              content_chunks.forEach(chunk => {
                // Handle both new and old data formats
                let title, content, content_type, difficulty_level, tags, url, last_updated;
                
                if (chunk.title && chunk.content) {
                  // New format
                  title = chunk.title;
                  content = chunk.content;
                  content_type = chunk.chunk_type || 'general';
                  difficulty_level = chunk.difficulty_level || 'beginner';
                  tags = chunk.tags || [];
                  url = chunk.url || '';
                  last_updated = chunk.last_updated || new Date().toISOString();
                } else if (chunk.text && chunk.metadata) {
                  // Old format
                  title = chunk.metadata.title || chunk.metadata.source_info || 'Content Chunk';
                  content = chunk.text;
                  content_type = chunk.metadata.content_type || 'general';
                  difficulty_level = chunk.metadata.difficulty_level || 'beginner';
                  tags = chunk.metadata.tags || [];
                  url = chunk.metadata.url || '';
                  last_updated = chunk.metadata.last_updated || new Date().toISOString();
                } else {
                  // Fallback
                  title = 'Content Chunk';
                  content = chunk.text || chunk.content || '';
                  content_type = 'general';
                  difficulty_level = 'beginner';
                  tags = [];
                  url = '';
                  last_updated = new Date().toISOString();
                }
                
                knowledge_items.push({
                  title: title,
                  content: content,
                  content_type: content_type,
                  difficulty_level: difficulty_level,
                  tags: tags,
                  url: url,
                  last_updated: last_updated,
                  metadata: {
                    enhanced: chunk.metadata?.enhanced || false,
                    extraction_method: chunk.metadata?.extraction_method || 'Raw content extraction',
                    enhancement_method: chunk.metadata?.enhancement_method || 'Semantic search',
                    source: chunk.metadata?.source || 'Unknown',
                    chunk_type: chunk.chunk_type || content_type,
                    source_section: chunk.source_section || '',
                    extraction_confidence: chunk.extraction_confidence || 1.0
                  },
                  related_links: chunk.related_links || chunk.metadata?.related_links || []
                });
              });
            } else {
              // Fallback: Create preview content from metadata
              console.log('📄 No content chunks found, creating fallback preview from metadata');
              
                             const metadata = data.data.metadata; // Get metadata from data.data
              if (metadata) {
                // Create a meaningful preview from the metadata
                const fallbackContent = `**Source Information:**
• **Title:** ${metadata.title || 'Website Content'}
• **URL:** ${metadata.source_url || 'N/A'}
• **Type:** ${metadata.source_type || 'website'}
• **Status:** ${metadata.status || 'processed'}
• **Processed:** ${metadata.processed_at ? new Date(metadata.processed_at).toLocaleString() : 'N/A'}

**Description:**
${metadata.description || 'Website content has been processed and is available for knowledge retrieval.'}

**Note:** This is a preview of the processed content. The actual scraped data is stored in the vector database and can be retrieved through the Q&A system.`;

                knowledge_items.push({
                  title: metadata.title || 'Website Content Preview',
                  content: fallbackContent,
                  content_type: 'preview',
                  difficulty_level: 'beginner',
                  tags: ['preview', 'metadata'],
                  url: metadata.source_url || '',
                  last_updated: metadata.processed_at || new Date().toISOString(),
                  metadata: {
                    enhanced: false,
                    extraction_method: 'Metadata fallback',
                    enhancement_method: 'Preview generation',
                    source: metadata.source_type || 'website',
                    chunk_type: 'preview',
                    source_section: 'metadata',
                    extraction_confidence: 0.8
                  },
                  related_links: []
                });
              }
            }
          
          console.log('📄 Processed knowledge items:', knowledge_items.length);
          console.log('📄 Sample knowledge item:', knowledge_items[0]);
          
                      // Update the source with real extracted data
            const updatedSource = {
              ...source,
              extracted_data: {
                total_items: knowledge_items.length,
                enhanced_items: knowledge_items.filter(item => item.metadata.enhanced).length,
                by_content_type: {
                  faq_complete: knowledge_items.filter(item => item.content_type === 'faq_complete').length,
                  paragraph: knowledge_items.filter(item => item.content_type === 'paragraph').length,
                  section: knowledge_items.filter(item => item.content_type === 'section').length,
                  list: knowledge_items.filter(item => item.content_type === 'list').length,
                  code_block: knowledge_items.filter(item => item.content_type === 'code_block').length,
                  table: knowledge_items.filter(item => item.content_type === 'table').length
                },
                by_difficulty: {
                  beginner: knowledge_items.filter(item => item.difficulty_level === 'beginner').length,
                  intermediate: knowledge_items.filter(item => item.difficulty_level === 'intermediate').length,
                  advanced: knowledge_items.filter(item => item.difficulty_level === 'advanced').length
                },
                knowledge_items: knowledge_items
              }
            };
          
          console.log('📄 Updated source with extracted data:', updatedSource.extracted_data);
          setSelectedSource(updatedSource);
        }
      } else {
        console.error('Failed to fetch source content:', response.status);
      }
    } catch (error) {
      console.error('Error fetching source content:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (window.confirm('Are you sure you want to delete this knowledge source? This action cannot be undone. This will permanently remove the data from the database and vector store.')) {
      setDeletingSource(sourceId);
      
      try {
        // Find the source to get its details for deletion
        const sourceToDelete = knowledgeSources.find(source => source.id === sourceId);
        if (!sourceToDelete) {
          throw new Error('Source not found');
        }

        // Call backend API to delete from database and Pinecone
        const token = localStorage.getItem('accessToken');
        const response = await fetch(getNodeApiUrl(`/api/knowledge/source/${sourceId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            company_name: companyName,
            source_type: sourceToDelete.source_type,
            source_url: sourceToDelete.source_url,
            title: sourceToDelete.title
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // If backend deletion successful, update frontend state
        setKnowledgeSources(prev => prev.filter(source => source.id !== sourceId));
        
        // Close preview if the deleted source was being viewed
        if (selectedSource && selectedSource.id === sourceId) {
          setSelectedSource(null);
          setShowPreview(false);
        }
        
        // Notify parent component about the data update
        if (onDataUpdate) {
          onDataUpdate(knowledgeSources.filter(source => source.id !== sourceId));
        }

        console.log('✅ Knowledge source deleted successfully from database and vector store');
        
      } catch (error) {
        console.error('Error deleting knowledge source:', error);
        
        // Show user-friendly error message
        alert(`Failed to delete knowledge source: ${error.message}. Please try again or contact support if the problem persists.`);
      } finally {
        setDeletingSource(null);
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedSource(null);
  };

  // Show no company state
  if (!companyName) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="mb-4">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Selected</h3>
          <p className="text-gray-600 mb-4">
            Please select or create a company to view knowledge data.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showPreview && selectedSource) {
    return (
      <div className="space-y-6">
                 {/* Preview Header */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <button
                 onClick={closePreview}
                 className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                 title="Back to Knowledge Sources"
               >
                 <ArrowLeftIcon className="w-5 h-5" />
               </button>
               <div>
                 <h2 className="text-xl font-bold text-gray-900">Knowledge Preview</h2>
                 <p className="text-gray-600">{selectedSource.title}</p>
               </div>
             </div>
             <button
               onClick={closePreview}
               className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
               title="Close Preview"
             >
               <XMarkIcon className="w-5 h-5" />
             </button>
           </div>
         </div>

        {/* Knowledge Data Display */}
        <div className="space-y-6">
          {previewLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading extracted content...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Extracted Data Summary</h3>
                    <p className="text-gray-600">Data extracted from {selectedSource.source_url}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{selectedSource.extracted_data.total_items}</div>
                    <div className="text-sm text-gray-500">Total Items</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{selectedSource.extracted_data.enhanced_items}</div>
                    <div className="text-xs text-gray-500">Enhanced</div>
                  </div>
                                 <div className="text-center">
                 <div className="text-lg font-semibold text-blue-600">{selectedSource.extracted_data.by_content_type.faq_complete || 0}</div>
                 <div className="text-xs text-gray-500">Complete FAQs</div>
               </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">{selectedSource.extracted_data.by_difficulty.beginner || 0}</div>
                    <div className="text-xs text-gray-500">Beginner</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{selectedSource.extracted_data.by_difficulty.intermediate || 0}</div>
                    <div className="text-xs text-gray-500">Intermediate</div>
                  </div>
                </div>
              </div>

              {/* Knowledge Items */}
              <div className="space-y-4">
                {console.log('🔍 Rendering knowledge items:', selectedSource.extracted_data.knowledge_items?.length || 0)}
                {selectedSource.extracted_data.knowledge_items && selectedSource.extracted_data.knowledge_items.length > 0 ? (
                  selectedSource.extracted_data.knowledge_items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                                                  <div className="text-blue-600 mt-1">
                          {item.content_type === 'faq_complete' ? (
                            <QuestionMarkCircleIcon className="w-5 h-5" />
                          ) : item.content_type === 'code_block' ? (
                            <DocumentTextIcon className="w-5 h-5" />
                          ) : item.content_type === 'table' ? (
                            <DocumentTextIcon className="w-5 h-5" />
                          ) : item.content_type === 'list' ? (
                            <DocumentTextIcon className="w-5 h-5" />
                          ) : item.content_type === 'section' ? (
                            <DocumentTextIcon className="w-5 h-5" />
                          ) : (
                            <DocumentTextIcon className="w-5 h-5" />
                          )}
                        </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{item.title}</h4>
                              {item.metadata.enhanced && (
                                <CheckCircleIcon className="w-5 h-5 text-green-600" title="AI Enhanced" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                                item.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.difficulty_level}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {item.content_type.replace('_', ' ')}
                              </span>
                            </div>

                            {item.tags && item.tags.length > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <TagIcon className="w-4 h-4 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-700 leading-relaxed">
                              {item.content}
                            </div>

                            {item.url && (
                              <div className="mt-2">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View Source →
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                                 ) : (
                   <div className="text-center text-gray-500 py-8">
                     <div className="text-4xl mb-4">📄</div>
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
                     <p className="text-gray-600">
                       No knowledge items were extracted from this source. This might be due to:
                     </p>
                     <ul className="text-sm text-gray-500 mt-2 space-y-1">
                       <li>• The source content was empty or not accessible</li>
                       <li>• The extraction process encountered an error</li>
                       <li>• The content format was not supported</li>
                       <li>• The data was processed with an older format</li>
                     </ul>
                     <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                       <p className="text-xs text-gray-600">
                         <strong>Debug Info:</strong> Check browser console for detailed data structure and content chunks.
                       </p>
                     </div>
                   </div>
                 )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Knowledge Sources</h2>
            <p className="text-gray-600">Extracted and processed knowledge data for {companyName || 'your company'}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Removed manual refresh button to prevent auto-refresh issues */}
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{knowledgeSources.length}</div>
              <div className="text-sm text-gray-500">Total Sources</div>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knowledgeSources.map((source) => (
          <div
            key={source.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  source.status === 'processed' ? 'bg-green-500' : 
                  source.status === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                  source.status === 'processed' ? 'bg-green-100 text-green-800' : 
                  source.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {source.status}
                </span>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1">{source.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{source.description}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="capitalize">{source.source_type}</span>
                <span>Created: {new Date(source.created_at).toLocaleDateString()}</span>
              </div>
              
              {source.source_url && (
                <div className="mb-3">
                  <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    {source.source_url}
                  </a>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: {new Date(source.created_at).toLocaleString()}</div>
                  <div>Processed: {source.processed_at ? new Date(source.processed_at).toLocaleString() : 'Pending'}</div>
                  <div>Updated: {new Date(source.updated_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    onClick={() => handlePreviewKnowledgeSource(source)}
                  >
                    <EyeIcon className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    className={`text-red-600 hover:text-red-800 text-sm flex items-center gap-1 ${
                      deletingSource === source.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handleDeleteSource(source.id)}
                    disabled={deletingSource === source.id}
                  >
                    {deletingSource === source.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {knowledgeSources.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="mb-4">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Knowledge Sources Yet</h3>
            <p className="text-gray-600 mb-4">
              Add website content, PDFs, and documents to enhance your AI assistant's knowledge base. 
              <br />
              <span className="text-sm text-gray-500">(Videos are shown in the Videos tab)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeDataPreview;
