import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowUpIcon,
  CreditCardIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';

const SubscriptionTab = ({ companyId }) => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [companyId]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const baseUrl = getApiUrl('node');
      const response = await fetch(`${baseUrl}/api/subscription/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      } else {
        console.error('Failed to fetch subscription:', data.error);
        // Set default free subscription if API fails
        setSubscription({
          plan: 'free',
          status: 'active',
          usage: {
            totalQudemos: 0,
            sharedQudemos: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Set default free subscription on error
      setSubscription({
        plan: 'free',
        status: 'active',
        usage: {
          totalQudemos: 0,
          sharedQudemos: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleManageBilling = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl('node');
      const response = await fetch(`${baseUrl}/api/subscription/${companyId}/billing-portal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.portalUrl) {
        window.open(data.portalUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? All your shared QuDemos will stop working.')) {
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getApiUrl('node');
      const response = await fetch(`${baseUrl}/api/subscription/${companyId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Subscription cancelled successfully');
        fetchSubscription();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const getPlanBadge = (plan) => {
    const badges = {
      free: { color: 'bg-gray-100 text-gray-800', text: 'Free' },
      pro: { color: 'bg-blue-100 text-blue-800', text: 'Pro' },
      enterprise: { color: 'bg-purple-100 text-purple-800', text: 'Enterprise' }
    };
    return badges[plan] || badges.free;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Active' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Cancelled' },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Expired' },
      past_due: { color: 'bg-yellow-100 text-yellow-800', icon: XCircleIcon, text: 'Past Due' },
      trialing: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, text: 'Trial' }
    };
    return badges[status] || badges.active;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanFeatures = (plan) => {
    const features = {
      free: [
        'Create unlimited QuDemos',
        'Preview QuDemos',
        'Basic analytics',
        'Email support'
      ],
      pro: [
        'Everything in Free',
        'Generate share links',
        'Public QuDemo sharing',
        'Advanced analytics',
        'Priority support',
        'Custom branding'
      ],
      enterprise: [
        'Everything in Pro',
        'Unlimited share links',
        'White-label options',
        'Custom domain',
        'API access',
        'Dedicated support'
      ]
    };
    return features[plan] || features.free;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
  const isFree = subscription.plan === 'free';
  const isPaid = ['pro', 'enterprise'].includes(subscription.plan);
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${planBadge.color}`}>
                {planBadge.text}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center ${statusBadge.color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusBadge.text}
              </span>
            </div>

            {isPaid && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span>Started: {formatDate(subscription.startDate)}</span>
                </div>
                {subscription.nextBillingDate && isActive && (
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <span>Next billing: {formatDate(subscription.nextBillingDate)}</span>
                  </div>
                )}
                {subscription.endDate && !isActive && (
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-400" />
                    <span>Ends: {formatDate(subscription.endDate)}</span>
                  </div>
                )}
                {subscription.billingCycle && (
                  <div className="text-gray-600">
                    Billing: {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Usage Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Usage Statistics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total QuDemos:</span>
                <span className="font-semibold">{subscription.usage?.totalQudemos || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shared QuDemos:</span>
                <span className="font-semibold">{subscription.usage?.sharedQudemos || 0}</span>
              </div>
              {isFree && (
                <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  ⚠️ Upgrade to Pro to enable sharing
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isFree && (
            <button
              onClick={handleUpgrade}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpIcon className="h-5 w-5 mr-2" />
              Upgrade Plan
            </button>
          )}

          {isPaid && isActive && (
            <>
              <button
                onClick={handleUpgrade}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUpIcon className="h-5 w-5 mr-2" />
                Change Plan
              </button>

              <button
                onClick={handleManageBilling}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Manage Billing
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircleIcon className="h-5 w-5 mr-2" />
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </>
          )}

          {isPaid && !isActive && (
            <button
              onClick={handleUpgrade}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Reactivate Subscription
            </button>
          )}
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Plan Features</h3>
        <ul className="space-y-2">
          {getPlanFeatures(subscription.plan).map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {isFree && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium mb-2">🚀 Want to share your QuDemos?</p>
            <p className="text-blue-700 text-sm mb-3">
              Upgrade to Pro to unlock public sharing, advanced analytics, and priority support.
            </p>
            <button
              onClick={handleUpgrade}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Plans →
            </button>
          </div>
        )}
      </div>

      {/* Subscription Warning */}
      {!isActive && isPaid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-red-900 font-semibold mb-1">Subscription {statusBadge.text}</h4>
              <p className="text-red-700 text-sm">
                Your subscription is no longer active. All shared QuDemo links have been disabled.
                Reactivate your subscription to restore access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTab;

