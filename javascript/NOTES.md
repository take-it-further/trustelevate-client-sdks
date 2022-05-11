# test

    yarn test

# build

    yarn build

# create an installation tar

    yarn pack

this can be then installed in a nodejs application by doing:

    yarn add ../client-sdks/javascript/trustelevate-sdk-v1.0.0.tgz

# publish

before publishing ensure you bump the version in the package.json appropriately

    npm login
    npm publish --access public