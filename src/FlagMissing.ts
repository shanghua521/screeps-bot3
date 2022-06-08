export default class FlagMissing {
  // 通过旗子派发任务

  constructor() { }

  public run() {
    let flags = Game.flags
    let missingData = Memory.flagMissingData
    if (!missingData) {
      missingData = {}
      Memory.flagMissingData = missingData
    }

    for (let [flagName, flag] of Object.entries(flags)) {
      let missing = missingData[flagName]
      if (missing) {

      }
      switch (flagName) {
        case 'claim':
        // console.log(flag.pos.roomName)
      }
    }
  }
}