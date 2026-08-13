import os
import re
from datetime import datetime
import subprocess
import json

def get_repo_stats(report_path):
    if not os.path.exists(report_path):
        return None
    
    with open(report_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find the table start
    table_started = False
    repos = []
    for line in lines:
        if '| Repository |' in line:
            table_started = True
            continue
        if table_started and '| :---' in line:
            continue
        if table_started and line.strip().startswith('|'):
            # Extract data: | Name | README | License | Updated |
            parts = [p.strip() for p in line.split('|') if p.strip()]
            if len(parts) >= 3:
                repos.append({
                    'name': parts[0],
                    'readme': parts[1],
                    'license': parts[2]
                })
    
    if not repos:
        return None
    
    total = len(repos)
    readme_count = sum(1 for r in repos if '✅' in r['readme'])
    license_count = sum(1 for r in repos if '✅' in r['license'])
    
    return {
        'total': total,
        'readme_pct': (readme_count / total * 100) if total > 0 else 0,
        'license_pct': (license_count / total * 100) if total > 0 else 0
    }

def get_recent_activities():
    try:
        repo_env = os.environ.get("GITHUB_REPOSITORY", "")
        username = repo_env.split("/")[0] if "/" in repo_env else "placeholder"
        
        result = subprocess.run(
            ["gh", "api", f"users/{username}/events"],
            capture_output=True,
            text=True,
            check=True
        )
        events = json.loads(result.stdout)
        
        # Filter for major activities: PushEvent, CreateEvent, WatchEvent
        major_events = [e for e in events if e["type"] in ("PushEvent", "CreateEvent", "WatchEvent")]
        
        summary = []
        for event in major_events[:3]:
            etype = event["type"]
            repo_name = event["repo"]["name"]
            
            if etype == "PushEvent":
                commits = event.get("payload", {}).get("commits", [])
                msg = commits[0].get("message", "Pushed changes").split('\n')[0] if commits else "Pushed changes"
                summary.append(f"🚀 **Push** to `{repo_name}`: {msg}")
            elif etype == "CreateEvent":
                ref = event.get("payload", {}).get("ref", "something")
                summary.append(f"✨ **Created** {ref} in `{repo_name}`")
            elif etype == "WatchEvent":
                summary.append(f"⭐ **Starred** `{repo_name}`")
        
        return summary if summary else ["No major recent activity found."]
    except Exception as e:
        print(f"Error fetching activity: {e}")
        return ["Error fetching recent activity."]

def generate_dashboard():
    base_dir = os.getenv('GITHUB_WORKSPACE', os.getcwd())
    report_path = os.path.join(base_dir, 'HEALTH_REPORT.md')
    dashboard_path = os.path.join(base_dir, 'DASHBOARD.md')
    
    stats = get_repo_stats(report_path)
    activities = get_recent_activities()
    
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    content = "# 📊 Account Observability Dashboard\n\n"
    content += f"**Last Updated:** {now} UTC\n\n"
    
    content += "## 📈 Health Metrics\n"
    if stats:
        content += f"- **Total Public Repositories:** {stats['total']}\n"
        content += f"- **README Coverage:** {stats['readme_pct']:.1f}%\n"
        content += f"- **License Coverage:** {stats['license_pct']:.1f}%\n"
    else:
        content += "*Health metrics unavailable. Please run the Health Auditor first.*\n"
    
    content += "\n## ⚡ Recent Activity\n"
    for act in activities:
        content += f"- {act}\n"
    
    content += "\n---\n"
    content += "Detailed reports available in [HEALTH_REPORT.md](./HEALTH_REPORT.md) and [profile/README.md](./profile/README.md).\n"
    
    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Successfully generated dashboard at {dashboard_path}")

if __name__ == '__main__':
    generate_dashboard()
