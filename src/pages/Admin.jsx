import "../styles/Account.css";
import AdminVets from "./AdminVets";

const Admin = () => {
  return (
    <div className="account-page">
      <div className="account-header">
        <h2>Administratoriaus skydelis</h2>
        <p>Valdykite veterinarus</p>
      </div>
      <div className="account-content">
        <AdminVets />
      </div>
    </div>
  );
};

export default Admin;
