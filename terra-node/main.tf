terraform {
  required_providers {
    nodejs = {
      source  = "local/nodejs"
      version = "1.0.0"  # or whatever version you’ve set
    }
  }
}

provider "nodejs" {}

resource "nodejs_order" "pizza_order" {
  pizza = "double_cheese_pepperoni"
}

output "pizza_order_price" {
  value = nodejs_order.pizza_order.price
}
