# variables.tf — Declaración de variables parametrizables para el despliegue IaC de UrbanFlow.
# Permite desplegar en múltiples entornos (dev, staging, prod) sin modificar main.tf.

variable "aws_region" {
  description = "Región AWS donde se despliegan los recursos de UrbanFlow"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Entorno de despliegue: dev | staging | prod"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "El entorno debe ser dev, staging o prod."
  }
}

variable "project_name" {
  description = "Nombre del proyecto usado como prefijo en los recursos cloud"
  type        = string
  default     = "urbanflow"
}
