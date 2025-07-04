---
title: Golang面试题详解（九）：内存模型、深浅拷贝与并发安全
tags:
  - Golang
  - Go面试题
  - 内存模型
  - mheap
  - mcache
  - mcentral
  - 深拷贝
  - 浅拷贝
  - Slice
  - Map
  - Channel
  - 并发安全
  - 线程安全
  - make
  - new
categories:
  - Golang
  - 面试题
  - 内存管理
  - 并发编程
toc: true
toc_number: true
abbrlink: 19444
date: 2023-07-04 21:28:02
updated:
keywords: Go, Golang, 内存模型, 内存分配, mheap, mcache, 深拷贝, 浅拷贝, copy, append, Slice, Map, Channel, 并发安全, 线程安全, make, new, Go面试题
description: 本文为 Golang 面试题系列第九篇，深度拆解了 Go 语言的内存模型，包括 Span、mcache、mcentral、mheap 的三级管理结构和对象分配流程。同时详细探讨了深拷贝与浅拷贝的区别、实现方式，并辨析了 Slice、Map、Channel 的并发安全性问题。
top_img:
comments:
cover:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
---

# Golang题库（九）

## 怎么用go实现一个栈

```go
//一个队列
type MyStack struct {
    queue []int
}

func Constructor() MyStack {
    return MyStack{
        queue: make([]int, 0), 
    }
}

func (this *MyStack) Push(x int)  {
    this.queue = append(this.queue, x)
}

func (this *MyStack) Pop() int {//出队操作
    n := len(this.queue)-1 
    for n!=0{ ////除了最后一个，其余的都重新添加到队列里
        val := this.queue[0]
        this.queue = this.queue[1:]
        this.queue = append(this.queue, val)
        n--
    }//新入队元素x到了最前面，出队时直接出-》后入先出
    val := this.queue[0]
    this.queue = this.queue[1:]
    return val
}

func (this *MyStack) Top() int {
    val := this.Pop()
    this.queue = append(this.queue, val)
    return val
}

func (this *MyStack) Empty() bool {
    if len(this.queue)==0{
        return true
    }
    return false
}
```

## 问了一些Golang的基本知识，如slice用copy和左值进行初始化的区别

1. `copy(slice2, slice1)`实现的是**深拷贝**。拷贝的是**数据本身**，创造一个新对象，新创建的对象与原对象不共享内存，新创建的对象在内存中开辟一个新的内存地址，新对象值修改时不会影响原对象值。
   同样的还有：遍历slice进行append赋值
2. 如`slice2 := slice1`实现的是浅拷贝。**拷贝的是数据地址**，只复制指向的对象的指针，此时新对象和老对象指向的内存地址是一样的，新对象值修改时老对象也会变化。默认赋值操作就是浅拷贝。

## channel是否线程安全等

- channel为什么设计成线程安全?
  不同协程通过channel进行通信，本身的使用场景就是多线程，为了保证数据的一致性，必须实现线程安全。
- channel如何实现线程安全的?
  channel的底层实现中， hchan结构体中采用Mutex锁来保证数据读写安全。在对循环数组buf中的数据进行入队和出队操作时，必须先获取互斥锁，才能操作channel数据。

## go的map是线程安全的吗？

**不是**

`sync.map `才是线程安全的。

## Go语言Slice是否线程安全

**不是**

Go语言实现线程安全常用的几种方式:

1. 互斥锁；
2. 读写锁；
3. 原子操作；
4. sync.once；
5. sync.atomic；
6. channel

slice底层结构并没有使用加锁等方式，不支持并发读写，所以并不是线程安全的，使用多个goroutine对类型为slice的变量进行操作，每次输出的值大概率都不会一样，与预期值不一致; slice在并发执行中不会报错，但是数据会丢失。

## make可以初始化哪些结构

- slice
- map
- channel

## new和make对比

