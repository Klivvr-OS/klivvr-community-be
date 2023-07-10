import { HelloRepo } from "./Hello/repos/helloRepo";
import { HelloService } from "./Hello/services/helloService";

const helloRepo = new HelloRepo();
const helloService = new HelloService(helloRepo);

export { helloService };
