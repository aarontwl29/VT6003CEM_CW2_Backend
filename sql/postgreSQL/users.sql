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



INSERT INTO users (username, email, password, role, avatarurl) VALUES
('alice', 'alice@example.com', '123456', 'operator', 'http://localhost:10888/api/v1/images/b965cb9e-f3d0-4f21-90c5-e05a07ca6a7d'),
('bob', 'bob@example.com', '123456', 'user', 'http://localhost:10888/api/v1/images/41cfeca7-790c-4736-8998-2aef04d69abf'),
('colin', 'colin@example.com', '123456', 'user', 'http://localhost:10888/api/v1/images/276600ef-d91e-4c12-bdaf-bc7b9a7ac6f3'),
('cycheng', 'cycheng@example.com', '654321', 'admin', NULL);
