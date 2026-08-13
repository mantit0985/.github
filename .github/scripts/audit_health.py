import os
import subprocess
import argparse
import json
from datetime import datetime

def audit_account_health(owner=None):
    # Resolve absolute path for the report
    base_dir = os.getenv('GITHUB_WORKSPACE', os.getcwd())
    report_path = os.path.join(base_dir, 'HEALTH_REPORT.md')

    # 1. Get public repositories using gh CLI
    if owner:
        print(f"Auditing repositories for owner: {owner}")
        cmd = ["gh", "api", f"users/{owner}/repos?visibility=public&per_page=100", "--paginate"]
    else:
        print("Auditing repositories for authenticated user")
        cmd = ["gh", "api", "user/repos?visibility=public&per_page=100", "--paginate"]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        repos = json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error fetching repositories: {e.stderr}")
        return False
    except json.JSONDecodeError as e:
        print(f"Error parsing repositories JSON: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

    # 2. Audit each repository
    report_data = []
    for repo in repos:
        name = repo['full_name']
        updated_at = repo['updated_at']
        
        # README check
        has_readme = '✅' if repo.get('readme_url') else '❌'
        
        # License check
        has_license = '✅' if repo.get('license') else '❌'
        
        # Format date
        try:
            dt = datetime.strptime(updated_at, "%Y-%m-%dT%H:%M:%SZ")
            formatted_date = dt.strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            formatted_date = "Unknown"
        
        report_data.append({
            'name': name,
            'readme': has_readme,
            'license': has_license,
            'updated': formatted_date
        })

    # 3. Generate Markdown Table
    markdown_table = "| Repository | README | License | Last Updated |\n"
    markdown_table += "| :--- | :---: | :---: | :--- |\n"
    
    # Sort by last updated date descending
    report_data.sort(key=lambda x: x['updated'], reverse=True)
    
    for item in report_data:
        markdown_table += f"| {item['name']} | {item['readme']} | {item['license']} | {item['updated']} |\n"

    # 4. Write to HEALTH_REPORT.md using absolute path
    try:
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# 🏥 Account Health Report\n\n")
            f.write(f"**Generated on:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC\n\n")
            if owner:
                f.write(f"This report provides an overview of the health of public repositories for **{owner}**.\n\n")
            else:
                f.write("This report provides an overview of the health of all public repositories in the account.\n\n")
            f.write(markdown_table)
        print(f"Successfully wrote report to {report_path}")
        return True
    except Exception as e:
        print(f"Error writing report to {report_path}: {e}")
        return False

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Audit GitHub account health.")
    parser.add_argument('--owner', type=str, help="GitHub owner to audit. If omitted, audits authenticated user.")
    args = parser.parse_args()

    if not audit_account_health(owner=args.owner):
        exit(1)
