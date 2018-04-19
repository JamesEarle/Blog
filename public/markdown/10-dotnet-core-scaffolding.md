# Code Scaffolding with ASP.NET Core

*Scaffold code properly using the .NET Core code generator CLI tool.*

## Introduction

[.NET Core 2.0](https://blogs.msdn.microsoft.com/dotnet/2017/08/14/announcing-net-core-2-0/) was released in August of this year. With it came big improvements around things like extended OS support and the ability to reference any .NET Framework library from .NET Core. The open-source, cross-platform development platform may be drawing your attention away from traditional .NET applications, and that's okay! It's modular, fast, and so small that when you deploy your application the entire framework comes with it. This makes version management easy.

When developing with .NET Core, if you're using Visual Studio you have tons of development tools at your fingertips, ready to practically build your application for you. If you're like me though, you prefer to work from the CLI when developing. You may ask, *"Is there an easy way to scaffold code like Visual Studio does, from the CLI?"* and the answer is yes! Using the `dotnet aspnet-codegenerator` tool you can create all of your models, views, and controllers in your ASP.NET Core MVC application.   

## Getting Started

First you need your .NET Core MVC application. If you haven't already got one setup, you can template one using either `dotnet new mvc` or `dotnet new web`.  You can also explore other options in the CLI tool using `dotnet new -h`. You'll see there is plenty of templated code for you to work with for console, MVC, Angular, React, and more. Similarly, when you've chosen whatever is appropriate for you, you can of course use the `-h` argument again to learn more about that specific template and its options. For example, `dotnet new mvc -h` will show you all the options for things like your application's database or authentication type. You can use all of this to generate lots of starter code for your app.

Once you've created your basic application, you need to add the code generator package to your `.csproj` file. If you've used the above tooling to make your new project, you *should* already have one of the two required packages in your app already. Open your `.csproj` and ensure that under the first `<ItemGroup>` you put a package reference to the code generator Nuget package as `<PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="2.0.0"/>`. In the second `<ItemGroup>`, if another one exists, there should be a reference to the code generator tool as `<DotNetCliToolReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Tools" Version="2.0.0" />`. If this doesn't exist, add it in an `<ItemGroup>` **separate from the first package reference**. When you're done, your `.csproj` will look something like below.

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <!-- Any other package references. -->
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="2.0.0"/>
  </ItemGroup>

  <ItemGroup>
    <!-- Any other tool references. -->
    <DotNetCliToolReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Tools" Version="2.0.0" />
  </ItemGroup>

</Project>
```

After this, you'll need to run a restore before you can access the CLI tool.

```bash
dotnet restore
```

## Creating Code

Now that we've setup this tool, let's explore the different generators provided to you. Run `dotnet aspnet-codegenerator -h` to be sure you've setup the tool correctly, and you'll be shown details about the tool arguments and available generators. Feel free to explore the options as you wish, but for now we're going to focus on each of the four generators.

```bash
dotnet aspnet-codegenerator -h

...
Available generators:
  area      : Generates an MVC Area.
  controller: Generates a controller.
  razorpage : Generates RazorPage(s).
  view      : Generates a view.

```

Let's talk about what each of these do.

**Area** - Creates the workspace for an empty MVC project. Will make an *"Areas"* directory as well as *"Controllers"*, *"Data"*, *"Models"*, and *"Views"* subdirectories beneath a folder you provde the name for as an input argument.

**Controller** - Generates a controller you specify by name. This generator has a lot of optional parameters you can use to customize it. These include things like the output path, the namespace, the model class to use, and so on.

**RazorPage** - .NET Core supports [Razor templating](https://docs.microsoft.com/en-us/aspnet/core/mvc/razor-pages/?tabs=visual-studio) syntax to create intelligent views, or "pages". You can handle data binding as well as minimize HTML you write using these templates. This generator will created a named Razor page, as well as use a certain template if you want it to (e.g. for CRUD operations). Razor pages differ from views in that each page is a defined action. This will create a `.cshtml` file as well as a `.cshtml.cs` file for the [*code-behind*](https://en.wikipedia.org/wiki/ASP.NET#Code-behind_model).

**View** - A traditional Razor view generator. This will create a `.cshtml` file rendered on specified controller actions.

Personally, I've never used the `area` code generator. The MVC directory structure is provided for you when you run `dotnet new mvc`. If you start at a console application, or an empty web application, then using this would help you transition into a full MVC web app.

Let's play around with some of these to see what we can do. Say we have a model, like below, and we want to create a controller with some actions and views for simple CRUD operations. 

```csharp
    using System;

    namespace MyApp.Models
    {
        public class EmployeeModel
        {
            public string Id { get; set; }

            public string FullName { get; set; }
            
            public string Email { get; set; }

            public string Salary { get; set; }
        }
    }
```

Since we're planning on creating all of the basic CRUD operations, we'll of course also need a `DbContext` in our application. We'll use dependency injection to pass our context so make sure you've registered your context with the DI container in `Startup.cs`. 

```csharp
// EmployeeContext.cs
using MyApp.Models;
using Microsoft.EntityFrameworkCore;

namespace MyApp.Data 
{
    public class EmployeeContext : DbContext
    {
        public EmployeeContext(DbContextOptions<EmployeeContext> options) : base(options) 
        {

        }

        public DbSet<EmployeeModel> Employees { get; set; }
    }
}
```

```csharp
// Startup.cs
using Microsoft.EntityFrameworkCore;

...

public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc();
    services.AddDbContext<EmployeeContext>(options => options.UseSqlite("Data Source=employees.db"));
}
```

You don't necessarily have to use the DI container built into .NET Core to manage your DbContext here. You can read more about other ways of creating this and wiring it up to LocalDb or some other database [here](https://docs.microsoft.com/en-us/ef/core/miscellaneous/configuring-dbcontext). I'm using SQLite as an example in this blog post, but normally you'd provide the connection string for your development/production database above.

Now that our data context is registered, and our data model is created, we can scaffold a controller that will perform all the CRUD operations for this model in our database using the following command. Note `-m` is short for `--model` and `-dc` is short for `--dataContext`.

```bash
dotnet aspnet-codegenerator controller -name EmployeeModelController -m EmployeeModel -dc EmployeeContext -outDir Controllers
```

It will take a few seconds to run, but when it's completed all of these files will have been created for you.

- Controllers\EmployeeModelController.cs
- Views\EmployeeModel\Create.cshtml
- Views\EmployeeModel\Edit.cshtml
- Views\EmployeeModel\Details.cshtml
- Views\EmployeeModel\Delete.cshtml
- Views\EmployeeModel\Index.cshtml

If you take a look inside your new controller, you'll see that **everything** has been done for you. I've pasted some of the code below to give you an idea, but not the whole class for brevity.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using MyApp.Data;
using MyApp.Models;

namespace MyApp.Controllers
{
    public class EmployeeModelController : Controller
    {
        private readonly EmployeeContext _context;

        public EmployeeModelController(EmployeeContext context)
        {
            _context = context;
        }

        // GET: EmployeeModel
        public async Task<IActionResult> Index()
        {
            return View(await _context.Employees.ToListAsync());
        }

        // GET: EmployeeModel/Details/5
        public async Task<IActionResult> Details(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var employeeModel = await _context.Employees
                .SingleOrDefaultAsync(m => m.Id == id);
            if (employeeModel == null)
            {
                return NotFound();
            }

            return View(employeeModel);
        }

        // Remaining controller actions below
```

Additionally you can use similar commands specifying other generators to scaffold specific views that may not be related to CRUD operations, or perhaps a controller that doesn't just perform CRUD operations, or Razor pages if you'd rather use code-behind than a controller to manage your web app actions. 

## Conclusion

While there are other ways to use the code generator, I think it's clear that the controller scaffolding is the most significant in that it completely creates an entire *set* of actions surrounding your data model as well as all appropriate views. You can, of course, individually scaffold views to your model using the provided templates, or use Razor pages and avoid the controller altogether. This is up to you, but I hope this has shown the value of a code scaffolding that doesn't require Visual Studio. 

Check out the complete sample project from this post on my [GitHub here](https://github.com/JamesEarle/core-code-scaffolding).

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*