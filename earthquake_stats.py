"""
Via the chosen API, obtain earthquake stats relevant to this project, e.g., how many earthquakes daily since the beggining of 2026.
"""

import requests
import json
import time
from datetime import datetime, timedelta

start_date = datetime(2026, 1, 1)
end_date = datetime(2026, 5, 11)
delta = end_date - start_date

# Generate list of dates
date_list = []
for i in range(delta.days + 1):
    day = start_date + timedelta(days=i)
    date_list.append(day.date()) # .date() extracts YYYY-MM-DD

print(f"First date: {str(date_list[0])})

magnitude = 5
daily_quakes = []
for i in range(len(date_list[:-1])):
    if i % 12 == 0:
        print(f"Fetching date {date_list[i]}")
    start, end = str(date_list[i]), str(date_list[i+1]) # change from datetime object to string
    request_str = f"https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={start}&endtime={end}&minmagnitude={magnitude}"
    response_text = requests.get(request_str).text
    response_json = json.loads(response_text)
    features = response_json["features"]
    daily_quakes.append(len(features))
    time.sleep(0.1) # not to spam the API

print(f"{len(daily_quakes)} days tested: from {start_date} to {end_date}")
print(f"Min number of earthquakes daily: {min(daily_quakes)}")
print(f"Max number of earthquakes daily: {max(daily_quakes)}")
print(f"Average: {sum(daily_quakes)/len(daily_quakes)}")
