'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import MonthlyReport from '@/components/MonthlyReport';
import type { ExpenseRecord } from '@/lib/db';

export default function Home() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showReport, setShowReport] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    console.log('Fetching expenses for month:', { year, month });

    fetch(`/api/expenses?year=${year}&month=${month}`)
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Received data:', data);
        if (Array.isArray(data)) {
          setExpenses(data.map(expense => ({
            ...expense,
            date: new Date(expense.date),
            createdAt: new Date(expense.createdAt),
            updatedAt: new Date(expense.updatedAt),
          })));
        } else {
          console.log('Data is not an array:', data);
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

  const handleExpenseUpdate = async (id: string, expense: Partial<ExpenseRecord>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...expense }),
      });

      if (!response.ok) {
        throw new Error('支出の更新に失敗しました');
      }

      const updatedExpense = await response.json();
      setExpenses(prev => prev.map(exp => exp.id === id ? {
        ...updatedExpense,
        date: new Date(updatedExpense.date),
        createdAt: new Date(updatedExpense.createdAt),
        updatedAt: new Date(updatedExpense.updatedAt),
      } : exp));
    } catch (error) {
      throw error;
    }
  };

  const handleExpenseDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('支出の削除に失敗しました');
      }

      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const [year, month] = selectedMonth.split('-').map(Number);

  return (
    <main className="container mx-auto px-4 py-4 max-w-lg">
      <h1 className="text-2xl font-bold text-center mb-4">ますだの家計簿</h1>

      <div className="mb-4 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowReport(!showReport)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
          >
            {showReport ? '一覧表示' : 'レポート表示'}
          </button>
        </div>

        {!showReport && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
          >
            新しい支出を追加
          </button>
        )}
      </div>

      {showReport ? (
        <MonthlyReport year={year} month={month} />
      ) : (
        <div className="space-y-4">
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-4 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">新しい支出を追加</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <ExpenseForm
                  onSubmit={async (expense) => {
                    await handleExpenseSubmit(expense);
                    setShowForm(false);
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <ExpenseList
              expenses={expenses}
              onUpdate={handleExpenseUpdate}
              onDelete={handleExpenseDelete}
            />
          </div>
        </div>
      )}
    </main>
  );
}
