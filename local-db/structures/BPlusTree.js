class BPlusTreeNode {
    constructor(isLeaf = true) {
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
        this.next = null; // Pointer to the next leaf node
    }
}

class BPlusTree {
    constructor(order = 3) {
        this.root = new BPlusTreeNode();
        this.order = order;
    }

    insert(key, value) {
        const result = this._insertRecursive(this.root, key, value);
        if (result) {
            const newRoot = new BPlusTreeNode(false);
            newRoot.keys = [result.key];
            newRoot.children = [this.root, result.right];
            this.root = newRoot;
        }
    }

    _insertRecursive(node, key, value) {
        if (node.isLeaf) {
            return this._insertIntoLeaf(node, key, value);
        }

        let childIndex = 0;
        while (childIndex < node.keys.length && key >= node.keys[childIndex]) {
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
        while (insertIndex < node.keys.length && node.keys[insertIndex] < key) {
            insertIndex++;
        }

        node.keys.splice(insertIndex, 0, key);
        node.children.splice(insertIndex, 0, value);

        if (node.keys.length >= this.order) {
            return this._splitLeaf(node);
        }

        return null;
    }

    _splitLeaf(node) {
        const splitIndex = Math.floor(this.order / 2);
        const rightNode = new BPlusTreeNode(true);
        rightNode.keys = node.keys.splice(splitIndex);
        rightNode.children = node.children.splice(splitIndex);
        rightNode.next = node.next;
        node.next = rightNode;

        return { key: rightNode.keys[0], right: rightNode };
    }

    _insertIntoInternal(node, key, rightChild, childIndex) {
        node.keys.splice(childIndex, 0, key);
        node.children.splice(childIndex + 1, 0, rightChild);

        if (node.keys.length >= this.order) {
            return this._splitInternal(node);
        }

        return null;
    }

    _splitInternal(node) {
        const splitIndex = Math.floor((this.order - 1) / 2);
        const rightNode = new BPlusTreeNode(false);
        const middleKey = node.keys[splitIndex];
        rightNode.keys = node.keys.splice(splitIndex + 1);
        rightNode.children = node.children.splice(splitIndex + 1);

        return { key: middleKey, right: rightNode };
    }

    search(key) {
        let node = this.root;
        while (!node.isLeaf) {
            let childIndex = 0;
            while (childIndex < node.keys.length && key >= node.keys[childIndex]) {
                childIndex++;
            }
            node = node.children[childIndex];
        }

        const index = node.keys.indexOf(key);
        return index !== -1 ? node.children[index] : null;
    }
}

module.exports = { BPlusTree, BPlusTreeNode };