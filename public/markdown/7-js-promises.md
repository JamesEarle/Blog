# JavaScript Stuff &#35;2 - Promises

*Going over how to use JavaScript Promises to improve your asynchronous code.*

## Introduction

Have you ever heard the saying *"A dollar is a promise"*? This means that if you hand somebody a dollar bill, you're promising them it's value. They trust in your promise that they can then go and use this value elsewhere. When they go to use this dollar at the store, the only reason they're able to make a purchase with it is because the vendor also believes in the value of this piece of a paper. JavaScript Promises are a little bit like this. When you perform some task that runs asynchronously, you can use a Promise to continue execution and fill in that value later once the task has completed. 

Okay. maybe that's not *the best* analogy. The point is that you are getting something that you are assured will have some value. You're basically telling your code "this will be something, eventually". Let's think of this in the context of an asynchronous web request. Inside your app somewhere you need to call an API. Normally, you're going to have to wait for the request to complete before you can make any use of the returned value. With a Promise you can continue execution and pass around a variable that acts as a placeholder for your request's returned value. Think of this like a hollow variable, waiting to be filled in.

## How to use Promises

You can use the `Promise` constructor to create a Promise object. These objects exist in one of a few states.

 - Pending - Initial state, neither fulfilled or rejected
 - Fulfilled - The success state
 - Rejected - The failure state

The `Promise` constructor takes an executor function that passes both `resolve` and `reject` to your code. You call these functions when your the operation inside your Promise either fails or succeeds. After we've created our Promise we can use `then()` to call and handle the result. The main advantage of using `then()` is avoiding many nested callbacks. Instead, `then()` allows for asynchronous function chaining as it ensures that one asynchronous function that relies on another will not execute until the prior Promise has been either fulfilled or rejected.

Below shows a simple `Promise` constructor with a 50% chance of succeeding and a 50% chance of failing. This is where you would handle either case in your code using `resolve` or `reject`. Note that you can pass any variable through `resolve` or `reject`, not just a string.

 - **Promise Constructor**
 ```js
let p = new Promise((resolve, reject) => {
    if(Math.random() > 0.5) {
        resolve("Success");
    } else {
        reject("Failure");
    }
});

p.then(result => console.log(result)); // Prints "Success" or "Failure"
 ```

Above I mentioned the concept of chaining. This is to avoid having many nested callbacks in your asynchronous code. Every time you call `then()` a new Promise is created and returned with the previous Promise's result. If you had to make multiple API calls in your code, then store a result in a database, it could require multiple levels of nested callbacks like below if you **don't** use Promises.

```js
makeApiCall(input, (err, res1) => {
    makeSecondApiCall(res1, (err, res2) => {
        makeCallToDatabase(res2, () => {
            // Store in DB
        })
    })
})
```

However, if you're using Promises you can chain these asynchronous calls using `then()` as well as `catch()` to handle any errors that may occur.

```js
let p = new Promise((resolve, reject) => {
    let result = makeApiCall(input);
    if(result) {
        resolve(result);
    } else {
        reject("Failure - " + result.errorMessage);
    }
});

p.then(result => {
    makeSecondApiCall(result);
}).then(result => {
    makeCallToDatabase(result);
}).catch(err => {
    console.log(err);
})
```

So let's try out this code in a more real scenario. Say we want to make an API request to gather stock prices. We can do this using [AlphaVantage's free API.] (https://www.alphavantage.co/) Just generate a key for yourself to make requests. 

First let's set up our request. This is using the [npm request library](https://www.npmjs.com/package/request)

```js
const request = require('request');

let key = "<your api key>";
let uri = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=TSLA&apikey=" + key;

let p = new Promise((resolve, reject) => {
    request.get(uri, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            resolve(body.substring(0, 500)); // Successful responses are really long, so just first 500 for example
        } else {
            reject(res.statusCode)
        }
    })
})
```

Now we can make our request, and process the results using our Promise. Similarly, if we have any additional tasks we want to do that may or may not be asynchronous, we can easily chain them together.

```js
p.then(result => {
    console.log(result);
});

// Or if you have more tasks
p.then(result => {
    let newResult = processResults(result);
    return newResult;
}).then(result => {
    // Perform whatever final task you want
    // e.g. Present result to user, store in DB, etc.
    console.log(result);
}).catch(error => {
    console.log(error);
});
```

If you've done this successfully, when you run your code you'll get a response like this.

```bash
$ node .\promise.js
{
    "Meta Data": {
        "1. Information": "Daily Prices (open, high, low, close) and Volumes",
        "2. Symbol": "TSLA",
        "3. Last Refreshed": "2017-09-18",
        "4. Output Size": "Compact",
        "5. Time Zone": "US/Eastern"
    },
    "Time Series (Daily)": {
        "2017-09-18": {
            "1. open": "380.2500",
            "2. high": "389.6100",
            "3. low": "377.6800",
            "4. close": "385.0000",
            "5. volume": "7149295"
        },
```

Now if the web request ever hits an error your output instead will be that error because of our `catch()` call. If we try adding a typo in our request URI, the response will return with 404 rather than 200, so no response body will be shown.

```bash
$ node .\promise.js
404
```

You can expect similar behaviour with different status codes. Be sure to always include a `catch()` after any `then()` chains in your code, otherwise if your promise is rejected your code will error with an "Unhandled Rejection in Promise".

## Conclusion

That's the basics of JavaScript Promises. You can use them to clean up your code and guarantee the order of asynchronous operations that rely on each other. Next time you're dealing with any web requests or database queries in your Node.js app, give promises a try! Hopefully this post has been a helpful resource for you.

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*