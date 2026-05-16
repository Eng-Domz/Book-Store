USE BookStoreDB;

INSERT INTO publishers (name, address, phone) VALUES
  ('Pearson', '221 River Street, Hoboken, NJ', '+1-201-236-7000'),
  ('O Reilly Media', '1005 Gravenstein Highway North, Sebastopol, CA', '+1-707-827-7000'),
  ('Penguin Random House', '1745 Broadway, New York, NY', '+1-212-782-9000')
ON DUPLICATE KEY UPDATE
  address = VALUES(address),
  phone = VALUES(phone);

INSERT INTO authors (author_name) VALUES
  ('Thomas H. Cormen'),
  ('Robert C. Martin'),
  ('Yuval Noah Harari'),
  ('Steven Pinker'),
  ('Ernst Gombrich')
ON DUPLICATE KEY UPDATE
  author_name = VALUES(author_name);

INSERT INTO books (
  isbn,
  title,
  publisher_name,
  publication_year,
  price,
  category,
  stock_quantity,
  threshold
) VALUES
  ('9780262046305', 'Introduction to Algorithms', 'Pearson', 2022, 89.99, 'Science', 12, 5),
  ('9780132350884', 'Clean Code', 'Pearson', 2008, 44.99, 'Science', 10, 4),
  ('9780062316097', 'Sapiens', 'Penguin Random House', 2015, 24.99, 'History', 15, 5),
  ('9780143122012', 'The Better Angels of Our Nature', 'Penguin Random House', 2012, 29.99, 'History', 8, 3),
  ('9780714832470', 'The Story of Art', 'Penguin Random House', 1995, 39.99, 'Art', 6, 2)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  publisher_name = VALUES(publisher_name),
  publication_year = VALUES(publication_year),
  price = VALUES(price),
  category = VALUES(category),
  stock_quantity = VALUES(stock_quantity),
  threshold = VALUES(threshold);

INSERT IGNORE INTO book_authors (isbn, author_id)
SELECT '9780262046305', author_id FROM authors WHERE author_name = 'Thomas H. Cormen';

INSERT IGNORE INTO book_authors (isbn, author_id)
SELECT '9780132350884', author_id FROM authors WHERE author_name = 'Robert C. Martin';

INSERT IGNORE INTO book_authors (isbn, author_id)
SELECT '9780062316097', author_id FROM authors WHERE author_name = 'Yuval Noah Harari';

INSERT IGNORE INTO book_authors (isbn, author_id)
SELECT '9780143122012', author_id FROM authors WHERE author_name = 'Steven Pinker';

INSERT IGNORE INTO book_authors (isbn, author_id)
SELECT '9780714832470', author_id FROM authors WHERE author_name = 'Ernst Gombrich';

-- Add admin/customer users through the app or insert bcrypt-hashed passwords here.
-- The backend expects passwords hashed with bcrypt.
