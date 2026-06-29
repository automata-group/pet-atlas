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
        
        # SQL query to seed default team member
        sql_query = """USE pet_atlas;
        INSERT INTO consultant_team_members (listing_id, user_id, role)
        VALUES (1, 2, 'responder')
        ON DUPLICATE KEY UPDATE role='responder';
        """
        
        print("[*] Seeding default team member...")
        cmd = f"echo '{PASS}' | sudo -S docker exec -i pet-atlas-db mysql -u root -ppet_atlas_db_root_sec_pass_2026 -e \"{sql_query}\""
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        
        print("\n=== Database Response ===")
        if not err or "Warning" in err:
            print("[+] Default team member seeded successfully.")
        else:
            print("\n=== Error Output ===")
            print(err)
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
