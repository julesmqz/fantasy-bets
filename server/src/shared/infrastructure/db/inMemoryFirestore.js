import crypto from 'crypto';

class InMemoryDocRef {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id || crypto.randomBytes(10).toString('hex');
  }

  get ref() {
    return this;
  }

  async get() {
    const data = this.collection.store.get(this.id);
    return {
      id: this.id,
      ref: this,
      exists: !!data,
      data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined)
    };
  }

  async set(data) {
    const resolved = this.collection.resolveValues(data);
    this.collection.store.set(this.id, resolved);
  }

  async update(data) {
    const existing = this.collection.store.get(this.id) || {};
    const resolved = this.collection.resolveValues(data, existing);
    this.collection.store.set(this.id, { ...existing, ...resolved });
  }
}

class InMemoryQuery {
  constructor(collection, filters = [], limitCount = null) {
    this.collection = collection;
    this.filters = filters;
    this.limitCount = limitCount;
  }

  where(field, op, val) {
    return new InMemoryQuery(
      this.collection,
      [...this.filters, { field, op, val }],
      this.limitCount
    );
  }

  limit(count) {
    return new InMemoryQuery(this.collection, this.filters, count);
  }

  _execute() {
    let results = [];
    for (const [id, docData] of this.collection.store.entries()) {
      let matches = true;
      for (const filter of this.filters) {
        const val = docData[filter.field];
        if (filter.op === '==') {
          if (val !== filter.val) {
            matches = false;
            break;
          }
        } else if (filter.op === 'array-contains') {
          if (!Array.isArray(val) || !val.includes(filter.val)) {
            matches = false;
            break;
          }
        }
      }
      if (matches) {
        results.push({
          id,
          ref: new InMemoryDocRef(this.collection, id),
          data: () => JSON.parse(JSON.stringify(docData))
        });
      }
    }

    if (this.limitCount !== null) {
      results = results.slice(0, this.limitCount);
    }
    return results;
  }

  async get() {
    const docs = this._execute();
    return {
      empty: docs.length === 0,
      docs
    };
  }

  count() {
    return {
      get: async () => {
        const docs = this._execute();
        return {
          data: () => ({ count: docs.length })
        };
      }
    };
  }
}

class InMemoryCollection {
  constructor(name) {
    this.name = name;
    this.store = new Map();
  }

  doc(id) {
    return new InMemoryDocRef(this, id);
  }

  where(field, op, val) {
    return new InMemoryQuery(this, [{ field, op, val }]);
  }

  resolveValues(data, existing = {}) {
    const out = { ...data };
    for (const [key, value] of Object.entries(data)) {
      if (value && value._type === 'arrayUnion') {
        const prevArray = Array.isArray(existing[key]) ? existing[key] : [];
        const set = new Set([...prevArray, ...value.elements]);
        out[key] = Array.from(set);
      }
    }
    return out;
  }
}

export class InMemoryFirestore {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryCollection(name));
    }
    return this.collections.get(name);
  }

  batch() {
    const operations = [];
    return {
      set: (docRef, data) => {
        operations.push(() => docRef.set(data));
      },
      update: (docRef, data) => {
        operations.push(() => docRef.update(data));
      },
      commit: async () => {
        for (const op of operations) {
          await op();
        }
      }
    };
  }

  async runTransaction(callback) {
    const transaction = {
      get: async (refOrQuery) => {
        return refOrQuery.get();
      },
      set: (docRef, data) => {
        docRef.set(data);
      },
      update: (docRef, data) => {
        docRef.update(data);
      }
    };
    return callback(transaction);
  }
}

export const InMemoryFieldValue = {
  arrayUnion: (...elements) => ({
    _type: 'arrayUnion',
    elements
  })
};
