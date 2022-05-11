# installation 

    yarn add trustelevate-sdk

# usage

    import * as sdk from 'trustelevate-sdk';

    const builder = new sdk.G1TokenBuilder("0044");
    builder.addContacts(this.contacts[0]);
    b.build(); //returns a list of tokenized anchors