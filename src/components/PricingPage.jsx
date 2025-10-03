import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '../config/api';
import { useCompany } from '../context/CompanyContext';

const PricingPage = () => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [openFAQ, setOpenFAQ] = useState(null);

  // Get current subscription info (with fallback for non-authenticated users)
  const currentPlan = company?.subscription_plan || 'free';
  const currentStatus = company?.subscription_status || 'active';
  const isActive = ['active', 'trialing'].includes(currentStatus);
  const isCancelled = ['cancelled', 'expired', 'past_due'].includes(currentStatus);
  
  // Check if user is authenticated (has company data)
  const isAuthenticated = !!company;

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "Can I change plans later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      id: 2,
      question: "What happens to my shared QuDemos if I downgrade?",
      answer: "If you downgrade to Free, all your shared QuDemo links will stop working immediately. Visitors will see a message that the QuDemo is no longer available."
    },
    {
      id: 3,
      question: "Can I cancel anytime?",
      answer: "Absolutely! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
    },
    {
      id: 4,
      question: "Is there a free trial?",
      answer: "The Free plan is available forever with no credit card required. You can upgrade to Pro or Enterprise whenever you're ready to share your QuDemos."
    }
  ];

  // Handle FAQ toggle
  const toggleFAQ = (faqId) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Create unlimited QuDemos',
        'Preview QuDemos',
        'Edit and manage QuDemos',
        'Basic analytics',
        'Email support'
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
      price: { monthly: 29, yearly: 290 },
      description: 'For professionals and growing teams',
      features: [
        'Everything in Free',
        '✨ Generate share links',
        '✨ Public QuDemo sharing',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Email notifications',
        'Export data'
      ],
      limitations: [],
      cta: currentPlan === 'pro' 
        ? (isCancelled ? 'Renew Pro Plan' : 'Current Plan')
        : 'Upgrade to Pro',
      highlight: true,
      isCurrent: currentPlan === 'pro' && isActive && isAuthenticated,
      isCancelled: currentPlan === 'pro' && isCancelled && isAuthenticated
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      description: 'For large teams and organizations',
      features: [
        'Everything in Pro',
        '✨ Unlimited share links',
        '✨ White-label options',
        '✨ Custom domain',
        'API access',
        'SSO integration',
        'Dedicated support',
        'Team collaboration',
        'Advanced security',
        'Custom integrations'
      ],
      limitations: [],
      cta: currentPlan === 'enterprise' 
        ? (isCancelled ? 'Renew Enterprise Plan' : 'Current Plan')
        : 'Upgrade to Enterprise',
      highlight: false,
      isCurrent: currentPlan === 'enterprise' && isActive && isAuthenticated,
      isCancelled: currentPlan === 'enterprise' && isCancelled && isAuthenticated
    }
  };

  const handleSelectPlan = async (planName) => {
    if (planName === 'free') {
      return; // Free plan is always active
    }

    setLoading(planName);

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🔍 Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('🛒 Creating checkout for:', planName, billingCycle);
      const baseUrl = getApiUrl('node');
      const checkoutUrl = `${baseUrl}/api/subscription/checkout`;
      console.log('🔗 Base URL:', baseUrl);
      console.log('🔗 Checkout URL:', checkoutUrl);
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

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success && data.checkoutUrl) {
        console.log('✅ Redirecting to checkout:', data.checkoutUrl);
        // Redirect to Lemon Squeezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        console.error('❌ Failed to create checkout session:', data.error);
        alert(`Failed to start checkout: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating checkout:', error);
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
      return { amount: savings, percentage };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start sharing your QuDemos with the world
          </p>

          {/* Billing Toggle */}
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
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => {
            const savings = getSavings(key);
            return (
              <div
                key={key}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 ${
                  plan.highlight ? 'ring-4 ring-blue-500' : ''
                } ${
                  plan.isCurrent ? 'ring-4 ring-green-500' : ''
                } ${
                  plan.isCancelled ? 'ring-4 ring-red-500' : ''
                }`}
              >
                {plan.isCurrent && (
                  <div className="bg-green-600 text-white text-center py-2 text-sm font-semibold">
                    ✓ CURRENT PLAN
                  </div>
                )}
                {plan.isCancelled && (
                  <div className="bg-red-600 text-white text-center py-2 text-sm font-semibold">
                    ⚠ CANCELLED
                  </div>
                )}
                {plan.highlight && !plan.isCurrent && !plan.isCancelled && (
                  <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                    MOST POPULAR
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
                      <p className="text-sm text-green-600 mt-2">
                        Save ${savings.amount}/year ({savings.percentage}% off)
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(key)}
                    disabled={key === 'free' || loading === key || plan.isCurrent}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all mb-6 ${
                      plan.isCurrent
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
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
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
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

        {/* Back Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {faqData.map((faq, index) => (
              <div key={faq.id} className={`border-b border-gray-200 last:border-b-0`}>
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-8 py-6 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {openFAQ === faq.id ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFAQ === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-8 pb-6 text-left">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

