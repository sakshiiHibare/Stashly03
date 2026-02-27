import React from "react";

function ParkingPage() {
  return (
    <main className="parking-page-classic">
      <div className="container py-5">
        <h1 className="mb-4 text-center">
          Find Secure Car Parking Spaces in Your Neighborhood
        </h1>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Baner, Pune, 411045</h5>
                <p className="card-text">
                  Secured Gated • Covered Parking • 24/7 Access
                </p>
                <a href="/parkingbook" className="btn btn-primary">
                  Book Now
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Andheri, Mumbai, 400053</h5>
                <p className="card-text">
                  CCTV • Covered Parking • Security Guard
                </p>
                <a href="/parkingbook" className="btn btn-primary">
                  Book Now
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Salt Lake, Kolkata, 700091</h5>
                <p className="card-text">
                  Open Lot • Near Metro • Monitored 24/7
                </p>
                <a href="/parkingbook" className="btn btn-primary">
                  Book Now
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Sector 18, Noida, 201301</h5>
                <p className="card-text">
                  Multi-level • Covered • Card Access
                </p>
                <a href="/parkingbook" className="btn btn-primary">
                  Book Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ParkingPage;
