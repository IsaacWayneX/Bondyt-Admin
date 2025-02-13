"use client"

import { useState, useEffect } from "react"
import { Search, ChevronLeft, HourglassIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import apiClient from "../../utils/apiClient"
import LoadingModal from "../../LoadingModal"

// Interfaces
interface User {
  id: string
  first_name: string
  tier: string
  userTrait: Record<string, unknown>
  userLocation: {
    id: string
    city: string
    state: string
  }
}

interface DeclinedDate {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  matched_user_id: string
  received_date: boolean
  sent_date: boolean
  currency: string
  payment_provider: string
  place_reservation_id: string | null
  car_booking_id: string | null
  security_booking_id: string | null
  is_solo: boolean
  security_question: string
  security_answer: string
  scheduled_date: string
  scheduled_time: string
  total_amount: string
  pick_up_location: string
  status: string
  booked_by: User
  matched_user: User
}

export default function DeclinedDates() {
  const navigate = useNavigate()
  const [declinedDates, setDeclinedDates] = useState<DeclinedDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeclinedDates = async () => {
      try {
        const response = await apiClient.get("admin/date/declined")
        console.log("API Response:", response.data)
        setDeclinedDates(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error("Error fetching declined dates:", err)
        setError("An error occurred while fetching declined dates")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeclinedDates()
  }, [])

  const LoadingSkeleton = () => (
    <div className="animate-pulse grid grid-cols-[2fr,1fr,1fr] px-6 py-4 items-center">
      <div className="flex items-center gap-4">
        <div className="bg-gray-300 h-12 w-24 rounded-full"></div>
        <div className="space-y-2">
          <div className="bg-gray-300 h-6 w-24 rounded"></div>
          <div className="bg-gray-300 h-6 w-20 rounded"></div>
        </div>
      </div>
      <div className="bg-gray-300 h-6 w-32 rounded"></div>
      <div className="bg-gray-300 h-8 w-24 rounded-full"></div>
    </div>
  )

  return (
    <>
      {isLoading && <LoadingModal />}
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 component-border">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-8 h-8 text-gray-900" />
            </button>
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 focus:border-[#5E17EB] focus:outline-none focus:ring-1 focus:ring-[#5E17EB]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white overflow-hidden min-h-screen">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold text-gray-900">Declined dates</h2>
          </div>

          {isLoading ? (
            <div className="divide-y">
              <div className="grid grid-cols-[2fr,1fr,1fr] px-6 py-4 border-b bg-gray-50">
                <div className="text-sm font-bold text-gray-900">Users</div>
                <div className="text-sm font-bold text-gray-900">Location</div>
                <div className="text-sm font-bold text-gray-900">Action</div>
              </div>
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 text-lg font-semibold">Error: {error}</div>
          ) : declinedDates.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <HourglassIcon className="h-24 w-24 text-[#5E17EB] opacity-50 mb-4" />
              <p className="text-2xl font-semibold text-gray-600">No declined dates</p>
            </div>
          ) : (
            <div className="divide-y">
              <div className="grid grid-cols-[2fr,1fr,1fr] px-6 py-4 border-b bg-gray-50">
                <div className="text-sm font-bold text-gray-900">Users</div>
                <div className="text-sm font-bold text-gray-900">Location</div>
                <div className="text-sm font-bold text-gray-900">Action</div>
              </div>
              {declinedDates.map((date) => (
                <div key={date.id} className="grid grid-cols-[2fr,1fr,1fr] px-6 py-4 items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${date.booked_by.first_name}`}
                        alt={date.booked_by.first_name}
                        className="h-12 w-12 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${date.matched_user.first_name}`}
                        alt={date.matched_user.first_name}
                        className="h-12 w-12 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-3 py-1.5">
                        <span className="text-sm font-semibold text-[#5E17EB]">{date.booked_by.first_name}</span>
                        <span className="text-[#5E17EB] text-base">★</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-3 py-1.5">
                        <span className="text-sm font-semibold text-[#5E17EB]">{date.matched_user.first_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{date.pick_up_location}</div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700">
                      Declined
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

