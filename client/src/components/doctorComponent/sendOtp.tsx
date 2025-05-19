"use client";
import { sendOtp } from "@/lib/api/doctor/doctor";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image"
import { auth, googlePprovider, signInWithPopup } from "@/lib/firebase"; 
import { User } from "firebase/auth";
import { googleAuth} from "@/lib/api/doctor/doctor";
import { MouseEventHandler } from "react";

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
      const response = await sendOtp(email);
      if (response.status === 200) {
        toast.success("Otp sent to your email");
        router.push("/doctor/verify_otp");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || "Doctor is not registered or approved by admin")
    } finally {
      setLoading(false);
    }
  };

  const googleSign = async () => {
    try {
      const result = await signInWithPopup(auth, googlePprovider);
      const user: User = result.user;

      const { email } = user;

      const response = await googleAuth(email);
      if (response) {
        toast.success("Otp sent to your email");
        router.push("/doctor/verify_otp");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Doctor is not registered or approved by admin")
    }
  };

  const handleGoogleSignInClick: MouseEventHandler<HTMLButtonElement> = () => {
    googleSign();
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

         {/* Divider */}
         <div className="my-6 flex items-center">
          <hr className="w-full border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">or</span>
          <hr className="w-full border-gray-300" />
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition"
          onClick={handleGoogleSignInClick}
        >
          <Image
            src="/google.png" 
            alt="Google"
            width={20}
            height={20}
            className="mr-2"
          />
          Continue with Google
        </button>

        <button className="w-full bg-teal-600 text-white p-3 mt-6 rounded-lg font-semibold hover:bg-teal-700" onClick={handleSend}>
          {loading ? "Sending..." : "Send"} 
        </button>
      </div>
    </div>
  );
}
