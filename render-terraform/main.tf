terraform {
  required_providers {
    render = {
      source = "render-oss/render"
      version = "1.1.0"
    }
  }
}

provider "render" {
  api_key=var.api_key
  owner_id=var.owner_id
}

resource "render_web_service" "web" {
  name               = "mappedit"
  plan               = "starter"
  region             = "ohio"
  start_command      = "npm run dev"
  pre_deploy_command = "echo 'hello world'"

  runtime_source = {
    native_runtime = {
      auto_deploy   = true
      branch        = "main"
      build_command = "npm install"
      build_filter = {
        paths         = ["src/map/**"]
        ignored_paths = ["tests/**"]
      }
      repo_url = "https://github.com/Ri-Hong/SkipTheWalk"
      runtime  = "node"
    }
  }

#   disk = {
#     name       = "some-disk"
#     size_gb    = 1
#     mount_path = "/data"
#   }

#   env_vars = {
#     "key1" = { value = "val1" },
#     "key2" = { value = "val2" },
#   }
#   secret_files = {
#     "file1" = { content = "content1" },
#     "file2" = { content = "content2" },
#   }
#   custom_domains = [
#     { name : "terraform-provider-1.example.com" },
#     { name : "terraform-provider-2.example.com" },
#   ]

  notification_override = {
    preview_notifications_enabled = "false"
    notifications_to_send         = "failure"
  }
}