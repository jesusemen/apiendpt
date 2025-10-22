// Import required dependencies
// const express = require('express');
import express from 'express';
import axios from 'axios';
// const axios = require('axios');
// const cors = require('cors');
import cors from 'cors';
// Initialize Express app
const app = express();

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Logging middleware - logs every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * GET /me endpoint
 * Returns user profile information along with a dynamic cat fact
 */
app.get('/me', async (req, res) => {
  try {
    // Log the incoming request
    console.log('Fetching cat fact from external API...');
    
    // Fetch a random cat fact from the Cat Facts API
    // Set a 5-second timeout to prevent hanging requests
    const catFactResponse = await axios.get('https://catfact.ninja/fact', {
      timeout: 5000 // 5 seconds timeout
    });
    
    // Extract the cat fact from the API response
    const catFact = catFactResponse.data.fact;
    console.log('Cat fact fetched successfully');
    
    // Generate current UTC timestamp in ISO 8601 format
    const timestamp = new Date().toISOString();
    
    // Construct the response object according to specifications
    const response = {
      status: "success",
      user: {
        email: "jesuemen.ehimiyein@gmail.com", // Replace with your actual email
        name: "Jesusemen Ehimiyein", // Replace with your actual name
        stack: "Node.js/Express" // Your backend stack
      },
      timestamp: timestamp,
      fact: catFact
    };
    
    // Send JSON response with proper Content-Type header
    res.status(200).json(response);
    
  } catch (error) {
    // Error handling for various failure scenarios
    console.error('Error occurred:', error.message);
    
    // Check if the error is from the Cat Facts API
    if (error.code === 'ECONNABORTED') {
      // Timeout error
      return res.status(504).json({
        status: "error",
        message: "External API request timed out",
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.response) {
      // The Cat Facts API responded with an error status
      return res.status(502).json({
        status: "error",
        message: "External API returned an error",
        timestamp: new Date().toISOString()
      });
    }
    
    // Network error or Cat Facts API is down
    // Return fallback response with a default cat fact
    const fallbackResponse = {
      status: "success",
      user: {
        email: "jesuemen.ehimiyein@gmail.com", // Replace with your actual email
        name: "Jesusemen Ehimiyein", // Replace with your actual name
        stack: "Node.js/Express"
      },
      timestamp: new Date().toISOString(),
      fact: "Cats sleep for around 13-16 hours a day (fallback fact - external API unavailable)"
    };
    
    res.status(200).json(fallbackResponse);
  }
});

/**
 * Health check endpoint
 * Useful for monitoring if the server is running
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler for undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler
 * Catches any unhandled errors in the application
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at: http://localhost:${PORT}/me`);
});