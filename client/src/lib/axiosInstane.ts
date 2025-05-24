import axios from "axios";
import Cookies from "js-cookie";


const API = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});
console.log(API)
API.interceptors.request.use((config) => {
    let accessToken = "";
     console.log(config.url)
    if (config.url?.startsWith("/doctor")) {
        accessToken = Cookies.get("DoctorToken") || "";
    }
    else if (config.url?.startsWith("/admin")) {
        accessToken = Cookies.get("adminToken") || "";
    } else {
        accessToken = Cookies.get("patientToken") || "";
    }
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});


API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED"
        ) {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/admin/refresh_token`,
                    { withCredentials: true }
                );

                const newAccessToken = res.data.accessToken;
                Cookies.set("adminToken", newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            } catch (refreshError) {
                if (typeof window !== "undefined") {
                    window.location.href = "/login"; 
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


export default API;


