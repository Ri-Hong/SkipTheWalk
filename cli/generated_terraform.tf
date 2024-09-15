
terraform {
  required_providers {
    dominos = {
      source  = "MNThomson/dominos"
    }
  }
}

provider "dominos" {
  first_name    = "Ri"
  last_name     = "Hong"
  email_address = "riri.hong@gmail.c"
  phone_number  = "3123123123"

  credit_card = {
    number      = 1234211234123333
    cvv         = 333
    date        = "12/12"
    postal_code = Mwm 213
  }
}

data "dominos_address" "addr" {
  street      = "38 IDK"
  city        = "Toronto"
  region      = "Ontario"
  postal_code = "M9sadad"
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
