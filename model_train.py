from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
import pickle
import random

#Since zip codes are not mathematically associated with the other factors, 
#create a score based on the factors and use the zip as an identifier

#the plan is to use this model to make predictions of the zip code based on data:
#density, home value
#ultimately we can interpret the users sentences/prompts

#TASKS:
#You're going to scratch all this code
#process data until you have everything
#then move onto training HERE

#Step 1: train the model using real data
#Step 2: test the model
#Step 3: move onto using prompts