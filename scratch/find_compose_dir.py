import paramiko
import time

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"
DB_ROOT = "pet_atlas_db_root_sec_pass_2026"

def rs(client, cmd, timeout=120):
    stdin, stdout, stderr = client.exec_command(f"sudo -S bash -c {repr(cmd)}", timeout=timeout)
    stdin.write(PASS + "\n")
    stdin.flush()
    out = stdout.read().decode()
    err = stderr.read().decode()
    filtered_err = "\n".join(l for l in err.splitlines()
                             if "password" not in l.lower() and "[sudo]" not in l.lower())
    return out + filtered_err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
print("[*] Connected")

# Find docker-compose file location
print("[*] Finding project directory...")
result = rs(client, "find /srv -name 'docker-compose.yml' 2>/dev/null | head -3")
print(f"[*] docker-compose locations: {result}")

result2 = rs(client, "ls /srv/containers/ 2>/dev/null || ls /home/myuser/ 2>/dev/null | head -10")
print(f"[*] srv/containers: {result2}")

# Check where the backend source is on the server
result3 = rs(client, "docker inspect pet-atlas-backend --format '{{.Config.WorkingDir}} {{index .Config.Labels \"com.docker.compose.project.working_dir\"}}'")
print(f"[*] Backend working dir: {result3}")

result4 = rs(client, "docker inspect pet-atlas-backend --format '{{index .Config.Labels \"com.docker.compose.project.working_dir\"}}'")
compose_dir = result4.strip()
print(f"[*] Compose dir: {compose_dir}")

client.close()
