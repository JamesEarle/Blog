# Predict the Future Using Azure Machine Learning

*Learn how to create a stock price prediction model using AzureML and the AlphaVantage API*

## Introduction

The Microsoft Azure Machine Learning Studio hosts a variety of services that allow you to build predictive models, classification programs, and more. Microsoft's research team put together prebuilt machine learning models you can include in your project so you don't 
have to worry about the code. This instead allows you to focus heavily on your data and methods to focus on getting meaningful results from your project. There are also a *ton* of samples that you can reference to get familiar with the tool.

Below shows what a project might look like. It's all drag and drop, controlling where you data flows and how it is manipulated. In this particular example you can see that we are comparing the quality of two separate machine learning algorithms. On the left side we're using a Two-Class Boosted Decision Tree, and on the right a Two-Class Support Vector Machine. These are two types of machine learning algorithms that tackle classification problems. We start with a single data source that we split into two groups, one for each model. Then it is split again, one group for training and one for evaluation.

![Sample AzureML Experiment](/uploads/8-azure-home.jpg)

This is the basics of how machine learning works, generally. Your model needs to be trained using appropriate data for whatever the problem you're tackling is. After this you can use your model in a predictive fashion, where you introduce new data and try to generate meaningful results. 

## Regression Problems

Regression models are extremely common in machine learning. They exist in many forms, but are a simpler form of machine learning. If you're new to the subject matter, this may be a good place to start. There exist many algorithms that are designed to tackle regression problems, and are primarily used to forecast values based on a given function. We don't need to dive too heavily into the math, but you're essentially trying to find an independent variable's value using related dependent variables. If you are using a linear regression, your function will look something like `Y = B_0 + B_1*X_1 ... B_n*X_n` where `n` is the number of dependent variables, `Y` is your independent variable, and and `X_i` is the `ith` dependent variable.

In general, in machine learning there is some evaluation technique or heuristic that allows you to score your solution, or rank multiple solutions against each other. This is intended to improve your model over multiple iterations in many cases. In regression problems a very common metric is to use [least squares](https://en.wikipedia.org/wiki/Least_squares) as a measure of fitness. The way this works is by minimizing the sum of all residuals across your data. A residual is the absolute value between your actual data, and your fitted data. This is shown below.

![Least Squares](/uploads/8-least-squares.png)

## Register in AzureML Studio

Before we get started, be sure to register for the [Azure Machine Learning Studio](https://studio.azureml.net/) tool. If you already have an Azure subscription, great! If not, you can follow along with this post in the free version.

![Sign Up for AzureML](/uploads/8-azureml-signup.png)

## Implementing a Model

Now that we've gone over the basics of regression problems, let's apply what we've learned. We know we can use regressions as a forecasting tool that generates a line or curve to fit our training data. Once we've trained our regression, it can be extrapolated into the future where the results are unknown and make informed estimates.

Let's consider forecasting a particular stock's daily close price. First, we need to get some data. You can use the free [Alpha Vantage API](https://www.alphavantage.co/) to download daily data as a CSV. This will include open, high, low, close, and volume traded for the last quarter. For this example, we will pick Microsoft's stock symbol MSFT as our dataset.

Once you have your dataset, upload it into AzureML Studio. You can do this by opening the left hand column and going to "Datasets", then selecting the "New" button in the bottom left. Here you'll provide the file as well as some relevant information. If you're getting your data from Alpha Vantage like I did, be sure to select **Generic CSV File with a header** for your dataset type.

![Upload Your Dataset](/uploads/8-upload-data.png)

Now that your data is uploaded, we can start building your model. In the left hand column, open up the "Experiments" tab that looks like a beaker. Select blank experiment and we'll start by simply bringing in your dataset and selecting some columns.

First, go to "Saved Datasets > My Datasets" and make sure the file you uploaded is there. If so, drag and drop it into the center pane. Next search for "select columns" in the search bar. You should see "Select Columns in Dataset" as one option. Drag and drop this below your dataset. Now connect the two using the small dot in the center bottom of your dataset, and open the column selector located in the right information panel. From here, select everything *except* timestamp, and press the right arrow to bring them into the "Selected Columns" box.

![Selecting Columns](/uploads/8-select-columns.png)

Now let's actually create your model and feed some data into it. We're going to add three more pieces to our experiment here.
 - **Split Data** - Used to randomly divide your data. We will split it 80/20 for training and verification, respectively.
 - **Tune Model Hyperparameters** - Automatically tries to fine tune the parameters for your untrained ML model for the best performance. e.g. A Neural Network's chosen activator function.
 - **Linear Regression** - This is our model, untrained and ready to receive data.

Make sure you select "Split Data" and change the "Fraction of rows in the first output data set" to be `0.8`. Similarly, select "Tune Model Hyperparameters" and open the column selector. Here we are telling it which column is our independent variable, what we are trying to predict. Select "close" and you should have something similar to below.

![Adding Your Regression](/uploads/8-add-regression.png)

The next steps are to score our results and view our output columns. We're also going to add a module that evaluates the model itself. This can help you refine your model to be sure your parameters are well tuned, and that you are using an appropriate algorithm for the problem you're trying to solve. So the new modules we'll add are the following.

 - **Score Model**
 - **Evaluate Model** 
 - **Select Columns in Dataset** 

We're going to open the "close" and "Scored Labels" columns to compare our actual vs. forecasted results. By now, your project should look like below.

![Finished Model](/uploads/8-finished-model.png)

Now your model is complete. You can press the play button in the bottom center panel to run the program. You can watch the progress by following the green checkmarks that appear when each module is finished. This can sometimes take a few minutes. You then are able to view your results by right clicking the "Select Columns in Dataset" module and choosing "Results Dataset > Visualize". 

When viewing your results, what you are looking at is how your trained model responded to new, unknown data. This is the 20% we set aside earlier. We used the rest to teach it what to expect from our data, and now we've presented it with new information that it can forecast in an educated way. In the left hand column of your results, under "close" you see the actual data and in the right hand column "Scored Labels" you see the forecasted data based on your trained model. It's pretty close!

![Results](/uploads/8-results.png)

## Conclusion

That's it! It's pretty easy to get started with machine learning using AzureML because so much work is done for you. This really enables you to focus on your methods rather than developing an algorithm that works right. 

You can expand on what you've done with this example quite easily. You can consider adding more data to create a more robust, diverse model that can forecast more than just MSFT stock. You can add a new algorithm and compare them, similar to the first example shown in this post. Perhaps a linear regression isn't the best when you know stocks are very volatile. Maybe a Neural Network Regression, or a Bayesian Linear Regression would be better? You have the freedom to experiment with this as much as you like.

You can also publish this experiment as a predictive web service to continue forecasting new data. The official docs show you how to consume this web service using C#, Python, and R, but I used JavaScript for my implementation. You can check out the complete project on my [GitHub here](https://github.com/JamesEarle/AzureML-Stock-Regression). This takes the most recent day's data from Alpha Vantage and tries to forecast it using a model like what we went through today.

Hopefully you've found this post valuable. Machine learning is a complex topic, but experimenting and learning is what it's all about. Go enjoy it, and try something new!.

--- 

*Have a suggestion or feedback for this post? [Tweet at me!](https://twitter.com/ItsJamesIRL)*