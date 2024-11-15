using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;

namespace Afantazie.Data.Interface.Repository
{
    public interface IThoughtRepository
    {
        Task<Result<List<Thought>>> GetAllThoughts();

        Task<Result<List<Thought>>> GetLatestMetaData(int amount);

        Task<Result<Thought>> GetThoughtById(int id);

        Task<Result<IEnumerable<Thought>>> GetThoughtsByOwner(int ownerId);

        Task<Result<int>> InserertThoughtAsync(string title, string content, int authorId, IEnumerable<int> references);

        Task<Result<int>> GetTotalThoughtsCount();
    }
}
