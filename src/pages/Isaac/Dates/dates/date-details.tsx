"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Bell, Star, AlertCircle } from "lucide-react"
import apiClient from "../../utils/apiClient"
import { useParams } from "react-router-dom"

interface booking {
  id: string
  scheduled_date: string
  scheduled_time: string
  status: string
  pick_up_location: string
  booked_by: {
    first_name: string
    profilePhoto: {
      url: string
    }
  }
  matched_user: {
    first_name: string
    profilePhoto: {
      url: string
    }
  }
  place_reservation: {
    place: {
      name: string
      rating: number
      location: {
        city: string
        state: string
      }
      placePhotos?: Array<{ image_url: string }>
    }
  }
  booked_security?: {
    number_of_escorts: number
    gender_preference: string
    security: {
      organization_name: string
    }
  }
  booked_ride?: {
    car_ride: {
      brand: {
        name: string
      }
      category: {
        name: string
      }
    }
  }
  security_question?: string
}

export default function BookedDetails() {
  const { id } = useParams<{ id: string }>()
  const [booking, setbooking] = useState<booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchbooking = async () => {
      try {
        const response = await apiClient.get(`admin/date/${id}`)
        setbooking(response.data.data)
        setIsLoading(false)
      } catch (err: any) {
        console.error("Error fetching date details:", err)
        if (err.response && err.response.status === 404) {
          setError("Date not found. Please check the ID and try again.")
        } else {
          setError("An error occurred while fetching date details. Please try again later.")
        }
        setIsLoading(false)
      }
    }

    fetchbooking()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center component-border">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-[#F3E8FF] rounded-lg p-4">
            <div className="text-sm font-medium text-[#5E17EB]">Date</div>
            <div className="font-semibold text-gray-900">
              {new Date(booking.scheduled_date).toLocaleDateString()}
            </div>
          </div>
          <div className="flex-1 bg-[#F3E8FF] rounded-lg p-4">
            <div className="text-sm font-medium text-[#5E17EB]">Time</div>
            <div className="font-semibold text-gray-900">{booking.scheduled_time}</div>
          </div>
          <div className="flex-1 bg-[#F3E8FF] rounded-lg p-4">
            <div className="text-sm font-medium text-[#5E17EB]">Status</div>
            <div className="font-semibold text-gray-900">{booking.status}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 flex items-start gap-4">
          <img
            src={booking.place_reservation.place.placePhotos?.[0]?.image_url || "/placeholder.svg"}
            alt={booking.place_reservation.place.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-bold text-lg text-gray-900">{booking.place_reservation.place.name}</h2>
            <p className="text-gray-600 text-sm">
              {booking.place_reservation.place.location.city}, {booking.place_reservation.place.location.state}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < booking.place_reservation.place.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {[booking.booked_by, booking.matched_user].map((participant, index) => (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={participant.profilePhoto.url || "/placeholder.svg"}
                alt={participant.first_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold text-gray-900">{participant.first_name}</span>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="grid gap-4">
                {index === 0 && (
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Pick up location</div>
                    <div className="text-gray-600">{booking.pick_up_location}</div>
                  </div>
                )}

                {booking.booked_ride && (
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Ride</div>
                    <div className="text-gray-600">
                      {booking.booked_ride.car_ride.brand.name} {booking.booked_ride.car_ride.category.name}
                    </div>
                  </div>
                )}

                {booking.booked_security && (
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Security</div>
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-600">
                        {booking.booked_security.number_of_escorts} escorts from{" "}
                        {booking.booked_security.security.organization_name}
                      </span>
                      <span className="bg-[#F3E8FF] text-[#5E17EB] px-3 py-1 rounded-full text-sm font-medium">
                        Preference: {booking.booked_security.gender_preference}
                      </span>
                    </div>
                  </div>
                )}

                {booking.security_question && index === 0 && (
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Security Question</div>
                    <div className="text-gray-600">{booking.security_question}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

