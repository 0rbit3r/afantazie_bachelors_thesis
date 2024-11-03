using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model
{
    public class DataContextProvider(IConfiguration _config)
    {
        public AfantazieDataContext GetDataContext()
        {
            DbContextOptions<AfantazieDataContext> options = new DbContextOptionsBuilder<AfantazieDataContext>()
                .UseNpgsql(_config.GetConnectionString("DefaultConnection"))
                .Options;

            return new AfantazieDataContext(options);
        }
    }
}
