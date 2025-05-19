import pandas as pd
import duckdb

#for processing and combining data by zip code

#TASKS: 
#map initial dots on map based on data (areas that have been hot)

#combining the data (just writing)

def calculate_growth_rate(df, start_year, end_year):
    growth_rate = []
    for _, row in df.iterrows():
        home_value_end = row.iloc[end_year]
        home_value_start = row.iloc[start_year]
        growth = (home_value_end - home_value_start) / home_value_start
        growth_rate.append(growth)
    return growth_rate


density_data = pd.read_csv('Databases for CHP/Population-Density-Final.csv', dtype = {'Zip': str}) #stored as DF

density_data = density_data[['Zip', 'population', 'density', 'City', 'lat', 'long']]

home_value_data = pd.read_csv('Databases for CHP/ZHVI_home_values.csv', dtype = {'Zip': str})

zips = home_value_data.iloc[:, 2]

hv_by_year = home_value_data.iloc[:, 9:]

last_10_years = calculate_growth_rate(hv_by_year, hv_by_year.shape[1] - 120, hv_by_year.shape[1] - 1)
last_5_years = calculate_growth_rate(hv_by_year, hv_by_year.shape[1] - 61, hv_by_year.shape[1] - 1)
overall_growth_rate = calculate_growth_rate(hv_by_year, 9, hv_by_year.shape[1] - 1)

growth_df = pd.DataFrame({
    'Zip': zips,
    'Five_Year_Growth': last_5_years,
    'Ten_Year_Growth': last_10_years,
    'Overall_Growth': overall_growth_rate
})

merged_data = pd.merge(home_value_data[['Zip', 'Metro']], growth_df, on='Zip', how='inner')

#final db
merged_data = pd.merge(merged_data, density_data, on='Zip', how='inner').dropna()

print(merged_data.columns)

#leading 0s from zip code removed bruh

#merged_data.to_parquet('Databases for CHP/final_database.parquet', index=False)

#dparquet = pd.read_parquet('Databases for CHP/final_database.parquet')