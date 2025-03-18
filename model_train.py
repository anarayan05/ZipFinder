from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
import pickle
import random

#the plan is to use this model to make predictions of the zip code based on data
#ultimately we can interpret the users sentences/prompts

#TASKS:
#Find a way to do reinforcement learning
#in order to see if the results are accurate
#right now it is just training with no telling output
#seperate lower and higher income zip codes
#in order to see how well it was predicted
#start with like 3 zips like gpt suggested

#Step 1: train the model
#Step 2: test the model sample data
#Step 3: create json objects from the data
#Step 4: test with the objects
#Step 5: move onto using prompts
#train model to find data in the prompts

def generate_Xdata(num_samples):
    data = []
    
    for _ in range(num_samples):
        income = random.randint(35000, 100000)
        
        #generating home value with assumed correlation (3-5x larger) with income, FOR NOW MY GOD PLEASE DONT FORGET
        home_value = random.randint(int(income * 3), int(income * 5))
        
        crime_rate = round(random.uniform(2.0, 5.0), 1)

        density = random.randint(5000, 35000)
        
        data.append([income, home_value, density, crime_rate])
    
    return data

n = 100

y = [str(random.randint(10000, 99999)) for _ in range(n)]


with open('knn_model.pkl', 'rb') as f:
    model = pickle.load(f)
#train
model.fit(generate_Xdata(n), y)

#save
with open('knn_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model retrained and saved successfully")