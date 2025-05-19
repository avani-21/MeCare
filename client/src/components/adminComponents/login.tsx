"use client";
import { adminLogin } from "@/lib/api/admin/login";
import { IAdminLogin } from "@/type/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
     email: "", 
     password: ""
     });
  const [loading, setLoading] = useState(false);
  let router=useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit=async (e:React.FormEvent)=>{
    setLoading(false)
    e.preventDefault()

    let data:IAdminLogin={
      email:formData.email,
      password:formData.password
    }

    try {
      setLoading(true)
      let result=await adminLogin(data)
     
      if(result.success){
      
        router.push("/admin_dashboard")
      }
    } catch (error:any){
      setLoading(false)
      throw new Error("Error logging in:",error)
    }finally{
      setLoading(false)
    }
  }

   

  return (
    <div className="flex justify-center items-center mt-10 bg-white">
      <div className="bg-white p-8 rounded-2xl border-t-2 border-gray-300 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Admin Login
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Please login to access the admin dashboard
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Admin Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter admin email"
              value={formData.email}
              onChange={handleChange}
            />
     
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