- make 只能用来分配及初始化类型为 slice、map、chan 的数据。new 可以分配任意类型的数据；
- new 分配返回的是指针，即类型 *Type。make 返回引用，即 Type；
- new 分配的空间被清零。make 分配空间后，会进行初始化；
- make 函数只用于 map，slice 和 channel，并且不返回指针

## 内存模型

```
Go语言运行时依靠细微的对象切割、极致的多级缓存、精准的位图管理实现了对内存的精细化管理。
```

 将对象分为微小对象、小对象、大对象，使用三级管理结构mcache、mcentral、mheap用于管理、缓存加速span对象的访问和分配，使用精准的位图管理已分配的和未分配的对象及对象的大小。
​ Go语言运行时依靠细微的对象切割、极致的多级缓存、精准的位图管理实现了对内存的精细化管理以及快速的内存访问，同时减少了内存的碎片。

**Span**

```
Go 将内存分成了67个级别的scan，特殊的0级特殊大对象大小是不固定的。
```

当具体的对象需要分配内存时，并不是直接分配span，而是分配不同级别的span中的元素。因此span的级别不是以每个span的大小为依据，而是以span中元素的大小为依据的。

| Span等级 | 元素大小(字节) | Span大小(字节) | 元素个数 |
| -------- | -------------- | -------------- | -------- |
| 1        | 8              | 8192           | 1024     |
| 2        | 16             | 8192           | 512      |
| 3        | 32             | 8192           | 256      |
| 4        | 48             | 8192           | 170      |
| 65       | 64             | 8192           | 128      |
| …        | …              | …              | …        |
| 65       | 28672          | 57344          | 2        |
| 66       | 32768          | 32768          | 1        |

第1级span拥有的元素个数为8192/8=1024。每个span的大小和span中元素的个数都不是固定的，例如第65级span的大小为57344字节，每个元素的大小为28672字节，元素个数为2。span的大小虽然不固定，但其是8KB或更大的连续内存区域。
每个具体的对象在分配时都需要对齐到指定的大小，假如我们分配17字节的对象，会对应分配到比17字节大并最接近它的元素级别，即第3级，这导致最终分配了32字节。因此，这种分配方式会不可避免地带来内存的浪费。

**三级对象管理**

为了方便对Span进行管理，加速Span对象访问、分配。分别为**mcache、mcentral、mheap。**
TCMalloc内存分配算法的思想:
每个逻辑处理器P都存储了一个本地span缓存，称作mcache。如果协程需要内存可以直接从mcache中获取，由于在同一时间只有一个协程运行在逻辑处理器P上，所以中间不需要加锁。mcache包含所有大小规格的mspan，但是每种规格大小只包含一个。除class0外，mcache的span都来自mcentral。

mcentral 所有逻辑处理器P共享的。

- 对象收集所有给定规格大小的span。每个mcentral都包含**两个mspan的链表：empty mspanList表示没有空闲对象或span已经被mcache缓存的span链表，nonempty mspanList表示有空闲对象的span链表。**(为了的分配Mspan到Mcache中)

  mheap 每个级别的span都会有一个mcentral用于管理span链表（0级除外），其实 都是一个数组，由Mheap管理
  作用：
  不只是管理central，大对象也会直接通过mheap进行分配。

- mheap实现了对虚拟内存线性地址空间的精准管理，建立了span与具体线性地址空间的联系，保存了分配的位图信息，是管理内存的最核心单元。堆区的内存被分成了HeapArea大小进行管理。对Heap进行的操作必须全局加锁，而mcache、mcentral可以被看作某种形式的缓存。

（三级缓存对象图）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image-20220401203626614.png)

（mheap管理虚拟内存线性地址空间）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image.png)

**四级内存块管理**

Go 根据对象大小，将堆内存分成了 **HeapArea->chunk->span->page** 4种内存块进行管理。不同的内存块用于不同的场景，便于高效地对内存进行管理。

- HeapArea 内存块最大，其大小与平台相关，在UNIX 64位操作系统中占据64MB。
- chunk占据了512KB
- span根据级别大小的不同而不同，但必须是page的倍数
- 而1个page占据8KB

（内存块管理结构）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image%20(1).png)

