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
    public class ThoughtController(
        IThoughtService _thoughtService
        ): ApiControllerBase
    {
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
                errors.AppendLine("- Obsah myšlenky musí mýt mezi 10 a 1000 znaky");
            }
            if (thoughtDto.Title.Length > 100 || thoughtDto.Title.Length < 5)
            {
                errors.AppendLine("- Název myšlenky musí mít mezi 5 a 100 znaky");
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
