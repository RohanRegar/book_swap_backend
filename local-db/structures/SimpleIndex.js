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
}

module.exports = SimpleIndex;