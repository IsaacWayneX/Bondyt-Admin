import { useState } from "react"
import Events from "../Events/Events"
import Places1 from "./Places1"
import { Search, Bell } from "lucide-react"

export default function Places() {
  const [activeTab, setActiveTab] = useState("places")

  return (
    <div className="bg-white min-h-screen w-full p-6 component-border">
      {/* Header with search */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-4 w-4" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="rounded-full p-2 hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
      </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-6 border-b">
          <button
            onClick={() => setActiveTab("places")}
            className={`pb-2 text-xl font-medium ${
              activeTab === "places" ? "border-b-2 border-[#5E17EB] text-[#5E17EB]" : "text-gray-700"
            }`}
          >
            Places
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`pb-2 text-xl font-medium ${
              activeTab === "events" ? "border-b-2 border-[#5E17EB] text-[#5E17EB]" : "text-gray-700"
            }`}
          >
            Events
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "places" ? <Places1 /> : <Events />}
    </div>
  )
}

