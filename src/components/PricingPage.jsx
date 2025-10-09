import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';
import { useCompany } from '../context/CompanyContext';
const PricingPage = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);
  // Get current subscription info (with fallback for non-authenticated users)
  const currentPlan = company?.subscription_plan || 'free';
  const currentStatus = company?.subscription_status || 'active';
  const currentBillingCycle = company?.billing_cycle || 'monthly';
  const isActive = ['active', 'trialing', 'on_trial'].includes(currentStatus);
  const isCancelled = ['cancelled', 'expired', 'past_due'].includes(currentStatus);
  // Check if user is authenticated (has company data)
  const isAuthenticated = !!company;
  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Create unlimited QuDemos',
        'Preview QuDemos'
      ],
      limitations: [
        'No public sharing',
        'Cannot generate share links',
        'Limited analytics'
      ],
      cta: currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free',
      highlight: false,
      isCurrent: currentPlan === 'free' && isAuthenticated
    },
    pro: {
      name: 'Pro',
      price: { monthly: 29.9, yearly: 299 },
      description: 'For professionals and growing teams',
      features: [
        'Everything in Free',
        '✨ Generate share links',
        '✨ Public QuDemo sharing'
      ],
      limitations: [],
      cta: currentPlan === 'pro' && currentBillingCycle === billingCycle
        ? (isCancelled ? 'Renew Pro Plan' : 'Current Plan')
        : 'Upgrade to Pro',
      highlight: true,
      isCurrent: currentPlan === 'pro' && currentBillingCycle === billingCycle && isActive && isAuthenticated,
      isCancelled: currentPlan === 'pro' && isCancelled && isAuthenticated
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
  const handleSelectPlan = async (planName) => {
    if (planName === 'free') {
      return; // Free plan is always active
    }
    setLoading(planName);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const baseUrl = getApiUrl('node');
      const checkoutUrl = `${baseUrl}/api/subscription/checkout`;
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: planName,
          billingCycle: billingCycle
        })
      });
      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        alert(`Failed to start checkout: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Failed to start checkout: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };
  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan !== 'free') {
      const monthly = plans[plan].price.monthly * 12;
      const yearly = plans[plan].price.yearly;
      const savings = monthly - yearly;
      const percentage = Math.round((savings / monthly) * 100);
      const monthsFree = Math.round(savings / plans[plan].price.monthly);
      return { amount: Math.round(savings * 100) / 100, percentage, monthsFree };
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
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
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
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 w-full md:w-80 ${
                  plan.highlight ? 'ring-4 ring-blue-500' : ''
                } ${
                  plan.isCurrent && currentBillingCycle === billingCycle ? 'ring-4 ring-blue-500' : ''
                } ${
                  plan.isCancelled ? 'ring-4 ring-red-500' : ''
                }`}
              >
                {plan.isCurrent && currentBillingCycle === billingCycle && (
                  <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                    ✓ CURRENT PLAN
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
                      {key !== 'free' && (
                        <span className="ml-2 text-gray-600">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {savings && (
                      <p className="text-sm text-blue-600 mt-2">
                        Save ${savings.amount}/year ({savings.monthsFree} months free)
                      </p>
                    )}
                  </div>
                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(key)}
                    disabled={key === 'free' || loading === key || (plan.isCurrent && currentBillingCycle === billingCycle)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mb-6 ${
                      plan.isCurrent && currentBillingCycle === billingCycle
                        ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                        : plan.isCancelled
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : plan.highlight
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : key === 'free'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } ${loading === key ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {loading === key ? 'Processing...' : plan.cta}
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
                          <span className="text-gray-500 text-sm">{limitation}</span>
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
    </div>
  );
};
export default PricingPage;
