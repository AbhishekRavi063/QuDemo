import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowUpIcon,
  CreditCardIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { getApiUrl } from "../config/api";
import { useNotification } from "../context/NotificationContext";
const SubscriptionTab = ({ companyId }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  useEffect(() => {
    fetchSubscription();
  }, [companyId]);
  const fetchSubscription = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const baseUrl = getApiUrl("node");
      const response = await fetch(`${baseUrl}/api/subscription/${companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      } else {
        // Set default free subscription if API fails
        setSubscription({
          plan: "free",
          status: "active",
          usage: {
            totalQudemos: 0,
            sharedQudemos: 0,
          },
        });
      }
    } catch (error) {
      // Set default free subscription on error
      setSubscription({
        plan: "free",
        status: "active",
        usage: {
          totalQudemos: 0,
          sharedQudemos: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUpgrade = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const baseUrl = getApiUrl("node");
      const checkoutUrl = `${baseUrl}/api/subscription/checkout`;
      const response = await fetch(checkoutUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: "pro",
          billingCycle: "monthly", // Default to monthly, user can change on pricing page if needed
        }),
      });
      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        alert(`Failed to start checkout: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Failed to start checkout: ${error.message}`);
    }
  };
  const handleManageBilling = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const baseUrl = getApiUrl("node");
      const response = await fetch(
        `${baseUrl}/api/subscription/${companyId}/billing-portal`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success && data.portalUrl) {
        window.open(data.portalUrl, "_blank");
      } else {
        showError(data.error || "Failed to get billing portal");
      }
    } catch (error) {
      showError("Failed to open billing portal");
    }
  };
  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const baseUrl = getApiUrl("node");
      const response = await fetch(
        `${baseUrl}/api/subscription/${companyId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        showSuccess("Subscription cancelled successfully");
        fetchSubscription();
        // Refresh the page after a short delay to show the updated subscription status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showError("Failed to cancel subscription");
      }
    } catch (error) {
      showError("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };
  const getPlanBadge = (plan) => {
    const badges = {
      free: { color: "bg-gray-100 text-gray-800", text: "Free" },
      pro: { color: "bg-blue-100 text-blue-800", text: "Pro" },
      enterprise: {
        color: "bg-purple-100 text-purple-800",
        text: "Enterprise",
      },
    };
    return badges[plan] || badges.free;
  };
  const getStatusBadge = (status) => {
    const badges = {
      active: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
        text: "Active",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
        text: "Cancelled",
      },
      expired: {
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
        text: "Expired",
      },
      past_due: {
        color: "bg-yellow-100 text-yellow-800",
        icon: XCircleIcon,
        text: "Past Due",
      },
      trialing: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircleIcon,
        text: "Trial",
      },
      on_trial: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircleIcon,
        text: "Trial",
      },
    };
    return badges[status] || badges.active;
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const getPlanFeatures = (plan) => {
    const features = {
      free: ["Limited Qudemos", "Qudemo Preview only"],
      pro: [
        "Unlimited Qudemo",
        "Share Qudemo anywhere",
        "Create unique links for each prospect",
        "Track Engagements",
        "Advanced analytics and insights",
        "Priority Support",
      ],
      enterprise: [
        "Everything in Pro",
        "Unlimited share links",
        "White-label options",
        "Custom domain",
        "API access",
        "Dedicated support",
      ],
    };
    return features[plan] || features.free;
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!subscription) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-600">
          <p>Unable to load subscription information.</p>
        </div>
      </div>
    );
  }
  const planBadge = getPlanBadge(subscription.plan);
  const statusBadge = getStatusBadge(subscription.status);
  const StatusIcon = statusBadge.icon;
  const isFree = subscription.plan === "free";
  const isPaid = ["pro", "enterprise"].includes(subscription.plan);
  const isActive = ["active", "trialing", "on_trial"].includes(
    subscription.status,
  );
  // Check if currently in trial period
  const isInTrial = () => {
    if (!subscription.startDate || !isPaid) return false;
    const startDate = new Date(subscription.startDate);
    const trialEndDate = new Date(
      startDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    ); // Add 7 days
    const now = new Date();
    return now < trialEndDate;
  };
  const getTrialStatus = () => {
    if (!isPaid || !subscription.startDate) return null;
    const startDate = new Date(subscription.startDate);
    const trialEndDate = new Date(
      startDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );
    const now = new Date();
    if (now < trialEndDate) {
      return {
        isTrial: true,
        endDate: trialEndDate,
      };
    } else {
      return {
        isTrial: false,
        endDate: trialEndDate,
      };
    }
  };
  const trialStatus = getTrialStatus();
  return (
    <div className="space-y-6">
      {isFree ? (
        // Free Plan UI
        <>
          {/* Top Section - Plan Details and Usage Statistics */}
          <div className="flex justify-between items-start gap-6">
            {/* Plan Details */}
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Free Plan
              </h3>
              <p className="text-gray-600 mb-4">
                You're currently on the free plan
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong className="text-blue-900">Upgrade to Pro</strong> to
                  unlock advanced features like share links, analytics, and
                  unlimited Qudemos.
                </p>
              </div>
            </div>
            {/* Usage Statistics Card */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 w-64 flex-shrink-0">
              <h4 className="font-semibold text-gray-900 mb-3 text-left">
                Usage Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-left">Total Qudemos</span>
                  <span className="text-xl font-bold text-gray-900">
                    {subscription.usage?.totalQudemos || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-left">
                    Shared Qudemos
                  </span>
                  <span className="text-xl font-bold text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>
          {/* Plan Features */}
          <div>
            <hr className="border-gray-200 my-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-left">
              Plan Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Limited Qudemos</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Qudemo Preview only</span>
              </div>
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-500">No Public Sharing</span>
              </div>
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-500">No Unique Link Generation</span>
              </div>
              <div className="flex items-start">
                <XCircleIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-500 text-left">
                  No viewer tracking & engagement
                </span>
              </div>
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-500">No Advanced Analytics</span>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div>
            <hr className="border-gray-200 my-6" />
            <div className="flex gap-3">
              <button
                onClick={handleUpgrade}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Compare Plans
              </button>
            </div>
          </div>
        </>
      ) : (
        // Paid Plan UI (existing code)
        <>
          {/* Top Section - Plan Details and Usage Statistics */}
          <div className="flex justify-between items-start gap-6">
            {/* Plan Details */}
            <div className="text-left flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-900 text-left">
                  {subscription.plan === "pro"
                    ? "Pro Plan"
                    : subscription.plan === "enterprise"
                      ? "Enterprise Plan"
                      : "Free Plan"}
                </h3>
                {trialStatus && trialStatus.isTrial ? (
                  <span className="flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Trial
                  </span>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.color}`}
                  >
                    {statusBadge.text}
                  </span>
                )}
              </div>
              {isPaid && (
                <div className="space-y-2 text-sm text-gray-600 text-left">
                  {trialStatus && trialStatus.isTrial && (
                    <div className="text-left">
                      Trial period ends{" "}
                      {formatDate(trialStatus.endDate.toISOString())}
                    </div>
                  )}
                  {trialStatus && !trialStatus.isTrial && (
                    <div className="text-left">
                      Trial ended{" "}
                      {formatDate(trialStatus.endDate.toISOString())}
                    </div>
                  )}
                  <div className="text-left">
                    Started:{" "}
                    <strong>{formatDate(subscription.startDate)}</strong>
                  </div>
                  {subscription.nextBillingDate && isActive && (
                    <div className="text-left">
                      Next billing:{" "}
                      <strong>
                        {formatDate(subscription.nextBillingDate)}
                      </strong>
                    </div>
                  )}
                  {subscription.billingCycle && (
                    <div className="text-left">
                      Billing:{" "}
                      <strong>
                        {subscription.billingCycle.charAt(0).toUpperCase() +
                          subscription.billingCycle.slice(1)}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Usage Statistics Card */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 w-64 flex-shrink-0">
              <h4 className="font-semibold text-gray-900 mb-3 text-left">
                Usage Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-left">Total Qudemos</span>
                  <span className="text-xl font-bold text-gray-900">
                    {subscription.usage?.totalQudemos || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-left">
                    Shared Qudemos
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {subscription.usage?.sharedQudemos || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Plan Features */}
          <div>
            <hr className="border-gray-200 my-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-left">
              Plan Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {getPlanFeatures(subscription.plan).map((feature, idx) => (
                <div key={idx} className="flex items-start text-left">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-left">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Action Buttons */}
          <div>
            <hr className="border-gray-200 my-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {isFree && (
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
                >
                  Change Plan
                </button>
              )}
              {isPaid && isActive && (
                <>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
                  >
                    Change Plan
                  </button>
                  <button
                    onClick={handleManageBilling}
                    className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Manage Billing
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 w-full"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                </>
              )}
              {isPaid && !isActive && (
                <div className="md:col-span-3 flex justify-center">
                  <button
                    onClick={handleUpgrade}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors max-w-xs"
                  >
                    Reactivate Subscription
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Subscription Warning */}
          {!isActive && isPaid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <XCircleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-red-900 font-semibold mb-1 text-left">
                    Subscription {statusBadge.text}
                  </h4>
                  <p className="text-red-700 text-sm text-left">
                    Your subscription is no longer active. All shared Qudemo
                    links have been disabled. Reactivate your subscription to
                    restore access.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Custom Cancel Confirmation Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center mb-4">
                  <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cancel Subscription
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 text-left">
                  Are you sure you want to cancel your subscription? All your
                  shared Qudemos will stop working and you'll lose access to
                  premium features.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      handleCancelSubscription();
                    }}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default SubscriptionTab;
