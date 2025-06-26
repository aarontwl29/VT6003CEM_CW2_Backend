#!/bin/bash

# Install testing dependencies for Node.js/TypeScript project

echo "Installing testing dependencies..."

# Core testing framework
npm install --save-dev jest @types/jest

# TypeScript support for Jest
npm install --save-dev ts-jest typescript

# Supertest for API testing
npm install --save-dev supertest @types/supertest

# Test utilities
npm install --save-dev jest-environment-node

# Mock libraries
npm install --save-dev jest-mock

# JWT for testing tokens
npm install jsonwebtoken @types/jsonwebtoken

# Optional: dotenv for test environment
npm install --save-dev dotenv

echo "Testing dependencies installed successfully!"
echo "You can now run: npm test"
