---
title: Python使用gRPC协议通信
tags:
  - Python
  - gRPC
  - Protobuf
  - 微服务
  - RPC
categories:
  - Python
  - 网络编程
toc: true
toc_number: true
abbrlink: 51030
date: 2022-11-25 08:45:08
updated: 2025-12-08
keywords: Python, gRPC, Protobuf, RPC, 微服务, 异步编程, 网络通信
description: 一篇关于在Python中使用gRPC协议进行通信的详细教程。内容涵盖gRPC的四种服务模式、Protobuf文件格式定义，并提供了一元模式下同步与异步的完整服务端和客户端实现代码，是学习gRPC的实用指南。
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

## 简单介绍

`gRPC`是谷歌开源的通信协议，支持多开发语言，可以实现跨语言调用，函数调用的形式非常直观，需要编写`Protobuf `文件，生成对应开发语言的模块文件。`Protobuf `数据序列化传输是二进制协议传输，相对`json、xml`等格式要更加轻量。是目前<font title="blue">微服务</font>最流行使用的协议。

[gRPC官网](https://grpc.io/)

## 安装

```shell
pip install grpcio #安装grpc
pip install grpcio-tools #安装grpc tools
```

## gRPC模式

`gRPC`提供了四种服务模式：

1. 一元 `RPC`，其中客户端向服务端发送单个请求并获得 单响应返回，就像正常的函数调用一样。

   ```protobuf
   rpc SayHello(HelloRequest) returns (HelloResponse);
   ```

2. 服务端流式 `RPC`，其中客户端向服务端发送请求，并获得一个流来读取一系列消息。客户端从返回的流中读取，直到没有更多消息为止。`gRPC` 保证在单个 `RPC` 调用中进行消息排序。

   ```protobuf
   rpc LotsOfReplies(HelloRequest) returns (stream HelloResponse);
   ```

3. 客户端流式 `RPC`，其中客户端写入一系列消息并将其发送到服务端，同样使用提供的流。一旦客户端完成了消息的写入，它将等待服务端读取它们并返回其响应。同样，`gRPC` 保证单个 `RPC` 调用中的消息顺序。

   ```protobuf
   rpc LotsOfGreetings(stream HelloRequest) returns (HelloResponse);
   ```

4. 双向流式 `RPC`，其中双方使用读写流发送一系列消息。这两个流是独立运行的，因此客户端和服务端可以按照他们喜欢的顺序读写: 例如，服务端可以在写响应之前等待接收所有客户端消息，或者它可以交替读消息然后写消息，或者其他读写组合。保留了每个流中消息的顺序

   ```protobuf
   rpc BidiHello(stream HelloRequest) returns (stream HelloResponse);
   ```

## Protobuf文件格式

| 常见关键字 | 解释                             |
| ---------- | -------------------------------- |
| syntax     | 指定protobuf版本                 |
| package    | 包名，可以不填                   |
| import     | 导入一些插件，一般go用的比较多   |
| message    | 定义传输的数据结构               |
| service    | 定义服务                         |
| rpc        | 定义服务中的方法                 |
| stream     | 定义方法中数据的传输方式为流传输 |

| 常见数据类型 | 解释                                                         |
| ------------ | ------------------------------------------------------------ |
| string       | 默认值为空白字符， 字符串必须始终包含UTF-8编码或7位ASCII文本。 |
| int32/int64  | 对应长短整型，默认值是0                                      |
| bool         | bool类型                                                     |
| float        | 浮点型                                                       |
| repeated     | 对应于python列表类型，但不完全一样，数据类型只能为一种，不能动态变换 |
| map          | 对应于python字典类型，但不完全一样，数据类型只能为一种，不能动态变换 |
| bytes        | 比特类型，默认值是空白字节，可能包含任何字节序列             |

## 一元模式

### 编写Protobuf文件

首先定义`Protobuf`文件，通常以`.proto`文件名结尾。如下`example.proto`

```protobuf
syntax = "proto3";   // protobuf版本

package example;   // 此文件的标识符,不添加也可以,以防止协议消息类型之间的名称冲突

// 定义请求消息结构
message request {
	int32 age = 1;
	string name = 2;
}

// 定义响应消息结构，字段编号不能相同，无特别意义
message response {
	string message = 1;
}

//定义服务，一元模式协议，类似普通的HTTP请求，客户端发起请求，服务端返回结果，即完成一次通信
service UserInfo {
	rpc Info (request) returns (response) {}
}
```

编写完`Protobuf`文件，需要使用`grpc-tools`生成对应的`python`代码，生成的代码供客户端和服务端调用。

```sh
python -m grpc_tools.protoc -I./protos/ --python_out=. --pyi_out=. --grpc_python_out=. example.proto  

python_out：指定xxx_pb2.py的输出路径，编译生成处理protobuf相关的代码路径。传入.，则生成到当前目录。
grpc_python_out：指定xxx_pb2_grpc.py的输出路径，编译生成处理grpc相关的代码路径，传入.，则生成到当前目录。
grpc_tools.protoc：工具包，由安装的grpc-tools提供。
-I：指定Protobuf协议文件的查找目录。
```

### 服务端

`gRPC`常用于异步编程中，这里介绍异步和同步版本的调用分别如何使用。缩进代码预留，这里去除掉了导入`Protobuf`文件生成的模块。

1. 异步

   ```python
   class Greeter(example_pb2_grpc.UserInfoServicer):
   
       async def Info(self, request, context):
           return example_pb2.Info(message='Hello, %s!' % request.name)
   
   async def serve(port) -> None:
       # port = '50051'
       server = grpc.aio.server()
       example_pb2_grpc.add_UserInfoServicer_to_server(UserInfo(), server)
       listen_addr = '[::]:' + str(port)
       server.add_insecure_port(listen_addr)
       logging.info("Starting server on %s", listen_addr)
       await server.start()
       await server.wait_for_termination()
       
   if __name__ == '__main__':
       logging.basicConfig(level=logging.INFO)
       asyncio.run(serve(50051))
   ```

   

2. 同步

   ```python
   class Greeter(example_pb2_grpc.UserInfoServicer):
   
       def Info(self, request, context):
           return example_pb2.Info(message='Hello, %s!' % request.name)
   
   
   def serve():
       port = '50051'
       server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
       example_pb2_grpc.add_UserInfoServicer_to_server(UserInfo(), server)
       server.add_insecure_port('[::]:' + port)
       server.start()
       print("Server started, listening on " + port)
       server.wait_for_termination()
   
   
   if __name__ == '__main__':
       logging.basicConfig()
       serve()
   ```

### 客户端

1. 异步

   ```python
   async def run() -> None:
       async with grpc.aio.insecure_channel('localhost:50051') as channel:
           stub = example_pb2_grpc.UserInfoStub(channel)
           response: example_pb2.response = await stub.Info(example_pb2.request(
               age=18,
               name="daoji"
           ))
       print("Greeter client received: " + response.message)
       
   if __name__ == '__main__':
       logging.basicConfig()
       asyncio.run(run())
   ```

   

2. 同步

   ```python
   def run():
       # NOTE(gRPC Python Team): .close() is possible on a channel and should be
       # used in circumstances in which the with statement does not fit the needs
       # of the code.
       print("Will try to greet world ...")
       with grpc.insecure_channel('localhost:50051') as channel:
           stub = example_pb2_grpc.UserInfoStub(channel)
           response = stub.Info(example_pb2.request(name='you'))
       print("Greeter client received: " + response.message)
   
   
   if __name__ == '__main__':
       logging.basicConfig()
       run()
   ```

## 服务端流式

### Protobuf文件

```protobuf
// .proto
syntax = "proto3";
package example;

message request {
	string message = 1;
}

message response {
	string message = 1;
}
//定义服务，下面定义的这种为最简单的rpc服务，客户端发起请求，服务端返回结果,stream关键字用来定义流式传输
service StreamTest {
	rpc ClientStream (stream request) returns (response) {}
}
```

### 服务端

```python
class StreamTest(example_pb2_grpc.StreamTestServicer):

    async def ClientStream(self, request_iterator: AsyncIterable[example_pb2.request],
                           context: grpc.aio.ServicerContext) -> example_pb2.response:
        async for i in request_iterator:
            print(i.message)
            if i.message == 'close':
                return example_pb2.response(message='close!😢')

        return example_pb2.response(message='ok!🐧')


async def serve() -> None:
    port = '50051'
    server = grpc.aio.server()
    example_pb2_grpc.add_StreamTestServicer_to_server(StreamTest(), server)
    listen_addr = '[::]:' + str(port)
    server.add_insecure_port(listen_addr)
    logging.info("Starting server on %s", listen_addr)
    await server.start()
    await server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig()
    asyncio.run(serve())
```

### 客户端

```python
async def client_stram(stub: example_pb2_grpc.StreamTestStub) -> None:
    route_iterator = [example_pb2.request(message='close')]

    # gRPC AsyncIO client-streaming RPC API accepts both synchronous iterables
    # and async iterables.
    route_summary = await stub.ClientStream(route_iterator)


async def main() -> None:
    async with grpc.aio.insecure_channel('localhost:50051') as channel:
        stub = example_pb2_grpc.StreamTestStub(channel)
        print("-------------- RecordRoute --------------")
        await client_stram(stub)
        
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    asyncio.get_event_loop().run_until_complete(main())
```

## 客户端流式

## 双向流式
