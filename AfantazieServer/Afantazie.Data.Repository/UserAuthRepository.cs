using Afantazie.Core.Localization;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Afantazie.Data.Repository
{
    public partial class UserAuthRepository(
        DataContextProvider _contextProvider
        ) : IUserAuthRepository
    {
        public async Task<Result<int>> VerifyLoginByEmail(string email, string password)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (existingUser == null)
                {
                    return Error.Auth(ErrorMessages.Failed_Login);
                }

                var hashedPassword = HashPassword(password);
                if (existingUser.Password != hashedPassword)
                {
                    return Error.Auth(ErrorMessages.Failed_Login);
                }

                return existingUser.Id;
            }
        }

        public async Task<Result> RegisterUserAsync(string email, string username, string password)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                if (context.Users.Any(u => u.Username == username))
                {
                    return Error.AlreadyExists(ErrorMessages.AlreadyExists_Username);
                }
                if(context.Users.Any(u => u.Email == email))
                {
                    return Error.AlreadyExists(ErrorMessages.AlreadyExists_Email);
                }

                var hashedPassword = HashPassword(password);
                var newUser = new UserEntity { Username = username, Email = email, Password = hashedPassword, Color = "#ffffff" };
                context.Users.Add(newUser);
                await context.SaveChangesAsync();

                return Result.Success();
            }
        }


        public async Task<Result<int>> VerifyLoginByUsername(string username, string password)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Username == username);
                if (existingUser == null)
                {
                    return Error.Auth(ErrorMessages.Failed_Login);
                }

                var hashedPassword = HashPassword(password);
                if (existingUser.Password != hashedPassword)
                {
                    return Error.Auth(ErrorMessages.Failed_Login);
                }

                return existingUser.Id;
            }
        }

        public async Task<Result<string>> GetUsernameByEmail(string emailOrLogin)
        {
            using (var context = _contextProvider.GetDataContext())
            {
                var user = await context.Users.FirstOrDefaultAsync(u => u.Email == emailOrLogin || u.Username == emailOrLogin);

                if (user is null)
                {
                    return Error.NotFound();
                }

                return user.Username;
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }
    }
}
