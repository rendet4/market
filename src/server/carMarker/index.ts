// Система "Авторынок".
// Есть некоторая область типа парковки, на которой игроки смогут продавать/покупать личный транспорт
// 1. На парковке есть несколько (десятков) точек, на которую игрок может заехать на личном тс
// 2. После того, как игрок заедет на маркер, игрок может ввести команду, в которой должен указать цену продажи ТС
// 3. После подтверждения (введения команды) личный ТС удаляется, спавнится превью, которым нельзя управлять/наносить урон или перемещать (как-либо воздействовать).
// 4. Чтобы игрок не застрял в ТС, его нужно переместить к двери поставленного ТС (не просто слева от ТС, а относительно двери водительской леворульной/праворульной ТС)
// 5. После выставления ТС на продажу, на нем появляется большой невидимый маркер/колшейп. Находясь в нем игрок может купить ТС введя команду (срабатывает на ближайшем ТС)
import { CAR_MARKET_POSITIONS } from '@shared/carMarket';
import utils from './utils';

type TSellData = {
    price: number;
    model: number;
    vehicle: number;
    colshape: number;
};

const sellVehicles: Map<number, TSellData> = new Map();

function getClosestVehicleColshape(player: PlayerMp): number | null {
    if (player === undefined || !mp.players.exists(player)) {
        return null;
    }

    sellVehicles.forEach((data, index) => {
        if (data.colshape === undefined) return null;
        const colshape = mp.colshapes.at(data.colshape);
        if (!mp.colshapes.exists(colshape)) return null;

        if (colshape.isPointWithin(player.position)) {
            return index;
        }

        return null;
    });

    return null;
}

function teleportPlayerInFrontVehicle(player: PlayerMp, vehicle: VehicleMp) {
    if (!player || !mp.players.exists(player)) return;
    if (!vehicle || !mp.vehicles.exists(vehicle)) return;

    const position = utils.getVehicleFrontPosition(vehicle, 3);
    if (!position) return;
    const heading = utils.findHeading(position, player.position);

    player.position = position;
    player.heading = heading;
}

function createPreview(index: number, player: PlayerMp, price: number, model: number) {
    const position = new mp.Vector3(CAR_MARKET_POSITIONS[index].pos);
    const vehicle = mp.vehicles.new(model, position, {
        dimension: 0,
        engine: false,
    });
    vehicle.rotation = new mp.Vector3(CAR_MARKET_POSITIONS[index].rot);
    vehicle.setVariable('forSale', index);
    vehicle.locked = true;

    const colshape = mp.colshapes.newSphere(position.x, position.y, position.z, 10);
    colshape.position = position;

    setTimeout(() => {
        if (!player || !mp.players.exists(player)) return;
        if (!vehicle || !mp.vehicles.exists(vehicle)) return;
        if (!colshape || !mp.colshapes.exists(colshape)) return;

        sellVehicles.set(index, {
            price,
            model,
            vehicle: vehicle.id,
            colshape: colshape.id,
        });
        teleportPlayerInFrontVehicle(player, vehicle);
    }, 200);
}

function destroyPreview(index: number) {
    const data = sellVehicles.get(index);
    if (!data) return;

    if (data.vehicle !== undefined) {
        const vehicle = mp.vehicles.at(data.vehicle);
        if (vehicle && mp.vehicles.exists(vehicle)) {
            vehicle.setVariable('forSale', false);
            vehicle.locked = false;
        }
    }

    if (data.colshape !== undefined) {
        const colshape = mp.colshapes.at(data.colshape);
        if (colshape && mp.colshapes.exists(colshape)) colshape.destroy();
    }

    sellVehicles.delete(index);
}

mp.events.add('carMarket:sell', (player: PlayerMp, index: number, price: number) => {
    const vehicle = player.vehicle;
    if (!vehicle || vehicle.getOccupant(0) !== player) return;
    if (vehicle.getVariable('forSale')) return;
    if (!CAR_MARKET_POSITIONS[index]) return;
    if (sellVehicles.has(index)) return;

    // Выдаем деньги

    createPreview(index, player, price, vehicle.model);

    vehicle.destroy();
});

mp.events.addCommand('buy', (player: PlayerMp) => {
    if (player === undefined || !mp.players.exists(player)) {
        return;
    }

    const index = getClosestVehicleColshape(player);
    if (index === null) return;
    const data = sellVehicles.get(index);
    if (!data) return;
    if (data.vehicle === undefined) return;
    const vehicle = mp.vehicles.at(data.vehicle);
    if (!vehicle || !mp.vehicles.exists(vehicle)) return;
    // Проверяем деньги и списываем
    destroyPreview(index);
    player.putIntoVehicle(vehicle, 0);
});
