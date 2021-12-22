import Application from "koa";
import { QueueService } from "../services/queue";
import Utility from "../utility";

export default class MainControll {
    async instanceList(ctx: Application.ParameterizedContext) {
        const service = new QueueService();
        const redisQueue = service.getQueueInfoList();
        ctx.body = JSON.stringify(redisQueue, null, 4);
    }

    async jobList(ctx: Application.ParameterizedContext) {
        const service = new QueueService();
        const query = ctx.request.query;
        const result = await service.getJobs(<string>query.name, <string>query.queue_name, <any>query.status, Utility.toNumber(<string>query.page_num), Utility.toNumber(<string>query.page_size));
        ctx.body = JSON.stringify(result, null, 4);
    }

    async jobLogList(ctx: Application.ParameterizedContext) {
        const service = new QueueService();
        const query = ctx.request.query;
        const result = await service.getJobLogs(<string>query.name, <string>query.queue_name, <string>query.id, Utility.toNumber(<string>query.page_num), Utility.toNumber(<string>query.page_size));
        ctx.body = JSON.stringify(result, null, 4);
    }

    async count(ctx: Application.ParameterizedContext) {
        const service = new QueueService();
        const query = ctx.request.query;
        const result = await service.getEachStatusJobCount(<string>query.name, <string>query.queue_name);
        ctx.body = JSON.stringify(result, null, 4);
    }

    async delete(ctx: Application.ParameterizedContext) {
        const service = new QueueService();
        const query = ctx.request.body;
        const result = await service.delete(<string>query.name, <string>query.queue_name, <string>query.id);
        ctx.body = JSON.stringify(result, null, 4);
    }

    async retry(ctx: Application.ParameterizedContext) {
        const service = new QueueService();
        const query = ctx.request.body;
        const result = await service.retry(<string>query.name, <string>query.queue_name, <string>query.id);
        ctx.body = JSON.stringify(result, null, 4);
    }

    async addJob(ctx: Application.ParameterizedContext) {
        const service = new QueueService();
        const query =ctx.request.body;
        const result = await service.addJob(<string>query.name, <string>query.queue_name, <string>query.data, Utility.toNumber(query.delay), query.priority);
        ctx.body = JSON.stringify(result, null, 4);
    }
}