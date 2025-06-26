CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(32),
  lastname VARCHAR(32),
  username VARCHAR(16) UNIQUE NOT NULL,
  about TEXT,
  email VARCHAR(64) UNIQUE NOT NULL,
  password VARCHAR(64),               
  avatarurl TEXT,                     -- URL for profile picture
  role TEXT                           -- 'admin', 'operator', 'user', etc.
);


CREATE TABLE signup_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  generated_for TEXT
);

CREATE TABLE favourites (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
  hotel_id INT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE, 
  PRIMARY KEY (user_id, hotel_id) 
);

INSERT INTO users (username, email, password, role, avatarurl) VALUES
('alice', 'alice@example.com', '123456', 'operator', 'http://localhost:10888/api/v1/images/b965cb9e-f3d0-4f21-90c5-e05a07ca6a7d'),
('bob', 'bob@example.com', '123456', 'user', 'http://localhost:10888/api/v1/images/41cfeca7-790c-4736-8998-2aef04d69abf'),
('colin', 'colin@example.com', '123456', 'user', 'http://localhost:10888/api/v1/images/276600ef-d91e-4c12-bdaf-bc7b9a7ac6f3'),
('cycheng', 'cycheng@example.com', '654321', 'admin', NULL);


INSERT INTO signup_codes (code, is_used, generated_for) VALUES
('ABC123', FALSE, 'operator'),
('DEF456', FALSE, 'operator'),
('GHI789', FALSE, 'operator'),
('JKL012', FALSE, 'operator'),
('MNO345', FALSE, 'admin'),
('PQR678', FALSE, 'admin'),
('STU901', FALSE, 'operator'),
('VWX234', FALSE, 'operator'),
('YZA567', FALSE, 'operator'),
('BCD890', FALSE, 'admin');
