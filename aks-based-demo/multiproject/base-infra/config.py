from pulumi import Config
from pulumi_random import RandomPassword
from pulumi_tls import PrivateKey


config = Config()

app_name = config.get("appName") or "contoso-ship-manager"

base_name = config.get("baseName") or "baseinfra"

k8s_version = config.get('k8sVersion') or '1.24.3'

password = config.get_secret('password') or RandomPassword('pw',
    length=20, special=True)

generated_key_pair = PrivateKey('ssh-key',
    algorithm='RSA', rsa_bits=4096)

admin_username = config.get('adminUserName') or 'testuser'

ssh_public_key = config.get('sshPublicKey') or \
    generated_key_pair.public_key_openssh

node_count = config.get_int('nodeCount') or 3

node_size = config.get('nodeSize') or 'Standard_B2s'
