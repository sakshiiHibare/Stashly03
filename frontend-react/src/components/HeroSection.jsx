// src/components/HeroSection.jsx
import React from "react";

function HeroSection() {
  return (
    <div className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-8 mx-auto text-center">
            <h1>
              Find Your Perfect Storage &amp; Parking Space
            </h1>
            <b className="lead">
              Rent storage spaces and parking spots in your neighborhood<br></br><br></br>
            </b>
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your location"
              />
              <button className="btn btn-primary">SEARCH</button>
            </div>
          </div>
        </div>
      </div>
    
    <section className="features-section">
      <div className="container">
        <h2 className="text-center mb-5">Why Choose Stashly?</h2>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="feature-card">
              <i className="fas fa-shield-alt"></i>
              <h3>Secure Storage</h3>
              <p>
                All spaces are verified and monitored for your safety. We ensure your belongings are kept secure at all times.
              </p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-card">
              <i className="fas fa-map-marker-alt"></i>
              <h3>Convenient Locations</h3>
              <p>
                Find spaces near you with our location-based search. Store your items close to home or work.
              </p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-card">
              <i className="fas fa-wallet"></i>
              <h3>Affordable Prices</h3>
              <p>
                Compare prices and find the best deal for your needs. Save money with our competitive rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
     </div>
  );
}

export default HeroSection;
