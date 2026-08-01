namespace Expenses.API.Dtos
{
    public class TransactionSummaryDto
    {
        public double TotalIncome { get; set; }

        public double TotalExpense { get; set; }

        public double Balance { get; set; }

        public int TransactionCount { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public List<CategorySummaryDto> ByCategory { get; set; } = new();
    }

    public class CategorySummaryDto
    {
        public string? Category { get; set; }

        public string? Type { get; set; }

        public double Total { get; set; }

        public int Count { get; set; }
    }
}
