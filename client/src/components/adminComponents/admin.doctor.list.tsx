"use client";
import { listDoctor } from "@/lib/api/admin/doctorRegister";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { editDoctor } from "@/lib/api/admin/doctorRegister";
import { toggleApprovelStatus } from "@/lib/api/admin/doctorRegister";

export interface IDoctor {
  _id: string;
  profileImg: string;
  fullName: string;
  email: string;
  specialization: string;
  education: string;
  experience: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  about?: string;
  isApproved: boolean;
  phone: string;
  consultantFee: string;
  availableDays: string[];
  kycCertificate: File | null;
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedDoctor, setEditedDoctor] = useState<IDoctor | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [doctorToBlock, setDoctorToBlock] = useState<IDoctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [DoctorsPerPage] = useState(10);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [selectedSpecialization,setSelectedSpecialization]=useState<string>("")
  const [searchQuery,setSearchQuery]=useState<string>("")
  

  const specializations = [
    "General physician",
    "Gynecologist",
    "Pediatricians",
    "Neurologist",
  ];
  const fetchDoctors = async (page: number = 1) => {
    try {
      const result = await listDoctor(page, DoctorsPerPage, {
        specialization: selectedSpecialization,
      });
      setDoctors(result.doctors);
      setTotalDoctors(result.total);
    } catch (error) {
      toast.error("Error fetching doctors");
    }
  };

  useEffect(() => {
    fetchDoctors(currentPage);
  }, [currentPage,selectedSpecialization,searchQuery]);
  
  // Pagination logic
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(totalDoctors / DoctorsPerPage);

  const openEditModal = (doctor: IDoctor) => {
    setEditedDoctor({ ...doctor }); 
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setEditedDoctor(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field: keyof IDoctor
  ) => {
    if (editedDoctor) {
      setEditedDoctor({
        ...editedDoctor,
        [field]: e.target.value,
      });
    }
  };

  const handleSave = async () => {
    if (!editedDoctor) return;
  
    try {
      const result = await editDoctor(editedDoctor._id, editedDoctor);
  
      if (result.status === 200) {
        setDoctors(doctors.map((doctor) => 
          doctor._id === editedDoctor._id ? { ...doctor, ...editedDoctor } : doctor
        ));
        toast.success("Doctor details updated successfully!");
        closeModal();
      }
    } catch (error) {
      toast.error("Failed to update doctor details.");
    }
  };

  const openBlockModal = (doctor: IDoctor) => {
    setDoctorToBlock(doctor);
    setIsBlockModalOpen(true);
  };

  const closeBlockModal = () => {
    setIsBlockModalOpen(false);
    setDoctorToBlock(null);
  };

  const handleBlock = async () => {
    if (!doctorToBlock) return;
  
    try {
      const result = await toggleApprovelStatus(doctorToBlock._id);
  
      if (result.status === 200) {
        setDoctors(
          doctors.map((doctor) =>
            doctor._id === doctorToBlock._id
              ? { ...doctor, isApproved: !doctor.isApproved } // toggle value
              : doctor
          )
        );
  
        toast.success(
          doctorToBlock.isApproved
            ? "Doctor blocked successfully!"
            : "Doctor unblocked successfully!"
        );
  
        closeBlockModal();
      }
    } catch (error) {
      toast.error("Failed to update doctor status.");
    }
  };
  const filteredDoctors = searchQuery
  ? doctors.filter((doctor) => {
      const query = searchQuery.toLowerCase();
      return (
        doctor.fullName.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.street.toLowerCase().includes(query) ||
        doctor.city.toLowerCase().includes(query) ||
        doctor.state.toLowerCase().includes(query)
      );
    })
  : doctors;
  
  return (
    <div className="overflow-x-auto">

<div className="p-4 flex gap-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name, specialty, city, or state"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm"
        />
        
        {/* Specialization Filter */}
        <select
          value={selectedSpecialization}
          onChange={(e) => setSelectedSpecialization(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm min-w-[200px]"
        >
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-teal-700 text-white rounded">
            <th className="px-4 py-3 text-left">Doctor</th>
            <th className="px-4 py-3 text-left">Specialty</th>
            <th className="px-4 py-3 text-left">Education</th>
            <th className="px-4 py-3 text-left">Experience</th>
            <th className="px-4 py-3 text-left">Address</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.map((doctor) => (
            <tr key={doctor._id} className="border-b border-gray-200">
              <td className="px-4 py-4 flex items-center space-x-4">
                <Image
                  src={doctor.profileImg}
                  alt={doctor.fullName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-semibold">{doctor.fullName}</p>
                  <p className="text-sm text-gray-500">{doctor.email}</p>
                </div>
              </td>
              <td className="px-4 py-4">{doctor.specialization}</td>
              <td className="px-4 py-4">{doctor.education}</td>
              <td className="px-4 py-4">{doctor.experience} years</td>
              <td className="px-4 py-4">
                <p>{doctor.street}</p>
                <p>
                  {doctor.city}, {doctor.pincode}
                </p>
              </td>
              <td className="px-4 py-4 flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    doctor.isApproved ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span className="text-gray-700">
                  {doctor.isApproved ? "Approved" : "Unapproved"}
                </span>
              </td>
              <td className="px-4 py-4 space-x-2">
                <button
                  className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700"
                  onClick={() => openEditModal(doctor)}
                >
                  Edit
                </button>
                <button className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                  onClick={() => openBlockModal(doctor)}
                >
                  {doctor.isApproved  ? "Unapprove" : "Approve"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/*  pagination controls */}
    <div className="flex justify-center mt-4">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 border-t border-b border-gray-300 ${
                currentPage === number 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>

    

{isModalOpen && editedDoctor && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">Edit Doctor Details</h2>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="Full Name"
                value={editedDoctor.fullName}
                onChange={(e) => handleInputChange(e, "fullName")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Experience
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="Experience"
                value={editedDoctor.experience}
                onChange={(e) => handleInputChange(e, "experience")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Consultant Fee
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="Consultant Fee"
                value={editedDoctor.consultantFee}
                onChange={(e) => handleInputChange(e, "consultantFee")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <select
                className="w-full p-2 border rounded mt-1"
                value={editedDoctor.specialization}
                onChange={(e) => handleInputChange(e, "specialization")}
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Education
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="Education"
                value={editedDoctor.education}
                onChange={(e) => handleInputChange(e, "education")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="Phone"
                value={editedDoctor.phone}
                onChange={(e) => handleInputChange(e, "phone")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="City"
                value={editedDoctor.city}
                onChange={(e) => handleInputChange(e, "city")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="State"
                value={editedDoctor.state}
                onChange={(e) => handleInputChange(e, "state")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Street
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="Street"
                value={editedDoctor.street}
                onChange={(e) => handleInputChange(e, "street")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                className="w-full p-2 border rounded mt-1"
                placeholder="Pincode"
                value={editedDoctor.pincode}
                onChange={(e) => handleInputChange(e, "pincode")}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                About
              </label>
              <textarea
                className="w-full p-2 border rounded mt-1"
                placeholder="About"
                value={editedDoctor.about || ""}
                onChange={(e) => handleInputChange(e, "about")}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-teal-600 text-white rounded"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

{isBlockModalOpen && doctorToBlock && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3 shadow-2xl border border-gray-300" >
            <h2 className="text-lg font-semibold mb-4">Block Doctor</h2>
            <p className="text-gray-700 mb-4">
            Are you sure you want to {doctorToBlock.isApproved ? "unapprove" : "approve"} {doctorToBlock.fullName}?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-400 rounded"
                onClick={closeBlockModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleBlock}
              >
                {doctorToBlock.isApproved ? "Unapprove" : "Approve"} 
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

