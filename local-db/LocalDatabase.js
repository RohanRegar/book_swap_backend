const FileUtils = require('./utils/fileUtils');
const { BPlusTree, BPlusTreeNode } = require('./structures/BPlusTree'); // Update this line
const SimpleIndex = require('./structures/SimpleIndex');

class LocalDatabase {
    constructor() {
        // Main data storage
        this.books = [];
        this.users = [];

        // Book indexes
        this.bookIndexes = {
            id: new BPlusTree(3),        // B+ tree for efficient ID lookups
            title: new SimpleIndex(),     // Hash index for title searches
            genre: new SimpleIndex(),     // Hash index for genre filtering
            owner: new SimpleIndex()      // Hash index for owner's books
        };

        // User indexes
        this.userIndexes = {
            id: new BPlusTree(3),        // B+ tree for efficient ID lookups
            email: new SimpleIndex()      // Hash index for email lookups
        };

        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // console.log('Initializing LocalDatabase...');

            // Load data from JSON files
            this.books = await FileUtils.readJsonFile('books.json') || [];
            this.users = await FileUtils.readJsonFile('users.json') || [];
            // console.log(`Loaded ${this.books.length} books and ${this.users.length} users`);

            // Load indexes
            const bookIndexData = await FileUtils.loadIndexes('book');
            const userIndexData = await FileUtils.loadIndexes('user');

            let indexesValid = true;

            if (bookIndexData && userIndexData) {
                // console.log('Restoring indexes from files...');
                try {
                    this.restoreIndexes('book', bookIndexData);
                    this.restoreIndexes('user', userIndexData);

                    // Validate indexes
                    indexesValid = await this.validateIndexes();
                } catch (error) {
                    console.error('Error restoring indexes:', error);
                    indexesValid = false;
                }
            } else {
                indexesValid = false;
            }

            // Rebuild indexes if validation failed
            if (!indexesValid) {
                // console.log('Indexes invalid or missing, rebuilding...');
                await this.rebuildIndexes();
            }

            this.initialized = true;
            // console.log('Database initialization completed');

        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }
    /**
     * Restore indexes from saved data
     * @param {string} type - Type of indexes ('book' or 'user')
     * @param {Object} indexData - Loaded index data
     */
    restoreIndexes(type, indexData) {
        try {
            // console.log(`Restoring ${type} indexes...`);

            const indexes = type === 'book' ? this.bookIndexes : this.userIndexes;

            // Restore simple indexes
            for (const [name, data] of Object.entries(indexData.indexes.simpleIndexes)) {
                if (indexes[name]) {
                    indexes[name] = new SimpleIndex();
                    // Convert array back to Map
                    data.forEach(([key, value]) => {
                        indexes[name].addToIndex(key, value);
                    });
                }
            }

            // Restore B+ tree indexes
            for (const [name, data] of Object.entries(indexData.indexes.bPlusTreeIndexes)) {
                if (indexes[name]) {
                    indexes[name] = new BPlusTree(data.order);
                    this.restoreBPlusTree(indexes[name], data);
                }
            }

            // console.log(`Successfully restored ${type} indexes`);
        } catch (error) {
            console.error(`Error restoring ${type} indexes:`, error);
            throw new Error(`Failed to restore ${type} indexes: ${error.message}`);
        }
    }
    /**
     * Restore a B+ tree from saved data
     * @param {BPlusTree} tree - B+ tree instance
     * @param {Object} data - Serialized tree data
     */
    restoreBPlusTree(tree, data) {
        if (data.root) {
            tree.root = this.restoreBPlusTreeNode(data.root);
            this.linkLeafNodes(tree.root);
        }
    }

    /**
     * Restore a B+ tree node from saved data
     * @param {Object} nodeData - Serialized node data
     * @returns {Object} Restored node
     */
    restoreBPlusTreeNode(nodeData) {
        if (!nodeData) return null;

        const node = new BPlusTreeNode(nodeData.isLeaf);
        node.keys = nodeData.keys;
        node.children = nodeData.children.map(child =>
            this.restoreBPlusTreeNode(child)
        );
        return node;
    }

