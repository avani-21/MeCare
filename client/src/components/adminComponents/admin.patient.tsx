"use client";
import { getPatients } from "@/lib/api/admin/doctorRegister";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IPatient } from "@/type/patient";

const PatientTable = () => {
  const [patientData, setPatientData] = useState<IPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery,setSearchQuery]=useState<string>("")
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);

  let fetchPatient = async () => {
    setLoading(true);
    setError(null); 

    try {
      let response = await getPatients();
      console.log("patient", response);
      if(response){
        toast.success("Patient data fetched successfully")
      }
      setPatientData(response.patients);
      setTotalPatients(response.total)
      
    } catch (error: any) {
      setError(error.message); 
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, []);

  if (loading) {
    return <p>Loading patients...</p>; 
  }

  if (error) {
    return <p>Error: {error}</p>; 
  }

    // Pagination logic
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(totalPatients / patientsPerPage);

 

  const filteredPatient= searchQuery ? patientData.filter((patient)=>{
    let query=searchQuery.toLowerCase()
    return(
      patient?.name?.toLowerCase().includes(query)
    )
  }):patientData;

  return ( 
   <>

    
<div className="p-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm"
        />
      </div>

    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      <thead>
        <tr className="bg-teal-700 text-white">
          <th className="px-4 py-3 text-left">Patient</th>
          <th className="px-4 py-3 text-left">Email</th>
          {/* <th className="px-4 py-3 text-left">Phone</th> */}
          {/* <th className="px-4 py-3 text-left">Address</th> */}
          {/* <th className="px-4 py-3 text-left">Age</th> */}
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredPatient?.map((patient) => (
          <tr key={patient._id} className="border-b border-gray-200">
            <td className="px-4 py-4 flex items-center space-x-4">
              <Image
                src={patient.profileImage || "/placeholder-profile.png"}
                alt={patient.name || "Unknown"}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">{patient.name || "N/A"}</p>
              </div>
            </td>
            <td className="px-4 py-4">{patient.email || "N/A"}</td>
            {/* <td className="px-4 py-4">{patient.phone || "N/A"}</td> */}
            {/* <td className="px-4 py-4">
              <p>{patient.street || "N/A"}</p>
              <p>
                {patient.city || "N/A"}, {patient.pincode || "N/A"}
              </p>
            </td> */}
            {/* <td className="px-4 py-4">{patient.age || "N/A"}</td> */}
            <td className="px-4 py-4 flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  patient.isVerified ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span className="text-gray-700">
                {patient.isVerified ? "Verified" : "Unverified"}
              </span>
            </td>
            <td className="px-4 py-4">
              <button
                className="px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-blue-700"
                onClick={() => alert(`Viewing history for ${patient.name}`)}
              >
                View Medical History
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

     
   </>
  );
};

export default PatientTable;