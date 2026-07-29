using Expenses.API.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Expenses.API.Models;
using Expenses.API.Dtos;
using Expenses.API.Data.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Expenses.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]
    [Authorize]
    public class TransactionsController(ITransactionService transactionservice) : ControllerBase
    {
        [HttpGet("All")]
        public IActionResult GetAll()
        {
            var nameIdentifierClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(nameIdentifierClaim))
            {
                return BadRequest("Could not get th user id");

            }
            if (!int.TryParse(nameIdentifierClaim, out int userId))
            {
                return BadRequest();
            }
            try
            {
                var allTransactions = transactionservice.GetAll(userId);
                var sortedTransactions = allTransactions.OrderByDescending(t => t.CreatedAt).ToList();
                return Ok(sortedTransactions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching transactions", error = ex.Message });
            }
        }

        [HttpGet("Details/{transactionId}")]
        public IActionResult Get(int transactionId)
        {

            if (transactionId <= 0)
            {
                return BadRequest(new { message = "Invalid transaction ID" });
            }

            var transaction = transactionservice.GetById(transactionId);

            if (transaction == null)
            {
                return NotFound(new { message = "Transaction not found" });
            }
            try
            {


                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching transaction", error = ex.Message });
            }
        }

        [HttpPost("Create")]
        public IActionResult CreateTransaction([FromBody] PostTransactionDto payload)
        {
            var nameIdentifierClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(nameIdentifierClaim))
            {
                return BadRequest("Could not get th user id");

            }
            if(!int.TryParse(nameIdentifierClaim,out int userId))
            {
                return BadRequest();
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var oneYearAgo = DateTime.Now.AddYears(-1);

            if (payload.CreatedAt > DateTime.Now)
            {
                return BadRequest(new { message = "CreatedAt cannot be in the future" });
            }

            if (payload.CreatedAt < oneYearAgo)
            {
                return BadRequest(new { message = "CreatedAt cannot be older than 1 year" });
            }
            
            try
            {

                var newTransaction = transactionservice.Add(payload,userId);

                if (newTransaction == null)
                {
                    return NotFound(new { message = "Error creating transaction" });
                }

                return Ok(new { message = "Transaction created successfully", data = newTransaction });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating transaction", error = ex.Message });
            }
        }

        [HttpPut("Update/{transactionId}")]
        public IActionResult UpdateTransaction(int transactionId, [FromBody] PutTransactionDto payload)
        {


            if (transactionId <= 0)
            {
                return BadRequest(new { message = "Invalid transaction ID" });
            }


            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {

                var existingTransaction = transactionservice.GetById(transactionId);
                if (existingTransaction == null)
                {
                    return NotFound(new { message = "Transaction not found" });
                }

                if (payload.CreatedAt.HasValue)
                {
                    var oneYearAgo = DateTime.Now.AddYears(-1);

                    if (payload.CreatedAt > DateTime.Now)
                    {
                        return BadRequest(new { message = "CreatedAt cannot be in the future" });
                    }

                    if (payload.CreatedAt < oneYearAgo)
                    {
                        return BadRequest(new { message = "CreatedAt cannot be older than 1 year" });
                    }
                }

                var updatedTransaction = transactionservice.Update(transactionId, payload);

                if (updatedTransaction == null)
                {
                    return NotFound(new { message = "Error updating transaction" });
                }

                return Ok(new { message = "Transaction updated successfully", data = updatedTransaction });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating transaction", error = ex.Message });
            }
        }

        [HttpDelete("Delete/{transactionId}")]
        public IActionResult DeleteTransaction(int transactionId)
        {

            if (transactionId <= 0)
            {
                return BadRequest(new { message = "Invalid transaction ID" });
            }
            try
            {

                var existingTransaction = transactionservice.GetById(transactionId);
                if (existingTransaction == null)
                {
                    return NotFound(new { message = "Transaction not found" });
                }

                transactionservice.Delete(transactionId);
                return Ok(new { message = "Transaction deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting transaction", error = ex.Message });
            }
        }

    }
}