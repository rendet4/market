function getVehicleFrontPosition(vehicle: VehicleMp, distance: number): Vector3 | null {
    if (!vehicle || !mp.vehicles.exists(vehicle)) {
        return null;
    }

    const radian = (vehicle.heading * Math.PI) / 180;

    return new mp.Vector3(
        vehicle.position.x - distance * Math.sin(radian),
        vehicle.position.y + distance * Math.cos(radian),
        vehicle.position.z,
    );
}

function get2dDistance(a: Vector3, b: Vector3): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function findHeading(a: Vector3, b: Vector3): number {
    const distance = get2dDistance(a, b);
    const radian = Math.atan2(b.z - a.z, distance);
    let deg = (radian * 180) / Math.PI;
    deg = deg < 0 ? deg + 360 : deg;

    return deg + 90;
}

export default {
    getVehicleFrontPosition,
    findHeading,
};
