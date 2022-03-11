const anchor = require("@project-serum/anchor");
const { expect } = require('chai');

describe("game", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Game;

  it("Sets and changes name", async () => {
    const [userStatsPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("user-stats"),
        anchor.getProvider().wallet.publicKey.toBuffer()
      ],
      program.programId
    );

    await program.rpc.createUserStats("brian", {
      accounts: {
        user: anchor.getProvider().wallet.publicKey,
        userStats: userStatsPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    });

    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.equal("brian");

    await program.rpc.changeUserName("tom", {
      accounts: {
        user: anchor.getProvider().wallet.publicKey,
        userStats: userStatsPDA,
      }
    });

    expect((await program.account.userStats.fetch(userStatsPDA)).name).to.equal("tom");
  });
});
