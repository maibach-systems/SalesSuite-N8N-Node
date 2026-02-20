# n8n-nodes-salessuite

Community node for [n8n](https://n8n.io/) to interact with the [SalesSuite](https://salessuite.com) CRM API.

## Installation

### In n8n (recommended)

1. Go to **Settings → Community Nodes**
2. Click **Install a community node**
3. Enter `@maibachsystems/n8n-nodes-salessuite`
4. Click **Install**

### Manual

```bash
cd ~/.n8n
npm install @maibachsystems/n8n-nodes-salessuite
```

Restart n8n after installation.

## Nodes

### SalesSuite

The main node for interacting with SalesSuite resources.

| Resource | Operations |
|----------|-----------|
| **Contact** | Create, Update, Get, Get by Email, Get Many, Search |
| **Deal** | Create, Update, Get, Get by Email, Get by Contact, Get Many |
| **Form** | Get Many, Get Submissions |
| **Call** | Get Types, Get Activities |
| **Mail** | Get Activities |
| **Note** | Create |
| **Pipeline** | Get Many |

### SalesSuite Trigger

Webhook-based trigger that starts workflows when events occur in SalesSuite. Automatically manages webhook subscriptions when the workflow is activated/deactivated.

**Supported Events:**

| Event | Description |
|-------|-------------|
| New Contact Created | Triggers when a new contact is created |
| Contact Property Changed | Triggers when a contact property has been changed |
| New Deal Created | Triggers when a new deal is created |
| Deal Property Changed | Triggers when a deal property has been changed |
| Deal Stage Changed | Triggers when a deal stage has been changed |
| New Call Activity | Triggers when a new call activity is created |
| New Form Submission | Triggers when a new form submission is created |
| New Mail Activity | Triggers when a new mail activity is created |

## Features

- **API Key Authentication** with built-in credential test
- **Dynamic Dropdowns** — Pipelines, Phases, Contacts, Forms and Call Types are loaded live from the API
- **Phase depends on Pipeline** — selecting a pipeline automatically loads its phases
- **Contact Dropdown on Deal** — select contacts by name when creating deals
- **Return All / Limit** — auto-pagination on all list endpoints
- **Custom Fields** — set any field by its internal API name via key/value pairs on Contact & Deal
- **Multi-Select Append** — option to append values to multi-select fields instead of overwriting
- **Proper field types** — date/time pickers for date fields, boolean toggles where applicable

## Credentials

You need a SalesSuite API Key. Configure the following in n8n:

| Field | Description |
|-------|-------------|
| **API Key** | Your SalesSuite API key |
| **Base URL** | API base URL (default: `https://api.salessuite.com/api/v1`) |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

### Link for local testing

```bash
# In this project
npm link

# In your n8n installation
npm link @maibachsystems/n8n-nodes-salessuite
```

## License

MIT
