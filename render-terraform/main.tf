provider "http" {
  # Configure your Render API endpoint
  endpoint = "https://api.render.com/v1"
  headers = {
    Authorization = "Bearer ${var.api_key}"
    Content-Type  = "application/json"
  }
}

resource "http_request" "create_service" {
  url    = "https://api.render.com/v1/services"
  method = "POST"
  headers = {
    Authorization = "Bearer ${var.api_key}"
    Content-Type  = "application/json"
  }
  body = jsonencode({
    service = {
      name = "mappedit"
      type = "web"
      env  = "docker"
      docker = {
        image = var.docker_image_name
        build = {
          dockerfile = "Dockerfile"
        }
      }
      plan       = var.plan
      region     = "ohio"
      network    = "default"
      autoDeploy = true
    }
  })

  lifecycle {
    ignore_changes = [
      body,
    ]
  }
}

output "service_id" {
  value = jsondecode(http_request.create_service.response_body)["id"]
}
