"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Trash2, X, Upload, Star, Plus, MapPin } from "lucide-react"
import LocationSelectionModal from "../locationselection"
import apiClient from "../utils/apiClient"
import LoadingModal from "../LoadingModal"

interface Place {
  id: string
  name: string
  location: {
    city: string
    state: string
    country: string
    latitude: number
    longitude: number
  }
  category_id: string
  rating: number
  opening_hour: string
  closing_hour: string
  weekend_opening_hour: string
  weekend_closing_hour: string
  menu_url?: string
  about: string
  banner?: string
}

interface Category {
  id: string
  name: string
}

interface SelectedLocation {
  city: string
  state: string
  country: string
  latitude: string
  longitude: string
}

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showActionModal, setShowActionModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState<{ show: boolean; parent: "add" | "edit" | null }>({
    show: false,
    parent: null,
  })
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [rating, setRating] = useState(0)
  const [bannerFiles, setBannerFiles] = useState<File[]>([])
  const [menuFile, setMenuFile] = useState<File | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    fetchPlaces()
    fetchCategories()
  }, [])

  const fetchPlaces = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/admin/place/all")
      setPlaces(response.data.data)
    } catch (error) {
      console.error("Error fetching places:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/admin/place/all-categories")
      setCategories(response.data.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openActionModal = (place: Place) => {
    setSelectedPlace(place)
    setShowActionModal(true)
  }

  const handleAddPlace = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newFormData = new FormData(e.currentTarget)
    setFormData(newFormData)
    setShowAddModal(false)
    setShowDetailsModal(true)
  }

  const handleDetailsSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])
    const detailsData = new FormData(e.currentTarget)

    const requestData = new FormData()
    if (formData) {
      for (const [key, value] of formData.entries()) {
        requestData.append(key, value)
      }
    }
    for (const [key, value] of detailsData.entries()) {
      requestData.append(key, value)
    }
    requestData.append("rating", rating.toString())

    if (selectedLocation) {
      requestData.append("city", selectedLocation.city)
      requestData.append("state", selectedLocation.state)
      requestData.append("country", selectedLocation.country)
      requestData.append("latitude", selectedLocation.latitude)
      requestData.append("longitude", selectedLocation.longitude)
    }

    bannerFiles.forEach((file, index) => {
      requestData.append(`banner${index + 1}`, file)
    })

    if (menuFile) {
      requestData.append("menu_image", menuFile)
    }

    try {
      if (isEditMode && selectedPlace) {
        await apiClient.post("/admin/place/edit", requestData)
      } else {
        await apiClient.post("/admin/place/new", requestData)
      }
      fetchPlaces()
      setShowDetailsModal(false)
      resetForm()
    } catch (error: any) {
      console.error("Error saving place:", error)
      if (error.response && error.response.data && error.response.data.message) {
        setErrors(
          Array.isArray(error.response.data.message) ? error.response.data.message : [error.response.data.message],
        )
      } else {
        setErrors(["An unexpected error occurred. Please try again."])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const categoryData = new FormData(e.currentTarget)

    try {
      await apiClient.post("/admin/place/new-category", {
        name: categoryData.get("category"),
      })
      fetchCategories()
      setShowCategoryModal({ show: false, parent: null })
    } catch (error) {
      console.error("Error creating category:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePlace = async (id: string) => {
    setIsLoading(true)
    try {
      await apiClient.delete(`/admin/place/delete/${id}`)
      fetchPlaces()
      setShowActionModal(false)
    } catch (error) {
      console.error("Error deleting place:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setRating(0)
    setBannerFiles([])
    setMenuFile(null)
    setIsEditMode(false)
    setFormData(null)
    setSelectedLocation(null)
    setBannerPreviews([])
    setErrors([])
  }

  const handleMenuUpload = (file: File) => {
    setMenuFile(file)
  }

  const handleLocationSelect = (location: SelectedLocation) => {
    setSelectedLocation(location)
    setShowLocationModal(false)
  }

  const handleBannerUpload = (file: File, index: number) => {
    const newFiles = [...bannerFiles]
    newFiles[index] = file
    setBannerFiles(newFiles)

    const reader = new FileReader()
    reader.onloadend = () => {
      const newPreviews = [...bannerPreviews]
      newPreviews[index] = reader.result as string
      setBannerPreviews(newPreviews)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white min-h-screen w-full">
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-6 bg-[#5E17EB] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4B11C2]"
      >
        <span>Add Place</span>
        <span>+</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {places.map((place) => (
          <div key={place.id} className="bg-white rounded-lg overflow-hidden">
            <div className="flex h-32">
              <div className="w-1/2 rounded-lg overflow-hidden">
                <img
                  src={place.banner || "/placeholder.svg"}
                  alt={place.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="w-1/2 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">{place.name}</h3>
                  <p className="text-gray-700 text-sm">
                    {place.location.city}, {place.location.state}
                  </p>
                </div>
                <button onClick={() => openActionModal(place)} className="self-end p-2 hover:bg-gray-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showActionModal && selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Place Actions</h3>
              <button onClick={() => setShowActionModal(false)}>
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsEditMode(true)
                  setSelectedPlace(selectedPlace)
                  setShowAddModal(true)
                  setShowActionModal(false)
                }}
                className="w-full py-2 text-left hover:bg-gray-100 rounded px-2 text-gray-800"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeletePlace(selectedPlace.id)}
                className="w-full py-2 text-left text-red-600 hover:bg-gray-100 rounded px-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{isEditMode ? "Edit Place" : "Add New Place"}</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleAddPlace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    name="category_id"
                    required
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800 appearance-none"
                    onChange={(e) => {
                      if (e.target.value === "new") {
                        e.preventDefault()
                        setShowCategoryModal({ show: true, parent: isEditMode ? "edit" : "add" })
                      }
                    }}
                    defaultValue={selectedPlace?.category_id || ""}
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                    <option value="new" className="text-[#5E17EB]">
                      + Create new category
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                  defaultValue={selectedPlace?.name || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <input
                    name="location"
                    type="text"
                    required
                    className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                    value={
                      selectedLocation
                        ? `${selectedLocation.city}, ${selectedLocation.state}, ${selectedLocation.country}`
                        : selectedPlace
                          ? `${selectedPlace.location.city}, ${selectedPlace.location.state}, ${selectedPlace.location.country}`
                          : ""
                    }
                    readOnly
                    onClick={() => setShowLocationModal(true)}
                  />
                  <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place Description</label>
                <textarea
                  name="about"
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                  rows={3}
                  defaultValue={selectedPlace?.about || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-gray-400 hover:text-[#5E17EB]"
                    >
                      {star <= (rating || selectedPlace?.rating || 0) ? (
                        <Star className="h-6 w-6 fill-[#5E17EB] text-[#5E17EB]" />
                      ) : (
                        <Star className="h-6 w-6" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full bg-[#5E17EB] text-white py-2 rounded-lg hover:bg-[#4B11C2]">
                Next
              </button>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setShowDetailsModal(false)}>
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer mb-4 relative"
                onClick={() => document.getElementById("main-banner-upload")?.click()}
              >
                <input
                  id="main-banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleBannerUpload(file, 0)
                  }}
                />
                {bannerPreviews[0] ? (
                  <img
                    src={bannerPreviews[0] || "/placeholder.svg"}
                    alt="Main banner preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">Click to upload main banner</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {[1, 2].map((index) => (
                  <div
                    key={index}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer aspect-square flex items-center justify-center relative"
                    onClick={() => document.getElementById(`banner-upload-${index}`)?.click()}
                  >
                    <input
                      id={`banner-upload-${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleBannerUpload(file, index)
                      }}
                    />
                    {bannerPreviews[index] ? (
                      <img
                        src={bannerPreviews[index] || "/placeholder.svg"}
                        alt={`Banner ${index} preview`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer aspect-square flex items-center justify-center"
                  onClick={() => document.getElementById("banner-upload-3")?.click()}
                >
                  <input
                    id="banner-upload-3"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleBannerUpload(file, 2)
                    }}
                  />
                  {bannerPreviews[2] ? (
                    <img
                      src={bannerPreviews[2] || "/placeholder.svg"}
                      alt="Banner 3 preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Plus className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    name="opening_hour"
                    type="text"
                    required
                    placeholder="Opening hours"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                    defaultValue={selectedPlace?.opening_hour || ""}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#5E17EB]/10">
                    <span className="text-xs font-medium text-[#5E17EB]">Week days</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    name="closing_hour"
                    type="text"
                    required
                    placeholder="Closing hours"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                    defaultValue={selectedPlace?.closing_hour || ""}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#5E17EB]/10">
                    <span className="text-xs font-medium text-[#5E17EB]">Week days</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    name="weekend_opening_hour"
                    type="text"
                    required
                    placeholder="Weekend opening hours"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                    defaultValue={selectedPlace?.weekend_opening_hour || ""}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#5E17EB]/10">
                    <span className="text-xs font-medium text-[#5E17EB]">Weekends</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    name="weekend_closing_hour"
                    type="text"
                    required
                    placeholder="Weekend closing hours"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                    defaultValue={selectedPlace?.weekend_closing_hour || ""}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-[#5E17EB]/10">
                    <span className="text-xs font-medium text-[#5E17EB]">Weekends</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Menu PDF</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-1 text-center cursor-pointer flex items-center justify-center h-20 relative overflow-hidden"
                    onClick={() => document.getElementById("menu-upload")?.click()}
                  >
                    <input
                      id="menu-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleMenuUpload(file)
                      }}
                    />
                    {menuFile ? (
                      <div className="absolute inset-0 bg-red-600 flex items-center justify-center">
                        <p className="text-white font-bold text-sm">PDF</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-3 w-3 text-gray-400" />
                        <p className="mt-1 text-xs text-gray-500">Upload menu PDF</p>
                      </div>
                    )}
                  </div>
                  {menuFile && <p className="text-xs text-gray-500 truncate">{menuFile.name}</p>}
                </div>
              </div>

              {errors.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Error:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button type="submit" className="w-full bg-[#5E17EB] text-white py-3 rounded-lg hover:bg-[#4B11C2]">
                {isEditMode ? "Update" : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal.show && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 60 }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Category</h3>
              <button onClick={() => setShowCategoryModal({ show: false, parent: null })}>
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  name="category"
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E17EB] text-gray-800"
                />
              </div>
              <button type="submit" className="w-full bg-[#5E17EB] text-white py-2 rounded-lg hover:bg-[#4B11C2]">
                Create
              </button>
            </form>
          </div>
        </div>
      )}
      <LocationSelectionModal
        isVisible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={handleLocationSelect}
      />
      {isLoading && <LoadingModal />}
    </div>
  )
}

