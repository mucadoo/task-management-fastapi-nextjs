variable "key_name" {
  type        = string
  default     = "task-manager-deploy-key"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}
