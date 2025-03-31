"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Google from "../../../public/google.png";
import { useRouter } from "next/navigation";
import { ILogin } from "@/type/patient";
import { login } from "@/lib/api/patient/auth";
import {auth,googlePprovider,signInWithPopup} from "@/lib/firebase"
import {User} from "firebase/auth"
import { toast } from "sonner";
import { googleSignIn } from "@/lib/api/patient/auth";
import {IGoogleAuth} from "@/type/patient"

interface ErrorState {
  email?: string;
  password?: string;
}

export default function PatientLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<ErrorState>({}); 
  const [loading, setLoading] = useState(false);

  let router=useRouter()

  const validateForm = () => {
    let tempError: ErrorState = {};

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
      tempError.password = "Password must be at least 6 characters long";
    } else if (!passwordRegex.test(formData.password)) {
      tempError.password =
        "Password must contain at least one letter, one number, and one special character!";
    }

    setError(tempError);
    return Object.keys(tempError).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    let data:ILogin={
      email:formData.email,
      password:formData.password
    }
    try {
  let result=await login(data)
  if(result){
    router.push("/home")
  } 
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  const googleauthSignIn=async ()=>{
    try{
      const result=await signInWithPopup(auth,googlePprovider);
      console.log(result);
      
      const user:User=result.user

      const { email } = user;
      const googleId = user.uid;

      interface Data{
        googleId:string,
        email:string|null
      }
      const data:Data={googleId,email}
      

      const response=await googleSignIn(data);
      if(response){
        toast.success("Loged in successfully")
        router.push("/")
      }

    }catch(error:any){
      console.log(error.message)

    }
  }

  return (
    <div className="flex justify-center items-center mt-10 bg-white">
      <div className="bg-white p-8 rounded-2xl border-t-2 border-gray-300 shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Login
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Please login to book appointment
        </p>

        <form onSubmit={handleSubmit}>
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
            {error.password && (
              <div className="text-red-600">{error.password}</div>
            )}
            <Link
              href="/forgot-password"
              className="text-teal-600 text-sm float-left mt-2 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">or</span>
          <hr className="w-full border-gray-300" />
        </div>

        {/* Google Login */}
        <button
  type="button"  // Prevents form submission on click
  className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition"
  onClick={googleauthSignIn}
>
  <Image
    src={Google}
    alt="Google"
    width={20}
    height={20}
    className="mr-2"
  />
  Continue with Google
</button>

        {/* Signup Link */}
        <p className="text-center text-sm mt-4 text-gray-600">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up here
          </Link>
        </p>
      </div>
    </div>
  );
}
