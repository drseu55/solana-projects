const anchor = require("@project-serum/anchor");
const { expect } = require('chai');

describe("puppet", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const puppetProgram = anchor.workspace.Puppet;
  const puppetMasterProgram = anchor.workspace.PuppetMaster;

  const puppetKeypair = anchor.web3.Keypair.generate();
  const authorityKeypair = anchor.web3.Keypair.generate();

  it("Does CPI", async () => {
    await puppetProgram.rpc.initialize(authorityKeypair.publicKey, {
      accounts: {
        puppet: puppetKeypair.publicKey,
        user: anchor.getProvider().wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [puppetKeypair]
    });

    await puppetMasterProgram.rpc.pullStrings(new anchor.BN(42), {
      accounts: {
        puppetProgram: puppetProgram.programId,
        puppet: puppetKeypair.publicKey,
        authority: authorityKeypair.publicKey,
      },
      signers: [authorityKeypair]
    });

    expect((await puppetProgram.account.data.fetch(puppetKeypair.publicKey)).data.toNumber()).to.equal(42);
  });
});
