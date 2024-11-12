using Afantazie.Core.Constants;
using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Data.Interface.Repository;
using Afantazie.Service.Interface.Thoughts;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Service.Thoughts
{
    public class ThoughtService(
        IThoughtRepository _repo,
        IUserRepository _userRepo,
        ILogger<ThoughtService> _logger
        ) : IThoughtService
    {
        public async Task<Result<int>> CreateThoughtAsync(int creatorId, string title, string content, List<int> thoughtIdReferences)
        {
            _logger.LogInformation("Creating new thought: {title}", title);
            var result = await _repo.InserertThoughtAsync(
                title, content, creatorId, thoughtIdReferences);

            return result.IsSuccess
                ? Result.Success(result.Payload!)
                : result.Error!;
        }

        public async Task<Result<List<Thought>>> GetLastThoughtsForUserAsync(int? userId)
        {
            _logger.LogInformation("Requested thought graph.");

            var takeLast = userId.HasValue
                ? (await _userRepo.GetMaxThoughts(userId.Value)).Payload!
                : Constants.DefaultMaximumThoughts;

            return await _repo.GetLastThoughtsAsync(takeLast);
        }

        public Task<Result<Thought>> GetThoughtByIdAsync(int id)
        {
            _logger.LogInformation("Requested thought with id: {id}", id);
            return _repo.GetThoughtById(id);
        }

        public Task<Result<int>> GetTotalThoughtCount()
        {
            _logger.LogDebug("Requested total thought count.");
            return _repo.GetTotalThoughtsCount();
        }
    }
}
