// See https://aka.ms/new-console-template for more information

using Microsoft.Extensions.DependencyInjection;
using Afantazie.Data.Repository;
using Afantazie.Tools;
using Microsoft.Extensions.Configuration;
using Afantazie.Data.Interface.Repository;

var services = new ServiceCollection();

services.AddLogging();
services.AddDataModule();

var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory()) // Ensure this is the correct path
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

services.AddSingleton<IConfiguration>(configuration);

var serviceProvider = services.BuildServiceProvider();

Console.WriteLine(
@"[0] - Exit
[1] - Generate Random Thoughts
[2] - Generate random clustered thoughts
[3] - Generate random rainbow thoughts
[4] - Generate Rainbow Tree
[5] - Import citHep
[6] - Import citHep to Markdown
[7] - Retroactively add links to content");

var choice = Console.ReadLine();
if (!int.TryParse(choice, out var choiceInt))
{
    Console.WriteLine("Invalid choice");
    return;
}

if (choiceInt == 0)
{
    return;
}

if (choiceInt == 1)
{
    await RandomThoughtsGenerator.GenerateData(serviceProvider);
}
if (choiceInt == 2)
{
    await ClusteredThoughtsGenerator.GenerateData(serviceProvider);
}
if (choiceInt == 3)
{
    await RainbowClustersGenerator.GenerateData(serviceProvider);
}
if (choiceInt == 4)
{
    await RainbowTreeGenerator.GenerateData(serviceProvider);
}
if (choiceInt == 5)
{
    await CitHepImporter.ImportCitHepFileAsync(serviceProvider);
}
if (choiceInt == 6)
{
    await CitHepObsidianImporter.ImportCitHepFileToObsidianAsync(serviceProvider);
}
if (choiceInt == 7)
{
    await RetroactiveResponseAdder.AddResponses();
}
else
{
    Console.WriteLine("Invalid choice");
    return;
}

Console.ReadLine();