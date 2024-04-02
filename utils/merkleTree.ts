import sha256 from 'crypto-js/sha256'
import { MerkleTree } from 'merkletreejs'

export class WhitelistMerkleTree {
  tree: MerkleTree
  constructor(members: string[]) {
    this.tree = new MerkleTree(
      members.map((member) => sha256(member)),
      sha256,
      {
        // sort: true,
        // hashLeaves: false,
        // sortLeaves: true,
        sortPairs: true,
      },
    )
  }

  getMerkleRoot() {
    return this.tree.getRoot().toString('hex')
  }

  getMerkleProof(member: string) {
    console.log('this.tree.getProof(sha256(member).toString()): ', this.tree.getProof(sha256(member).toString()))
    return this.tree.getProof(sha256(member).toString()).map((item) => item.data.toString('hex'))
  }

  verify(proof: string[], member: string) {
    return this.tree.verify(proof, sha256(member).toString(), this.tree.getRoot())
  }
}
