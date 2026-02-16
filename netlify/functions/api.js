const { MongoClient } = require('mongodb');

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb+srv://envpoint-admin:Khoa0910%40@envpointdb.wnnsle8.mongodb.net/?appName=EnvPointDB';
let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client;
}

// Main handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.replace('/.netlify/functions/api', '');
    
    try {
        const client = await connectToDatabase();
        const db = client.db('lixi2026');
        
        // POST /save-result - Lưu kết quả quay và QR
        if (event.httpMethod === 'POST' && path === '/save-result') {
            const data = JSON.parse(event.body);
            const collection = db.collection('results');
            
            const result = await collection.insertOne({
                linkId: data.linkId,
                sender: data.sender,
                receiver: data.receiver,
                prize: data.prize,
                prizeValue: data.prizeValue,
                qrCodeBase64: data.qrCode,
                bankInfo: data.bankInfo,
                createdAt: new Date(),
                status: 'pending' // pending, paid, rejected
            });
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, id: result.insertedId })
            };
        }
        
        // GET /results - Admin lấy danh sách kết quả
        if (event.httpMethod === 'GET' && path === '/results') {
            const collection = db.collection('results');
            const results = await collection.find({}).sort({ createdAt: -1 }).toArray();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(results)
            };
        }
        
        // POST /mark-used - Đánh dấu link đã sử dụng
        if (event.httpMethod === 'POST' && path === '/mark-used') {
            const data = JSON.parse(event.body);
            const collection = db.collection('usedLinks');
            
            await collection.updateOne(
                { linkId: data.linkId },
                { $set: { linkId: data.linkId, usedAt: new Date() } },
                { upsert: true }
            );
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }
        
        // GET /check-used/:linkId - Kiểm tra link đã dùng chưa
        if (event.httpMethod === 'GET' && path.startsWith('/check-used/')) {
            const linkId = path.replace('/check-used/', '');
            const collection = db.collection('usedLinks');
            
            const found = await collection.findOne({ linkId: linkId });
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ used: !!found })
            };
        }
        
        // POST /update-status - Admin cập nhật trạng thái
        if (event.httpMethod === 'POST' && path === '/update-status') {
            const data = JSON.parse(event.body);
            const collection = db.collection('results');
            const { ObjectId } = require('mongodb');
            
            await collection.updateOne(
                { _id: new ObjectId(data.id) },
                { $set: { status: data.status, updatedAt: new Date() } }
            );
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }
        
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
