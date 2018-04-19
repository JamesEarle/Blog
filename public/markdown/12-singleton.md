# A Discussion on Singletons

*When should we be using this classic design pattern?*

## Introduction

Design patterns are a way of implementing your code around a problem that somebody else has faced before. They allow you to abstract your program into the necessary pieces that conquer some challenge with a bit of grace. Having a solid knowledge of design patterns will do you many favors throughout your lifetime as a programmer, so I would encourage you do some reading if you haven't already. I'd recommend ["*Design Patterns, Elements of Reusable Object-Oriented Software*"](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612) for a very thorough overview, even if you don't plan on working in an object-oriented language. The examples are shown in C++, but many of the patterns are generic enough to be implemented across many different languages and paradigms.

This post will focus specifically on one of the simplest, in my opinion, design patterns to understand: The Singleton. We'll go over when you may want to use it, and more importantly when you shouldn't.

## The Basics

Singleton design pattern works by creating a **single** instance of some class or object and providing one global point of access throughout your program. By doing this, you can avoid complications with state across multiple instances or access points. The value becomes especially apparent when dealing with concurrent access of a specific resource. Similarly, let's say you've established a connection to a web client or database. Rather than constantly reconnecting when necessary, you can pass around the original connection throughout your application as necessary. This can reduce latency as it removes the connect and disconnect time from every operation.

## How to Implement Singleton

This part depends a lot on your language. In a strongly typed language, you can create a class for your object, and then implement a private constructor with a public getter method that always returns the same reference to your singleton. Here's what this would look like in C#.

```csharp
public class MySingleton
{
    private MySingleton()
    {
        
    }

    private static readonly MySingleton mySingleton = new MySingleton();

    public static MySingleton GetSingleton()
    {
        return mySingleton;
    }
}
```

This ensures that only one instance of this class will ever exist at one time. It is important to note the use of `static` in this example. We declare the `mySingleton` instance as `static` to avoid race conditions in any asynchronous operations that may try to call this at the same time. In C# when you define a variable as `static` it goes through static initialization, which guarantees thread safety. 

How would we do something like this in a less strongly typed language like JavaScript? It's very much possible, and in fact maybe a bit easier than in strongly typed languages. Considering how JavaScript's global scope works, you can create an instance of your object that exists globally. This way, you can access it anywhere. If you had a Node application and wanted it to be accessible for all of your requests, you can add it as a property to the `req` object and access it in your routes. By creating an object literal there will never be another instance of this "class" anywhere else in your program. Here's what that might look like.

```js
var singleton = {
    prop: "prop",
    func: function(a, b) {
        ...
    }
}
```

And considering the Node example above, here's how you would pass that instance through your request object.

```js
var singleton = {
    prop: "prop",
    func: function(a, b) {
        ...
    }
}

...

app.use(function (req, res, next) {
    req.singleton = singleton;
});
```

## Usage

So when do you want to use the Singleton? That's a heavily debated topic. Some think it should be used as minimally as possible. I think it has its merit, and when programming through design patterns you'll generally write cleaner code so it benefits you in more ways than one. In strongly typed languages you're able to achieve similar functionality out of abstract classes, so it isn't entirely necessary all the time. You can also use dependency injection to achieve a similar effect.

In JavaScript you probably use singletons described above without even realizing it. If you've got a specific object in the global scope that is the only one of its kind, you could consider this use of the singleton pattern. This is certainly less formal than in strongly typed OOP languages, but I think the usability of globally scoped, single instance variables is apparent.

## My Experience

The inspiration for this blog post came out of experience of my own in a *singleton vs. no singleton* decision I made. I was working on a Node.js app that used a SQL database connection. I thought it made sense to avoid constantly reconnecting to the database, so I initialized it like a singleton. I added this to the request object inside all of my routes so it would accessible where necessary. This looked a bit like below.

```js
// app.js
var sql = require('mssql');

var config = {
    user: env.username,
    password: env.password,
    server: "myapp.database.windows.net",
    database: "users",
};

sql.connect(config, function (err) {
    if (err) throw err;
});



var app = express();

app.use(function (req, res, next) {
    req.sql = sql;
});

// routes/index.js
exports.index = function(req, res) {
    var query = "SELECT * FROM Users";

    new req.sql.Request().query(query, function(err, recordset) {
        ...
    });
}
```

At first glance this doesn't look so bad, but I eventually found out this was a big problem. The SQL connection isn't guaranteed to stay alive throughout your app's lifecycle. Unless it's regularly being used and there is a lot of traffic, the connection will close. This meant when I'd visit my application after some inactivity, it would hit a 500 error. 

This is an example of when singleton isn't going to work. Because the connection would close, the app didn't function as expected. Instead, even if the extra connection time affects your application (which it shouldn't), it is better to reconnect as needed. Creating multiple instances of your connection at once is allowable here, if you have any asynchronous operations. SQL Server is built to allow concurrent access so any race conditions are handled for you. The correct answer is to abstract your DB connection into its own module that creates a new connection whenever you intend to query the database. This makes the appropriate implementation look like the following.

```js
// db/index.js
var sql = require("mssql");

var config = {
    user: env.username,
    password: env.password,
    server: "myapp.database.windows.net",
    database: "users",
};

exports.query = function (query, callback, inputs) {
    sql.connect(config, function (err) {
        if (err) throw err;

        var request = new sql.Request();

        request.query(query, function (err, result) {
            if (err) throw err;
            callback(result);
        })
    });
}

//routes/index.js
var db = require('../db');

// GET /
exports.index = function (req, res) {
    var query = "SELECT * FROM Users";

    db.query(query, function (recordset) {
        res.render('index', {
            rows: recordset,
        });
    });
};
```

## Conclusion

It's important to think about the structure of your code. Good architecture inevitably leads to well written, sustainable applications. Design patterns generally are a large part of this process. They represent the solution to a problem many people have faced in the past, and it's advisable you take their advice rather than carving your own path. It's equally as important, though, to know when **not** to use certain design patterns. Sometimes you may want to use them for something that can be achieved very simply. Simply put, don't over engineer your work either.

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*