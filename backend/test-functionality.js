/**
 * Comprehensive test script for Airattix functionality
 * Tests: User registration, login, listing creation, booking creation, and data retrieval
 */
const fetch = require('node-fetch');
const API_URL = 'http://localhost:5000/api';

// Test credentials
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test12345',
  phone: '1234567890'
};

// Test data
let authToken = null;
let userId = null;
let listingId = null;
let bookingId = null;

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const responseData = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data: responseData
    };
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error.message);
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
}

// Test function: User Registration
async function testRegistration() {
  console.log('\n-------------- Testing User Registration --------------');
  
  const result = await apiRequest('/users/register', 'POST', testUser);
  
  if (result.success) {
    console.log('✅ Registration successful');
    console.log('User data:', result.data.user);
    authToken = result.data.token;
    userId = result.data.user._id || result.data.user.id;
    return true;
  } else if (result.data && result.data.message && result.data.message.includes('already exists')) {
    console.log('⚠️ User already exists, attempting login...');
    return await testLogin();
  } else {
    console.log('❌ Registration failed:', result.data.message || 'Unknown error');
    console.log('Error details:', result.data);
    return false;
  }
}

// Test function: User Login
async function testLogin() {
  console.log('\n-------------- Testing User Login --------------');
  
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const result = await apiRequest('/users/login', 'POST', loginData);
  
  if (result.success) {
    console.log('✅ Login successful');
    console.log('User data:', result.data.user);
    authToken = result.data.token;
    userId = result.data.user._id || result.data.user.id;
    return true;
  } else {
    console.log('❌ Login failed:', result.data.message || 'Unknown error');
    console.log('Error details:', result.data);
    return false;
  }
}

// Test function: Create Listing
async function testCreateListing() {
  console.log('\n-------------- Testing Listing Creation --------------');
  
  if (!authToken) {
    console.log('❌ Authentication required. Please login first.');
    return false;
  }
  
  const listingData = {
    title: 'Test Parking Space',
    description: 'This is a test parking space for API testing',
    location: {
      address: '123 Test Street',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      }
    },
    listingType: 'parking',
    parkingType: 'garage',
    vehicleTypes: ['car', 'motorcycle'],
    parkingAmenities: ['covered', 'security_camera'],
    price: {
      amount: 200,
      interval: 'daily'
    }
  };
  
  const result = await apiRequest('/listings', 'POST', listingData, authToken);
  
  if (result.success) {
    console.log('✅ Listing creation successful');
    console.log('Listing data:', result.data.listing);
    listingId = result.data.listing.id || result.data.listing._id;
    return true;
  } else {
    console.log('❌ Listing creation failed:', result.data.message || 'Unknown error');
    console.log('Error details:', result.data);
    return false;
  }
}

// Test function: Create Booking
async function testCreateBooking() {
  console.log('\n-------------- Testing Booking Creation --------------');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  const bookingData = {
    name: 'Test User',
    email: testUser.email,
    phone: testUser.phone,
    startDate: tomorrow.toISOString().split('T')[0],
    endDate: dayAfter.toISOString().split('T')[0],
    bookingType: 'parking',
    vehicleType: 'car',
    licenseNumber: 'KA01AB1234',
    vehicleColor: 'Blue'
  };
  
  // Add listing reference if available
  if (listingId) {
    bookingData.listingId = listingId;
  }
  
  const result = await apiRequest('/bookings', 'POST', bookingData);
  
  if (result.success) {
    console.log('✅ Booking creation successful');
    console.log('Booking data:', result.data.booking);
    bookingId = result.data.booking.id || result.data.booking._id;
    return true;
  } else {
    console.log('❌ Booking creation failed:', result.data.message || 'Unknown error');
    console.log('Error details:', result.data);
    return false;
  }
}

// Test function: Get Listings
async function testGetListings() {
  console.log('\n-------------- Testing Get Listings --------------');
  
  const result = await apiRequest('/listings');
  
  if (result.success) {
    console.log('✅ Get listings successful');
    console.log(`Retrieved ${result.data.results || 0} listings`);
    return true;
  } else {
    console.log('❌ Get listings failed:', result.data.message || 'Unknown error');
    return false;
  }
}

// Test function: Get User Bookings
async function testGetUserBookings() {
  console.log('\n-------------- Testing Get User Bookings --------------');
  
  if (!authToken) {
    console.log('❌ Authentication required. Please login first.');
    return false;
  }
  
  const result = await apiRequest('/bookings/user/me', 'GET', null, authToken);
  
  if (result.success) {
    console.log('✅ Get user bookings successful');
    console.log(`Retrieved ${result.data.results || 0} bookings`);
    return true;
  } else {
    console.log('❌ Get user bookings failed:', result.data.message || 'Unknown error');
    return false;
  }
}

// Run all tests sequentially
async function runAllTests() {
  console.log('========== Starting Airattix Functionality Tests ==========');
  
  const registrationSuccess = await testRegistration();
  if (!registrationSuccess) {
    console.log('⚠️ Registration/Login failed, some tests may fail');
  }
  
  if (authToken) {
    await testCreateListing();
  }
  
  await testCreateBooking();
  
  await testGetListings();
  
  if (authToken) {
    await testGetUserBookings();
  }
  
  console.log('\n========== Completed Airattix Functionality Tests ==========');
  
  // Summary
  console.log('\n-------------- Test Summary --------------');
  console.log(`Authentication: ${authToken ? '✅ Successful' : '❌ Failed'}`);
  console.log(`Listing Creation: ${listingId ? '✅ Successful' : '❌ Failed or Not Tested'}`);
  console.log(`Booking Creation: ${bookingId ? '✅ Successful' : '❌ Failed or Not Tested'}`);
  
  // Overall assessment
  if (authToken && (listingId || bookingId)) {
    console.log('\n✅ CORE FUNCTIONALITY IS WORKING PROPERLY');
  } else {
    console.log('\n⚠️ SOME FUNCTIONALITY MIGHT NOT BE WORKING PROPERLY');
  }
  
  process.exit(0);
}

// Execute the tests
runAllTests(); 