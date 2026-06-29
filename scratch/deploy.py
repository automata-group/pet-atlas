import os
import paramiko
import stat

IP_ADDRESS = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"

# Directories/files to ignore during upload
IGNORE_DIRS = {".git", "node_modules", "dist", "build", "scratch", ".dart_tool", "ios", "android"}
IGNORE_FILES = {".env", ".DS_Store"}

def sftp_upload_dir(sftp, local_dir, remote_dir):
    print(f"[*] Syncing directory: {local_dir} -> {remote_dir}")
    try:
        sftp.mkdir(remote_dir)
    except IOError:
        pass # Directory already exists
        
    for item in os.listdir(local_dir):
        if item in IGNORE_DIRS:
            continue
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + "/" + item
        
        if os.path.isdir(local_path):
            sftp_upload_dir(sftp, local_path, remote_path)
        else:
            if item in IGNORE_FILES:
                continue
            print(f"  Uploading: {item}")
            sftp.put(local_path, remote_path)

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
        
        # 1. Create target directory on server
        stdin, stdout, stderr = client.exec_command("mkdir -p /home/myuser/pet-atlas")
        stdout.channel.recv_exit_status()
        
        # 2. Start SFTP client and upload files
        sftp = client.open_sftp()
        local_root = r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas"
        remote_root = "/home/myuser/pet-atlas"
        
        # Upload core files
        for f in ["Caddyfile", "docker-compose.yml", "create_tables.sql", "nginx.conf"]:
            local_file = os.path.join(local_root, f)
            if os.path.exists(local_file):
                print(f"[*] Uploading root file: {f}")
                sftp.put(local_file, remote_root + "/" + f)
                
        # Upload subprojects
        for folder in ["backend", "dashboard", "clinic-dashboard", "consultant-dashboard"]:
            local_folder = os.path.join(local_root, folder)
            if os.path.exists(local_folder):
                sftp_upload_dir(sftp, local_folder, remote_root + "/" + folder)
                
        sftp.close()
        print("[+] SFTP file upload completed successfully!")
        
        # 3. Clean up existing containers and build the new stack
        def run_cmd(cmd, timeout=600):
            # If the command contains sudo, we prepend the password feeding mechanism
            if "sudo" in cmd:
                actual_cmd = cmd.replace("sudo ", f"echo '{PASS}' | sudo -S ")
            else:
                actual_cmd = cmd
            print(f"\n[*] Executing remote: {cmd}")
            stdin, stdout, stderr = client.exec_command(f"cd /home/myuser/pet-atlas && {actual_cmd}", timeout=timeout)
            exit_status = stdout.channel.recv_exit_status()
            out = stdout.read().decode('utf-8', errors='ignore').strip()
            err = stderr.read().decode('utf-8', errors='ignore').strip()
            if "[sudo] password for" in err:
                err = err.split("\n", 1)[-1].strip()
            print(f"[Exit Code: {exit_status}]")
            if out:
                print(f"[Output]:\n{out}")
            if err:
                print(f"[Error]:\n{err}")
            return exit_status
            
        print("\n=== Running Docker Compose Stack Build ===")
        # Bring down old containers if any
        run_cmd("sudo docker compose down")
        # Build and bring up the new containers
        run_cmd("sudo docker compose up -d --build")
        
        # 4. Verify running containers
        print("\n=== Verifying Active Containers ===")
        run_cmd("sudo docker compose ps")
        
        print("\n[+] Deployment successfully executed!")
        
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
