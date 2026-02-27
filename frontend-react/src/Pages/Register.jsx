import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5500";

export default function Register() {
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm: ""
  });
  const [msg, setMsg] = useState("");

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const registerUser = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    try {
      await axios.post(`${API_URL}/api/users/register`, { ...form });
      setMsg("Registration successful! Please login.");
    } catch (err) {
      setMsg("Registration error.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Register</h2>
      <form onSubmit={registerUser}>
        <input name="username" placeholder="Username" required className="form-control mb-2"
          value={form.username} onChange={handle} />
        <input type="email" name="email" placeholder="Email" required className="form-control mb-2"
          value={form.email} onChange={handle} />
        <input type="password" name="password" placeholder="Password" required className="form-control mb-2"
          value={form.password} onChange={handle} />
        <input type="password" name="confirm" placeholder="Confirm Password" required className="form-control mb-2"
          value={form.confirm} onChange={handle} />
        <button className="btn btn-success" type="submit">Register</button>
        {msg && <div className="mt-2 text-info">{msg}</div>}
      </form>
    </div>
  );
}
