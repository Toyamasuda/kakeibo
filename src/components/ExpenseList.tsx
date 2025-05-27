import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import type { ExpenseRecord } from '@/lib/db';

interface ExpenseListProps {
    expenses: ExpenseRecord[];
    onUpdate: (id: string, expense: Partial<ExpenseRecord>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function ExpenseList({ expenses, onUpdate, onDelete }: ExpenseListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getCategoryInfo = (categoryId: string) => {
        return EXPENSE_CATEGORIES.find((cat) => cat.id === categoryId) || {
            name: 'Unknown',
            icon: '❓',
        };
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(amount);
    };

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const updatedExpense = {
            date: new Date(formData.get('date') as string),
            amount: Number(formData.get('amount')),
            category: formData.get('category') as string,
            description: formData.get('description') as string,
            paidBy: formData.get('paidBy') as 'husband' | 'wife',
        };

        try {
            await onUpdate(id, updatedExpense);
            setEditingId(null);
        } catch (error) {
            console.error('支出の更新に失敗しました:', error);
            alert('支出の更新に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('この支出を削除してもよろしいですか？')) {
            return;
        }

        setLoading(true);
        try {
            await onDelete(id);
        } catch (error) {
            console.error('支出の削除に失敗しました:', error);
            alert('支出の削除に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {expenses.length === 0 ? (
                <p className="text-center text-gray-500">支出記録がありません</p>
            ) : (
                <div className="space-y-4">
                    {expenses.map((expense) => {
                        const category = getCategoryInfo(expense.category);
                        const isEditing = editingId === expense.id;

                        if (isEditing) {
                            return (
                                <div key={expense.id} className="bg-white rounded-lg shadow p-4">
                                    <form
                                        onSubmit={(e) => handleEdit(e, expense.id)}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    日付
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    defaultValue={expense.date.toISOString().split('T')[0]}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    金額
                                                </label>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    defaultValue={expense.amount}
                                                    required
                                                    min="0"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    カテゴリー
                                                </label>
                                                <select
                                                    name="category"
                                                    defaultValue={expense.category}
                                                    required
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
                                                <label className="block text-sm font-medium text-gray-700">
                                                    支払者
                                                </label>
                                                <div className="mt-1 space-x-4">
                                                    <label className="inline-flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="paidBy"
                                                            value="husband"
                                                            defaultChecked={expense.paidBy === 'husband'}
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
                                                            defaultChecked={expense.paidBy === 'wife'}
                                                            required
                                                            className="text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2">妻</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    説明
                                                </label>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    defaultValue={expense.description}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                {loading ? '更新中...' : '更新'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            );
                        }

                        return (
                            <div key={expense.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="text-sm text-gray-500">
                                            {formatDate(expense.date)}
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {formatAmount(expense.amount)}
                                        </div>
                                        <div className="text-sm">
                                            {category.icon} {category.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {expense.description}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            支払者: {expense.paidBy === 'husband' ? '夫' : '妻'}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setEditingId(expense.id)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="編集"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="削除"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
} 