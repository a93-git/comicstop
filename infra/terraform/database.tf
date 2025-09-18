resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnets"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  tags       = local.tags
}

resource "aws_db_parameter_group" "pg" {
  name        = "${local.name_prefix}-pg"
  family      = var.rds_engine == "postgres" ? "postgres15" : "default.mysql8.0"
  description = "${local.name_prefix} parameter group"
  tags        = local.tags
}

resource "aws_db_instance" "db" {
  identifier              = "${var.project}-${var.environment}"
  engine                  = var.rds_engine
  engine_version          = var.rds_engine == "postgres" ? "15.6" : null
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_storage_gb
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  username                = var.db_username
  password                = var.db_password
  db_name                 = var.db_name
  publicly_accessible     = false
  multi_az                = false
  storage_encrypted       = true
  backup_retention_period = 7
  skip_final_snapshot     = true
  parameter_group_name    = aws_db_parameter_group.pg.name
  delete_automated_backups = true
  tags                    = local.tags
}
