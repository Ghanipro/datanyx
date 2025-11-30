const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Encryption utility for sensitive asset data and documents
 * Uses AES-256-CBC with IV for encryption
 */

class EncryptionService {
    constructor() {
        // Get encryption key from environment or create a default one
        // In production, use Azure Key Vault or similar secure storage
        let keyInput = process.env.ENCRYPTION_KEY;

        if (!keyInput) {
            this.encryptionKey = this.generateKey();
        } else {
            // If key is provided as hex string (64 chars), convert to buffer
            if (typeof keyInput === 'string' && keyInput.length === 64) {
                this.encryptionKey = Buffer.from(keyInput, 'hex');
            } else if (keyInput.length === 32) {
                this.encryptionKey = Buffer.isBuffer(keyInput) ? keyInput : Buffer.from(keyInput);
            } else {
                throw new Error('Encryption key must be exactly 32 bytes (64 hex characters)');
            }
        }

        // Validate key length (must be 32 bytes for AES-256)
        if (!Buffer.isBuffer(this.encryptionKey) || this.encryptionKey.length !== 32) {
            throw new Error('Encryption key must be exactly 32 bytes (64 hex characters when stored as env var)');
        }
    }

    /**
     * Generate a random 32-byte encryption key (for development only)
     */
    generateKey() {
        return crypto.randomBytes(32);
    }

    /**
     * Encrypt sensitive data
     * @param {string} data - Data to encrypt
     * @returns {object} - Contains iv and encryptedData (both hex encoded)
     */
    encrypt(data) {
        try {
            // Generate random IV for each encryption
            const iv = crypto.randomBytes(16);

            // Create cipher with AES-256-CBC
            const cipher = crypto.createCipheriv(
                'aes-256-cbc',
                typeof this.encryptionKey === 'string' ? Buffer.from(this.encryptionKey, 'hex') : this.encryptionKey,
                iv
            );

            let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');

            return {
                iv: iv.toString('hex'),
                encryptedData: encrypted,
                algorithm: 'aes-256-cbc'
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data: ' + error.message);
        }
    }

    /**
     * Decrypt encrypted data
     * @param {object} encryptedObject - Contains iv and encryptedData (both hex encoded)
     * @returns {object} - Decrypted data
     */
    decrypt(encryptedObject) {
        try {
            const { iv, encryptedData } = encryptedObject;

            if (!iv || !encryptedData) {
                throw new Error('Invalid encrypted object: missing iv or encryptedData');
            }

            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                typeof this.encryptionKey === 'string' ? Buffer.from(this.encryptionKey, 'hex') : this.encryptionKey,
                Buffer.from(iv, 'hex')
            );

            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data: ' + error.message);
        }
    }

    /**
     * Encrypt file content
     * @param {Buffer} fileContent - File content as buffer
     * @returns {object} - Contains iv and encryptedContent (hex)
     */
    encryptFile(fileContent) {
        try {
            const iv = crypto.randomBytes(16);

            const cipher = crypto.createCipheriv(
                'aes-256-cbc',
                typeof this.encryptionKey === 'string' ? Buffer.from(this.encryptionKey, 'hex') : this.encryptionKey,
                iv
            );

            let encrypted = cipher.update(fileContent);
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            return {
                iv: iv.toString('hex'),
                encryptedContent: encrypted.toString('hex'),
                algorithm: 'aes-256-cbc'
            };
        } catch (error) {
            console.error('File encryption error:', error);
            throw new Error('Failed to encrypt file: ' + error.message);
        }
    }

    /**
     * Decrypt file content
     * @param {object} encryptedObject - Contains iv and encryptedContent
     * @returns {Buffer} - Decrypted file content
     */
    decryptFile(encryptedObject) {
        try {
            const { iv, encryptedContent } = encryptedObject;

            if (!iv || !encryptedContent) {
                throw new Error('Invalid encrypted file object');
            }

            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                typeof this.encryptionKey === 'string' ? Buffer.from(this.encryptionKey, 'hex') : this.encryptionKey,
                Buffer.from(iv, 'hex')
            );

            let decrypted = decipher.update(Buffer.from(encryptedContent, 'hex'));
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted;
        } catch (error) {
            console.error('File decryption error:', error);
            throw new Error('Failed to decrypt file: ' + error.message);
        }
    }

    /**
     * Create hash for data integrity verification
     * @param {string} data - Data to hash
     * @returns {string} - SHA-256 hash in hex
     */
    createHash(data) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    /**
     * Verify data integrity using hash
     * @param {string} data - Data to verify
     * @param {string} hash - Original hash
     * @returns {boolean} - True if hashes match
     */
    verifyHash(data, hash) {
        const newHash = this.createHash(data);
        return newHash === hash;
    }
}

// Create singleton instance
const encryptionService = new EncryptionService();

module.exports = encryptionService;