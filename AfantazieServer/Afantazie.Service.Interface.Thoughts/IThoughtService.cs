using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface IThoughtService
    {
       Task<Result<int>> CreateThoughtAsync(int creatorId, string title, string content, List<int> thoughtIdReferences);

       Task<Result<List<Thought>>> GetAllThoughtsAsync();
       Task<Result<Thought>> GetThoughtByIdAsync(int id);
    }
}
