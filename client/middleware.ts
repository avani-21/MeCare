// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const accessToken = request.cookies.get("adminToken")?.value || localStorage.getItem('patientToken');
//   const doctorToken = request.cookies.get("DoctorToken")?.value || localStorage.getItem('doctorToken');
//   const patientToken = request.cookies.get("patientToken")?.value || localStorage.getItem("adminToken");


 
//   const adminRoutes = [
//     "/doctor_register",
//     "/admin_dashboard",
//     "/admin/doctors",
//     "/admin/patient_directory",
//     "/manag_appointments"
//   ];

//   const patientRoutes = [
//     "/doctors/:id", 
//     "/appointment_booking",
//     "/profile/my_appointments",
//     "/profile/manag_account" ,
//     "/profile/message"
//   ];

//   const publicRoutes = ["/", "/doctors"];
//   const authRoutes = ["/login", "/signup"];

//   const doctorRoutesPattern = /^\/doctor\/[^/]+\/(dashboard|profile|appointment)$/;
//   const isDoctorRoute = doctorRoutesPattern.test(pathname);
//   const isAdminRoute = adminRoutes.includes(pathname);
//   const isPatientRoute = patientRoutes.some(route => {
//     if (route.includes(':id')) {
//       const basePath = route.split(':')[0];
//       return pathname.startsWith(basePath);
//     }
//     return pathname === route || pathname.startsWith(route);
//   });


//   if (publicRoutes.includes(pathname)) {
//     return NextResponse.next();
//   }


//   if (authRoutes.includes(pathname) && (patientToken)) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

  
//   if (pathname === "/admin_login") {
//     return NextResponse.next();
//   }


//   if (isAdminRoute) {
//     if (!accessToken) {
//       return NextResponse.redirect(new URL("/admin_login", request.url));
//     }
//     return NextResponse.next();
//   }


//   if (isDoctorRoute) {
//     if (!doctorToken) {
//       return NextResponse.redirect(new URL("/doctor/send_otp", request.url));
//     }
//     return NextResponse.next();
//   }

 
//   if (isPatientRoute) {
//     if (!patientToken) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//     return NextResponse.next();
//   }


//   if (pathname === "/doctor/send_otp") {
//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin_login",
//     "/doctor_register",
//     "/admin_dashboard",
//     "/admin/doctors",
//     "/manag_appointments",
//     "/admin/patient_directory",
//     "/doctor/send_otp",
//     "/doctor/:path*",
//     "/",
//     "/doctors",
//     "/login",
//     "/signup",
//     "/profile/:path*",
//     "/appointment_booking",
//     "/doctors/:id" 
//   ],
// };