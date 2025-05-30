import { Firestore } from '@google-cloud/firestore';

const db = new Firestore({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export default db;

export interface ExpenseRecord {
    id: string;
    date: Date;
    amount: number;
    category: string;
    description: string;
    paidBy: 'husband' | 'wife';
    createdAt: Date;
    updatedAt: Date;
} 