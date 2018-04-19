# Consuming an Azure ML Web Service using Node.js

*Learn how to use an Azure ML web service in your Node.js application.*

## Introduction

In [last week's blog post](http://jamesirl.com/posts/12) we went over creating an Azure Machine Learning model. Near the end of that post I mentioned that you can take your model and publish it as a predictive web service you can access from C#, Python, and R. There is no JavaScript version on the official docs, so this week I thought I'd share how to implement this using JavaScript and Node.js.

## Getting Started

Before we can get to the code, you need to publish your Azure ML Model as a predictive web service. In [Azure ML Studio](https://studio.azureml.net/) open your experiment. Press the "Play" button to run your experiment. You'll know it's finished when every module has a green check mark. Once it's done you can hover over the "Set Up Web Service" button in the bottom navigation bar and select "Predictive Web Service"

![Publish as Predictive Web Service](/uploads/9-publish.png)

After selecting this, you'll see some of the modules in your experiment shift around and a new tab appear at the top of the center panel labeled "Predictive Experiment". What this is doing is setting up an identical version of your experiment, but instead of receiving data from a static source like your dataset, it will get it from a web POST request. We'll go over setting this up in the next section.

Once again, run the experiment. This is a required step so your changes can be validated in Azure ML Studio. Once you've done this, select "Deploy Web Service". When this is finished a confirmation page will show you your API key as well as some other options. Take note of this API key.

![Deploy Web Service](/uploads/9-deploy.png)

Next go to [services.azureml.net](https://services.azureml.net/). This is where you'll go to manage any web services you've published from Azure ML Studio. From the home page, select "Web Services" in the top center navigation bar. If you don't see your published experiment, try refreshing the page. You can also try checking under the "Classic Web Services" navigation tab.

When you click on your experiment, if it is under classic you might be shown all of your existing endpoints, or you'll be taken straight to the management home page, below. If you're shown your web service endpoints, just select "default".

![Web Service Management](/uploads/9-service-management.png).

Once you're in the management portal, select "Use Endpoint" in the left column under "Basics". This will take you to the page with C#, Python, and R code samples. It will also provide you all of your API keys, as well as URIs necessary for making either request/response consumption, or batch requests consumption. Take note of the "Request-Response" URI and "Primary Key", as you will need these in the next section.

## Consuming Your Web Service.

Now that you've published your experiment as a web service and gathered all the necessary information, we can write the code responsible for consuming your experiment from an application. You can do this in any Node.js application using the `request` npm package. Install this using `npm install request --save` and it will automatically be placed into your `package.json`. 

First, we'll require the `request` module and define important variables.

```js
const req = require("request");
const uri = "<your-api-uri>";
const apikey = "<your-api-key>";
```

Then we format our data. This is an important step because malformed data in your request will give you headaches when debugging. In a real application you would probably use some form data or some alternate external data source that you're trying to predict, but for the sake of example we'll use static values as our data. Notice that the keys in the `input1` object are the same as the column names from our original data source (mentioned in the [previous post](http://jamesirl.com/posts/12)). If you chose a different data source while following along with either of these blog posts, your data will be formatted differently. Specifically, your column labels will change. You can see how your request should be formatted in the [Web Service Portal](https://services.azureml.net/) in the same place we navigated to earlier in this post. Where the code samples are shown in C#, Python, and R, you will see an automatically formatted data object you can use to model yours in JavaScript as well.

```js
let data = {
    "Inputs": {
        "input1":
        [
            {
                'timestamp' : "",
                'open'      : "1",
                'high'      : "1",
                'low'       : "1",
                'close'     : "1",
                'volume'    : "1"
            }
        ],
    },
    "GlobalParameters": {}
}
```

The final step before actually calling the API is to format the request options and headers. If you've ever used AJAX for something like this, it will feel very familiar. **Remember to turn your data payload into a JSON string**. Without this, you'll be sending the JavaScript object data, and the request will (obviously) fail.

```js
const options = {
    uri: uri,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apikey,
    },
    body: JSON.stringify(data)
}
```

Now that everything is setup we can make the request. This is a prety simple function with a response callback that gives you access to the body. If you've done this correctly you'll receive a "Results" object that contains your original data payload as well as your Scored Labels.

```js
req(options, (err, res, body) => {
    if (!err && res.statusCode == 200) {
        console.log(body);
    } else {
        console.log(res.statusCode);
    }
});
```

There is also a handy testing page in the Web Services Portal that you can use to play with your model before actually trying to send it data through code. It shows your inputs and then the response you'd get, but formatted on the web page. The Scored Labels are the prediction of your independent variable. In the case of our stock market forecasting, this was the "close" value. You can see in the response sample below that our Scored Labels value is pretty close to our actual close price! Pretty good for a very simple model.

![Test Your Web Service](/uploads/9-test.png)

## Conclusion

While the documentation on the Machine Learning Web Services Portal shows you how to consume your model using C#, Python, and R, I felt it would be valuable to also provide code for consumption using JavaScript. You can see real applications of this on my [GitHub](https://github.com/JamesEarle/AzureML-Stock-Regression). 

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*