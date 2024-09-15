#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import ejs from 'ejs';
const program = new Command();

// Function to handle pizza order and send it to API
async function orderPizza() {
  const questions = [
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
    {
      type: 'input',
      name: 'deliveryAddress',
      message: 'Enter your delivery address:',
    },
    {
        type: 'input',
        name: 'deliveryRoom',
        message: 'Enter your delivery room number:',
        validate: (input) => {
            const isValid = /^\d+$/.test(input);  // Check if the input contains only digits
            return isValid ? true : 'Please enter a valid room number (numbers only).';
        }
    },
    {
      type: 'input',
      name: 'creditCardNumber',
      message: 'Enter your credit card number:',
      validate: (input) => /^\d{16}$/.test(input) ? true : 'Invalid credit card number',
    },
    {
      type: 'input',
      name: 'expiryDate',
      message: 'Enter your card expiry date (MM/YY):',
      validate: (input) => /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(input) ? true : 'Invalid expiry date format',
    },
    {
      type: 'input',
      name: 'cvc',
      message: 'Enter your card CVC:',
      validate: (input) => /^\d{3}$/.test(input) ? true : 'Invalid CVC',
    },
  ];

  // Get user answers
  const answers = await inquirer.prompt(questions);

  create_tf_file(answers.firstName, answers.lastName, answers.email, answers.phoneNumber, answers.creditCardNumber, answers.creditCardCvv, answers.creditCardDate, answers.creditCardPostalCode, answers.street, answers.city, answers.region, answers.postalCode)

  // Send the data to the API
  const apiUrl = 'https://skip-the-walk.vercel.app/api/order'; // Replace with your Next.js API endpoint
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answers),
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


function create_tf_file(firstName, lastName, email, phoneNumber, creditCardNumber, creditCardCvv, creditCardDate, creditCardPostalCode, street, city, region, postalCode) {
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
  query_string = ["philly", "medium"]
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

// Parameters from your Node server
//   const parameters = {
//     firstName: "My",
//     lastName: "Name",
//     email: "my@name.com",
//     phoneNumber: "15555555555",
//     creditCardNumber: 123456789101112,
//     creditCardCvv: 1314,
//     creditCardDate: "15/16",
//     creditCardPostalCode: "18192",
//     street: "123 Main St",
//     city: "Anytown",
//     region: "WA",
//     postalCode: "02122"
//   };
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
    postalCode: postalCode
  };

// Replace placeholders with actual values
  const generatedTerraform = ejs.render(terraformTemplate, parameters);

// Write the generated content to a .tf file
  fs.writeFileSync('generated_terraform.tf', generatedTerraform);

  console.log('Terraform file generated successfully!');

// // Function to run shell commands
// const runCommand = (command, callback) => {
//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error: ${error.message}`);
//       return;
//     }
//     if (stderr) {
//       console.error(`stderr: ${stderr}`);
//       return;
//     }
//     console.log(`stdout: ${stdout}`);
//     if (callback) callback();
//   });
// };
//
// // Initialize Terraform (terraform init)
// runCommand('terraform init', () => {
//   // After terraform init, run terraform apply
//   runCommand('terraform apply -auto-approve', () => {
//     console.log('Terraform apply complete!');
//   });
// });
}
