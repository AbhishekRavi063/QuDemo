import React from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import { getApiUrl } from "../config/api";
import {
  ClockIcon,
  Cog6ToothIcon,
  // ChatBubbleLeftEllipsisIcon, // COMMENTED OUT - Buyer Interactions hidden
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  UsersIcon,
  PlusIcon,
  PlayIcon,
  ServerIcon,
  BeakerIcon,
  LockClosedIcon,
  UserGroupIcon,
  DocumentArrowUpIcon,
  CreditCardIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// Base menu items (available to all users)
const baseMenuItems = [
  { name: "Overview", icon: Squares2X2Icon, path: "/overview" },
  { name: "Create Qudemo", icon: PlusIcon, path: "/create" },
  { name: "Qudemos", icon: PlayIcon, path: "/qudemos" },
  {
    name: "Interactions",
    icon: UserGroupIcon,
    path: "/customer-interactions",
    requiresPro: true,
  },
  // { name: 'Beta Version', icon: SparklesIcon, path: '/beta-version', isBeta: true },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { company } = useCompany();

  // Check subscription status
  const subscriptionPlan = company?.subscription_plan || "free";
  const subscriptionStatus = company?.subscription_status || "active";
  const isActive = ["active", "trialing", "on_trial"].includes(
    subscriptionStatus,
  );
  const isPro = ["pro", "enterprise"].includes(subscriptionPlan) && isActive;
  const isEnterprise = subscriptionPlan === "enterprise" && isActive;

  const handlePlanClick = async (e) => {
    e.preventDefault();
    setIsOpen(false);

    // For Pro users, navigate to profile subscription tab
    if (subscriptionPlan === "pro" || subscriptionPlan === "enterprise") {
      navigate("/profile", { state: { activeTab: "subscription" } });
    } else {
      // For Free users, redirect to checkout
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
            billingCycle: "monthly",
          }),
        });
        const data = await response.json();
        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          alert(`Failed to start checkout: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        alert(`Failed to start checkout: ${error.message}`);
      }
    }
  };

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-strokedark/10 z-50 transform
          transition-transform duration-300 ease-in-out
          overflow-y-auto scroll-smooth flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:static
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-strokedark/10">
          <Link
            to="/overview"
            className="cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/Qudemo.svg"
              alt="Qudemo Logo"
              className="h-10 ml-5 scale-[2.5] w-auto hover:opacity-80 transition-opacity"
            />
          </Link>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-md text-bodydark hover:text-graydark hover:bg-whiten focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* MENU Section */}
        <div className="px-4 py-4 text-left">
          <h3 className="text-xs font-semibold text-bodydark2 uppercase tracking-wider">
            MENU
          </h3>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col space-y-0.5 px-4 flex-1">
          {/* Base menu items (available to all users) */}
          {baseMenuItems.map(
            ({
              name,
              icon: Icon,
              path,
              requiresEnterprise,
              requiresPro,
              isBeta,
            }) => {
              // COMMENTED OUT FOR TESTING - Allow free users to access Pro features
              // const showLock = (requiresEnterprise && !isEnterprise) || (requiresPro && !isPro);
              const showLock = false; // TEST MODE: No locks for any features
              const isAnalytics = name === "Analytics";
              const isBulkShare = name === "Bulk Share";

              return (
                <NavLink
                  key={name}
                  to={path}
                  onClick={() => setIsOpen(false)} // Close menu on mobile after click
                  className={({ isActive }) => {
                    const baseClasses =
                      "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 relative group";

                    if (isActive) {
                      return `${baseClasses} bg-blue-500/10 text-primary`;
                    } else {
                      if (showLock) {
                        return `${baseClasses} text-graydark hover:bg-blue-500/10`;
                      } else {
                        return `${baseClasses} text-graydark hover:bg-blue-500/10`;
                      }
                    }
                  }}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  {/* COMMENTED OUT FOR TESTING - No lock icons shown */}
                  {/* {showLock && <LockClosedIcon className="h-3 w-3" />} */}
                  <span className="text-sm">{name}</span>
                  {isBeta && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold text-white bg-success rounded">
                      NEW
                    </span>
                  )}
                </NavLink>
              );
            },
          )}
        </nav>

        {/* SUPPORT Section */}
        <div className="px-4 py-4 text-left mt-auto">
          <h3 className="text-xs font-semibold text-bodydark2 uppercase tracking-wider">
            SUPPORT
          </h3>
        </div>

        {/* Support Links */}
        <div className="flex flex-col space-y-0.5 px-4">
          <Link
            to="/profile"
            className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              location.pathname === "/profile"
                ? "bg-primary/10 text-primary"
                : "text-graydark hover:bg-whiten"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            User Profile
          </Link>

          <Link
            to="/bulk-uploads"
            className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              location.pathname === "/bulk-uploads"
                ? "bg-primary/10 text-primary"
                : "text-graydark hover:bg-whiten"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <DocumentArrowUpIcon className="h-5 w-5 flex-shrink-0" />
            Bulk Upload
          </Link>

          <a
            href="mailto:mail@qudemo.com?subject=Help%20Request&body=Hi%20Qudemo%20Support%20Team,%0A%0AI%20need%20help%20with:%0A%0A"
            className="group flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-graydark hover:bg-whiten rounded-lg transition-all duration-200"
            onClick={() => setIsOpen(false)}
          >
            <QuestionMarkCircleIcon className="h-5 w-5 flex-shrink-0" />
            Help and Support
          </a>
        </div>

        {/* Bottom section with plan */}
        <div className="p-4 border-t border-strokedark/10 bg-white">
          {/* Current Plan Container */}
          <div
            className="block bg-whiten rounded-lg p-3.5 border border-strokedark/10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 cursor-pointer"
            onClick={handlePlanClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-0.5 text-left">
                <p className="text-sm font-semibold text-graydark text-left">
                  {subscriptionPlan === "pro" ? "Pro Plan" : "Free Plan"}
                </p>
                <p className="text-xs text-primary font-medium text-left">
                  {subscriptionPlan === "pro" ? "Manage Plan" : "Upgrade"}
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
