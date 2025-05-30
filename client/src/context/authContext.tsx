"use client"
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getProfile } from "@/lib/api/patient/patient";
import { AuthContextType, IPatient, ILogin, IGoogleAuth } from "@/type/patient";
import { googleSignIn, loginUser } from '@/lib/api/patient/auth';

const PatientContext = createContext<AuthContextType>({
  patientData: null,
  loading: true,
  login: async () => {},
  googleSignIn: async () => {},
  logout: () => {},
  error: null,
});

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patientData, setPatientData] = useState<IPatient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchPatientProfile = async () => {
    try {
      const response = await getProfile();
      setPatientData(response.data.data);
      setError(null);
    } catch (error: any) {
      setPatientData(null);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const loginuser = async (data: ILogin) => {
    setLoading(true);
    try {
      const response = await loginUser(data);

      
      await fetchPatientProfile();
    } catch (error: any) {
      setError(error?.response?.data?.error || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleSignInUser = async (data: IGoogleAuth) => {
    setLoading(true);
    try {
      const response = await googleSignIn(data);
     
      await fetchPatientProfile();
    } catch (error: any) {
      setError(error?.response?.data?.error || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
  
    setPatientData(null);
 

  };

  return (
    <PatientContext.Provider value={{ 
      patientData, 
      loading,
      error,
      login: loginuser, 
      googleSignIn: googleSignInUser,
      logout
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => useContext(PatientContext); 