using Mapster;
using Afantazie.Core.Model;
using Afantazie.Presentation.Model.Dto.Thought;

namespace Afantazie.Presentation.Model.Mapping
{
    public static class DtoMappingConfiguration
    {
        public static void ConfigureDtoMapping()
        {
            TypeAdapterConfig<Thought, ThoughtDto>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Author, src => src.Author.Username)
                .Map(dest => dest.Color, src => src.Color)
                .Map(dest => dest.Content, src => src.Content)
                .Map(dest => dest.DateCreated, src => src.DateCreated.ToShortDateString())
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Links, src => src.Links.Select(l => l.TargetId).ToList())
                .Map(dest => dest.Backlinks, src => src.Backlinks.Select(b => b.SourceId).ToList());

            TypeAdapterConfig<Thought, ThoughtTitleDto>.NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Color , src => src.Color);
        }
    }
}
