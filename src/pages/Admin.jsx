import { useState } from "react";
import "../styles/Account.css";
import AdminVets from "./AdminVets";
import Diseases from "./Diseases";
import Products from "./Products";

const Admin = () => {
  const [tab, setTab] = useState("vets");
  return (
    <div className="account-page">
      <div className="account-header">
        <h2>Administratoriaus skydelis</h2>
        <p>Valdykite veterinarus, ligas ir produktus</p>
      </div>
      <div className="account-tabs">
        <button
          className={`tab ${tab === "vets" ? "active" : ""}`}
          onClick={() => setTab("vets")}
        >
          Veterinarai
        </button>
        <button
          className={`tab ${tab === "diseases" ? "active" : ""}`}
          onClick={() => setTab("diseases")}
        >
          Ligos
        </button>
        <button
          className={`tab ${tab === "products" ? "active" : ""}`}
          onClick={() => setTab("products")}
        >
          Produktai
        </button>
      </div>
      <div className="account-content">
        {tab === "vets" && <AdminVets />}
        {tab === "diseases" && <Diseases />}
        {tab === "products" && <Products />}
      </div>
    </div>
  );
};

export default Admin;
