# Coffee Run

Coffee Run is a simple command-line application to manage coffee orders within a team, track expenses, and determine who should pay next for the coffee run.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before running the Coffee Run application, ensure you have [Node.js](https://nodejs.org/en/) (version 18.19.1) or [Docker](https://www.docker.com/get-started) installed on your computer.

### Installing

Edit Seed Data (Optional):

The src/data/coffeeData.json file contains seed data for coworkers and their coffee orders. You can add more teammates or modify the name, coffee and amount in this file as needed to reflect your team's information.

Option 1: Using Node
1. **Clone the repository** (or download the source code):

    ```bash
    git clone https://github.com/your-username/coffee-run.git
    cd coffee-run
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

Option 2: Using Docker
1. **Clone the repository** (or download the source code):

    ```bash
    git clone https://github.com/your-username/coffee-run.git
    cd coffee-run
    ```

2. **Download Docker**
* [Docker](https://www.docker.com/get-started) - Make sure Docker Compose is included

### Usage

To run the application, use the following command in the terminal:

For running with npm.
```bash
npm run dev
```

For installing and running with Docker:

```bash
docker compose run coffee
```

Follow the on-screen prompts to manage coffee orders and track who should pay next.

## Features

- **Manage Coffee Orders**: Add or update coffee orders for each team member.
- **Calculate Total Cost**: Automatically calculates the total cost for the current coffee run.
- **Determine Next Payer**: Keeps track of expenses and updates who should be paying for the next coffee run.

## Assumptions
- All five coworkers order their favorite beverage everyday without skipping a day.
- You will not be able to add a coworker to the order while the program is running.  This must be done by stopping the program and editing the seed data in `src/data/coffeeData.json`.
-

## Tests

To ensure the Coffee Run application functions as expected, a suite of automated tests has been written. These tests cover the various functionalities of the application, including managing coffee orders, calculating costs, and determining the next payer.

### Running Tests

If you are using Docker the tests run automatically before the application is built.  If you are using npm you can run the tests using the following command:

```bash
npm test
```
This command will execute all the tests and provide a report on their outcomes. The test suite will also automatically run via a github action when a pull request is created to ensure the tests pass before merging to the main branch.

## Authors

- **Mark Brooks** - [GitHub](https://github.com/brooksmarka)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
