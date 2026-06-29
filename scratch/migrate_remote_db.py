import os
import paramiko

IP_ADDRESS = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"

def main():
    home = os.path.expanduser("~")
    priv_key_path = os.path.join(home, ".ssh", "pet_atlas_server_key")
    
    k = paramiko.Ed25519Key.from_private_key_file(priv_key_path, password=PASS)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to server {IP_ADDRESS}:{PORT} as '{USER}'...")
        client.connect(IP_ADDRESS, port=PORT, username=USER, pkey=k, timeout=10)
        print("[+] Connected successfully!")
        
        # Python script to run on the server
        remote_py_code = """
import subprocess
import os

sql_query = \"\"\"USE pet_atlas;
ALTER TABLE pets ADD COLUMN type VARCHAR(100) NULL AFTER sex;
ALTER TABLE pets ADD COLUMN weight DECIMAL(5,2) NULL AFTER type;
ALTER TABLE pets ADD COLUMN notes TEXT NULL AFTER neutered;
ALTER TABLE pets ADD COLUMN activity_log JSON NULL AFTER notes;
\"\"\"

temp_file = "/tmp/migrate_pets.sql"
with open(temp_file, "w") as f:
    f.write(sql_query)

# Execute via sudo sh -c to avoid stdin conflicts
cmd = "echo '55431978531lA@A' | sudo -S sh -c \\"docker exec -i pet-atlas-db mysql -u root -ppet_atlas_db_root_sec_pass_2026 < " + temp_file + "\\" "

proc = subprocess.run(
    cmd,
    shell=True, capture_output=True, text=True
)

# Clean up
if os.path.exists(temp_file):
    os.remove(temp_file)

print("STDOUT:", proc.stdout)
print("STDERR:", proc.stderr)
"""
        
        stdin, stdout, stderr = client.exec_command("python3")
        stdin.write(remote_py_code)
        stdin.close()
        
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        
        print("\n=== Remote Script Execution Output ===")
        print(out)
        if err:
            print("\n=== Errors ===")
            print(err)
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
