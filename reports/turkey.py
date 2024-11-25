# reports/turkey.py
import requests
import csv
import os

API_URL = "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed"

def fetch_posts_data(actor, limit):
    """Fetch posts data from the Bluesky API."""
    params = {"actor": actor, "limit": limit, "filter": "posts_with_replies"}
    response = requests.get(API_URL, params=params)

    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: Failed to fetch posts for {actor} (HTTP {response.status_code})")
        return None

def sanitize_text(text):
    """Remove line breaks and ensure proper escaping for CSV."""
    if not text:
        return "N/A"
    return text.replace("\n", " ").replace("\r", " ").strip()

def extract_post_id(uri):
    """Extract the last part of the post URI."""
    return uri.split("/")[-1] if uri else "N/A"

def parse_posts_data(data):
    """Parse the fetched posts data for useful fields."""
    parsed_posts = []
    for item in data.get("feed", []):
        post = item.get("post", {})
        record = post.get("record", {})

        parsed_posts.append({
            "Post ID": extract_post_id(post.get("uri", "N/A")),
            "Post Text": sanitize_text(record.get("text", "N/A")),
            "Likes": post.get("likeCount", 0),
            "Reposts": post.get("repostCount", 0),
            "Replies": post.get("replyCount", 0),
            "Quotes": post.get("quoteCount", 0),
            "Created At": record.get("createdAt", "N/A")
        })
    return parsed_posts

def save_posts_to_csv(posts, output_path):
    """Save parsed posts data to CSV."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=posts[0].keys())
        writer.writeheader()
        writer.writerows(posts)

def process_account_posts(actor, output_path, limit):
    """Process and save posts data for a single account."""
    print(f"Fetching posts for {actor}...")
    raw_data = fetch_posts_data(actor, limit)

    if raw_data:
        print("Parsing posts data...")
        parsed_posts = parse_posts_data(raw_data)

        if parsed_posts:
            print(f"Saving posts data to {output_path}...")
            save_posts_to_csv(parsed_posts, output_path)
        else:
            print(f"No posts found for {actor}.")
    else:
        print(f"Failed to fetch posts for {actor}.")