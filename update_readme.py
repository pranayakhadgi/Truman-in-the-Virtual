#!/usr/bin/env python3
"""
README Update System for Truman Virtual Tour
Automatically updates README.md with new changes and timestamps
"""

import os
import datetime
import re
from typing import List, Dict

class ReadmeUpdater:
    def __init__(self, readme_path: str = "README.md"):
        self.readme_path = readme_path
        self.today = datetime.datetime.now().strftime("%B %d, %Y")
        
    def add_update(self, changes: List[str], section: str = "Project Timeline & Updates"):
        """Add new updates to the README file"""
        if not os.path.exists(self.readme_path):
            print(f"❌ README.md not found at {self.readme_path}")
            return False
            
        # Read current README
        with open(self.readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the updates section
        updates_pattern = r'(### October 14, 2025.*?)(### Future Updates)'
        match = re.search(updates_pattern, content, re.DOTALL)
        
        if match:
            # Add new updates to existing section
            existing_updates = match.group(1)
            new_updates = f"\n### {self.today}\n"
            for change in changes:
                new_updates += f"- ✅ **{change}**\n"
            
            # Replace the section
            new_section = existing_updates + new_updates + "\n" + match.group(2)
            content = content.replace(match.group(0), new_section)
        else:
            # Create new updates section
            new_section = f"\n### {self.today}\n"
            for change in changes:
                new_section += f"- ✅ **{change}**\n"
            
            # Add before Future Updates section
            content = content.replace("### Future Updates", new_section + "\n### Future Updates")
        
        # Write updated content
        with open(self.readme_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ README.md updated with {len(changes)} new changes")
        return True
    
    def update_last_modified(self):
        """Update the last modified date at the bottom of README"""
        with open(self.readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update last modified date
        content = re.sub(
            r'\*\*Last Updated:\*\* .*',
            f'**Last Updated:** {self.today}',
            content
        )
        
        with open(self.readme_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Last modified date updated to {self.today}")

def main():
    """Example usage of the README updater"""
    updater = ReadmeUpdater()
    
    # Example: Add new changes
    new_changes = [
        "Project reorganization completed",
        "File paths updated for new structure",
        "Comprehensive documentation created"
    ]
    
    # Add updates
    updater.add_update(new_changes)
    updater.update_last_modified()

if __name__ == "__main__":
    main()
