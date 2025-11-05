import React, { useState, useEffect } from "react";
import { useCompany } from "../context/CompanyContext";
import { getNodeApiUrl } from "../config/api";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

const WidgetTokenHelper = () => {
  const { selectedCompany } = useCompany();
  const [qudemos, setQudemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    if (selectedCompany) {
      fetchQudemos();
    }
  }, [selectedCompany]);

  const fetchQudemos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        getNodeApiUrl(
          `/api/qudemos?company_name=${encodeURIComponent(selectedCompany.name)}`,
        ),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQudemos(data.qudemos || []);
        }
      }
    } catch (error) {
      console.error("Error fetching QuDemos:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (token, qudemoTitle) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const copyEnvFormat = async (token) => {
    const envText = `REACT_APP_DEMO_WIDGET_TOKEN=${token}`;
    try {
      await navigator.clipboard.writeText(envText);
      setCopiedToken(`env_${token}`);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Widget Token Helper
        </h1>
        <p className="text-gray-600">
          Copy a QuDemo share token to use in your floating widget
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          📋 How to Use:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Choose a QuDemo from the list below</li>
          <li>
            Click <strong>"Copy Token"</strong> or{" "}
            <strong>"Copy .env Format"</strong>
          </li>
          <li>
            Paste in{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">frontend/.env</code>{" "}
            file
          </li>
          <li>
            Restart your dev server:{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">npm start</code>
          </li>
          <li>Widget will appear on all pages except home!</li>
        </ol>
      </div>

      {/* QuDemos List */}
      {qudemos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No QuDemos Found
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first QuDemo to get started with the floating widget
          </p>
          <a
            href="/create"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create QuDemo
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {qudemos.map((qudemo) => (
            <div
              key={qudemo.id}
              className="bg-white rounded-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {qudemo.title || "Untitled QuDemo"}
                    </h3>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          qudemo.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {qudemo.status || "active"}
                      </span>

                      {qudemo.videos && (
                        <span className="text-sm text-gray-600">
                          📹 {qudemo.videos.length} video
                          {qudemo.videos.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Share Token */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Share Token
                        </span>
                      </div>
                      <code className="block text-sm font-mono text-gray-800 break-all">
                        {qudemo.share_token}
                      </code>
                    </div>

                    {/* Share URL Preview */}
                    <div className="text-xs text-gray-500 mb-4">
                      <strong>Share URL:</strong> /share/{qudemo.share_token}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {/* Copy Token Button */}
                      <button
                        onClick={() =>
                          copyToClipboard(qudemo.share_token, qudemo.title)
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {copiedToken === qudemo.share_token ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            Copy Token
                          </>
                        )}
                      </button>

                      {/* Copy .env Format Button */}
                      <button
                        onClick={() => copyEnvFormat(qudemo.share_token)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        {copiedToken === `env_${qudemo.share_token}` ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            Copy .env Format
                          </>
                        )}
                      </button>

                      {/* View QuDemo Button */}
                      <a
                        href={`/qudemos/${qudemo.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        View QuDemo
                      </a>

                      {/* Test Share Link */}
                      <a
                        href={`/share/${qudemo.share_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Test Share Link
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Instructions */}
      {qudemos.length > 0 && (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <h4 className="text-lg font-semibold text-yellow-900 mb-3">
            💡 Next Steps:
          </h4>
          <div className="text-yellow-800 space-y-2">
            <p>
              <strong>1.</strong> Click "Copy .env Format" for your chosen
              QuDemo
            </p>
            <p>
              <strong>2.</strong> Create/edit{" "}
              <code className="bg-yellow-100 px-2 py-1 rounded">
                frontend/.env
              </code>{" "}
              file
            </p>
            <p>
              <strong>3.</strong> Paste the line you copied
            </p>
            <p>
              <strong>4.</strong> Restart your dev server:{" "}
              <code className="bg-yellow-100 px-2 py-1 rounded">npm start</code>
            </p>
            <p>
              <strong>5.</strong> Go to any page (except home) and see the
              widget! 🎉
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetTokenHelper;
