import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EXPENSE_CATEGORIES } from '@/constants/categories';

interface MonthlyStats {
    totalByCategory: Record<string, number>;
    totalByPayer: Record<string, number>;
    dailyTotal: Record<string, number>;
    totalExpense: number;
    count: number;
}

interface MonthlyReportProps {
    year: number;
    month: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C43'];

export default function MonthlyReport({ year, month }: MonthlyReportProps) {
    const [stats, setStats] = useState<MonthlyStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/expenses?year=${year}&month=${month}&stats=true`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('統計情報の取得に失敗しました:', error);
                setLoading(false);
            });
    }, [year, month]);

    if (loading) {
        return <div className="text-center">読み込み中...</div>;
    }

    if (!stats) {
        return <div className="text-center">データを取得できませんでした</div>;
    }

    const categoryData = Object.entries(stats.totalByCategory).map(([id, amount]) => ({
        name: EXPENSE_CATEGORIES.find(cat => cat.id === id)?.name || id,
        value: amount,
    }));

    const payerData = Object.entries(stats.totalByPayer).map(([payer, amount]) => ({
        name: payer === 'husband' ? '夫' : '妻',
        value: amount,
    }));

    const dailyData = Object.entries(stats.dailyTotal)
        .map(([date, amount]) => ({
            date: new Date(date).getDate(),
            amount,
        }))
        .sort((a, b) => a.date - b.date);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">月次サマリー</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">総支出</p>
                        <p className="text-xl font-bold">{formatCurrency(stats.totalExpense)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">支出件数</p>
                        <p className="text-xl font-bold">{stats.count}件</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">カテゴリー別支出</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name }) => name}
                            >
                                {categoryData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">支払者別支出</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={payerData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name }) => name}
                            >
                                {payerData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">日別支出推移</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={formatCurrency} width={60} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="amount" fill="#8884d8" name="支出額" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}