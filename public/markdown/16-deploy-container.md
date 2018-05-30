# Deploying an Azure Container Instance

*Going over the steps to get your Docker container deployed to Azure*

## Introduction

In my [last post](http://jamesirl.com/posts/docker-node-app) I highlighted the steps you can take to use Docker as a deployment method for your web app. I went over how to create your custom image, but only pointed to the Microsoft documentation to explain how to actually deploy to Azure. Now the documentation is good, but there are some smaller details missing that may cause hiccups for you. I decided to provide additional information for you here to help you get your site live in no time!

## Create Azure Container Registry

After following the steps in the previous blog post you should have a Docker container for your app that runs locally. The next step is to deploy it to an Azure Container Registry. You can do this in the [Azure Portal](portal.azure.com) or through the CLI. I'll go over the CLI instructions in this blog post, but if you prefer the Azure Portal you just simply select "New Resource > Azure Container Registry" and follow the on-screen instructions.

First you must login to the Azure CLI. Do this using 

```powershell
az login
```

Next we will be creating some resources. Naturally, these should fall into a resource group. If you already have one you can skip this and go straight into making your container registry. Once your container registry is created you'll need to login to that as well. This is sometimes automatic as you're already authenticated for the Azure CLI. 

**Note**: *Your container registry name will be used as a domain, and must be unique in your region, so get creative!*

```powershell
# Optional if you already have a resource group
az group create -n MyGroup --location westus

# Use a unique name for your registry, not MyACR or similar
az acr create -g MyGroup -n MyACR --sku Basic --admin-enabled true

az acr login -n MyACR
```

## Push Container To Registry

The next step is to tag and push your local Docker container your registry on Azure. To tell Docker where you want push your container you will need to get the domain for your registry. 

```powershell
az acr show -n MyACR --query loginServer
"myacr.azurecr.io"
```

Once you have this, you can use it to tag your image locally, and then push to your registry.

```powershell
docker tag imageName myacr.azurecr.io/imageName:v1

docker push myacr.azurecr.io/imageName:v1
```

This can take a few minutes depending on the size of your image. Once the command has completed, confirm the presence of of your image in Azure.

```powershell
az acr repository list -n MyACR -o table
```

## Deploy Container

To deploy an Azure Container Instance using the image you just uploaded to your registry, you'll need access to the registry domain name that we used in the previous section, as well as the registry password. You can get this in the portal or through the following command.

```powershell
az acr credential show -n MyACR --query "passwords[0].value"
```

Now you can use the `az container create` command to create your container. This one gets a bit long so I'll break it down piece by piece.

 - **--resource-group**: The resource group your container will exist in.
 - **--name**:  The name of your container
 - **--image**: The URI to the image your container will be created with
 - **--cpu**:   The number of CPU cores your container will use.
 - **--memory**: How many gigabytes of memory to allocate your container.
 - **--registry-username**: Username for the container to authenticate against your registry
 - **--registry-passworrd**: Password for the container to authenticate against your registry
 - **--dns-name-label**: A unique label to use as the domain for your container
 - **--ports**: The ports your app will expose.

**Note**: *Your exposed ports must match what ports your application code exposes. If you have a Node.js express app and expose 443, this must be set to 443.*

Now that you've deployed your application in an Azure Container Instance you can visit it via a public domain or IP address. The domain is formatted as `<dnslabel>.<location>.azurecontainer.io:<port>`. You can get your containers public IP address and domain name using the following command.

```powershell
az container show -g MyGroup -n MyDNSLabel --query ipAddress.fqdn
mydnslabel.westus.azurecontainer.io
# OR
az container show -g MyGroup -n MyDNSLabel --query ipAddress.ip
13.92.155.10
```

Try visiting your app in a browser. If something doesn't work right, you can checkout the container logs in Azure using `az container logs -g MyGroup -n MyDNSLabel`. If you think it might be something to do with your app source code, you can make changes, run locally, and then inspect the docker logs using `docker logs <container ID`

e.g.

```powershell 
docker ps
CONTAINER ID        IMAGE       ...
76c88dc631dd        docknode    ...

docker logs 76c
> dockerizenode@0.0.0 start /usr/src/app
> node ./bin/www
```

I hope you've found this a helpful resource and that you manage to get your app up and running using containers on Azure!

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*