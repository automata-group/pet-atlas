import paramiko

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"

LOCAL_FILE = r"c:\Users\second fictory\Desktop\pet-atlas\pet-atlas\backend\src\modules\auth\admin.service.ts"

def rs(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(f"sudo -S bash -c {repr(cmd)}", timeout=timeout)
    stdin.write(PASS + "\n")
    stdin.flush()
    out = stdout.read().decode()
    err = stderr.read().decode()
    filtered = "\n".join(l for l in err.splitlines() if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out + filtered

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
print("[*] Connected")

# Find the actual admin.service.ts on the server
print("[*] Finding admin.service.ts on server...")
result = rs(client, "find /srv /home -name 'admin.service.ts' 2>/dev/null")
print(f"[*] Found: {result}")

# Also find the docker build context
result2 = rs(client, "find /srv /home -name 'Dockerfile' 2>/dev/null | head -5")
print(f"[*] Dockerfiles: {result2}")

# Find where docker image was built from
result3 = rs(client, "docker inspect pet-atlas-backend --format '{{json .Config.Labels}}' 2>/dev/null")
print(f"[*] Container labels: {result3}")

client.close()
