# Coffee Run

Coffee Run is a simple command-line application to manage coffee orders within a team, track expenses, and determine who should pay next for the coffee run.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before running the Coffee Run application, ensure you have [Node.js](https://nodejs.org/en/) installed on your system. This application was developed with Node.js version 18.19.1

### Installing

To set up the Coffee Run application you can utilize Node, or Docker.

1. **Clone the repository** (or download the source code):

    ```bash
    git clone https://github.com/your-username/coffee-run.git
    cd coffee-run
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

OR

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually installed with Docker)
3. **Edit Seed Data** (Optional):

    The `coffeeData.json` file contains seed data for coworkers and their coffee orders. You can modify this file as needed to reflect your team's information.

### Usage

To run the application, use the following command in the terminal:

For running with npm.
```bash
npm run dev
```

For installing and running with Docker:
```bash
docker compose build
```

```bash
docker compose run -it coffee-run
```

Follow the on-screen prompts to manage coffee orders and track who should pay next.

## Features

- **Manage Coffee Orders**: Add or update coffee orders for each team member.
- **Calculate Total Cost**: Automatically calculates the total cost for the current coffee run.
- **Determine Next Payer**: Keeps track of expenses and updates who should be paying for the next coffee run.

## Assumptions
- All five coworkers order their favorite beverage everyday without skipping a day.

## Tests

To ensure the Coffee Run application functions as expected, a suite of automated tests has been written. These tests cover the various functionalities of the application, including managing coffee orders, calculating costs, and determining the next payer.

### Running Tests

You can run the tests using the following command:

```bash
npm test
```
This command will execute all the tests and provide a report on their outcomes. The test suite will also automatically run via a github action when a pull request is created to ensure the tests pass before merging to the main branch.

## Authors

- **Mark Brooks** - [YourGitHub](https://github.com/brooksmarka)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
