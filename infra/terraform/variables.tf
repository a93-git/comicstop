variable "project" {
  description = "Project name prefix for resource tags and names"
  type        = string
  default     = "comicstop"
}

variable "environment" {
  description = "Environment name (dev|staging|prod)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Root domain name (e.g., example.com). If set, Route53 and ACM certs will be created and CloudFront will use it."
  type        = string
  default     = ""
}

variable "subdomain" {
  description = "Subdomain for the app (e.g., app). If empty, root domain will be used."
  type        = string
  default     = "app"
}

variable "create_route53_zone" {
  description = "Whether to create a Route53 hosted zone for the domain_name. Set false if domain is managed elsewhere but in Route53 account already."
  type        = bool
  default     = false
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the API server"
  type        = string
  default     = "t4g.small" # low-cost ARM Graviton. Use t3.small if not ARM compatible
}

variable "ec2_ami_id" {
  description = "AMI ID for the EC2 instance (Ubuntu 22.04 ARM64 recommended for t4g.*). Leave empty to use latest Canonical Ubuntu 22.04 LTS ARM64."
  type        = string
  default     = ""
}

variable "key_pair_name" {
  description = "Existing EC2 key pair name for SSH access"
  type        = string
}

variable "enable_bastion" {
  description = "Create a small bastion host for SSH and SSM access into private subnets"
  type        = bool
  default     = false
}

variable "rds_engine" {
  description = "RDS engine"
  type        = string
  default     = "postgres"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_storage_gb" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "comicstop"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "comicstop"
}

variable "db_password" {
  description = "Database master password (use SSM or Terraform Cloud variables in real setups)"
  type        = string
  sensitive   = true
}

variable "allowed_cidr_ssh" {
  description = "CIDR block allowed to SSH to bastion or instance (use your IP)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "api_health_check_path" {
  description = "Path for the ALB health check to the API"
  type        = string
  default     = "/api/health"
}

variable "create_cloudfront" {
  description = "Create CloudFront distribution for S3-hosted frontend"
  type        = bool
  default     = true
}

variable "frontend_build_path" {
  description = "Local relative path to frontend dist for aws_s3_object uploads (optional, can be uploaded manually or via CI)."
  type        = string
  default     = "../../frontend/dist"
}
