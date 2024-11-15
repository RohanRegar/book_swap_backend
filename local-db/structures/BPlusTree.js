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
        if (!this.root) {
            this.root = new BPlusTreeNode(true);
        }

        const insertKey = key.toString();
        const insertValue = value;

        let result = this._insertRecursive(this.root, insertKey, insertValue);
        if (result) {
            // Create new root
            const newRoot = new BPlusTreeNode(false);
            newRoot.keys = [result.key];
            newRoot.children = [this.root, result.right];
            this.root = newRoot;
        }
    }

    search(key) {
        if (!this.root) return null;

        let node = this.root;
        const searchKey = key.toString();

        while (!node.isLeaf) {
            let childIndex = 0;
            while (childIndex < node.keys.length) {
                const nodeKey = (node.keys[childIndex].key || '').toString();
                if (searchKey < nodeKey) break;
                childIndex++;
            }
            node = node.children[childIndex];
        }

        // Search leaf node
        for (const entry of node.keys) {
            if (entry.key.toString() === searchKey) {
                return entry.value;
            }
        }

        return null;
    }

    // ... rest of the methods remain unchanged ...
    _insertRecursive(node, key, value) {
        if (node.isLeaf) {
            return this._insertIntoLeaf(node, key, value);
        }

        let childIndex = 0;
        while (childIndex < node.keys.length && key >= node.keys[childIndex].key) {
            childIndex++;
        }

        const splitResult = this._insertRecursive(node.children[childIndex], key, value);
        if (!splitResult) {
            return null;
        }

        return this._insertIntoInternal(node, splitResult.key, splitResult.right, childIndex);
    }

    _insertIntoLeaf(node, key, value) {
        let insertIndex = 0;
        while (insertIndex < node.keys.length && node.keys[insertIndex].key < key) {
            insertIndex++;
        }

        if (insertIndex < node.keys.length && node.keys[insertIndex].key === key) {
            node.keys[insertIndex].value = value;
            return null;
        }

        node.keys.splice(insertIndex, 0, { key, value });

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
        rightNode.keys = node.keys.splice(splitIndex);
        rightNode.next = node.next;
        node.next = rightNode;

        return {
            key: rightNode.keys[0].key,
            right: rightNode
        };
    }

    _splitInternal(node) {
        const splitIndex = Math.floor((this.order - 1) / 2);
        const rightNode = new BPlusTreeNode(false);
        const middleKey = node.keys[splitIndex];
        rightNode.keys = node.keys.splice(splitIndex + 1);
        rightNode.children = node.children.splice(splitIndex + 1);
        node.keys.splice(splitIndex);

        return {
            key: middleKey,
            right: rightNode
        };
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