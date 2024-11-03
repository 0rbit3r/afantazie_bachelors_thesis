using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Presentation.Model.Dto.Thought
{
    public class CreateThoughtDto
    {
        public string Title { get; set; } = "";

        public string Content { get; set; } = "";

        public List<int> Links { get; set; } = new List<int>();
    }
}
