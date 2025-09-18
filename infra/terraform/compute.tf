data "aws_ami" "ubuntu_2204_arm" {
  count       = var.ec2_ami_id == "" && can(regex("^t4g|^c7g|^m7g|^r7g", var.ec2_instance_type)) ? 1 : 0
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-arm64-server-*"]
  }
}

locals {
  ami_id = var.ec2_ami_id != "" ? var.ec2_ami_id : (length(data.aws_ami.ubuntu_2204_arm) > 0 ? data.aws_ami.ubuntu_2204_arm[0].id : null)
}

resource "aws_iam_role" "ec2_ssm_role" {
  name               = "${local.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
  tags               = local.tags
}

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "uploads_rw" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.uploads.arn,
      "${aws_s3_bucket.uploads.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "uploads_rw" {
  name   = "${local.name_prefix}-uploads-rw"
  policy = data.aws_iam_policy_document.uploads_rw.json
}

resource "aws_iam_role_policy_attachment" "uploads_rw" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.uploads_rw.arn
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.name_prefix}-instance-profile"
  role = aws_iam_role.ec2_ssm_role.name
}

resource "aws_instance" "app" {
  ami                         = local.ami_id
  instance_type               = var.ec2_instance_type
  subnet_id                   = aws_subnet.public_a.id
  vpc_security_group_ids      = [aws_security_group.app_sg.id]
  associate_public_ip_address = true
  key_name                    = var.key_pair_name
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name

  user_data = <<-EOF
              #!/bin/bash
              set -e
              apt-get update -y
              # Install SSM agent (usually included), nginx, and Node.js 20
              apt-get install -y nginx curl
              curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
              apt-get install -y nodejs git

              ufw allow 'Nginx Full' || true

              # Reverse proxy nginx -> app on 3001
              cat > /etc/nginx/sites-available/comicstop <<NGINX
              server {
                listen 80 default_server;
                listen [::]:80 default_server;
                server_name _;
                location / {
                  proxy_pass http://127.0.0.1:3001;
                  proxy_set_header Host $host;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto $scheme;
                }
                location = /api/health {
                  proxy_pass http://127.0.0.1:3001/api/health;
                }
              }
              NGINX

              rm -f /etc/nginx/sites-enabled/default
              ln -sf /etc/nginx/sites-available/comicstop /etc/nginx/sites-enabled/comicstop
              systemctl enable nginx
              systemctl restart nginx

              # Placeholder app directory and service; replace with your deployment
              mkdir -p /var/www/comicstop
              cat > /var/www/comicstop/server.js <<APP
              const http = require('http');
              const port = 3001;
              const server = http.createServer((req, res) => { res.end('ComicStop API placeholder'); });
              server.listen(port, () => console.log('Server on', port));
              APP

              cat > /etc/systemd/system/comicstop.service <<SERVICE
              [Unit]
              Description=ComicStop Node.js API
              After=network.target

              [Service]
              ExecStart=/usr/bin/node /var/www/comicstop/server.js
              Restart=always
              User=root
              Environment=NODE_ENV=production

              [Install]
              WantedBy=multi-user.target
              SERVICE

              systemctl daemon-reload
              systemctl enable comicstop
              systemctl restart comicstop
              EOF

  tags = merge(local.tags, { Name = "${local.name_prefix}-api" })
}

resource "aws_lb" "alb" {
  name               = "${local.name_prefix}-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  security_groups    = [aws_security_group.alb_sg.id]
  idle_timeout       = 60
  tags               = local.tags
}

resource "aws_lb_target_group" "api_tg" {
  name        = "${local.name_prefix}-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"

  health_check {
    path                = var.api_health_check_path
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }
  tags = local.tags
}

resource "aws_lb_target_group_attachment" "api" {
  target_group_arn = aws_lb_target_group.api_tg.arn
  target_id        = aws_instance.app.id
  port             = 80
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "forward"
    forward {
      target_group {
        arn    = aws_lb_target_group.api_tg.arn
        weight = 1
      }
      stickiness {
        enabled  = false
        duration = 1
      }
    }
  }
}
