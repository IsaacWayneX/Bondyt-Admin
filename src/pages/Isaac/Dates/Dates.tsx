"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Bell, Settings, HourglassIcon } from "lucide-react"
import { Link } from "react-router-dom"
import DatesHeader from "./dates-header"
import LoadingModal from "../LoadingModal"
import apiClient from "../utils/apiClient"
import "../border.css"

interface Booking {
  id: number
  pick_up_location: string
  booked_by: {
    first_name: string
    profilePhoto: {
      url: string | null
    }
  }
  matched_user: {
    first_name: string
    profilePhoto: {
      url: string | null
    }
  }
  security_booking_id: number | null
  car_booking_id: number | null
}

export default function Dates() {
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchPendingDates = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: Booking[] }>("admin/date/pending")
      console.log("API Response:", response.data)
      if (Array.isArray(response.data.data)) {
        setBookings(response.data.data)
      } else {
        console.error("Unexpected data structure:", response.data)
        setError("Unexpected data structure received from the server.")
      }
    } catch (err) {
      console.error("Error fetching pending dates:", err)
      setError("Failed to load pending dates. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingDates()
  }, [fetchPendingDates])

  console.log("Current bookings state:", bookings)

  return (
    <>
      {isLoading && <LoadingModal />}
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 component-border">
        <div className="mb-8 flex items-center justify-between">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm text-gray-900 focus:border-[#5E17EB] focus:outline-none focus:ring-1 focus:ring-[#5E17EB]"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Link to="cars">
              <button className="rounded-full p-2 hover:bg-gray-100">
                <Settings className="h-6 w-6 text-gray-800" />
              </button>
            </Link>
            <button className="rounded-full p-2 hover:bg-gray-100">
              <Bell className="h-6 w-6 text-gray-800" />
            </button>
          </div>
        </div>

        <DatesHeader />

        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold text-gray-900">Pending dates</h2>
          </div>

          {error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : isLoading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <HourglassIcon className="h-24 w-24 text-[#5E17EB] opacity-50 mb-4" />
              <p className="text-2xl font-semibold text-gray-600">No pending dates</p>
            </div>
          ) : (
            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-start p-6 gap-8">
                  <div className="flex items-center space-x-4 flex-grow">
                    <div className="flex -space-x-2">
                      <img
                        src={booking.booked_by.profilePhoto.url || "/placeholder.svg"}
                        alt={`${booking.booked_by.first_name}'s profile`}
                        className="h-12 w-12 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src={booking.matched_user.profilePhoto.url || "/placeholder.svg"}
                        alt={`${booking.matched_user.first_name}'s profile`}
                        className="h-12 w-12 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{booking.pick_up_location}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 text-sm font-semibold text-[#5E17EB]">
                          {booking.booked_by.first_name}
                        </span>
                        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 text-sm font-semibold text-[#5E17EB]">
                          {booking.matched_user.first_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 flex-grow">
                    <div>
                      <div className="mb-1 text-sm font-bold text-gray-900">Security details</div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 text-sm font-semibold text-[#5E17EB]">
                          {booking.security_booking_id ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-sm font-bold text-gray-900">Logistics</div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 text-sm font-semibold text-[#5E17EB]">
                          {booking.car_booking_id ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Link
                      to={`${booking.id}`}
                      className="rounded-md bg-[#5E17EB] px-6 py-2 text-sm font-bold text-white hover:bg-[#4C11D1] transition-colors"
                    >
                      View details
                    </Link>
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

