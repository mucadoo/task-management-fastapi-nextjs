output "instance_public_ip" {
  value = aws_eip.app_eip.public_ip
}

output "private_key" {
  value     = tls_private_key.deployer_key.private_key_pem
  sensitive = true
}
