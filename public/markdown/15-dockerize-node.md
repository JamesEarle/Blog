# Dockerize Your Node.js Web App

*Learn how to use Docker to create a container for your Node.js web app*

## Introduction

A wise engineer once told me to treat your production machines like cattle, rather than pets. The philosophy behind this is pretty easy to understand when you think about your personal computer versus your deployment servers. Most developers care quite a bit about the computer they use every day. If they had to switch it out for a new one it would be a bit of an ordeal. It's almost like we are emotionally attached. I built my own desktop a few years ago and would definitely not want to change it for an entirely new machine. Production machines are different. The idea behind treating your machines like cattle is that you avoid the emotional sentiment I just described. Your servers are made to do something, and if one malfunctions you shouldn't have any issues trading one for another. This is the same relationship a farmer has to his livestock. They are meant to perform a function for you, and can be replaced when they stop performing. Docker is what facilitates easily managing your servers through container services. Containers require fewer resources than VMs and can be easily transitioned between servers as you need. 

## Understanding Containers

A container is a wrapper around your software that can be shipped and deployed into any system that supports it. A server hosts the container, but the container takes care of the gritty details about running your software. You can imagine real shipping containers in this scenario.

![Single Container](/uploads/15-single-container.jpg)

We know the container has certain dimensions that let us use it, but we don't care about what's inside. This container can fit into receiving bays, on the back of an 18-wheeler, or among hundreds of others on a large carrier in the ocean. Again, nobody cares about what's inside as long as the container is a standard size.

![Many Containers](/uploads/15-multiple-containers.jpg)

## Getting Started

So you have a Node.js web app you want to deploy using Docker. You can create an image that you will place into a container easily by adding a `dockerfile`. You'll also want to add a `.dockerignore` for ignoring things like `node_modules` and `npm-debug.log`. Put both of these files into the root of your application.

```dockerfile
# dockerfile
FROM node:carbon

# Create container working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY ./app /usr/src/app/

# Expose your port and start your application
EXPOSE 8080
CMD ["npm", "start"]
```

To create an image we need to run `docker build`, which will run each step in the `dockerfile`. For cleanliness, I like to have my entire application in a single directory, with my Docker files at the same directory level like below.

```bash
ls -al
total 22
drwxr-xr-x 1 jaearle 1049089   0 Dec 14 12:55 ./
drwxr-xr-x 1 jaearle 1049089   0 Dec 13 16:24 ../
-rw-r--r-- 1 jaearle 1049089  27 Dec 14 12:55 .dockerignore
drwxr-xr-x 1 jaearle 1049089   0 Dec 14 12:55 myapp/
-rw-r--r-- 1 jaearle 1049089 448 Dec 14 12:57 Dockerfile

docker build ./ -t myapp 
```

The `-t` argument is used to tag your image with a name you can use to reference it later. As the command goes through each step in your `dockerfile` you will see the output progress. A success message is shown when it's done, and then you can experiment with your image locally before deploying it. You can check it out by running `docker images`.

```bash
docker images

REPOSITORY                                    TAG                 IMAGE ID            CREATED             SIZE
myapp                                         latest              da6142b4ef25        2 minutes ago       67.4MB
```

Next try running your image in a local container.

```bash
docker run -d -p 8080:80 myapp
```

This will create a container and run your image against the port you exposed. You can now go to `localhost:8080` and see the local version of your app running from a container! If you're having trouble accessing it, try using `docker ps -l` to list all containers. Here you can check their status to see if they're running or if they exited in an error. If there was an exit or crash you can inspect the container logs by using `docker logs` with the container ID.

```bash
docker ps -l
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS                            NAMES
54546e74256f        myapp               "npm start"         24 minutes ago      Up 24 minutes       8080/tcp, 0.0.0.0:8080->80/tcp   suspicious_golick

docker logs 54546e74256f
> app@0.0.0 start /usr/src/app
> node app.js
```

## Conclusion

Now that you've got your app Dockerized the next step is to deploy it to a cloud registry, and then publish to a web server with a provider of your choosing. Azure has great CLI tools that can get you deployed in just a few commands, you can read more about them [here](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-tutorial-deploy-app).

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*