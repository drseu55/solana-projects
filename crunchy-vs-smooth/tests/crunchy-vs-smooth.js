const anchor = require("@project-serum/anchor");
const chai = require('chai');

describe("crunchy-vs-smooth", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  // Initialize program
  const program = anchor.workspace.CrunchyVsSmooth;

  // Initialize Vote Account
  const voteAccount = anchor.web3.Keypair.generate();

  it("Initializes with 0 votes for crunchy and smooth", async () => {
    console.log('Testing Initialize...');

    await program.rpc.initialize({
      accounts: {
        voteAccount: voteAccount.publicKey,
        user: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [voteAccount],
    });

    const account = await program.account.voteAccount.fetch(voteAccount.publicKey);

    console.log('Crunchy: ', account.crunchy.toString());
    console.log('Smooth: ', account.smooth.toString());

    chai.assert.ok(
      account.crunchy.toString() == 0 && account.smooth.toString() == 0
    );
  });

  it('Votes correctly for crunchy', async () => {
    console.log('Testing voteCrunchy...');

    await program.rpc.voteCrunchy({
      accounts: {
        voteAccount: voteAccount.publicKey,
      },
    });

    const account = await program.account.voteAccount.fetch(voteAccount.publicKey);

    console.log('Crunchy: ', account.crunchy.toString());
    console.log('Smooth: ', account.smooth.toString());

    chai.assert.ok(
      account.crunchy.toString() == 1 && account.smooth.toString() == 0
    );
  });

  it('Votes correctly for smooth', async () => {
    console.log('Testing voteSmooth...');

    await program.rpc.voteSmooth({
      accounts: {
        voteAccount: voteAccount.publicKey,
      },
    });

    const account = await program.account.voteAccount.fetch(voteAccount.publicKey);

    console.log('Crunchy: ', account.crunchy.toString());
    console.log('Smooth: ', account.smooth.toString());

    chai.assert.ok(
      account.crunchy.toString() == 1 && account.smooth.toString() == 1
    );
  });
});