    /**
     * Link leaf nodes in B+ tree
     * @param {Object} node - Current node
     * @returns {Object} Rightmost leaf node
     */
    linkLeafNodes(node) {
        if (!node) return null;

        if (node.isLeaf) {
            return node;
        }

        let lastLeaf = null;
        for (let child of node.children) {
            const rightmostLeaf = this.linkLeafNodes(child);
            if (lastLeaf) {
                lastLeaf.next = rightmostLeaf;
            }
            lastLeaf = rightmostLeaf;
        }

        return lastLeaf;
    }
    async rebuildIndexes() {
        // console.log('Rebuilding indexes...');

        // Clear existing indexes
        this.userIndexes = {
            id: new BPlusTree(3),
            email: new SimpleIndex()
        };

        this.bookIndexes = {
            id: new BPlusTree(3),
            title: new SimpleIndex(),
            genre: new SimpleIndex(),
            owner: new SimpleIndex()
        };

        // Rebuild user indexes
        this.users.forEach((user, index) => {
            this.userIndexes.id.insert(user._id, index);
            this.userIndexes.email.addToIndex(user.email.toLowerCase(), index);
        });

        // Rebuild book indexes
        this.books.forEach((book, index) => {
            this.bookIndexes.id.insert(book._id, index);
            this.bookIndexes.title.addToIndex(book.title.toLowerCase(), index);
            this.bookIndexes.genre.addToIndex(book.genre.toLowerCase(), index);
            this.bookIndexes.owner.addToIndex(book.owner, index);
        });

        // Save rebuilt indexes
        await this.saveIndexes();
        // console.log('Indexes rebuilt successfully');
    }

    verifyBPlusTree() {
        // console.log('Verifying B+ tree structure:');
        const tree = this.bookIndexes.id;

        // Print tree structure
        const printNode = (node, level = 0) => {
            const indent = '  '.repeat(level);
            // console.log(`${indent}Node (${node.isLeaf ? 'Leaf' : 'Internal'}):`);
            // console.log(`${indent}Keys:`, node.keys);

            if (!node.isLeaf) {
                node.children.forEach((child, index) => {
                    // console.log(`${indent}Child ${index}:`);
                    printNode(child, level + 1);
                });
            }
        };

        printNode(tree.root);
    }
    async saveIndexes() {
        await FileUtils.saveIndexes('book', this.bookIndexes);
        await FileUtils.saveIndexes('user', this.userIndexes);
    }

