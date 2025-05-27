import db, { ExpenseRecord } from './db';

const COLLECTION_NAME = 'expenses';

export async function addExpense(
    expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ExpenseRecord> {
    const now = new Date();
    const docRef = db.collection(COLLECTION_NAME).doc();

    // 日付が文字列として渡された場合に対応
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);

    // 日付をUTCで正規化
    const normalizedDate = new Date(Date.UTC(
        expenseDate.getFullYear(),
        expenseDate.getMonth(),
        expenseDate.getDate(),
        0, 0, 0
    ));

    const newExpense: ExpenseRecord = {
        id: docRef.id,
        ...expense,
        date: normalizedDate,
        createdAt: now,
        updatedAt: now,
    };

    await docRef.set(newExpense);
    return newExpense;
}

export async function updateExpense(
    id: string,
    expense: Partial<Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ExpenseRecord> {
    const now = new Date();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error('支出が見つかりません');
    }

    const currentData = doc.data() as ExpenseRecord;
    const updateData = {
        ...expense,
        updatedAt: now,
    };

    // Firestoreのフィールド更新用にデータを平坦化
    const flattenedUpdate: Record<string, any> = {};
    Object.entries(updateData).forEach(([key, value]) => {
        if (value instanceof Date) {
            flattenedUpdate[key] = value;
        } else {
            flattenedUpdate[key] = value;
        }
    });

    await docRef.update(flattenedUpdate);

    const updatedExpense: ExpenseRecord = {
        ...currentData,
        ...updateData,
        id,
    };

    return updatedExpense;
}

export async function deleteExpense(id: string): Promise<void> {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
        throw new Error('支出が見つかりません');
    }

    await docRef.delete();
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
    // 日付をUTCで作成し、時刻を00:00:00に設定
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    console.log('Fetching expenses for:', { year, month, startDate, endDate });

    const snapshot = await db
        .collection(COLLECTION_NAME)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'desc')
        .get();

    console.log('Found documents:', snapshot.size);

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Document data:', data);
        return {
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as ExpenseRecord;
    });
}

export async function getMonthlyStats(year: number, month: number) {
    const expenses = await getMonthlyExpenses(year, month);

    const totalByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalByPayer = expenses.reduce((acc, expense) => {
        acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const dailyTotal = expenses.reduce((acc, expense) => {
        const dateStr = expense.date.toISOString().split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalByCategory,
        totalByPayer,
        dailyTotal,
        totalExpense: expenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: expenses.length,
    };
} 