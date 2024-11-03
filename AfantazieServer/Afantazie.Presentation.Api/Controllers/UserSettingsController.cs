using Afantazie.Presentation.Model.Dto;
using Afantazie.Service.Interface.UserSettings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Api.Controllers
{
    [ApiController]
    [Route("api/user-settings")]
    public class UserSettingsController(
        IUserSettingsService _service) : ApiControllerBase
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult> UpdateSettings([FromBody] UserSettingsDto dto)
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var result = await _service.UpdateColor(UserId.Value, dto.Color);

            if (result.IsSuccess)
            {
                return Ok();
            }

            return ResponseFromError(result.Error!);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserSettingsDto>> GetSettings()
        {
            if (UserId == null)
            {
                return Unauthorized();
            }
            var result = await _service.GetColor(UserId.Value);

            if (result.IsSuccess)
            {
                return new UserSettingsDto
                {
                    Color = result.Payload!,
                    Username = User.Identity?.Name ?? "Unknown"
                };
            }

            return ResponseFromError(result.Error!);
        }
    }
}
