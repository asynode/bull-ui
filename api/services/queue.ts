import Queue, { JobStatus } from 'bull'
import * as _ from 'lodash';
import { getConfiguration, getConfigurations } from '../envConfig';
import { ErrorStatus } from '../errorStatus';
import Utility from '../utility';

export interface RedisQueueInfo {
    name: string,
    queues: string[]
}
export interface RedisQueueInstance {
    name: string,
    redisUrl: string,
    instance: Map<string, Queue.Queue>;
}

export interface pagination {
    num: number,
    size: number,
    total: number
}

export interface eachStatusJobCount {
    completed: number,
    waiting: number,
    active: number,
    delayed: number,
    failed: number,
    paused: number
}

export class QueueService {
    static instance: RedisQueueInstance[] = [];

    init() {
        const envInstance = getConfiguration("BULL_QUEUE_INSTANCE");
        if (!envInstance) {
            return [];
        }
        const instanceArr = envInstance.split(',');
        instanceArr.forEach((item) => {
            const configs = getConfigurations(['BULL_QUEUE_NAME_' + item, "BULL_QUEUE_REDIS_" + item, "BULL_QUEUE_QUEUE_" + item]);
            const name = configs.get("BULL_QUEUE_NAME_" + item);
            const redis = configs.get("BULL_QUEUE_REDIS_" + item);
            const queuestr = configs.get("BULL_QUEUE_QUEUE_" + item);
            if (!name || !redis || !queuestr) {
                return;
            }
            const queues = queuestr.split(',');
            const queueInstance = new Map<string, Queue.Queue>();
            queues.forEach((q) => {
                const queue = new Queue(q, redis);
                queueInstance.set(q, queue);
            });

            QueueService.instance.push({ name: name, redisUrl: redis, instance: queueInstance });
        });
    }

    getQueueInfoList(): RedisQueueInfo[] {
        let infos: RedisQueueInfo[] = [];
        for (let idx = 0; idx < QueueService.instance.length; idx++) {
            const element = QueueService.instance[idx];
            if (!element) {
                continue;
            }
            const queues: string[] = [];
            for (const key of element.instance.keys()) {
                queues.push(key);
            }

            infos.push({ name: element.name, queues })
        }
        return infos;
    }

    getQueueInstance(name: string, queueName: string): Queue.Queue | undefined {
        if (!name || !queueName) {
            throw new ErrorStatus('name and queue name can not be null!', 400);
        }
        const instance = QueueService.instance.find((element) => {
            const exist = element.name.toLowerCase() == name.toLowerCase();
            if (exist) {

                return element.name.toLowerCase() == name.toLowerCase();
            }
            return false;
        });
        if (!instance)
            return undefined;
        return instance.instance.get(queueName);
    }

    async getJob(name: string, queueName: string, id: string) {
        const instance = this.getQueueInstance(name, queueName);
        if (!instance) {
            return {};
        }
        if (!id) {
            throw new ErrorStatus('id can not be null!', 400);
        }
        const job = await instance.getJob(id);
        if (job == null)
            return null;
        return job.toJSON();
    }

