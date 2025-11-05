import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getApiUrl } from "../config/api";
import { useCompany } from "../context/CompanyContext";
const PricingPage = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success"); // 'success' or 'error'
  // Get current subscription info (with fallback for non-authenticated users)
  const currentPlan = company?.subscription_plan || "free";
  const currentStatus = company?.subscription_status || "active";
  const currentBillingCycle = company?.billing_cycle || "monthly";
  const isActive = ["active", "trialing", "on_trial"].includes(currentStatus);
  const isCancelled = ["cancelled", "expired", "past_due"].includes(
    currentStatus,
  );
  // Check if user is authenticated (has company data)
  const isAuthenticated = !!company;
  const plans = {
    free: {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: ["Limited Qudemos", "Qudemo Preview only"],
      limitations: [
        "No Public Sharing",
        "No Unique Link Generation",
        "No viewer tracking & engagement",
        "No Advanced Analytics",
      ],
      cta: currentPlan === "free" ? "Current Plan" : "Downgrade to Free",
      highlight: false,
      isCurrent: currentPlan === "free" && isAuthenticated,
    },
    pro: {
      name: "Pro",
      price: { monthly: 29.9, yearly: 299 },
      description: "For professionals and growing teams",
      features: [
        "Unlimited Qudemo",
        "Share Qudemo anywhere",
        "Create unique links for each prospect",
        "Track Engagements",
        "Advanced analytics and insights",
        "Priority Support",
      ],
      limitations: [],
      cta:
        currentPlan === "pro" && currentBillingCycle === billingCycle
          ? isCancelled
            ? "Renew Pro Plan"
            : "Current Plan"
          : "Upgrade to Pro",
      highlight: true,
      isCurrent:
        currentPlan === "pro" &&
        currentBillingCycle === billingCycle &&
        isActive &&
        isAuthenticated,
      isCancelled: currentPlan === "pro" && isCancelled && isAuthenticated,
    },
    // ENTERPRISE CARD TEMPORARILY COMMENTED OUT FOR PRODUCTION
    // enterprise: {
    //   name: 'Enterprise',
    //   price: { monthly: 99, yearly: 990 },
    //   description: 'For large teams and organizations',
    //   features: [
    //     'Everything in Pro',
    //     '✨ Unlimited share links',
    //     '✨ White-label options',
    //     '✨ Custom domain',
    //     'API access',
    //     'SSO integration',
    //     'Dedicated support',
    //     'Team collaboration',
    //     'Advanced security',
    //     'Custom integrations'
    //   ],
    //   limitations: [],
    //   cta: currentPlan === 'enterprise'
    //     ? (isCancelled ? 'Renew Enterprise Plan' : 'Current Plan')
    //     : 'Upgrade to Enterprise',
    //   highlight: false,
    //   isCurrent: currentPlan === 'enterprise' && isActive && isAuthenticated,
    //   isCancelled: currentPlan === 'enterprise' && isCancelled && isAuthenticated
    // }
  };

  // Show notification helper
  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Handle actual downgrade/cancellation
  const handleDowngrade = async () => {
    setShowDowngradeModal(false);
    setLoading("free");
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const baseUrl = getApiUrl("node");
      const cancelUrl = `${baseUrl}/api/subscription/${company.id}/cancel`;
      const response = await fetch(cancelUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        showNotificationMessage(
          "Your subscription has been cancelled. You will have access to Pro features until the end of your billing period.",
          "success",
        );
        setTimeout(() => window.location.reload(), 2000); // Reload to update subscription status
      } else {
        showNotificationMessage(
          `Failed to cancel subscription: ${data.error || "Unknown error"}`,
          "error",
        );
      }
    } catch (error) {
      showNotificationMessage(
        `Failed to cancel subscription: ${error.message}`,
        "error",
      );
    } finally {
      setLoading(null);
    }
  };

  const handleSelectPlan = async (planName) => {
    // Handle downgrade to free by canceling subscription
    if (planName === "free") {
      if (currentPlan !== "free") {
        setShowDowngradeModal(true);
      }
      return;
    }

    setLoading(planName);
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
          plan: planName,
          billingCycle: billingCycle,
        }),
      });
      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        showNotificationMessage(
          `Failed to start checkout: ${data.error || "Unknown error"}`,
          "error",
        );
      }
    } catch (error) {
      showNotificationMessage(
        `Failed to start checkout: ${error.message}`,
        "error",
      );
    } finally {
      setLoading(null);
    }
  };
  const getSavings = (plan) => {
    if (billingCycle === "yearly" && plan !== "free") {
      const monthly = plans[plan].price.monthly * 12;
      const yearly = plans[plan].price.yearly;
      const savings = monthly - yearly;
      const percentage = Math.round((savings / monthly) * 100);
      const monthsFree = Math.round(savings / plans[plan].price.monthly);
      return {
        amount: Math.round(savings * 100) / 100,
        percentage,
        monthsFree,
      };
    }
    return null;
  };
  return (
    <div className="bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                2 Months Free
              </span>
            </button>
          </div>
        </div>
        {/* Pricing Cards */}
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => {
            const savings = getSavings(key);
            return (
              <div
                key={key}
                className={`bg-white rounded-xl shadow-xl overflow-hidden transform transition-all hover:scale-105 w-full ${
                  key === "free" ? "md:w-80 scale-95" : "md:w-96"
                } ${
                  plan.isCancelled
                    ? "ring-4 ring-red-500"
                    : plan.isCurrent && currentBillingCycle === billingCycle
                      ? "ring-4 ring-green-500"
                      : currentPlan === "free" && key === "pro"
                        ? "ring-4 ring-blue-500"
                        : ""
                }`}
              >
                {plan.isCurrent && currentBillingCycle === billingCycle && (
                  <div className="bg-green-600 text-white text-center py-2 text-sm font-semibold">
                    ✓ CURRENT PLAN
                  </div>
                )}
                {currentPlan === "free" && key === "pro" && (
                  <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                    ⭐ MOST POPULAR
                  </div>
                )}
                {plan.isCancelled && (
                  <div className="bg-red-600 text-white text-center py-2 text-sm font-semibold">
                    ⚠ CANCELLED
                  </div>
                )}
                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-extrabold text-gray-900">
                        ${plan.price[billingCycle]}
                      </span>
                      {key !== "free" && (
                        <span className="ml-2 text-gray-600">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      )}
                    </div>
                    {savings && (
                      <p className="text-sm text-blue-600 mt-2">
                        Save ${savings.amount}/year ({savings.monthsFree} months
                        free)
                      </p>
                    )}
                  </div>
                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(key)}
                    disabled={
                      loading === key ||
                      (plan.isCurrent &&
                        currentBillingCycle === billingCycle) ||
                      (key === "free" && currentPlan === "free")
                    }
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mb-6 ${
                      plan.isCurrent && currentBillingCycle === billingCycle
                        ? "bg-green-600 text-white opacity-60 cursor-not-allowed"
                        : plan.isCancelled
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : currentPlan === "free" && key === "pro"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : plan.highlight
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : key === "free" && currentPlan === "free"
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : key === "free" && currentPlan !== "free"
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-900 text-white hover:bg-gray-800"
                    } ${loading === key ? "opacity-50 cursor-wait" : ""}`}
                  >
                    {loading === key ? "Processing..." : plan.cta}
                  </button>
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="border-t pt-4 space-y-3">
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-start">
                          <XMarkIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-500 text-sm">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <svg
                className="h-8 w-8 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Downgrade to Free
              </h3>
            </div>

            <p className="text-gray-600 mb-6 text-left">
              Are you sure you want to downgrade to Free plan? Your Pro
              subscription will be cancelled and you will lose access to premium
              features at the end of your billing period.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDowngrade}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Yes, Downgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`rounded-lg p-4 shadow-lg max-w-md ${
              notificationType === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notificationType === "success" ? (
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    notificationType === "success"
                      ? "text-green-900"
                      : "text-red-900"
                  }`}
                >
                  {notificationMessage}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setShowNotification(false)}
                  className={`inline-flex rounded-md ${
                    notificationType === "success"
                      ? "text-green-500 hover:text-green-600"
                      : "text-red-500 hover:text-red-600"
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PricingPage;
