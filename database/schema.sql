CREATE DATABASE IF NOT EXISTS BookStoreDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE BookStoreDB;

SET FOREIGN_KEY_CHECKS = 0;

DROP TRIGGER IF EXISTS before_books_insert_validate;
DROP TRIGGER IF EXISTS before_books_update_validate;
DROP TRIGGER IF EXISTS before_order_items_insert_validate;
DROP TRIGGER IF EXISTS after_order_items_insert_update_stock;
DROP TRIGGER IF EXISTS after_publisher_orders_confirmed;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS publisher_orders;
DROP TABLE IF EXISTS book_authors;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS publishers;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  user_type ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE publishers (
  name VARCHAR(255) PRIMARY KEY,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE books (
  isbn VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  publisher_name VARCHAR(255) NOT NULL,
  publication_year INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category ENUM('Science', 'Art', 'Religion', 'History', 'Geography') NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  threshold INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_publisher
    FOREIGN KEY (publisher_name) REFERENCES publishers(name)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE authors (
  author_id INT AUTO_INCREMENT PRIMARY KEY,
  author_name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE book_authors (
  isbn VARCHAR(20) NOT NULL,
  author_id INT NOT NULL,
  PRIMARY KEY (isbn, author_id),
  CONSTRAINT fk_book_authors_book
    FOREIGN KEY (isbn) REFERENCES books(isbn)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_book_authors_author
    FOREIGN KEY (author_id) REFERENCES authors(author_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carts (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  cart_id INT NOT NULL,
  isbn VARCHAR(20) NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (cart_id, isbn),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_book
    FOREIGN KEY (isbn) REFERENCES books(isbn)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_items (
  order_id INT NOT NULL,
  isbn VARCHAR(20) NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (order_id, isbn),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_book
    FOREIGN KEY (isbn) REFERENCES books(isbn)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE publisher_orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  isbn VARCHAR(20) NOT NULL,
  quantity INT NOT NULL,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  order_status ENUM('Pending', 'Confirmed') NOT NULL DEFAULT 'Pending',
  CONSTRAINT fk_publisher_orders_book
    FOREIGN KEY (isbn) REFERENCES books(isbn)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_publisher ON books(publisher_name);
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);
CREATE INDEX idx_publisher_orders_isbn_status ON publisher_orders(isbn, order_status);

DELIMITER //

CREATE TRIGGER before_books_insert_validate
BEFORE INSERT ON books
FOR EACH ROW
BEGIN
  IF NEW.price < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book price cannot be negative';
  END IF;

  IF NEW.stock_quantity < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock quantity cannot be negative';
  END IF;

  IF NEW.threshold < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock threshold cannot be negative';
  END IF;
END//

CREATE TRIGGER before_books_update_validate
BEFORE UPDATE ON books
FOR EACH ROW
BEGIN
  IF NEW.price < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book price cannot be negative';
  END IF;

  IF NEW.stock_quantity < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock quantity cannot be negative';
  END IF;

  IF NEW.threshold < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock threshold cannot be negative';
  END IF;
END//

CREATE TRIGGER before_order_items_insert_validate
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE available_stock INT DEFAULT 0;

  IF NEW.quantity <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order item quantity must be positive';
  END IF;

  SELECT stock_quantity
    INTO available_stock
    FROM books
    WHERE isbn = NEW.isbn;

  IF available_stock < NEW.quantity THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for order item';
  END IF;
END//

CREATE TRIGGER after_order_items_insert_update_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE remaining_stock INT DEFAULT 0;
  DECLARE reorder_threshold INT DEFAULT 0;

  UPDATE books
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE isbn = NEW.isbn;

  SELECT stock_quantity, threshold
    INTO remaining_stock, reorder_threshold
    FROM books
    WHERE isbn = NEW.isbn;

  IF remaining_stock < reorder_threshold THEN
    INSERT INTO publisher_orders (isbn, quantity, order_date, order_status)
    VALUES (NEW.isbn, GREATEST(reorder_threshold * 2, 1), NOW(), 'Pending');
  END IF;
END//

CREATE TRIGGER after_publisher_orders_confirmed
AFTER UPDATE ON publisher_orders
FOR EACH ROW
BEGIN
  IF OLD.order_status <> 'Confirmed' AND NEW.order_status = 'Confirmed' THEN
    UPDATE books
      SET stock_quantity = stock_quantity + NEW.quantity
      WHERE isbn = NEW.isbn;
  END IF;
END//

DELIMITER ;
