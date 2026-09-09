export class InMemoryJobStore {
    jobs = new Map();
    create(id) {
        const record = {
            id,
            status: "queued",
            createdAt: new Date().toISOString(),
        };
        this.jobs.set(id, record);
        return record;
    }
    update(id, patch) {
        const current = this.jobs.get(id);
        if (!current) {
            throw new Error(`Unknown simulation job ${id}`);
        }
        const next = { ...current, ...patch };
        this.jobs.set(id, next);
        return next;
    }
    get(id) {
        return this.jobs.get(id);
    }
}
