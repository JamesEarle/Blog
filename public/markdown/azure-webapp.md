# Hosting an Azure Web App

*Notes on hosting your Web App in Azure that will improve your experience hosting, as well as grant you better insight into your applications performance.*

## Preamble

This post is a part 2 of my previous post on [building your Node blog](http://jamesirl.com/posts/5), but I'll be expanding more generally than just Node hosting. This post will also focus on how to improve your experience and gain insight into your web apps performance.

## Resource Groups

All Azure resources have to exist inside a resource group. You can think of resource groups as something similar to a project directory in your file system. They hold related files (resources) that communicate in some way or another. I have multiple resource groups, each with only a single VM and associated databases and application insights, but you can have multiple VMs inside a resource group without issue.

![Azure Resource Group Creation](/uploads/3-azure-rg.png)

## Web App Services

Azure has an enormous number of offerings for hosting web apps. You can usually choose the default "Web App" option and configure it how you want, but if you want some of the configuration done for you there are plenty of options. Do you know that you'll need an SQL Database as well? Are you using Node with Express? How about PHP? All of these options exist in a pre-configured manner.

![Azure Web App Creation Options](/uploads/3-azure-web-apps.png)

*Pro-tip: Be sure to enable "Application Insights" when creating your Web App. These provide extremely useful analytics about your apps performance and availability.*

**Note!** When you are creating a resource, be sure to select "Use Existing" under resource group. This way you can more easily segregate your Azure resources.

## Deployment

Azure makes web deployment of your app incredibly easy. You can enable different deployment slots for development staging, production, etc. You can also use GitHub as your source, so whenever you push to a specific branch your app is automatically updated with the most recent code. It's a good idea to use your `master` branch as a release branch, staging your application with `dev` and `feature` branches.

![Deployment Options](/uploads/3-azure-deployment.png)

To enable Git deployment, go to the "Deployment Options" panel in the left-hand navigation column. 

If you've chosen a Web App template (like Web App Express) there might be information already here. You can just click "Disconnect" if this is the case, as you'll attach the deployment options to your own GitHub repository. If there is nothing setup yet, you'll be prompted to configure a deployment source. Here you can select from Visual Studio Team Services, a local Git repository, GitHub, and a few more. This comes down to preference, but I like to select GitHub here.

![GitHub](/uploads/3-azure-github.png)

**Note!** If you haven't already, you will be asked to link your Azure account to your GitHub so it can access your repositories.

Select the repository you want to base your deployment off of.

## Improvements

Now, the default Web App instances are usually set up in a way that just works for you. There are some ways you'll want to improve your app though.

 - Default Documents
   - If you are using Node, or some other web framework that requires a default document other than `index.html`, you'll need to specify it. Go to "Application Settings" in the left-hand column and scroll down to "Default Documents". There is an empty space for you to add your main file (e.g. `app.js`, `main.php`, etc.)
 - Always On
   - This option is also located in the "Application Settings" panel in the left-hand column. By default, Azure idles applications that are low-traffic. This is to save on resources in your subscription. I recommend turning this on to prevent this. It will improve response time on your site, even if nobody has used it in a while. I haven't noticed a particularly large increase in cost due to this feature either.
 
## Application Insights

Remember when we created our Web App we enabled "Application Insights"? This automatically created an Application Insights resource for you in the same resource group, named after your Web App. Go to your resource group and explore the insights. 

![Azure Insights](/uploads/3-azure-insights.png)

There are a lot of things you can do here, I really encourage you to explore this resource as it can give you a lot of knowledge about your app performance.

An excellent feature is the ability to add Alert Rules that will email you (or whoever the administrator is) when a certain condition is met. These can focus on CPU usage, number of request, or app availability. 

![Azure Ping Test](/uploads/3-azure-ping-test.png)

In the above Ping test I setup for this blog, I'll be notified by email if my application is unavailable in more than 2 locations for 5 minutes. You can customize these parameters as much as you like.

There are also charts denoting server response time, how many requests your receiving, etc. You can alter the time range for any of these anywhere from the last 30 days to the last 30 minutes. Setting up custom time ranges is also supported. 

One feature I'm a fan of is the Live Metrics Stream. This gives you a few graphs that update in real time regarding your apps health. Unless you're hosting a pretty popular app, you may not need this. I still think it's cool though!

![Azure Live Stream](/uploads/3-azure-live-metrics.png)

## Conclusion

I hope this blog post helped you learn a little more about some of the great features Azure offers for web hosting. There's only so much I can cover in a single blog post, so I really encourage you to explore the Azure Portal further. There is a ton of services made to make hosting easier for you. 

---

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*