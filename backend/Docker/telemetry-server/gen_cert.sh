openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj "/CN=10.10.51.3"
openssl pkcs12 -export -out certs/server.pfx -inkey certs/server.key -in certs/server.crt
