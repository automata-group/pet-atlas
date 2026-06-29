import os
import sys
import paramiko

IP_ADDRESS = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"

def main():
    if len(sys.argv) < 2:
        print("Usage: python run_remote_cmd.py \"<command>\"")
        return
    
    cmd = sys.argv[1]
    
    home = os.path.expanduser("~")
    priv_key_path = os.path.join(home, ".ssh", "pet_atlas_server_key")
    
    k = paramiko.Ed25519Key.from_private_key_file(priv_key_path, password=PASS)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to server {IP_ADDRESS}:{PORT} as '{USER}'...")
        client.connect(IP_ADDRESS, port=PORT, username=USER, pkey=k, timeout=10)
        print("[+] Connected successfully!")
        print(f"Executing: {cmd}")
        
        # If the command starts with sudo, inject password automatically
        if "sudo " in cmd:
            # We can use a trick: execute with sudo -S
            # Let's replace 'sudo ' with 'echo {PASS} | sudo -S ' or similar
            # But let's let the command handle it or do it here
            pass
            
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode('utf-8', errors='ignore')
        err = stderr.read().decode('utf-8', errors='ignore')
        
        print("\n=== STDOUT ===")
        print(out)
        if err:
            print("\n=== STDERR ===")
            print(err)
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
