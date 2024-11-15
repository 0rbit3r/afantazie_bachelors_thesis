﻿using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;

namespace Afantazie.Service.Interface.Thoughts
{
    public interface IThoughtService
    {
       Task<Result<int>> CreateThoughtAsync(int creatorId, string title, string content, List<int> thoughtIdReferences);

        /// <summary>
        /// Gets last thoughts and limits them based on user - selected maximum thoughts.
        /// </summary>
       Task<Result<List<Thought>>> GetAllThoughts();
       Task<Result<Thought>> GetThoughtByIdAsync(int id);

       Task<Result<int>> GetTotalThoughtCount();
    }
}
