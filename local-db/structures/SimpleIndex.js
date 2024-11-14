class SimpleIndex {
    constructor() {
        this.index = new Map();
    }

    addToIndex(key, value) {
        if (!this.index.has(key)) {
            this.index.set(key, []);
        }
        this.index.get(key).push(value);
    }

    search(key) {
        return this.index.get(key) || [];
    }

    toJSON() {
        return Array.from(this.index.entries());
    }

    static fromJSON(data) {
        const index = new SimpleIndex();
        if (data) {
            data.forEach(([key, values]) => {
                index.index.set(key, values);
            });
        }
        return index;
    }
}
// ... existing SimpleIndex class code ...

// Add this line at the end of the file
module.exports = SimpleIndex;