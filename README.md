# alfredo

### Budget control using python and nodeJS.
- It automates bank and ticket transactions report reading
- Converts original reports in JSON structured data
- Organizes the expenses in categories based on transaction description regex
- Uses a configurable `src/config/budget.json` file to set the budget and description regex for each category. Use `src/config/budget-example.json` file as an example to create your original one
- Builds an expenses report with budget control

### How to use
### Web mode
1. Run `node node src/node/server.js`
2. The app will start in the port 3000
#### Headless mode
1. Create a file `src/config/config.json` and set your credentials on it. Use `src/config/config-example.json` file as an example to create your original one
2. run `sh run.sh` program.
3. Budget report will be printed in the console

