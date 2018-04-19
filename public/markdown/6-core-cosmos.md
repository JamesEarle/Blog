# Using CosmosDB with .NET Core 

*We'll go over using CosmosDB to store and retrieve data in your .NET Core web app.*

## Introduction

A finished application using what we'll go over in this post can be found on my [GitHub here](http://github.com/JamesEarle/core_cosmo_cs). My implementation uses the Microsoft Cognitive Services Emotion API to generate data that gets logged in the database.

## The Technology

 - [**.NET Core**](https://www.microsoft.com/net/core#windowscmd) is a free, open-source, cross-platform version of .NET. It distinguishes itself from the original .NET by having improved dependency management, the ability to run multiple versions in parallel, focusing on modularity, and by being self-contained and lightweight. When you ship a .NET Core application, the entire framework is included in the packaging. Being only a few megabytes in size, this allows for assured versioning and not having to rely on the host OS.

 - [**Cosmos DB**](https://docs.microsoft.com/en-us/azure/cosmos-db/introduction) is a NoSQL database service provided by Microsoft, hosted in Azure.

## Creating Your Database

Before we get started, let's get setup with your CosmosDB instance in Azure. To create your database, go into the [Azure portal](http://portal.azure.com). In the left hand column select "New" and search for "Azure Cosmos DB". A pane will appear describing the service to you. Now just select "Create" at the bottom of this pane and you'll be shown a form, like below.

![Create CosmosDB](/uploads/6-create-cosmos.PNG)

**What do these values mean?**

 - **ID:** The unique identifier for this database. This will be used in creating your connection URL. Try to pick something that makes sense but is unique.
 - **API:** CosmosDB is a multi-model database. This means it supports more than just document style queries and structure. I like SQL query structure even though CosmosDB is a NoSQL database, so I recommend choosing "SQL (DocumentDB)"
 - **Subscription:** The Azure subscription your CosmosDB will fall under. Usually will default to the correct choice.
 - **Resource Group:** Resource groups are just logical separations of your Azure resources. Similar to putting all your pictures on your computer in the "Pictures" directory. If you have a few Azure resources you want to interact with this database already, you can go ahead and put this in the same resource group as them. Otherwise, create a new one.
 - **Location:** Where your resource will be hosted by Azure. This will default to one close to you but you can change it to be anywhere.

Once you've provided the correct information, press "Create" and wait for your deployment to finish. This could take a few minutes.

Next we're going to record some important information about your CosmosDB instance. Once it's been deployed, navigate to it through the left hand column in the portal. "Resource Groups -> (your resource group name) -> (your database name)" is the path you'll follow. Shown below.

From the "Keys" pane, take note of your database URI. It's in the form of "https://\<db-name>.docuements.azure.com:443/". Next note the primary key. These two values are what you'll need to connect to your database.


## Adding a Package Reference

Add the `Microsoft.Azure.DocumentDB.Core` package to your `MyAppName.csproj` file like below. I've shown my entire file so you can be sure yours contains the correct packages.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.All" Version="2.0.0"/>
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="2.0.0"/>
    <PackageReference Include="Microsoft.Azure.DocumentDB.Core" Version="1.5.0"/>
  </ItemGroup>
  <ItemGroup>
    <DotNetCliToolReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Tools" Version="2.0.0"/>
  </ItemGroup>
</Project>
```

Next run restore using 

```bash
dotnet restore
```

## Include in Your App

In your `Startup.cs` you'll want to add the `using` statements for the package we just added. 

```csharp
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
```

Then we can add the credentials to your database along with creating our database client

```csharp
public class Startup
{
    // Replace with your credentials, found in the Azure portal
    private const string EndpointUri = "https://<my-app-name>.documents.azure.com:443/";
    private const string PrimaryKey = "<your cosmosdb primary key>";
    private DocumentClient client;

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;

        // Creating a new client instance
        client = new DocumentClient(new Uri(EndpointUri), PrimaryKey);

        // Create any database or collection you will work with here.
        this.client.CreateDatabaseIfNotExistsAsync(new Database { Id = "NewDatabase" });
        this.client.CreateDocumentCollectionIfNotExistsAsync(UriFactory.CreateDatabaseUri("NewDatabase"), new DocumentCollection { Id = "NewDatabaseCollection" });
    }
```

The next step is adding your client into the dependency injection container built into .NET Core. This is how you can pass around any dependency (like database clients or similar service providers) throughout an application without relying on a broad, unnecessary, global scope.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc(); // Only if you are using ASP.NET MVC
    services.AddSingleton(client); // Add client to Dependency Injection Container
}
```

Finally, we can access this database client from our controllers simply by adding it as a parameter in our controller constructor.

```csharp
public class ServiceController : Controller 
{
    DocumentClient _client;

    // Recieving from the DI Container
    public ServiceController(DocumentClient client) {
        _client = client;
    }
}
```

## Querying Your Database

Let's go over the four main CRUD operations and how to implement them in your app.

### Create and Read

To create a document in a collection, you can use the `_client.CreateDocumentAsync()` method. It's also a good idea to check if a document exists before you create it, so you can use `_client.ReadDocumentAsync()` to try and find it first. This works out to look like the below code.

```csharp
private async Task CreateDocumentIfNotExists(string databaseName, string collectionName, MyModel model)
{
    try
    {
        // Check if document already exists
        await _client.ReadDocumentAsync(UriFactory.CreateDocumentUri(databaseName, collectionName, model.Id.ToString()));
        Console.WriteLine("Found Model {0}", model.Id);
    }
    catch (DocumentClientException de)
    {
        if (de.StatusCode == HttpStatusCode.NotFound)
        {
            // Create document if not found
            await _client.CreateDocumentAsync(UriFactory.CreateDocumentCollectionUri(databaseName, collectionName), model);
            Console.WriteLine("Created Model {0}", model.Id);
        }
        else
        {
            throw;
        }
    }
}
```

The above read example using `_client.ReadDocumentAsync()` is only able to read a single document. If you want to query multiple documents and access many items in your collection you can use queryable objects. The below method shows how you can query your collection and return all documents where some value is greater than a given threshold, in this case 50. What's returned is an `IQueryable<T>` that you can further access without actually querying your database again.

```csharp
private IQueryable<MyModel> ReadAllAboveFifty(string databaseName, string collectionName) {
var queryOptions = new FeedOptions { MaxItemCount = -1 };     

var resultsQuery = _client.CreateDocumentQuery<MyModel>(
        UriFactory.CreateDocumentCollectionUri(databaseName, collectionName), queryOptions)
        .Where(r => r.Value > 50);

return resultsQuery;
}
```

### Update (Replace)

To update documents in CosmosDB is to *replace* them. This is effectively the same as an update, being a delete and insert. You can do this using `_client.ReplaceDocumentasync()`. In this function, the first argument is the document to be replaced. The second is the document it will be replaced with. You can use this to read a document, store it in a variable, modify it, then "save" by replacing the old version of itself. 

```csharp
private async Task ReplaceDocument(string databaseName, string collectionName, string value, MyModel updatedModel)
{
    try
    {
        await this.client.ReplaceDocumentAsync(UriFactory.CreateDocumentUri(databaseName, collectionName, value), updatedModel);
        this.WriteToConsoleAndPromptToContinue("Replaced MyModel {0}", value);
    }
    catch (DocumentClientException de)
    {
        throw;
    }
}

// Usage
private async void UpdateModel() 
{
    MyModel model = new MyModel 
    {
        Id = "1",
        myStringValue = "foo",
        myIntValue = 23
    }
    await CreateDocumentIfNotExists("MyModelDatabase", "MyModelCollection", model);

    MyModel updatedModel = model;
    updatedModel.myStringValue = "bar";
    updatedModel.myIntValue = 24;

    await ReplaceDocument("MyModelDatabase, MyModelCollection", model.Id, updatedModel);
}
```

### Delete

If you've been paying attention to the naming convention the `Document _client` uses, then you can probably guess what the delete method looks like. Yep! It's `_client.DeleteDocumentAsync()` and it's used in the exact same fashion as the previous `_client` methods.

```csharp
private async Task DeleteDocument(string databaseName, string collectionName, string documentId)
{
    try
    {
        await _client.DeleteDocumentAsync(UriFactory.CreateDocumentUri(databaseName, collectionName, documentName));
        Console.WriteLine("Deleted Model {0}", documentId);
    }
    catch (DocumentClientException de)
    {
        throw;
    }
}
```

## Conclusion

That covers the four basic CRUD operations. The usage we went over applies to all types of .NET Core applications, however if you're making an ASP.NET Core app that uses MVC you can scaffold code using the `dotnet aspnet-codegenerator` CLI tool. This makes it even easier to setup CRUD operations in your app. You can read more about this tool [here](https://docs.microsoft.com/en-us/aspnet/core/tutorials/first-mvc-app-xplat/adding-model#scaffold-the-moviecontroller).

Now you can use CosmosDB in your .NET Core app. Hopefully you've found this post helpful!

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*