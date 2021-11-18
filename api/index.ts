
import { _router, bullUi } from "./router";
import { QueueService } from "./services/queue";

function bullApi() {
    new QueueService().init();
    return _router.routes();
}
export { bullApi, bullUi }
