provider "http" {}

provider "null" {}

# Step to deploy the Next.js app via Vercel's API, specifying the root directory
resource "null_resource" "vercel_deploy" {
  triggers = {
    deployment_time = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOT
      curl -X POST https://api.vercel.com/v13/deployments \
      -H "Authorization: Bearer ${var.vercel_token}" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "${var.vercel_project_name}",
        "github": {
          "repo": "${var.github_repo}",
          "branch": "${var.github_branch}"
        },
        "target": "production",
        "rootDirectory": "${var.subdirectory}"
      }'
    EOT
  }
}


# Example of environment variable setup in Vercel
resource "null_resource" "vercel_env_vars" {
  depends_on = [null_resource.vercel_deploy]

  provisioner "local-exec" {
    command = <<EOT
      curl -X POST https://api.vercel.com/v8/projects/${var.vercel_project_name}/env \
      -H "Authorization: Bearer ${var.vercel_token}" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "plain",
        "key": "NEXT_PUBLIC_API_URL",
        "value": "https://api.example.com",
        "target": ["production"]
      }'
    EOT
  }
}

# Outputs to confirm deployment success
output "vercel_project_url" {
  value = "https://${var.vercel_project_name}.vercel.app"
}
