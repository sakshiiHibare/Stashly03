import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import storagespace from "../assets/storagespace.jpg";
import '../style/style.css';
import '../style/style-auth.css';
const storageList = [
  {
    id: 1,
    title: "Secure Garage Storage",
    location: "Whitefield, Bangalore, 560066",
    size: "100 sq.ft",
    type: "Garage",
    price: "2,500/month",
    image: storagespace,
    specs: ["24x7 Access", "Climate Controlled", "Secure"],
    available: true
  },
  {
    id: 2,
    title: "Basement Storage Unit",
    location: "Koramangala, Bangalore, 560034",
    size: "75 sq.ft",
    type: "Basement",
    price: "1,800/month",
    image: storagespace,
    specs: ["CCTV", "Secure Access", "Dry Space"],
    available: true
  },
    {
    id: 3,
    title: "Basement Storage Unit",
    location: "Koramangala, Bangalore, 560034",
    size: "75 sq.ft",
    type: "Basement",
    price: "1,800/month",
    image: storagespace,
    specs: ["CCTV", "Secure Access", "Dry Space"],
    available: true
  },
    {
    id: 1,
    title: "Secure Garage Storage",
    location: "Whitefield, Bangalore, 560066",
    size: "100 sq.ft",
    type: "Garage",
    price: "2,500/month",
    image: storagespace,
    specs: ["24x7 Access", "Climate Controlled", "Secure"],
    available: true
  }
  // Add more as needed
];

export default function StoragePage() {
  const navigate = useNavigate();
  const [filtered, setFiltered] = useState(storageList);

  // Optionally add filters/inputs here for UI search

  return (        <main style={{ minHeight: "80vh", background: "#fff" }}>

  
        {/* Replace below with your exact classNameic about.html content, below the navbar and above the footer */}
  {/* <!-- About Hero Section --> */}
     <div className="hero-section">
         <div className="container">
             <div className="row align-items-center">
                <div className="col-md-8 mx-auto text-center">
                    <h1>Find Your Perfect Storage Space</h1>
                     <p className="lead"> storage solutions</p>
 
              </div>
           </div>
         </div>
         </div>
 
      <div className="row">
        {filtered.map(storage => (
          <div key={storage.id} className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="row g-0">
                <div className="col-md-5">
                  <img src={storage.image} alt={storage.title} className="img-fluid rounded-start h-100" />
                </div>
                <div className="col-md-7">
                  <div className="card-body d-flex flex-column h-100">
                    <h5 className="card-title">{storage.title}</h5>
                    <p className="card-text">{storage.location}</p>
                    <div className="specs mb-2">
                      <span className="badge bg-secondary me-2">{storage.size}</span>
                      <span className="badge bg-info me-2">{storage.type}</span>
                      <span className="badge bg-success">{storage.available ? "Available Now" : "Booked"}</span>
                    </div>
                    <p className="card-text">
                      <small className="text-muted">{storage.specs.join(", ")}</small>
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <h5 className="price mb-0">{storage.price}</h5>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('/booking', { state: storage })}
                        disabled={!storage.available}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    {/* </div> */}
</main>

   );
  }