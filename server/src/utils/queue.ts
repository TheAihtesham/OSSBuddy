
class AIQueue {
  private running = 0;
  private readonly MAX_CONCURRENT = 3; 
  private queue: (() => void)[] = [];

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.running++;
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.running--;
          if (this.queue.length > 0) {
            const next = this.queue.shift()!;
            next();
          }
        }
      };

      if (this.running < this.MAX_CONCURRENT) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }
}

export const aiQueue = new AIQueue();