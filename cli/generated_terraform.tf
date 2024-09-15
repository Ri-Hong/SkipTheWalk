
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
  email_address = "riri.ong@df.com"
  phone_number  = "2131231233"

  credit_card = {
    number      = 1231231312333333
    cvv         = 333
    date        = "12/12"
    postal_code = "m"
  }
}

data "dominos_address" "addr" {
  street      = "s"
  city        = "w"
  region      = "w"
  postal_code = "w"
}

data "dominos_store" "store" {
  address_url_object = data.dominos_address.addr.url_object
}

data "dominos_menu_item" "item" {
  store_id     = data.dominos_store.store.store_id
  query_string = ["Margherita","Small"] // Pizza details as an array of strings
}

output "OrderOutput" {
  value = data.dominos_menu_item.item.matches[*]
}

resource "dominos_order" "order" {
  address_api_object = data.dominos_address.addr.api_object
  item_codes         = data.dominos_menu_item.item.matches[*].code
  store_id           = data.dominos_store.store.store_id
}
