CREATE DATABASE cse3100_testA1;

CREATE USER 'admin' @'localhost' IDENTIFIED BY 'strong_password';

GRANT ALL PRIVILEGES ON cse3100_testA1.* TO 'admin' @'localhost';

FLUSH PRIVILEGES;

USE cse3100_testA1;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100)
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Foreign key to users
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

INSERT INTO
    users (name, email, password)
VALUES (
        'Alice',
        'alice@example.com',
        'password123'
    );

INSERT INTO
    posts (user_id, title, content)
VALUES (
        1,
        'My First Post',
        'This is the content of my first post.'
    );