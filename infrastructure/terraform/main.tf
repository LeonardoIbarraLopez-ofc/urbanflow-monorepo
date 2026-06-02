# main.tf — Infraestructura como Código (IaC) principal de UrbanFlow.
# Define los recursos cloud necesarios para producción.
# En desarrollo usar Docker Compose local; este archivo aplica para el entorno productivo.

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Backend remoto para estado compartido del equipo
  backend "s3" {
    bucket = "urbanflow-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 bucket para el Data Lake de analítica histórica (10 años de datos de movilidad)
resource "aws_s3_bucket" "datalake" {
  bucket = "urbanflow-datalake-${var.environment}"

  tags = {
    Project     = "UrbanFlow"
    Environment = var.environment
    Purpose     = "Analytics Data Lake - Parquet Files"
  }
}

resource "aws_s3_bucket_versioning" "datalake" {
  bucket = aws_s3_bucket.datalake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Política de ciclo de vida: mover a Glacier datos con más de 1 año
resource "aws_s3_bucket_lifecycle_configuration" "datalake" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    id     = "archive-old-data"
    status = "Enabled"

    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
}
