import pandas as pd

#for processing and combining data by zip code

#combining the data (just writing)
#still need to organize ZHVI and add more data

desnity_data = pd.read_csv('Population-Density-Final.csv')

home_value_data = pd.read_csv('ZHVI_home_values.csv')

merged_data = pd.merge(desnity_data, home_value_data, on='Zip', how='inner')

#...more merges

merged_data.to_csv('combined_data.csv', index = False)