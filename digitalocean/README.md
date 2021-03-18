This is the configuration for services running on [DigitalOcean's App Platform](https://www.digitalocean.com/products/app-platform/).

The configuration is deployed manually with these steps:

- Replace `__PRIVATE_CONFIG_JSON__` in `participate.yaml` with the actual JSON, as a base64-encoded string
- Run `doctl apps list` to get the ID of participate.
- Run `doctl apps update $ID --spec=participate.yaml`
