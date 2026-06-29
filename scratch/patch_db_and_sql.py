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
        
        remote_py_code = """
import subprocess

# 1. Patch create_tables.sql
filepath = '/home/myuser/pet-atlas/create_tables.sql'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY, -- Strictly maps to WordPress User ID (wp_users.ID)
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role_id INT NOT NULL DEFAULT 5, -- 5 = client
    current_token TEXT, -- Optional: cache session token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete support
    FOREIGN KEY (role_id) REFERENCES roles(id)
);'''

replacement = '''CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY, -- Strictly maps to WordPress User ID (wp_users.ID)
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role_id INT NOT NULL DEFAULT 5, -- 5 = client
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    dob DATE NULL,
    sex ENUM('Male', 'Female') NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    country VARCHAR(100) NULL,
    mobile_number VARCHAR(20) NULL,
    availability_status ENUM('Online', 'Offline', 'Busy') DEFAULT 'Offline',
    current_token TEXT, -- Optional: cache session token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL, -- Soft Delete support
    FOREIGN KEY (role_id) REFERENCES roles(id)
);'''

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Patched create_tables.sql on server.")
else:
    print("WARNING: Target in create_tables.sql not found.")

# 2. Run ALTER TABLE on live DB inside docker
alter_query = '''
USE pet_atlas;
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100) NULL,
ADD COLUMN last_name VARCHAR(100) NULL,
ADD COLUMN dob DATE NULL,
ADD COLUMN sex ENUM('Male', 'Female') NULL,
ADD COLUMN address VARCHAR(255) NULL,
ADD COLUMN city VARCHAR(100) NULL,
ADD COLUMN country VARCHAR(100) NULL,
ADD COLUMN mobile_number VARCHAR(20) NULL,
ADD COLUMN availability_status ENUM('Online', 'Offline', 'Busy') DEFAULT 'Offline';
'''

cmd = "echo '55431978531lA@A' | sudo -S docker exec pet-atlas-db mysql -u root -ppet_atlas_db_root_sec_pass_2026 -e \\\"" + alter_query + "\\\""
proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print("ALTER TABLE STDOUT:", proc.stdout)
print("ALTER TABLE STDERR:", proc.stderr)
"""
        stdin, stdout, stderr = client.exec_command("python3")
        stdin.write(remote_py_code)
        stdin.close()
        
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        
        print("\n=== Remote execution stdout ===")
        print(out)
        if err:
            print("\n=== Remote execution stderr ===")
            print(err)
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
