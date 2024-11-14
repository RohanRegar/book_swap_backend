class BPlusTreeNode {
    constructor(isLeaf = true) {
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
        this.next = null;
    }
}

class BPlusTree {
    constructor(order = 3) {
        this.root = new BPlusTreeNode();
        this.order = order;
        this.minKeys = Math.floor((order - 1) / 2);
    }

    insert(key, value) {
        if (this.root.keys.length === 0) {
            this.root.keys.push({ key, value });
            return;
        }

        const splitResult = this._insertRecursive(this.root, key, value);
        if (splitResult) {
            const newRoot = new BPlusTreeNode(false);
            newRoot.keys.push(splitResult.key);
            newRoot.children.push(this.root);
            newRoot.children.push(splitResult.right);
            this.root = newRoot;
        }
    }

    _insertRecursive(node, key, value) {
        if (node.isLeaf) {
            return this._insertIntoLeaf(node, key, value);
        }

        // Find the appropriate child to insert into
        let childIndex = 0;
        while (childIndex < node.keys.length && key >= node.keys[childIndex].key) {
            childIndex++;
        }

        const splitResult = this._insertRecursive(node.children[childIndex], key, value);
        if (!splitResult) {
            return null;
        }

        // Insert the split key into the internal node
        return this._insertIntoInternal(node, splitResult.key, splitResult.right, childIndex);
    }

    _insertIntoLeaf(node, key, value) {
        let insertIndex = 0;
        while (insertIndex < node.keys.length && node.keys[insertIndex].key < key) {
            insertIndex++;
        }

        // If key already exists, update value
        if (insertIndex < node.keys.length && node.keys[insertIndex].key === key) {
            node.keys[insertIndex].value = value;
            return null;
        }

        node.keys.splice(insertIndex, 0, { key, value });

        // Check if node needs splitting
        if (node.keys.length >= this.order) {
            return this._splitLeaf(node);
        }

        return null;
    }

    _insertIntoInternal(node, key, rightChild, childIndex) {
        node.keys.splice(childIndex, 0, { key, value: null });
        node.children.splice(childIndex + 1, 0, rightChild);

        if (node.keys.length >= this.order) {
            return this._splitInternal(node);
        }

        return null;
    }

    _splitLeaf(node) {
        const splitIndex = Math.floor(this.order / 2);
        const rightNode = new BPlusTreeNode(true);

        // Move half of the keys to the right node
        rightNode.keys = node.keys.splice(splitIndex);

        // Set up the leaf node links
        rightNode.next = node.next;
        node.next = rightNode;

        // Return the split information
        return {
            key: rightNode.keys[0].key,
            right: rightNode
        };
    }

    _splitInternal(node) {
        const splitIndex = Math.floor((this.order - 1) / 2);
        const rightNode = new BPlusTreeNode(false);

        // Get the middle key that will be pushed up
        const middleKey = node.keys[splitIndex];

        // Move keys and children to the right node
        rightNode.keys = node.keys.splice(splitIndex + 1);
        rightNode.children = node.children.splice(splitIndex + 1);

        // Remove the middle key from the left node
        node.keys.splice(splitIndex);

        return {
            key: middleKey,
            right: rightNode
        };
    }

    search(key) {
        let node = this.root;

        while (!node.isLeaf) {
            let childIndex = 0;
            while (childIndex < node.keys.length && key >= node.keys[childIndex].key) {
                childIndex++;
            }
            node = node.children[childIndex];
        }

        for (const entry of node.keys) {
            if (entry.key === key) {
                return entry.value;
            }
        }
        return null;
    }

    rangeSearch(startKey, endKey) {
        const result = [];
        let node = this.root;

        // Find the leaf node containing the start key
        while (!node.isLeaf) {
            let childIndex = 0;
            while (childIndex < node.keys.length && startKey >= node.keys[childIndex].key) {
                childIndex++;
            }
            node = node.children[childIndex];
        }

        // Collect all values within the range
        while (node !== null) {
            for (const entry of node.keys) {
                if (entry.key >= startKey && entry.key <= endKey) {
                    result.push(entry.value);
                }
                if (entry.key > endKey) {
                    return result;
                }
            }
            node = node.next;
        }

        return result;
    }
    toJSON() {
        return {
            order: this.order,
            root: this.serializeNode(this.root)
        };
    }

    serializeNode(node) {
        if (!node) return null;
        return {
            keys: node.keys,
            children: node.isLeaf ? [] : node.children.map(child => this.serializeNode(child)),
            isLeaf: node.isLeaf,
            next: node.next ? this.serializeNode(node.next) : null
        };
    }

    static fromJSON(data) {
        if (!data) return new BPlusTree(3);

        const tree = new BPlusTree(data.order);
        tree.root = BPlusTree.deserializeNode(data.root);
        return tree;
    }

    static deserializeNode(data) {
        if (!data) return null;

        const node = new BPlusTreeNode(data.isLeaf);
        node.keys = data.keys;
        node.children = data.children.map(child => BPlusTree.deserializeNode(child));
        node.next = BPlusTree.deserializeNode(data.next);
        return node;
    }
}

module.exports = { BPlusTree, BPlusTreeNode };