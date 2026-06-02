# outputs.tf — Valores de salida del stack Terraform de UrbanFlow.
# Expone los ARNs y URLs de los recursos creados para consumo de otros módulos o scripts de CI/CD.

output "datalake_bucket_name" {
  description = "Nombre del bucket S3 que sirve como Data Lake de analítica histórica"
  value       = aws_s3_bucket.datalake.bucket
}

output "datalake_bucket_arn" {
  description = "ARN del bucket S3 del Data Lake"
  value       = aws_s3_bucket.datalake.arn
}

output "datalake_bucket_region" {
  description = "Región del bucket S3 del Data Lake"
  value       = aws_s3_bucket.datalake.region
}
