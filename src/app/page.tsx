'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import type { ExpenseRecord } from '@/lib/db';

export default function Home() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    fetch(`/api/expenses?year=${year}&month=${month}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExpenses(data.map(expense => ({
            ...expense,
            date: new Date(expense.date),
            createdAt: new Date(expense.createdAt),
            updatedAt: new Date(expense.updatedAt),
          })));
        }
      })
      .catch(error => {
        console.error('支出の取得に失敗しました:', error);
        alert('支出の取得に失敗しました。');
      });
  }, [selectedMonth]);

  const handleExpenseSubmit = async (
    expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        throw new Error('支出の追加に失敗しました');
      }

      const newExpense = await response.json();
      setExpenses(prev => [{
        ...newExpense,
        date: new Date(newExpense.date),
        createdAt: new Date(newExpense.createdAt),
        updatedAt: new Date(newExpense.updatedAt),
      }, ...prev]);
    } catch (error) {
      console.error('支出の追加に失敗しました:', error);
      alert('支出の追加に失敗しました。');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">家計簿アプリ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">新しい支出を追加</h2>
          <ExpenseForm onSubmit={handleExpenseSubmit} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">支出一覧</h2>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <ExpenseList expenses={expenses} />
        </div>
      </div>
    </main>
  );
}
