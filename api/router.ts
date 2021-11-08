import router from 'koa-router';
import MainControll from './controll/main';


const _router = new router();

const main = new MainControll();

_router.get('/instance/list', main.instanceList);
_router.get('/job/list', main.jobList);
_router.get('/job/count', main.count);
_router.get('/job/log', main.jobLogList);
_router.delete('/job', main.delete);
_router.put('/job', main.retry);
_router.post('/job', main.addJob);
export { _router }



