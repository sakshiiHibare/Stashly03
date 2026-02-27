// src/components/Footer.jsx
import React from "react";

function Footer() {
  return (
    <footer className="footer bg-dark text-light" style={{textAlign:"left"}}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>About Stashly</h5>
            <p>
              Your trusted platform for storage and parking solutions. We connect people with space to those who need it.
            </p>
          </div>
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/about">About Us</a></li>
              <li><a href="/storage">Storage</a></li>
              <li><a href="/parking">Parking</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <p>
              Email: <a href="mailto:support@Stashly.com">support@Stashly.com</a>
              <br />
              Phone: 738590XXXX
            </p>
          </div>
        </div>
        <hr />
        <div className="text-center">
          <p>&copy; 2024 Stashly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
