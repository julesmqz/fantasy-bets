export class Room {
  constructor({ id, name, code, creatorId, maxUsers, status = 'open', createdAt, memberCount = 1 }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.creatorId = creatorId;
    this.maxUsers = maxUsers;
    this.status = status;
    this.createdAt = createdAt;
    this.memberCount = memberCount;
  }

  isFull() {
    return this.memberCount >= this.maxUsers;
  }

  isCompleted() {
    return this.status === 'completed';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      creatorId: this.creatorId,
      maxUsers: this.maxUsers,
      max_users: this.maxUsers,
      status: this.status,
      createdAt: this.createdAt,
      memberCount: this.memberCount,
      member_count: this.memberCount
    };
  }
}
