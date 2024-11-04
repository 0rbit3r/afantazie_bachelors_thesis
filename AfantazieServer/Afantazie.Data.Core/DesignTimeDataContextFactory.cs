﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Model
{
    internal class DesignTimeDataContextFactory : IDesignTimeDbContextFactory<AfantazieDataContext>
    {
        public AfantazieDataContext CreateDbContext(string[] args)
        {
            var config = new ConfigurationBuilder()
                .AddJsonFile("migrationsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AfantazieDataContext>()
                .UseNpgsql(config.GetConnectionString("DefaultConnection"));

            return new AfantazieDataContext(optionsBuilder.Options);
        }
    }
}