**对象分配**

```
在运行时分配对象的逻辑主要位于mallocgc函数中，这个名字很有意思，malloc代表分配，gc代表垃圾回收（GC），此函数除了分配内存还会为垃圾回收做一些位图标记工作。
内存分配时，将对象按照大小不同划分为微小（tiny）对象、小对象、大对象。微小对象的分配流程最长，逻辑链路最复杂
```

**微小对象**

```
小于16字节的都被划分成了微小对象，微小对象主要处理极小的字符串和独立的转义变量。
```

微小对象会被放入class为2的span中，首先对微小对象按照2、4、8的规则进行字节对齐。例如，字节为1的元素会被分配2字节，字节为7的元素会被分配8字节。

微小对象分配时，查看之前分配的元素中是否有空余的空间，如果当前对象要分配8字节，并且正在分配的元素可以容纳8字节，则返回tiny+offset的地址，分配完成后offset的位置也需要相应增加，为下一次分配做准备。

如果当前要分配的元素空间不够，将尝试从mcache中查找span中下一个可用的元素。因此，tiny分配的第一步是尝试利用分配过的前一个元素的空间，达到节约内存的目的。

（微小对象分配）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image-c85dfbcf-c2b4-4f74-a2ad-a88d7e222e9a709382768807207797.jpg)

tiny offset代表当前已分配内存的偏移量）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image%20(2).png)

**Mcache 缓存位图**

```
在查找空闲元素空间时，首先需要从mcache中找到对应级别的mspan，mspan中拥有allocCache字段，其作为一个位图，用于标记span中的元素是否被分配。由于allocCache元素为uint64，因此其最多一次缓存64字节。
```

有时候，span中元素的个数大于64，因此需要专门有一个字段freeindex标识当前span中的元素被分配到了哪里。span中小于freeindex序号的元素都已经被分配了，将从freeindex开始继续分配。
因此，只要从allocCache开始找到哪一位为0即可。假如X位为0，那么X+freeindex为当前span中可用的元素序号。当allocCache中的bit位全部被标记为1后，需要移动freeindex，并更新allocCache，一直到span中元素的末尾为止。

（allocCache位图标记span中的元素是否被分配）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image%20(3).png)

（freeindex之前的元素都已被分配）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image%20(4).png)

**mcentral 遍历 span**

```
如果当前的span中没有可以使用的元素，这时就需要从mcentral中加锁查找。mcentral中有两种类型的span链表，分别是有空闲元素的nonempty链表和没有空闲元素的empty链表。在mcentral查找时，会分别遍历这两个链表，查找是否有可用的span。
```

**既然是没有空闲元素的empty链表，为什么还需要遍历呢？**

```
这是由于可能有些span虽然被垃圾回收器标记为空闲了，但是还没有来得及清
```

**Mheap 缓存查找**

```
如果在mcentral中找不到可以使用的span，就需要在mheap中查找。Go 1.12 采用treap结构进行内存管理，treap是一种引入了随机数的二叉搜索树，其实现简单，引入的随机数及必要时的旋转保证了比较好的平衡性。这种方式有扩展性的问题，由于这棵树是mheap管理的，所以在操作它时需要维持一个lock。这在密集的对象分配及逻辑处理器P过多时，会导致更长的等待时间。使用bitmap来管理内存页，我们会看到每个逻辑处理器P中都维护了一份page cache，这就是现在Go实现的方式。
  mheap会首先查找每个逻辑处理器P中pageCache字段的cache。cache也是一个位图，每一位都代表了一个page（8 KB）。由于cache为uint64，因此一共可以提供64×8=512KB的连续虚拟内存。在cache中，1代表未分配的内存，0代表已分配的内存。base代表该虚拟内存的基地址。当需要分配的内存小于512/4=128KB时，需要首先从cache中分配。在分配 n 个page 需要查找 cache中是否有连续的n为1的单位，如果存在，在缓存中找到了合适的内存，用于构建Span。
```

**mheap基数树查找**

