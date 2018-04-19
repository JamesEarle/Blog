# How to use TypeScript with Electron

*In this post we're going to go over how to make use of TypeScript in an Electron desktop application.*

## Introduction

TypeScript is a typed, object-oriented superset of JavaScript. This means that all valid JavaScript is valid TypeScript, however TypeScript can provide compile time conveniences like type and error checking. TypeScript is open source, and [Visual Studio Code](https://code.visualstudio.com/) is an example of a large app written in TypeScript.

Electron is a framework that allows the development of desktop applications in Windows, macOS, and Linux environments using Node.js and Chromium. This means building native GUI applications using web technologies like JavaScript, HTML, and CSS.

Considering the object-oriented advantages you get using TypeScript, it makes sense why you might want to combine this with Electron. Most modern desktop apps are written using some object-oriented language like `C#`, `C++`, or `Java`, so getting access to stronger typing and object-orientation while still getting to use JavaScript is a definite plus for many.

## Understanding the Process

Electron applications run on two separate processes. These are the main process, and the renderer process. The main process can be used to create web pages in your application, while the renderer is responsible for, *well*, rendering these pages. You're able to pass information between these processes. We'll go over a simple example of setting up a TypeScript and Electron application below, including how to pass data between the processes. If you want to read more about this, check out [the Electron documentation on GitHub](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md)

## Creating Your App

There are a few things we need to setup before we can get coding, mostly for configuration. One thing you always should do for any Node.js project is **put node_modules/ in your `.gitignore`**. If you don't have your project in a git repository then don't worry about this.

First let's make a directory to hold our project and initialize it. When you run `npm init` you'll receive a few prompts. You can put in your own values, or just press enter if you're not sure what to put for any given value. This creates your projects `package.json`

```bash
$ mkdir TS-Electron-App
$ cd Ts-Electron-App
$ npm init
$ npm install -g --save-dev electron 
$ npm install -g --save-dev typings
```

Here's what my `project.json` looks like after the above. Note that `devDependencies` won't be present without the last two commands. Using `--save-dev` will automatically place dependencies into your `package.json` for convenience, but you can also do this manually. All we're doing here is adding the electron environment as a dependency, and the typings module. We use this to manage any type definitions used in the project. For more check out the [Typings documentation](https://www.npmjs.com/package/typings)

```json
{
  "name": "ts-electron-demo",
  "version": "1.0.0",
  "description": "Sample application using TypeScript and Electron",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "James Earle",
  "license": "ISC",
  "devDependencies": {
    "electron": "^1.6.11",
    "typings": "^2.1.1"
  }
}
```

Now that you've installed typings, we can use it to create your project's `typings.json`, which holds the used type definitions. To use typings, you can search for a type definition like below.

```bash
$ typings search core-js
```

This will show you the name, source, version, and when the definition was last updated. You may get more than one option, but that's okay. Just pick the one you want and install it using the command below.

```bash
$ typings install dt~core-js
```

I also did this for the `electron` and `node` definition files. This is what my `typings.json` file looks like after. 

```json
{
  "globalDependencies": {
    "core-js": "registry:dt/core-js#0.9.0+20170324193834",
    "electron": "registry:dt/electron#1.4.8+20170316233216",
    "node": "registry:dt/node#7.0.0+20170322231424"
  }
}
```

The last step of configuration is the `tsconfig.json`. This file is used to setup compiler options for your environment and how you want TypeScript to behave. For example, you can ensure that you never define a function with unused parameters, and never allow for implicit `any` types. This creates an interesting gradient for how strongly typed you want your code to be.

To create the `tsconfig.json` just run

```bash
$ tsc --init
```

This will setup the minimum config, and conveniently add many of the optional parameters you can include too. These will be commented out by default, you can enable them as you see fit. I've removed the commented options in my `tsconfig.json` below for brevity.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",       
    "strict": true
  }
}
``` 

## The Code

Now that we've set up everything we can (finally) get to developing the actual application. Before we get into any real TypeScript, let's just make sure we can execute the barebones application from the command line.

First create an `index.html` and `index.ts` file. Note that when I ran `npm init` I specified that `index.js`, so it will point to the compiled JavaScript version of our index as the app entry point.

```javascript
// index.ts
import {app, BrowserWindow} from 'electron';

declare var __dirname, process;
 
let win;
 
let createWindow = () => {
    win = new BrowserWindow({
        width:450, 
        height: 450
    });
    win.loadURL(`file://${__dirname}/index.html`);
    win.on("closed", () => {
        win = null;
    });
}

app.on("ready", createWindow);
```

```html
<!DOCTYPE html>
<html>
<head>
    <title>Getting to know Electron with TypeScript.</title>
</head>
<body>
    <h2>TypeScript is fun!</h2>
</body>
</html>
```

Now you can compile the TypeScript file using 

```bash
$ tsc index.ts
```

which will create `index.js`. If you've done everything right, you should see something similar to the below popup when you run Electron.

```bash
$ electron .
```

![A simple Electron GUI](/uploads/4-basic-gui.PNG)

## Some TypeScript

Now that a basic project is setup, let's see how we can take advantage of some TypeScript features. We'll explore a few object-oriented principles as well as passing data from the main process to the renderer process.

Imagine you run a veterinary clinic. You want to create data models for the pets that may come through in need of care. Each pet has some distinct properties, but many also share common features. This is where an interface comes in handy. All pets have a name, age, and most have a way of speaking. We can use this to create a simple interface called `Animal` that we'll use to develop our application.

```javascript
// animal.ts
export interface Animal {
    age: number;
    name: string;
    speak(): any;
}
```

What we've defined acts as a skeleton for any `Animal` classes we'd like to implement in our app. Let's add some concrete implementations of this interface using a dog and cat.

```javascript
// dog.ts
import {Animal} from './animal';

