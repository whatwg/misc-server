This is the configuration for services running on [DigitalOcean's App Platform](https://www.digitalocean.com/products/app-platform/).

The configuration is deployed manually with these steps:

- Update `PRIVATE_CONFIG_JSON` in `participate.yaml`
- Run `doctl apps list` to get the ID of participate.
- Run `doctl apps update $ID --spec=participate.yaml`
