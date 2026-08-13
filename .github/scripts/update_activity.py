import os
import subprocess
import json
import re

def get_recent_activity(username):
    try:
        # Use gh cli to fetch events
        result = subprocess.run(
            ["gh", "api", f"users/{username}/events"],
            capture_output=True,
            text=True,
            check=True
        )
        events = json.loads(result.stdout)
        
        push_events = [e for e in events if e["type"] == "PushEvent"]
        
        activity_lines = []
        for event in push_events[:5]:
            repo_name = event["repo"]["name"]
            # Get the first commit message from the push
            commits = event.get("payload", {}).get("commits", [])
            if commits:
                msg = commits[0].get("message", "No commit message").split('\n')[0]
                activity_lines.append(f"* **[{repo_name}]** {msg}")
            else:
                activity_lines.append(f"* **[{repo_name}]** Pushed new changes")
        
        return "\n".join(activity_lines) if activity_lines else "*No recent activity found.*"
    except Exception as e:
        print(f"Error fetching activity: {e}")
        return "*Error fetching recent activity.*"

def update_readme(readme_path, activity_text):
    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    pattern = r"(<!-- activity-start -->)(.*?)(<!-- activity-end -->)"
    replacement = rf"\1\n{activity_text}\n\3"
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(new_content)

if __name__ == "__main__":
    # Get username from environment or default to a placeholder
    # In GitHub Actions, GITHUB_REPOSITORY is 'owner/repo'
    repo_env = os.environ.get("GITHUB_REPOSITORY", "")
    username = repo_env.split("/")[0] if "/" in repo_env else "placeholder"
    
    readme_path = os.environ.get("README_PATH", "/home/mantit0985/sandbox-repo/profile/README.md")
    
    print(f"Fetching activity for {username}...")
    activity = get_recent_activity(username)
    print(f"Updating {readme_path}...")
    update_readme(readme_path, activity)
    print("Done!")
