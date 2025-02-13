"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Trash2, X, MapPin, Upload } from "lucide-react"
import TicketsModal from "./TicketsModal"
import LocationSelectionEvent from "./LocationSelectionModal"
import apiClient from "../utils/apiClient"
import LoadingModal from "../LoadingModal"

interface Event {
  id: number
  name: string
  location: string
  date: string
  ticket_prices: {
    regular: number
    vip: number
  }
  details: string
  ticket_types: string[]
  banner: string
  time: string
  tickets_available: number
  total_capacity: number
  created_at: string
  updated_at: string
  admin_id: number
  merchant_id: number
}

interface LocationData {
  city: string
  state: string
  country: string
}

interface AttendeeCount {
  event_id: string
  number_of_attendees: string
}

function isTicketPrices(value: any): value is { regular: number; vip: number } {
  return typeof value === "object" && "regular" in value && "vip" in value
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [attendeeCounts, setAttendeeCounts] = useState<AttendeeCount[]>([])
  const [showActionModal, setShowActionModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [showAttendeesModal, setShowAttendeesModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("")
  const [tempEventData, setTempEventData] = useState<
    Partial<Omit<Event, "ticket_prices"> & { ticket_prices: { regular: number; vip: number } }>
  >({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
    fetchAttendeeCounts()
  }, [])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("admin/event/all")
      setEvents(response.data.data)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAttendeeCounts = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("admin/event/all/attendees-count")
      setAttendeeCounts(response.data.data)
    } catch (error) {
      console.error("Error fetching attendee counts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openActionModal = (event: Event) => {
    setSelectedEvent(event)
    setShowActionModal(true)
  }

  const openAttendeesModal = (event: Event) => {
    setSelectedEvent(event)
    setShowAttendeesModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setSelectedLocation(event.location)
    setTempEventData(event)
    setShowEventModal(true)
  }

  const handleEventDetailsSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const eventDetails = {
      name: formData.get("name") as string,
      location: selectedLocation,
      date: formData.get("date") as string,
      ticket_prices: {
        regular: Number(formData.get("regular_price")),
        vip: Number(formData.get("vip_price")),
      },
      details: formData.get("description") as string,
    }
    setTempEventData({ ...tempEventData, ...eventDetails })
    setShowEventModal(false)
    setShowBannerModal(true)
  }

  const handleEventSubmit = async () => {
    setIsLoading(true)
    const formData = new FormData()

    Object.entries(tempEventData).forEach(([key, value]) => {
      if (key === "ticket_prices" && isTicketPrices(value)) {
        formData.append(
          "price",
          JSON.stringify({
            regular: value.regular,
            vip: value.vip,
          }),
        )
      } else if (key !== "banner") {
        // Exclude banner from tempEventData
        formData.append(key, value as string)
      }
    })

    if (bannerFile) {
      formData.append("banner", bannerFile)
    }

    if (editingEvent) {
      formData.append("id", editingEvent.id.toString())
    }

    // Log the payload data
    console.log("Payload data:")
    for (const [key, value] of formData.entries()) {
      if (key === "banner") {
        console.log(key, "File object:", value)
      } else {
        console.log(key, value)
      }
    }

    try {
      const headers = {
        "Content-Type": "multipart/form-data",
      }

      const apiMethod = editingEvent
        ? apiClient.patch("admin/event/edit", formData, { headers })
        : apiClient.post("admin/event/new", formData, { headers })

      const response = await apiMethod

      console.log("API Response:", response)

      await fetchEvents()
      setShowBannerModal(false)
      setEditingEvent(null)
      setSelectedLocation("")
      setBannerFile(null)
      setTempEventData({})
    } catch (error) {
      console.error("Event Submission Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    setIsLoading(true)
    try {
      await apiClient.delete(`admin/event/delete/${eventId}`)
      await fetchEvents()
      setShowActionModal(false)
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (locationData: LocationData) => {
    const { city, country } = locationData
    const formattedLocation = [city, country].filter(Boolean).join(", ")
    setSelectedLocation(formattedLocation)
  }

  return (
    <div className="bg-white min-h-screen w-full">
      {/* Add Event Button */}
      <button
        onClick={() => setShowEventModal(true)}
        className="mb-6 bg-[#5E17EB] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4B11C2]"
      >
        <span>Add Event</span>
        <span>+</span>
      </button>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg overflow-hidden">
            <div className="flex h-32">
              {/* Left: Banner Image */}
              <div className="w-1/3 rounded-lg overflow-hidden">
                <img
                  src={event.banner || "/placeholder.svg"}
                  alt={event.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Middle: Event Details */}
              <div className="w-1/2 p-4 flex flex-col justify-center">
                <h3 className="text-lg font-semibold mb-1 text-gray-900">{event.name}</h3>
                <p className="text-gray-700 text-sm mb-1">{event.location.split(", ").slice(0, 2).join(", ")}</p>
                <p className="text-gray-600 text-sm">{new Date(event.date).toLocaleDateString()}</p>
              </div>

              {/* Right: Actions */}
              <div className="w-1/6 p-4 flex flex-col justify-between items-end">
                <button onClick={() => openActionModal(event)} className="p-2 hover:bg-gray-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => openAttendeesModal(event)}
                  className="bg-[#5E17EB] text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  {attendeeCounts.find((count) => count.event_id === event.id.toString())?.number_of_attendees || "0"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets Modal */}
      {selectedEvent && (
        <TicketsModal
          isOpen={showAttendeesModal}
          onClose={() => setShowAttendeesModal(false)}
          eventId={selectedEvent.id}
          eventTitle={`Attendees for ${selectedEvent.name}`}
        />
      )}

      {/* Action Modal */}
      {showActionModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Event Actions</h3>
              <button onClick={() => setShowActionModal(false)}>
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                className="w-full py-2 text-left hover:bg-gray-100 rounded px-2 text-gray-800"
                onClick={() => {
                  setShowActionModal(false)
                  openEditModal(selectedEvent)
                }}
              >
                Edit
              </button>
              <button
                className="w-full py-2 text-left text-red-600 hover:bg-gray-100 rounded px-2"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{editingEvent ? "Edit Event" : "Add New Event"}</h3>
              <button
                onClick={() => {
                  setShowEventModal(false)
                  setEditingEvent(null)
                  setSelectedLocation("")
                }}
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleEventDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingEvent?.name || ""}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={selectedLocation}
                    readOnly
                    placeholder="Select location"
                    className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800 cursor-pointer"
                    onClick={() => setShowLocationModal(true)}
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={editingEvent?.date ? new Date(editingEvent.date).toISOString().split("T")[0] : ""}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price</label>
                <input
                  name="regular_price"
                  type="number"
                  required
                  defaultValue={editingEvent?.ticket_prices?.regular || ""}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIP Price</label>
                <input
                  name="vip_price"
                  type="number"
                  required
                  defaultValue={editingEvent?.ticket_prices?.vip || ""}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  defaultValue={editingEvent?.details || ""}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                  rows={3}
                />
              </div>
              <button type="submit" className="w-full bg-[#5E17EB] text-white py-2 rounded-lg hover:bg-[#4B11C2]">
                Next
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Banner Upload Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Banner</h3>
              <button onClick={() => setShowBannerModal(false)}>
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                />
              </div>
              {bannerFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Selected file: {bannerFile.name}</p>
                </div>
              )}
              <button
                onClick={handleEventSubmit}
                className="w-full bg-[#5E17EB] text-white py-2 rounded-lg hover:bg-[#4B11C2] flex items-center justify-center gap-2"
              >
                <Upload className="h-5 w-5" />
                <span>Save Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Selection Modal */}
      <LocationSelectionEvent
        isVisible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={handleLocationSelect}
      />
      {isLoading && <LoadingModal />}
    </div>
  )
}

