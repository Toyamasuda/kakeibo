export const EXPENSE_CATEGORIES = [
    { id: 'food', name: '食費', icon: '🍴' },
    { id: 'housing', name: '住居費', icon: '🏠' },
    { id: 'utilities', name: '光熱費', icon: '💡' },
    { id: 'transportation', name: '交通費', icon: '🚃' },
    { id: 'entertainment', name: '娯楽費', icon: '🎮' },
    { id: 'healthcare', name: '医療費', icon: '🏥' },
    { id: 'shopping', name: '買い物', icon: '🛍️' },
    { id: 'other', name: 'その他', icon: '📝' },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['id']; 