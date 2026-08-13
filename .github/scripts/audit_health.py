import os
import requests
from datetime import datetime

def audit_account_health():
    # Configuration
    token = os.getenv('GH_PAT')
    if not token:
        print("Error: GH_PAT environment variable is not set.")
        return False

    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    # Resolve absolute path for the report
    # In GH Actions, GITHUB_WORKSPACE is provided. Otherwise, we use the current working directory.
    base_dir = os.getenv('GITHUB_WORKSPACE', '/home/mantit0985/sandbox-repo')
    report_path = os.path.join(base_dir, 'HEALTH_REPORT.md')

    # 1. Get all public repositories for the authenticated user
    url = 'https://api.github.com/user/repos?visibility=public&per_page=100'
    repos = []
    
    try:
        while url:
            response = requests.get(url, headers=headers)
            if response.status_code == 401:
                print("Error: Unauthorized. Please check your GH_PAT.")
                return False
            if response.status_code != 200:
                print(f"Error fetching repositories: {response.status_code} - {response.text}")
                return False
            
            repos.extend(response.json())
            
            if 'next' in response.links:
                url = response.links['next']['url']
            else:
                url = None
    except requests.exceptions.RequestException as e:
        print(f"Network error occurred: {e}")
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
            f.write("This report provides an overview of the health of all public repositories in the account.\n\n")
            f.write(markdown_table)
        print(f"Successfully wrote report to {report_path}")
        return True
    except Exception as e:
        print(f"Error writing report to {report_path}: {e}")
        return False

if __name__ == '__main__':
    if not audit_account_health():
        exit(1)
