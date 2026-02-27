// src/pages/AboutPage.jsx
import React from "react";

function AboutPage() {
  return (
    <main style={{ minHeight: "80vh", background: "#fff" }}>
      {/* Replace below with your exact classNameic about.html content, below the navbar and above the footer */}
 {/* <!-- About Hero Section --> */}
    <div className="hero-section">
        <div className="container">
            <div className="row align-items-center">
                <div className="col-md-8 mx-auto text-center">
                    <h1>About Stashly</h1>
                    <p className="lead">Your trusted platform for storage and parking solutions</p>
                </div>
            </div>
        </div>
 
    {/* <!-- Services Section --> */}
    <section className="features-section">
        <div className="container">
            <h2 className="text-center mb-5">Our Services</h2>
            <div className="row">
                {/* <!-- Storage Service --> */}
                <div className="col-md-4 mb-4">
                    <div className="feature-card">
                        <i className="fas fa-box"></i>
                        <h3>Goods Storage</h3>
                        <p>Safe and secure storage solutions for your belongings. We provide various storage options to meet your needs.</p>
                    </div>
                </div>
                
                {/* <!-- Parking Service --> */}
                <div className="col-md-4 mb-4">
                    <div className="feature-card">
                        <i className="fas fa-car"></i>
                        <h3>Car Parking</h3>
                        <p>Find convenient parking spaces near you. Our platform connects you with available parking spots in your area.</p>
                    </div>
                </div>
                
                {/* <!-- Movers Service --> */}
                <div className="col-md-4 mb-4">
                    <div className="feature-card">
                        <i className="fas fa-truck"></i>
                        <h3>Professional Movers</h3>
                        <p>Get help with moving your belongings. Our network of professional movers ensures safe transportation of your items.</p>
                    </div>
                </div>
            </div>
        </div>
    
    </section>
 
    {/* <!-- Our Mission Section --> */}
    <section className="features-section">
        <div className="container">
            <h2 className="text-center mb-5">Our Mission</h2>
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <p className="text-center">
                        At Stashly, our mission is to connect people who have extra space with those who need it. 
                        We believe in creating a community where resources are shared efficiently, 
                        making storage and parking accessible and affordable for everyone.
                    </p>
                </div>
            </div>
        </div>
    </section>
    </div>

    </main>
  );
}

export default AboutPage;
