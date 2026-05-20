import os
import shutil
import tempfile
import sys

# Add current directory to path
sys.path.append(os.path.abspath('.'))

import generate_db

class MockWindow:
    def evaluate_js(self, code):
        print(f"[UI UPDATE] {code}")

def main():
    app = generate_db.GeneratorApp()
    app.temp_dir = tempfile.mkdtemp(prefix="utd_generator_")
    app.window = MockWindow()
    app.is_running = True
    
    # Run logic headlessly for king_sailor, mochi_pirate, and gluttonous_warlord
    print("Starting database generation for King Sailor, Mochi Pirate, and Gluttonous Warlord...")
    app._run_logic(
        selected_units=["king_sailor", "mochi_pirate", "gluttonous_warlord"],
        threads=4,
        mode="all"
    )
    
    # Clean up
    if app.temp_dir and os.path.exists(app.temp_dir):
        shutil.rmtree(app.temp_dir, ignore_errors=True)
    print("Database generation completed successfully!")

if __name__ == "__main__":
    main()
