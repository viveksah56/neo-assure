# Neo Assure

This project is a working invoice implementation built to demonstrate a realistic billing workflow in a clean, modern interface. It focuses on invoice line-item management, tax calculations, and summary reporting using a front-end dashboard style experience.

## About this README

This README highlights the core technologies used in the project and explains what has been implemented so far. It also documents the UX choices that make the invoice experience easier to use for quick data entry and review.

## Working invoice implementation

The application includes a functional invoice dashboard with:
- invoice header details and date inputs
- a multi-row invoice table for line items
- add, edit, and delete actions for items
- tax and totals calculation logic
- summary cards for invoice totals

## 5–8 demonstrated line items

The project includes a set of sample invoice data with 8 example line items covering different product and service types, including:
- goods
- services
- varying UOM values
- unique SRO and SR references
- discounts and tax calculations

This demonstrates the app’s behavior with realistic invoice data instead of empty placeholders.

## UX decisions

The interface was designed to prioritize clarity and speed for invoice entry:
- expandable rows keep the table compact while still exposing detailed item data
- selection and action controls make bulk interaction easier
- structured form fields reduce input errors and keep tax-related values consistent
- summary views provide immediate visibility into totals without leaving the main screen
- responsive layout ensures the experience works across desktop and smaller screens

## Technology used

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS
- @tanstack/react-table for tabular data and expandable rows
- React Hook Form + Zod for form validation
- date-fns and custom date controls for invoice dates
- shadcn-style UI primitives and Lucide icons
- Sonner for toast notifications

## What is done

- Invoice page with a dedicated header and main dashboard layout
- Dynamic invoice item table with selection, pagination, expansion, editing, and deletion
- Add/edit invoice line items through a modal form
- Calculations for:
  - taxable value
  - GST, FTT, FED, and EXT tax amounts
  - total tax and total invoice value
- Invoice summary panel showing subtotal, discount, tax breakdown, and grand total
- Dropdown-based product metadata such as UOM, SRO, and SR number
- Validation and default values for invoice entries
- Sample invoice dataset for demo/testing purposes

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project structure

- `src/app` — application pages and layout
- `src/components/invoice` — invoice UI, forms, tax logic, and table components
- `src/data.ts` — mock invoice data
- `src/lib` — utility helpers
- `src/types` — shared types
