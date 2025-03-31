import axios from "axios";
import Cookies from 'js-cookie';

const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});


const getCookie = (name: string) => Cookies.get(name);
console.log("test")
console.log(getCookie("DoctorToken"))

API.interceptors.request.use(
    (config) => {
        let accessToken = null;

        if (config.url?.includes("/doctor")) {
            accessToken = getCookie("DoctorToken");
            console.log("dddd",getCookie("DoctorToken"))
        } else if (config.url?.includes("/admin")) {
            accessToken = getCookie("adminToken");
        } else {
            accessToken = getCookie("patientToken");
        }

        if (accessToken) {
            console.log("Token found in cookies:", accessToken);
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            console.log("No token found in cookies for request:", config.url?.includes("/doctor"));
        }

        return config;
    },
    (error) => Promise.reject(error)
);


API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                let refreshUrl = "/api/patient/refresh_token";
                let accessTokenCookieName = "patientToken";
                if (originalRequest.url.includes("/doctor")) {
                    refreshUrl = "/doctor/refresh_token";
                    accessTokenCookieName = "DoctorToken";
                } else if (originalRequest.url.includes("/admin")) {
                    refreshUrl = "/admin/refresh_token";
                    accessTokenCookieName = "adminToken";
                }

                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${refreshUrl}`, {
                    withCredentials: true,
                });

                if (!data.accessToken) {
                    throw new Error("No new access token received");
                  }

                Cookies.set(accessTokenCookieName, data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                return API(originalRequest);
            } catch (err) {
                console.error("Refresh token failed", err);
                Cookies.remove("doctorToken");
                Cookies.remove("adminToken");
                Cookies.remove("patientToken");
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default API;