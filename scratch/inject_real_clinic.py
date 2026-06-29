import paramiko
import os

HOST = "91.99.108.165"
PORT = 2244
USER = "myuser"
PASS = "55431978531lA@A"
DB_ROOT = "pet_atlas_db_root_sec_pass_2026"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

print("[*] Injecting real clinic into database...")

insert_sql = """
INSERT INTO pet_atlas.listing_items 
(category_id, owner_id, title, description, price_range, address, contact_number, coordinates, listing_type, website_url, is_official, avg_stars) 
VALUES 
(1, 2, 'British Veterinary Hospital Dubai', 'Premium British veterinary care in the heart of Dubai. Full-service hospital for all pets.', '$$$', 'Al Wasl Road, Jumeirah 1, Dubai, UAE', '+971 4 328 3289', ST_GeomFromText('POINT(25.1873 55.2536)'), 'Clinic', 'https://www.britishvethospital.com', 1, 4.8);
"""

cmd = f"echo '{PASS}' | sudo -S docker exec pet-atlas-db mysql -u root -p{DB_ROOT} -e \"{insert_sql}\""
stdin, stdout, stderr = client.exec_command(cmd)
out = stdout.read().decode('utf-8', errors='ignore').strip()
err = stderr.read().decode('utf-8', errors='ignore').strip()

print("[+] Insert Result:")
print(out)
if err:
    print("Error:", err)

client.close()
