import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
// import FeaturesSection from "./components/FeaturesSection";
import Footer from "./components/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style/style.css';
import './style/style-auth.css';
import AboutPage from './Pages/AboutPage';
import StoragePage from './Pages/StoragePage';
import Booking from './Pages/Booking';
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
// ...
 
 // if custom styles exist


function App() {
  return (
    <>
      {/* <Navbar /> */}
      {/* <HeroSection /> */}
      {/* <FeaturesSection /> */}
      {/* <Footer /> */}
         <Router>
      <Navbar />
      <Routes>
                <Route path="/" element={<HeroSection />} />
        <Route path="/about" element={<AboutPage />} />
          <Route path="/storage" element={<StoragePage />} />
                   <Route path="/booking" element={<Booking />} />

          {/*
        <Route path="/parking" element={<ParkingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/storagebook" element={<StorageBookPage />} />
        <Route path="/parkingbook" element={<ParkingBookPage />} />
        <Route path="/thankyou" element={<ThankYouPage />} /> */}
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register />} />


      </Routes>
      <Footer />
    </Router>
    </>
  );
}

export default App;
