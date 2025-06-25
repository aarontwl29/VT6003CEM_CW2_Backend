CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  address VARCHAR(255),
  rating DECIMAL(2,1),
  review_count INT,
  image_url TEXT
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  hotel_id INT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  capacity INT NOT NULL,                    -- e.g., 1, 2, 4
  bed_option TEXT,                       -- e.g., King Bed", Single Beds"
  amenities TEXT[],               -- List of amenities, e.g. ["wifi", "pool", "spa"]
  price_per_night DECIMAL(10,2),
  has_discount BOOLEAN DEFAULT FALSE,
  discount_rate DECIMAL(3,2) DEFAULT 0.00
);


CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
  start_date DATE NOT NULL,                                    
  end_date DATE NOT NULL,                                     
  staff_email VARCHAR(255),
  first_message TEXT 
);


CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'cancelled'); 
CREATE TABLE booking_rooms (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE, 
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,      
  status booking_status DEFAULT 'pending',                          -- Status of the booking (pending, approved, cancelled)
  staff_id INT REFERENCES users(id) ON DELETE CASCADE               -- Staff who approved or cancelled the booking
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,                                      
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE, 
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,     -- ID of the sender (user or staff)
  recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- ID of the recipient (user or staff)
  message TEXT NOT NULL                                      
);


INSERT INTO hotels (name, description, city, country, address, rating, review_count, image_url) VALUES
('Ocean Breeze Resort', 'A luxurious resort with private beach access.', 'Phuket', 'Thailand', '123 Beachside Road', 4.5, 220, 'https://example.com/ocean.jpg'),
('Mountain View Lodge', 'Cozy lodge with stunning mountain views.', 'Nagano', 'Japan', '45 Snow Peak Lane', 4.3, 175, 'https://example.com/mountain.jpg'),
('City Central Hotel', 'Modern hotel in the heart of the city.', 'New York', 'USA', '88 Main Street', 4.2, 300, 'https://example.com/city.jpg'),
('Lakeview Retreat', 'Relax by the serene lakeside.', 'Queenstown', 'New Zealand', '7 Lakeshore Road', 4.7, 190, 'https://example.com/lake.jpg'),
('Desert Oasis Inn', 'Comfort in the heart of the desert.', 'Dubai', 'UAE', '55 Palm Drive', 4.4, 140, 'https://example.com/desert.jpg'),
('Rainforest Escape', 'Immersive rainforest experience.', 'Kuala Lumpur', 'Malaysia', '99 Jungle Trail', 4.6, 160, 'https://example.com/rainforest.jpg'),
('Ski Village Lodge', 'Perfect for winter getaways.', 'Whistler', 'Canada', '12 Snowy Hill', 4.5, 210, 'https://example.com/ski.jpg'),
('Tropical Paradise Hotel', 'Escape to sunny beaches.', 'Bali', 'Indonesia', '500 Sunset Blvd', 4.8, 250, 'https://example.com/tropical.jpg'),
('Countryside Inn', 'Charming stay in the countryside.', 'Oxford', 'UK', '33 Greenfield Road', 4.1, 130, 'https://example.com/countryside.jpg'),
('Island Breeze Suites', 'Island life with modern comfort.', 'Maldives', 'Maldives', 'Beachfront Villa 21', 4.9, 300, 'https://example.com/island.jpg'),
('Safari Wilderness Lodge', 'Stay close to the wild.', 'Nairobi', 'Kenya', 'Safari Park Road', 4.2, 110, 'https://example.com/safari.jpg'),
('Historic Castle Hotel', 'Live like royalty in a castle.', 'Edinburgh', 'UK', 'Castle Hill', 4.5, 180, 'https://example.com/castle.jpg'),
('Luxury Downtown Suites', 'High-end suites in the business district.', 'Singapore', 'Singapore', '8 Marina Bay', 4.7, 240, 'https://example.com/luxury.jpg'),
('Seaside Family Resort', 'Fun for the whole family.', 'Gold Coast', 'Australia', '10 Surfer Beach Road', 4.3, 200, 'https://example.com/seaside.jpg'),
('Northern Lights Hotel', 'Watch the aurora from your room.', 'Reykjavik', 'Iceland', 'Aurora Lane 5', 4.6, 150, 'https://example.com/northernlights.jpg'),
('Hillside Cabin Resort', 'Wooden cabins with mountain views.', 'Aspen', 'USA', '55 Pine Trail', 4.4, 170, 'https://example.com/hillside.jpg'),
('Beachfront Budget Inn', 'Affordable beachfront stay.', 'Cancun', 'Mexico', '20 Ocean Drive', 4.0, 90, 'https://example.com/beachfront.jpg'),
('Urban Boutique Hotel', 'Stylish rooms in a vibrant area.', 'Berlin', 'Germany', '66 Art Street', 4.2, 140, 'https://example.com/urban.jpg'),
('Island Cliff Hotel', 'Panoramic views from cliffside rooms.', 'Santorini', 'Greece', '15 Cliff Edge', 4.8, 230, 'https://example.com/islandcliff.jpg'),
('Safari Desert Camp', 'Experience desert nights under the stars.', 'Doha', 'Qatar', 'Sand Dune Way', 4.3, 100, 'https://example.com/desertcamp.jpg');


INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (1, 1, 2, '1 Double Bed', '{wifi,spa}', 111.86, TRUE, 0.24);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (2, 1, 4, '1 King Bed + Sofa', '{wifi,breakfast}', 141.77, TRUE, 0.23);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (3, 1, 4, '1 Double Bed', '{wifi,spa}', 143.18, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (4, 1, 4, '2 Double Beds', '{gym,spa,breakfast}', 269.5, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (5, 1, 2, '2 Single Beds', '{wifi,pool,gym}', 226.0, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (6, 1, 2, '1 Double Bed', '{wifi,pool}', 88.77, TRUE, 0.1);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (7, 1, 4, '1 Double Bed', '{gym,spa,breakfast}', 237.47, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (8, 1, 2, '1 King Bed + Sofa', '{wifi,pool}', 151.4, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (9, 2, 4, '2 Single Beds', '{wifi,breakfast}', 157.03, TRUE, 0.1);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (10, 2, 2, '1 King Bed + Sofa', '{wifi,pool}', 211.32, TRUE, 0.25);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (11, 2, 1, '1 King Bed', '{wifi,pool,gym}', 189.3, TRUE, 0.23);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (12, 2, 2, '1 Queen Bed', '{wifi,spa}', 102.13, TRUE, 0.13);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (13, 2, 2, '1 King Bed + Sofa', '{wifi,breakfast}', 99.8, TRUE, 0.18);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (14, 2, 4, '1 King Bed', '{breakfast,parking}', 148.09, TRUE, 0.22);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (15, 2, 1, '1 King Bed + Sofa', '{gym,spa,breakfast}', 255.78, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (16, 2, 1, '1 King Bed', '{breakfast,parking}', 214.94, TRUE, 0.13);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (17, 3, 1, '1 King Bed + Sofa', '{wifi,breakfast}', 165.0, TRUE, 0.24);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (18, 3, 1, '1 Queen Bed', '{breakfast,parking}', 221.45, TRUE, 0.17);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (19, 3, 2, '1 King Bed + Sofa', '{wifi,spa}', 209.82, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (20, 3, 2, '1 King Bed', '{wifi,breakfast}', 143.36, TRUE, 0.07);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (21, 3, 2, '1 King Bed', '{wifi,breakfast}', 298.26, TRUE, 0.22);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (22, 3, 4, '1 Queen Bed', '{wifi,spa}', 296.72, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (23, 3, 4, '1 King Bed', '{gym,spa,breakfast}', 128.71, TRUE, 0.19);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (24, 3, 2, '2 Double Beds', '{wifi,breakfast}', 261.61, TRUE, 0.15);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (25, 4, 1, '1 Queen Bed', '{wifi,pool,gym}', 241.08, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (26, 4, 2, '2 Double Beds', '{wifi,pool}', 184.22, TRUE, 0.05);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (27, 4, 1, '1 King Bed + Sofa', '{gym,spa,breakfast}', 180.94, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (28, 4, 4, '1 Queen Bed', '{wifi,pool}', 115.22, TRUE, 0.21);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (29, 4, 1, '1 King Bed + Sofa', '{wifi,spa}', 254.64, TRUE, 0.08);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (30, 4, 4, '1 Double Bed', '{wifi,pool}', 217.46, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (31, 4, 4, '1 Queen Bed', '{gym,spa,breakfast}', 207.92, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (32, 4, 1, '2 Single Beds', '{gym,spa,breakfast}', 223.42, TRUE, 0.1);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (33, 5, 2, '1 King Bed', '{wifi,pool}', 285.11, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (34, 5, 4, '1 Double Bed', '{wifi,pool}', 298.07, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (35, 5, 1, '2 Double Beds', '{wifi,pool}', 158.44, TRUE, 0.19);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (36, 5, 2, '1 Double Bed', '{wifi,pool,gym}', 208.34, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (37, 5, 4, '1 King Bed', '{breakfast,parking}', 155.56, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (38, 5, 1, '1 Queen Bed', '{wifi,pool,gym}', 129.25, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (39, 5, 1, '1 King Bed', '{wifi,pool,gym}', 157.43, TRUE, 0.21);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (40, 5, 2, '1 King Bed', '{wifi,pool,gym}', 154.8, TRUE, 0.19);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (41, 6, 4, '1 King Bed + Sofa', '{gym,spa,breakfast}', 270.73, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (42, 6, 4, '1 Double Bed', '{gym,spa,breakfast}', 109.18, TRUE, 0.11);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (43, 6, 2, '2 Single Beds', '{gym,spa,breakfast}', 265.2, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (44, 6, 4, '1 Double Bed', '{wifi,breakfast}', 290.4, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (45, 6, 1, '1 King Bed', '{wifi,spa}', 186.04, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (46, 6, 2, '2 Single Beds', '{wifi,breakfast}', 174.7, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (47, 6, 4, '1 Double Bed', '{wifi,pool}', 99.96, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (48, 6, 1, '1 King Bed + Sofa', '{breakfast,parking}', 152.19, TRUE, 0.13);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (49, 7, 1, '1 Queen Bed', '{wifi,pool,gym}', 177.3, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (50, 7, 1, '1 Double Bed', '{wifi,breakfast}', 267.61, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (51, 7, 4, '1 Queen Bed', '{wifi,breakfast}', 225.89, TRUE, 0.16);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (52, 7, 4, '1 Queen Bed', '{wifi,pool}', 170.12, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (53, 7, 2, '1 King Bed', '{wifi,pool}', 175.48, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (54, 7, 2, '1 Double Bed', '{wifi,pool,gym}', 151.34, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (55, 7, 1, '2 Single Beds', '{wifi,spa}', 180.71, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (56, 7, 4, '1 Double Bed', '{wifi,pool}', 131.84, TRUE, 0.12);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (57, 8, 1, '1 King Bed', '{wifi,pool}', 167.09, TRUE, 0.23);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (58, 8, 4, '1 Double Bed', '{wifi,pool,gym}', 107.3, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (59, 8, 4, '1 Queen Bed', '{wifi,spa}', 140.27, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (60, 8, 2, '1 Queen Bed', '{wifi,breakfast}', 245.64, TRUE, 0.11);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (61, 8, 2, '1 King Bed', '{wifi,breakfast}', 262.44, TRUE, 0.1);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (62, 8, 1, '1 Double Bed', '{wifi,pool,gym}', 279.17, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (63, 8, 2, '1 King Bed + Sofa', '{breakfast,parking}', 228.21, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (64, 8, 2, '1 King Bed + Sofa', '{breakfast,parking}', 150.71, TRUE, 0.11);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (65, 9, 4, '1 King Bed', '{gym,spa,breakfast}', 291.39, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (66, 9, 2, '2 Double Beds', '{gym,spa,breakfast}', 118.08, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (67, 9, 1, '1 King Bed', '{breakfast,parking}', 198.34, TRUE, 0.12);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (68, 9, 2, '2 Double Beds', '{breakfast,parking}', 221.99, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (69, 9, 1, '2 Single Beds', '{wifi,breakfast}', 245.62, TRUE, 0.14);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (70, 9, 1, '2 Double Beds', '{wifi,spa}', 88.66, TRUE, 0.09);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (71, 9, 1, '2 Double Beds', '{wifi,pool}', 87.51, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (72, 9, 4, '2 Double Beds', '{wifi,pool,gym}', 119.51, TRUE, 0.11);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (73, 10, 1, '1 Queen Bed', '{wifi,pool}', 208.41, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (74, 10, 1, '1 King Bed + Sofa', '{wifi,pool}', 146.19, TRUE, 0.15);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (75, 10, 2, '1 Queen Bed', '{wifi,pool}', 156.09, TRUE, 0.08);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (76, 10, 4, '1 Queen Bed', '{wifi,pool}', 286.35, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (77, 10, 1, '1 King Bed', '{wifi,pool}', 239.92, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (78, 10, 2, '2 Single Beds', '{wifi,pool}', 148.98, TRUE, 0.2);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (79, 10, 4, '1 Queen Bed', '{wifi,pool}', 180.79, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (80, 10, 4, '1 Double Bed', '{wifi,pool}', 256.65, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (81, 11, 2, '2 Single Beds', '{gym,spa,breakfast}', 294.75, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (82, 11, 2, '1 King Bed', '{wifi,breakfast}', 80.92, TRUE, 0.15);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (83, 11, 4, '2 Double Beds', '{wifi,pool,gym}', 285.71, TRUE, 0.23);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (84, 11, 4, '2 Single Beds', '{breakfast,parking}', 151.31, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (85, 11, 2, '1 Double Bed', '{gym,spa,breakfast}', 211.69, TRUE, 0.13);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (86, 11, 2, '1 King Bed', '{wifi,spa}', 199.63, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (87, 11, 1, '1 King Bed', '{gym,spa,breakfast}', 130.4, TRUE, 0.09);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (88, 11, 2, '1 Queen Bed', '{wifi,pool,gym}', 189.83, TRUE, 0.08);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (89, 12, 1, '2 Double Beds', '{wifi,breakfast}', 243.67, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (90, 12, 1, '2 Double Beds', '{gym,spa,breakfast}', 113.51, TRUE, 0.09);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (91, 12, 1, '1 King Bed', '{wifi,pool,gym}', 183.76, TRUE, 0.23);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (92, 12, 2, '1 Queen Bed', '{wifi,breakfast}', 268.84, TRUE, 0.16);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (93, 12, 4, '1 Double Bed', '{wifi,pool,gym}', 243.27, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (94, 12, 2, '1 Double Bed', '{wifi,pool}', 170.76, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (95, 12, 2, '1 Double Bed', '{gym,spa,breakfast}', 271.86, TRUE, 0.16);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (96, 12, 2, '2 Double Beds', '{wifi,breakfast}', 211.87, TRUE, 0.14);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (97, 13, 4, '1 King Bed', '{wifi,breakfast}', 219.94, TRUE, 0.06);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (98, 13, 4, '1 King Bed + Sofa', '{wifi,breakfast}', 286.7, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (99, 13, 1, '1 Double Bed', '{breakfast,parking}', 83.06, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (100, 13, 2, '1 Queen Bed', '{wifi,pool,gym}', 274.68, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (101, 13, 2, '2 Single Beds', '{breakfast,parking}', 280.0, TRUE, 0.22);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (102, 13, 1, '2 Double Beds', '{wifi,pool}', 130.37, TRUE, 0.08);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (103, 13, 1, '1 King Bed', '{wifi,spa}', 248.89, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (104, 13, 2, '2 Double Beds', '{wifi,spa}', 249.59, TRUE, 0.06);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (105, 14, 1, '1 King Bed + Sofa', '{wifi,spa}', 204.35, TRUE, 0.14);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (106, 14, 1, '1 Queen Bed', '{wifi,spa}', 258.2, TRUE, 0.15);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (107, 14, 4, '1 Queen Bed', '{wifi,pool,gym}', 230.39, TRUE, 0.15);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (108, 14, 4, '1 King Bed', '{gym,spa,breakfast}', 167.68, TRUE, 0.11);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (109, 14, 1, '1 Queen Bed', '{gym,spa,breakfast}', 155.59, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (110, 14, 4, '1 Double Bed', '{wifi,pool,gym}', 83.73, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (111, 14, 4, '1 King Bed + Sofa', '{breakfast,parking}', 183.73, TRUE, 0.14);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (112, 14, 4, '2 Single Beds', '{breakfast,parking}', 190.7, TRUE, 0.15);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (113, 15, 1, '1 Double Bed', '{wifi,spa}', 269.21, TRUE, 0.12);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (114, 15, 4, '2 Double Beds', '{wifi,breakfast}', 293.91, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (115, 15, 4, '2 Single Beds', '{wifi,pool,gym}', 128.04, TRUE, 0.19);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (116, 15, 2, '2 Single Beds', '{wifi,spa}', 151.81, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (117, 15, 1, '1 Double Bed', '{wifi,pool,gym}', 99.36, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (118, 15, 4, '1 Double Bed', '{wifi,pool,gym}', 143.99, TRUE, 0.17);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (119, 15, 2, '1 Double Bed', '{breakfast,parking}', 110.86, TRUE, 0.17);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (120, 15, 4, '1 Double Bed', '{wifi,pool,gym}', 176.09, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (121, 16, 4, '1 Double Bed', '{breakfast,parking}', 118.47, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (122, 16, 2, '2 Double Beds', '{wifi,spa}', 84.11, TRUE, 0.24);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (123, 16, 2, '1 King Bed', '{breakfast,parking}', 159.95, TRUE, 0.21);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (124, 16, 1, '1 King Bed + Sofa', '{breakfast,parking}', 246.81, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (125, 16, 1, '1 King Bed', '{breakfast,parking}', 222.4, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (126, 16, 4, '1 King Bed + Sofa', '{wifi,spa}', 271.59, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (127, 16, 2, '1 King Bed + Sofa', '{wifi,pool,gym}', 179.14, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (128, 16, 1, '1 King Bed', '{wifi,spa}', 126.13, TRUE, 0.17);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (129, 17, 2, '1 Queen Bed', '{wifi,pool,gym}', 210.34, TRUE, 0.11);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (130, 17, 1, '1 Double Bed', '{wifi,pool}', 127.9, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (131, 17, 2, '1 Queen Bed', '{wifi,pool,gym}', 299.39, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (132, 17, 1, '2 Double Beds', '{wifi,spa}', 233.75, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (133, 17, 2, '1 King Bed + Sofa', '{breakfast,parking}', 181.76, TRUE, 0.09);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (134, 17, 4, '2 Double Beds', '{gym,spa,breakfast}', 120.54, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (135, 17, 2, '2 Single Beds', '{breakfast,parking}', 110.64, TRUE, 0.1);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (136, 17, 1, '2 Double Beds', '{wifi,pool}', 96.18, TRUE, 0.15);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (137, 18, 4, '2 Single Beds', '{wifi,pool,gym}', 141.09, TRUE, 0.12);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (138, 18, 2, '1 King Bed', '{wifi,pool,gym}', 258.94, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (139, 18, 2, '1 Queen Bed', '{wifi,pool}', 169.53, TRUE, 0.1);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (140, 18, 4, '2 Single Beds', '{gym,spa,breakfast}', 120.5, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (141, 18, 2, '1 Queen Bed', '{gym,spa,breakfast}', 191.35, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (142, 18, 4, '1 King Bed', '{wifi,pool}', 107.53, TRUE, 0.1);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (143, 18, 1, '1 King Bed', '{wifi,spa}', 156.83, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (144, 18, 2, '2 Single Beds', '{gym,spa,breakfast}', 268.53, TRUE, 0.12);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (145, 19, 4, '1 Queen Bed', '{gym,spa,breakfast}', 284.89, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (146, 19, 4, '1 King Bed', '{wifi,pool}', 120.99, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (147, 19, 2, '1 King Bed + Sofa', '{wifi,pool,gym}', 195.08, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (148, 19, 2, '1 King Bed', '{gym,spa,breakfast}', 290.8, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (149, 19, 2, '1 Queen Bed', '{breakfast,parking}', 184.11, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (150, 19, 1, '1 Queen Bed', '{wifi,spa}', 88.78, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (151, 19, 2, '1 King Bed + Sofa', '{wifi,pool,gym}', 84.45, TRUE, 0.24);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (152, 19, 4, '1 King Bed + Sofa', '{gym,spa,breakfast}', 88.03, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (153, 20, 1, '1 Double Bed', '{wifi,spa}', 293.58, TRUE, 0.17);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (154, 20, 1, '1 Double Bed', '{wifi,spa}', 201.72, TRUE, 0.2);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (155, 20, 2, '1 King Bed', '{wifi,pool,gym}', 171.4, TRUE, 0.24);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (156, 20, 2, '1 Double Bed', '{gym,spa,breakfast}', 293.92, TRUE, 0.17);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (157, 20, 1, '1 King Bed + Sofa', '{wifi,pool,gym}', 292.31, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (158, 20, 4, '1 Queen Bed', '{wifi,pool}', 91.99, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (159, 20, 2, '2 Double Beds', '{wifi,pool}', 165.27, FALSE, 0.0);
INSERT INTO rooms (id, hotel_id, capacity, bed_option, amenities, price_per_night, has_discount, discount_rate)
VALUES (160, 20, 1, '1 Double Bed', '{breakfast,parking}', 138.04, TRUE, 0.1);