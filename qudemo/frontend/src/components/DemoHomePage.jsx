import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import InteractiveDemoPopup from "../components/InteractiveDemoPopup"; // Adjust path if needed
import VideoDemoChatPopup from "../components/VideoDemoChatPopup";

import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { NavLink } from "react-router-dom";

const DemoHomePage = () => {
  const [showHeroDropdown, setShowHeroDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showInteractiveDemoPopup, setShowInteractiveDemoPopup] =
    useState(false);
  const [showVideoDemoChatPopup, setShowVideoDemoChatPopup] = useState(false);
  const [leadId, setLeadId] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    notes: "",
  });

  const toggleHeroDropdown = () => setShowHeroDropdown((prev) => !prev);

  const openModal = () => {
    setShowHeroDropdown(false);
    setShowModal(true);
  };

  const openInteractivePopup = () => {
    setShowHeroDropdown(false);
    setShowInteractiveDemoPopup(true);
  };

  const openVideoDemoChatPopup = (leadIdFromPopup) => {
    setShowInteractiveDemoPopup(false);
    setLeadId(leadIdFromPopup);
    setShowVideoDemoChatPopup(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ date: "", time: "", notes: "" });
  };

  const closeInteractivePopup = () => setShowInteractiveDemoPopup(false);
  const closeVideoDemoChatPopup = () => setShowVideoDemoChatPopup(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Transform your <span className="text-blue-600">customer experience</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            Our AI-powered platform helps businesses automate customer interactions, boost engagement, and drive growth through personalized experiences.
          </p>

          <div className="mt-6 flex gap-4 relative">
            <button
              onClick={toggleHeroDropdown}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              Get a Demo <ChevronDownIcon className="w-4 h-4" />
            </button>
            <button className="bg-gray-100 px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-200">
              Learn more
            </button>

            {showHeroDropdown && (
              <div className="absolute right-0 md:left-0 top-full mt-2 w-56 bg-white shadow-lg rounded-lg text-sm text-gray-800 z-10">
                <button
                  onClick={openInteractivePopup}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <div className="font-semibold">Quick Demo</div>
                  <div className="text-xs text-gray-500">Explore with AI assistant</div>
                </button>
                <button
                  onClick={openModal}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-t"
                >
                  <div className="font-semibold">In-Person Demo</div>
                  <div className="text-xs text-gray-500">Schedule with our team</div>
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80"
            alt="Team collaboration"
            className="rounded-xl shadow-lg w-full object-cover"
          />
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 sm:p-8 relative max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
              📅 Schedule an In-Person Demo
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a convenient time for a personalized demo with one of our product specialists.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any specific topics you'd like us to cover?"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Popup */}
      {showInteractiveDemoPopup && (
        <InteractiveDemoPopup
          onClose={closeInteractivePopup}
          onSendRocket={openVideoDemoChatPopup}
        />
      )}

      {showVideoDemoChatPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-3xl">
            <VideoDemoChatPopup leadId={leadId} />
            <button
              onClick={closeVideoDemoChatPopup}
              className="absolute top-4 right-4 text-white text-2xl z-60"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Trusted Section */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-8">Trusted by industry leaders</h2>
        <div className="flex justify-center flex-wrap gap-x-12 gap-y-4 text-gray-500 text-lg font-medium px-4">
          <span>ACME Corp</span>
          <span>GlobalTech</span>
          <span>FutureInd</span>
          <span>InnovateCo</span>
          <span>TechGiant</span>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <p className="text-blue-600 font-semibold uppercase tracking-wide mb-2">Benefits</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-10">
          A better way to showcase your product
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-6xl mx-auto text-left">
          <BenefitItem
            icon={ChatBubbleLeftRightIcon}
            title="AI-Powered Conversations"
            description="Engage visitors with natural, intelligent conversations that qualify leads and gather essential information."
          />
          <BenefitItem
            icon={ClockIcon}
            title="24/7 Availability"
            description="Never miss a lead with round-the-clock automated demos and qualification."
          />
          <BenefitItem
            icon={ArrowTrendingUpIcon}
            title="Increased Conversion"
            description="Convert more visitors into qualified leads with personalized product demonstrations."
          />
          <BenefitItem
            icon={UsersIcon}
            title="Sales Team Efficiency"
            description="Allow your sales team to focus on high-value activities while AI handles initial qualification."
          />
        </div>
      </section>
    </div>
  );
};

const BenefitItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 text-blue-600">
      <Icon className="w-10 h-10" />
    </div>
    <div>
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

export default DemoHomePage;
