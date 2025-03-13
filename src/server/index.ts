import './carMarker';

mp.events.add({
    playerJoin: (player) => {
        player.spawn(new mp.Vector3(-425.517, 1123.62, 325.8544));
    },
    playerDeath: (player) => {
        player.spawn(new mp.Vector3(-425.517, 1123.62, 325.8544));
    },
});

mp.events.addCommand('veh', (player, _, model) => {
    const vehicle = mp.vehicles.new(mp.joaat(model), player.position);
    player.outputChatBox(`${model} spawned`);

    setTimeout(() => {
        if (!mp.vehicles.exists(vehicle)) return;
        if (!mp.players.exists(player)) return;
        player.putIntoVehicle(vehicle, 0);
    }, 200);
});

mp.events.addCommand('weapon', (player, _, weapon, ammo) => {
    var weaponHash = mp.joaat(weapon);

    player.giveWeapon(weaponHash, parseInt(ammo) || 10000);
});

mp.events.addCommand('pos', (player) => {
    if (player.vehicle) {
        console.log('pos', player.vehicle.position);
        console.log('rot', player.vehicle.rotation);
    } else {
        console.log('pos', player.position);
    }
});
