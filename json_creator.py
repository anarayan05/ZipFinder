import sqlite3
import json

# Connect to the SQLite database
conn = sqlite3.connect("nb.db")
cursor = conn.cursor()

# Fetch all records from the table
cursor.execute("SELECT * FROM sample_zips")
rows = cursor.fetchall()

# Get column names from the database
columns = []
for desc in cursor.description:
    columns.append(desc[0])

# Convert each row into a dictionary
json_list = []
for row in rows:
    row_dict = {}  # Create a dictionary for each row
    for i in range(len(columns)):
        row_dict[columns[i]] = row[i]  # Assign column names to values
    
    # If the "data" column contains a JSON string, parse it
    if "data" in row_dict:
        row_dict["data"] = json.loads(row_dict["data"])  # Convert string to JSON object
    
    # Add the processed row to the list
    json_list.append(row_dict)

# Convert the final list to a JSON string with formatting
json_output = json.dumps(json_list, indent=4)

# Print the final JSON result
print(json_output)

# Close the database connection
conn.close()

