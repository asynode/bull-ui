import router from 'koa-router';
import MainControll from './controll/main';
import serve from 'koa-static';
import path from 'path'

const _router = new router();

const main = new MainControll();

_router.get('/job/instance/list', main.instanceList);
_router.get('/job/list', main.jobList);
_router.get('/job/count', main.count);
_router.get('/job/log', main.jobLogList);
_router.delete('/job', main.delete);
_router.put('/job', main.retry);
_router.post('/job', main.addJob);

function bullUi() {
   return serve(path.join(__dirname, 'dashboard/'));
}
export { _router, bullUi }



