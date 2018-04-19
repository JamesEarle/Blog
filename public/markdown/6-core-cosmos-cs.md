# Using CosmosDB with .NET Core 

*With the Cognitive Services Emotion API, we'll go over using CosmosDB to store and retrieve data in your .NET Core web app.*

## Introduction

To preface: the finished code for this post can be found on my [GitHub here](http://github.com/JamesEarle/core_cosmo_cs).

The reason for this post is an attempt on my own part to learn how NoSQL databases work. Having some experience with MongoDB in the past I thought it would be a good idea to try something different. Before we dive in to the implementation, let's talk about the tech.

### The Technology

 - [**.NET Core**](https://www.microsoft.com/net/core#windowscmd) is a free, open-source, cross-platform version of .NET. It distinguishes itself from the original .NET by having improved dependency management, the ability to run multiple versions in parallel, focusing on modularity, and by being self-contained and lightweight. When you ship a .NET Core application, the entire framework is included in the packaging. Being only a few megabytes in size, this allows for assured versioning and not having to rely on the host OS.

 - [**Cosmos DB**](https://docs.microsoft.com/en-us/azure/cosmos-db/introduction) is a NoSQL database service provided by Microsoft, hosted in Azure.

 - [**Cognitive Services**](https://azure.microsoft.com/en-us/services/cognitive-services/) is a series of machine learning APIs provided by Microsoft. The one we'll be using detects faces in images and analyzes their emotions, returning confidence ratings for each. 

## Create your .NET Core application

The first step is creating your web app. You can do this using Visual Studio, but I prefer to develop using [VS Code](https://code.visualstudio.com/) and the integrated terminal. Code scaffolding is provided for you in either case, so regardless of your preference you should be able to follow along.

Run the command below to create a new MVC web application. The `-o` flag specifies the output directory for the scaffolded code. This folder is created if it doesn't already exist.

```bash
dotnet new web -o MyNewApp
```

You may see a message similar to `Required assets to build and debug are missing from 'OtherApp'. Add them?` if you've done this in VS Code. Just click yes, this creates `launch.json` and `task.json` for you. These are used in VS Code to define your build tasks.

You'll need to add a few things to your `Startup.cs` to make 

We're going to use the `dotnet aspnet-codegenerator` tool to scaffold our controller and views for us. To add this into the project, open your `MyNewApp.csproj` file and add the correct packages. When you're done, your file should look like this.

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <Folder Include="wwwroot\" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.All" Version="2.0.0" />
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="2.0.0"/>
    <PackageReference Include="Microsoft.Azure.DocumentDB.Core" Version="1.5.0"/>
  </ItemGroup>
  <ItemGroup>
    <DotNetCliToolReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Tools" Version="2.0.0"/>
  </ItemGroup>
</Project>

``` 

Next create the MVC directories.

```bash
mkdir Models
mkdir Views
mkdir Controllers
```

Now from the integrated terminal we can create our controller. We'll call this our `ServiceController` as it will be responsible for handling requests with the Cognitive Services API.

```bash
dotnet aspnet code-generator controller -name ServiceController -outDir Controllers
```

## Conclusion


--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*