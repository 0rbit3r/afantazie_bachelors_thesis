using Afantazie.Presentation.Model.Dto;
using Afantazie.Service.Interface.SiteActivity;
using Microsoft.AspNetCore.Mvc;

namespace Afantazie.Presentation.Api.Controllers
{
    [Route("api/log")]
    [ApiController]
    public class ActivityLogController(
        IActivityLogService _service
        ): ApiControllerBase
    {
        [HttpGet("latest")]
        public async Task<ActionResult<List<LogDto>>> GetLog([FromQuery] int amount)
        {
            var activityResult = await _service.GetLatestActivity(amount);
            if (!activityResult.IsSuccess)
            {
                return ResponseFromError(activityResult.Error!);
            }

            return activityResult.Payload!.Select(thought => new LogDto(
                thought.Id,
                thought.Title,
                convertSecondsToReadable((DateTime.Now - thought.DateCreated)),
                thought.Author.Color,
                thought.Author.Username)).ToList();
        }

        private string convertSecondsToReadable(TimeSpan time) => 
            time.TotalSeconds switch
            {
                < 60 => $"{time.Seconds} s",
                < 3600 => $"{time.Minutes} min",
                < 86400 => $"{time.Hours} h",
                _ => $"{time.Days} d"
            };

    }
}