```
如果要分配的page过大或者在逻辑处理器P的cache中没有找到可用的page，就需要对mheap加锁，并在整个mheap管理的虚拟地址空间的位图中查找是否有可用的page，这涉及Go语言对线性地址空间的位图管理。
```

管理线性地址空间的位图结构叫作基数树（radix tree），结构和一般的基数树结构不太一样，会有这个名字很大一部分是由于父节点包含了子节点的若干信息。

（内存管理基数树结构）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image%20(5).png)

该树中的每个节点都对应一个pallocSum，最底层的叶子节点对应的pallocSum包含一个chunk的信息（512×8KB），除叶子节点外的节点都包含连续8个子节点的内存信息。例如，倒数第2层的节点包含连续8个叶子节点（即8×chunk）的内存信息。因此，越上层的节点对应的内存越多。
pallocSum是一个简单的uint64，分为开头（start）、中间（max）、末尾（end）3部分，pallocSum的开头与末尾部分各占21bit，中间部分占22bit，它们分别包含了这个区域中连续空闲内存页的信息，包括开头有多少连续内存页，最多有多少连续内存页，末尾有多少连续内存页。对于最顶层的节点，由于其max位为22bit，因此一棵完整的基数树最多代表2的21次方 pages=16GB内存。
不需要每一次查找都从根节点开始。在Go中，存储了一个特别的字段**searchAddr，用于搜索可用内存的**。利用searchAddr可以加速内存查找。searchAddr有一个重要的设定**是它前面的地址一定是已经分配过的**，因此在查找时，只需要向searchAddr地址的后方查找即可跳过已经查找的节点，减少查找的时间。

（利用searchAddr加速内存查找）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/Screenshot_20220403-151709.png)

在第1次查找时，会从当前searchAddr的chunk块中查找是否有对应大小的连续空间，这种优化主要针对比较小的内存（至少小于512KB）分配。Go对内存有非常精细的管理，chunk块的每个page（8 KB)都有位图表明其是否已经被分配。
每个chunk都有一个pallocData结构，其中pallocBits管理其分配的位图。pallocBits是uint64，有8字节，由于其每一位对应一个page，因此pallocBits一共对应64×8=512KB，恰好是一个chunk块的大小。位图的对应方式和之前是一样的。
而所有的chunk pallocData都在pageAlloc结构中进行管理。
当内存分配过大或者当前chunk块没有连续的npages空间时，需要到基数树中从上到下进行查找。基数树有一个特性——要分配的内存越大，它能够越快地查找到当前的基数树中是否有连续的满足需求的空间。

在查找基数树的过程中，需要从上到下、从左到右地查找每个节点是否符合要求。先计算pallocSum的开头有多少连续的内存空间，如果大于或等于npages，则说明找到了可用的空间和地址。如果小于npages，则会计算pallocSum字段的max，即中间有多少连续的内存空间。如果max大于或等于npages，那么需要继续向基数树当前节点对应的下一级查找，原因在于，max大于npages，表明当前一定有连续的空间大于或等于npages，但是并不知道具体在哪一个位置，必须查找下一级才能找到可用的地址。如果max也不满足，那么是不是就不满足了呢？不一定，如图18-13所示，有可能两个节点可以合并起来组成一个更大的连续空间。因此还需要将当前pallocSum计算的end与后一个节点的start加起来查看是否能够组合成大于npages的连续空间。

（更大的可用内存可能跨越了多个pallocSum）

