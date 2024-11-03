using Afantazie.Core.Model.Results;

namespace Afantazie.Service.Interface.UserSettings
{
    public interface IUserSettingsService
    {
        public Task<Result> UpdateColor(int userId, string color);

        public Task<Result<string>> GetColor(int userId);
    }
}
