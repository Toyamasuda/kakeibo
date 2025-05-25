import { NextResponse } from 'next/server';
import { addExpense, getMonthlyExpenses } from '@/lib/expenses';

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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
        const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

        console.log('Fetching expenses for:', { year, month });
        console.log('Environment variables:', {
            hasCredentials: !!process.env.FIREBASE_ADMIN_CREDENTIALS,
            credentialsLength: process.env.FIREBASE_ADMIN_CREDENTIALS?.length
        });

        const expenses = await getMonthlyExpenses(year, month);
        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({
            error: '支出の取得に失敗しました',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 