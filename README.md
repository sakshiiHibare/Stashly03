# Airattix

Airattix is a platform that connects people with storage and parking spaces to those who need them.

## Project Structure

- `frontend/` - Contains all the frontend HTML, CSS, and JavaScript files
- `backend/` - Contains the API server, routes, models, and middleware

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote)

### Installation

1. Clone the repository or download the project files

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

   This will start the backend server at http://localhost:5000

4. Open the frontend:
   - Navigate to the `frontend` directory
   - Open `index.html` in your browser

### Alternative ways to start the server

If you encounter any issues with the npm start command, you can also:

1. Start from the root directory:
   ```
   node start-server.js
   ```

2. Start directly from the backend directory:
   ```
   cd backend
   node server.js
   ```

## API Endpoints

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - Login an existing user

### Bookings
- POST /api/bookings - Create a new booking
- GET /api/bookings - Get all bookings (admin only)
- GET /api/bookings/:id - Get a specific booking
- PUT /api/bookings/:id - Update a booking (admin only)
- DELETE /api/bookings/:id - Cancel a booking

### Listings
- POST /api/listings - Create a new listing
- GET /api/listings - Get all active listings
- GET /api/listings/:id - Get a specific listing
- PUT /api/listings/:id - Update a listing
- DELETE /api/listings/:id - Delete a listing

## Contact

For any questions or issues, please contact support@airattix.com 