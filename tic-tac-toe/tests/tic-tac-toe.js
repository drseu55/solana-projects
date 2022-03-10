const anchor = require("@project-serum/anchor");
// import { program } from '@project-serum/anchor/dist/cjs/spl/token';
// import { expect } from 'chai';
const { expect } = require('chai');

describe("tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.TicTacToe;

  async function play(program, game, player, tile, expectedTurn, expectedGameState, expectedBoard) {
    await program.rpc.play(tile, {
      accounts: {
        player: player.publicKey,
        game
      },
      signers: player instanceof anchor.Wallet ? [] : [player]
    });

    const gameState = await program.account.game.fetch(game);
    expect(gameState.turn).to.equal(expectedTurn);
    expect(gameState.state).to.eql(expectedGameState);
    expect(gameState.board).to.eql(expectedBoard);
  }

  it('setup game!', async () => {
    const gameKeypair = anchor.web3.Keypair.generate();
    const playerOne = program.provider.wallet;
    const playerTwo = anchor.web3.Keypair.generate();
    await program.rpc.setupGame(playerTwo.publicKey, {
      accounts: {
        game: gameKeypair.publicKey,
        playerOne: playerOne.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [gameKeypair]
    });

    let gameState = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players)
      .to
      .eql([playerOne.publicKey, playerTwo.publicKey]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board)
      .to
      .eql([[null, null, null], [null, null, null], [null, null, null]]);
  });

  it('player one wins', async () => {
    const gameKeyPair = anchor.web3.Keypair.generate();
    const playerOne = program.provider.wallet;
    const playerTwo = anchor.web3.Keypair.generate();

    await program.rpc.setupGame(playerTwo.publicKey, {
      accounts: {
        game: gameKeyPair.publicKey,
        playerOne: playerOne.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [gameKeyPair]
    });

    let gameState = await program.account.game.fetch(gameKeyPair.publicKey);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players).to.eql([playerOne.publicKey, playerTwo.publicKey]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board).to.eql([[null, null, null], [null, null, null], [null, null, null]]);

    await play(program, gameKeyPair.publicKey, playerOne, { row: 0, column: 0 }, 2, { active: {}, }, [ [{x:{}}, null, null], [null, null, null], [null, null, null] ]);

    // Catching a program error
    try {
      await play(
        program,
        gameKeyPair.publicKey,
        playerTwo,
        {row: 5, column: 1},
        4,
        { active: {}, },
        [
          [{x: {}}, {x: {}}, null],
          [{o: {}}, null, null],
          [null, null, null]
        ]
      );
      chai.assert(false, "should've failed but didn't");
    } catch (error) {
      expect(error.code).to.equal(6000);
    }

    await play(
      program,
      gameKeyPair.publicKey,
      playerTwo,
      {row: 1, column: 0},
      3,
      { active: {}, },
      [
        [{x:{}},null,null],
        [{o:{}},null,null],
        [null,null,null]
      ]
    );

    await play(
      program,
      gameKeyPair.publicKey,
      playerOne,
      {row: 0, column: 1},
      4,
      { active: {}, },
      [
        [{x:{}},{x: {}},null],
        [{o:{}},null,null],
        [null,null,null]
      ]
    );

    await play(
      program,
      gameKeyPair.publicKey,
      playerTwo,
      {row: 1, column: 1},
      5,
      { active: {}, },
      [
        [{x:{}},{x: {}},null],
        [{o:{}},{o:{}},null],
        [null,null,null]
      ]
    );

    await play(
      program,
      gameKeyPair.publicKey,
      playerOne,
      {row: 0, column: 2},
      5,
      { won: { winner: playerOne.publicKey }, },
      [
        [{x:{}},{x: {}},{x: {}}],
        [{o:{}},{o:{}},null],
        [null,null,null]
      ]
    );
  });
});
