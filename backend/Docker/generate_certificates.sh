openssl genrsa -out catmonit-CA.key 4096
openssl req -x509 -new -nodes -key catmonit-CA.key -sha256 -days 1825 -out catmonit-CA.pem

gen_cert() {
  NAME=$1
  SUBJECT=$2
  openssl genrsa -out ${NAME}.key 2048
  openssl req -new -key ${NAME}.key -out ${NAME}.csr -subj "/CN=${SUBJECT}.local"
  openssl x509 -req -in ${NAME}.csr -CA catmonit-CA.pem -CAkey catmonit-CA.key -CAcreateserial \
    -out ${NAME}.crt -days 825 -sha256
}

# Generate certs
gen_cert machines api-machines

#Copy machines.crt; move machines.key
cp machines.crt traefik/certs/
mv machines.key traefik/certs/

#Copy catmonit-CA.pem; move catmonit-CA.key
cp catmonit-CA.pem traefik/certs/
mv catmonit-CA.key traefik/certs/

# Move reamining certs to traefik/certs
mv *.crt *.key traefik/certs/