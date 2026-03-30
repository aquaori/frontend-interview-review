/*
实现一个事件发布订阅系统（Event Emitter）
API设计：
    - 订阅事件（on）
    - 触发事件（emit）
    - 取消订阅（off）
    - 只触发一次（once）
边界处理：
    - 同一事件多个监听器
    - 参数传递问题
    - this 指向问题
    - 内存泄漏风险
数据结构：
    - 用Map存储事件：Map<eventName, Set<callback>>
    - 为什么用Set：自动去重，实现幂等，避免重复订阅
    - 为什么用Map：O(1)查找效率
*/
class EventEmitter {
    private events: Map<string, Set<Function>>

    constructor() {
        this.events = new Map();
    }

    // 订阅事件
    on(event: string, callback: Function) {
        if(!this.events.has(event)) {
            this.events.set(event, new Set);
        }
        this.events.get(event)!.add(callback);
        return this;
    }

    // 触发事件
    emit(event: string, ...args: any[]) {
        if(!this.events.has(event)) return;
        this.events.get(event)!.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`事件${event}的回调执行出错:`, error);
                // 不中断后续回调，也不重复抛错
            }
        })
    }

    // 取消订阅
    off(event: string, callback?: Function) {
        if(!this.events.has(event)) return;

        if(callback) {
            this.events.get(event)!.delete(callback);
            if(this.events.get(event)!.size === 0) {
                this.events.delete(event);
            }
        } else {
            this.events.delete(event);
        }
        return this;
    }

    // 只触发一次
    once(event: string, callback: Function) {
        const wrapper = (...args: any[]) => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`事件${event}的once回调执行出错:`, error);
            } finally {
                // 无论回调是否成功，都移除事件，保证once生效
                this.off(event, wrapper);
            }
        }
        this.on(event, wrapper);
    }
}

// 测试代码
const events = new EventEmitter();

// 只执行一次的定时器事件
events.once('timer', () => console.log('time out!'));
console.log('set timer event');

// 循环触发的interval事件
events.on('interval', (count:number) => console.log(`interval 第${count+1}次触发`));
console.log('set interval event');

// 5秒后触发timer事件
setTimeout(() => {
  events.emit('timer');
}, 5000);

// 修复死循环：在回调里判断次数，自动清除定时器
let count = 0;
const interval = setInterval(() => {
  events.emit('interval',count);
  count++;
  // 触发5次后自动清除定时器
  if (count >= 10) {
    clearInterval(interval);
    console.log('interval 已停止');
  }
}, 1000);