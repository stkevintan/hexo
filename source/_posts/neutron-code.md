---
title: neutron源码分析
date: 2016-10-28 14:52:02
tags: [openstack,neutron]
---

## WSGI
WSGI 是一个连接服务端和应用端的接口。WSGI把Web组件分为三部分：
- WSGI Server
- WSGI Middleware
- WSGI Application

An Application must return an iterable object.
```python
def application(environ,start_response):
   start_response('200 Ok',[('Content-Type','text/plain')])
   yield 'Hello World\n'
```
- `environ`:一个dict，包括CGI中定义的环境变量以及7个WSGI所定义的环境变量：wsgi.version,wsgi_input...
- `start_response`: 回调函数，要返回一个write(data)对象，用作兼容现有的特殊框架，一般返回None
<!--more-->
### Paste.Deploy
Paste Deploy通过api-paste.ini配置
Paste配置文件分为多个section，每个section以`type`:`name`的格式命名。
（书上P99）
### WebOb
对WSGI的封装，包含：
- `webob.Request` 对WSGI的environ的封装
- `webob.Response` 对WSGI响应的封装 
- `webob.exc` 对HTTP错误代码的封装

Webob提供了`webob.dec.wsgify`的decorator，可以快速开发application
```python
# 继承自webob.Request
class MyRequest(webob.Request): 
    @property
    def is_local(self):
        return self.remote_addr == '127.0.0.1'


@wsgify(RequestClass=MyRequest) 
def myfunc(req):
    if req.is_local:
        return Response('hi!')
    else:
        raise webob.exc.HTTPForbidden
```
## Eventlet
Openstack的协程模块
### 协程
与线程类似，拥有独立的栈和局部变量，但是无法同时执行，(Compare To: Javascript callback)
### GreenThread
```python
import eventlet
def my_func(param):
    # do something in coroutine
    return param
gt = eventlet.spawn(my_func,param)
result = gt.wait()
```
`eventlet.spawn`只是创建一个协程并不立即执行，直到主线程运行到`gt.wait()`时才开始进入调度序列。
### Monkey Path
实现协程需要使用Patch的方式对Python的网络相关的标准库进行改写，这个patch就叫`monkey_patch`。
Monkey Patch是大部分使用Eventlet函数库之前需要进行的初始化工作
```python
# ceilometer/cmd/__init__.py
import eventlet
# patch socket,select,thread三个模块
eventlet.monkey_patch(socket=True,select=True,thread=True)
```
## Oslo
Openstack 通用库
### Cliff
构建命令行程序
DEMO: <https://github.com/openstack/cliff/tree/master/demoapp>

### oslo.config
解析命令行和配置文件中的配置选项（书上P111）
```python
from oslo.config import cfg
conf(sys.argv[1:],project=`xyz`) # 初始化，使得oslo.config能够正常解析配置文件和命令行选项
rabbit_group = cfg.OptGroup(name='rabbit',
                            title='RabbitMQ options')

rabbit_host_opt = cfg.StrOpt('host',
                             default='localhost',
                             help='IP/hostname to listen on.'),
rabbit_port_opt = cfg.PortOpt('port',
                              default=5672,
                              help='Port number to listen on.')

def register_rabbit_opts(conf):
    conf.register_group(rabbit_group)
    # options can be registered under a group in either of these ways:
    conf.register_opt(rabbit_host_opt, group=rabbit_group)
    conf.register_opt(rabbit_port_opt, group='rabbit')
```
如果没有指定group，则选项默认放在[DEFAULT]组下
```ini
# glance-api.conf:
  [DEFAULT]
  bind_port = 9292
  # ...

  [rabbit]
  host = localhost
  port = 5672
  use_ssl = False
  userid = guest
  password = guest
  virtual_host = /
```
从命令行中设置conf，需要使用使用‘-’连接groupname和optionname
```shell
--rabbit-host localhost --rabbit-port 9999
```
### oslo.db
SQLAlchemy数据库模型的抽象
### oslo.i18n
是对Python gettext的封装，主要用于字符串翻译和国际化
### oslo.messaging
Openstack各项目使用RPC和事件通知的统一的接口。
- Transport,传输层，主要实现RPC底层的通信
- Target，封装了指定某一消息最终目的地的所有信息