export class Dog implements Animal {
    
    age: number;
    name: string;

    constructor(age: number, name: string) {
        this.age = age;
        this.name = name;
    }

    speak() {
        return "Woof!";
    }
}

// cat.ts
import {Animal} from './animal';

export class Cat implements Animal {
    age: number;
    name: string;
    
    constructor(age: number, name: string) {
        this.age = age;
        this.name = name;
    }

    speak() {
        return "Meow!"
    }
}
```

Now we have some class definitions of `Cat` and `Dog`. We also have a constructor so we can create many new instances if necessary. 

Anywhere that runs code in the main process can access these files with an `import` statement. Just make sure the module is compiled (e.g. `tsc cat.ts`) 

*Note: you don't need to compile parent interfaces or classes in TypeScript. By defining a class as implementing or inheriting from another, the dependency is recognized and it will be compiled automatically.*

```javascript
// Related classes can be put in a single module (e.g. CatDog) to minimize imports, but we haven't done that here.
import {Cat} from './cat'
import {Dog} from './dog'

let jack = new Cat(6, 'Jack');
let snoopy = new Dog(10, 'Snoopy');

console.log(jack.speak()); // Meow!
console.log(snoopy.speak()); // Woof!
```

Because we're using TypeScript and not regular old JavaScript if you were to provide the parameters to the Cat or Dog constructors in any other order, or perhaps using a different type ('6' instead of 6) you would receive a compiler error. When you receive a compiler error, TypeScript still processes the rest of the file and generates JavaScript for you. This is useful because sometimes you know you're breaking the rules a bit but need to for what you are doing, so you'll still get JavaScript output. Of course this isn't ideal though. The TypeScript compiler cares about you! Listen to the compiler!

## Pass Data to the Renderer

Now we want to know how we can access these from the renderer. We can't use the same `import` statements that we use in the main process. Instead, we can use `require()`. If you have a rendered page that you want to make use of some TypeScript class, you can create an instance by requiring that module in `<script></script>` tags.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Getting to know Electron with TypeScript.</title>
</head>
<body>
    <h2>TypeScript is fun!</h2>

    <p id="dog"></p>
    <p id="cat"></p>
    <script>
        // Option 1
        var dog = require('./dog').Dog.prototype;
        document.getElementById('dog').textContent = dog.speak();

        // Option 2
        var x = require('./cat');
        cat = new x.Cat(6, 'Jack');
        document.getElementById('cat').textContent = cat.speak();
    </script>
</body>
</html>
```

 ### Option 1

 This option shown above does **not** call the `Dog` class constructor. As a result, any state you might require in your classes won't have been initialized. You're still able to use functions and access class properties, but it's likely you'll hit some issues if you require more stateful objects in your application.

 ### Option 2

 Contrary to the prior option, you can access an object's constructor. This will resolve the issues mentioned above regarding state.

 Both of these techniques have the issue of creating a lot of inline JavaScript being rendered in your HTML files. This isn't very pretty, so instead we can use *secret hidden option 3.*

 ### Option 3

 A much cleaner solution, you can put all the JavaScript you want in a separate TypeScript file and just use a single `require()` statement in your HTML, like below.

 ```html
<!DOCTYPE html>
<html>
<head>
    <title>Getting to know Electron with TypeScript.</title>
</head>
<body>
    <h2>TypeScript is fun!</h2>

    <p id="bird"></p>
    <script>
        // Option 3, if you don't like inline
        require('./bird');
    </script>
</body>
</html>
 ```

 Now in your `bird.ts` file you can include your class definitions **and** the code you'd like to be run in your renderer.

 ```javascript
// bird.ts
import {Animal} from './animal';

export class Bird implements Animal {
    age: number;
    name: string;

    constructor(age: number, name: string) {
        this.age = age;
        this.name = name;
    }

    speak() {
        return "Chirp chirp!"
    }
}

// This code will be run in the renderer if we use require('./bird);
let parrot = new Bird(6, "The Pirate");

// Safety checks aren't required, but you'll get compiler errors without them.
let elem = document.getElementById('bird');

if(elem) {
    elem.textContent = parrot.speak();
}

// Compiler Error
document.getElementById('bird').textContent = parrot.speak();
 ```

Note that when you're operating on DOM elements the TypeScript compiler is going to get mad at you if you don't operate safely. I've shown two examples of accessing an element from the DOM above, but one doesn't operate on the selected element until we've verified it exists. If you try to do this, the TypeScript compiler will tell you `Object is possibly null`. Another friendly feature you gain from using a compiled JavaScript superset.

Now in your HTML you can just do the following. This will keep your code cleaner, while still allowing you to access any TypeScript classes you've defined.

```html
<script>
    require('./bird');
</script>
```

When all is said and done, you'll get something like this!

![Finished Sample App](/uploads/4-finished.png)

## Conclusion

I hope you found this post useful. It was a bit longer, but we went over a few larger concepts and applied them. TypeScript is a fantastic tool for both web and desktop development, but I haven't seen many other blogs on using it with Electron in this way. I hope this cleared up some things for you.

Happy coding!

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*