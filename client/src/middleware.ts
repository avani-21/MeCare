import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("adminToken")?.value; 

  const doctorToken = request.cookies.get("DoctorToken")?.value; 
  const patientToken = request.cookies.get("patientToken")?.value; 


  const adminRoutes = [
    "/admin_login",
    "/doctor_register",
    "/admin_dashboard",
    "/admin/doctors",
    "/admin/patient_directory",
  ];
  const publicRoutes = ["/", "/doctors"]
  const authRoutes = ["/login", "/signup"]; 

  const doctorRoutesPattern = /^\/doctor\/[^/]+\/(dashboard|profile)$/; 
  const isDoctorRoute = doctorRoutesPattern.test(pathname);

  const isAdminRoute = adminRoutes.includes(pathname);

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (authRoutes.includes(pathname) && patientToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }
 
  if (pathname === "/admin_login") {
    return NextResponse.next();
  }


    if (isAdminRoute && accessToken && pathname === "/admin_login") {
      return NextResponse.redirect(new URL("/admin_dashboard", request.url));
    }
  
 
    if (isDoctorRoute && doctorToken && pathname === "/doctor/send_otp") {
      return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
    }

  if (isAdminRoute && !accessToken) {
    return NextResponse.redirect(new URL("/admin_login", request.url));
  }

  if (pathname === "/doctor/send_otp") {
    return NextResponse.next();
  }

 
  if (isDoctorRoute && !doctorToken) {
    return NextResponse.redirect(new URL("/doctor/send_otp", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin_login",
    "/doctor_register",
    "/admin_dashboard",
    "/admin/doctors",
    "/admin/patient_directory",
    "/doctor/send_otp",
    "/doctor/:path*",
    "/",
    "/doctors",
    "/login",
    "/signup"
  ],
};
