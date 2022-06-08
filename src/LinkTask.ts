import { MyRoom } from "./MyRoom";

export default class LinkTask {

  constructor(private room: MyRoom) { }

  public run() {
    let storageLink = this.room.storageLink
    let controllerLink = this.room.controllerLink
    if (storageLink && controllerLink) {
      if (storageLink.store.getFreeCapacity(RESOURCE_ENERGY) == 0 && storageLink.cooldown == 0 && controllerLink.store.getUsedCapacity(RESOURCE_ENERGY) <= 300) {
        storageLink.transferEnergy(controllerLink)
      }
    }
  }
}
