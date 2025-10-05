const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

// Save daily import data
app.post('/api/save-daily-import', async (req, res) => {
    try {
        await ensureDataDir();
        
        const data = req.body;
        const filename = `daily-import-${data.date}.json`;
        const filepath = path.join(DATA_DIR, filename);
        
        // Add timestamp if not present
        if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
        }
        
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Data saved successfully',
            filename: filename,
            filepath: filepath
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save data',
            error: error.message 
        });
    }
});

// Get all saved daily imports
app.get('/api/daily-imports', async (req, res) => {
    try {
        await ensureDataDir();
        
        const files = await fs.readdir(DATA_DIR);
        const jsonFiles = files.filter(file => file.startsWith('daily-import-') && file.endsWith('.json'));
        
        const imports = [];
        for (const file of jsonFiles) {
            const filepath = path.join(DATA_DIR, file);
            const content = await fs.readFile(filepath, 'utf8');
            imports.push(JSON.parse(content));
        }
        
        res.json({ 
            success: true, 
            imports: imports,
            count: imports.length
        });
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to read data',
            error: error.message 
        });
    }
});

// Get specific daily import by date
app.get('/api/daily-import/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const filename = `daily-import-${date}.json`;
        const filepath = path.join(DATA_DIR, filename);
        
        const content = await fs.readFile(filepath, 'utf8');
        const data = JSON.parse(content);
        
        res.json({ 
            success: true, 
            data: data
        });
    } catch (error) {
        console.error('Error reading specific data:', error);
        res.status(404).json({ 
            success: false, 
            message: 'Data not found',
            error: error.message 
        });
    }
});

// Delete specific daily import
app.delete('/api/daily-import/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const filename = `daily-import-${date}.json`;
        const filepath = path.join(DATA_DIR, filename);
        
        await fs.unlink(filepath);
        
        res.json({ 
            success: true, 
            message: 'Data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete data',
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Data will be saved to: ${DATA_DIR}`);
});
