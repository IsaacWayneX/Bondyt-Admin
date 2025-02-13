"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Bell } from "lucide-react"
import apiClient from "../utils/apiClient"
import LoadingModal from "../LoadingModal"
import { Snackbar, Alert } from "@mui/material"

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

interface BondedMatch {
  id: string
  created_at: string
  updated_at: string
  user_one_id: string
  user_two_id: string
  notify: boolean
  user_sent_match: User
  user_accept_match: User
}

interface NotificationState {
  open: boolean
  message: string
  severity: "success" | "error"
}

export default function Bonded() {
  const [bondedMatches, setBondedMatches] = useState<BondedMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  })

  useEffect(() => {
    fetchBondedUsers()
  }, [])

  const fetchBondedUsers = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get("/admin/date/bonded")
      setBondedMatches(response.data.data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch bonded users")
      console.error("Error fetching bonded users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotify = async (userOneId: string, userTwoId: string) => {
    try {
      setIsLoading(true)
      await apiClient.post("/admin/date/notify", {
        user_one_id: userOneId,
        user_two_id: userTwoId,
      })
      // Refresh the list after notification
      await fetchBondedUsers()
      setNotification({
        open: true,
        message: "Users notified successfully",
        severity: "success",
      })
    } catch (err) {
      console.error("Error notifying users:", err)
      setNotification({
        open: true,
        message: "Failed to notify users",
        severity: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    setNotification({ ...notification, open: false })
    event
  }

  if (error) {
    return <div className="w-full min-h-screen bg-white flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="w-full min-h-screen bg-white component-border">
      {isLoading && <LoadingModal />}
      <div className="p-6">
        {/* Search Header */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full max-w-[200px] rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E17EB]"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <Bell className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-gray-150 border rounded-lg">
              <tr className="text-left text-sm text-gray-700">
                <th className="px-6 py-4">Users</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {bondedMatches.map((match) => (
                <tr key={match.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden">
                          <img
                            src={`https://ui-avatars.com/api/?name=${match.user_sent_match.first_name}`}
                            alt={match.user_sent_match.first_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden">
                          <img
                            src={`https://ui-avatars.com/api/?name=${match.user_accept_match.first_name}`}
                            alt={match.user_accept_match.first_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-md text-xs bg-[#5E17EB]/30 text-[#5E17EB]">
                          {match.user_sent_match.first_name}
                        </span>
                        <span className="px-2 py-1 rounded-md text-xs bg-[#5E17EB]/30 text-[#5E17EB]">
                          {match.user_accept_match.first_name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">
                    {new Date(match.created_at).toLocaleDateString()} -{" "}
                    {new Date(match.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="px-6 py-2 bg-[#5E17EB] text-white text-sm font-medium rounded-md hover:bg-[#5E17EB]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleNotify(match.user_one_id, match.user_two_id)}
                      disabled={match.notify}
                    >
                      {match.notify ? "Notified" : "Notify"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
    </div>
  )
}

