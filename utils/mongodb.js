import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);

export async function connectToDatabase() {
    if (client.isConnected()) {
        return { db: client.db() };
    }

    await client.connect();
    return { db: client.db() };
}
