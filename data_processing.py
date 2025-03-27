import pandas as pd

#for processing and combining data by zip code

#combining the data (just writing)
#still need to organize ZHVI and add more data

#possibly handle NaN.
def calculate_growth_rate(df, start_year, end_year):
    growth_rate = []
    for _, row in df.iterrows():
        home_value_end = row.iloc[end_year]
        home_value_start = row.iloc[start_year]
        growth = (home_value_end - home_value_start) / home_value_start
        growth_rate.append(growth)
    return growth_rate


density_data = pd.read_csv('Population-Density-Final.csv') #stored as DF

density_data = density_data[['Zip', 'population', 'density', 'City', 'lat', 'long']]

home_value_data = pd.read_csv('C:/Users/naman/Desktop/ZHVI_home_values.csv')

zips = home_value_data.iloc[:, 2]

print(zips)

hv_by_year = home_value_data.iloc[:, 9:]
print(hv_by_year)

overall_growth_rate = calculate_growth_rate(hv_by_year, 9, hv_by_year.shape[1] - 1)

home_value_data_combined = pd.concat([home_value_data[['Zip', 'Metro']], hv_by_year], axis=1)

merged_data = pd.merge(density_data, home_value_data, on='Zip', how='inner')

#merged_data.to_csv('combined_data.csv', index = False)

#...final merge with growth rates