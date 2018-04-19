# Building your Node Blog

*Learn the ins and outs of creating your Node blog from scratch and hosting on Azure.*

## The Environment

First you need to setup your development environment. If you don't already have Node installed, you can [download it here.](https://nodejs.org/en/download/). Next, I recommend using [VS Code](https://code.visualstudio.com/) as your editor of choice. This is great for both web development and editing your blog posts.

![VS Code](/uploads/vs-code.png)

## The Code

If you're new to Node development, don't worry! I'll cover the basics. First let's make sure you've got Node installed properly. Open up the command line of your choice and try the following.

*Pro-tip: VS Code has a great integrated terminal. You can customize it to use whatever shell you want in the settings. The keyboard shortcut to open it is CTRL+` (backtick)* 

```bash
$ node -v
v6.10.3

$ npm -v
3.10.10
```

If those commands don't work for you, try restarting your CLI. Also, make sure that Node was correctly added to your PATH. 

Now we can get started with setting up a node project. The first thing every project needs is a `package.json`. This specifies what your app name, version, and dependencies are (among other things). For this blog, here's what mine looks like.

```json
{
  "name": "blog",
  "version": "1.0.0",
  "description": "Blog",
  "main": "app.js",
  "license": "MIT",
  "repository": {
    "url": "https://github.com/JamesEarle/Blog"
  },
  "author": {
    "name": "James Earle",
    "email": ""
  },
  "dependencies": {
    "bcrypt-nodejs": "*",
    "body-parser": "1.15.2",
    "client-sessions": "*",
    "express": "3.4.4",
    "jade": "*",
    "markdown-it": "^8.0.0",
    "mssql": "^3.3.0",
    "stylus": "0.54.5"
  },
  "scripts": {
    "start": "node app.js"
  }
}
```

## Dependencies

Let's talk about dependencies for a minute. Node applications are comprised of dependencies on modules that each, in turn have their own dependencies. This can get pretty hairy, but fortunately `npm` handles it for us. To get a list of package dependencies associated with your project, and those packages dependencies, you can use `npm list`. Similarly, if you add dependencies to your `package.json` you can run `npm install` to install them into your `node_modules` directory.

*Pro-tip: Add node_modules to your `.gitignore`. You really don't want those packages kept in your repository.*

## Notable Packages

There are a few packages listed as dependencies that I'd like to highlight.

 - [Express](https://www.npmjs.com/package/express)
    - A web framework for Node that helps in setting up your server.
 - [Jade (Pug)](https://pugjs.org/api/getting-started.html)
    - An HTML template engine. Allows us to write our views in a Python-like syntax with some minor programmability included. Formerly known as Jade, but recently changed their name to Pug. 
 - [markdown-it](https://www.npmjs.com/package/markdown-it)
    - A markdown-to-HTML converter. This is what I use to write blog posts. It allows you to create a document in markdown, push it through the renderer, and receive HTML that can be injected into a web page.

## Getting Started

Now that we have covered the introductory stuff, let's get a node app setup. You'll see in `package.json` it is required to list a main application entry point. I've used `app.js` as mine, but you can use any file you like. So long as it initializes the application correctly.

```js
// app.js

var md = require('markdown-it')();
var body = require('body-parser');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// Allow requests to parse request body info
app.use(express.bodyParser());

// Make necessary parameters visible
app.use(function (req, res, next) {
    req.md = md;
    next();
});

// all environments
app.set('port', process.env.PORT || 443);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

// Our main route
app.get('/', routes.index);

// Finally create our server
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
```

Now try running your app from the CLI. You should see something similar to below.

```bash
$ node app.js
Express server listening on port 443
```

If you go to your browser and navigate to `localhost:443` you'll see an error. This is because we haven't setup our routes yet, but the server is still running correctly.

For organization, I find it easier to keep routes in their own directory. Notice the statement in `app.js` that references a local directory rather than an npm module.

```js
// app.js 

var routes = require('./routes'); 
```

Inside the `routes/` directory there is a file `index.js` that defines and exports all the application routes.

```js
// routes/index.js

exports.index = function (req, res) {
    res.render('index', {
        title: "My Great Application!"
    });
};
```

And you must assign this route to a path like below.

```js
// app.js

app.get('/', routes.index);
```

After this, we just have to create the appropriate view that the response will render. In this case we have named it `index`. All your views should be located inside a `views` directory. This is where your app will look by default for any named view.

```jade
<!--views/layout.jade-->
doctype html
html
  head
    title= title
    link(rel='stylesheet', href='/css/style.css')
    script(src="/js/jquery-1.10.2.min.js")
  body
    block content
```

```jade
<!--views/index.jade-->
extends layout

block content
    h2 Hello World!
