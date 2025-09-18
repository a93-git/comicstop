# Core resources are declared across *.tf files in this folder.

# Optionally, upload local frontend build artifacts to the S3 bucket.
# This uses a wildcard object sync for index.html and assets if they exist.
locals {
  frontend_dir = var.frontend_build_path
}

resource "aws_s3_object" "frontend_index" {
  count  = fileexists("${local.frontend_dir}/index.html") ? 1 : 0
  bucket = aws_s3_bucket.frontend.id
  key    = "index.html"
  source = "${local.frontend_dir}/index.html"
  etag   = filemd5("${local.frontend_dir}/index.html")
  content_type = "text/html"
}

resource "aws_s3_object" "frontend_assets" {
  for_each    = fileset(local.frontend_dir, "assets/*")
  bucket      = aws_s3_bucket.frontend.id
  key         = each.value
  source      = "${local.frontend_dir}/${each.value}"
  etag        = filemd5("${local.frontend_dir}/${each.value}")
  content_type = lookup({
    css = "text/css",
    js  = "application/javascript",
    svg = "image/svg+xml",
    png = "image/png",
    jpg = "image/jpeg",
    jpeg = "image/jpeg",
    webp = "image/webp"
  }, regex("[^.]+$", each.value), "application/octet-stream")
}
