This is the configuration for services running on [DigitalOcean's App Platform](https://www.digitalocean.com/products/app-platform/).

The configuration is deployed manually with these steps:

1. Replace `__PRIVATE_CONFIG_JSON__` in `participate.yaml` with the actual JSON, as a base64-encoded string.
1. Replace `__MEDIAWIKI_SECRET_KEY__` and `__RECAPTCHA_SECRET_KEY__` in `wiki.yaml` with the actual values.
1. Run `doctl apps list` to get the ID of the apps.
1. For each app in [`participate`, `build`, `blog`, `wiki`]:
    1. Run `doctl apps update $ID --spec=$APP.yaml`
