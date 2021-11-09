import koa from 'koa';
import { _router } from './router';
import './env';
import { QueueService } from './services/queue';
const cors = require('@koa/cors');
import bodyParser from 'koa-bodyparser'
import { getConfiguration } from './envConfig';
import Utility from './utility';
const app = new koa;
app.use(cors({
    origin: () => {
        return '*';
    }
}));
app.use(bodyParser());
app.use(async (ctx, next) => {
    try {
        await next();
    }
    catch (err: any) {
        ctx.status = err.status || 500;
        ctx.body = err.message;
    }
});
app.use(_router.routes());

app.use(function (ctx) {
    ctx.body = "Hello World";
});

new QueueService().init();
let port = getConfiguration('PORT');
if (!port) {
    port = "80";
}
app.listen(Utility.toNumber(port), function () {
    console.log('Server running on http://0.0.0.0:' + port);
});
