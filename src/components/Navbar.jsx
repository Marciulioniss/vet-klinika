import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const Navbar = ({ currentPage, setCurrentPage, isAuthenticated }) => {
  const { user } = useAuth();
  const getMenuItems = () => {
    const baseItems = [
      { id: "home", label: "Pagrindinis" },
      { id: "diseases", label: "Ligos" },
      { id: "products", label: "Produktai" },
    ];

    if (isAuthenticated) {
      return [
        ...baseItems,
        { id: "account", label: "Paskyra" },
        { id: "visits", label: "Vizitai" },
      ];
    } else {
      return [...baseItems, { id: "auth", label: "Prisijungti" }];
    }
  };

  const menuItems = getMenuItems();

  return (
    <nav className="navbar">
      <ul className="nav-list">
        {menuItems.map((item) => (
          <li key={item.id} className="nav-item">
            <button
              className={`nav-button ${
                currentPage === item.id ? "active" : ""
              }`}
              onClick={() => setCurrentPage(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
        {isAuthenticated && user?.role === 0 && (
          <li key="admin" className="nav-item">
            <button
              className={`nav-button ${
                currentPage === "admin" ? "active" : ""
              }`}
              onClick={() => setCurrentPage("admin")}
            >
              Admin
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
