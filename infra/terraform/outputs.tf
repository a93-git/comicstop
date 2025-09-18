output "vpc_id" {
  value = aws_vpc.main.id
}

output "alb_dns_name" {
  value = aws_lb.alb.dns_name
}

output "api_target_group_arn" {
  value = aws_lb_target_group.api_tg.arn
}

output "ec2_public_ip" {
  value = aws_instance.app.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.db.address
}

output "rds_connection_string" {
  value = var.rds_engine == "postgres" ? "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.db.address}:5432/${var.db_name}" : null
  sensitive = true
}

output "s3_frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

output "s3_uploads_bucket" {
  value = aws_s3_bucket.uploads.bucket
}

output "ec2_instance_role" {
  value = aws_iam_role.ec2_ssm_role.name
}

output "cloudfront_domain" {
  value = var.create_cloudfront ? aws_cloudfront_distribution.cdn.domain_name : null
}
