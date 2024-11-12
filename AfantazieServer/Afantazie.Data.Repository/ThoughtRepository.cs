using Afantazie.Core.Model;
using Afantazie.Core.Model.Results;
using Afantazie.Core.Model.Results.Errors;
using Afantazie.Data.Interface.Repository;
using Afantazie.Data.Model;
using Afantazie.Data.Model.Entity;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Afantazie.Data.Repository
{
    internal class ThoughtRepository(
        DataContextProvider _contextProvider
        ): IThoughtRepository
    {
        public async Task<Result<Thought>> GetThoughtById(int id)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thought = await db.Thoughts
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Author)
                    .Where(t => t.Id == id)
                    .SingleOrDefaultAsync();

                if (thought is null)
                {
                    return Error.NotFound();
                }

                return thought.Adapt<Thought>();
            }
        }

        public async Task<Result<int>> GetTotalThoughtsCount()
        {
            using (var db = _contextProvider.GetDataContext())
            {
                return await db.Thoughts.CountAsync();
            }
        }

        public async Task<Result<List<Thought>>> GetLastThoughtsAsync(int count)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                //var thoughtsAsIs = await db.Thoughts.ToListAsync();

                //var thoughtsWithLinks = await db.Thoughts
                //    .Include(t => t.Links).ToListAsync();

                //var thoughtsWithBackLinks = await db.Thoughts
                //    .Include(t => t.Backlinks).ToListAsync();

                //TODO - granular controle over what to include

                var thoughtsWithBoth = await db.Thoughts
                    .Include(t => t.Links)
                    .Include(t => t.Backlinks)
                    .Include(t => t.Author)
                    .ToListAsync();

                return thoughtsWithBoth
                    .TakeLast(count)
                    .Adapt<List<Thought>>();
            }
        }

        public Task<Result<IEnumerable<Thought>>> GetThoughtsByOwner(int ownerId)
        {
            throw new NotImplementedException();
        }

        public async Task<Result<int>> InserertThoughtAsync(
            string title, string content, int authorId, IEnumerable<int> references)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtEntity =
                    new ThoughtEntity {
                        Title = title,
                        Content = content,
                        AuthorId = authorId,
                        DateCreated = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc),
                    };

                var newEntity = db.Add(thoughtEntity);
                await db.SaveChangesAsync();

                foreach (var referenceId in references)
                {
                    var referenceEntity = new ThoughtReferenceEntity
                    {
                        SourceId = newEntity.Entity.Id,
                        TargetId = referenceId,
                    };

                    db.Add(referenceEntity);
                }

                await db.SaveChangesAsync();

                return newEntity.Entity.Id;
            }
        }

        public async Task<Result<List<Thought>>> GetLatestMetaData(int amount)
        {
            using (var db = _contextProvider.GetDataContext())
            {
                var thoughtsWithBoth = await db.Thoughts
                 .Include(t => t.Author)
                 .OrderByDescending(Task => Task.DateCreated)
                 .Take(amount)
                 .ToListAsync();

                return thoughtsWithBoth
                    .Adapt<List<Thought>>();
            }
        }
    }
}
