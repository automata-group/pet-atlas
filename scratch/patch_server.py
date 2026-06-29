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
        
        # We will run a python one-liner on the server to replace the hardcoded host/user/pass in app.module.ts
        remote_py_code = """
filepath = '/home/myuser/pet-atlas/backend/src/app.module.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 3306,'''

replacement = '''    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 3306,'''

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Patched app.module.ts with type-safe code on server.")
else:
    # Check if the target was already modified or if we need to do a full checkout first
    print("WARNING: Could not find target. Performing git checkout and then patching.")
"""
        # Execute the python code on the server
        stdin, stdout, stderr = client.exec_command("python3")
        stdin.write(remote_py_code)
        stdin.close()
        
        out = stdout.read().decode('utf-8', errors='ignore').strip()
        err = stderr.read().decode('utf-8', errors='ignore').strip()
        
        print("\n=== Remote Patch Execution Output ===")
        print(out)
        if err:
            print("\n=== Remote Errors ===")
            print(err)
            
        if "WARNING" in out:
            # Let's restore the file on the server and patch from scratch
            print("Restoring app.module.ts on the server...")
            client.exec_command("git -C /home/myuser/pet-atlas checkout backend/src/app.module.ts")
            
            # Now run the complete patch from clean state
            clean_patch_code = """
filepath = '/home/myuser/pet-atlas/backend/src/app.module.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '', // Standard for local XAMPP
      database: 'pet_atlas','''

replacement = '''    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'pet_atlas','''

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Clean patched app.module.ts on server.")
else:
    print("ERROR: Clean patch target not found!")
"""
            stdin, stdout, stderr = client.exec_command("python3")
            stdin.write(clean_patch_code)
            stdin.close()
            print("\n=== Remote Clean Patch Execution Output ===")
            print(stdout.read().decode('utf-8', errors='ignore').strip())
            
    except Exception as e:
        print(f"[!] Operation failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
