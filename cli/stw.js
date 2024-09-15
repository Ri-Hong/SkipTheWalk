#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import fs from 'fs';
import ejs from 'ejs';
const program = new Command();

// Function to handle pizza order and collect all necessary information
async function orderPizza() {
  const questions = [
    // Pizza information prompts
    {
      type: 'list',
      name: 'type',
      message: 'Choose your pizza type:',
      choices: ['Margherita', 'Pepperoni', 'BBQ Chicken', 'Vegetarian', 'Hawaiian'],
    },
    {
      type: 'list',
      name: 'size',
      message: 'Choose your pizza size:',
      choices: ['Small', 'Medium', 'Large'],
    },
    {
      type: 'checkbox',
      name: 'toppings',
      message: 'Choose your toppings:',
      choices: ['Mushrooms', 'Onions', 'Sausage', 'Bacon', 'Extra Cheese', 'Peppers', 'Olives'],
    },
    // Customer information prompts
    {
      type: 'input',
      name: 'firstName',
      message: 'Enter your first name:',
      validate: (input) => input ? true : 'First name is required',
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Enter your last name:',
      validate: (input) => input ? true : 'Last name is required',
    },
    {
      type: 'input',
      name: 'email',
      message: 'Enter your email:',
      validate: (input) => /\S+@\S+\.\S+/.test(input) ? true : 'Invalid email format',
    },
    {
      type: 'input',
      name: 'phoneNumber',
      message: 'Enter your phone number:',
      validate: (input) => /^\d{10,15}$/.test(input) ? true : 'Phone number must contain only digits and be 10-15 digits long',
    },
    // Address information prompts
    {
      type: 'input',
      name: 'street',
      message: 'Enter your street address:',
      validate: (input) => input ? true : 'Street address is required',
    },
    {
      type: 'input',
      name: 'city',
      message: 'Enter your city:',
      validate: (input) => input ? true : 'City is required',
    },
    {
      type: 'input',
      name: 'region',
      message: 'Enter your region/state:',
      validate: (input) => input ? true : 'Region/state is required',
    },
    {
      type: 'input',
      name: 'postalCode',
      message: 'Enter your postal code:',
      validate: (input) => input ? true : 'Postal code is required',
    },
    // Payment information prompts
    {
      type: 'input',
      name: 'creditCardNumber',
      message: 'Enter your credit card number:',
      validate: (input) => /^\d{16}$/.test(input) ? true : 'Invalid credit card number',
    },
    {
      type: 'input',
      name: 'creditCardCvv',
      message: 'Enter your credit card CVV:',
      validate: (input) => /^\d{3}$/.test(input) ? true : 'Invalid CVV number',
    },
    {
      type: 'input',
      name: 'creditCardDate',
      message: 'Enter your card expiry date (MM/YY):',
      validate: (input) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(input) ? true : 'Invalid expiry date format',
    },
    {
      type: 'input',
      name: 'creditCardPostalCode',
      message: 'Enter your credit card postal code:',
      validate: (input) => input ? true : 'Postal code is required',
    }
  ];

  // Get user answers
  const answers = await inquirer.prompt(questions);

  // Combine pizza details into a list of individual strings
  const pizzaDetails = [answers.type, answers.size, ...answers.toppings];

  // Add a timestamp to track the order time
  const orderTime = new Date().toISOString();

  // Call the function to create the Terraform file with the gathered information (excluding order time)
  create_tf_file(
    answers.firstName,
    answers.lastName,
    answers.email,
    answers.phoneNumber,
    answers.creditCardNumber,
    answers.creditCardCvv,
    answers.creditCardDate,
    answers.creditCardPostalCode,
    answers.street,
    answers.city,
    answers.region,
    answers.postalCode,
    pizzaDetails
  );

  // Send the data to the API with pizza information and orderTime included
  const apiUrl = `https://skip-the-walk.vercel.app/api/order`;
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...answers, pizzaDetails, orderTime }),  // Include orderTime in the API request
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Order placed successfully:', data);
    } else {
      console.error('Failed to place order:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

program
  .command('order')
  .description('Order a pizza')
  .action(orderPizza);

program.parse(process.argv);

// Function to create the Terraform file with the gathered information (excluding orderTime)
function create_tf_file(
  firstName,
  lastName,
  email,
  phoneNumber,
  creditCardNumber,
  creditCardCvv,
  creditCardDate,
  creditCardPostalCode,
  street,
  city,
  region,
  postalCode,
  pizzaDetails
) {
  // Define the Terraform template with placeholders
  const terraformTemplate = `
terraform {
  required_providers {
    dominos = {
      source  = "MNThomson/dominos"
    }
  }
}

provider "dominos" {
  first_name    = "<%= firstName %>"
  last_name     = "<%= lastName %>"
  email_address = "<%= email %>"
  phone_number  = "<%= phoneNumber %>"

  credit_card = {
    number      = <%= creditCardNumber %>
    cvv         = <%= creditCardCvv %>
    date        = "<%= creditCardDate %>"
    postal_code = "<%= creditCardPostalCode %>"
  }
}

data "dominos_address" "addr" {
  street      = "<%= street %>"
  city        = "<%= city %>"
  region      = "<%= region %>"
  postal_code = "<%= postalCode %>"
}

data "dominos_store" "store" {
  address_url_object = data.dominos_address.addr.url_object
}

data "dominos_menu_item" "item" {
  store_id     = data.dominos_store.store.store_id
  query_string = <%- JSON.stringify(pizzaDetails) %> // Pizza details as an array of strings
}

output "OrderOutput" {
  value = data.dominos_menu_item.item.matches[*]
}

resource "dominos_order" "order" {
  address_api_object = data.dominos_address.addr.api_object
  item_codes         = data.dominos_menu_item.item.matches[*].code
  store_id           = data.dominos_store.store.store_id
}
`;

  // Replace placeholders with actual values
  const parameters = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
    creditCardNumber: creditCardNumber,
    creditCardCvv: creditCardCvv,
    creditCardDate: creditCardDate,
    creditCardPostalCode: creditCardPostalCode,
    street: street,
    city: city,
    region: region,
    postalCode: postalCode,
    pizzaDetails: pizzaDetails
  };

  // Generate the Terraform file using ejs rendering (with unescaped strings for pizzaDetails)
  const generatedTerraform = ejs.render(terraformTemplate, parameters);

  // Write the generated content to a .tf file
  fs.writeFileSync('generated_terraform.tf', generatedTerraform);

  console.log('Terraform file generated successfully!');
}
