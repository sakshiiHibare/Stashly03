// src/components/Navbar.jsx
import React from "react";
import logo from "../assets/airattix-logo.png";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <div className="logo-container me-2">
            <img src={logo} alt="Stashly Logo" height="30" />
          </div>
          <span className="brand-text">STASHLY</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" href="/about">
                About Us
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/storage">
                Goods Storage
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/parking">
                Car Parking
              </a>
            </li>
          </ul>
          <div className="d-flex">
            <a href="/login" className="btn btn-outline-light me-2">
              LOGIN
            </a>
            <a href="/register" className="btn btn-primary">
              REGISTER
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
