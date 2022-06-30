import { MyRoom } from "MyRoom";

export default class FactoryTask {

  constructor(public myRoom: MyRoom){}

  public run() {
    let factory = this.myRoom.factory
    if (factory && factory.cooldown == 0 && factory.store.getUsedCapacity(RESOURCE_ENERGY) > 600) {
      factory.produce(RESOURCE_BATTERY)
    }
  }

}
