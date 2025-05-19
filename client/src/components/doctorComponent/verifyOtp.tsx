"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { resendOtp, verifyOtp } from "@/lib/api/doctor/doctor";
import { toast } from "sonner";

export default function DoctorOTPVerification() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(59);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  let router = useRouter();
  const email = typeof window !== "undefined" ? localStorage.getItem("email") || "" : "";

  // Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendDisabled(false);
    }
  }, [timer]);

 
  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOtp(email, otp);
      setMessage("OTP Verified Successfully!");
      let id=localStorage.getItem("doctorId")
      if(response.status === 200){       
      router.push(`/doctor/${id}/dashboard`);
      toast.success("Enter to doctor dashboard")
      }
 
    } catch (err: any) {
      toast.error(err?.response?.data?.message)
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{

  },[router])

  
  const handleResend = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("No email found, please restart the process");
      return;
    }

    try {
      const response = await resendOtp(email);
      setTimer(59);
      setResendDisabled(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex justify-center items-center mt-20 bg-white">
      <div className="bg-white p-8 rounded-2xl border-t-2 border-gray-300 shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900">Doctor OTP Verification</h2>
        <p className="text-gray-600 mt-2">Check your email for an OTP.</p>

        {message && <p className="mt-2 text-green-600">{message}</p>}
        {error && <p className="mt-2 text-red-600">{error}</p>}

        <div className="mt-6">
          <label className="block text-gray-700 text-sm mb-2">Enter Your OTP</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <span className="bg-gray-200 text-gray-700 px-4 py-1 rounded-md text-sm">
            {`00:${timer < 10 ? `0${timer}` : timer}`}
          </span>
        </div>

        <button
          className={`mt-2 text-teal-600 text-sm font-medium ${resendDisabled ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
          disabled={resendDisabled}
          onClick={handleResend}
        >
          Resend OTP
        </button>
        <button
          className="w-full bg-teal-600 text-white py-2 mt-6 rounded-lg hover:bg-teal-700 transition"
          onClick={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Login"}
        </button>

        <p className="text-xs text-gray-600 mt-4">
          By verifying, you agree with our {" "}
          <Link href="#" className="text-blue-600 font-semibold hover:underline">
            Terms and Conditions
          </Link>{" "}
          and {" "}
          <Link href="#" className="text-blue-600 font-semibold hover:underline">
            Privacy Statement
          </Link>.
        </p>
      </div>
    </div>
  );
}