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
        
        # Verify Docker Compose processes
        cmd = f"echo '{PASS}' | sudo -S docker compose -f /home/myuser/pet-atlas/docker-compose.yml ps"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        if "[sudo] password for" in err:
            err = err.split("\n", 1)[-1].strip()
            
        print("\n=== Docker Compose ps Output ===")
        print(out)
        if err:
            print("\n=== Error/Warning Output ===")
            print(err)
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
