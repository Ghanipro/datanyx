const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');
const multer = require('multer');
const path = require('path');

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
        res.json(assets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET Single Asset
router.get('/:id', async(req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        res.json(asset);
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

        // Process Mandatory Document
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

            docs.push({
                id: Date.now().toString(),
                name: docFile.originalname,
                type: 'Initial Disclosure',
                uploadDate: new Date().toISOString().split('T')[0],
                status: 'verified',
                filePath: docFile.path.replace(/\\/g, "/"),
                extractedData: extractedData
            });
        } else {
            return res.status(400).json({ message: "Mandatory document is missing" });
        }
        assetData.documents = docs;

        // Process Keywords (sent as string from frontend)
        if (typeof assetData.keywords === 'string') {
            assetData.keywords = assetData.keywords.split(',').map(k => k.trim());
        }

        const asset = new Asset(assetData);
        const newAsset = await asset.save();
        res.status(201).json(newAsset);
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

        const newDoc = {
            id: Date.now().toString(),
            name: req.body.name || req.file.originalname,
            type: req.body.doc_type || 'Unknown',
            uploadDate: new Date().toISOString().split('T')[0],
            status: req.body.status || 'verified',
            extractedData: extractedData,
            filePath: req.file ? req.file.path : null
        };

        asset.documents.push(newDoc);
        await asset.save();

        res.status(201).json(newDoc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;