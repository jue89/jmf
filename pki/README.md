# Public Key Infrastructure

The roles management of this application is done by X.509 certificates for server and client. Both must be singed by the same CA. Otherwise clients will be rejected. Clients are differentiated by the fingerprint of their certificates.

This project is shipped with a testing PKI. YOU NEVER SHOUL GO IN PRODUCTION WITH THIS SET OF CERTIFICATES AND KEYS!


## Creating a new CA

On the machine hosting the CA:
```
$ openssl req -new -x509 -keyout ca.key -out ca.crt -days 3650
```


## Creating certs for a new clients or servers

On the machine that is about to use the new key pair:

```
$ openssl genrsa -out client.key 2048
$ openssl req -new -key client.key -out client.csr
```

Transmit the generated CSR to the CA machine. Then:
```
$ openssl x509 -req -days 1095 -in client.csr -CA ca.crt -CAkey ca.key -out client.crt -set_serial 1
```

After transmitting back the CRT to the client's machine the crt and key is your brand new key pair! You might want to bundle them together to a PKCS#12 file:
```
$ openssl pkcs12 -export -out client.pfx -inkey client.key -in client.crt -certfile ca.crt
```

