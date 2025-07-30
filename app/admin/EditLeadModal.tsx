"use client";
import { useState, useEffect } from "react";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  website: string;
  categories: string[];
  reason: string;
  status: string;
  createdAt: string;
}

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
}

export default function EditLeadModal({ lead, isOpen, onClose, onSave }: EditLeadModalProps) {
  const [formData, setFormData] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lead) {
      setFormData({ ...lead });
      setErrors({});
    }
  }, [lead]);

  if (!isOpen || !lead || !formData) {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (
      formData.website &&
      formData.website.trim() &&
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        formData.website.trim()
      )
    ) {
      newErrors.website = "Please enter a valid URL";
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = "At least one category must be selected";
    }

    if (!formData.reason.trim() || formData.reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa("admin:password")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        onSave(updatedLead);
        onClose();
      } else {
        console.error("Failed to update lead");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Lead, value: string | string[]) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    }
  };

  const visaCategories = ["O-1", "EB-1A", "EB-2 NIW", "I don't know"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Lead Information</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
              {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visa Categories *
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                {visaCategories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...formData.categories, category]
                          : formData.categories.filter((c) => c !== category);
                        handleInputChange("categories", newCategories);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
              {errors.categories && (
                <p className="text-red-600 text-sm mt-1">{errors.categories}</p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please explain your reason..."
              />
              {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="REACHED_OUT">Reached Out</option>
              </select>
            </div>

            {/* Created Date (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
              <input
                type="text"
                value={new Date(formData.createdAt).toLocaleDateString()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-black text-white px-4 py-2 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
