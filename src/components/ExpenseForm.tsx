import { useState, useRef } from 'react';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import type { ExpenseRecord } from '@/lib/db';

interface ExpenseFormProps {
    onSubmit: (expense: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const expense = {
            date: new Date(formData.get('date') as string),
            amount: Number(formData.get('amount')),
            category: formData.get('category') as string,
            description: formData.get('description') as string,
            paidBy: formData.get('paidBy') as 'husband' | 'wife',
        };

        try {
            await onSubmit(expense);
            formRef.current?.reset();
            // 日付フィールドを今日の日付にリセット
            const today = new Date().toISOString().split('T')[0];
            if (formRef.current) {
                const dateInput = formRef.current.querySelector<HTMLInputElement>('input[type="date"]');
                if (dateInput) {
                    dateInput.value = today;
                }
            }
        } catch (error) {
            console.error('支出の追加に失敗しました:', error);
            alert('支出の追加に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    // 初期値として今日の日付を設定
    const today = new Date().toISOString().split('T')[0];

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    日付
                </label>
                <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    defaultValue={today}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    金額
                </label>
                <input
                    type="number"
                    name="amount"
                    id="amount"
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    カテゴリー
                </label>
                <select
                    name="category"
                    id="category"
                    required
                    defaultValue={EXPENSE_CATEGORIES[0].id}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    {EXPENSE_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    説明
                </label>
                <input
                    type="text"
                    name="description"
                    id="description"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">支払者</label>
                <div className="mt-1 space-x-4">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="paidBy"
                            value="husband"
                            defaultChecked
                            required
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">夫</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="paidBy"
                            value="wife"
                            required
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2">妻</span>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? '追加中...' : '支出を追加'}
            </button>
        </form>
    );
} 