![img](https://image-1302243118.cos.ap-beijing.myqcloud.com/img/image%20(6).png)

**每一次从基数树中查找到内存，或者事后从操作系统分配到内存时，都需要更新基数树中每个节点的pallocSum。**

**操作系统内存申请**

当在基数树中查找不到可用的连续内存时，需要从操作系统中获取内存。从操作系统获取内存的代码是平台独立的，（例如在UNIX操作系统中，最终使用了mmap系统调用向操作系统申请内存。）

Go语言规定，**每一次向操作系统申请的内存大小必须为heapArena的倍数**。heapArena是和平台有关的内存大小，在64位UNIX操作系统中，其大小为64MB。这意味着即便需要的内存很小，最终也至少要向操作系统申请64MB内存。多申请的内存可以用于下次分配。
Go语言中对于heapArena有精准的管理，精准到每个指针大小的内存信息，每个page对应的mspan信息都有记录。

**小对象分配**

当对象不属于微小对象时，在内存分配时会继续判断其是否为小对象，小对象指小于32KB的对象。Go会计算小对象对应哪一个等级的span，并在指定等级的span中查找。
此后和微小对象的分配一样，小对象分配经历mcache→mcentral→mheap位图查找→mheap基数树查找→操作系统分配的过程。

**大对象分配**

大对象指大于32KB的对象，内存分配时不与mcache和mcentral沟通，直接通过mheap进行分配。大对象分配经历mheap基数树查找→操作系统分配的过程。每个大对象都是一个特殊的span，其class为0。

## goroutine 为什么轻量

- 从资源消耗方面来看，它只需要一个2Kb的内存栈就可以运行；
- 从运行时来看，它的运行成本很低，将一个goroutine切换到另一个goroutine并不需要很多操作

## go 深拷贝发生在什么情况下？切片的深拷贝是怎么做的？

**深拷贝，浅拷贝概念**

1. 深拷贝（Deep Copy）：

拷贝的是数据本身，创造一个样的新对象，新创建的对象与原对象不共享内存，新创建的对象在内存中开辟一个新的内存地址，新对象值修改时不会影响原对象值。既然内存地址不同，释放内存地址时，可分别释放。

1. 浅拷贝（Shallow Copy）：

拷贝的是数据地址，只复制指向的对象的指针，此时新对象和老对象指向的内存地址是一样的，新对象值修改时老对象也会变化。释放内存地址时，同时释放内存地址。[参考来源](https://blog.csdn.net/guichenglin/article/details/105601886)
在go语言中值类型赋值都是深拷贝，引用类型一般都是浅拷贝：

- 值类型的数据，默认全部都是深拷贝：Array、Int、String、Struct、Float，Bool
- 引用类型的数据，默认全部都是浅拷贝：Slice，Map

对于引用类型，想实现深拷贝，不能直接 := ，而是要先开辟地址空间（new） ，再进行赋值。

**怎么进行（切片的）深拷贝？**

可以使用 copy() 函数来进行深拷贝，copy 不会进行扩容，当要复制的 slice 比原 slice 要大的时候，只会移除多余的。

```
func main() {
    slice1 := []int{1, 2, 3, 4, 5}
    slice2 := []int{6, 7, 8}

    copy(slice2, slice1) // 复制slice1的前3个元素到slice2中
    fmt.Println(slice1, slice2)
    copy(slice1, slice2) // 复制slice2的3个元素到slice1的前3个位置
    fmt.Println(slice1, slice2)
}
```

使用 append() 函数来进行深拷贝，append 会进行扩容（这里涉及到的就是 [Slice 的扩容机制](https://www.yuque.com/xiaoshan_wgo/gonotes/gguirt) ）。

```
func main() {
    a := []int{1, 2, 3}
    b := make([]int, 0)
    b = append(b, a[:]...)
    fmt.Println(a, b)
    a[1] = 1000
    fmt.Println(a, b)
    fmt.Printf("%p,%p", a, b)
}
```

> Go 中切片扩容的策略：
>
> - 首先判断，如果新申请容量大于 2 倍的旧容量，最终容量就是新申请的容 量
> - 否则判断，如果旧切片的长度小于 1024，则最终容量就是旧容量的两倍
> - 否则判断，如果旧切片长度大于等于 1024，则最终容量从旧容量开始循环 增加原来的 1/4, 直到最终容量大于等于新申请的容量
> - 如果最终容量计算值溢出，则最终容量就是新申请容量
>
> **注意：如果 slice 在 append() 过程中没有发生扩容，那么修改就在原来的内存中，如果发生了扩容，就修改在新的内存中。**
