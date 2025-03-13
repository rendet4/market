import { CAR_MARKET_POSITIONS } from '@shared/carMarket';
const markerColshapes: Map<ColshapeMp, number> = new Map();
let currentColshape: number | null = null;

CAR_MARKET_POSITIONS.forEach((data, index) => {
    const pos = new mp.Vector3(data.pos);
    pos.z -= 0.5;
    mp.markers.new(1, pos, 2, {
        dimension: 0,
        visible: true,
        color: [255, 0, 0, 100],
    });

    const colshape = mp.colshapes.newSphere(pos.x, pos.y, pos.z, 2, 0);
    markerColshapes.set(colshape, index);
});

mp.events.add('playerEnterColshape', (colshape) => {
    if (markerColshapes.has(colshape)) {
        const index = markerColshapes.get(colshape);
        if (index === undefined) return;
        currentColshape = index;
        mp.gui.chat.push('Enter colshape: ' + index.toString());
    }
});

mp.events.add('playerExitColshape', (colshape) => {
    if (markerColshapes.has(colshape)) {
        currentColshape = null;
        mp.gui.chat.push('Exit colshape');
    }
});

mp.events.add('playerCommand', (command) => {
    const args = command.split(/[ ]+/);
    const commandName = args[0];

    args.shift();

    if (commandName === 'sell') {
        if (currentColshape === null) return;

        const vehicle = mp.players.local.vehicle;

        if (!vehicle || vehicle.getPedInSeat(-1) !== mp.players.local.handle) {
            mp.gui.chat.push('Вы должны находиться в машине за рулём.');
            return;
        }

        const price = parseInt(args[0]);
        if (!price || isNaN(price) || price < 1) {
            mp.gui.chat.push('Цена введена неверно');
            return;
        }

        mp.events.callRemote('carMarket:sell', currentColshape, price);
    }
});

mp.events.addDataHandler('forSale', (vehicle: VehicleMp, value) => {
    if (vehicle.type === 'vehicle' && mp.vehicles.exists(vehicle)) {
        if (value !== false) {
            vehicle.freezePosition(true);
            vehicle.setInvincible(true);
        } else {
            vehicle.freezePosition(false);
            vehicle.setInvincible(false);
        }
    }
});

mp.events.add('entityStreamIn', (vehicle: VehicleMp) => {
    if (vehicle.type === 'vehicle') {
        const forSale = vehicle.getVariable('forSale');
        if (forSale !== undefined) {
            vehicle.freezePosition(true);
            vehicle.setInvincible(true);
        }
    }
});
