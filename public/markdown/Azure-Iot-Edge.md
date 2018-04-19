# Introduction to Azure IoT Edge

*Discover how Azure can bring your IoT projects to the cloud*

## Introduction

Azure IoT Edge gives you the ability to use Azure services in your IoT projects. You can create a gateway that reads and filters data you take from a physical (or simulated) device and then process it locally and send it to Azure for further processing and analytics, as well as storage. This communication is bidirectional, as you can also use Azure Event Hubs to publish Cloud to Device (C2D) messages as well.

This structure is particularly useful if you have a device or group of devices that can't connect to the internet. A perfect example is the [Texas Instruments CC2650STK Bluetooth Sensor Tag](https://www.digikey.com/product-detail/en/CC2650STK/296-38831-ND/5130740?WT.mc_id=IQ_7595_G_pla5130740&wt.srch=1&wt.medium=cpc&WT.srch=1&gclid=Cj0KCQjwwqXMBRCDARIsAD-AQ2jLjIUyWO9rlieOmAmxOYK7Ne2y_HLVzkcz2DGfpCV70VCkILvsYVAaAgD0EALw_wcB). Here you can use a Raspberry Pi as your gateway to read data from the device and process it in the cloud.

## How It Works

A gateway hosted on your device is comprised of two separate pieces, modules and a broker. Each module performs a single task, usually receiving some input and giving some output. All output from any modules are given to the broker who distributes output to other modules based on your specification. You can think of the broker as something very similar to a system bus.

Let's say you have 3 modules that talk to each other. Module A generates some sensor data that gets sent to Modules B and C. Module B performs some arithmetic on that data while Module C is responsible for printing the raw values. Once Module B is done, it also sends the modified data to Module C. If this data fits a criteria it is sent to the cloud, otherwise a message is sent back to B.

The scenario I've given above is something you could expect out of a moderate IoT project. Say you have a device with some sensor data based on temperature and humidity. You want to be notified when these values are in a certain range, but also the device doesn't read in Celcius. Module A above would be responsible for reading the raw data from the device, while Module B converts to Celcius, and Module C filters the data based on your criteria and sends to an Azure IoT Hub instance you've created if it needs to.

This would look like the diagram below.

![Sample Edge Gateway Diagram](/uploads/5-gateway-diagram.PNG)

The best part about this is that it can be configured any way you want. There are a number of modules provided for you by the gateway (shown below). You can also create your own using .NET, Java, Node.js, or Python. 

>| Name             | Description                                                             |
>|------------------|-------------------------------------------------------------------------|
>| ble              | Represents a Bluetooth low energy (BLE) device connected to the gateway |
>| hello_world      | Sends a "hello world" message periodically                              |
>| identitymap      | Maps MAC addresses to IoT Hub device IDs/keys                           |
>| iothub           | Sends/receives messages to/from mapped devices and IoT Hub              |
>| logger           | Writes received message content to a file                               |
>| simulated_device | Simulates a gateway-connected BLE device                                | 
>| azure_functions  | Sends message content to an Azure Function                              | 

## Try It Yourself

There is a **ton** of great documentation and samples available for this technology. Check out [docs.microsoft.com](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-iot-edge-overview) to get started with physical and simulated devices. There are walk throughs of all the sample projects that are available on the [iot-edge GitHub repository](https://github.com/azure/iot-edge)

## Conclusion

This post was meant to be a high level introduction to Azure IoT Edge. We talked about what it is and how it works. Due to the excess of great documentation and samples available it feels redundant to provide my own, so I'd rather leave you in the hands of the product team from this point. 

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*