/**
 * This is a helper script to start the Airattix server from the project root
 * It ensures the correct path to the server.js file in the backend directory
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Airattix Server...');

// Define the path to the server.js file in the backend directory
const serverPath = path.join(__dirname, 'backend', 'server.js');

// Spawn a new Node.js process to run the server
const serverProcess = spawn('node', [serverPath], { 
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
});

console.log(`Server starting at http://localhost:5000`);
console.log('Press Ctrl+C to stop the server'); 