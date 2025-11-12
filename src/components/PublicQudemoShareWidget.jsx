import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FloatingQudemoWidget from "./FloatingQudemoWidget";
import { getNodeApiUrl } from "../config/api";

const PublicQudemoShareWidget = () => {
  const { qudemoId } = useParams();
  const [qudemoData, setQudemoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQudemoData = async () => {
      try {
        // Use public endpoint - no authentication required
        const response = await fetch(
          getNodeApiUrl(`/api/qudemos/public/${qudemoId}`)
        );
        const data = await response.json();

        console.log("📊 Public Share Widget - Fetched QuDemo data:", data);

        if (data.success) {
          setQudemoData(data.qudemo);
        } else {
          console.error("❌ Failed to fetch QuDemo data:", data);
        }
      } catch (error) {
        console.error("❌ Error fetching qudemo data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (qudemoId) {
      console.log("🔗 Public Share Widget initialized for QuDemo:", qudemoId);
      fetchQudemoData();
    }
  }, [qudemoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!qudemoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">QuDemo Not Found</h2>
          <p className="text-gray-600">This QuDemo may have been removed or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:bg-gradient-to-br md:from-blue-50 md:to-blue-100">
      {/* Locked Maximized Widget - Full Screen on all devices */}
      <FloatingQudemoWidget
        qudemoId={qudemoId}
        companyName={qudemoData.company_name}
        isPreview={false}
        lockedExpanded={true} // Lock widget in fully maximized state (video left, chat right on desktop; full screen on mobile)
      />
    </div>
  );
};

export default PublicQudemoShareWidget;

