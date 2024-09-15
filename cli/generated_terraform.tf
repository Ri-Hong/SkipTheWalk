
terraform {
  required_providers {
    dominos = {
      source  = "MNThomson/dominos"
    }
  }
}

provider "dominos" {
  first_name    = "r"
  last_name     = "r"
  email_address = "rr@r.com"
  phone_number  = "213123123123"

  credit_card = {
    number      = 1231231231231233
    cvv         = 123
    date        = "12/12"
    postal_code = "13"
  }
}

data "dominos_address" "addr" {
  street      = "dsf"
  city        = "fd"
  region      = "f"
  postal_code = "f"
}

data "dominos_store" "store" {
  address_url_object = data.dominos_address.addr.url_object
}

data "dominos_menu_item" "item" {
  store_id     = data.dominos_store.store.store_id
  query_string = ["Margherita","Small","Mushrooms"] // Pizza details as an array of strings
}

output "OrderOutput" {
  value = data.dominos_menu_item.item.matches[*]
}

resource "dominos_order" "order" {
  address_api_object = data.dominos_address.addr.api_object
  item_codes         = data.dominos_menu_item.item.matches[*].code
  store_id           = data.dominos_store.store.store_id
}
