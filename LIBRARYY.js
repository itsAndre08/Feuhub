var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
//  user: "yourusername",
//  password: "yourpassword",
  database: "books"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO books (Title, Author, Genre, Publication_Year, ISBN, Quantity_Available) VALUES (title, author, genre, publicationYear, isbn, quantityAvailable)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
});

// Load books from local storage or use dummy data
let books = JSON.parse(localStorage.getItem('books')) || [
    { bookId: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', genre: 'Fiction', publicationYear: 1925, isbn: '9781234567890', quantityAvailable: 5, borrowers: [] },
    // Add other book entries as needed
];

let deletedBooks = JSON.parse(localStorage.getItem('deletedBooks')) || [];

function addBook() {
    // Get form values
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const genre = document.getElementById('genre').value;
    const publicationYear = document.getElementById('publicationYear').value;
    const isbn = document.getElementById('isbn').value;
    const quantityAvailable = document.getElementById('quantityAvailable').value;

    // Create new book object
    const newBook = {
        bookId: books.length > 0 ? books[books.length - 1].bookId + 1 : 1,
        title: title,
        author: author,
        genre: genre,
        publicationYear: publicationYear,
        isbn: isbn,
        quantityAvailable: quantityAvailable,
        borrowers: [] // Initialize borrowers array
    };

    // Add the new book to the books array
    books.push(newBook);

    // Update local storage
    localStorage.setItem('books', JSON.stringify(books));

    // Update the book list
    updateBookList();
}

function updateBookList(bookArray = books) {
    const bookListElement = document.getElementById('bookList');

    // Clear existing content
    bookListElement.innerHTML = '';

    // Populate the book list dynamically
    bookArray.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.publicationYear}</td>
            <td>${book.isbn}</td>
            <td>${book.quantityAvailable}</td>
            <td>${book.borrowers.map(borrower => borrower.name + ' (' + borrower.date + ')').join(', ')}</td>
            <td>
                <button onclick="updateBook(${book.bookId})">Update</button>
                <button onclick="deleteBook(${book.bookId})">Delete</button>
                <button onclick="borrowBook(${book.bookId})" ${book.quantityAvailable === 0 ? 'class="disabled" disabled' : ''}>Borrow</button>
            </td>
        `;
        bookListElement.appendChild(row);
    });
}

function deleteBook(bookId) {
    // Find the index of the book to be deleted
    const index = books.findIndex(book => book.bookId === bookId);

    // Remove the book from the array and move it to deletedBooks
    const deletedBook = books.splice(index, 1)[0];
    deletedBooks.push(deletedBook);

    // Update local storage
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('deletedBooks', JSON.stringify(deletedBooks));

    // Update the book list
    updateBookList();
}

function recoverBook(bookId) {
    // Find the index of the book to be recovered
    const index = deletedBooks.findIndex(book => book.bookId === bookId);

    // Remove the book from deletedBooks and move it back to books
    const recoveredBook = deletedBooks.splice(index, 1)[0];
    books.push(recoveredBook);

    // Update local storage
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('deletedBooks', JSON.stringify(deletedBooks));

    // Update the book list
    updateBookList();
}

function updateBook(bookId) {
    // Find the index of the book to be updated
    const index = books.findIndex(book => book.bookId === bookId);

    // Prompt the user for updated details
    const updatedTitle = prompt('Enter updated title:', books[index].title);
    const updatedAuthor = prompt('Enter updated author:', books[index].author);
    const updatedGenre = prompt('Enter updated genre:', books[index].genre);
    const updatedPublicationYear = prompt('Enter updated publication year:', books[index].publicationYear);
    const updatedIsbn = prompt('Enter updated ISBN:', books[index].isbn);
    const updatedQuantityAvailable = prompt('Enter updated quantity available:', books[index].quantityAvailable);

    // Update the book details
    books[index] = {
        ...books[index],
        title: updatedTitle || books[index].title,
        author: updatedAuthor || books[index].author,
        genre: updatedGenre || books[index].genre,
        publicationYear: updatedPublicationYear || books[index].publicationYear,
        isbn: updatedIsbn || books[index].isbn,
        quantityAvailable: updatedQuantityAvailable || books[index].quantityAvailable
    };

    // Update local storage
    localStorage.setItem('books', JSON.stringify(books));

    // Update the book list
    updateBookList();
}

function borrowBook(bookId) {
    // Find the index of the book to be borrowed
    const index = books.findIndex(book => book.bookId === bookId);

    // Check if there are available stocks
    if (books[index].quantityAvailable > 0) {
        // Prompt the user for borrower's name
        const borrowerName = prompt('Enter borrower\'s name:');

        // Record date and time of borrowing
        const borrowDate = new Date().toLocaleString();

        // Add borrower's name and borrowing date to the book's borrowers array
        books[index].borrowers.push({ name: borrowerName, date: borrowDate });

        // Decrease the quantity available
        books[index].quantityAvailable--;

        // Update local storage
        localStorage.setItem('books', JSON.stringify(books));

        // Update the book list
        updateBookList();
    } else {
        alert('No stocks available for borrowing.');
    }
}

function searchBooks() {
    const searchQuery = document.getElementById('searchQuery').value.toLowerCase();

    // Filter books based on search query
    const searchResults = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery) ||
        book.author.toLowerCase().includes(searchQuery) ||
        book.genre.toLowerCase().includes(searchQuery) ||
        book.isbn.toLowerCase().includes(searchQuery)
    );

    // Update the book list with search results
    updateBookList(searchResults);
}

// Initial book list update
updateBookList();
