import CategorysStore from './CategorysStore';
import LocalProductsStore from './LocalProductsStore';
import PluginProjectsStore from './PluginProjectsStore';
import FaultCodeDetailsStore from './FaultCodeDetailsStore';

class Root {
    constructor() {
        this.categorys = new CategorysStore(this);
        this.localProducts = new LocalProductsStore(this, true);
        this.pluginProjects = new PluginProjectsStore(this);
        this.faultCodeDetails = new FaultCodeDetailsStore(this);
    }
}

const r = new Root();

export default r;
