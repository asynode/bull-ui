import './env';
import koa from 'koa';
const cors = require('@koa/cors');
import bodyParser from 'koa-bodyparser'
import { getConfiguration } from './envConfig';
import Utility from './utility';
import { bullApi,bullUi } from './index';
const app = new koa();
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
app.use(bullApi());
app.use(bullUi());


let port = getConfiguration('PORT');
if (!port) {
    port = "80";
}
app.listen(Utility.toNumber(port), function () {
    console.log('Server running on http://0.0.0.0:' + port);
});

