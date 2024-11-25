# reports/fire.py
import requests
import csv
import os
from datetime import datetime

API_URL = "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile"

def fetch_profile_data(actor):
    """Fetch profile data from Bluesky API."""
    params = {"actor": actor}
    response = requests.get(API_URL, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: Failed to fetch data for {actor} (HTTP {response.status_code})")
        return None

def extract_metrics(data):
    """Extract the relevant metrics from the fetched data."""
    if not data:
        return None

    metrics = {
        "followersCount": data.get("followersCount", 0),
        "followsCount": data.get("followsCount", 0),
        "postsCount": data.get("postsCount", 0),
        "associatedListsCount": data.get("associated", {}).get("lists", 0),
        "associatedFeedsCount": data.get("associated", {}).get("feedgens", 0),
        "associatedStarterPacksCount": data.get("associated", {}).get("starterPacks", 0),
        "joinedViaStarterPackCount": data.get("joinedViaStarterPack", {}).get("joinedAllTimeCount", 0),
    }

    return metrics

def append_to_csv(metrics, output_path):
    """Append the metrics to the CSV file, creating a new file if necessary."""
    today_date = datetime.now().strftime("%Y-%m-%d")

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    file_exists = os.path.isfile(output_path)

    with open(output_path, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        # Write the header if the file is new
        if not file_exists:
            header = ["Metric"] + [today_date]
            writer.writerow(header)

        # Write the metrics for the day
        for metric, value in metrics.items():
            writer.writerow([metric, value])

def process_account_metrics(actor, output_path):
    """Process and save metrics for a single account."""
    print(f"Fetching profile data for {actor}...")
    profile_data = fetch_profile_data(actor)

    if profile_data:
        print("Extracting metrics...")
        metrics = extract_metrics(profile_data)

        if metrics:
            print(f"Saving metrics to {output_path}...")
            append_to_csv(metrics, output_path)
        else:
            print(f"No metrics extracted for {actor}.")
    else:
        print(f"Failed to fetch profile data for {actor}.")