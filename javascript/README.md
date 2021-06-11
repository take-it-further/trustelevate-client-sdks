# installation 

    yarn add veripass-sdk 

# usage

    import * as sdk from 'veripass-sdk';

    const builder = new sdk.G1TokenBuilder("0044");
    builder.addContacts(this.contacts[0]);
    b.build(); //returns a list of tokenized anchors