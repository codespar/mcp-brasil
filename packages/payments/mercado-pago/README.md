# MCP Mercado Pago

MCP server for the **Mercado Pago** payment gateway — the leading payment platform in Latin America.

## Quick Start

```bash
# Set your access token
export MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."

# Run via stdio
npx tsx packages/payments/mercado-pago/src/index.ts

# Run via HTTP
npx tsx packages/payments/mercado-pago/src/index.ts --http
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MERCADO_PAGO_ACCESS_TOKEN` | Yes | Access token from Mercado Pago dashboard |
| `MCP_HTTP` | No | Set to `"true"` to enable HTTP transport |
| `MCP_PORT` | No | HTTP port (default: 3000) |

## Tools

### Payments & checkout
| Tool | Description |
|------|-------------|
| `create_payment` | Create a payment (amount, description, payment method, payer email) |
| `get_payment` | Get payment details by ID |
| `search_payments` | Search payments with filters (status, date range) |
| `create_refund` | Refund a payment (full or partial amount) |
| `create_preference` | Create Checkout Pro preference (items, back URLs) |
| `get_preference` | Get checkout preference by ID |
| `create_pix_payment` | Create a PIX payment (amount, payer info, CPF) |
| `create_card_token` | Tokenize a card for secure payments |

### Customers, merchant ops & stores
| Tool | Description |
|------|-------------|
| `create_customer` | Create a customer (email, name) |
| `list_customers` | List/search customers |
| `get_merchant_order` | Get merchant order by ID |
| `search_merchant_orders` | Search merchant orders (status, preference, external_reference, last 90d) |
| `get_balance` | Get account balance |
| `create_store` / `list_stores` / `create_pos` | Physical store & POS management |

### Payment methods & metadata
| Tool | Description |
|------|-------------|
| `get_payment_methods` | List available payment methods (current account) |
| `get_payment_method_details` | Get details of a specific payment method |
| `get_payment_methods_by_site` | Payment methods for a given site (MLB, MLA, MLM, MLC, MCO, MPE, MLU) |
| `get_identification_types` | Country-specific tax-ID / document types (CPF, CNPJ, DNI, RUT, etc.) |

### Subscriptions (preapprovals)
| Tool | Description |
|------|-------------|
| `create_subscription` | Create a recurring subscription (preapproval) |
| `get_subscription` | Get subscription details |
| `update_subscription` | Update amount, status, reason, card token |
| `cancel_subscription` | Cancel a subscription |

### Marketplace (split payments & seller onboarding)
| Tool | Description |
|------|-------------|
| `oauth_token_exchange` | Exchange authorization code (or refresh_token) for a seller access token |
| `create_advanced_payment` | Marketplace split payment with per-seller disbursements (application_fee, release days) |
| `get_advanced_payment` | Get an advanced (split) payment by ID |

### Disputes & reconciliation
| Tool | Description |
|------|-------------|
| `get_chargeback` | Get chargeback details |
| `upload_chargeback_evidence` | Upload documentation (.jpg, .png, .pdf) to a chargeback dispute |
| `create_settlement_report` | Generate a settlement (account money) report for a date range |

## Auth

Uses **Bearer token** authentication. Obtain your access token from the [Mercado Pago Developers](https://www.mercadopago.com.br/developers) dashboard.

## API Reference

- [Mercado Pago API Docs](https://www.mercadopago.com.br/developers/en/reference)
