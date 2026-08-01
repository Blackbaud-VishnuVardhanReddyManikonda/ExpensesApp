export interface CategorySummary {
    category: string;
    type: string;
    total: number;
    count: number;
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    startDate?: Date;
    endDate?: Date;
    byCategory: CategorySummary[];
}
