# Define variables for Vercel API access and project details
variable "vercel_token" {
  description = "Vercel API token"
  type        = string
}

variable "vercel_project_name" {
  description = "Vercel project name"
  type        = string
}

variable "vercel_team_id" {
  description = "Optional: Vercel team ID"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repository to deploy (in format 'owner/repo')"
  type        = string
}

variable "github_branch" {
  description = "Branch to deploy from"
  type        = string
  default     = "main"
}

variable "subdirectory" {
  description = "Optional: Subdirectory to deploy"
  type        = string
  default     = "map"
}