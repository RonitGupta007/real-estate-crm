"use client";

import { useState } from "react";
import { X, Building2, UploadCloud, Check } from "lucide-react";

interface NewPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPropertyModal({
  isOpen,
  onClose,
  onSuccess,
}: NewPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400018",
    price: "25000000",
    propertyType: "APARTMENT_4BHK",
    status: "ACTIVE",
    bedrooms: "4",
    bathrooms: "4",
    squareFeet: "3200",
    yearBuilt: "2023",
    lotSize: "N/A",
    reraId: "MahaRERA Approved",
    bhkConfig: "4 BHK Luxury Apartment",
    facingDirection: "North-East (Vastu Compliant)",
    maintenanceCharges: "25000",
    featuredImage: "",
    description: "",
    features: "Clubhouse, 100% Power Backup, Vastu Compliant, 2-Car Reserved Parking, Swimming Pool",
  });

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const featuresArray = formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: featuresArray,
          featuredImage:
            formData.featuredImage ||
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create property");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Add Property Listing</h2>
              <p className="text-xs text-slate-500">Add a new property to your brokerage inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Property Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. The Grandview Modern Penthouse"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Street / Locality Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. Worli Sea Face / Golf Course Road"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">City *</label>
                <input
                  type="text"
                  required
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">State *</label>
                <input
                  type="text"
                  required
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">PIN Code</label>
                <input
                  type="text"
                  placeholder="400018"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Price in Rupees (₹ INR) *</label>
              <input
                type="number"
                required
                placeholder="25000000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="APARTMENT_4BHK">4 BHK Luxury Apartment</option>
                <option value="APARTMENT_3BHK">3 BHK Premium Apartment</option>
                <option value="LUXURY_PENTHOUSE">Sky Mansion / Penthouse</option>
                <option value="GATED_VILLA">Gated Villa / Estate</option>
                <option value="PLOT_LAND">Residential Plot / Land</option>
                <option value="COMMERCIAL_OFFICE">Commercial Office Suite</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="ACTIVE">Active (Available)</option>
                <option value="PENDING">Token Paid (Pending)</option>
                <option value="UNDER_CONTRACT">BBA Executed</option>
                <option value="SOLD">Registered (Sold)</option>
                <option value="OFF_MARKET">Off Market</option>
              </select>
            </div>
          </div>

          {/* Indian Real Estate Compliance: RERA & Vastu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">RERA Registration ID</label>
              <input
                type="text"
                placeholder="e.g. MahaRERA P51900008965"
                value={formData.reraId}
                onChange={(e) => setFormData({ ...formData, reraId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Vastu / Facing Direction</label>
              <input
                type="text"
                placeholder="e.g. North-East (Vastu Compliant)"
                value={formData.facingDirection}
                onChange={(e) => setFormData({ ...formData, facingDirection: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Monthly Maintenance (₹)</label>
              <input
                type="number"
                placeholder="25000"
                value={formData.maintenanceCharges}
                onChange={(e) => setFormData({ ...formData, maintenanceCharges: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Square Feet</label>
              <input
                type="number"
                value={formData.squareFeet}
                onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Year Built</label>
              <input
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Featured Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.featuredImage}
              onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-400">Leave blank to use default curated luxury architectural photo</span>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Key Features / Amenities (Comma-separated)</label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Property Description</label>
            <textarea
              rows={3}
              placeholder="Highlight architecture, finishes, views, location perks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
