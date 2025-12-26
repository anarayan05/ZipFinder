import pandas as pd
import numpy as np
import duckdb

#for processing and combining data by zip code

#TASKS: 
#map initial dots on map based on data (areas that have been hot)

#combining the data (just writing)

#calculating home value growth between period in data frame
def calculate_growth_rate(df, start_year, end_year):
    growth_rate = []
    for _, row in df.iterrows():
        home_value_end = row.iloc[end_year]
        home_value_start = row.iloc[start_year]
        growth = (home_value_end - home_value_start) / home_value_start
        growth_rate.append(growth)
    return growth_rate

#calculating growth volatility of the three growth rates (normal)
def calculate_growth_volatility(rate1, rate2, rate3):
    mean_growth = (rate1 + rate2 + rate3) / 3
    variance = ((rate1 - mean_growth)**2 + (rate2 - mean_growth)**2 + (rate3 - mean_growth)**2) / 3
    vol_scores = np.sqrt(variance) / np.abs(mean_growth) #vol = variance / mean
    vol_scores_high = np.nanquantile(vol_scores, 0.90) #90th percentile

    #set top 10% of volatility scores to nan
    vol_scores_filtered = vol_scores.copy()
    vol_scores_filtered[vol_scores > vol_scores_high] = np.nan

    filtered_min = np.nanmin(vol_scores_filtered) #min of filtered
    filtered_max = np.nanmax(vol_scores_filtered) #max of filtered
    normalized_vol_scores = (vol_scores_filtered - filtered_min) / (filtered_max - filtered_min) #normalized
    return normalized_vol_scores
    



density_data = pd.read_csv('Databases for CHP/Population-Density-Final.csv', dtype = {'Zip': str}) #stored as DF

density_data = density_data[['Zip', 'population', 'density', 'City', 'lat', 'long']]

home_value_data = pd.read_csv('../ZHVI_home_values.csv', dtype = {'Zip': str})

zips = home_value_data.iloc[:, 2]

hv_by_year = home_value_data.iloc[:, 9:]

last_10_years = np.array(calculate_growth_rate(hv_by_year, hv_by_year.shape[1] - 121, hv_by_year.shape[1] - 1))
last_5_years = np.array(calculate_growth_rate(hv_by_year, hv_by_year.shape[1] - 61, hv_by_year.shape[1] - 1))
overall_growth_rate = np.array(calculate_growth_rate(hv_by_year, 9, hv_by_year.shape[1] - 1))
growth_volatility = np.array(calculate_growth_volatility(last_5_years, last_10_years, overall_growth_rate))

growth_df = pd.DataFrame({
    'Zip': zips,
    'Five_Year_Growth': last_5_years.tolist(),
    'Ten_Year_Growth': last_10_years.tolist(),
    'Overall_Growth': overall_growth_rate.tolist(),
    'Growth_Volatility': growth_volatility.tolist()
})

#address problem, merge creates 0 df
merged_data = pd.merge(home_value_data[['Zip', 'Metro']], growth_df, on='Zip', how='inner')

#final db

#SECOND MERGE HERE
merged_data = pd.merge(merged_data, density_data, on='Zip', how='inner').dropna()

# merged_data.to_parquet('Databases for CHP/final_database.parquet', index=False)

#dparquet = pd.read_parquet('Databases for CHP/final_database.parquet')