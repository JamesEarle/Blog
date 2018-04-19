# JavaScript Stuff &#35;1

*This is part one of a series I'm doing with shorter posts that focus on interesting JavaScript idiosyncrasies*

## Immediately-Invoked Function Expressions

This topic came out of me having to perform multiple `ajax` calls back to back in a Google Chrome extension I wrote a while back. It's called [GitHub Task List](https://chrome.google.com/webstore/detail/github-task-list/bhajciggpdkcmcimnjbaafgmdppmagnb) and makes an effort to improve the formatting of GitHub issues in list form for large projects.

Consider the code below.

```js
for(var i = 0; i < list.length; i++) {
    $.ajax({
        url: elem.href,
        type: 'GET',
        success: function(data) {
            console.log(i);
            // ...
            // Do some other stuff dependent on i
            // ...
        }
    });
}
```

What do you think the output of this code might be? Most might think it would print each value of `i`. If `list.length` was `3` you'd expect the first output below, when in reality you'd get the second.

```js
// Expected
> 0
> 1
> 2

// Reality.
> 3
> 3
> 3
```

Naturally you can see why this might cause some problems. Imagine you have to modify the DOM and that requires accessing elements in a list or array. Instead of iterating the array, each iteration is going to go out of bounds.

The reason this happens has to do with how JavaScript handles multiple asynchronous method calls. They're placed in the call stack, but not called until after the calling thread completes. The scope is maintained, but any variables will exist as they did when they loop terminated.

## The Solution

To resolve this problem, we use Immediately-Invoked Function Expressions (IIFEs). To understand how they work, let's take a look at normal functions in JavaScript. 

You can name a function, or create anonymous functions and store a reference to them in a variable. In both cases they can be called the same way.

```js
// Named
function foo() {
    // ...
}

// Anonymous
var bar = function() { 
    // ... 
}

// Calling is the same for both
foo();
bar();
``` 

Consider the syntax above, specifically for calling methods. You call a method by referencing the function and placing `()` after it. This means you should be able to create anonymous function objects, and call them by placing `()` afterwards, even if they're not stored in a variable. But how can you do this? The code below might be your first thought.

```js
function foo() { 
    console.log("abc"); 
}(); // Syntax error
```

But the JavaScript parser won't accept this as valid syntax. It expects a function declaration, rather than a function expression. You can resolve this using an extra set of parantheses around the function expression. Statements and declarations can't be placed inside parentheses in JavaScript, so this removes the ambiguity to the parser.

```js
(function() {
    console.log("abc");
})(); // Prints "abc"
```

If you're already using an expression, you actually don't even need to add the additional parentheses. This is because there's no ambiguity to the parser as to the context of the `function` keyword.

```js
var foo = function() {
    console.log("abc")
}(); // Prints "abc"
```

So how does this apply to the asynchronous problem? Because this syntax causes anonymous functions to execute immediately, they're required if you want to make multiple, back to back asynchronous calls. So to fix the above code, all we have to do is make the following change. Now we get the expected output.

```js
for(var i = 0; i < list.length; i++) {
    (function() {
        $.ajax({
            url: elem.href,
            type: 'GET',
            success: function(data) {
                console.log(i);
                // ...
                // Do some other stuff dependent on i
                // ...
            }
        });
    })();
}

// Output
> 0
> 1
> 2
```

## Conclusion

Thanks for reading! Hopefully you learned a little bit more about JavaScript, asynchronous method calls, and anonymous functions.

---

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*

