from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
import pandas as pd
import pickle
import random

# The plan is to use this model to predict real estate trends and make investment recommendations:
# Focus on features like density, historical home values, and growth trends
# Ultimately, users can input criteria (price range, area, etc.) to get recommendations for potential investments


#Step 1: train the model using real data
#Step 2: test the model
#Step 3: move onto using prompts

df = pd.read_parquet('Databases for CHP/final_database.parquet')
five_year_growth = df['Five_Year_Growth']
ten_year_growth = df['Ten_Year_Growth']
overall_growth = df['Overall_Growth']
standard_score = df['color_score']