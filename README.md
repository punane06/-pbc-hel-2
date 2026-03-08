# Parental Benefit Calculator

A web application that calculates parental benefit payments based on a parent's gross monthly salary and the child's birth date.

The application provides a clear 12-month payment schedule, visualisation of payments and the ability to export the results as a PDF document.

This project was built as a simplified version of a parental benefit calculator similar to the systems maintained by the Estonian Social Insurance Board.

---

## Features

### Benefit calculation
- Calculates monthly parental benefit payments
- Applies salary cap of **€4000**
- Uses **daily rate calculation (salary ÷ 30)**

### Monthly payment schedule
- Displays a **12-month breakdown**
- Shows:
  - Month
  - Year
  - Paid days
  - Monthly payment

### Calculation summary
Provides a quick overview:

- Gross monthly salary
- Daily rate
- Salary cap applied (Yes / No)
- Total parental benefit

### Data persistence
Users can save calculation input and restore it later.

### PDF export
Users can download the benefit schedule as a **formatted PDF document**.

The PDF:
- follows the selected UI language
- includes formatted payment table
- includes total benefit amount

### Internationalisation
The UI supports two languages:

- English 🇬🇧
- Estonian 🇪🇪

Estonian terminology follows official style:

- Brutokuupalk
- Päevaraha
- Vanemahüvitise kogusumma
- Makstud päevad
- Väljamakse

### Data visualisation
A **bar chart** visualises monthly benefit payments.

### UX improvements

- Live calculation (results update automatically)
- Responsive layout
- Dark mode
- EU-style currency formatting (e.g. `2 933 €`)
- Calendar date picker for birth date input

---

## Tech Stack

### Backend

- Node.js
- Express
- SQLite
- PDFKit

### Frontend

- HTML
- Tailwind CSS
- Vanilla JavaScript
- Chart.js

---

## Project Structure

parental-benefit-calculator
│
├─ public
│ └─ index.html
│
├─ server.js
├─ database.js
├─ package.json
├─ README.md
└─ .gitignore

---

## Calculation Logic

1. The parental benefit equals the **gross monthly salary**.
2. A **salary cap of €4000** is applied.
3. The daily rate is calculated as:

daily rate = salary ÷ 30

4. Each month's payment is calculated:

monthly payment = daily rate × number of paid days

5. The first month is calculated from the **child's birth date until the end of that month**.

---

## Running the Project Locally

### 1 Install dependencies

npm install

### 2 Start the server

npm start

### 3 Open in browser

http://localhost:3000

---

## Example Workflow

1. Enter **gross monthly salary**
2. Select **child's birth date**
3. The calculator automatically displays:
   - payment schedule
   - calculation summary
   - payment chart
4. Optionally:
   - download PDF
   - save calculation

---

## Possible Improvements

With more time the following could be added:

- automated tests
- API validation
- Docker container for easy deployment
- better accessibility
- additional benefit rules

---

## Author

Project created as part of a technical coding task.
