"use client"

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { IExpert, ExpertFilters } from "@/types/expert";

function capitalize(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";
}
function truncate(str: string, n: number) {
  return str && str.length > n ? str.slice(0, n - 1) + "..." : str;
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<IExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<any | null>(null);
  const [filters, setFilters] = useState<ExpertFilters>({
    specialization: "all",
    location: "all",
    search: "",
    sessionType: "all",
    clientDemographic: "all",
  });
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [sessionTypes, setSessionTypes] = useState<string[]>([]);
  const [clientDemographics, setClientDemographics] = useState<string[]>([]);

  // Fetch filter options
  useEffect(() => {
    fetch("/api/experts", { method: "OPTIONS" })
      .then(res => res.json())
      .then(data => {
        setSpecializations(data.specializations || []);
        setLocations(data.locations || []);
        setSessionTypes(data.sessionTypes || []);
        setClientDemographics(data.clientDemographics || []);
      });
  }, []);

  // Fetch experts with filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.specialization && filters.specialization !== "all") params.append("specialization", filters.specialization);
    if (filters.location && filters.location !== "all") params.append("location", filters.location);
    if (filters.search) params.append("search", filters.search);
    if (filters.sessionType && filters.sessionType !== "all") params.append("sessionType", filters.sessionType);
    if (filters.clientDemographic && filters.clientDemographic !== "all") params.append("clientDemographic", filters.clientDemographic);

    fetch(`/api/experts?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setExperts(data.experts || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load experts.");
        setLoading(false);
      });
  }, [filters]);

  // Helper to get nested onboarding fields with fallback
  function getExpertField(expert: IExpert, key: string) {
    // Prefer onboarding field, fallback to root
    return expert.onboarding?.[key as keyof typeof expert.onboarding] ?? (expert as any)[key] ?? "";
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-2">Find the best mental health expert</h1>
      <p className="mb-6 text-gray-600">Our experts will help you identify and navigate through your problems</p>
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6 items-center">
          <Select value={filters.specialization} onValueChange={v => setFilters(f => ({ ...f, specialization: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map(s => (
                <SelectItem key={s} value={s}>{capitalize(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.location} onValueChange={v => setFilters(f => ({ ...f, location: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        <Select value={filters.sessionType} onValueChange={v => setFilters(f => ({ ...f, sessionType: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Session Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Session Types</SelectItem>
            {sessionTypes.map(st => (
              <SelectItem key={st} value={st}>{st}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.clientDemographic} onValueChange={v => setFilters(f => ({ ...f, clientDemographic: v }))}>
          <SelectTrigger>
            <SelectValue placeholder="Client Demographics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Client Demographics</SelectItem>
            {clientDemographics.map(cd => (
              <SelectItem key={cd} value={cd}>{cd}</SelectItem>
            ))}
          </SelectContent>
        </Select>
          <Input
            placeholder="Search by name or bio..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        <Button
          className="w-full"
          onClick={() => setFilters({
            specialization: "all",
            location: "all",
            search: "",
            sessionType: "all",
            clientDemographic: "all",
          })}
          variant="outline"
        >
          Clear
        </Button>
      </div>

      {/* Expert Cards */}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="mb-2 text-sm text-gray-500">Showing {experts.length} mental health expert{experts.length !== 1 ? "s" : ""}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500">No experts found.</div>
            ) : (
              experts.map(expert => (
                    <div
                  key={expert._id}
                      className="bg-white border rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col gap-3 p-5 h-full"
                  onClick={() => window.location.href = `/client/experts/${expert._id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                      {expert.profile_img_url ? (
                        <AvatarImage src={expert.profile_img_url} alt={expert.first_name} />
                          ) : (
                            <AvatarFallback className="text-2xl font-bold bg-heyrafiki-green/10 text-heyrafiki-green">
                          {capitalize(expert.first_name?.[0] || "?")}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900">{capitalize(expert.first_name)} {capitalize(expert.last_name)}</div>
                          <div className="text-xs text-gray-500">{getExpertField(expert, "location")}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(getExpertField(expert, "specialties") || []).map((s: string) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 bg-heyrafiki-green/10 text-heyrafiki-green rounded-full font-medium">
                            {capitalize(s)}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-700 mt-2 min-h-[36px]">{truncate(getExpertField(expert, "bio"), 90)}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(getExpertField(expert, "session_types") || []).map((type: string) => (
                          <span key={type} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
} 