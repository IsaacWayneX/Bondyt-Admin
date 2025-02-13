import { useState, useEffect } from "react"
import { ChevronLeft, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Link } from "react-router-dom"
import { fetchPendingOrders, type FilterCategory } from "./pendingApi"
import type { ProductOrder } from "./types"
import { FilterModal } from "./filter-modal"
import LoadingModal from "../../../LoadingModal"

export default function PendingOrders() {
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all")
  const [expandedAddresses, setExpandedAddresses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true)
        const response = await fetchPendingOrders(selectedFilter)
        setOrders(response.data)
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [selectedFilter])

  const toggleAddress = (orderId: string) => {
    setExpandedAddresses((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const handleFilterSelect = (filter: FilterCategory) => {
    setSelectedFilter(filter)
  }

  return (
    <div className="min-h-screen bg-white p-4 component-border">
      {/* Header */}
      <div className="bg-white mb-6">
        <div className="flex items-center justify-between px-4 py-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Link to="/admin/store">
              <ChevronLeft className="w-8 h-8 text-gray-600" />
            </Link>
          </button>
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
          <div className="relative">
            <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter className="w-6 h-6 text-gray-600" />
            </button>
            <FilterModal
              isOpen={filterOpen}
              onClose={() => setFilterOpen(false)}
              selectedFilter={selectedFilter}
              onFilterSelect={handleFilterSelect}
            />
          </div>
        </div>

        {/* Table Header */}
        <div className=" py-4 ">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-200 text-sm font-medium text-gray-600 mx-4 mb-4">
          <div className="col-span-5">Product details</div>
          <div className="col-span-3">Sender/Note</div>
          <div className="col-span-3">Receiver's Address</div>
          <div className="col-span-1">Status</div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white overflow-hidden">
        {isLoading ? (
          <LoadingModal />
        ) : error ? (
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl font-bold text-gray-700">📭 There are no pending orders to show</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <div
              key={order.id}
              className={`grid grid-cols-12 gap-6 p-6 ${index !== 0 ? "border-t border-gray-200" : ""}`}
            >
              {/* Product Details */}
              <div className="col-span-5 flex gap-6 component-border">
                <div className="space-y-2 w-40 flex-shrink-0">
                  <div className="aspect-[4/3] relative rounded-md overflow-hidden bg-gray-100">
                    <img
                      src={order.product.product_photos[0]?.url || "/placeholder.svg"}
                      alt={order.product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-1">
                    {order.product.product_photos.slice(0, 3).map((photo, index) => (
                      <div key={photo.id} className="w-12 h-9 relative rounded overflow-hidden bg-gray-100">
                        <img
                          src={photo.url || "/placeholder.svg"}
                          alt={`${order.product.name} view ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 flex-grow">
                  <h3 className="font-medium text-gray-900 truncate">
                    {order.product.name}
                    {order.product.store_id && (
                      <span className="ml-2 text-sm text-gray-500">MER-{order.product.store_id}</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{order.product.colors[0]}</p>
                  <div className="font-medium text-gray-900">
                    ${Number.parseFloat(order.product.price).toLocaleString()}
                  </div>
                  <div className="inline-flex px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-600 whitespace-nowrap">
                    {order.order.payment_status ?? "Unknown" }
                  </div>
                </div>
              </div>

              {/* Sender Note */}
              <div className="col-span-3 space-y-2">
                <span className="inline-flex px-3 py-1 rounded-md text-xs bg-[#5E17EB] text-white">
                  {order.sender.first_name}
                </span>
                <div className="p-3 bg-gray-50 rounded-md text-xs text-gray-600">{order.message || "No message"}</div>
              </div>

              {/* Address */}
              <div className="col-span-3 space-y-2">
                <div className="text-xs text-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium mb-1">Address</p>
                      <p>{`${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.country}`}</p>
                      {expandedAddresses.includes(order.id) && (
                        <>
                          <p className="mt-2 font-medium">Name</p>
                          <p>{order.recipient.first_name}</p>
                          <p className="mt-2 font-medium">Location</p>
                          <p>{`${order.recipient.userLocation.city}, ${order.recipient.userLocation.state}`}</p>
                        </>
                      )}
                    </div>
                    <button onClick={() => toggleAddress(order.id)} className="text-purple-600 flex items-center">
                      {expandedAddresses.includes(order.id) ? (
                        <>
                          Less
                          <ChevronUp className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          More
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <span className="inline-flex px-3 py-1 rounded-md text-xs bg-[#5E17EB] text-white">
                  {order.recipient.first_name}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1">
                <span className="inline-flex px-3 py-1 rounded-md text-xs bg-yellow-100 text-yellow-600">
                  {order.recipient_action_status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  )
}