    // Book Operations
    async addBook(bookData) {
        const timeLabel = `AddBook_${Date.now()}`; // Unique label
        console.time(timeLabel);

        try {
            await this.initialize();

            const newBook = {
                _id: Date.now().toString(),
                ...bookData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Add to main storage
            this.books.push(newBook);
            const newIndex = this.books.length - 1;

            // Update indexes
            this.bookIndexes.id.insert(newBook._id, newIndex);
            this.bookIndexes.title.addToIndex(newBook.title.toLowerCase(), newIndex);
            this.bookIndexes.genre.addToIndex(newBook.genre.toLowerCase(), newIndex);
            this.bookIndexes.owner.addToIndex(newBook.owner, newIndex);

            // Save to files
            await Promise.all([
                FileUtils.writeJsonFile('books.json', this.books),
                this.saveIndexes()
            ]);

            console.timeEnd(timeLabel);
            return newBook;

        } catch (error) {
            console.timeEnd(timeLabel);
            throw error;
        }
    }

    async findUserByEmail(email) {
        await this.initialize();
        console.time('Find User by Email');

        const normalizedEmail = email.toLowerCase();
        // console.log('Searching for email:', normalizedEmail);

        const indices = this.userIndexes.email.search(normalizedEmail);
        // console.log('Found indices:', indices);

        const user = indices.length > 0 ? this.users[indices[0]] : null;
        // console.log('Found user:', user);

        console.timeEnd('Find User by Email');
        return user;
    }

    async findBooksByGenre(genre) {
        await this.initialize();
        console.time('Find Books by Genre');

        const indices = this.bookIndexes.genre.search(genre.toLowerCase());
        const books = indices.map(index => this.books[index]);

        console.timeEnd('Find Books by Genre');
        return books;
    }

    async findBooksByOwner(ownerId) {
        await this.initialize();
        console.time('Find Books by Owner');

        const indices = this.bookIndexes.owner.search(ownerId);
        const books = indices.map(index => this.books[index]);

        console.timeEnd('Find Books by Owner');
        return books;
    }
    async findBookById(_id) {
        await this.initialize();
        // console.time('Find Book by ID');

        try {
            // console.log('Input ID:', _id);
            const bookFromArray = this.books.find(book => book._id === _id);
            // console.log('Direct array search result:', bookFromArray);

            const index = this.bookIndexes.id.search(_id);
            // console.log('B+ Tree index result:', index);

            if (index !== null) {
                const bookFromIndex = this.books[index];
                // console.log('Book from index:', bookFromIndex);
                return bookFromIndex;
            }

            if (bookFromArray) {
                // console.log('Found book through direct search, index might be corrupted');
                await this.rebuildBookIdIndex();
                return bookFromArray;
            }

            return null;
        } catch (error) {
            console.error('Error in findBookById:', error);
            return null;
        }
    }

    async findBooksByTitle(title) {
        await this.initialize();
        console.time('Find Books by Title');

        const searchTitle = title.toLowerCase();
        const indices = this.bookIndexes.title.search(searchTitle);
        const books = indices.map(index => this.books[index]);

        console.timeEnd('Find Books by Title');
        return books;
    }
    // User Operations
    async addUser(userData) {
        await this.initialize();
        console.time('Add User');

        const newUser = {
            _id: Date.now().toString(),
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Add to main storage
        const newIndex = this.users.length;  // Calculate index before pushing
        this.users.push(newUser);

        // Debug log
        // console.log('Adding user to indexes:', {
        //     id: newUser._id,
        //     email: newUser.email.toLowerCase(),
        //     index: newIndex
        // });

        // Update indexes
        this.userIndexes.id.insert(newUser._id, newIndex);
        this.userIndexes.email.addToIndex(newUser.email.toLowerCase(), newIndex);

        // Debug log indexes after update
        // console.log('Email index after update:', this.userIndexes.email);

        // Save to files
        await Promise.all([
            FileUtils.writeJsonFile('users.json', this.users),
            this.saveIndexes()
        ]);

        console.timeEnd('Add User');
        return newUser;
    }

    async findUserById(id) {
        await this.initialize();
        console.time('Find User by ID');

        const index = this.userIndexes.id.search(id);
        const user = index !== null ? this.users[index] : null;

        console.timeEnd('Find User by ID');
        return user;
    }

    async findUserByEmail(email) {
        await this.initialize();
        console.time('Find User by Email');

        const indices = this.userIndexes.email.search(email.toLowerCase());
        const user = indices.length > 0 ? this.users[indices[0]] : null;

        console.timeEnd('Find User by Email');
        return user;
    }

    // Update Operations
    async updateBook(id, updateData) {
        await this.initialize();
        console.time('Update Book');

        const index = this.bookIndexes.id.search(id);
        if (index === null) {
            console.timeEnd('Update Book');
            return null;
        }

        // Update book data
        const book = this.books[index];
        const updatedBook = {
            ...book,
            ...updateData,
            _id: book._id, // Prevent ID modification
            updatedAt: new Date()
        };

        // Update main storage
        this.books[index] = updatedBook;

        // Update indexes
        if (updateData.title) {
            this.bookIndexes.title.addToIndex(updatedBook.title.toLowerCase(), index);
        }
        if (updateData.genre) {
            this.bookIndexes.genre.addToIndex(updatedBook.genre.toLowerCase(), index);
        }

        // Save changes
        await Promise.all([
            FileUtils.writeJsonFile('books.json', this.books),
            this.saveIndexes()
        ]);

        console.timeEnd('Update Book');
        return updatedBook;
    }

    // Delete Operations
    async deleteBook(id) {
        await this.initialize();
        console.time('Delete Book');

        const index = this.bookIndexes.id.search(id);
        if (index === null) {
            console.timeEnd('Delete Book');
            return false;
        }

        // Remove from main storage
        const [deletedBook] = this.books.splice(index, 1);

        // Rebuild indexes (since array indices have changed)
        await this.rebuildIndexes();

        console.timeEnd('Delete Book');
        return true;
    }

    // Utility Methods
    async clearDatabase() {
        this.books = [];
        this.users = [];
        this.bookIndexes = {
            id: new BPlusTree(3),
            title: new SimpleIndex(),
            genre: new SimpleIndex(),
            owner: new SimpleIndex()
        };
        this.userIndexes = {
            id: new BPlusTree(3),
            email: new SimpleIndex()
        };

        await Promise.all([
            FileUtils.writeJsonFile('books.json', this.books),
            FileUtils.writeJsonFile('users.json', this.users),
            this.saveIndexes()
        ]);
    }
    async validateIndexes() {
        // console.log('Validating indexes...');
        let isValid = true;

        // Check email index
        this.users.forEach((user, index) => {
            const indices = this.userIndexes.email.search(user.email.toLowerCase());
            if (!indices.includes(index)) {
                // console.error('Index mismatch for user:', user.email);
                // console.log('Expected index:', index);
                // console.log('Found indices:', indices);
                isValid = false;
            }
        });

        // Check id index
        this.users.forEach((user, index) => {
            const foundIndex = this.userIndexes.id.search(user._id);
            if (foundIndex !== index) {
                // console.error('ID index mismatch for user:', user._id);
                // console.log('Expected index:', index);
                // console.log('Found index:', foundIndex);
                isValid = false;
            }
        });

        return isValid;
    }
    async forceRebuildIndexes() {
        await this.initialize();
        // console.log('Force rebuilding indexes...');
        await this.rebuildIndexes();
        return true;
    }
    async rebuildBookIdIndex() {
        // console.log('Rebuilding book ID index...');
        this.bookIndexes.id = new BPlusTree(3);

        this.books.forEach((book, index) => {
            const bookId = book._id;
            this.bookIndexes.id.insert(bookId, index);

            const foundIndex = this.bookIndexes.id.search(bookId);
            if (foundIndex !== index) {
                console.error(`Index mismatch for book ${bookId}: expected ${index}, got ${foundIndex}`);
            }
        });

        await this.saveIndexes();
    }
}

// Export a singleton instance
module.exports = new LocalDatabase();