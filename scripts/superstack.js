import { world, system, ItemStack } from "@minecraft/server"

// you can customize this

const SuperStackInitializerRunId = system.runInterval(() => {
    if (world.getDynamicProperty('SuperStack')) {
        system.clearRun(SuperStackInitializerRunId)
    } else {
        try {
            const l = world.getPlayers()[0].location
            try {
                world.getDimension('overworld').runCommand(`/tickingarea add ${l.x} 319 ${l.z} ${l.x} 319 ${l.z} SuperStack`);
                world.setDynamicProperty('SuperStack', { x: l.x, y: 319, z: l.z })
                console.log(`[SuperStack] Tickingarea initialized at x:${l.x}, y:319, z:${l.z}`)
            } catch (e) {
                console.error(`[SuperStack] Tickingarea throwed an error: \n${e}`)
            }
            system.clearRun(SuperStackInitializerRunId)
        } catch { console.log('[SuperStack] Waiting for the player to initialize the tickingarea ...') }

    }
}, 40)

export class SuperStack {
    itemStack;
    /**@param {ItemStack} itemStack */
    constructor(itemStack) {
        this.itemStack = itemStack
    }
    /** @returns {{content:ItemStack[]}}*/
    getContainer() {
        const itemStack = this.itemStack;
        const dimension = world.getDimension('overworld')
        /**@type {{x:number,y:number,z:number}} */
        const location = world.getDynamicProperty('SuperStack');
        dimension.spawnItem(itemStack, location).applyDamage(5, {
            cause: "blockExplosion"
        })

        const entities = dimension.getEntities({ location, type: 'minecraft:item', maxDistance: 1 })
        const content = entities.map(k => k.getComponent('item').itemStack)
        entities.forEach(k => k.remove())
        return { content };
    }

    /**@param {ItemStack[]} itemStacks */
    setContainer(itemStacks = []) {
        const itemStack = this.itemStack;

        const dimension = world.getDimension('overworld')
        const location = world.getDynamicProperty('SuperStack');
        if (!['shulker_box'].some(k => itemStack?.typeId.endsWith(k))) throw new Error(`Can't add items in the container of ${itemStack?.typeId}, this only supports shulkerboxes.`)

        dimension.setBlockType(location, itemStack.typeId)
        const container = dimension.getBlock(location).getComponent('inventory').container
        itemStacks.forEach((item, i) => container.setItem(i, item))
        dimension.runCommand(`setblock ${Object.values(location).join(' ')} air destroy`);

        this.itemStack = dimension.getEntities({ location, type: 'minecrafT:item', maxDistance: 1 })[0].getComponent('item').itemStack
    }
    getData() {
        const itemStack = this.itemStack;
        const acceptedValues = [
            'minecraft:arrow',
            'minecraft:potion',
            'minecraft:splash_potion',
            'minecraft:lingering_potion',
            'minecraft:ominous_bottle',
            'minecraft:goat_horn',
            'minecraft:bed',
            'minecraft:banner',
            'minecraft:firework_rocket',
            'minecraft:firework_star',
        ]
        if (!acceptedValues.some(k => k == itemStack?.typeId)) {
            return 0
        }
        const location = world.getDynamicProperty('SuperStack')
        const entity = world.getDimension('overworld').spawnEntity(`super:stack`, location)
        const inv = entity.getComponent('inventory')?.container

        inv.setItem(0, itemStack)
        let data = 0
        for (data; data < 100; data++) {
            const success = entity.runCommand(`/testfor @e[type=super:stack,r=1,hasitem={item=${itemStack.typeId},data=${data},slot=0,location=slot.inventory}]`).successCount
            if (success >= 1) break;
        }
        entity.remove()
        return data
    }
    /**@param {number} data */
    setData(data) {
        const itemStack = this.itemStack;
        const acceptedValues = [
            'minecraft:arrow',
            'minecraft:potion',
            'minecraft:splash_potion',
            'minecraft:lingering_potion',
            'minecraft:ominous_bottle',
            'minecraft:goat_horn',
            'minecraft:bed',
            'minecraft:banner',
            'minecraft:firework_rocket',
            'minecraft:firework_star',
        ]
        if (!acceptedValues.some(k => k == itemStack?.typeId)) {
            return 0
        }
        if (itemStack.typeId == 'minecraft:arrow' && data < 6 && data != 0) data = 6
        const location = world.getDynamicProperty('SuperStack')
        const entity = world.getDimension('overworld').spawnEntity(`super:stack`, location)
        const inv = entity.getComponent('inventory')?.container
        entity.runCommand(`/replaceitem entity @e[type=super:stack] slot.inventory 0 ${itemStack.typeId} ${itemStack.amount} ${data}`)
        const newitemStack = inv.getItem(0)
        entity.remove()
        this.itemStack = newitemStack
        return this
    }
}
