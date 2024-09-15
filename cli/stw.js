#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const fetch = require('node-fetch'); // If you're using Node.js older than v18

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
      name: 'deliveryLocation',
      message: 'Enter your delivery address:',
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

  // Send the data to the API
  const apiUrl = 'https://example.com/api/order'; // Replace with your Next.js API endpoint
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
