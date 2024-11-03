using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Interface.Repository
{
    public interface IUserRepository
    {
        public Task<Result> AssignColor(int userId, string color);

        public Task<Result<string>> GetColor(int userId);

        public Task<Result<User>> GetUserByIdAsync(int id);
    }
}
