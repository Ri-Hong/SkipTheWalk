#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import fs from 'fs';
import ejs from 'ejs';
const program = new Command();

// Path to the config file
const configFilePath = './config.json';

// Function to create the Terraform file with the gathered information
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
    pizzaDetails,
  };

  // Generate the Terraform file using ejs rendering (with unescaped strings for pizzaDetails)
  const generatedTerraform = ejs.render(terraformTemplate, parameters);

  // Write the generated content to a .tf file
  fs.writeFileSync('generated_terraform.tf', generatedTerraform);

  console.log('Terraform file generated successfully!');
}


// Function to handle pizza order and collect all necessary information
async function orderPizza() {
  let config = {};

  // Check if config file exists
  if (fs.existsSync(configFilePath)) {
    const configData = fs.readFileSync(configFilePath, 'utf-8');
    config = JSON.parse(configData);
    console.log('Using saved configuration from config.json');
  } else {
    console.log('No config file found. Please run `stw config` first.');
    return;
  }

  // Pizza-related questions only
  const pizzaQuestions = [
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
  ];

  // Ask for pizza details only
  const pizzaAnswers = await inquirer.prompt(pizzaQuestions);

  // Combine pizza details into a list of individual strings
  const pizzaDetails = [pizzaAnswers.type, pizzaAnswers.size, ...pizzaAnswers.toppings];

  // Add a timestamp to track the order time
  const orderTime = new Date().toISOString();

  // Prepare the payload to be sent to the API (ONLY the required attributes)
  const apiPayload = {
    type: pizzaAnswers.type,
    size: pizzaAnswers.size,
    toppings: pizzaAnswers.toppings,
    deliveryLocation: config.street, // Assuming the delivery location is the street from the config
    deliveryRoom: config.postalCode, // Assuming deliveryRoom is taken from the postal code, adjust as necessary
    orderTime: orderTime,
  };

  // Send the data to the API with the required fields only
  const apiUrl = `https://skip-the-walk.vercel.app/api/order`;
  try {
    console.log('Sending order details to API:', apiPayload); // Log the payload for debugging
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),  // Send only the required fields to the API
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

  // Call the function to create the Terraform file with the full config and pizza details
  create_tf_file(
    config.firstName,
    config.lastName,
    config.email,
    config.phoneNumber,
    config.creditCardNumber,
    config.creditCardCvv,
    config.creditCardDate,
    config.creditCardPostalCode,
    config.street,
    config.city,
    config.region,
    config.postalCode,
    pizzaDetails
  );
}

// Function to handle the configuration setup
async function setupConfig() {
  const configQuestions = [
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
    // Payment information
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
    },
  ];

  // Ask all the non-pizza-related questions and save the answers in a config file
  const answers = await inquirer.prompt(configQuestions);
  fs.writeFileSync(configFilePath, JSON.stringify(answers, null, 2));

  console.log('Configuration saved successfully!');
}

// Register the commands with Commander
program
  .command('order')
  .description('Order a pizza')
  .action(orderPizza);

program
  .command('config')
  .description('Set up your pizza ordering configuration')
  .action(setupConfig);

program.parse(process.argv);
