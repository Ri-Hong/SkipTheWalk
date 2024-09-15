
terraform {
  required_providers {
    dominos = {
      source  = "MNThomson/dominos"
    }
  }
}

provider "dominos" {
  first_name    = "e"
  last_name     = "e"
  email_address = "e@e.com"
  phone_number  = "1231231233"

  credit_card = {
    number      = 3123123123213333
    cvv         = 333
    date        = "12/12"
    postal_code = "123"
  }
}

data "dominos_address" "addr" {
  street      = "3"
  city        = "3"
  region      = "3"
  postal_code = "3"
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
