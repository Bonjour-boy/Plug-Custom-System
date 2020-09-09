const data = new Set();
/**
 * @description 判断是否在 gitting
 */
class PluginProjectGitStatus {
    /**
     * 新增
     */
    static add(id) {
        id !== undefined && data.add(id);
    }

    /**
     * 查找
     */
    static has(id) {
        return id !== undefined && data.has(id);
    }

    /**
     * 删除
     */
    static delete(id) {
        id !== undefined && data.delete(id);
    }
}
module.exports = PluginProjectGitStatus;
