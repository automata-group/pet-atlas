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
import urllib.request
import json
import subprocess

url = "http://localhost:3000/auth/register"
data = {
    "username": "admin_atlas",
    "email": "admin_atlas@pet-atlas.com",
    "password": "PA_Admin_9921_!"
}

req = urllib.request.Request(
    url, 
    data=json.dumps(data).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print("Registration Response:", html)
        
        # Parse user ID to promote it to Admin
        res_data = json.loads(html)
        user_id = res_data.get('id')
        if user_id:
            print(f"Promoting local user {user_id} to role_id = 1 (Admin)...")
            sql = f"update pet_atlas.users set role_id = 1 where id = {user_id};"
            cmd = f"echo '55431978531lA@A' | sudo -S docker exec pet-atlas-db mysql -u root -ppet_atlas_db_root_sec_pass_2026 -e \\"{sql}\\""
            proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            print("SQL STDOUT:", proc.stdout)
            print("SQL STDERR:", proc.stderr)
except Exception as e:
    print("Error calling register:", e)
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
