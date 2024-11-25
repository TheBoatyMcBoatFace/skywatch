# reports/__main__.py
import yaml
import os
from reports.fire import process_account_metrics
from reports.turkey import process_account_posts

CONFIG_FILE = "config.yml"

def load_config(config_file):
    """Load configuration from the YAML file."""
    with open(config_file, "r") as file:
        return yaml.safe_load(file)

def ensure_directory(path):
    """Ensure the directory exists."""
    os.makedirs(path, exist_ok=True)

def main():
    # Load configuration
    config = load_config(CONFIG_FILE)
    accounts = config.get("accounts", [])
    post_limit = config.get("post_limit", 100)
    output_paths = config.get("output", {})

    maths_path = output_paths.get("maths", "output/maths")
    pretty_path = output_paths.get("pretty", "output/html")

    # Ensure output directories exist
    ensure_directory(maths_path)
    ensure_directory(pretty_path)

    for account in accounts:
        print(f"Processing account: {account}")

        # Generate metrics (fire.py)
        metrics_output_path = os.path.join(maths_path, f"{account.replace('.', '_')}/account.csv")
        process_account_metrics(account, metrics_output_path)

        # Generate post reports (turkey.py)
        posts_output_path = os.path.join(maths_path, f"{account.replace('.', '_')}/posts.csv")
        process_account_posts(account, posts_output_path, post_limit)

        print(f"Reports for {account} saved to {maths_path}/{account.replace('.', '_')}")

if __name__ == "__main__":
    main()