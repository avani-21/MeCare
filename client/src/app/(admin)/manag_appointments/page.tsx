import AdminNavbar from "../../../components/adminComponents/admin.sidebar";
import Appointments from "../../../components/adminComponents/admin.appointment";



export default async function Page() {
  try {
    return (
      <AdminNavbar>
        <Appointments/>
      </AdminNavbar>
    );
  } catch (error) {
    return (
      <AdminNavbar>
        <div>Error loading appointments</div>
      </AdminNavbar>
    );
  }
}