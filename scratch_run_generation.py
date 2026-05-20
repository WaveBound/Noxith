import os
import json
import itertools
import subprocess
import tempfile
import shutil
import sys
import multiprocessing

REQUIRED_FILES = [
    "utdx/backend/data/buffs.js",
    "utdx/backend/data/config.js",
    "utdx/shared/relics/relics.js",
    "utdx/shared/traits/traits.js",
    "utdx/backend/state.js",
    "utdx/backend/constants.js",
    "utdx/backend/utils.js",
    "utdx/backend/math/lookups.js",
    "utdx/backend/math/core-math.js",
    "utdx/shared/abilities/ability-backend.js",
    "utdx/shared/modes/mode-backend.js",
    "utdx/shared/summons/summon-backend.js",
    "utdx/shared/passives/passive-backend.js",
    "utdx/shared/relics/relic-backend.js",
    "utdx/shared/traits/trait-backend.js",
    "utdx/backend/math/context-builder.js",
    "utdx/backend/math/calculations.js",
    "utdx/backend/math/build-runner.js",
]

# Read GENERATOR_SCRIPT from generate_db.py
with open("utdx/generate_db.py", "r", encoding="utf-8") as f:
    generate_db_content = f.read()

# Find the GENERATOR_SCRIPT block in generate_db.py
import re
match = re.search(r'GENERATOR_SCRIPT = """(.*?)"""', generate_db_content, re.DOTALL)
if not match:
    print("Error: Could not find GENERATOR_SCRIPT in generate_db.py")
    sys.exit(1)

generator_script = match.group(1)

# Combined JS parts
combined_js_parts = [
    "if (typeof window === 'undefined') { global.window = global; }\n",
    "if (typeof document === 'undefined') { global.document = { createElement: () => ({}), head: { appendChild: () => {} } }; }\n",
    "global.unitDatabase = global.unitDatabase || []; global.unitSpecificTraits = global.unitSpecificTraits || {};\n",
]

for filename in REQUIRED_FILES:
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            combined_js_parts.append(f.read() + "\n")
    else:
        print(f"Warning: File {filename} not found.")

# Load unit files
units_dir = 'utdx/units'
for u_file in sorted(os.listdir(units_dir)):
    if u_file.endswith('.js'):
        clean_name = u_file.replace('.js', '')
        combined_js_parts.append(f"global.__currentUnitFile = '{clean_name}';\n")
        with open(os.path.join(units_dir, u_file), "r", encoding="utf-8") as f:
            combined_js_parts.append(f.read() + "\n")

combined_js_parts.append(generator_script)
combined_js = "".join(combined_js_parts)

temp_dir = tempfile.mkdtemp(prefix="utd_generator_")
temp_runner = os.path.join(temp_dir, "db_runner.js")
with open(temp_runner, "w", encoding="utf-8") as f:
    f.write(combined_js)

# Target units with DoTs
target_units = ["ace","akainu","alpha_devil","ancient_mage","ancient_shinob","ant_king_savage","crow_shinobi","devil_hunter","enlightenedgod","first_emperor","gluttonous_warlord","grimjaw","majestic_armor","megumin","mimicry_sorcerer","mob","sasuke_great_war","the_strongest_in_history","triple_threat","trunks"]

# Generate all 192 combos
b_miku = ['0', '1']
b_enlightened = ['0', '1']
b_bijuu = ['0', '1']
b_amage = ['0', '1']
b_ksailor = ['0', '1']
b_fern = ['none', 'hill', 'ground']
b_bulma = ['0', '1']
all_combos = list(itertools.product(b_miku, b_enlightened, b_bijuu, b_amage, b_ksailor, b_fern, b_bulma))

db_dir = "utdx/databases"
os.makedirs(db_dir, exist_ok=True)

# Threads: use CPU count - 1 to keep system responsive but run super fast
threads = max(1, multiprocessing.cpu_count() - 1)
print(f"Starting generation with {threads} threads for {len(target_units)} units across {len(all_combos)} combos...")

job_data = {
    "combinations": all_combos,
    "targetUnits": target_units,
    "threads": threads,
    "outDir": db_dir
}

job_file = os.path.join(temp_dir, "job.json")
with open(job_file, "w", encoding="utf-8") as f:
    json.dump(job_data, f)

# Launch node subprocess
process = subprocess.Popen(
    ["node", "--expose-gc", temp_runner, job_file],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    encoding="utf-8"
)

def read_err():
    for line in process.stderr:
        print(f"Node Error: {line.strip()}")

import threading
threading.Thread(target=read_err, daemon=True).start()

for line in process.stdout:
    line = line.strip()
    if line.startswith("__STATUS__:PROGRESS:"):
        parts = line.split(":", 3)
        pct = float(parts[2])
        msg = parts[3] if len(parts) > 3 else ""
        print(f"Progress: {pct:.2f}% | {msg}")
    elif line.startswith("__STATUS__:LOG:"):
        print(f"Log: {line}")

process.wait()
shutil.rmtree(temp_dir, ignore_errors=True)
print("Database generation completed successfully!")
