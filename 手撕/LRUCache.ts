/*
LRU 缓存：当长度达到上限时，淘汰最近最久未使用的元素，且保证时间复杂度从始至终都是O(1)
数据结构：
    - Map<key, ListNode> 存储key和链表节点的映射，方便在O(1)时间内迅速找到对应的节点进行操作
    - ListNode<key, value, prev, next> 存储节点在Map中对应的key，便于反向传递给Map更新内容，以及这个缓存自身的value、前节点perv、后节点next
为什么不单用Map / 双向ListNode（Map和双向ListNode的优劣）：
    - Map 的优点是增删改查都是O(1)，可以快速定位到对应的节点进行操作，但是无法维护元素间的顺序，没有“头”和“尾”的概念
    - 双向 ListNode 的优点是天然有序，但缺点也很明显——无法快速寻找对应的节点，最快也是O(N)
    - 因此，我们需要结合Map和双向ListNode的优点去补充对方的缺点，使用Map存储键值对关系以根据key快速查找节点，并用双向ListNode维护LRU的顺序关系以及低成本的进行头尾变动操作
实现原理：
    - get或set一个元素时，先完成对应操作，然后再将这个元素在链表中的位置移动到头部
    - 链表超容时，自动淘汰最后一个元素，这个元素就是最近最久未使用的元素，因为它是最近最久未发生任何get和set操作的元素
*/
class ListNode {
    key: number;
    value: number;
    prev: ListNode | null;
    next: ListNode | null;

    constructor(key: number = 0, value: number = 0) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    private capacity: number; // 最大容量
    private cache: Map<number, ListNode>; // Map键值对缓存
    private head: ListNode; // 头部哑节点，用于快速定位和操作头节点
    private tail: ListNode; // 尾部哑节点，用于快速定位和操作尾节点

    constructor(capacity: number) {
        // 初始化LRU缓存结构
        this.capacity = capacity;
        this.cache = new Map();

        // 使用虚拟头尾节点互相指向对方简化边界处理
        this.head = new ListNode();
        this.tail = new ListNode();
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    // 删除指定节点
    // 原理：让这个节点的头尾节点的next和prev指向直接跨过当前节点，让这个节点与头尾的关系断裂，自动被挤出链表
    private removeNode(node: ListNode): void {
        const prevNode = node.prev;
        const nextNode = node.next;

        // 前一个节点的next指向直接指到被删除节点的next节点
        prevNode!.next = nextNode;

        // 后一个节点的prev指向直接指到被删除节点的prev节点
        nextNode!.prev = prevNode;
    }

    // 将某个节点添加到链表头部
    // 原理：先将这个节点的prev和next指向链表的头部哑节点和原来的第一个节点（dummyNode.next），再分别更新头部哑节点的next指向和原来第一个节点的prev指向，将新节点插进去
    private addToHead(node: ListNode): void {
        // 先更新新节点自己的指向
        node.prev = this.head;
        node.next = this.head.next;

        // 再更新头部哑节点和原来第一个节点的指向
        this.head.next!.prev = node;
        this.head.next = node;
    }

    // 将某个节点移动到链表头部，更新使用频率
    // 原理：先删除这个节点，再将它添加到链表头部
    private moveToHead(node: ListNode): void {
        this.removeNode(node);
        this.addToHead(node);
    }

    // 删除链表尾部节点，维护最大容量
    // 原理：获取尾部哑节点的prev节点，并使用removeNode删除它
    private removeTail(): ListNode {
        const node = this.tail.prev!;
        this.removeNode(node);
        return node;
    }

    // getter方法，用于获取指定的缓存内容，并更新使用频率，时间复杂度为O(1)
    // 原理：先通过key在Map中获取对应node，再将node moveToHead，最后返回node.value
    get(key: number): number {
        // 边界处理
        if (!this.cache.has(key)) {
            return -1;
        }
        // 获取node => O(1)
        const node = this.cache.get(key)!;

        // 移动到头部 => O(1) + O(1) = O(1)
        this.moveToHead(node);

        // 返回内容
        return node.value;
    }

    // setter方法，用于设置和更新缓存及其使用频率，时间复杂度为O(1)
    // 原理：
    //  - 如果缓存存在，就更新value及其使用频率（moveToHead）
    //  - 如果不存在，就先创建新的ListNode节点包裹key和value，然后分别注册Map和ListNode（addToHead）
    //  - 最后检查缓存容量，如果超容就使用removeTail和Map.delete删掉缓存的最后一项
    set(key: number, value: number): void {
        // 判断是否已经有了这个缓存
        if (this.cache.has(key)) {
            // 如果有，就获取这个节点 => O(1)
            const node = this.cache.get(key)!;

            // 更新节点value => O(1)
            node.value = value;

            // 将它移动到头部，更新使用频率 => O(1) + O(1) = O(1)
            this.moveToHead(node);
        } else {
            // 如果没有，就创建新的ListNode节点 => O(1)
            const newNode = new ListNode(key, value);

            // 注册Map的键值对 => O(1)
            this.cache.set(key, newNode);

            // 将新节点加到头部 => O(1)
            this.addToHead(newNode);

            // 判断是否超容
            if (this.cache.size > this.capacity) {
                // 如果已经超容，就删除最后一个节点 => O(1)
                const removed = this.removeTail();

                // 删除Map中的映射记录 => O(1)
                this.cache.delete(removed.key);
            }
        }
    }

    getAll(): number[] {
        const result: number[] = [];
        let curr = this.tail.prev;
        while (curr?.prev) {
            result.push(curr.value);
            curr = curr.prev;
        }
        return result;
    }
}

const lru = new LRUCache(5);
lru.set(1, 111);
lru.set(2, 222);
lru.set(3, 333);
lru.set(4, 444);
lru.get(1);
lru.set(5, 555);
lru.set(6, 666);
console.log(lru.getAll()); // [ 333, 444, 111, 555, 666 ]
