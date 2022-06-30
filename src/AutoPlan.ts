export default class AutoPlan {

  constructor(public room: Room) {
  }

  public showArea() {
    if (this.room.memory.area) {
      this.room.visual.import(this.room.memory.area)
      return
    }
    this.findAlLArea()
  }

  public findAlLArea() {
    let terrain = this.room.getTerrain().getRawBuffer()
    let buffer = new Array<Array<number>>()
    for (let i = 0; i < 50; i++) {
      let array = []
      for (let j = 0; j < 50; j++) {
        array.push(0)
      }
      buffer[i] = array
    }
    for (let y = 2; y < 48; y++) {
      if (!(terrain[y * 50 + 2] & TERRAIN_MASK_WALL)) {
        buffer[2][y] = 1;
        this.room.visual.text("1", 2, y)
      }
    }
    for (let x = 2; x < 48; x++) {
      if (!(terrain[100 + x] & TERRAIN_MASK_WALL)) {
        buffer[x][2] = 1;
        this.room.visual.text("1", x, 2)
      }
    }

    for (let x = 3; x < 48; x++) {
      for (let y = 3; y < 48; y++) {
        if (!(terrain[y * 50 + x] & TERRAIN_MASK_WALL)) {
          buffer[x][y] = 1 + Math.min(buffer[x - 1][y - 1], buffer[x - 1][y], buffer[x][y - 1]);
          this.room.visual.text(String(buffer[x][y]), x, y)
        }
      }
    }
    this.room.memory.area = this.room.visual.export()
    return this.room.memory.area
  }
}
