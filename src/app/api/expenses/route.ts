import { NextResponse } from 'next/server';
import { addExpense, getMonthlyExpenses, updateExpense, deleteExpense, getMonthlyStats } from '@/lib/expenses';

export async function POST(request: Request) {
    try {
        const expense = await request.json();
        const result = await addExpense(expense);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({
            error: '支出の追加に失敗しました',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { id, ...expense } = await request.json();
        const result = await updateExpense(id, expense);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({
            error: '支出の更新に失敗しました',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'IDが指定されていません' }, { status: 400 });
        }

        await deleteExpense(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({
            error: '支出の削除に失敗しました',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
        const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
        const stats = searchParams.get('stats') === 'true';

        if (stats) {
            const monthlyStats = await getMonthlyStats(year, month);
            return NextResponse.json(monthlyStats);
        } else {
            const expenses = await getMonthlyExpenses(year, month);
            return NextResponse.json(expenses);
        }
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({
            error: '支出の取得に失敗しました',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 