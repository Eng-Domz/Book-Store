const db = require('../config/db');

// Add new book (Admin only)
const addBook = async (req, res) => {
  try {
    const { isbn, title, authors, publisherName, publicationYear, price, category, stockQuantity, threshold } = req.body;

    // Validate required fields
    if (!isbn || !title || !authors || !publisherName || !publicationYear || !price || !category || stockQuantity === undefined || threshold === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate category
    const validCategories = ['Science', 'Art', 'Religion', 'History', 'Geography'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Check if ISBN already exists
    const [existingBooks] = await db.query('SELECT isbn FROM Books WHERE isbn = ?', [isbn]);
    if (existingBooks.length > 0) {
      return res.status(400).json({ error: 'Book with this ISBN already exists' });
    }

    // Check if publisher exists
    const [publishers] = await db.query('SELECT name FROM Publishers WHERE name = ?', [publisherName]);
    if (publishers.length === 0) {
      return res.status(400).json({ error: 'Publisher does not exist. Please create publisher first.' });
    }

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // Insert book
      await db.query(
        `INSERT INTO Books (isbn, title, publisher_name, publication_year, price, category, stock_quantity, threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [isbn, title, publisherName, publicationYear, price, category, stockQuantity, threshold]
      );

      // Insert authors (assuming authors is an array)
      const authorArray = Array.isArray(authors) ? authors : [authors];
      for (const authorName of authorArray) {
        // Check if author exists, if not create it
        let [authorRows] = await db.query('SELECT author_id FROM Authors WHERE author_name = ?', [authorName]);
        let authorId;

        if (authorRows.length === 0) {
          const [result] = await db.query('INSERT INTO Authors (author_name) VALUES (?)', [authorName]);
          authorId = result.insertId;
        } else {
          authorId = authorRows[0].author_id;
        }

        // Link book to author
        await db.query('INSERT INTO Book_Authors (isbn, author_id) VALUES (?, ?)', [isbn, authorId]);
      }

      await db.query('COMMIT');
      res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
};

// Update book (Admin only)
const updateBook = async (req, res) => {
  try {
    const { isbn } = req.params;
    const { title, authors, publisherName, publicationYear, price, category, stockQuantity } = req.body;

    // Check if book exists
    const [books] = await db.query('SELECT * FROM Books WHERE isbn = ?', [isbn]);
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (publisherName) {
      updates.push('publisher_name = ?');
      values.push(publisherName);
    }
    if (publicationYear) {
      updates.push('publication_year = ?');
      values.push(publicationYear);
    }
    if (price) {
      updates.push('price = ?');
      values.push(price);
    }
    if (category) {
      const validCategories = ['Science', 'Art', 'Religion', 'History', 'Geography'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      updates.push('category = ?');
      values.push(category);
    }
    if (stockQuantity !== undefined) {
      // Check if update would make quantity negative (handled by trigger, but we check here too)
      if (stockQuantity < 0) {
        return res.status(400).json({ error: 'Stock quantity cannot be negative' });
      }
      updates.push('stock_quantity = ?');
      values.push(stockQuantity);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(isbn);

    await db.query(
      `UPDATE Books SET ${updates.join(', ')} WHERE isbn = ?`,
      values
    );

    // Update authors if provided
    if (authors) {
      await db.query('DELETE FROM Book_Authors WHERE isbn = ?', [isbn]);
      const authorArray = Array.isArray(authors) ? authors : [authors];
      for (const authorName of authorArray) {
        let [authorRows] = await db.query('SELECT author_id FROM Authors WHERE author_name = ?', [authorName]);
        let authorId;

        if (authorRows.length === 0) {
          const [result] = await db.query('INSERT INTO Authors (author_name) VALUES (?)', [authorName]);
          authorId = result.insertId;
        } else {
          authorId = authorRows[0].author_id;
        }

        await db.query('INSERT INTO Book_Authors (isbn, author_id) VALUES (?, ?)', [isbn, authorId]);
      }
    }

    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
};

// Search books
const searchBooks = async (req, res) => {
  try {
    const { isbn, title, category, author, publisher } = req.query;

    let query = `
      SELECT DISTINCT b.isbn, b.title, b.publication_year, b.price, b.category, 
             b.stock_quantity, b.publisher_name,
             GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
      FROM Books b
      LEFT JOIN Book_Authors ba ON b.isbn = ba.isbn
      LEFT JOIN Authors a ON ba.author_id = a.author_id
      WHERE 1=1
    `;
    const params = [];

    if (isbn) {
      query += ' AND b.isbn = ?';
      params.push(isbn);
    }
    if (title) {
      query += ' AND b.title LIKE ?';
      params.push(`%${title}%`);
    }
    if (category) {
      query += ' AND b.category = ?';
      params.push(category);
    }
    if (author) {
      query += ' AND a.author_name LIKE ?';
      params.push(`%${author}%`);
    }
    if (publisher) {
      query += ' AND b.publisher_name LIKE ?';
      params.push(`%${publisher}%`);
    }

    query += ' GROUP BY b.isbn, b.title, b.publication_year, b.price, b.category, b.stock_quantity, b.publisher_name';

    const [books] = await db.query(query, params);

    // Format response
    const formattedBooks = books.map(book => ({
      ...book,
      available: book.stock_quantity > 0
    }));

    res.json({ books: formattedBooks });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({ error: 'Failed to search books' });
  }
};

// Get book by ISBN
const getBookByISBN = async (req, res) => {
  try {
    const { isbn } = req.params;

    const [books] = await db.query(
      `SELECT b.*, p.address, p.phone,
              GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
       FROM Books b
       LEFT JOIN Publishers p ON b.publisher_name = p.name
       LEFT JOIN Book_Authors ba ON b.isbn = ba.isbn
       LEFT JOIN Authors a ON ba.author_id = a.author_id
       WHERE b.isbn = ?
       GROUP BY b.isbn`,
      [isbn]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[0];
    book.available = book.stock_quantity > 0;

    res.json({ book });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to get book' });
  }
};

// Get all books (for admin)
const getAllBooks = async (req, res) => {
  try {
    const [books] = await db.query(
      `SELECT b.*, p.address, p.phone,
              GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as authors
       FROM Books b
       LEFT JOIN Publishers p ON b.publisher_name = p.name
       LEFT JOIN Book_Authors ba ON b.isbn = ba.isbn
       LEFT JOIN Authors a ON ba.author_id = a.author_id
       GROUP BY b.isbn
       ORDER BY b.title`
    );

    res.json({ books });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({ error: 'Failed to get books' });
  }
};

module.exports = {
  addBook,
  updateBook,
  searchBooks,
  getBookByISBN,
  getAllBooks
};
