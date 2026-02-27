import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5500";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const loginUser = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, form);
      localStorage.setItem("token", data.token); // Save token
      setMsg("Login successful!");
      if (onLogin) onLogin(); // Optionally inform parent/app about login
    } catch (err) {
      setMsg("Invalid credentials. Try again.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Login</h2>
      <form onSubmit={loginUser}>
        <input type="email" name="email" placeholder="Email" required className="form-control mb-2"
          value={form.email} onChange={handle} />
        <input type="password" name="password" placeholder="Password" required className="form-control mb-2"
          value={form.password} onChange={handle} />
        <button className="btn btn-primary" type="submit">Login</button>
        {msg && <div className="mt-2 text-info">{msg}</div>}
      </form>
    </div>
  );
}
