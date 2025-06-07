import pandas as pd

#getting min and max values to caluclate normal for each entry
df = pd.read_parquet("Databases for CHP/final_database.parquet")
five_year_max = df['Five_Year_Growth'].max()
ten_year_max = df['Ten_Year_Growth'].max()
overall_max = df['Overall_Growth'].max()
density_max = df['density'].max()
five_year_min = df['Five_Year_Growth'].min()
ten_year_min = df['Ten_Year_Growth'].min()
overall_min = df['Overall_Growth'].min()
density_min = df['density'].min()
color_scores = []

for index, row in df.iterrows():
    #normalizing 
    five_year_norm = (row['Five_Year_Growth'] - five_year_min) / (five_year_max - five_year_min)
    ten_year_norm = (row['Ten_Year_Growth'] - ten_year_min) / (ten_year_max - ten_year_min)
    overall_norm = (row['Overall_Growth'] - overall_min) / (overall_max - overall_min)
    density_norm = (row['density'] - density_min) / (density_max - density_min)
    #calculating shade with chosen weights
    color = 0.6 * five_year_norm + 0.3 * ten_year_norm + 0.1 * overall_norm
    color_scores.append(color)

df['color_score'] = color_scores
df.to_parquet('Databases for CHP/final_database.parquet', index=False)
df.to_json('city_data.json', orient='records')
