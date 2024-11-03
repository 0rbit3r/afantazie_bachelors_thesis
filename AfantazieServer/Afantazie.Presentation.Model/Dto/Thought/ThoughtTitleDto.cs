using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto.Thought
{
    public class ThoughtTitleDto
    {
        public int Id { get; set; }

        public required string Title { get; set; }

        public required string Color { get; set; }
    }
}
