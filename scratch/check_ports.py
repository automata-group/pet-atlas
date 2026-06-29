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
        client.connect(IP_ADDRESS, port=PORT, username=USER, pkey=k, timeout=10)
        
        def run(cmd):
            print(f"=== {cmd} ===")
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode('utf-8')
            err = stderr.read().decode('utf-8')
            if out:
                print(f"[STDOUT]:\n{out}")
            if err:
                print(f"[STDERR]:\n{err}")
                
        run("cat /etc/os-release")
        run("which docker")
        run("which docker-compose")
        run("which caddy")
        
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    main()
