import { useState, useRef, useEffect } from "react"
import { Plus, Bell, X, ChevronLeft, Trash2 } from "lucide-react"
import SubscriptionUsers from "./subscription-users"
import Slider from "@mui/material/Slider"
import { styled } from "@mui/material/styles"
import apiClient from "../utils/apiClient"
import LoadingModal from "../LoadingModal"

const PurpleSlider = styled(Slider)({
  color: "#6C27FF",
  height: 8,
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#6C27FF",
    border: "2px solid currentColor",
    "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
      boxShadow: "inherit",
    },
    "&:before": {
      display: "none",
    },
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: "#6C27FF",
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
})

interface Plan {
  id: number
  name: string
  price: number
  duration: number
}

// const initialPlans: Plan[] = [
//   { id: 1, name: "Weekly", price: 10, duration: 7 },
//   { id: 2, name: "Monthly", price: 30, duration: 30 },
//   { id: 3, name: "Yearly", price: 300, duration: 365 },
// ]

export default function Subscriptions() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewUsersOpen, setIsViewUsersOpen] = useState(false)
  const [deletePopoverPlan, setDeletePopoverPlan] = useState<Plan | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [newPlan, setNewPlan] = useState({ name: "", price: "", duration: 1 })
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [editDuration, setEditDuration] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const deletePopoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deletePopoverRef.current && !deletePopoverRef.current.contains(event.target as Node)) {
        setDeletePopoverPlan(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchPlans = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/admin/subscription/all")
      if (response.data && Array.isArray(response.data)) {
        const formattedPlans = response.data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          price: plan.amount / 100, // Assuming the amount is in cents
          duration: plan.duration,
        }))
        setPlans(formattedPlans)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (newPlan.name && newPlan.price) {
      setIsLoading(true)
      try {
        const response = await apiClient.post("/admin/subscription/create", {
          name: newPlan.name,
          amount: Math.round(Number(newPlan.price) * 100),
          duration: newPlan.duration,
        })
        if (response.data && response.data.statusCode === 200) {
          await fetchPlans()
          setNewPlan({ name: "", price: "", duration: 1 })
          setIsAddModalOpen(false)
        }
      } catch (error) {
        console.error("Error creating plan:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setEditPrice(plan.price.toString())
    setEditDuration(plan.duration)
    setIsEditModalOpen(true)
  }

  const handleDelete = (plan: Plan) => {
    setDeletePopoverPlan(plan)
  }

  const confirmDelete = async () => {
    if (deletePopoverPlan) {
      setIsLoading(true)
      try {
        const response = await apiClient.delete(`/admin/subscription/delete/${deletePopoverPlan.id}`)
        if (response.data && response.data.statusCode === 200) {
          await fetchPlans()
          setDeletePopoverPlan(null)
        }
      } catch (error) {
        console.error("Error deleting plan:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEditSave = async () => {
    if (editingPlan && editPrice) {
      setIsLoading(true)
      try {
        const response = await apiClient.patch("/admin/subscription/update", {
          plan_id: editingPlan.id,
          amount: Math.round(Number(editPrice) * 100),
          duration: editDuration,
        })
        if (response.data && response.data.statusCode === 200) {
          await fetchPlans()
          setIsEditModalOpen(false)
          setEditingPlan(null)
        }
      } catch (error) {
        console.error("Error updating plan:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleViewUsers = (plan: Plan) => {
    setSelectedPlan(plan)
    setIsViewUsersOpen(true)
  }

  if (isViewUsersOpen && selectedPlan) {
    return (
      <SubscriptionUsers
        planName={selectedPlan.name}
        onBack={() => {
          setIsViewUsersOpen(false)
          setSelectedPlan(null)
        }}
      />
    )
  }

  return (
    <div className="p-6 min-h-screen w-full component-border">
      {/* Add Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <span className="text-lg">Add plan</span>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Plan name</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C27FF] text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Price</label>
                <input
                  type="number"
                  value={newPlan.price}
                  onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C27FF] text-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Duration</label>
                <div className="flex items-center gap-4">
                  <PurpleSlider
                    value={newPlan.duration}
                    onChange={(_, value) => setNewPlan({ ...newPlan, duration: value as number })}
                    min={1}
                    max={180}
                    step={1}
                    valueLabelDisplay="auto"
                    className="flex-1"
                  />
                  <div className="border rounded-lg p-2 min-w-[4.5rem] text-center">
                    <span className="text-sm text-gray-600 font-bold">{newPlan.duration} Days</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-[#6C27FF] text-white py-2 rounded-lg hover:bg-[#5820CC] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <span className="text-lg">Edit Subscription</span>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Price</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C27FF] text-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Duration</label>
                <div className="flex items-center gap-4">
                  <PurpleSlider
                    value={editDuration}
                    onChange={(_, value) => setEditDuration(value as number)}
                    min={1}
                    max={180}
                    step={1}
                    valueLabelDisplay="auto"
                    className="flex-1"
                  />
                  <div className="border rounded-lg p-2 min-w-[4.5rem] text-center">
                    <span className="text-sm text-gray-600 font-bold">{editDuration} Days</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleEditSave}
                className="w-full bg-[#6C27FF] text-white py-2 rounded-lg hover:bg-[#5820CC] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6C27FF] px-4 py-2 text-white hover:bg-[#5820CC] transition-colors"
          >
            <span>Add plan</span>
            <Plus size={20} />
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-gray-900">{plan.name}</span>
                <span className="text-sm text-gray-500">
                  ${plan.price} • <span className="font-bold">{plan.duration} days</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => handleDelete(plan)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  {deletePopoverPlan?.id === plan.id && (
                    <div ref={deletePopoverRef} className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                        <button
                          onClick={confirmDelete}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleViewUsers(plan)}
                  className="rounded-lg bg-[#6C27FF]/10 px-4 py-2 text-[#6C27FF] hover:bg-[#6C27FF]/20 transition-colors font-bold"
                >
                  View users
                </button>
                <button
                  onClick={() => handleEdit(plan)}
                  className="rounded-lg bg-[#6C27FF] px-4 py-2 text-white hover:bg-[#5820CC] transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isLoading && <LoadingModal />}
    </div>
  )
}

