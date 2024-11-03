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

        public Task<Result<List<Thought>>> GetAllThoughtsAsync()
        {
            _logger.LogInformation("Requested thought graph.");
            return _repo.GetAllThoughts();
        }

        public Task<Result<Thought>> GetThoughtByIdAsync(int id)
        {
            _logger.LogInformation("Requested thought with id: {id}", id);
            return _repo.GetThoughtById(id);
        }
    }
}
