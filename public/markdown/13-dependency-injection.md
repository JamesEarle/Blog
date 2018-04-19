# Dependency Injection

*How can you decouple clients and their dependent services in your code? Dependency Injection is the solution*

## Introduction

In many applications users write code that depends on services instantiated within to perform certain tasks. This is a pretty common programming practice, because you're only creating and using a service provider where it's necessary. The problem with this is that it tightly couples the code using your service provider (the client) with the service. As you add more services to a single class or piece of code, the coupling becomes tighter and tighter because if a single service provider fails somewhere your class will fail with it. Dependency injection looks to tackle this problem by decoupling services and their dependencies.

## Example

The premise of dependency injection relies on the fact that your client code does **not** ever create or find it's dependencies. Instead, they are passed to it. This can be done in the constructor of an object, for example. The benefit of this is that it creates a pattern of consumption for your client that can go uninterrupted should the service providers code change. By removing the responsibility of creating and managing your service provider in your code, your client becomes more narrowly defined.

A common example of dependency injection revolves around database connections. In ASP.NET Core you can add databases (as well as any other service provider) to the built-in dependency injection container. By doing this, you register all dependents on application startup and request them in your constructors as necessary, loosely coupling your code.

You can use [Entity Framework Core's `DbContext`](https://docs.microsoft.com/en-us/ef/core/miscellaneous/configuring-dbcontext) class to add a context into your dependency injection container. Here is an example of what that would look like in an ASP.NET Core MVC app using a SQL Server connection.

```csharp
// Models/Request.cs
using System;
using System.ComponentModel.DataAnnotations;

public class Request
    {
        // Primary key
        public int Id { get; set; }

        // Form inputs
        [Display(Name = "Search")]
        public string Content { get; set; }

        [Display(Name = "Result")]
        public double Result { get; set; }

        [Display(Name = "Json")]
        public string Json { get; set; }

        // Auto timestamp
        [Display(Name = "Date Created")]
        public DateTime Timestamp { get; } = DateTime.Now;
    }

// Models/RequestDbContext.cs
using Microsoft.EntityFrameworkCore;

public class RequestDbContext : DbContext
{
    public RequestDbContext(DbContextOptions<RequestDbContext> options) : base(options) { }

    public DbSet<Request> Requests { get; set; }
}
```

First we create a context built off of our data model. In this case we're storing information about web requests made to an API, so we have a `Request` model. Now in order to access our data connection every time we perform a CRUD operation on our `Request` model, we need access to the `RequestDbContext` from the `RequestController`. This is where the dependency injection container comes in. You *could* in theory create a database connection in your web request, as this is where you'll access it, but this can cause problems. What if your database has an issue connecting or is just slow? This will effect every request you make. If you inject the dependency, the connection is already established and it is safe to operate on the database. Now, if any problems occur they will not **necessarily** ruin the entire web request. Note that you should still be prepared for the event that things go wrong with each request. This is called [Defensive Programming](https://en.wikipedia.org/wiki/Defensive_programming)

Now that we've created our data context, we can add it into the dependency injection container like so.

```csharp
// Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // Add framework services.
    services.AddDbContext<RequestDbContext>(options => options.UseSqlServer(connectionString));
    services.AddMvc();
}
```

And if you want to add any other service providers to the DI container, simply create an instance in your Startup.cs file and add it using either `addSingleton()`, `addScoped()`, or `addTransient()`. A singleton will use the same instance of a class throughout the lifecycle of your application. Scoped dependencies exist as a single instance across the lifecycle of an HTTP Request. A Transient dependency will be a new instance every time it is requested. This would modify the above to be as below.

```csharp
// Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // Add framework services.
    services.AddDbContext<RequestDbContext>(options => options.UseSqlServer(connectionString));
    services.AddMvc();

    // Singleton, Scoped, Transient dependency injection
    services.addSingleton<AltDbContext>(); // App lifecycle
    services.addScoped<Cache>(); // HTTP Request lifecycle
    services.addTransient<ApiWrapper>(); // New every time
}
```

So now the final step is making use of your dependencies in your client. Simply request them in the constructor of your controller (or other client code, this is not MVC exclusive).

```csharp
public class RequestsController : Controller
{
    public RequestDbContext _db;

    public RequestsController(RequestDbContext context)
    {
        _db = context;
    }

    public IActionResult Index() 
    {
        // Access and use _db
    }

    // ...

}
```
## Conclusion

Dependency Injection is a great way to manage multiple services that you use across your application. It allows you to decouple any operations between classes and service providers. In the end this enables you to more freely manage either client or service provider code without having to make changes to any of its dependents.

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*