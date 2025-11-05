import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRocket,
  FaClock,
  FaChartLine,
  FaDollarSign,
  FaSlack,
  FaHubspot,
  FaSalesforce,
  FaGoogle,
  FaMicrosoft,
  FaJira,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
} from "react-icons/fa";
import { StarBorder } from "./ui/star-border";
import FadeInSection from "./FadeInSection";
import InfiniteScroll from "./InfiniteScroll";
import TestimonialCard from "./ui/TestimonialCard";
import PricingCard from "./ui/PricingCard";
import IntegrationCard from "./ui/IntegrationCard";
import LightRays from "./ui/LightRays";
import { navigateToCreate } from "../utils/navigation";
import SpotlightCard from "./ui/SpotlightCard";
import InfiniteBadges from "./ui/InfiniteBadges";
import { Edit2, Eye, Pointer, Upload, User2 } from "lucide-react";
import Orb from "./ui/orb";

const HomePage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // Check authentication state on home page load
  useEffect(() => {
    const checkAuthState = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const user = localStorage.getItem("user");

      if (accessToken && refreshToken && user) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(user);
          setUserEmail(userData.email || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail("");
      }
    };

    checkAuthState();
    const handleStorageChange = (e) => {
      if (
        e.key === "accessToken" ||
        e.key === "refreshToken" ||
        e.key === "user"
      ) {
        checkAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Scroll to section handler
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "VP of Sales",
      company: "TechCorp",
      rating: 5,
      testimonial:
        "Qudemo transformed how we present our product. Our demo engagement increased by 300% and qualified leads by 150%.",
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      company: "StartupXYZ",
      rating: 5,
      testimonial:
        "The AI-powered Q&A is incredible. Prospects get instant answers and we save hours of manual demos every week.",
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "CloudSolutions",
      rating: 5,
      testimonial:
        "Setup took less than 5 minutes. The interactive experience keeps visitors engaged 5x longer than our old videos.",
    },
    {
      name: "David Park",
      role: "Founder",
      company: "InnovateLabs",
      rating: 5,
      testimonial:
        "Game changer for our sales process. Customers love being able to ask questions and jump to relevant parts instantly.",
    },
    {
      name: "Lisa Anderson",
      role: "Head of Growth",
      company: "ScaleUp Inc",
      rating: 5,
      testimonial:
        "Our conversion rate doubled after implementing Qudemo. The personalized experience makes all the difference.",
    },
    {
      name: "James Wilson",
      role: "CTO",
      company: "DevTools Pro",
      rating: 5,
      testimonial:
        "Finally, a solution that makes video demos feel like real conversations. Our prospects are more engaged than ever.",
    },
  ];

  // Integrations data
  const integrations = [
    { name: "Slack", icon: FaSlack, description: "Get notifications" },
    {
      name: "HubSpot",
      icon: FaHubspot,
      description: "Sync leads",
      comingSoon: true,
    },
    {
      name: "Salesforce",
      icon: FaSalesforce,
      description: "CRM integration",
      comingSoon: true,
    },
    { name: "Google Analytics", icon: FaGoogle, description: "Track insights" },
    {
      name: "Microsoft Teams",
      icon: FaMicrosoft,
      description: "Team alerts",
      comingSoon: true,
    },
    {
      name: "Jira",
      icon: FaJira,
      description: "Issue tracking",
      comingSoon: true,
    },
  ];

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Deep Ocean Light Rays Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(2, 6, 23, 1) 0%, rgba(1, 4, 15, 1) 50%, rgba(0, 2, 10, 1) 100%)",
        }}
      />
      <div className="fixed top-0 left-0 right-0 w-full opacity-[0.2]">
        <LightRays />
      </div>

      {/* Enhanced Navigation Bar - Outside overflow container */}
      <nav
        className="flex justify-between items-center px-4 md:px-6 w-full fixed top-0 z-50"
        style={{
          background: "rgba(18, 20, 38, 0.6)",
          backdropFilter: "blur(5px)",
        }}
      >
        <div className="flex items-center">
          <img
            src="/Qudemo LP.svg"
            alt="Qudemo Logo"
            className="w-32 h-20 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-white">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            Testimonials
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="hover:text-blue-400 transition-colors duration-200 font-medium"
          >
            FAQ
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2 md:gap-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div
                onClick={() => navigate("/profile")}
                className="text-white font-medium px-3 md:px-6 py-2 rounded-[20px] border text-xs md:text-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{
                  background: "rgba(18, 20, 38, 0.6)",
                  backdropFilter: "blur(16px)",
                  borderColor: "rgba(138, 165, 255, 0.3)",
                  boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
                }}
              >
                <span className="hidden sm:inline">{userEmail}</span>
                <span className="sm:hidden">{userEmail.split("@")[0]}</span>
              </div>
              <div
                onClick={() => navigate("/overview")}
                className="text-white font-medium px-4 md:px-8 py-2 rounded-[20px] border hover:shadow-2xl transition-all duration-300 cursor-pointer text-sm md:text-base"
                style={{
                  background: "rgba(41, 52, 255, 0.9)",
                  backdropFilter: "blur(16px)",
                  borderColor: "rgba(138, 165, 255, 0.5)",
                  boxShadow:
                    "0 8px 32px rgba(41, 52, 255, 0.4), inset 0 2px 4px rgba(138, 165, 255, 0.5)",
                }}
              >
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigate("/login", { state: { from: "/" } })}
              className="text-white font-medium px-4 md:px-8 py-2 rounded-[20px] border hover:shadow-lg transition-all duration-300 cursor-pointer text-sm md:text-base"
              style={{
                background: "rgba(18, 20, 38, 0.6)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(138, 165, 255, 0.3)",
                boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
              }}
            >
              Login
            </div>
          )}
        </div>
      </nav>

      <div
        className="relative z-10 flex flex-col min-h-screen max-w-full"
        style={{ overflowX: "clip" }}
      >
        {/* Hero Section */}
        <FadeInSection delay={0} className="flex flex-col">
          <div className="flex justify-center items-start mt-60 px-6 h-[60vh] ">
            <div className="max-w-5xl text-center">
              {/* User Avatars Badge */}
              <div className="flex justify-center mb-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                      <img
                        src="https://i.pravatar.cc/150?img=1"
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500">
                      <img
                        src="https://i.pravatar.cc/150?img=2"
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500">
                      <img
                        src="https://i.pravatar.cc/150?img=3"
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-red-500">
                      <img
                        src="https://i.pravatar.cc/150?img=4"
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Join Text */}
                  <span className="text-gray-400 text-md font-normal">
                    Join <span className="text-white font-medium">200+</span>{" "}
                    other loving customers
                  </span>
                </div>
              </div>

              <h1
                className="text-2xl md:text-3xl lg:text-7xl font-medium text-white mb-6 leading-tight tracking-tight"
                style={{
                  animation: "fadeInUp 0.8s ease-out 0.2s both",
                  textShadow: "0 4px 24px rgba(41, 52, 255, 0.3)",
                }}
              >
                AI Interactive Video
                <br />
                Agent for your
                <br />
                website.
              </h1>

              <p
                className="text-base md:text-lg text-gray-400 my-8 max-w-2xl mx-auto leading-relaxed font-normal"
                style={{
                  animation: "fadeInUp 0.8s ease-out 0.4s both",
                  fontWeight: "400",
                }}
              >
                Engage and Qualify your SaaS website visitors with an AI
                interactive video agent that feels like you are always
                available.
              </p>

              {/* CTA Button */}
              <div
                className="flex items-center justify-center mb-10"
                style={{
                  animation: "fadeInUp 0.8s ease-out 0.5s both",
                }}
              >
                <button
                  onClick={() => navigateToCreate(navigate)}
                  className="text-white font-medium text-base px-8 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
                  style={{
                    background: "rgba(59, 130, 246, 1)",
                    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.5)",
                  }}
                >
                  <span className="relative z-10">Get Started Now</span>
                </button>
              </div>

              {/* Infinite Scrolling Logos */}
              <div
                style={{
                  animation: "fadeInUp 0.8s ease-out 0.6s both",
                }}
              >
                <InfiniteScroll />
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Why Choose Us Section */}
        <FadeInSection delay={0.1} className="flex flex-col">
          <div
            className="px-6 min-h-[100vh] relative my-auto flex flex-col justify-center"
            id="benefits"
          >
            <div className="max-w-7xl mx-auto text-center flex flex-col">
              <div
                style={{
                  width: "100%",
                  height: "600px",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: 0.4,
                }}
              >
                <Orb rotateOnHover={true} hue={0} forceHoverState={false} />
              </div>

              <div className="flex justify-center">
                <StarBorder
                  color="#2934ff"
                  className="text-white text-sm font-semibold uppercase tracking-wide"
                >
                  AI-DRIVEN EFFICIENCY
                </StarBorder>
              </div>

              <h2 className="text-3xl md:text-5xl font-medium text-white leading-tight mt-8 mb-4">
                Create Qudemo in Minutes
              </h2>

              <p className="text-md text-gray-400 mb-8 max-w-4xl mx-auto">
                Build your AI video agent once and let it qualify every visitor.
              </p>

              {/* Benefit Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SpotlightCard>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: "rgba(41, 52, 255, 0.9)",
                      boxShadow:
                        "0 8px 32px rgba(41, 52, 255, 0.5), inset 0 2px 4px rgba(138, 165, 255, 0.5)",
                    }}
                  >
                    <Upload className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Upload Content
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      Add your photo and key product knowledge sources. This
                      helps Qudemo learn how you explain your product in your
                      own words.
                    </p>
                  </div>
                </SpotlightCard>

                <SpotlightCard>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: "rgba(41, 52, 255, 0.9)",
                      boxShadow:
                        "0 8px 32px rgba(41, 52, 255, 0.5), inset 0 2px 4px rgba(138, 165, 255, 0.5)",
                    }}
                  >
                    <Edit2 className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Generate Video Agent
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      Qudemo creates your AI video agent that talks and answers
                      like you and ready to engage website visitors with
                      real-time responses.
                    </p>
                  </div>
                </SpotlightCard>

                <SpotlightCard>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: "rgba(41, 52, 255, 0.9)",
                      boxShadow:
                        "0 8px 32px rgba(41, 52, 255, 0.5), inset 0 2px 4px rgba(138, 165, 255, 0.5)",
                    }}
                  >
                    <FaChartLine className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Add to Website
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      Embed it on your site and start engaging visitors
                      instantly. Your AI video agent becomes the face of your
                      product, available 24/7.
                    </p>
                  </div>
                </SpotlightCard>
              </div>
              <div className="flex gap-10 text-gray-300 items-center mx-auto">
                <div className="flex gap-4">
                  <Pointer className="text-blue-400" />
                  <p>Instant Engagement</p>
                </div>
                <div className="w-[2px] h-6 bg-gray-600" />
                <div className="flex gap-4">
                  <User2 className="text-blue-400" />
                  <p>Qualified Leads</p>
                </div>
                <div className="w-[2px] h-6 bg-gray-600" />
                <div className="flex gap-4">
                  <Eye className="text-blue-400" />
                  <p>Founder Experience</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-100 px-6 min-h-[80vh]" id="why">
            <div className="max-w-7xl mx-auto text-center flex flex-col">
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-white text-sm font-semibold uppercase tracking-wide"
                >
                  BENEFITS
                </StarBorder>
              </div>

              <h2 className="text-3xl md:text-5xl font-medium text-white mb-4 leading-tight">
                Why Choose Us?
              </h2>

              <p className="text-md text-gray-400 mb-8 max-w-4xl mx-auto">
                Engage, educate and qualify leads with an AI agent that feels
                like you.
              </p>

              {/* Benefit Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SpotlightCard>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: "rgba(41, 52, 255, 0.9)",
                      boxShadow:
                        "0 8px 32px rgba(41, 52, 255, 0.5), inset 0 2px 4px rgba(138, 165, 255, 0.5)",
                    }}
                  >
                    <FaClock className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Save Time
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      Let viewers explore your video without watching the full
                      length, getting straight to what matters most to them.
                    </p>
                  </div>
                </SpotlightCard>

                <SpotlightCard>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: "rgba(41, 52, 255, 0.9)",
                      boxShadow:
                        "0 8px 32px rgba(41, 52, 255, 0.5), inset 0 2px 4px rgba(138, 165, 255, 0.5)",
                    }}
                  >
                    <FaChartLine className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Increase Engagement
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      Interactive videos keep viewers engaged 5x longer than
                      traditional videos with real-time Q&A capabilities.
                    </p>
                  </div>
                </SpotlightCard>

                <SpotlightCard>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      background: "rgba(41, 52, 255, 0.9)",
                      boxShadow:
                        "0 8px 32px rgba(41, 52, 255, 0.5), inset 0 2px 4px rgba(138, 165, 255, 0.5)",
                    }}
                  >
                    <FaDollarSign className="text-white text-2xl" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Better Conversions
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      Convert more prospects by allowing them to get instant
                      answers to their specific questions about your product.
                    </p>
                  </div>
                </SpotlightCard>
              </div>
              <div
                style={{
                  animation: "fadeInUp 0.8s ease-out 0.6s both",
                }}
              >
                <InfiniteBadges />
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Testimonials Section */}
        <FadeInSection delay={0.1} className="flex flex-col">
          <div
            className="px-6 min-h-[100vh] flex flex-col my-auto justify-center"
            id="testimonials"
          >
            <div className="max-w-7xl mx-auto text-center flex flex-col">
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-white text-sm font-semibold uppercase tracking-wide"
                >
                  TESTIMONIALS
                </StarBorder>
              </div>

              <h2 className="text-3xl md:text-5xl font-medium text-white mb-6 leading-tight">
                Loved by Product Teams Worldwide
              </h2>

              <p className="text-md text-gray-400 mb-8 max-w-4xl mx-auto">
                See what our customers are saying about their experience with
                Qudemo
              </p>

              {/* Testimonials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard key={index} {...testimonial} />
                ))}
              </div>
              <div className="flex items-center gap-3 mx-auto mt-8">
                {/* Avatar Stack */}
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                    <img
                      src="https://i.pravatar.cc/150?img=1"
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500">
                    <img
                      src="https://i.pravatar.cc/150?img=2"
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500">
                    <img
                      src="https://i.pravatar.cc/150?img=3"
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-red-500">
                    <img
                      src="https://i.pravatar.cc/150?img=4"
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Join Text */}
                <span className="text-gray-400 text-md font-normal">
                  Join <span className="text-white font-medium">200+</span>{" "}
                  other loving customers
                </span>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Pricing Section */}
        <FadeInSection delay={0.1} className="flex flex-col">
          <div
            className="px-6 min-h-[80vh] w-full flex flex-col my-auto justify-center"
            id="pricing"
          >
            <div className="max-w-7xl mx-auto w-full text-center">
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-white text-sm font-semibold uppercase tracking-wide"
                >
                  PRICING
                </StarBorder>
              </div>

              <h2 className="text-3xl md:text-5xl font-medium text-white mb-4 leading-tight">
                Simple, Transparent Pricing
              </h2>

              <p className="text-md text-gray-400 mb-8 max-w-4xl mx-auto">
                Choose the plan that fits your needs. No hidden fees, cancel
                anytime.
              </p>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PricingCard
                  title="Starter"
                  price="12"
                  period="month"
                  features={[
                    "5 interactive videos",
                    "AI-powered Q&A",
                    "Basic analytics",
                    "Email support",
                    "Standard quality video",
                  ]}
                  buttonText="Start Free Trial"
                  onButtonClick={() => navigateToCreate(navigate)}
                />

                <PricingCard
                  title="Professional"
                  price="17"
                  period="month"
                  isPopular={true}
                  className="!overflow-visible"
                  features={[
                    "Unlimited interactive videos",
                    "Advanced AI capabilities",
                    "Detailed analytics & insights",
                    "Priority support",
                    "HD video quality",
                    "Custom branding",
                    "Integration support",
                  ]}
                  buttonText="Get Started"
                  onButtonClick={() => navigateToCreate(navigate)}
                />

                <PricingCard
                  title="Enterprise"
                  customPrice={true}
                  features={[
                    "Everything in Professional",
                    "Dedicated account manager",
                    "Custom integrations",
                    "SLA guarantee",
                    "White-label solution",
                    "On-premise deployment",
                    "Advanced security features",
                  ]}
                  buttonText="Contact Sales"
                  onButtonClick={() =>
                    (window.location.href = "mailto:mail@qudemo.com")
                  }
                />
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Quote Section */}
        <FadeInSection delay={0.1} className="flex flex-col">
          <div
            className="px-6 bg-black min-h-[40vh] my-auto flex flex-col justify-center"
            style={{
              borderColor: "rgba(138, 165, 255, 0.3)",
              boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
            }}
          >
            <div className="max-w-4xl mx-auto text-center flex flex-col">
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-blue-100 text-sm font-medium"
                >
                  FOUNDERS NOTE
                </StarBorder>
              </div>

              <blockquote className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
                We believe a <span className="text-blue-400">Demo</span> should
                feel like real
                <br />
                conversations, not one-way presentations
                <br />
                letting customers ask questions and get
                <br />
                instant answers
              </blockquote>

              <div className="flex items-center gap-3 text-left mx-auto mt-8">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                  <img
                    src="https://i.pravatar.cc/150?img=4"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-gray-400 text-base">
                    Co-founder & ex-Meta Data Scientist
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Seamless Integrations Section */}
        <FadeInSection delay={0.1}>
          <div className="px-6 relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            <div className="max-w-7xl mx-auto text-center relative w-full">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-blue-100 text-sm font-medium"
                >
                  INTEGRATIONS
                </StarBorder>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Seamless Integrations
              </h2>

              <p className="text-xl text-gray-400 mb-20 max-w-4xl mx-auto">
                Connect with your favorite tools to streamline workflows
              </p>

              {/* Integration Hub - Center Logo with Connecting Lines */}
              <div
                className="relative w-full mx-auto"
                style={{ height: "600px" }}
              >
                {/* Center Logo with Wave Animations */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  {/* Multiple Concentric Wave Circles - 3 waves */}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        width: "46px",
                        height: "46px",
                        background: `radial-gradient(circle, transparent 60%, rgba(59, 130, 246, ${0.4 - i * 0.05}) 70%, transparent 100%)`,
                        animation: `waveRipple 6s ease-out infinite`,
                        animationDelay: `${i * 1}s`,
                      }}
                    />
                  ))}

                  {/* Center Logo */}
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)",
                      boxShadow:
                        "0 0 60px rgba(59, 130, 246, 0.6), 0 0 100px rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    <img
                      src="/Qudemo LP.svg"
                      alt="Qudemo Logo"
                      className="w-20 h-20"
                    />
                  </div>
                </div>

                {/* Animated Lines and Bubbles */}
                {/* Top - OpenAI */}
                <div className="flex flex-wrap justify-center h-full">
                  <div className="basis-1/2">
                    <SpotlightCard
                      className="w-20 h-20 rounded-xl flex items-center justify-center m-auto"
                      style={{
                        background: "rgba(18, 20, 38, 0.8)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(138, 165, 255, 0.3)",
                        boxShadow: "0 8px 32px rgba(41, 52, 255, 0.3)",
                      }}
                    >
                      <svg
                        className="w-10 h-10 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                      </svg>
                    </SpotlightCard>
                    <p className="text-gray-300 mt-4 text-sm max-w-[200px] mx-auto">
                      GPT models to generate content and build intelligent
                      agents.
                    </p>
                  </div>

                  {/* Right - Notion */}
                  <div className="basis-1/2">
                    <SpotlightCard
                      className="w-20 h-20 rounded-xl flex items-center justify-center m-auto"
                      style={{
                        background: "rgba(18, 20, 38, 0.8)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(138, 165, 255, 0.3)",
                        boxShadow: "0 8px 32px rgba(41, 52, 255, 0.3)",
                      }}
                    >
                      <span className="text-4xl font-bold text-white">N</span>
                    </SpotlightCard>
                    <p className="text-gray-300 mt-4 text-sm max-w-[200px] mx-auto">
                      Summarize tasks, and organize info using Notion's powerful
                      AI assistant.
                    </p>
                  </div>

                  {/* Bottom - LinkedIn */}
                  <div className="basis-1/2">
                    <SpotlightCard
                      className="w-20 h-20 rounded-xl flex items-center justify-center m-auto"
                      style={{
                        background: "rgba(18, 20, 38, 0.8)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(138, 165, 255, 0.3)",
                        boxShadow: "0 8px 32px rgba(41, 52, 255, 0.3)",
                      }}
                    >
                      <svg
                        className="w-10 h-10 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </SpotlightCard>
                    <p className="text-gray-300 mt-4 text-sm max-w-[200px] mx-auto">
                      Connect with Linked In and with dozens of other tools in
                      it
                    </p>
                  </div>

                  {/* Left - Twitter/X */}
                  <div className="basis-1/2">
                    <SpotlightCard
                      className="w-20 h-20 rounded-xl flex items-center justify-center m-auto"
                      style={{
                        background: "rgba(18, 20, 38, 0.8)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(138, 165, 255, 0.3)",
                        boxShadow: "0 8px 32px rgba(41, 52, 255, 0.3)",
                      }}
                    >
                      <svg
                        className="w-10 h-10 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </SpotlightCard>
                    <p className="text-gray-300 mt-4 text-sm max-w-[200px] mx-auto">
                      Connect with Twitter and with dozens of other tools in it
                      without code
                    </p>
                  </div>
                </div>

                {/* Connecting Lines with Animated Line Beams */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  {/* Vertical Line - Top */}
                  <line
                    x1="50%"
                    y1="40%"
                    x2="50%"
                    y2="0%"
                    stroke="rgba(59, 130, 246, 0.1)"
                    strokeWidth="2"
                  />

                  {/* Horizontal Line - Right */}
                  <line
                    x1="50%"
                    y1="40%"
                    x2="80%"
                    y2="40%"
                    stroke="rgba(59, 130, 246, 0.1)"
                    strokeWidth="2"
                  />

                  {/* Vertical Line - Bottom */}
                  <line
                    x1="50%"
                    y1="40%"
                    x2="50%"
                    y2="60%"
                    stroke="rgba(59, 130, 246, 0.1)"
                    strokeWidth="2"
                  />

                  {/* Horizontal Line - Left */}
                  <line
                    x1="50%"
                    y1="40%"
                    x2="20%"
                    y2="40%"
                    stroke="rgba(59, 130, 246, 0.1)"
                    strokeWidth="2"
                  />

                  {/* Animated Line Beams - Small moving line segments */}
                  {/* Beam to Top */}
                  <line
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="x1"
                      values="50%;50%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y1"
                      values="40%;38%;36%;34%;32%;30%;28%;26%;24%;22%;20%;18%;16%;14%;12%;10%;8%;6%;4%;2%;0%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="x2"
                      values="50%;50%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y2"
                      values="38%;36%;34%;32%;30%;28%;26%;24%;22%;20%;18%;16%;14%;12%;10%;8%;6%;4%;2%;0%;0%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.8;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;0.5;0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Beam to Right */}
                  <line
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="x1"
                      values="50%;52%;54%;56%;58%;60%;62%;64%;66%;68%;70%;72%;74%;76%;78%;80%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y1"
                      values="40%;40%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="x2"
                      values="52%;54%;56%;58%;60%;62%;64%;66%;68%;70%;72%;74%;76%;78%;80%;80%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y2"
                      values="40%;40%"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.8;1;1;1;1;1;1;1;1;1;1;1;1;0.5;0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Beam to Bottom */}
                  <line
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="x1"
                      values="50%;50%"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y1"
                      values="40%;42%;44%;46%;48%;50%;52%;54%;56%;58%;60%"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="x2"
                      values="50%;50%"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y2"
                      values="42%;44%;46%;48%;50%;52%;54%;56%;58%;60%;60%"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.8;1;1;1;1;1;1;1;0.5;0"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                  </line>

                  {/* Beam to Left */}
                  <line
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <animate
                      attributeName="x1"
                      values="50%;48%;46%;44%;42%;40%;38%;36%;34%;32%;30%;28%;26%;24%;22%;20%"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y1"
                      values="40%;40%"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="x2"
                      values="48%;46%;44%;42%;40%;38%;36%;34%;32%;30%;28%;26%;24%;22%;20%;20%"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y2"
                      values="40%;40%"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.8;1;1;1;1;1;1;1;1;1;1;1;1;0.5;0"
                      dur="4.8s"
                      repeatCount="indefinite"
                    />
                  </line>
                </svg>

                {/* Light beams emanating from center */}
                <div
                  className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                  style={{ zIndex: 0 }}
                >
                  {[0, 90, 180, 270, 360].map((angle, i) => (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 origin-left"
                      style={{
                        width: "400px",
                        height: "2px",
                        background:
                          "linear-gradient(45deg, rgba(59, 130, 246, 0.3) 0%, transparent 100%)",
                        transform: `rotate(${angle}deg)`,
                        animation: `beamPulse ${2 + i * 0.3}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`,
                        filter: "blur(2px)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes beamPulse {
                0%,
                100% {
                  opacity: 0.2;
                }
                50% {
                  opacity: 0.6;
                }
              }

              @keyframes waveRipple {
                0% {
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 0;
                }
                10% {
                  opacity: 0.8;
                }
                100% {
                  transform: translate(-50%, -50%) scale(6.25);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        </FadeInSection>

        {/* Integrations Section */}
        <FadeInSection delay={0.1}>
          <div
            className="h-100 px-6 flex min-h-[80vh] flex-col justify-center"
            id="integrations"
          >
            <div className="max-w-7xl mx-auto text-center w-full">
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-white text-sm font-semibold uppercase tracking-wide"
                >
                  CONNECTIONS
                </StarBorder>
              </div>

              <h2 className="text-3xl md:text-5xl font-medium text-white mb-6 leading-tight">
                Connect With Your Favorite Tools
              </h2>

              <p className="text-md text-gray-400 mb-8 max-w-4xl mx-auto">
                Seamlessly integrate Qudemo with the tools you already use
              </p>

              {/* Integrations Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {integrations.map((integration, index) => (
                  <IntegrationCard key={index} {...integration} />
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Comparison Section */}
        <FadeInSection delay={0.1}>
          <div
            className="h-100 px-6 min-h-[80vh] flex flex-col justify-center"
            id="comparison"
          >
            <div className="max-w-7xl mx-auto text-center">
              {/* Badge */}
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-blue-100 text-sm font-medium"
                >
                  COMPARISON
                </StarBorder>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Why Qudemo Stands Out
              </h2>

              <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-4xl mx-auto">
                See how we compare against others in performance, growth
              </p>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* LanX/Qudemo Column */}
                <SpotlightCard>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 scale-150">
                      <img
                        src="/Qudemo LP.svg"
                        alt="Qudemo Logo"
                        className="h-20"
                      />
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-6 text-left">
                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-300 text-lg leading-relaxed">
                        Feels like the founder personally talking
                      </span>
                    </div>

                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-300 text-lg leading-relaxed">
                        Answers questions in real time through the video
                      </span>
                    </div>

                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-300 text-lg leading-relaxed">
                        Engages visitors while explaining product visually
                      </span>
                    </div>

                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-300 text-lg leading-relaxed">
                        Qualifies leads automatically
                      </span>
                    </div>

                    <div className="flex items-start gap-3 pb-4">
                      <svg
                        className="w-6 h-6 text-green-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-300 text-lg leading-relaxed">
                        Handles complex questions naturally
                      </span>
                    </div>
                  </div>
                </SpotlightCard>

                {/* Others Column */}
                <SpotlightCard>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4 h-20">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span className="text-2xl font-bold text-gray-300">
                      Others
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-6 text-left">
                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-red-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-gray-400 text-lg leading-relaxed">
                        Generic, impersonal replies
                      </span>
                    </div>

                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-red-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-gray-400 text-lg leading-relaxed">
                        Limited to text/chat responses
                      </span>
                    </div>

                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-red-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-gray-400 text-lg leading-relaxed">
                        Often only provides text instructions
                      </span>
                    </div>

                    <div className="flex items-start gap-3 border-b border-gray-700 pb-4">
                      <svg
                        className="w-6 h-6 text-red-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-gray-400 text-lg leading-relaxed">
                        Requires manual follow-up
                      </span>
                    </div>

                    <div className="flex items-start gap-3 pb-4">
                      <svg
                        className="w-6 h-6 text-red-400 flex-shrink-0 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-gray-400 text-lg leading-relaxed">
                        Struggles with nuanced queries
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* FAQ Section */}
        <FadeInSection delay={0.1}>
          <div className="py-16 px-6 min-h-[80vh]" id="faq">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-8">
                <StarBorder
                  color="#2934ff"
                  className="text-blue-100 text-sm font-medium"
                >
                  FAQ'S SECTION
                </StarBorder>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Some Common FAQ's
              </h2>

              <p className="text-xl text-gray-300 mb-8">
                Get answers to your questions and learn about our platform
              </p>

              {/* FAQ Items */}
              <div className="max-w-4xl mx-auto space-y-4">
                <div
                  className="rounded-xl border hover:scale-[1.02] transition-all duration-300"
                  style={{
                    background: "rgba(18, 20, 38, 0.6)",
                    backdropFilter: "blur(16px)",
                    borderColor: "rgba(138, 165, 255, 0.3)",
                    boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
                  }}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer p-6"
                    onClick={() => toggleFAQ(0)}
                  >
                    <h3 className="text-lg font-semibold text-white">
                      What is Qudemo?
                    </h3>
                    <svg
                      className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 0 ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {openFAQ === 0 && (
                    <div className="px-6 pb-6 text-gray-300 text-left">
                      Qudemo is an AI video assistant that makes your demo
                      videos interactive. Viewers can ask questions, get instant
                      answers and jump straight to the exact moment in the video
                      where the answer is shown.
                    </div>
                  )}
                </div>

                <div
                  className="rounded-xl border hover:scale-[1.02] transition-all duration-300"
                  style={{
                    background: "rgba(18, 20, 38, 0.6)",
                    backdropFilter: "blur(16px)",
                    borderColor: "rgba(138, 165, 255, 0.3)",
                    boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
                  }}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer p-6"
                    onClick={() => toggleFAQ(1)}
                  >
                    <h3 className="text-lg font-semibold text-white">
                      How does it work?
                    </h3>
                    <svg
                      className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 1 ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {openFAQ === 1 && (
                    <div className="px-6 pb-6 text-gray-300 text-left">
                      Upload your video, generate a Qudemo, and share the link.
                      Viewers can ask questions in chat, get instant answers,
                      and jump to the exact video moment.
                    </div>
                  )}
                </div>

                <div
                  className="rounded-xl border hover:scale-[1.02] transition-all duration-300"
                  style={{
                    background: "rgba(18, 20, 38, 0.6)",
                    backdropFilter: "blur(16px)",
                    borderColor: "rgba(138, 165, 255, 0.3)",
                    boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
                  }}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer p-6"
                    onClick={() => toggleFAQ(2)}
                  >
                    <h3 className="text-lg font-semibold text-white">
                      Who is it for?
                    </h3>
                    <svg
                      className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 2 ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {openFAQ === 2 && (
                    <div className="px-6 pb-6 text-gray-300 text-left">
                      B2B SaaS teams sharing pre-recorded product videos with
                      prospects.
                      <br />
                      <br />
                      Qudemo can also be used by startups, educators, learners
                      and anyone using demo or product videos to engage
                      customers.
                    </div>
                  )}
                </div>

                <div
                  className="rounded-xl border hover:scale-[1.02] transition-all duration-300"
                  style={{
                    background: "rgba(18, 20, 38, 0.6)",
                    backdropFilter: "blur(16px)",
                    borderColor: "rgba(138, 165, 255, 0.3)",
                    boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
                  }}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer p-6"
                    onClick={() => toggleFAQ(3)}
                  >
                    <h3 className="text-lg font-semibold text-white">
                      Do I need technical setup?
                    </h3>
                    <svg
                      className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 3 ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {openFAQ === 3 && (
                    <div className="px-6 pb-6 text-gray-300 text-left">
                      No, just upload your youtube/loom video, Create Qudemo and
                      Share it anywhere
                    </div>
                  )}
                </div>

                <div
                  className="rounded-xl border hover:scale-[1.02] transition-all duration-300"
                  style={{
                    background: "rgba(18, 20, 38, 0.6)",
                    backdropFilter: "blur(16px)",
                    borderColor: "rgba(138, 165, 255, 0.3)",
                    boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
                  }}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer p-6"
                    onClick={() => toggleFAQ(4)}
                  >
                    <h3 className="text-lg font-semibold text-white">
                      What's the benefit?
                    </h3>
                    <svg
                      className={`w-5 h-5 text-white transform transition-transform duration-200 ${openFAQ === 4 ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {openFAQ === 4 && (
                    <div className="px-6 pb-6 text-gray-300 text-left">
                      Customers get answers faster and you get more qualified
                      leads.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Final Call-to-Action Section */}
        <FadeInSection delay={0.1}>
          <div className="h-100 px-6 relative min-h-[80vh] flex flex-col justify-center">
            <div className="max-w-4xl mx-auto text-center relative">
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(41, 52, 255, 0.3) 0%, transparent 70%)",
                  filter: "blur(60px)",
                }}
              />

              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <StarBorder
                    color="#1e40af"
                    className="text-blue-100 text-sm font-bold"
                  >
                    WHAT YOU STILL WAITING FOR
                  </StarBorder>
                </div>

                <h2 className="text-4xl md:text-5xl font-medium text-white mb-8 leading-tight">
                  Ready to transform your product videos?
                </h2>

                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Join Qudemo to create more engaging, interactive video
                  experiences that save time for everyone.
                </p>

                <div
                  className="flex items-center justify-center mb-10"
                  style={{
                    animation: "fadeInUp 0.8s ease-out 0.5s both",
                  }}
                >
                  <button
                    onClick={() => navigateToCreate(navigate)}
                    className="text-white font-medium text-base px-8 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
                    style={{
                      background: "rgba(59, 130, 246, 1)",
                      boxShadow: "0 8px 32px rgba(59, 130, 246, 0.5)",
                    }}
                  >
                    <span className="relative z-10">Get Started Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        <div
          className="py-12 px-6 bg-black"
          style={{
            borderColor: "rgba(138, 165, 255, 0.3)",
            boxShadow: "0 4px 24px rgba(41, 52, 255, 0.1)",
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Top Row - Logo and Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
              {/* Logo */}
              <div className="flex items-center">
                <img
                  src="/Qudemo LP.svg"
                  alt="LanX Logo"
                  className="h-40 -ml-5"
                />
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="hover:text-white transition-colors duration-200"
                >
                  Pricing
                </button>
                <span className="text-gray-700">|</span>
                <button
                  onClick={() => scrollToSection("benefits")}
                  className="hover:text-white transition-colors duration-200"
                >
                  Benefits
                </button>
                <span className="text-gray-700">|</span>
                <a
                  href="mailto:mail@qudemo.com"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
                <span className="text-gray-700">|</span>
                <button className="hover:text-white transition-colors duration-200">
                  Blog
                </button>
                <span className="text-gray-700">|</span>
                <button
                  onClick={() => navigate("/privacypolicy")}
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy
                </button>
                <span className="text-gray-700">|</span>
                <a
                  href="mailto:mail@qudemo.com"
                  className="hover:text-white transition-colors duration-200"
                >
                  mail@qudemo.com
                </a>
                <span className="text-gray-700">|</span>
                <button
                  onClick={() => navigateToCreate(navigate)}
                  className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-200"
                  style={{
                    background: "rgba(59, 130, 246, 1)",
                  }}
                >
                  Book a Demo
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 mb-8"></div>

            {/* Bottom Row - Social Links and Copyright */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Social Links */}
              <div className="flex items-center gap-12">
                <a
                  href="#"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <FaInstagram className="w-5 h-5" />
                  <span>Instagram</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <FaTwitter className="w-5 h-5" />
                  <span>Twitter/ X</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <FaFacebookF className="w-5 h-5" />
                  <span>Facebook</span>
                </a>
              </div>

              {/* Copyright */}
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>© 2025 — Copyright</span>
                <span className="text-gray-700">|</span>
                <span>Built in Framer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
