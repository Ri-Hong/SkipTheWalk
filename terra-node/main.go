package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/schema"
	"github.com/hashicorp/terraform-plugin-sdk/v2/plugin"
)

type Order struct {
	ID     int         `json:"orderId"`
	Price  float64     `json:"price"`
	Detail interface{} `json:"order"`
}

func resourceOrder() *schema.Resource {
	return &schema.Resource{
		Create: resourceOrderCreate,
		Read:   resourceOrderRead,
		Update: resourceOrderUpdate,
		Delete: resourceOrderDelete,

		Schema: map[string]*schema.Schema{
			"id": {
				Type:     schema.TypeInt,
				Computed: true,
			},
			"pizza": {
				Type:     schema.TypeString,
				Required: true,
			},
			"price": {
				Type:     schema.TypeFloat,
				Computed: true,
			},
		},
	}
}

func resourceOrderCreate(d *schema.ResourceData, m interface{}) error {
	pizza := d.Get("pizza").(string)

	orderRequest := map[string]interface{}{
		"pizza": map[string]interface{}{
			"code": "16SCREEN",
			"options": map[string]interface{}{
				"C": map[string]string{"1/1": "1.5"},
				"P": map[string]string{"1/2": "1.5"},
			},
		},
	}

	body, _ := json.Marshal(orderRequest)
	resp, err := http.Post("http://localhost:3000/order", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var order Order
	if err := json.NewDecoder(resp.Body).Decode(&order); err != nil {
		return err
	}

	d.SetId(fmt.Sprintf("%d", order.ID))
	d.Set("price", order.Price)

	return resourceOrderRead(d, m)
}

func resourceOrderRead(d *schema.ResourceData, m interface{}) error {
	id := d.Id()

	resp, err := http.Get(fmt.Sprintf("http://localhost:3000/order/%s", id))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		d.SetId("")
		return nil
	}

	var order Order
	if err := json.NewDecoder(resp.Body).Decode(&order); err != nil {
		return err
	}

	d.Set("price", order.Price)
	return nil
}

func resourceOrderUpdate(d *schema.ResourceData, m interface{}) error {
	id := d.Id()
	pizza := d.Get("pizza").(string)

	orderRequest := map[string]interface{}{
		"pizza": pizza,
	}

	body, _ := json.Marshal(orderRequest)
	req, err := http.NewRequest(http.MethodPut, fmt.Sprintf("http://localhost:3000/order/%s", id), bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return resourceOrderRead(d, m)
}

func resourceOrderDelete(d *schema.ResourceData, m interface{}) error {
	id := d.Id()

	req, err := http.NewRequest(http.MethodDelete, fmt.Sprintf("http://localhost:3000/order/%s", id), nil)
	if err != nil {
		return err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	d.SetId("")
	return nil
}

func main() {
	plugin.Serve(&plugin.ServeOpts{
		ProviderFunc: func() *schema.Provider {
			return &schema.Provider{
				ResourcesMap: map[string]*schema.Resource{
					"nodejs_order": resourceOrder(),
				},
			}
		},
	})
}
