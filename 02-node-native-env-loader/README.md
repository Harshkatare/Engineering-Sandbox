# 🔬 Node.js Built-in Environment Loader Test

A small experiment to test Node.js native `.env` file loading without using external packages like `dotenv`.

---

## 🎯 Goal

Test the built-in Node.js `--env-file` feature and understand how environment variables are injected into `process.env`.

---

## 🛠️ Stack

* Node.js (v20.6+)
* pnpm

---

## 📦 Setup

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Update the values inside `.env` as needed.

---

## ▶️ Running the Experiment

### With Node.js built-in env loader

```bash
pnpm dev
```

Equivalent command:

```bash
node --env-file=.env index.js
```

This loads variables from `.env` before executing the application.

---

### Without env loader

```bash
pnpm start
```

Equivalent command:

```bash
node index.js
```

This runs without loading `.env` variables.

---

## 🧪 What Was Tested

* Native `.env` loading using Node.js `--env-file`
* Reading environment variables through `process.env`
* Detecting missing environment variables
* Comparing behavior with and without `.env` loading
* Understanding application fallback values versus actual environment values

---

## 📁 Files

```text
.
├── index.js          # Environment loader test
├── package.json      # Project scripts
├── .env.example      # Example environment variables
└── README.md
```

---

## 📝 Notes

This experiment demonstrates that modern Node.js can load environment variables natively without requiring third-party packages for simple use cases.

Previously, projects commonly used packages like `dotenv` for this functionality.
