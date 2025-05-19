"use client"
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getProfile } from "@/lib/api/patient/patient";
import { AuthContextType, IPatient, ILogin, IGoogleAuth } from "@/type/patient";
import { googleSignIn, login } from '@/lib/api/patient/auth';

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

  const loginUser = async (data: ILogin) => {
    setLoading(true);
    try {
      const response = await login(data);

      if (response.accessToken || response.refreshToken) {

        console.log('Received tokens:', {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
      }
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
     
      if (response.accessToken || response.refreshToken) {

        console.log('Received tokens:', {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
      }
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
    
    console.log('Clearing authentication tokens');

  };

  return (
    <PatientContext.Provider value={{ 
      patientData, 
      loading,
      error,
      login: loginUser, 
      googleSignIn: googleSignInUser,
      logout
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => useContext(PatientContext); 