```

This is a very simple example of a view created with Jade. You can see that it supports data injection being passed from the server side. This is how you can manipulate your views in the future. I recommend you [read the documentation](https://naltatis.github.io/jade-syntax-docs/) for more, because there are a significant number of ways that you can work with views here.

So now you've got your basic application setup. Your Node server is running, you've created your routes, and you have your views rendering correctly. What we need to do now is learn how to create your blog posts.

## Getting to the Blog

### Markdown

If you're not familiar with markdown syntax, it's an excellent tool for writing well-formatted documents in any environment with minimal work. Read the syntax [documentation here](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).

I like to write my blog posts in VS Code because it has a great split screen editor, as well as live markdown rendering. When put together, the left side of my screen is my editor, and the right side of my screen is a rendered markdown preview. You can enable this by hitting `F1`, typing `Preview` and selecting `Markdown: Open Preview to the Side`. You can also use the keyboard shortcut `CTRL+K V`

![VS Code Markdown Preview](/uploads/vs-code-md-preview.png)

### SQL

You'll need a place to store the markdown so that your Node app can pull it from the database to be rendered client-side by `markdown-it`. I use an Azure SQL Server instance with the `mssql` npm module, like below. You can read more about it [here](https://www.npmjs.com/package/mssql)

```js
// app.js

var sql = require("mssql");

// Setup for Azure SQL Server
var config = {
    user: 'your-username',
    password: 'your-password',
    server: "yourappname.database.windows.net",
    database: "blog",

    // As per the npm docs, encrypt=true for Azure connections
    options: {
        encrypt: true
    }
};

sql.connect(config, function (err) {
    if (err) throw err;
});
```

Make sure to also include the `sql` variable in your `app.use()` statement that we showed above, otherwise it won't be visible to other parts of your app.

```js
// app.js

// Make necessary parameters visible 
app.use(function (req, res, next) {
    req.sql = sql;
    req.md = md;
    next();
});
```

Additionally, you'll want to store your username and password externally from the application. You can set them up as environment variables, or store them in a local node module you import **but be sure to add that module to your `.gitignore`**.

Now you can create the routes that upload data to your database. If you have a web page with some form input data for your markdown to be put into, you can create a POST request and handle it like below.

```jade
<!--views/create.jade-->
extends layout

block content
    .form.create-post
        form(action="/create", method="POST", enctype="multipart/form-data")#create
            .form-group
                label(for="title") Title
                input(type="text", name="title", placeholder="Title").form-control#title
            .form-group
                label(for="markdown") Body Markdown
                textarea(rows="25", name="markdown", placeholder="Markdown here.").form-control#markdown
            button(type="submit").btn.btn-default Submit
```

```js
// app.js
app.post('/create', routes.create); // Note app.post(), not app.get() like earlier.

// routes/index.js
exports.create = function (req, res) {
    // MSSQL module takes care of sanitizing using @<name> in query string
    var query = "INSERT INTO Posts (title, body_markdown) VALUES (@title, @markdown)";

    var request = new req.sql.Request();

    // Register inputs, automatically sanitized by mssql
    request.input('title', req.body.title);
    request.input('markdown', req.body.markdown);

    request.query(query, function (err, recordset) {
        if (err) throw err;
        res.redirect('/');
    });
}
```

### Page Rendering

Now that your application has a way to store markdown, you need to be able to access it on your website and render it as HTML using `markdown-it`.

This process is easy as it's very similar to what we've done already. You need to create a route that is going to request a specific post, passing a post ID as a parameter. Then your DB will fetch that post and return it, calling the markdown library to pass HTML to the view instead.

Here's our route for accessing the markdown.

```js
// app.js 
app.get('/posts/:pid', routes.post); // Note the colon allows us to pass params to routes, in this case post ID.

// routes/index.js
exports.post = function (req, res) {
    var query = "SELECT * FROM Posts P WHERE P.pid=@pid";
    var request = new req.sql.Request();

    // Register inputs, sanitization handled by mssql and @param syntax
    request.input('pid', req.params.pid);

    request.query(query, function (err, recordset) {
        if (err) throw err;

        if (recordset.length == 0) { // Bad ID
            res.render('errors/notfound');
        } else if (recordset.length == 1) { // Found it
            // Save record in variable
            var record = recordset[0];
            
            // Modify the markdown to now be converted HTML
            record.body_html = req.md.render(record.body_markdown);

            // Pass to view
            res.render('posts/post', {
                val: record,
            });
        } else { // Not possible but redundant safety net.
            res.render('errors/servererror');
        }
    });
}
```

And finally, the view for displaying a post. Here we can access the post attributes from the database on the client side using Jade. Note that the `!= ` syntax in Jade tells it to render the variable without escaping the contents. Normally, it would automatically display raw HTML. This way, it is rendered in the DOM.

```jade
<!--posts/post.jade-->
extends layout

block content
    .post-body
        p!= val.body_html 
```

### Tidying Up

So now you've got all the basic ingredients to create your blog using Node. We talked about how to use VS Code for your workflow, setting up a basic Node webapp, connecting to a SQL database, handling data flow using routes and Jade, and finally writing your blogs in markdown. You can now expand on this knowledge to build your very own blog, or any other Node webapp you can imagine!

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*