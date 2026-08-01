using Expenses.API.Dtos;
using Expenses.API.Models;
namespace Expenses.API.Data.Services
{
    public interface ITransactionService
    {
        List<Transaction> GetAll(int userId);

        Transaction? GetById(int id);

        Transaction Add(PostTransactionDto transaction,int userId);

        Transaction? Update(int id, PutTransactionDto transaction);

        void Delete(int id);

        TransactionSummaryDto GetSummary(int userId, DateTime? startDate, DateTime? endDate);
    }

}
