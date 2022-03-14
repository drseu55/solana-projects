const anchor = require("@project-serum/anchor");
const assert = require('assert');

describe("messengerapp", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Messengerapp;

  it("An Account is initialized!", async () => {
    const baseAccount = anchor.web3.Keypair.generate();

    await program.rpc.initialize('My first message', {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: anchor.Provider.env().wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

    console.log('Data: ', account.data);

    assert.ok(account.data == 'My first message');

    _baseAccount = baseAccount;
  });

  it("Update the account previously created", async () => {
    const baseAccount = _baseAccount;

    await program.rpc.update('My second message', {
      accounts: {
        baseAccount: baseAccount.publicKey,
      },
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

    console.log('Updated data: ', account.data);

    assert.ok(account.data == 'My second message');

    console.log('All account data: ', account);
    console.log('All data: ', account.dataList);

    assert.ok(account.dataList.length == 2);
  });
});
