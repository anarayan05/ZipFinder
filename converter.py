import pandas as pd
import sqlite3

# Load the CSV into a DataFrame
df = pd.read_csv("Population-Density-Final.csv")

# Connect to SQLite (it will create the database if it doesn't exist)
conn = sqlite3.connect("nb.db")

# Write the DataFrame to SQLite without row limits
df.to_sql("your_table_name", conn, if_exists="replace", index=False)

# Close the connection
conn.close()