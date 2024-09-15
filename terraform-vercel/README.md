# Configuring Environment Variables
```shell
export TF_VAR_vercel_token={vercel_token}
export TF_VAR_vercel_project_name={vercel_project_name}
export TF_VAR_github_repo={github_repo}
```
# Steps
```shell
terraform init

terraform fmt

terraform validate

terraform apply
```
If actions look fine, type `yes` to approve.