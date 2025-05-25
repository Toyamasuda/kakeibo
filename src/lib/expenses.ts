import db, { ExpenseRecord } from './db';

const COLLECTION_NAME = 'expenses';

export async function addExpense(
    expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ExpenseRecord> {
    const now = new Date();
    const docRef = db.collection(COLLECTION_NAME).doc();

    const newExpense: ExpenseRecord = {
        id: docRef.id,
        ...expense,
        createdAt: now,
        updatedAt: now,
    };

    await docRef.set(newExpense);
    return newExpense;
}

export async function getExpenses(): Promise<ExpenseRecord[]> {
    const snapshot = await db
        .collection(COLLECTION_NAME)
        .orderBy('date', 'desc')
        .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as ExpenseRecord;
    });
}

export async function getMonthlyExpenses(year: number, month: number): Promise<ExpenseRecord[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const snapshot = await db
        .collection(COLLECTION_NAME)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'desc')
        .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as ExpenseRecord;
    });
} 