    async getJobs(name: string, queueName: string, status: JobStatus, pageNum: number, pageSize: number) {
        const pagination: pagination = { num: pageNum, size: pageSize, total: 0 };
        const instance = this.getQueueInstance(name, queueName);
        if (!instance) {
            return { items: [], pagination };
        }
        if (!status) {
            throw new ErrorStatus('status can not be null!', 400);
        }
        pageNum = Utility.toNumber(pageNum);
        pageSize = Utility.toNumber(pageSize);
        const startNumber = (pageNum - 1) * pageSize;
        const endNumber = pageNum * pageSize - 1;
        let jobs: Queue.Job<any>[] = [];
        if (status === 'active') {
            pagination.total = await instance.getActiveCount();
            jobs = await instance.getJobs(['active'], startNumber, endNumber, false);
        }
        else if (status === 'completed') {
            pagination.total = await instance.getCompletedCount();
            jobs = await instance.getJobs(['completed'], startNumber, endNumber, false);
        }
        else if (status === 'delayed') {
            pagination.total = await instance.getDelayedCount();

            jobs = await instance.getJobs(['delayed'], startNumber, endNumber, false);
        }
        else if (status === 'failed') {
            pagination.total = await instance.getFailedCount();
            jobs = await instance.getJobs(['failed'], startNumber, endNumber, false);
        }
        else if (status === 'waiting') {
            pagination.total = await instance.getWaitingCount();
            jobs = await instance.getJobs(['waiting'], startNumber, endNumber, false);
        }
        else if (status === 'paused') {
            pagination.total = await instance.getPausedCount();
            jobs = await instance.getJobs(['paused'], startNumber, endNumber, false);
        }
        let items = [];
        for (let idx = 0; idx < jobs.length; idx++) {
            const element = jobs[idx];
            if (!element) {
                continue;
            }
            items.push(element.toJSON());
        }
        return { items, pagination };
    }

    async getJobLogs(name: string, queueName: string, id: string, pageNum: number, pageSize: number) {
        const pagination: pagination = { num: pageNum, size: pageSize, total: 0 };
        const instance = this.getQueueInstance(name, queueName);
        if (!instance) {
            return { items: [], pagination };
        }
        if (!id) {
            throw new ErrorStatus('id can not be null!', 400);
        }
        pageNum = Utility.toNumber(pageNum);
        pageSize = Utility.toNumber(pageSize);
        const startNumber = (pageNum - 1) * pageSize;
        const endNumber = pageNum * pageSize - 1;

        const logs = await instance.getJobLogs(id, startNumber, endNumber);
        pagination.total = logs.count;
        return { items: logs.logs, pagination };
    }

    async getEachStatusJobCount(name: string, queueName: string): Promise<eachStatusJobCount> {
        const counts: eachStatusJobCount = { completed: 0, waiting: 0, active: 0, delayed: 0, failed: 0, paused: 0 };
        const instance = this.getQueueInstance(name, queueName);
        if (!instance) {
            return counts;
        }
        counts.completed = await instance.getCompletedCount();
        counts.waiting = await instance.getWaitingCount();
        counts.active = await instance.getActiveCount();
        counts.delayed = await instance.getDelayedCount();
        counts.failed = await instance.getFailedCount();
        counts.paused = await instance.getPausedCount();
        return counts;
    }

    async delete(name: string, queueName: string, id: string) {
        const instance = this.getQueueInstance(name, queueName);
        if (!instance) {
            return false;
        }
        if (!id) {
            throw new ErrorStatus('id can not be null!', 400);
        }
        await instance.removeJobs(id);
        return true;
    }

    async retry(name: string, queueName: string, id: string) {
        const instance = this.getQueueInstance(name, queueName);
        if (!instance) {
            return false;
        }
        if (!id) {
            throw new ErrorStatus('id can not be null!', 400);
        }
        const job = await instance.getJob(id);
        if (!job) {
            return false;
        }
        await job.retry();
        return true;
    }

    async addJob(name: string, queueName: string, data: any, delay: number, priority: string | number | undefined) {
        const instance = this.getQueueInstance(name, queueName);
        if (!instance) {
            return false;
        }
        delay = Utility.toNumber(delay);
        if (priority != undefined) {
            priority = Utility.toNumber(priority);
        }
        if (priority == 0) {
            priority = undefined;
        }
        const JOB_TTL = 30 * 60 * 1000;
        let job: any = null;
        if (typeof data == "string") {
            job = await instance.add(JSON.parse(data), {
                attempts: 3,
                delay: delay,
                timeout: JOB_TTL,
                priority: priority,
            });
        }
        else {
            job = await instance.add(data, {
                attempts: 3,
                delay: delay,
                timeout: JOB_TTL,
                priority: priority,
            });
        }
        return job;
    }
}


