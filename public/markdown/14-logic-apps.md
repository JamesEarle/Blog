# Code Less, Do More Using Azure Logic Apps

*Create entire applications with connector workflows and minimal code.*

## Introduction

In the era of serverless architecture and code-free applications, cloud has become king. The things you can do without a hosted application you wrote yourself are incredible, and constantly improving. Azure Functions provide a way to write serverless code that can run based on a variety of triggers, and Azure Logic Apps allow you to use integrated connectors to build out an application flow without doing any development. They integrate with eachother seamlessly, making the creation of serverless applications easier than ever. Let's take a deeper look.

## Azure Logic Apps

Have you ever heard of the app [IFTTT (If This Then That)](https://ifttt.com/)? It lets you connect different services or applications to create a workflow based on an action. For example, when you get an email with an attachment, save that attachment to your OneDrive. The abstracted structure of IFTTT says "IF *action* THEN *other-action*". Azure Logic Apps are a little bit like this. You can create a workflow of different services and applications based on an initial trigger. An example using logic apps could be "IF *you receive an email from a customer* THEN *store that customer's information in your database*". There are nearly **200** different connectors for external services. This includes social media triggers like Twitter and Facebook, as well as development tools like SQL Server, Asana, and Microsoft's Cognitive Services APIs. This is what an example workflow might look like.

![Logic App Workflow](/uploads/14-logic-app-workflow.png)

## Azure Functions

Azure Functions operate in a similar manner to Logic Apps in that they wait for an initial trigger before operating. This time, however, you write your own code to do anything you want. The supported languages are `C#`, `F#`, and `JavaScript`. Here, you can listen for triggers like HTTP requests, as well as actions from other resources like databases or webhooks. You also have the option to manually trigger your function, or operate it on a specified timer. When you go to the Azure portal and create a Function App, there are many templates provided for you to set up different triggers. You can also opt-in to setting it up yourself. An example timer function using JavaScript is below.

![Sample Azure Function](/uploads/14-sample-function.png)

## Integration

Using Azure Logic Apps with Azure Functions is like putting peanut butter with jam, it just works. It's incredibly easy to get connect these two services to work for you. Once you've created your resources in [the Azure Portal](https://portal.azure.com), you can use the built in connector from your Logic App to make a request against your Azure Function. When you open a new logic app, the first thing you'll see is an introduction video. If you scroll down on this page, there is a huge number of templates you can choose from! These are sorted by popularity by default, so you can see what people really like using this technology for. For now, you can just create a new "Blank Logic App" and you'll be prompted to chooser a connector or trigger to start with.

![New Logic App](/uploads/14-first-logic-app.png)

When you first access your new function app you'll see that you have no functions yet. You can press the "+" button next to "Functions" to create one. Choose "Webhook + API" and the language you'd like to work in. I chose C#.
These functions have access to .NET Framework libraries (or .NET Core, if you choose to use it). Some sample code is provided for you that shows you how to access the request body. You can test this by selecting "Test" on the right hand side of the page, and viewing your output in the output window below.

![New Function](/uploads/14-first-function.png)

So let's say you're interested in collecting data about a user that is tweeting about a topic you care about. You can start with a Logic App connector that searches for your given search term at a frequency you define. This just acts as a wrapper around the Twitter API. You'll also need a Twitter account to authenticate to use this service.

![Twitter Trigger](/uploads/14-logic-app-designer.png)

Next you add an action that will pass relevant data to your function. You'll see panels popup when you select a field, these automatically provide the selected Twitter data like username, tweet text, etc. You can add one of these into your request body, but right now adding more than one will ruin the JSON structure of your request body. If you want access to more than one piece of information from the API, I recommend you add them all to the request headers like below.

![Function Request](/uploads/14-function-request.png)

Now you can select the "Save" button in the top panel, and then, when you've written some code in your function to handle the request, you'll press play. Here is what some sample code might look like.

```csharp
using System.Net;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    var headers = req.Headers;

    var user = headers.GetValues("Username").FirstOrDefault();
    var text = headers.GetValues("TweetText").FirstOrDefault();
    var retweets = headers.GetValues("RetweetCount").FirstOrDefault();

    log.Info(String.Format("{0} tweeted: \"{1}\" and got {2} retweets!", user, text, retweets));

    return req.CreateResponse(HttpStatusCode.OK, "We're good!");
}
```

## Conclusion

There are tons of different ways you can integrate features between Azure Logic Apps and Azure Functions! Another connector you could add in the above example is to use Cognitive Services and get the sentiment of a Twitter user's tweet. You could then run an Azure Stream Analytics job to query the data before storing in a database. The possibilities are endless. This presents a great way to get quick, functional tasks done with all of the work connecting services done for you.

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*