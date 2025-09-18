resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${local.name_prefix}-oac"
  description                       = "OAC for frontend bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  count               = var.create_cloudfront ? 1 : 0
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = var.domain_name != "" ? [var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name] : []

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"

    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = true
      cookies { forward = "none" }
    }
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = var.domain_name != "" ? aws_acm_certificate.cf_cert[0].arn : null
    cloudfront_default_certificate = var.domain_name == ""
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = var.domain_name != "" ? "sni-only" : null
  }

  tags = local.tags
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

resource "aws_route53_zone" "zone" {
  count = var.create_route53_zone && var.domain_name != "" ? 1 : 0
  name  = var.domain_name
}

resource "aws_acm_certificate" "cf_cert" {
  count             = var.domain_name != "" ? 1 : 0
  provider          = aws.us_east_1
  domain_name       = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  validation_method = "DNS"
}

resource "aws_route53_record" "cert_validation" {
  count   = var.domain_name != "" && length(aws_route53_zone.zone) > 0 ? length(aws_acm_certificate.cf_cert[0].domain_validation_options) : 0
  name    = aws_acm_certificate.cf_cert[0].domain_validation_options[count.index].resource_record_name
  type    = aws_acm_certificate.cf_cert[0].domain_validation_options[count.index].resource_record_type
  zone_id = aws_route53_zone.zone[0].zone_id
  records = [aws_acm_certificate.cf_cert[0].domain_validation_options[count.index].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cf_cert_validation" {
  count                   = var.domain_name != "" && length(aws_route53_zone.zone) > 0 ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cf_cert[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

resource "aws_route53_record" "app_alias" {
  count   = var.domain_name != "" && length(aws_route53_zone.zone) > 0 ? 1 : 0
  name    = var.subdomain != "" ? var.subdomain : var.domain_name
  zone_id = aws_route53_zone.zone[0].zone_id
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn[0].domain_name
    zone_id                = aws_cloudfront_distribution.cdn[0].hosted_zone_id
    evaluate_target_health = false
  }
}
