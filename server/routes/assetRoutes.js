const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const multer = require('multer');
const path = require('path');
const encryptionService = require('../utils/encryption');
const fs = require('fs');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// GET All Assets
router.get('/', async(req, res) => {
    try {
        const assets = await Asset.find();

        // Decrypt sensitive data before sending to client
        const decryptedAssets = assets.map(asset => {
            const assetObj = asset.toObject();

            // Decrypt documents if encrypted
            if (assetObj.documents && assetObj.documents.length > 0) {
                assetObj.documents = assetObj.documents.map(doc => {
                    if (doc.isEncrypted && doc.encryptedContent) {
                        try {
                            doc.extractedData = encryptionService.decrypt(doc.encryptedContent);
                            delete doc.encryptedContent; // Don't send encrypted content to client
                        } catch (err) {
                            console.error('Error decrypting document:', err);
                            doc.extractedData = { error: 'Unable to decrypt document' };
                        }
                    }
                    return doc;
                });
            }

            // Decrypt sensitive asset data if encrypted
            if (assetObj.sensitiveData && assetObj.encryptionMetadata && assetObj.encryptionMetadata.isEncrypted) {
                try {
                    if (assetObj.sensitiveData.encryptedBorrowerDetails) {
                        assetObj.borrowerDetails = encryptionService.decrypt(assetObj.sensitiveData.encryptedBorrowerDetails);
                    }
                    if (assetObj.sensitiveData.encryptedFinancialData) {
                        assetObj.financialData = encryptionService.decrypt(assetObj.sensitiveData.encryptedFinancialData);
                    }
                } catch (err) {
                    console.error('Error decrypting sensitive data:', err);
                }
                delete assetObj.sensitiveData; // Remove encrypted wrapper
            }

            return assetObj;
        });

        res.json(decryptedAssets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Single Asset
router.get('/:id', async(req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        const assetObj = asset.toObject();

        // Decrypt documents
        if (assetObj.documents && assetObj.documents.length > 0) {
            assetObj.documents = assetObj.documents.map(doc => {
                if (doc.isEncrypted && doc.encryptedContent) {
                    try {
                        doc.extractedData = encryptionService.decrypt(doc.encryptedContent);
                        delete doc.encryptedContent;
                    } catch (err) {
                        console.error('Error decrypting document:', err);
                        doc.extractedData = { error: 'Unable to decrypt document' };
                    }
                }
                return doc;
            });
        }

        // Decrypt sensitive data
        if (assetObj.sensitiveData && assetObj.encryptionMetadata && assetObj.encryptionMetadata.isEncrypted) {
            try {
                if (assetObj.sensitiveData.encryptedBorrowerDetails) {
                    assetObj.borrowerDetails = encryptionService.decrypt(assetObj.sensitiveData.encryptedBorrowerDetails);
                }
                if (assetObj.sensitiveData.encryptedFinancialData) {
                    assetObj.financialData = encryptionService.decrypt(assetObj.sensitiveData.encryptedFinancialData);
                }
            } catch (err) {
                console.error('Error decrypting sensitive data:', err);
            }
            delete assetObj.sensitiveData;
        }

        res.json(assetObj);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST Create Asset (With Image AND Mandatory Document)
const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'document', maxCount: 1 }]);

router.post('/', cpUpload, async(req, res) => {
    try {
        const assetData = req.body;

        // Process nested coordinates
        if (assetData['coordinates[lat]']) {
            assetData.coordinates = {
                lat: parseFloat(assetData['coordinates[lat]']),
                lng: parseFloat(assetData['coordinates[lng]'])
            };
        }

        // Validate Area SqFt for specific types
        const needsArea = ['Residential', 'Commercial', 'Industrial', 'Land'];
        if (needsArea.includes(assetData.type) && !assetData.areaSqFt) {
            return res.status(400).json({ message: `Area in Sq Ft is mandatory for ${assetData.type}` });
        }

        // Process Image
        if (req.files['image']) {
            assetData.imageUrl = req.files['image'][0].path.replace(/\\/g, "/");
        }

        // Process Mandatory Document with ENCRYPTION
        const docs = [];
        if (req.files['document']) {
            const docFile = req.files['document'][0];

            // Parse extractedData if provided from frontend AI processing
            let extractedData = {};
            try {
                if (assetData.extractedData) {
                    extractedData = JSON.parse(assetData.extractedData);
                }
            } catch (e) {
                console.error("Failed to parse extractedData", e);
            }

            // Encrypt the extracted data for sensitive storage
            const encryptedExtractedData = encryptionService.encrypt(extractedData);
            const dataHash = encryptionService.createHash(extractedData);

            docs.push({
                id: Date.now().toString(),
                name: docFile.originalname,
                type: 'Initial Disclosure',
                uploadDate: new Date().toISOString().split('T')[0],
                status: 'verified',
                filePath: docFile.path.replace(/\\/g, "/"),
                isEncrypted: true,
                encryptedContent: encryptedExtractedData,
                dataIntegrityHash: dataHash,
                encryptionTimestamp: new Date(),
                encryptedBy: (req.user && req.user.id) || 'system'
            });
        } else {
            return res.status(400).json({ message: "Mandatory document is missing" });
        }
        assetData.documents = docs;

        // Encrypt sensitive borrower and financial data
        const borrowerDetails = {
            name: assetData.borrowerName,
            loanAccount: assetData.loanAccountNumber
        };

        const financialData = {
            outstanding: assetData.outstandingAmount,
            marketValue: assetData.marketValue,
            reservePrice: assetData.reservePrice
        };

        assetData.sensitiveData = {
            encryptedBorrowerDetails: encryptionService.encrypt(borrowerDetails),
            encryptedFinancialData: encryptionService.encrypt(financialData)
        };

        // Add encryption metadata
        assetData.encryptionMetadata = {
            isEncrypted: true,
            encryptionMethod: 'aes-256-cbc',
            encryptedAt: new Date(),
            encryptedBy: (req.user && req.user.id) || 'system',
            dataClassification: 'confidential'
        };

        assetData.dataIntegrityHash = encryptionService.createHash(assetData);

        // Add audit log entry
        assetData.auditLog = [{
            action: 'asset_created',
            timestamp: new Date(),
            userId: req.user && id || 'system',
            details: 'Asset created with encrypted sensitive data'
        }];

        // Process Keywords (sent as string from frontend)
        if (typeof assetData.keywords === 'string') {
            assetData.keywords = assetData.keywords.split(',').map(k => k.trim());
        }

        const asset = new Asset(assetData);
        const newAsset = await asset.save();

        // Return decrypted version to client
        const responseAsset = newAsset.toObject();
        if (responseAsset.documents && responseAsset.documents.length > 0) {
            responseAsset.documents = responseAsset.documents.map(doc => {
                if (doc.encryptedContent) {
                    doc.extractedData = encryptionService.decrypt(doc.encryptedContent);
                    delete doc.encryptedContent;
                }
                return doc;
            });
        }

        res.status(201).json(responseAsset);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// PATCH Update Asset
router.patch('/:id', async(req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(asset);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST Add Legal Event
router.post('/:id/events', async(req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        const newEvent = {
            id: Date.now().toString(),
            ...req.body
        };

        asset.timeline.push(newEvent);
        await asset.save();
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST Upload Document
router.post('/:id/documents', upload.single('file'), async(req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        const extractedData = JSON.parse(req.body.extracted_data || '{}');

        // Encrypt the extracted data
        const encryptedExtractedData = encryptionService.encrypt(extractedData);
        const dataHash = encryptionService.createHash(extractedData);

        const newDoc = {
            id: Date.now().toString(),
            name: req.body.name || req.file.originalname,
            type: req.body.doc_type || 'Unknown',
            uploadDate: new Date().toISOString().split('T')[0],
            status: req.body.status || 'verified',
            filePath: req.file ? req.file.path : null,
            isEncrypted: true,
            encryptedContent: encryptedExtractedData,
            dataIntegrityHash: dataHash,
            encryptionTimestamp: new Date(),
            encryptedBy: req.user && id || 'system'
        };

        asset.documents.push(newDoc);

        // Add audit log
        asset.auditLog.push({
            action: 'document_uploaded',
            timestamp: new Date(),
            userId: req.user && id || 'system',
            details: `Document uploaded and encrypted: ${newDoc.name}`
        });

        await asset.save();

        // Return decrypted version to client
        const responseDoc = JSON.parse(JSON.stringify(newDoc));
        if (responseDoc.encryptedContent) {
            responseDoc.extractedData = encryptionService.decrypt(responseDoc.encryptedContent);
            delete responseDoc.encryptedContent;
        }

        res.status(201).json(responseDoc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;