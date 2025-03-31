"use client";

import { useState } from "react";
import Link from "next/link";
import { ISignUpData } from "@/type/patient";
import { signUpPatient } from "@/lib/api/patient/auth";
import { useRouter } from "next/navigation";

interface ErrorState {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}



export default function PatientSignup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<ErrorState>({});
  const [loading, setLoading] = useState(false);
  let router=useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let tempError: ErrorState = {};

    if (!formData.username.trim()) {
      tempError.username = "Full name is required";
    } else if (formData.username.length < 4) {
      tempError.username = "Name must be at least 4 characters long!";
    } else if (!/^[A-Za-z\s]+$/.test(formData.username)) {
      tempError.username = "Name can only contain letters and spaces!";
    } else if (/^\s/.test(formData.username)) {
      tempError.username = "Name cannot start with a space!";
    }

    if (!formData.email.trim()) {
      tempError.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      tempError.email = "Invalid email format!";
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!formData.password) {
      tempError.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempError.password = "Password must be at least 6 characters long!";
    } else if (!passwordRegex.test(formData.password)) {
      tempError.password =
        "Password must contain at least one letter, one number, and one special character!";
    }

    if (formData.password !== confirmPassword) {
      tempError.confirmPassword = "Passwords do not match!";
    }

    setError(tempError);
    return Object.keys(tempError).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const signUpData:ISignUpData ={
        name:formData.username,
        email:formData.email,
        password:formData.password,
        confirmPassword,
      }
      let emil=localStorage.setItem("email",formData.email)

      const result=await signUpPatient(signUpData);
      console.log("Signup successfully",result)
      if(result){
        router.push("/verify_email")
      }
    } catch (error:any) {
      console.error(error);
      setError({ email: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10 bg-white">
      <div className="bg-white p-8 rounded-2xl border-t-2 border-gray-300 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">Create Account</h2>
        <p className="text-gray-600 text-center mb-6">Please Create An Account To Login</p>

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Full name</label>
            <input
              type="text"
              name="username"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your full name"
              value={formData.username}
              onChange={handleChange}
            />
            {error.username && <div className="text-red-600">{error.username}</div>}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {error.email && <div className="text-red-600">{error.email}</div>}
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
            {error.password && <div className="text-red-600">{error.password}</div>}
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your password to confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error.confirmPassword && <div className="text-red-600">{error.confirmPassword}</div>}
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
