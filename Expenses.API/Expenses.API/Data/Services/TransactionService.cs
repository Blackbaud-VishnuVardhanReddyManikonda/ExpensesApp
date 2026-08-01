using Expenses.API.Dtos;
using Expenses.API.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Expenses.API.Data.Services
{

    public class TransactionService(AppDbContext context) : ITransactionService

    {
        public Transaction Add(PostTransactionDto transaction, int userId)
        {
            var newTransaction = new Transaction
            {
                Type = transaction.Type,
                Amount = transaction.Amount,
                Category = transaction.Category,
                CreatedAt = transaction.CreatedAt,
                UpdatedAt = DateTime.Now,
                UserId = userId
            };

            context.Transactions.Add(newTransaction);
            context.SaveChanges();
            return newTransaction;
        }

        public void Delete(int transactionId)
        {
            var transaction = context.Transactions.FirstOrDefault(t => t.Id == transactionId);
            if (transaction != null)
            {
                context.Transactions.Remove(transaction);
                context.SaveChanges();
            }
            
        }

        public List<Transaction> GetAll(int userId)
        {
            var allTransactions = context.Transactions.Where(t=>t.UserId==userId).ToList();
            return allTransactions;
        }

        public Transaction? GetById(int transactionId)
        {
            var transaction = context.Transactions.FirstOrDefault(t => t.Id == transactionId);
            
            return transaction;
        }

        public TransactionSummaryDto GetSummary(int userId, DateTime? startDate, DateTime? endDate)
        {
            var query = context.Transactions.Where(t => t.UserId == userId);

            if (startDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt <= endDate.Value);
            }

            var transactions = query.ToList();

            var totalIncome = transactions
                .Where(t => t.Type != null && t.Type.ToLower() == "income")
                .Sum(t => t.Amount);

            var totalExpense = transactions
                .Where(t => t.Type != null && t.Type.ToLower() == "expense")
                .Sum(t => t.Amount);

            var byCategory = transactions
                .GroupBy(t => new { t.Category, t.Type })
                .Select(g => new CategorySummaryDto
                {
                    Category = g.Key.Category,
                    Type = g.Key.Type,
                    Total = g.Sum(t => t.Amount),
                    Count = g.Count()
                })
                .OrderByDescending(c => c.Total)
                .ToList();

            return new TransactionSummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                Balance = totalIncome - totalExpense,
                TransactionCount = transactions.Count,
                StartDate = startDate,
                EndDate = endDate,
                ByCategory = byCategory
            };
        }

        public Transaction? Update(int transactionId, PutTransactionDto transaction)
        {
            var transactionToUpdate = context.Transactions.FirstOrDefault(t => t.Id == transactionId);
            if (transactionToUpdate != null)
            {
                transactionToUpdate.Type = transaction.Type ?? transactionToUpdate.Type;
                transactionToUpdate.Amount = transaction.Amount ?? transactionToUpdate.Amount;
                transactionToUpdate.Category = transaction.Category ?? transactionToUpdate.Category;

                if (transaction.CreatedAt.HasValue)
                {
                    transactionToUpdate.CreatedAt = transaction.CreatedAt.Value;
                }

                transactionToUpdate.UpdatedAt = DateTime.Now;

                context.Transactions.Update(transactionToUpdate);
                context.SaveChanges();
            }
            return transactionToUpdate;
        }
    }
}