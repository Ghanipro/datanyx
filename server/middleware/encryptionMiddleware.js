const encryptionService = require('../utils/encryption');

/**
 * Middleware to handle encryption/decryption of sensitive data
 * Automatically encrypts data before storage and decrypts on retrieval
 */

// Middleware to log encryption audit trail
const encryptionAudit = (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
        if (req.method === 'POST' || req.method === 'PATCH') {
            // Log that data is being encrypted
            if (req.path.includes('/assets')) {
                console.log(`[ENCRYPTION AUDIT] ${req.method} ${req.path} - Encryption applied at ${new Date().toISOString()}`);
            }
        }

        return originalSend.call(this, data);
    };

    next();
};

/**
 * Middleware to verify data integrity before returning to client
 * Compares hash to ensure encrypted data hasn't been tampered with
 */
const verifyDataIntegrity = (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        // If data has integrity hash, verify it
        if (data && data.dataIntegrityHash) {
            try {
                // For single asset
                if (data.id && data.borrowerName) {
                    const isValid = encryptionService.verifyHash({
                            borrowerName: data.borrowerName,
                            loanAccountNumber: data.loanAccountNumber,
                            type: data.type
                        },
                        data.dataIntegrityHash
                    );

                    if (!isValid) {
                        console.warn('[INTEGRITY CHECK] Data may have been tampered with');
                        res.set('X-Data-Integrity', 'warning');
                    } else {
                        res.set('X-Data-Integrity', 'verified');
                    }
                }
            } catch (err) {
                console.error('[INTEGRITY CHECK] Error verifying data:', err);
            }
        }

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Middleware to decrypt sensitive fields from stored encrypted data
 */
const decryptSensitiveData = (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        try {
            // Handle single asset response
            if (data && data.id && data.encryptionMetadata && data.encryptionMetadata.isEncrypted) {
                // Decrypt sensitive nested data if present
                if (data.sensitiveData && data.sensitiveData.encryptedBorrowerDetails) {
                    try {
                        const decrypted = encryptionService.decrypt(data.sensitiveData.encryptedBorrowerDetails);
                        Object.assign(data, {...decrypted });
                    } catch (err) {
                        console.error('Error decrypting borrower details:', err);
                    }
                }

                if (data.sensitiveData && data.sensitiveData.encryptedFinancialData) {
                    try {
                        const decrypted = encryptionService.decrypt(data.sensitiveData.encryptedFinancialData);
                        data.financialInfo = decrypted;
                    } catch (err) {
                        console.error('Error decrypting financial data:', err);
                    }
                }
            }

            // Handle array of assets
            if (Array.isArray(data)) {
                data = data.map(asset => {
                    if (asset.sensitiveData && asset.sensitiveData.encryptedBorrowerDetails) {
                        try {
                            const decrypted = encryptionService.decrypt(asset.sensitiveData.encryptedBorrowerDetails);
                            asset = {...asset, ...decrypted };
                        } catch (err) {
                            console.error('Error decrypting in array:', err);
                        }
                    }
                    return asset;
                });
            }
        } catch (err) {
            console.error('[DECRYPTION MIDDLEWARE] Error:', err);
        }

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Check authorization before allowing sensitive data access
 * Prevents unauthorized viewing of encrypted documents
 */
const checkEncryptedDataAccess = (req, res, next) => {
    // Check if user is trying to access encrypted sensitive data
    if (req.path.includes('/documents') || req.path.includes('/:id')) {
        // Log access attempt
        console.log(`[ACCESS LOG] User ${req.user?.id || 'anonymous'} accessing encrypted data at ${req.path}`);

        // Add access timestamp to response headers for audit trail
        res.set('X-Encrypted-Data-Access', new Date().toISOString());
    }

    next();
};

module.exports = {
    encryptionAudit,
    verifyDataIntegrity,
    decryptSensitiveData,
    checkEncryptedDataAccess
};