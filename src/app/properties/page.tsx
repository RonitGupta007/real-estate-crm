"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Eye,
  CheckCircle,
  X,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCRM } from "@/components/AppShell";

export default function PropertiesPage() {
  const { openModal, refreshTrigger, triggerRefresh } = useCRM();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  async function deleteProperty(id: string) {
    if (!confirm("Are you sure you want to permanently delete this property listing? Linked showings and records will be updated.")) {
      return;
    }
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setSelectedProperty(null);
        triggerRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter !== "ALL") params.set("status", statusFilter);
        if (typeFilter !== "ALL") params.set("type", typeFilter);

        const res = await fetch(`/api/properties?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, [search, statusFilter, typeFilter, refreshTrigger]);

  const totalValue = properties.reduce((acc, p) => acc + (p.price || 0), 0);

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    UNDER_CONTRACT: "bg-indigo-100 text-indigo-800 border-indigo-200",
    SOLD: "bg-slate-200 text-slate-800 border-slate-300",
    OFF_MARKET: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            Property Catalog & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {properties.length} listings • Total inventory volume:{" "}
            <span className="font-semibold text-slate-800">
              {formatCurrency(totalValue)}
            </span>
          </p>
        </div>

        <button
          onClick={() => openModal("property")}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property Listing</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, street, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "ACTIVE", "PENDING", "UNDER_CONTRACT", "SOLD"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex-shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Property Type Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none w-full md:w-44"
          >
            <option value="ALL">All Property Types</option>
            <option value="APARTMENT_4BHK">4 BHK Luxury Apartment</option>
            <option value="APARTMENT_3BHK">3 BHK Premium Apartment</option>
            <option value="LUXURY_PENTHOUSE">Sky Mansion / Penthouse</option>
            <option value="GATED_VILLA">Gated Villa / Independent Estate</option>
            <option value="COMMERCIAL_OFFICE">Commercial Corporate Office</option>
          </select>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">
          Loading listings...
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No properties found</p>
          <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => {
            let features: string[] = [];
            try {
              features = JSON.parse(prop.features || "[]");
            } catch {
              features = [];
            }

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Cover */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img
                    src={prop.featuredImage}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full border shadow-xs backdrop-blur-xs ${
                        statusColors[prop.status] || "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {prop.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Property Type Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-900/85 text-amber-300 rounded-md backdrop-blur-xs border border-amber-500/30">
                      {prop.bhkConfig || prop.propertyType.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Price & Location Bar at bottom of photo */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-2xl font-bold tracking-tight drop-shadow-sm">
                      {formatCurrency(prop.price)}
                    </p>
                    <p className="text-xs font-medium text-slate-200 flex items-center gap-1 drop-shadow-sm">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {prop.address}, {prop.city}, {prop.state}
                    </p>
                  </div>
                </div>

                {/* Property Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {prop.description}
                    </p>
                  </div>

                  {/* Specs row */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Beds</span>
                      <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-amber-500" />
                        {prop.bedrooms || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Baths</span>
                      <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-amber-500" />
                        {prop.bathrooms || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Sq Ft</span>
                      <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                        {prop.squareFeet ? prop.squareFeet.toLocaleString() : "-"}
                      </span>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {features.slice(0, 3).map((feat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md"
                        >
                          {feat}
                        </span>
                      ))}
                      {features.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                          +{features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProperty(prop)}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => openModal("showing")}
                      className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                      title="Book a Showing for this property"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tour</span>
                    </button>
                    <button
                      onClick={() => deleteProperty(prop.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition"
                      title="Delete Property"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Details Slideover / Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  {selectedProperty.propertyType.replace(/_/g, " ")}
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedProperty.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Image Preview */}
              <div className="rounded-xl overflow-hidden shadow-xs relative h-64">
                <img
                  src={selectedProperty.featuredImage}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      statusColors[selectedProperty.status]
                    }`}
                  >
                    {selectedProperty.status}
                  </span>
                </div>
              </div>

              {/* Price & Specs Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Asking Price
                  </span>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(selectedProperty.price)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ₹{(selectedProperty.pricePerSqFt || Math.round(selectedProperty.price / (selectedProperty.squareFeet || 1))).toLocaleString("en-IN")}/sq.ft
                  </p>
                  {selectedProperty.reraId && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                      {selectedProperty.reraId}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Assigned Agent
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedProperty.assignedAgent || "Priya Sharma"}
                  </p>
                  <p className="text-[11px] text-amber-600 font-medium">Principal Broker</p>
                  {selectedProperty.facingDirection && (
                    <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {selectedProperty.facingDirection}
                    </span>
                  )}
                </div>
              </div>

              {/* Key Specs */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Bedrooms</span>
                  <span className="text-sm font-bold text-slate-800">{selectedProperty.bedrooms} Beds</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Bathrooms</span>
                  <span className="text-sm font-bold text-slate-800">{selectedProperty.bathrooms} Baths</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Living Area</span>
                  <span className="text-sm font-bold text-slate-800">{selectedProperty.squareFeet?.toLocaleString()} sqft</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Year Built</span>
                  <span className="text-sm font-bold text-slate-800">{selectedProperty.yearBuilt || "N/A"}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-slate-900 text-xs mb-1">Architecture & Overview</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProperty.description}</p>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold text-slate-900 text-xs mb-1">Location</h4>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} - {selectedProperty.zipCode}, {selectedProperty.country || "India"}
                </p>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => deleteProperty(selectedProperty.id)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  title="Permanently Delete Property Listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    openModal("deal");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Create Deal for Listing
                </button>
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    openModal("showing");
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-semibold transition"
                >
                  Schedule Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
