"use client";
import { sendOtp } from "@/lib/api/patient/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";



export default function Sendotp() {
  let router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    setError("");
    if (!email) {
      setError("Email is required");
      return;
    }
    localStorage.setItem("email", email);

    try {
      setLoading(true);
      const response = await sendOtp(email)
    
      if (response.status === 200) {
        toast.success("Otp sent to your email");
        router.push("/verify_otp");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message )
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className="flex flex-col items-center justify-start h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center mt-20">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">VERIFICATION</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your registered email</p>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="relative w-full mb-4">
          <input
            type="email"
            placeholder="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="w-full bg-teal-600 text-white p-3 mt-6 rounded-lg font-semibold hover:bg-teal-700" onClick={handleSend}>
          {loading ? "Sending..." : "Send"} 
        </button>
      </div>
    </div>
  );
}
