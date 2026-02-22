// physicsModel.ts - Stores physics parameters for objects

// PhysicsData class holds mass and restitution values
export class PhysicsData {
  mass: number;
  restitution: number;

  constructor(mass: number = 1, restitution: number = 0.9) {
    this.mass = mass;
    this.restitution = restitution;
  }
}