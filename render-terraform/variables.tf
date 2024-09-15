variable "api_key" {
  description = "API key for Render"
  type        = string
}

variable "owner_id" {
  description = "Owner ID for Render"
  type        = string
}

variable "docker_image_name" {
  description = "Docker image name"
  type        = string
  default     = "jamesliangg/htn2024:latest"
}

variable "plan" {
  description = "Render service plan"
  type        = string
  default     = "starter"
}
