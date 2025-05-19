#!/usr/bin/env bash

#Load environment variables
set -a
source .env
set +a

#Check if certs directory exists and is empty
if [ -d "../traefik/certs" ] && [ -z "$(ls -A ../traefik/certs)" ]; then
    
    #Certificate Authority
    openssl genrsa -out catmonit-CA.key 4096
    openssl req -x509 -new -nodes -key catmonit-CA.key -sha256 -days 1825 -out catmonit-CA.pem \
      -subj "/C=US/ST=California/L=San Francisco/O=Catmonit/OU=IT/CN=Catmonit Root CA"

    gen_cert() {
      NAME=$1
      SUBJECT=$2
      openssl genrsa -out ${NAME}.key 2048
      openssl req -new -key ${NAME}.key -out ${NAME}.csr -subj "/CN=${SUBJECT}.local"
      openssl x509 -req -in ${NAME}.csr -CA catmonit-CA.pem -CAkey catmonit-CA.key -CAcreateserial \
        -out ${NAME}.crt -days 825 -sha256
    }

    # Generate certificates using values from .env
    gen_cert "$CERT_NAME" "$CERT_SUBJECT"

     # Copy/move cert files
    cp ${CERT_NAME}.crt ../traefik/certs/
    mv ${CERT_NAME}.key ../traefik/certs/
    cp catmonit-CA.pem ../traefik/certs/
    mv catmonit-CA.key ../traefik/certs/

    # Clean up temporary files
    rm ${CERT_NAME}.csr catmonit-CA.srl 2>/dev/null