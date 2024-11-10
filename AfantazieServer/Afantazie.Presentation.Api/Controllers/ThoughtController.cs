using Afantazie.Core.Localization.Errors;
using Afantazie.Core.Localization.ThoughtValidation;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Presentation.Model.Dto.Thought;
using Afantazie.Service.Interface.Thoughts;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.Metadata.Ecma335;
using System.Text;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/thoughts")]
    [ApiController]
    public class ThoughtController: ApiControllerBase
    {
        private readonly IThoughtService _thoughtService;
        private readonly IThoughtValidationLocalization _localization;

        public ThoughtController(
            IThoughtService service,
            IAuthValidationMessages errors,
            IThoughtValidationLocalization locaization)
            : base(errors)
        {
            _thoughtService = service;
            _localization = locaization;
        }

        [HttpGet("graph")]
        public async Task<ActionResult<List<ThoughtDto>>> GetEntireGraph()
        {
            var response = await _thoughtService.GetAllThoughtsAsync();

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<ThoughtDto>>();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ThoughtDto>> GetThoughtById(int id)
        {
            var response = await _thoughtService.GetThoughtByIdAsync(id);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<ThoughtDto>();
        }

        [HttpGet("titles")]
        public async Task<ActionResult<List<ThoughtTitleDto>>> GetThoughtTitles()
        {
            var response = await _thoughtService.GetAllThoughtsAsync();

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!.Adapt<List<ThoughtTitleDto>>();
        }

        [HttpPost("create")]
        [Authorize]
        public async Task<ActionResult<int>> CreateThought([FromBody] CreateThoughtDto thoughtDto)
        {
            var errors = new StringBuilder();
            if(thoughtDto.Content.Length > 1000 || thoughtDto.Content.Length < 10)
            {
                errors.AppendLine(_localization.InvalidContentLength);
            }
            if (thoughtDto.Title.Length > 100 || thoughtDto.Title.Length < 5)
            {
                errors.AppendLine(_localization.InvalidTitleLength);
            }
            if (errors.Length > 0)
            {
                return BadRequest(new { Error = errors.ToString() });

            }

            if (UserId is null)
                return Unauthorized();

            var response = await _thoughtService.CreateThoughtAsync(
                UserId.Value, thoughtDto.Title, thoughtDto.Content, thoughtDto.Links);

            if (!response.IsSuccess)
            {
                return ResponseFromError(response.Error!);
            }

            return response.Payload!;
        }
    }
}
