import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5500";

const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  storageType: "",
  startDate: "",
  endDate: "",
  spaceSize: "",
  itemsDescription: "",
  specialRequirements: ""
};

const storageTypes = [
  "Personal Storage", "Business Storage", "Document Storage", "Furniture Storage", "Other"
];

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [msg, setMsg] = useState("");

  // Handle all changes in one go
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Validate before sending
  const isValid = () =>
    form.fullName &&
    form.email &&
    /^\d{10}$/.test(form.phone) &&
    form.storageType &&
    form.startDate &&
    form.endDate &&
    form.spaceSize >= 1;

  const submitBooking = async e => {
    e.preventDefault();
    if (!isValid()) {
      setMsg("Please fill all details correctly.");
      return;
    }
    try {
     await axios.post(`${API_URL}/api/bookings`, {
        ...form,
        listingId: state?.listingId || undefined
      });
      setMsg("Booking confirmed! Redirecting...");
      setTimeout(() => navigate("/thankyou"), 2000);
    } catch (err) {
      setMsg("Error: Booking not completed. Try again.");
    }
  };

  return (
    <div className="container py-4" style={{ minHeight: "80vh" }}>
      <h2>Book Your Storage Space</h2>
      <form className="mt-3" onSubmit={submitBooking} autoComplete="off">
        <div className="mb-3">
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handle} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Email Address</label>
          <input type="email" name="email" value={form.email} onChange={handle} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handle} className="form-control" maxLength="10" required />
        </div>
        <div className="mb-3">
          <label>Storage Type</label>
          <select name="storageType" value={form.storageType} onChange={handle} className="form-select" required>
            <option value="">Select Storage Type</option>
            {storageTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label>Start Date</label>
          <input type="date" name="startDate" value={form.startDate} onChange={handle} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>End Date</label>
          <input type="date" name="endDate" value={form.endDate} onChange={handle} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Space Size Needed (sq.ft)</label>
          <input type="number" name="spaceSize" value={form.spaceSize} onChange={handle} min="1" className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Items Description</label>
          <textarea name="itemsDescription" value={form.itemsDescription} onChange={handle} className="form-control" />
        </div>
        <div className="mb-3">
          <label>Special Requirements</label>
          <textarea name="specialRequirements" value={form.specialRequirements} onChange={handle} className="form-control" />
        </div>
        <button type="submit" className="btn btn-success">Confirm Booking</button>
        {msg && <div className="mt-2 alert alert-info">{msg}</div>}
      </form>
    </div>
  );
}
