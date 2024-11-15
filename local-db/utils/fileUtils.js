const fs = require('fs').promises;
const path = require('path');

class FileUtils {
    /**
     * Read JSON data from a file
     * @param {string} filename - Name of the file to read
     * @returns {Promise<Object|Array|null>} Parsed JSON data or null if file doesn't exist
     */
    static async readJsonFile(filename) {
        try {
            // Construct the full path to the file
            const filePath = path.join(__dirname, '../../data', filename);

            // Read and parse the file
            console.log(`Reading file: ${filePath}`);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);

        } catch (error) {
            // Handle different types of errors
            if (error.code === 'ENOENT') {
                console.log(`File ${filename} not found, returning null`);
                return null;
            }

            console.error(`Error reading file ${filename}:`, error);
            throw new Error(`Failed to read ${filename}: ${error.message}`);
        }
    }

    /**
     * Write data to a JSON file
     * @param {string} filename - Name of the file to write
     * @param {Object|Array} data - Data to write to the file
     */
    static async writeJsonFile(filename, data) {
        try {
            // Construct the full path to the file
            const filePath = path.join(__dirname, '../../data', filename);

            // Create directory if it doesn't exist
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });

            // Write the file
            console.log(`Writing to file: ${filePath}`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        } catch (error) {
            console.error(`Error writing file ${filename}:`, error);
            throw new Error(`Failed to write ${filename}: ${error.message}`);
        }
    }

    /**
     * Save index structures to a file
     * @param {string} type - Type of indexes (e.g., 'book' or 'user')
     * @param {Object} indexes - Index structures to save
     */
    static async saveIndexes(type, indexes) {
        try {
            const indexPath = path.join(__dirname, '../../data/indexes', `${type}-indexes.json`);

            // Create indexes directory if it doesn't exist
            const dir = path.dirname(indexPath);
            await fs.mkdir(dir, { recursive: true });

            // Prepare index data for serialization
            const indexData = {
                timestamp: new Date(),
                indexes: {
                    simpleIndexes: {},
                    bPlusTreeIndexes: {}
                }
            };

            // Process each index
            for (const [name, index] of Object.entries(indexes)) {
                if (index.constructor.name === 'SimpleIndex') {
                    // Convert Map to array for JSON serialization
                    indexData.indexes.simpleIndexes[name] = Array.from(index.index.entries());
                } else if (index.constructor.name === 'BPlusTree') {
                    // Serialize B+ tree structure
                    indexData.indexes.bPlusTreeIndexes[name] = this.serializeBPlusTree(index);
                }
            }

            // console.log(`Saving ${type} indexes to: ${indexPath}`);
            await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2));

        } catch (error) {
            console.error(`Error saving indexes for ${type}:`, error);
            throw new Error(`Failed to save ${type} indexes: ${error.message}`);
        }
    }

    /**
     * Load index structures from a file
     * @param {string} type - Type of indexes to load (e.g., 'book' or 'user')
     * @returns {Promise<Object|null>} Loaded index data or null if file doesn't exist
     */
    static async loadIndexes(filename) {
        try {
            const filePath = path.join(__dirname, '../../data/indexes', filename);
            console.log(`Loading ${filename} from:`, filePath);

            try {
                const data = await fs.readFile(filePath, 'utf8');
                return data ? JSON.parse(data) : {
                    indexes: {
                        bPlusTreeIndexes: {},
                        simpleIndexes: {}
                    }
                };
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // Return default structure if file doesn't exist
                    return {
                        indexes: {
                            bPlusTreeIndexes: {},
                            simpleIndexes: {}
                        }
                    };
                }
                throw error;
            }
        } catch (error) {
            console.error(`Error loading indexes for ${filename}:`, error);
            throw new Error(`Failed to load ${filename}: ${error.message}`);
        }
    }

    /**
     * Serialize a B+ tree for storage
     * @param {BPlusTree} tree - B+ tree instance to serialize
     * @returns {Object} Serialized tree structure
     */
    static serializeBPlusTree(tree) {
        return {
            order: tree.order,
            root: this.serializeNode(tree.root)
        };
    }

    /**
     * Serialize a B+ tree node
     * @param {Object} node - B+ tree node to serialize
     * @returns {Object} Serialized node structure
     */
    static serializeNode(node) {
        if (!node) return null;

        return {
            keys: node.keys,
            children: node.children.map(child => this.serializeNode(child)),
            isLeaf: node.isLeaf,
            next: null // We don't serialize the next pointer as it's rebuilt during deserialization
        };
    }

    /**
     * Check if a file exists
     * @param {string} filename - Name of the file to check
     * @returns {Promise<boolean>} True if file exists, false otherwise
     */
    static async fileExists(filename) {
        try {
            const filePath = path.join(__dirname, '../../data', filename);
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Ensure a directory exists
     * @param {string} dirPath - Path to the directory
     */
    static async ensureDirectory(dirPath) {
        try {
            const fullPath = path.join(__dirname, '../../', dirPath);
            await fs.mkdir(fullPath, { recursive: true });
        } catch (error) {
            console.error(`Error creating directory ${dirPath}:`, error);
            throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
        }
    }

    /**
     * Delete a file if it exists
     * @param {string} filename - Name of the file to delete
     */
    static async deleteFile(filename) {
        try {
            const filePath = path.join(__dirname, '../../data', filename);
            await fs.unlink(filePath);
            console.log(`Deleted file: ${filename}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`Error deleting file ${filename}:`, error);
                throw new Error(`Failed to delete ${filename}: ${error.message}`);
            }
        }
    }
}

module.exports = FileUtils;