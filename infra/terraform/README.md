# ComicStop AWS Infra (Terraform)

This Terraform stack provisions a low-cost, secure baseline for deploying ComicStop without Docker:
- VPC with public subnets (ALB + EC2) and private subnets (RDS)
- EC2 instance (Node.js app on port 3000) behind an Application Load Balancer (HTTP by default)
- RDS (PostgreSQL by default) in private subnets
- S3 bucket + CloudFront for the static frontend (Vite build)
- IAM + SSM instance profile for EC2 management
- Optional Route53 zone and ACM certificate for a custom domain

Notes:
- To minimize cost, there is no NAT gateway. Private subnets are isolated (good for RDS). The EC2 is in a public subnet, behind ALB. For tighter security, you can move EC2 to a private subnet and add a NAT or VPC endpoints.
- Listeners are HTTP-only for the ALB; terminate TLS at CloudFront for the frontend, and add an ACM cert + HTTPS listener to ALB for the API when ready.

## Inputs
Key variables (see `variables.tf`):
- `project` (default "comicstop"), `environment` (default "prod"), `aws_region` (default `us-east-1`)
- `ec2_instance_type` (default `t4g.small`), `ec2_ami_id` (optional; defaults to Ubuntu 22.04 ARM64 for Graviton types)
- `key_pair_name` (required) — existing EC2 key pair for SSH
- `db_name`, `db_username`, `db_password` (required)
- `domain_name` (optional) + `subdomain` (default `app`) to enable Route53 + ACM + CloudFront alias

## Usage
Initialize and apply:

```bash
cd infra/terraform
terraform init
terraform plan \
  -var "key_pair_name=YOUR_KEYPAIR" \
  -var "db_password=CHANGE_ME_STRONG"
terraform apply \
  -var "key_pair_name=YOUR_KEYPAIR" \
  -var "db_password=CHANGE_ME_STRONG"
```

After apply, outputs include:
- `alb_dns_name` for the API
- `cloudfront_domain` for the frontend
- `rds_connection_string` for database connectivity

## Deploying the app (no Docker)
1. Build the frontend locally and upload to S3 (or wire CI to do this):
   ```bash
   cd frontend
   npm ci && npm run build
   aws s3 sync dist s3://$(terraform -chdir=infra/terraform output -raw s3_frontend_bucket) --delete
   ```
   CloudFront will serve it. Optionally invalidate cache:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id $(terraform -chdir=infra/terraform output -raw cloudfront_domain | awk -F. '{print $1}') \
     --paths "/*"
   ```

2. Deploy the backend to EC2:
   - SSH to the instance (see `ec2_public_ip` output) or use SSM Session Manager.
   - Install Node.js 20 if not present.
   - Copy the backend and comments-service directories (e.g., via `scp` or git pull).
   - Create systemd services for each (example provided in `user_data` creates a placeholder; replace with your app start commands, e.g. `npm ci && npm run start`).
   - Configure environment variables in `/etc/systemd/system/comicstop.service` using `Environment=` lines or an env file:
     - API envs: DB connection vars (from RDS outputs), JWT secrets, S3 buckets (if you store uploads in S3), email settings (e.g., SES), CORS origins (CloudFront domain).

3. Point the frontend to the API:
   - Ensure the frontend `src/config.js` base URL points to the ALB DNS (or your domain) for API requests.
   - Rebuild and re-upload the frontend if you change config.

## Security and scaling
- Start with t4g.small EC2 and db.t4g.micro RDS to keep cost low; scale up vertically or add ASG in front of multiple instances later.
- Lock down SSH: set `allowed_cidr_ssh` to your IP, or disable and use SSM only.
- Add HTTPS to ALB by provisioning an ACM cert in the same region and adding an HTTPS listener; then redirect HTTP->HTTPS.
- Set up backups and monitoring: RDS 7-day backups are enabled; consider CloudWatch Alarms for CPU, 5xx on ALB, and database connections.

## Cleanup
Destroy resources when done:
```bash
terraform destroy
```
