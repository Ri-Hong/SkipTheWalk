# SkipTheWalk
## Inspiration
Old school bosses don't want want to see you slacking off and always expect you to be all movie hacker in the terminal 24/7. As professional slackers, we also need our fair share of coffee and snacks. We initially wanted to create a terminal app to order Starbucks and deliver it to the E7 front desk. Then bribe a volunteer to bring it up using directions from Mappedin. It turned out that it's quite hard to reverse engineer Starbucks. Thus, we tried UberEats, which was even worse. After exploring bubble tea, cafes, and even Lazeez, we decided to order pizza instead. Because if we're suffering, might as well suffer in a food coma.

## What it does
Skip the Walk brings food right to your table with the help of volunteers. In exchange for not taking a single step, volunteers are paid in what we like to call bribes. These can be the swag hackers received, food, money, 

## How we built it
We used commander.js to create the command-line interface, Next.js to run MappedIn, and Vercel to host our API endpoints and frontend. We integrated a few Slack APIs to create the Slack bot. To actually order the pizzas, we employed Terraform.

## Challenges we ran into
Our initial idea was to order coffee through a command line, but we soon realized there weren’t suitable APIs for that. When we tried manually sending POST requests to Starbucks’ website, we ran into reCaptcha issues. After examining many companies’ websites and nearly ordering three pizzas from Domino’s by accident, we found ourselves back at square one—three times. By the time we settled on our final project, we had only nine hours left.

## Accomplishments that we're proud of
Despite these challenges, we’re proud that we managed to get a proof of concept up and running with a CLI, backend API, frontend map, and a Slack bot in less than nine hours. This achievement highlights our ability to adapt quickly and work efficiently under pressure.

## What we learned
Through this experience, we learned that planning is crucial, especially when working within the tight timeframe of a hackathon. Flexibility and quick decision-making are essential when initial plans don’t work out, and being able to pivot effectively can make all the difference.

## Terraform
We used Terraform this weekend for ordering Domino's. We had many close calls and actually did accidentally order once, but luckily we got that cancelled. We created a Node.JS app that we created Terraform files for to run. We also used Terraform to order Domino's using template .tf files. Finally, we used TF to deploy our map on Render. We always thought it funny to use infrastructure as code to do something other than pure infrastructure. Gotta eat too!

## What's next for Skip the Walk
We plan to enhance the CLI features by adding options such as reordering, randomizing orders, and providing tips for volunteers. These improvements aim to enrich the user experience and make the platform more engaging for both hackers and volunteers.


Utilizes [Domino's API](https://github.com/RIAEvangelist/node-dominos-pizza-api) and [Domino's TF](https://github.com/nat-henderson/terraform-provider-dominos), some for reference, some for package
 
