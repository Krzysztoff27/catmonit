#!/usr/bin/env bash

###############################
#      root rights check
###############################
#Test to ensure that script is executed with root priviliges
if ((EUID != 0)); then
    printf 'Insufficient priviliges! Please run the script with root rights.\n'
    exit
fi

#Load environment variables
set -a
source .env
set +a

#Check if certs directory exists and is empty
if [ ! -f ./traefik/certs/catmonit-CA.pem ]; then
    printf 'No CA present inside the ./traefik/certs directory.\nCreating new certificates.'

    mkdir -p ./traefik/certs

    #Certificate Authority
     if ! openssl genrsa -out catmonit-CA.key 4096; then
        printf "Failed to generate CA private key."
        exit 1
    fi

     if ! openssl req -x509 -new -nodes -key catmonit-CA.key -sha256 -days 1825 -out catmonit-CA.pem \
        -subj "/C=US/ST=California/L=San Francisco/O=Catmonit/OU=IT/CN=Catmonit Root CA" >/dev/null 2>&1; then
        printf "Failed to create CA certificate."
        exit 1
    fi

    gen_cert() {
      NAME=$1
      SUBJECT=$2
      openssl genrsa -out ${NAME}.key 2048
      openssl req -new -key ${NAME}.key -out ${NAME}.csr -subj "/CN=${SUBJECT}.local"
      openssl x509 -req -in ${NAME}.csr -CA catmonit-CA.pem -CAkey catmonit-CA.key -CAcreateserial \
        -out ${NAME}.crt -days 825 -sha256
    }

    # Generate certificates using values from .env
    if ! gen_cert "$CERT_NAME" "$CERT_SUBJECT"; then
        printf "Failed to generate server certificates."
        exit 1
    fi

     # Copy/move cert files
    cp ${CERT_NAME}.crt ./traefik/certs/
    mv ${CERT_NAME}.key ./traefik/certs/
    cp catmonit-CA.pem ./traefik/certs/
    mv catmonit-CA.key ./traefik/certs/

    # Clean up temporary files
    rm ${CERT_NAME}.csr catmonit-CA.srl >/dev/null 2>&1

    printf "Certificates created successfully."
else
    printf 'CA present inside the ./traefik/certs directory.\nSkipping creation.'
fi

echo "Starting Docker Compose..."
docker compose up -d