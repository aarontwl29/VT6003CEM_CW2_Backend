// Test data fixtures for users
export const testUsers = {
  validUser: {
    id: 1,
    firstname: "John",
    lastname: "Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    role: "user",
    avatarurl: null,
    about: "Test user",
  },

  adminUser: {
    id: 2,
    firstname: "Admin",
    lastname: "User",
    username: "admin",
    email: "admin@example.com",
    password: "adminpass",
    role: "admin",
    avatarurl: null,
    about: "Admin user",
  },

  operatorUser: {
    id: 3,
    firstname: "Operator",
    lastname: "User",
    username: "operator",
    email: "operator@example.com",
    password: "operatorpass",
    role: "operator",
    avatarurl: null,
    about: "Operator user",
  },
};

// Test data for hotels
export const testHotels = {
  validHotel: {
    id: 1,
    name: "Test Hotel",
    description: "A test hotel",
    city: "Test City",
    country: "Test Country",
    address: "123 Test Street",
    rating: 4.5,
    review_count: 100,
    image_url: "http://example.com/hotel.jpg",
  },
};

// Test data for bookings
export const testBookings = {
  validBooking: {
    id: 1,
    user_id: 1,
    start_date: "2025-07-01",
    end_date: "2025-07-07",
    staff_email: "staff@example.com",
    first_message: "Test booking message",
  },
};

// Test JWT tokens
export const testTokens = {
  validUserToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  validAdminToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiredToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  invalidToken: "invalid.token.here",
};
