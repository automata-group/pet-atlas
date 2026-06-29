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
        print(f"Connecting to server {IP_ADDRESS}:{PORT} as user '{USER}'...")
        client.connect(IP_ADDRESS, port=PORT, username=USER, pkey=k, timeout=10)
        print("[+] Connected successfully!")
        
        # Run update query
        cmd = f"echo '{PASS}' | sudo -S docker exec pet-atlas-db mysql -u root -ppet_atlas_db_root_sec_pass_2026 -e \"UPDATE pet_atlas.system_settings SET value = 'true' WHERE \`key\` = 'clinics_enabled';\""
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        
        print("\n=== STDOUT ===")
        print(out)
        if err:
            print("\n=== STDERR ===")
            print(err)
            
        # Verify
        cmd_verify = f"echo '{PASS}' | sudo -S docker exec pet-atlas-db mysql -u root -ppet_atlas_db_root_sec_pass_2026 -e \"SELECT * FROM pet_atlas.system_settings;\""
        stdin, stdout, stderr = client.exec_command(cmd_verify)
        out_v = stdout.read().decode('utf-8', errors='ignore').strip()
        print("\n=== Updated Settings ===")
        print(out_v)
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
